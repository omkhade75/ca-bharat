"""
Deterministic Direct Tax Calculation & Regime Optimization API Routes
Consumes validated backend documents (originals + verified CA corrections) and
reconciliation outputs from relational DB, persists tax computations, and enforces
strict Bearer auth, CA RBAC, and client/case ownership checks.
"""

from datetime import datetime, timezone
import hashlib
import json
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..db.session import get_db
from ..db.repository import TaxpayerRepository
from ..models.tax_models import (
    RegimeComparisonResult,
    IncomeHeadDetails,
    DeductionsDetail,
    TaxRegimeEnum,
)
from ..engine.tax_calculator import TaxCalculator
from ..services.case_manager import case_manager
from ..services.document_validation import derive_validated_tax_inputs_from_db
from .auth_context import (
    ActorContext,
    CA_PRIVILEGED_ROLES,
    require_authenticated_actor,
    assert_client_case_access,
)

router = APIRouter(prefix="/api/calculate", tags=["Deterministic Tax Computation"])


class CalculateTaxRequest(BaseModel):
    client_pan: str
    income: IncomeHeadDetails
    deductions: Optional[DeductionsDetail] = None
    prepaid_tax: float = 0.0
    advance_tax: float = 0.0
    assessment_year: str = "2025-26"


class ClientTaxCalculateRequest(BaseModel):
    case_id: Optional[str] = None
    assessment_year: str = "2025-26"


class CASignOffRequest(BaseModel):
    client_pan: Optional[str] = None
    ca_name: str = "CA Rajesh Sharma"
    ca_membership_no: str = "DEMO049281"
    chosen_regime: TaxRegimeEnum = TaxRegimeEnum.NEW_REGIME_115BAC
    verification_notes: str = "Verified Form 16, TRACES 26AS, and AIS. Slabs and deductions checked."
    case_id: Optional[str] = None


class CAReturnForCorrectionRequest(BaseModel):
    case_id: Optional[str] = None
    reason: str


class CARejectComputationRequest(BaseModel):
    case_id: Optional[str] = None
    reason: str


