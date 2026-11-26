"""
ITR Filing Preparation & Package Generation API Routes
Governed by Rule 12 of the Income-tax Rules, 1962 and CBDT e-Filing Portal Specs
Produces structured schedule-mapped ITR packages, schema validation reports,
and downloadable JSON filing payloads with statutory demo disclaimers.
"""

from datetime import datetime, timezone
import json
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Query, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..db.session import get_db
from ..db.repository import TaxpayerRepository
from ..services.filing_preparation import (
    FilingPreparationService,
    FilingPreparationPackage,
    FilingValidationReport,
)
from ..services.case_manager import case_manager
from ..api.routes_calculate import _compute_and_persist_from_validated_db
from .auth_context import (
    ActorContext,
    require_authenticated_actor,
    assert_client_case_access,
)

router = APIRouter(prefix="/api/filing", tags=["ITR Filing Preparation & Packaging"])


@router.get("/client/{client_id}/package", response_model=FilingPreparationPackage)
def get_filing_preparation_package(
    client_id: str,
    case_id: Optional[str] = Query(None),
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """Generates structured schedule-mapped ITR filing package from validated & reconciled backend records."""
    client = case_manager.get_client_by_id(client_id)
    assert_client_case_access(
        actor,
        target_client_id=client.id if client else client_id,
        target_case_id=case_id,
        require_ca_role=False,
    )
    if not client:
        raise HTTPException(status_code=404, detail=f"Client {client_id} not found.")

    repo = TaxpayerRepository(db)
    ay = case_manager.get_client_assessment_year(client.pan, case_id).replace("AY ", "")
    occ = client.occupation_profile.value if getattr(client, "occupation_profile", None) else None

    # Load / compute tax comparison
    comp_obj = repo.get_tax_computation_by_client_id(client.id) or repo.get_tax_computation_by_pan(client.pan)
    details = json.loads(comp_obj.computation_json) if comp_obj and comp_obj.computation_json else {}
    if not comp_obj or not details.get("new_regime"):
        calc = _compute_and_persist_from_validated_db(
            db=db,
            actor=actor,
            client_id=client.id,
            client_pan=client.pan,
            client_name=client.name,
            case_id=case_id,
            assessment_year=ay,
            occupation_profile=occ,
        )
        tax_comp_dict = calc.model_dump()
        if comp_obj and comp_obj.is_ca_approved:
            tax_comp_dict["is_ca_approved"] = True
            tax_comp_dict["ca_approver"] = comp_obj.ca_approver or actor.actor_name
            tax_comp_dict["ca_approval_timestamp"] = comp_obj.approved_at.isoformat() if comp_obj.approved_at else None
            tax_comp_dict["verification_hash"] = comp_obj.ca_sign_off_hash
    else:
        gate = json.loads(comp_obj.validation_gate_json) if comp_obj.validation_gate_json else {}
        tax_comp_dict = {
            "is_ca_approved": comp_obj.is_ca_approved,
            "ca_approver": comp_obj.ca_approver,
            "ca_approval_timestamp": comp_obj.approved_at.isoformat() if comp_obj.approved_at else None,
            "verification_hash": comp_obj.ca_sign_off_hash,
            "recommended_regime": comp_obj.recommended_regime,
            "selected_itr_form": comp_obj.selected_itr_form or "ITR-1 (Sahaj)",
            "tds_credits": comp_obj.tds_credits,
            "new_regime": details.get("new_regime", {}),
            "old_regime": details.get("old_regime", {}),
            "income_summary": details.get("income_summary", {}),
            "deductions_summary": details.get("deductions_summary", {}),
            "validation_gate": gate,
        }

    # Load reconciled items
    recon_rows = repo.get_reconciliation_items_by_client_id(client.id, case_id=case_id)
    recon_dicts = [
        {
            "field_name": r.field_name,
            "resolved_value": r.resolved_value,
            "status": r.status,
            "match_status": r.match_status,
        }
        for r in recon_rows
    ]

    package = FilingPreparationService.generate_filing_package(
        client_dict=client.model_dump(),
        tax_comp_dict=tax_comp_dict,
        reconciled_rows=recon_dicts,
        assessment_year=ay,
    )

    # Persist filing package to DB
    repo.save_filing_package(
        pan=client.pan,
        filing_package_data=package.model_dump(),
        client_id=client.id,
    )

    return package


@router.post("/client/{client_id}/validate", response_model=FilingValidationReport)
def validate_filing_package_endpoint(
    client_id: str,
    case_id: Optional[str] = Query(None),
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """Executes validation rules on current filing package and returns error/warning summary."""
    pkg = get_filing_preparation_package(client_id, case_id=case_id, actor=actor, db=db)
    return pkg.validation_report


@router.get("/client/{client_id}/download-json")
def download_filing_package_json(
    client_id: str,
    case_id: Optional[str] = Query(None),
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """Serves the structured ITR filing JSON as a downloadable file with statutory demo header."""
    pkg = get_filing_preparation_package(client_id, case_id=case_id, actor=actor, db=db)
    content = json.dumps(pkg.itr_json_payload, indent=2)
    filename = f"{pkg.selected_itr_form.split(' ')[0]}_{pkg.client_pan}_AY{pkg.assessment_year}_FILING_PACK.json"

    repo = TaxpayerRepository(db)
    repo.add_audit_log(
        actor=f"{actor.actor_name} ({actor.role})",
        action="ITR_FILING_JSON_DOWNLOADED",
        details=f"Downloaded filing preparation JSON for {pkg.client_name} ({pkg.client_pan}). Form: {pkg.selected_itr_form}.",
        client_name=pkg.client_name,
        pan=pkg.client_pan,
        category="Deliverable Generation",
    )

    return Response(
        content=content,
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
