"""
3-Way Reconciliation Matrix & Discrepancy Resolution API Routes
Connects Form 16, Form 26AS, and AIS/TIS DB extractions (plus CA field corrections)
to deterministic ReconciliationEngine, persists rows in relational DB,
and enforces strict Bearer auth, CA RBAC, and client/case ownership checks.
"""

from datetime import datetime, timezone
import json
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..db.session import get_db
from ..db.repository import TaxpayerRepository
from ..models.reconciliation_models import (
    ReconciliationMatrix,
    ReconciliationRow,
    MatchStatusEnum,
    NoticeRiskEnum,
    ResolutionActionEnum,
)
from ..engine.reconciliation_engine import ReconciliationEngine
from ..services.case_manager import case_manager
from ..services.document_validation import resolve_client_documents_for_engine
from .auth_context import (
    ActorContext,
    CA_PRIVILEGED_ROLES,
    require_authenticated_actor,
    assert_client_case_access,
)

router = APIRouter(prefix="/api/reconcile", tags=["3-Way Reconciliation Matrix"])


class RunReconciliationRequest(BaseModel):
    client_pan: str
    assessment_year: str = "2025-26"
    case_id: Optional[str] = None


class ClientReconciliationRunRequest(BaseModel):
    case_id: Optional[str] = None
    assessment_year: str = "2025-26"


class ResolveItemRequest(BaseModel):
    client_pan: str
    row_id: str
    action: ResolutionActionEnum
    ca_notes: str
    resolved_value: Optional[float] = None


class ResolveRowRequest(BaseModel):
    action: ResolutionActionEnum
    ca_notes: str = Field(..., min_length=3)
    resolved_value: Optional[float] = None
    case_id: Optional[str] = None


def _reconstruct_matrix_from_db(
    db: Session,
    client_id: str,
    client_pan: str,
    client_name: str,
    case_id: Optional[str],
    assessment_year: str,
) -> Optional[ReconciliationMatrix]:
    repo = TaxpayerRepository(db)
    db_rows = repo.get_reconciliation_items_by_client_id(client_id, case_id=case_id)
    if not db_rows:
        db_rows = repo.get_reconciliation_items_by_pan(client_pan, case_id=case_id)
    if not db_rows:
        return None

    bundle = resolve_client_documents_for_engine(
        db=db, client_id=client_id, client_pan=client_pan, case_id=case_id
    )

    rows: List[ReconciliationRow] = []
    for item in db_rows:
        row_id = item.row_key or item.id
        try:
            cits = json.loads(item.source_citations_json) if item.source_citations_json else []
        except Exception:
            cits = []
        try:
            orig_vals = json.loads(item.original_values_json) if item.original_values_json else {}
        except Exception:
            orig_vals = {}
        try:
            corrs = json.loads(item.corrections_applied_json) if item.corrections_applied_json else []
        except Exception:
            corrs = []

        match_enum = MatchStatusEnum.MATCHED
        raw_match = item.match_status or ("MATCHED" if item.status == "MATCH" else "MISMATCH_VARIANCE")
        try:
            match_enum = MatchStatusEnum(raw_match)
        except ValueError:
            match_enum = MatchStatusEnum.MISMATCH_VARIANCE

        risk_enum = NoticeRiskEnum.LOW
        try:
            risk_enum = NoticeRiskEnum(item.notice_risk or "LOW")
        except ValueError:
            risk_enum = NoticeRiskEnum.LOW

        action_enum = ResolutionActionEnum.NO_ACTION
        if item.resolution_action:
            try:
                action_enum = ResolutionActionEnum(item.resolution_action)
            except ValueError:
                action_enum = ResolutionActionEnum.ACCEPT_CLIENT_DOCUMENT

        resolved_val = (
            float(item.resolved_value)
            if item.resolved_value is not None and item.resolved_value != 0.0
            else float(item.amount_b if item.amount_b is not None else (item.ais_value or item.amount_a or 0.0))
        )

        rows.append(
            ReconciliationRow(
                id=row_id,
                category=item.category or "Statutory Cross-Check",
                field_label=item.field_name,
                form_16_value=item.amount_a,
                form_26as_value=item.amount_b,
                ais_value=item.ais_value,
                variance=float(item.variance or 0.0),
                match_status=match_enum,
                notice_risk=risk_enum,
                statutory_rule=item.statutory_rule or "Section 143(1)(a) & AIS SFT Reconciliation",
                explanation=item.explanation or (item.ca_notes or "Verified across statutory records."),
                recommended_action=action_enum,
                is_resolved=bool(item.is_accepted),
                resolved_value=resolved_val,
                ca_notes=item.ca_notes,
                source_citations=cits,
                original_extracted_values=orig_vals,
                ca_corrections_applied=corrs,
                source_doc_ids=[d.get("id") for d in bundle["source_documents"] if d.get("id")],
                resolved_by=item.resolved_by,
                resolved_at=item.resolved_at,
                resolution_action=item.resolution_action,
            )
        )

    discrepancies = [
        r
        for r in rows
        if not r.is_resolved or r.match_status != MatchStatusEnum.MATCHED
    ]
    unresolved_discrepancies = [r for r in rows if not r.is_resolved]
    high_risks = [r for r in unresolved_discrepancies if r.notice_risk == NoticeRiskEnum.HIGH]

    return ReconciliationMatrix(
        client_id=client_id,
        case_id=case_id,
        client_pan=client_pan.upper(),
        client_name=client_name,
        assessment_year=assessment_year,
        rows=rows,
        total_items=len(rows),
        total_discrepancies=len(unresolved_discrepancies),
        high_risk_count=len(high_risks),
        all_reconciled=len(unresolved_discrepancies) == 0,
        reconciled_at=datetime.now(timezone.utc).isoformat(),
        ca_reviewer_name="Assigned Chartered Accountant",
        data_source="BACKEND_DB_PERSISTED",
        source_documents=bundle["source_documents"],
        validation_summary=bundle["validation_summary"],
    )


