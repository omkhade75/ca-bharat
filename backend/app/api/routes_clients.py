"""
Client Master & Taxpayer Discovery API Routes
Enforces authentication, role checks, and client/case ownership validation.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List
from ..models.client_models import ClientProfile, DPDPConsentRecord
from ..services.case_manager import case_manager
from .auth_context import (
    ActorContext,
    require_authenticated_actor,
    assert_client_case_access,
)

router = APIRouter(prefix="/api/clients", tags=["Client Master"])


@router.get("", response_model=List[ClientProfile])
def list_clients(actor: ActorContext = Depends(require_authenticated_actor)):
    """Returns authorized taxpayer client profiles (scoped by client ownership for CLIENT role)."""
    all_clients = case_manager.list_clients()
    if actor.role == "CLIENT" or actor.assigned_client_ids:
        return [c for c in all_clients if c.id in actor.assigned_client_ids]
    return all_clients


@router.get("/{pan}", response_model=ClientProfile)
def get_client(pan: str, actor: ActorContext = Depends(require_authenticated_actor)):
    """Retrieves single taxpayer client by PAN after verifying client ownership."""
    client = case_manager.get_client(pan)
    assert_client_case_access(
        actor,
        target_client_id=client.id if client else "__UNOWNED__",
        require_ca_role=False,
    )
    if not client:
        raise HTTPException(status_code=404, detail=f"Taxpayer with PAN {pan.upper()} not found.")
    return client


@router.post("", response_model=ClientProfile)
def onboard_taxpayer(
    client: ClientProfile,
    actor: ActorContext = Depends(require_authenticated_actor),
):
    """Onboards a new taxpayer profile; strictly restricted to CA_PARTNER / CA_STAFF roles."""
    assert_client_case_access(actor, target_client_id=client.id, require_ca_role=True)
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
        actor=f"{actor.actor_name} ({actor.role})",
        action="TAXPAYER_ONBOARDED",
        details=f"Onboarded {client.name} ({client.pan}) as {client.legal_type.value if hasattr(client.legal_type, 'value') else client.legal_type} ({client.category}).",
        pan=client.pan,
    )
    return saved


@router.get("/{pan}/intake")
def get_taxpayer_intake(
    pan: str,
    actor: ActorContext = Depends(require_authenticated_actor),
):
    """Retrieves 5-head income discovery, prior year info, and tax intake data with ownership validation."""
    client = case_manager.get_client(pan)
    assert_client_case_access(
        actor,
        target_client_id=client.id if client else "__UNOWNED__",
        require_ca_role=False,
    )
    if not client:
        raise HTTPException(status_code=404, detail=f"Taxpayer with PAN {pan.upper()} not found.")
    return {
        "client_id": client.id,
        "pan": client.pan,
        "name": client.name,
        "legal_type": client.legal_type,
        "occupation_profile": client.occupation_profile,
        "intake_discovery": client.intake_discovery or {},
    }


@router.put("/{pan}/intake")
def update_taxpayer_intake(
    pan: str,
    intake_data: dict,
    actor: ActorContext = Depends(require_authenticated_actor),
):
    """Updates 5-head income discovery, prior year benchmark, and deduction claims with ownership validation."""
    client = case_manager.get_client(pan)
    assert_client_case_access(
        actor,
        target_client_id=client.id if client else "__UNOWNED__",
        require_ca_role=False,
    )
    if not client:
        raise HTTPException(status_code=404, detail=f"Taxpayer with PAN {pan.upper()} not found.")
    updated = case_manager.update_client_intake(pan, intake_data)
    case_manager.log_event(
        actor=f"{actor.actor_name} ({actor.role})",
        action="INTAKE_DISCOVERY_UPDATED",
        details=f"Updated tax discovery questionnaire and checklist for {updated.name} ({updated.pan}).",
        pan=updated.pan,
    )
    return {"status": "SUCCESS", "client_id": updated.id, "pan": updated.pan, "intake_discovery": updated.intake_discovery}
