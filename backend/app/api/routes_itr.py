"""
Deterministic ITR Selection API Routes
Governed by Rule 12 of the Income-tax Rules, 1962 and CBDT AY 2025-26 Return Instructions
Zero-LLM statutory rule engine with CA confirmation & review flags.
"""

from datetime import datetime, timezone
import json
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..db.session import get_db
from ..db.repository import TaxpayerRepository
from ..engine.itr_selector import ITRSelectionEngine, ITRSelectionResult
from ..services.case_manager import case_manager
from ..services.document_validation import derive_validated_tax_inputs_from_db
from .auth_context import (
    ActorContext,
    require_authenticated_actor,
    assert_client_case_access,
)

router = APIRouter(prefix="/api/itr", tags=["Deterministic ITR Selection"])


class EvaluateITRRequest(BaseModel):
    case_id: Optional[str] = None
    entity_type: Optional[str] = None
    residential_status: Optional[str] = None
    income_overrides: Optional[Dict[str, Any]] = None
    disclosure_overrides: Optional[Dict[str, Any]] = None


class ConfirmITRRequest(BaseModel):
    case_id: Optional[str] = None
    confirmed_form: str
    ca_notes: str


def _build_evaluation_inputs(db: Session, client, case_id: Optional[str] = None):
    repo = TaxpayerRepository(db)
    db_recon_rows = repo.get_reconciliation_items_by_client_id(client.id, case_id=case_id)
    if not db_recon_rows:
        db_recon_rows = repo.get_reconciliation_items_by_pan(client.pan, case_id=case_id)

    ay = case_manager.get_client_assessment_year(client.pan, case_id).replace("AY ", "")
    occ = client.occupation_profile.value if getattr(client, "occupation_profile", None) else None

    derived = derive_validated_tax_inputs_from_db(
        db=db,
        client_id=client.id,
        client_pan=client.pan,
        case_id=case_id,
        assessment_year=ay,
        occupation_profile=occ,
        reconciled_rows=db_recon_rows,
    )

    inc = derived["income"]
    intake = getattr(client, "intake_discovery", {}) or {}
    disclosures = intake.get("specialDisclosures", {}) or {}

    incomes_dict = {
        "salary": inc.income_salaries,
        "house_property": inc.income_house_property,
        "house_property_count": 1 if inc.income_house_property != 0 else 0,
        "business_profession": inc.income_pgbp,
        "has_business_profession": inc.income_pgbp > 0 or inc.is_presumptive_44ada,
        "presumptive_election": "44ADA" if inc.is_presumptive_44ada else intake.get("businessProfession", {}).get("presumptiveElection"),
        "professional_receipts": inc.gross_professional_receipts,
        "capital_gains_stcg": inc.stcg_111a + inc.stcg_slab,
        "capital_gains_ltcg": inc.ltcg_112a + inc.ltcg_112,
        "capital_gains": inc.total_capital_gains,
        "has_capital_gains": inc.total_capital_gains > 0,
        "other_sources": inc.total_other_sources,
        "savings_interest": inc.savings_interest,
        "dividend_income": inc.dividend_income,
        "agricultural_income": float(intake.get("otherSources", {}).get("agriculturalIncome", 0.0) or 0.0),
    }

    disclosures_dict = {
        "is_director_in_company": disclosures.get("hasDirectorship") == "YES",
        "holds_unlisted_equity": disclosures.get("holdsUnlistedShares") == "YES",
        "has_foreign_assets_or_income": disclosures.get("hasForeignAssetsOrIncome") == "YES",
        "has_crypto_or_vda": disclosures.get("hasCryptoOrVDA") == "YES",
        "confirmed_no_directorship": disclosures.get("hasDirectorship") == "NO",
        "confirmed_no_unlisted_equity": disclosures.get("holdsUnlistedShares") == "NO",
        "confirmed_no_foreign_assets": disclosures.get("hasForeignAssetsOrIncome") == "NO",
    }

    entity_type = client.legal_type.value if getattr(client, "legal_type", None) else "INDIVIDUAL"
    residential_status = client.residential_status.value if getattr(client, "residential_status", None) else "RESIDENT"

    return entity_type, residential_status, incomes_dict, disclosures_dict, ay