def _execute_reconciliation_for_client(
    db: Session,
    actor: ActorContext,
    client_id: str,
    client_pan: str,
    client_name: str,
    case_id: Optional[str],
    assessment_year: str,
) -> ReconciliationMatrix:
    bundle = resolve_client_documents_for_engine(
        db=db, client_id=client_id, client_pan=client_pan, case_id=case_id
    )
    f16_data = bundle.get("f16_data")
    f26as_data = bundle.get("f26as_data")
    ais_data = bundle.get("ais_data")

    # Fallback ONLY for legacy standalone test_api_routes where case_manager holds memory fixtures without DB
    if not (f16_data or f26as_data or ais_data):
        mem_docs = case_manager.documents.get(client_pan.upper(), [])
        f16_data = next((d["extracted_data"] for d in mem_docs if d["document_type"] == "FORM_16"), None)
        f26as_data = next((d["extracted_data"] for d in mem_docs if d["document_type"] == "FORM_26AS"), None)
        ais_data = next((d["extracted_data"] for d in mem_docs if d["document_type"] == "AIS_TIS"), None)

    if not (f16_data or f26as_data or ais_data):
        return ReconciliationMatrix(
            client_id=client_id,
            case_id=case_id,
            client_pan=client_pan.upper(),
            client_name=client_name,
            assessment_year=assessment_year,
            rows=[],
            total_items=0,
            total_discrepancies=0,
            high_risk_count=0,
            all_reconciled=False,
            reconciled_at=datetime.now(timezone.utc).isoformat(),
            ca_reviewer_name=f"{actor.actor_name} ({actor.role})",
            data_source="NO_EXTRACTED_DOCS",
            source_documents=bundle["source_documents"],
            validation_summary=bundle["validation_summary"],
        )

    engine = ReconciliationEngine()
    matrix = engine.reconcile(
        client_pan=client_pan,
        client_name=client_name,
        f16_data=f16_data,
        f26as_data=f26as_data,
        ais_data=ais_data,
        assessment_year=assessment_year,
        client_id=client_id,
        case_id=case_id,
        provenance=bundle,
        ca_reviewer_name=f"{actor.actor_name} ({actor.role})",
    )

    repo = TaxpayerRepository(db)
    repo.save_reconciliation_matrix(matrix)
    case_manager.reconciliations[client_pan.upper()] = matrix

    details = (
        f"Executed 3-way reconciliation from {bundle['validation_summary'].get('core_parsed_docs', 0)} parsed backend document(s) "
        f"({bundle['validation_summary'].get('applied_corrections_count', 0)} CA correction override(s)). "
        f"Rows: {matrix.total_items}, Discrepancies: {matrix.total_discrepancies}."
    )
    repo.add_audit_log(
        actor=f"{actor.actor_name} ({actor.role})",
        action="3WAY_RECONCILIATION_EXECUTED",
        details=details,
        client_name=client_name,
        pan=client_pan,
        category="Reconciliation",
    )
    case_manager.log_event(
        actor=f"{actor.actor_name} ({actor.role})",
        action="3WAY_RECONCILIATION_EXECUTED",
        details=details,
        pan=client_pan,
    )
    return matrix


