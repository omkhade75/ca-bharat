"""
Immutable Audit Stream & DPDP Event Log API Routes
Enforces strict CA role access so client actors cannot enumerate firm-wide PAN audit logs.
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from ..db.session import get_db
from ..db.repository import TaxpayerRepository
from ..services.case_manager import case_manager
from .auth_context import ActorContext, require_authenticated_actor, CA_PRIVILEGED_ROLES

router = APIRouter(prefix="/api/audit", tags=["Regulatory Audit Stream"])


@router.get("/logs", response_model=List[Dict[str, Any]])
def get_audit_logs(
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """Returns chronological immutable activity log stream compliant with DPDP Act, 2023."""
    if actor.role not in CA_PRIVILEGED_ROLES:
        raise HTTPException(
            status_code=403,
            detail=f"Role '{actor.role}' is not authorized to view firm-wide compliance audit logs.",
        )
    repo = TaxpayerRepository(db)
    db_logs = repo.get_all_audit_logs(limit=100)
    serialized = [
        {
            "id": log.id,
            "timestamp": log.timestamp.isoformat() if log.timestamp else "",
            "actor": log.actor,
            "action": log.action,
            "client_name": log.client_name,
            "pan": log.pan,
            "details": log.details,
            "ip_address": log.ip_address,
            "category": log.category,
        }
        for log in db_logs
    ]
    seen_pairs = {(s["action"], s["details"]) for s in serialized}
    for evt in reversed(case_manager.audit_logs):
        if (evt.get("action"), evt.get("details")) not in seen_pairs:
            serialized.append(evt)
    return serialized
