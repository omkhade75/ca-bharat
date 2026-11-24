"""
Client Master & Taxpayer Discovery API Routes
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from ..models.client_models import ClientProfile, TaxpayerCategoryEnum, DPDPConsentRecord
from ..services.case_manager import case_manager

router = APIRouter(prefix="/api/clients", tags=["Client Master"])

@router.get("", response_model=List[ClientProfile])
def list_clients():
    """Returns all registered Indian taxpayer client profiles."""
    return case_manager.list_clients()

@router.get("/{pan}", response_model=ClientProfile)
def get_client(pan: str):
    """Retrieves single taxpayer client by Permanent Account Number (PAN)."""
    client = case_manager.get_client(pan)
    if not client:
        raise HTTPException(status_code=404, detail=f"Taxpayer with PAN {pan.upper()} not found.")
    return client

@router.post("", response_model=ClientProfile)
def onboard_taxpayer(client: ClientProfile):
    """Onboards a new taxpayer profile and generates DPDP digital consent record."""
    if not client.consent:
        client.consent = DPDPConsentRecord(
            consent_id=f"cst-{client.pan.lower()}-auto",
            pan=client.pan,
            client_name=client.name,
            assessment_year="2025-26",
            granted_at="2026-06-12T12:00:00Z",
            status="ACTIVE",
        )
    saved = case_manager.add_client(client)
    case_manager.log_event(
        actor="CA Rajesh Sharma (Demo Partner)",
        action="TAXPAYER_ONBOARDED",
        details=f"Onboarded {client.name} ({client.pan}) as {client.legal_type.value if hasattr(client.legal_type, 'value') else client.legal_type} ({client.category}).",
        pan=client.pan,
    )
    return saved

@router.get("/{pan}/intake")
def get_taxpayer_intake(pan: str):
    """Retrieves 5-head income discovery, prior year info, and tax intake data."""
    client = case_manager.get_client(pan)
    if not client:
        raise HTTPException(status_code=404, detail=f"Taxpayer with PAN {pan.upper()} not found.")
    return {
        "pan": client.pan,
        "name": client.name,
        "legal_type": client.legal_type,
        "occupation_profile": client.occupation_profile,
        "intake_discovery": client.intake_discovery or {},
    }

@router.put("/{pan}/intake")
def update_taxpayer_intake(pan: str, intake_data: dict):
    """Updates 5-head income discovery, prior year benchmark, and deduction claims."""
    updated = case_manager.update_client_intake(pan, intake_data)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Taxpayer with PAN {pan.upper()} not found.")
    case_manager.log_event(
        actor="Ananya Joshi (Senior Associate)",
        action="INTAKE_DISCOVERY_UPDATED",
        details=f"Updated tax discovery questionnaire and checklist for {updated.name} ({updated.pan}).",
        pan=updated.pan,
    )
    return {"status": "SUCCESS", "pan": updated.pan, "intake_discovery": updated.intake_discovery}