def _compute_and_persist_from_validated_db(
    db: Session,
    actor: ActorContext,
    client_id: str,
    client_pan: str,
    client_name: str,
    case_id: Optional[str],
    assessment_year: str,
    occupation_profile: Optional[str] = None,
) -> RegimeComparisonResult:
    repo = TaxpayerRepository(db)
    db_recon_rows = repo.get_reconciliation_items_by_client_id(client_id, case_id=case_id)
    if not db_recon_rows:
        db_recon_rows = repo.get_reconciliation_items_by_pan(client_pan, case_id=case_id)

    derived = derive_validated_tax_inputs_from_db(
        db=db,
        client_id=client_id,
        client_pan=client_pan,
        case_id=case_id,
        assessment_year=assessment_year,
        occupation_profile=occupation_profile,
        reconciled_rows=db_recon_rows,
    )

    result = TaxCalculator.compare_and_optimize(
        client_pan=client_pan,
        client_name=client_name,
        income=derived["income"],
        deductions=derived["deductions"],
        prepaid_tax=derived["prepaid_tax"],
        advance_tax=derived["advance_tax"],
        assessment_year=assessment_year,
    )
    result.client_id = client_id
    result.case_id = case_id
    result.data_source = "VALIDATED_BACKEND_DOCUMENTS"
    result.validation_status = derived["validation_status"]
    result.validation_gate = derived["validation_gate"]
    result.income_summary = derived["income_summary"]
    result.deductions_summary = derived["deductions_summary"]

    # Preserve existing CA sign-off metadata if DB already has approved record and validation hasn't regressed
    existing_comp = repo.get_tax_computation_by_client_id(client_id) or repo.get_tax_computation_by_pan(client_pan)
    if existing_comp:
        if existing_comp.selected_itr_form:
            result.selected_itr_form = existing_comp.selected_itr_form
        if existing_comp.ca_review_status == "RETURNED_FOR_CORRECTION":
            result.ca_sign_off_status = "RETURNED_FOR_CORRECTION"
            result.ca_return_reason = existing_comp.ca_return_reason
            result.ca_approver = existing_comp.ca_approver
            result.ca_notes = existing_comp.ca_notes
        elif existing_comp.ca_review_status == "REJECTED":
            result.ca_sign_off_status = "REJECTED"
            result.ca_return_reason = existing_comp.ca_return_reason
            result.ca_approver = existing_comp.ca_approver
            result.ca_notes = existing_comp.ca_notes
        elif existing_comp.is_ca_approved and derived["validation_status"] == "READY":
            result.ca_sign_off_status = "CA_APPROVED"
            result.ca_approver = existing_comp.ca_approver or "Approved Chartered Accountant"
            result.verification_hash = existing_comp.ca_sign_off_hash
            result.ca_notes = existing_comp.ca_notes
            result.ca_approval_timestamp = (
                existing_comp.approved_at.isoformat() if existing_comp.approved_at else None
            )
        else:
            chosen = result.new_regime if result.recommended_regime == TaxRegimeEnum.NEW_REGIME_115BAC else result.old_regime
            preserved_itr = None
            if existing_comp.itr_selection_json:
                try:
                    preserved_itr = json.loads(existing_comp.itr_selection_json)
                except Exception:
                    preserved_itr = None
            preserved_pkg = None
            if existing_comp.filing_package_json:
                try:
                    preserved_pkg = json.loads(existing_comp.filing_package_json)
                except Exception:
                    preserved_pkg = None
            repo.save_tax_computation(
                pan=client_pan,
                computation_data={
                    "client_id": client_id,
                    "case_id": case_id,
                    "ay": assessment_year,
                    "gross_total_income": derived["income"].gross_total_income,
                    "old_regime_tax": result.old_regime.total_tax_liability,
                    "new_regime_tax": result.new_regime.total_tax_liability,
                    "recommended_regime": result.recommended_regime.value,
                    "tds_credits": derived["prepaid_tax"] + derived["advance_tax"],
                    "refund_due": chosen.refund_amount,
                    "balance_payable": chosen.tax_due_amount,
                    "data_source": "VALIDATED_BACKEND_DOCUMENTS",
                    "validation_status": derived["validation_status"],
                    "validation_gate": derived["validation_gate"],
                    "selected_itr_form": existing_comp.selected_itr_form or "ITR-1",
                    "itr_selection": preserved_itr,
                    "filing_package": preserved_pkg,
                    "details": {
                        "income_summary": derived["income_summary"],
                        "deductions_summary": derived["deductions_summary"],
                        "new_regime": result.new_regime.model_dump(),
                        "old_regime": result.old_regime.model_dump(),
                    },
                    "is_ca_approved": False,
                },
            )
    else:
        chosen = result.new_regime if result.recommended_regime == TaxRegimeEnum.NEW_REGIME_115BAC else result.old_regime
        repo.save_tax_computation(
            pan=client_pan,
            computation_data={
                "client_id": client_id,
                "case_id": case_id,
                "ay": assessment_year,
                "gross_total_income": derived["income"].gross_total_income,
                "old_regime_tax": result.old_regime.total_tax_liability,
                "new_regime_tax": result.new_regime.total_tax_liability,
                "recommended_regime": result.recommended_regime.value,
                "tds_credits": derived["prepaid_tax"] + derived["advance_tax"],
                "refund_due": chosen.refund_amount,
                "balance_payable": chosen.tax_due_amount,
                "data_source": "VALIDATED_BACKEND_DOCUMENTS",
                "validation_status": derived["validation_status"],
                "validation_gate": derived["validation_gate"],
                "details": {
                    "income_summary": derived["income_summary"],
                    "deductions_summary": derived["deductions_summary"],
                    "new_regime": result.new_regime.model_dump(),
                    "old_regime": result.old_regime.model_dump(),
                },
                "is_ca_approved": False,
            },
        )

    case_manager.tax_computations[client_pan.upper()] = result
    details = (
        f"Computed tax comparison from validated DB docs (status={derived['validation_status']}). "
        f"Recommended: {result.recommended_regime.value}, Tax savings: ₹{result.tax_savings:,.2f}."
    )
    repo.add_audit_log(
        actor=f"{actor.actor_name} ({actor.role})",
        action="DETERMINISTIC_TAX_COMPUTED",
        details=details,
        client_name=client_name,
        pan=client_pan,
        category="Tax Engine",
    )
    case_manager.log_event(
        actor=f"{actor.actor_name} ({actor.role})",
        action="DETERMINISTIC_TAX_COMPUTED",
        details=details,
        pan=client_pan,
    )
    return result