@router.get("/client/{client_id}", response_model=ITRSelectionResult)
def get_client_itr_selection(
    client_id: str,
    case_id: Optional[str] = Query(None),
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """Evaluates and returns deterministic ITR selection and eligibility breakdown from validated DB data."""
    client = case_manager.get_client_by_id(client_id)
    assert_client_case_access(
        actor,
        target_client_id=client.id if client else client_id,
        target_case_id=case_id,
        require_ca_role=False,
    )
    if not client:
        raise HTTPException(status_code=404, detail=f"Client {client_id} not found.")

    entity_type, res_status, incomes_dict, disclosures_dict, ay = _build_evaluation_inputs(
        db, client, case_id
    )

    result = ITRSelectionEngine.evaluate(
        entity_type=entity_type,
        residential_status=res_status,
        incomes=incomes_dict,
        disclosures=disclosures_dict,
        assessment_year=ay,
    )

    # Check if CA has already confirmed or overridden form in DB
    repo = TaxpayerRepository(db)
    comp = repo.get_tax_computation_by_client_id(client.id) or repo.get_tax_computation_by_pan(client.pan)
    if comp and comp.itr_selection_json:
        try:
            persisted = json.loads(comp.itr_selection_json)
            if persisted.get("is_ca_confirmed"):
                result.is_ca_confirmed = True
                result.confirmed_by = persisted.get("confirmed_by")
                result.confirmed_at = persisted.get("confirmed_at")
                result.confirmation_notes = persisted.get("confirmation_notes")
                if persisted.get("recommended_form"):
                    result.recommended_form = persisted.get("recommended_form")
                    result.form_code = persisted.get("form_code", result.form_code)
        except Exception:
            pass

    return result


@router.post("/client/{client_id}/evaluate", response_model=ITRSelectionResult)
def evaluate_custom_itr_selection(
    client_id: str,
    req: EvaluateITRRequest,
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """Evaluates ITR selection with optional what-if disclosures or income adjustments."""
    client = case_manager.get_client_by_id(client_id)
    assert_client_case_access(
        actor,
        target_client_id=client.id if client else client_id,
        target_case_id=req.case_id,
        require_ca_role=False,
    )
    if not client:
        raise HTTPException(status_code=404, detail=f"Client {client_id} not found.")

    entity_type, res_status, incomes_dict, disclosures_dict, ay = _build_evaluation_inputs(
        db, client, req.case_id
    )

    if req.entity_type:
        entity_type = req.entity_type
    if req.residential_status:
        res_status = req.residential_status
    if req.income_overrides:
        incomes_dict.update(req.income_overrides)
    if req.disclosure_overrides:
        disclosures_dict.update(req.disclosure_overrides)

    return ITRSelectionEngine.evaluate(
        entity_type=entity_type,
        residential_status=res_status,
        incomes=incomes_dict,
        disclosures=disclosures_dict,
        assessment_year=ay,
    )


@router.post("/client/{client_id}/confirm", response_model=ITRSelectionResult)
def confirm_client_itr_selection(
    client_id: str,
    req: ConfirmITRRequest,
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """Authorised CA confirmation of the statutory return form."""
    client = case_manager.get_client_by_id(client_id)
    assert_client_case_access(
        actor,
        target_client_id=client.id if client else client_id,
        target_case_id=req.case_id,
        require_ca_role=True,  # Strict CA check
    )
    if not client:
        raise HTTPException(status_code=404, detail=f"Client {client_id} not found.")

    entity_type, res_status, incomes_dict, disclosures_dict, ay = _build_evaluation_inputs(
        db, client, req.case_id
    )

    result = ITRSelectionEngine.evaluate(
        entity_type=entity_type,
        residential_status=res_status,
        incomes=incomes_dict,
        disclosures=disclosures_dict,
        assessment_year=ay,
    )

    # Apply CA confirmation
    now_iso = datetime.now(timezone.utc).isoformat()
    approver = f"{actor.actor_name} ({actor.role})"
    result.recommended_form = req.confirmed_form
    result.form_code = req.confirmed_form.split(" ")[0]
    result.is_ca_confirmed = True
    result.confirmed_by = approver
    result.confirmed_at = now_iso
    result.confirmation_notes = req.ca_notes

    repo = TaxpayerRepository(db)
    repo.update_itr_selection(
        pan=client.pan,
        selected_itr_form=result.form_code,
        itr_selection_data=result.model_dump(),
        client_id=client.id,
        ca_notes=req.ca_notes,
        confirmed_by=approver,
    )

    # Sync client profile
    client.itr_form_type = req.confirmed_form

    details = f"CA confirmed return form {req.confirmed_form} for {client.name} ({client.pan}). Notes: {req.ca_notes}"
    repo.add_audit_log(
        actor=approver,
        action="ITR_FORM_CONFIRMED",
        details=details,
        client_name=client.name,
        pan=client.pan,
        category="Statutory Compliance",
    )
    case_manager.log_event(
        actor=approver,
        action="ITR_FORM_CONFIRMED",
        details=details,
        pan=client.pan,
    )

    return result
