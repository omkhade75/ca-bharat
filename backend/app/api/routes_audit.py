"""
Immutable Audit Stream & DPDP Event Log API Routes
"""

from fastapi import APIRouter
from typing import List, Dict, Any
from ..services.case_manager import case_manager

router = APIRouter(prefix="/api/audit", tags=["Regulatory Audit Stream"])

@router.get("/logs", response_model=List[Dict[str, Any]])
def get_audit_logs():
    """Returns chronological immutable activity log stream compliant with DPDP Act, 2023."""
    return case_manager.audit_logs