# ==============================================================================
# STAGE 4 CLIENT-ID / CASE-ID ROUTES (NO PAN IN URL)
# ==============================================================================

@router.post("/client/{client_id}/run", response_model=ReconciliationMatrix)
def run_client_reconciliation(
    client_id: str,
    req: Optional[ClientReconciliationRunRequest] = None,
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """Runs deterministic 3-way cross-check from validated backend extracted documents."""
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
    return _execute_reconciliation_for_client(
        db=db,
        actor=actor,
        client_id=client.id,
        client_pan=client.pan,
        client_name=client.name,
        case_id=case_id,
        assessment_year=ay_clean,
    )


@router.get("/client/{client_id}", response_model=ReconciliationMatrix)
def get_client_reconciliation(
    client_id: str,
    case_id: Optional[str] = Query(None),
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """Retrieves persisted 3-way reconciliation matrix for client_id without exposing PAN in URL."""
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
    matrix = _reconstruct_matrix_from_db(
        db=db,
        client_id=client.id,
        client_pan=client.pan,
        client_name=client.name,
        case_id=case_id,
        assessment_year=ay,
    )
    if matrix is not None:
        return matrix

    if actor.role not in CA_PRIVILEGED_ROLES:
        raise HTTPException(
            status_code=404,
            detail="Reconciliation has not been executed by the CA yet.",
        )

    return _execute_reconciliation_for_client(
        db=db,
        actor=actor,
        client_id=client.id,
        client_pan=client.pan,
        client_name=client.name,
        case_id=case_id,
        assessment_year=ay,
    )


@router.patch("/client/{client_id}/rows/{row_id}", response_model=ReconciliationMatrix)
def resolve_client_reconciliation_row(
    client_id: str,
    row_id: str,
    req: ResolveRowRequest,
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """Authorised CA review and resolution of a reconciliation discrepancy row with persistent audit."""
    client = case_manager.get_client_by_id(client_id)
    assert_client_case_access(
        actor,
        target_client_id=client.id if client else client_id,
        target_case_id=req.case_id,
        require_ca_role=True,
    )
    if not client:
        raise HTTPException(status_code=404, detail=f"Client {client_id} not found.")

    repo = TaxpayerRepository(db)
    actor_label = f"{actor.actor_name} ({actor.role})"
    resolved_row = repo.resolve_reconciliation_row(
        pan=client.pan,
        row_key_or_id=row_id,
        action=req.action.value,
        ca_notes=req.ca_notes.strip(),
        resolved_by=actor_label,
        resolved_value=req.resolved_value,
        client_id=client.id,
    )
    if not resolved_row:
        raise HTTPException(
            status_code=404,
            detail=f"Reconciliation row '{row_id}' not found for client '{client_id}'. Run reconciliation first.",
        )

    ay = case_manager.get_client_assessment_year(client.pan, req.case_id).replace("AY ", "")
    updated_matrix = _reconstruct_matrix_from_db(
        db=db,
        client_id=client.id,
        client_pan=client.pan,
        client_name=client.name,
        case_id=req.case_id,
        assessment_year=ay,
    )
    if updated_matrix:
        case_manager.reconciliations[client.pan.upper()] = updated_matrix

    details = (
        f"Resolved discrepancy row '{row_id}' ({resolved_row.field_name}) with action {req.action.value}. "
        f"Resolved value: ₹{resolved_row.resolved_value:,.2f}. Notes: {req.ca_notes.strip()}"
    )
    repo.add_audit_log(
        actor=actor_label,
        action="DISCREPANCY_RESOLVED",
        details=details,
        client_name=client.name,
        pan=client.pan,
        category="Reconciliation",
    )
    case_manager.log_event(
        actor=actor_label,
        action="DISCREPANCY_RESOLVED",
        details=details,
        pan=client.pan,
    )
    return updated_matrix


# ==============================================================================
# LEGACY PAN ROUTES (AUTHENTICATED & DB-BACKED FOR BACKWARD COMPATIBILITY)
# ==============================================================================

@router.post("/run", response_model=ReconciliationMatrix)
def run_reconciliation(
    req: RunReconciliationRequest,
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """Executes deterministic 3-way cross-check across Form 16, Form 26AS, and AIS/TIS."""
    client = case_manager.get_client(req.client_pan)
    assert_client_case_access(
        actor,
        target_client_id=client.id if client else "__UNOWNED__",
        target_case_id=req.case_id,
        require_ca_role=True,
    )
    if not client:
        raise HTTPException(status_code=404, detail=f"Client with PAN {req.client_pan.upper()} not found.")

    return _execute_reconciliation_for_client(
        db=db,
        actor=actor,
        client_id=client.id,
        client_pan=client.pan,
        client_name=client.name,
        case_id=req.case_id,
        assessment_year=req.assessment_year,
    )


@router.get("/{pan}", response_model=ReconciliationMatrix)
def get_reconciliation(
    pan: str,
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """Retrieves active 3-way reconciliation matrix for an owned/authorized taxpayer."""
    client = case_manager.get_client(pan)
    assert_client_case_access(
        actor,
        target_client_id=client.id if client else "__UNOWNED__",
        require_ca_role=False,
    )
    if not client:
        raise HTTPException(status_code=404, detail=f"Client with PAN {pan.upper()} not found.")

    matrix = _reconstruct_matrix_from_db(
        db=db,
        client_id=client.id,
        client_pan=client.pan,
        client_name=client.name,
        case_id=None,
        assessment_year="2025-26",
    )
    if matrix:
        return matrix

    assert_client_case_access(
        actor,
        target_client_id=client.id,
        require_ca_role=True,
    )
    return _execute_reconciliation_for_client(
        db=db,
        actor=actor,
        client_id=client.id,
        client_pan=client.pan,
        client_name=client.name,
        case_id=None,
        assessment_year="2025-26",
    )


@router.post("/resolve-item")
def resolve_discrepancy(
    req: ResolveItemRequest,
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """Captures CA decision on a flagged variance row with immutable DB & audit persistence."""
    client = case_manager.get_client(req.client_pan)
    assert_client_case_access(
        actor,
        target_client_id=client.id if client else "__UNOWNED__",
        require_ca_role=True,
    )
    if not client:
        raise HTTPException(status_code=404, detail="Client not found.")

    repo = TaxpayerRepository(db)
    actor_label = f"{actor.actor_name} ({actor.role})"
    resolved_row = repo.resolve_reconciliation_row(
        pan=client.pan,
        row_key_or_id=req.row_id,
        action=req.action.value,
        ca_notes=req.ca_notes,
        resolved_by=actor_label,
        resolved_value=req.resolved_value,
        client_id=client.id,
    )

    matrix = case_manager.reconciliations.get(req.client_pan.upper())
    all_reconciled = True
    if matrix:
        for row in matrix.rows:
            if row.id == req.row_id:
                row.is_resolved = True
                row.ca_notes = req.ca_notes
                row.recommended_action = req.action
                row.resolved_by = actor_label
                row.resolved_at = datetime.now(timezone.utc).isoformat()
                if req.resolved_value is not None:
                    row.resolved_value = req.resolved_value
        matrix.all_reconciled = all(r.is_resolved for r in matrix.rows)
        all_reconciled = matrix.all_reconciled
    elif not resolved_row:
        raise HTTPException(status_code=404, detail="Reconciliation matrix row not found.")

    details = f"Resolved row {req.row_id} with action {req.action.value}. Notes: {req.ca_notes}"
    repo.add_audit_log(
        actor=actor_label,
        action="DISCREPANCY_RESOLVED",
        details=details,
        client_name=client.name,
        pan=req.client_pan,
        category="Reconciliation",
    )
    case_manager.log_event(
        actor=actor_label,
        action="DISCREPANCY_RESOLVED",
        details=details,
        pan=req.client_pan,
    )
    return {"status": "SUCCESS", "message": f"Row {req.row_id} resolved.", "all_reconciled": all_reconciled}
