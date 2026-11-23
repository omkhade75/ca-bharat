"""
3-Way Reconciliation Matrix & Discrepancy Resolution API Routes
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..models.reconciliation_models import ReconciliationMatrix, ResolutionActionEnum
from ..engine.reconciliation_engine import ReconciliationEngine
from ..services.case_manager import case_manager

router = APIRouter(prefix="/api/reconcile", tags=["3-Way Reconciliation Matrix"])

class RunReconciliationRequest(BaseModel):
    client_pan: str
    assessment_year: str = "2025-26"

class ResolveItemRequest(BaseModel):
    client_pan: str
    row_id: str
    action: ResolutionActionEnum
    ca_notes: str

@router.post("/run", response_model=ReconciliationMatrix)
def run_reconciliation(req: RunReconciliationRequest):
    """Executes deterministic 3-way cross-check across Form 16, Form 26AS, and AIS/TIS."""
    client = case_manager.get_client(req.client_pan)
    client_name = client.name if client else "Demo Taxpayer"

    # Fetch stored parsed data if available
    docs = case_manager.documents.get(req.client_pan.upper(), [])
    f16_data = next((d["extracted_data"] for d in docs if d["document_type"] == "FORM_16"), None)
    f26as_data = next((d["extracted_data"] for d in docs if d["document_type"] == "FORM_26AS"), None)
    ais_data = next((d["extracted_data"] for d in docs if d["document_type"] == "AIS_TIS"), None)

    engine = ReconciliationEngine()
    matrix = engine.reconcile(
        client_pan=req.client_pan,
        client_name=client_name,
        f16_data=f16_data,
        f26as_data=f26as_data,
        ais_data=ais_data,
        assessment_year=req.assessment_year,
    )
    case_manager.reconciliations[req.client_pan.upper()] = matrix

    case_manager.log_event(
        actor="CA Rajesh Sharma (Demo Partner)",
        action="3WAY_RECONCILIATION_EXECUTED",
        details=f"Ran 3-way cross-check for {req.client_pan}: {matrix.total_discrepancies} variances detected.",
        pan=req.client_pan,
    )
    return matrix

@router.get("/{pan}", response_model=ReconciliationMatrix)
def get_reconciliation(pan: str):
    """Retrieves active 3-way reconciliation matrix for a taxpayer."""
    matrix = case_manager.reconciliations.get(pan.upper())
    if not matrix:
        # Run default
        return run_reconciliation(RunReconciliationRequest(client_pan=pan))
    return matrix

@router.post("/resolve-item")
def resolve_discrepancy(req: ResolveItemRequest):
    """Captures CA decision on a flagged variance row with immutable audit logging."""
    matrix = case_manager.reconciliations.get(req.client_pan.upper())
    if not matrix:
        raise HTTPException(status_code=404, detail="Reconciliation matrix not found.")

    found = False
    for row in matrix.rows:
        if row.id == req.row_id:
            row.is_resolved = True
            row.ca_notes = req.ca_notes
            row.recommended_action = req.action
            found = True
            break

    if not found:
        raise HTTPException(status_code=404, detail=f"Row with ID {req.row_id} not found in matrix.")

    matrix.all_reconciled = all(r.is_resolved for r in matrix.rows)
    case_manager.log_event(
        actor="CA Rajesh Sharma (Demo Partner)",
        action="DISCREPANCY_RESOLVED",
        details=f"Resolved row {req.row_id} with action {req.action.value}. Notes: {req.ca_notes}",
        pan=req.client_pan,
    )
    return {"status": "SUCCESS", "message": f"Row {req.row_id} resolved.", "all_reconciled": matrix.all_reconciled}
