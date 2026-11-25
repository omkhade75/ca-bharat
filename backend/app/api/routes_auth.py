"""
Authentication Session Routes for CA Bharat AI
Issues HMAC-SHA256 signed bearer tokens ONLY in non-production environments
after authenticating against the server-side identity & role directory.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from .auth_context import (
    create_signed_session_token,
    authenticate_prototype_user,
    is_prototype_auth_enabled,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication & Sessions"])


class CreateSessionRequest(BaseModel):
    username: str
    credential: str
    # Optional asserted role checked strictly against server-side mapping (rejects escalation)
    role: Optional[str] = None


class SessionTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    actor_id: str
    actor_name: str
    role: str
    assigned_client_ids: List[str] = []
    allowed_case_ids: List[str] = []
    is_prototype_auth: bool = True


@router.post("/session", response_model=SessionTokenResponse)
def issue_session_token(payload: CreateSessionRequest):
    """
    Authenticates caller against server-side credential directory and issues a signed token.
    - Disabled completely in production (ENVIRONMENT=production / RENDER=true).
    - Never accepts caller-supplied role or client assignments; rejects privilege escalation.
    """
    if not is_prototype_auth_enabled():
        raise HTTPException(
            status_code=403,
            detail="Prototype session issuance is disabled in production environments.",
        )

    user_entry = authenticate_prototype_user(payload.username, payload.credential)
    assigned_role = user_entry["role"]

    if payload.role and payload.role.strip().upper() != assigned_role:
        raise HTTPException(
            status_code=403,
            detail=(
                f"Privilege escalation denied: authenticated identity is mapped to role '{assigned_role}', "
                f"cannot request '{payload.role}'."
            ),
        )

    token = create_signed_session_token(
        actor_id=user_entry["actor_id"],
        actor_name=user_entry["actor_name"],
        role=assigned_role,
        assigned_client_ids=user_entry["assigned_client_ids"],
        allowed_case_ids=user_entry["allowed_case_ids"],
    )

    return SessionTokenResponse(
        access_token=token,
        actor_id=user_entry["actor_id"],
        actor_name=user_entry["actor_name"],
        role=assigned_role,
        assigned_client_ids=user_entry["assigned_client_ids"],
        allowed_case_ids=user_entry["allowed_case_ids"],
        is_prototype_auth=True,
    )