# ==============================================================================
# STAGE 4 CLIENT-ID / CASE-ID ROUTES (NO PAN IN URL)
# ==============================================================================

@router.post("/client/{client_id}/tax", response_model=RegimeComparisonResult)
def calculate_client_tax(
    client_id: str,
    req: Optional[ClientTaxCalculateRequest] = None,
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """Computes deterministic Old vs New tax comparison from validated backend documents."""
    case_id = req.case_id if req else None
    client = case_manager.get_client_by_id(client_id)
    assert_client_case_access(
        actor,
        target_client_id=client.id if client else client_id,
        target_case_id=case_id,
        require_ca_role=True,
    )
    if not client:
        raise HTTPException(status_code=404, detail=f"Client {client_id} not found.")

    ay = (req.assessment_year if req and req.assessment_year else None) or case_manager.get_client_assessment_year(client.pan, case_id)
    ay_clean = ay.replace("AY ", "")
    occ = client.occupation_profile.value if getattr(client, "occupation_profile", None) else None
    return _compute_and_persist_from_validated_db(
        db=db,
        actor=actor,
        client_id=client.id,
        client_pan=client.pan,
        client_name=client.name,
        case_id=case_id,
        assessment_year=ay_clean,
        occupation_profile=occ,
    )


@router.get("/client/{client_id}", response_model=RegimeComparisonResult)
def get_client_tax_calculation(
    client_id: str,
    case_id: Optional[str] = Query(None),
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """Retrieves latest tax comparison built strictly from validated backend documents."""
    client = case_manager.get_client_by_id(client_id)
    assert_client_case_access(
        actor,
        target_client_id=client.id if client else client_id,
        target_case_id=case_id,
        require_ca_role=False,
    )
    if not client:
        raise HTTPException(status_code=404, detail=f"Client {client_id} not found.")

    ay = case_manager.get_client_assessment_year(client.pan, case_id).replace("AY ", "")
    occ = client.occupation_profile.value if getattr(client, "occupation_profile", None) else None
    return _compute_and_persist_from_validated_db(
        db=db,
        actor=actor,
        client_id=client.id,
        client_pan=client.pan,
        client_name=client.name,
        case_id=case_id,
        assessment_year=ay,
        occupation_profile=occ,
    )


@router.post("/client/{client_id}/sign-off")
def sign_off_client_case(
    client_id: str,
    req: CASignOffRequest,
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """Authorised CA review sign-off gated on validated documents & resolved discrepancies."""
    client = case_manager.get_client_by_id(client_id)
    assert_client_case_access(
        actor,
        target_client_id=client.id if client else client_id,
        target_case_id=req.case_id,
        require_ca_role=True,
    )
    if not client:
        raise HTTPException(status_code=404, detail=f"Client {client_id} not found.")

    ay = case_manager.get_client_assessment_year(client.pan, req.case_id).replace("AY ", "")
    occ = client.occupation_profile.value if getattr(client, "occupation_profile", None) else None
    calc = _compute_and_persist_from_validated_db(
        db=db,
        actor=actor,
        client_id=client.id,
        client_pan=client.pan,
        client_name=client.name,
        case_id=req.case_id,
        assessment_year=ay,
        occupation_profile=occ,
    )

    gate = calc.validation_gate or {}
    if not gate.get("has_validated_data"):
        raise HTTPException(
            status_code=400,
            detail="Cannot sign off: no parsed backend statutory documents exist for this case.",
        )
    if gate.get("unresolved_discrepancies_count", 0) > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot sign off: {gate['unresolved_discrepancies_count']} unresolved reconciliation discrepancy row(s) remain.",
        )

    ts = datetime.now(timezone.utc).isoformat()
    digest_seed = f"{client.id}:{client.pan}:{req.chosen_regime.value}:{calc.new_regime.total_tax_liability}:{calc.old_regime.total_tax_liability}:{actor.actor_id}:{ts}"
    verification_hash = hashlib.sha256(digest_seed.encode("utf-8")).hexdigest()[:24]
    approver_label = f"{actor.actor_name} ({actor.role})"

    repo = TaxpayerRepository(db)
    repo.approve_tax_computation(
        pan=client.pan,
        ca_approver=approver_label,
        sign_off_hash=verification_hash,
        ca_notes=req.verification_notes,
        recommended_regime=req.chosen_regime.value,
        client_id=client.id,
    )

    calc.ca_sign_off_status = "CA_APPROVED"
    calc.ca_approver = approver_label
    calc.ca_approval_timestamp = ts
    calc.verification_hash = verification_hash
    calc.ca_notes = req.verification_notes
    case_manager.tax_computations[client.pan.upper()] = calc
    client.workflow_status = "CA_APPROVED"

    details = f"CA statutory sign-off approved under {req.chosen_regime.value}. Hash: {verification_hash}. Notes: {req.verification_notes}"
    repo.add_audit_log(
        actor=approver_label,
        action="CA_STATUTORY_SIGN_OFF",
        details=details,
        client_name=client.name,
        pan=client.pan,
        category="CA Sign-Off",
    )
    case_manager.log_event(
        actor=approver_label,
        action="CA_STATUTORY_SIGN_OFF",
        details=details,
        pan=client.pan,
    )

    return {
        "status": "APPROVED",
        "client_id": client.id,
        "case_id": req.case_id,
        "verification_hash": verification_hash,
        "approved_by": approver_label,
        "approved_at": ts,
        "chosen_regime": req.chosen_regime.value,
        "ca_notes": req.verification_notes,
        "message": f"Case for {client.name} approved by {approver_label}.",
    }


@router.post("/client/{client_id}/return-for-correction")
def return_client_case_for_correction(
    client_id: str,
    req: CAReturnForCorrectionRequest,
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """Authorised CA action to return case for correction with mandatory remarks."""
    if not req.reason or not req.reason.strip():
        raise HTTPException(status_code=400, detail="Mandatory reason required to return case for correction.")

    client = case_manager.get_client_by_id(client_id)
    assert_client_case_access(
        actor,
        target_client_id=client.id if client else client_id,
        target_case_id=req.case_id,
        require_ca_role=True,
    )
    if not client:
        raise HTTPException(status_code=404, detail=f"Client {client_id} not found.")

    approver_label = f"{actor.actor_name} ({actor.role})"
    repo = TaxpayerRepository(db)
    repo.return_tax_computation_for_correction(
        pan=client.pan,
        ca_actor=approver_label,
        reason=req.reason.strip(),
        client_id=client.id,
    )

    client.workflow_status = "RETURNED_FOR_CORRECTION"
    details = f"Case returned for correction by CA: {req.reason.strip()}"
    repo.add_audit_log(
        actor=approver_label,
        action="CA_RETURNED_FOR_CORRECTION",
        details=details,
        client_name=client.name,
        pan=client.pan,
        category="CA Review",
    )
    case_manager.log_event(
        actor=approver_label,
        action="CA_RETURNED_FOR_CORRECTION",
        details=details,
        pan=client.pan,
    )

    return {
        "status": "RETURNED_FOR_CORRECTION",
        "client_id": client.id,
        "case_id": req.case_id,
        "reason": req.reason.strip(),
        "returned_by": approver_label,
        "returned_at": datetime.now(timezone.utc).isoformat(),
        "message": f"Case returned for correction to {client.name} with mandatory audit notes.",
    }


@router.post("/client/{client_id}/reject")
def reject_client_case_computation(
    client_id: str,
    req: CARejectComputationRequest,
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """Authorised CA action to reject computation with mandatory remarks."""
    if not req.reason or not req.reason.strip():
        raise HTTPException(status_code=400, detail="Mandatory reason required to reject tax computation.")

    client = case_manager.get_client_by_id(client_id)
    assert_client_case_access(
        actor,
        target_client_id=client.id if client else client_id,
        target_case_id=req.case_id,
        require_ca_role=True,
    )
    if not client:
        raise HTTPException(status_code=404, detail=f"Client {client_id} not found.")

    approver_label = f"{actor.actor_name} ({actor.role})"
    repo = TaxpayerRepository(db)
    repo.reject_tax_computation(
        pan=client.pan,
        ca_rejector=approver_label,
        reason=req.reason.strip(),
        client_id=client.id,
    )

    client.workflow_status = "REJECTED"
    details = f"Tax computation rejected by CA: {req.reason.strip()}"
    repo.add_audit_log(
        actor=approver_label,
        action="CA_COMPUTATION_REJECTED",
        details=details,
        client_name=client.name,
        pan=client.pan,
        category="CA Review",
    )
    case_manager.log_event(
        actor=approver_label,
        action="CA_COMPUTATION_REJECTED",
        details=details,
        pan=client.pan,
    )

    return {
        "status": "REJECTED",
        "client_id": client.id,
        "case_id": req.case_id,
        "reason": req.reason.strip(),
        "rejected_by": approver_label,
        "rejected_at": datetime.now(timezone.utc).isoformat(),
        "message": f"Computation rejected by CA for {client.name}.",
    }


# ==============================================================================
# LEGACY PAN ROUTES (AUTHENTICATED)
# ==============================================================================

@router.post("/tax", response_model=RegimeComparisonResult)
def calculate_tax(
    req: CalculateTaxRequest,
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """Executes side-by-side deterministic calculation under Finance Act 2024 rules."""
    client = case_manager.get_client(req.client_pan)
    assert_client_case_access(
        actor,
        target_client_id=client.id if client else "__UNOWNED__",
        require_ca_role=True,
    )
    client_name = client.name if client else "Taxpayer"

    result = TaxCalculator.compare_and_optimize(
        client_pan=req.client_pan,
        client_name=client_name,
        income=req.income,
        deductions=req.deductions or DeductionsDetail(),
        prepaid_tax=req.prepaid_tax,
        advance_tax=req.advance_tax,
        assessment_year=req.assessment_year,
    )
    result.client_id = client.id if client else None
    case_manager.tax_computations[req.client_pan.upper()] = result

    details = f"Calculated New vs Old regime for {req.client_pan}. Recommended: {result.recommended_regime.value}. Savings: ₹{result.tax_savings:,.2f}"
    TaxpayerRepository(db).add_audit_log(
        actor=f"{actor.actor_name} ({actor.role})",
        action="DETERMINISTIC_TAX_COMPUTED",
        details=details,
        client_name=client_name,
        pan=req.client_pan,
        category="Tax Engine",
    )
    case_manager.log_event(
        actor=f"{actor.actor_name} ({actor.role})",
        action="DETERMINISTIC_TAX_COMPUTED",
        details=details,
        pan=req.client_pan,
    )
    return result


@router.get("/{pan}", response_model=RegimeComparisonResult)
def get_tax_calculation(
    pan: str,
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """Retrieves active tax calculation derived from validated backend documents."""
    client = case_manager.get_client(pan)
    assert_client_case_access(
        actor,
        target_client_id=client.id if client else "__UNOWNED__",
        require_ca_role=False,
    )
    if not client:
        raise HTTPException(status_code=404, detail=f"Taxpayer {pan.upper()} not found.")

    occ = client.occupation_profile.value if getattr(client, "occupation_profile", None) else None
    return _compute_and_persist_from_validated_db(
        db=db,
        actor=actor,
        client_id=client.id,
        client_pan=client.pan,
        client_name=client.name,
        case_id=None,
        assessment_year="2025-26",
        occupation_profile=occ,
    )


@router.post("/ca-sign-off")
def ca_sign_off(
    req: CASignOffRequest,
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """Mandatory Chartered Accountant statutory review and sign-off (CA role required)."""
    if not req.client_pan:
        raise HTTPException(status_code=400, detail="client_pan is required.")
    client = case_manager.get_client(req.client_pan)
    assert_client_case_access(
        actor,
        target_client_id=client.id if client else "__UNOWNED__",
        require_ca_role=True,
    )
    if not client:
        raise HTTPException(status_code=404, detail="Client not found.")
    return sign_off_client_case(client.id, req, actor=actor, db=db)
