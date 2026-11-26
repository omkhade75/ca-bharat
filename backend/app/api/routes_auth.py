"""
Authentication Session Routes for CA Bharat AI
Issues HMAC-SHA256 signed bearer tokens ONLY in non-production environments
after authenticating against the server-side identity & role directory.
"""

import time
from collections import defaultdict
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List, Dict
from .auth_context import (
    create_signed_session_token,
    authenticate_prototype_user,
    is_prototype_auth_enabled,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication & Sessions"])

# In-memory sliding window rate limiter for failed login attempts
_FAILED_ATTEMPTS: Dict[str, List[float]] = defaultdict(list)
_MAX_FAILED_ATTEMPTS = 5
_LOCKOUT_WINDOW_SECONDS = 300.0  # 5 minutes


def _check_rate_limit(key: str) -> None:
    now = time.time()
    cutoff = now - _LOCKOUT_WINDOW_SECONDS
    # Purge old attempts
    _FAILED_ATTEMPTS[key] = [t for t in _FAILED_ATTEMPTS[key] if t > cutoff]
    if len(_FAILED_ATTEMPTS[key]) >= _MAX_FAILED_ATTEMPTS:
        raise HTTPException(
            status_code=429,
            detail="Too many failed authentication attempts. Access locked for 5 minutes.",
        )


def _record_failed_attempt(key: str) -> None:
    _FAILED_ATTEMPTS[key].append(time.time())


def _record_successful_attempt(key: str) -> None:
    _FAILED_ATTEMPTS.pop(key, None)


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
    - Disabled completely in production unless ENABLE_LEADERSHIP_DEMO_AUTH=true.
    - Enforces sliding window brute-force lockout (5 failed attempts per 5 minutes).
    - Never accepts caller-supplied role or client assignments; rejects privilege escalation.
    """
    rate_key = (payload.username or "").strip().lower()
    _check_rate_limit(rate_key)

    if not is_prototype_auth_enabled():
        raise HTTPException(
            status_code=403,
            detail="Session issuance is disabled in production environments without leadership demo authorization.",
        )

    try:
        user_entry = authenticate_prototype_user(payload.username, payload.credential)
    except HTTPException:
        _record_failed_attempt(rate_key)
        raise

    _record_successful_attempt(rate_key)
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
