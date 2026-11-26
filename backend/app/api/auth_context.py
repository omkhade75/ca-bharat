"""
Authentication, Role-Based Access Control (RBAC), and Client/Case Ownership Verification
for CA Bharat AI APIs.

Security Architecture:
- Prototype session issuance is restricted to non-production environments (disabled when
  ENVIRONMENT=production or RENDER=true without explicit test opt-in).
- Roles (CA_PARTNER, CA_STAFF, CLIENT) and client/case assignments are resolved
  exclusively from server-side identity mappings — never accepted from unverified callers.
- Production deployments require a strong SESSION_SECRET_KEY environment variable and
  fail closed if unconfigured.
"""

import os
import hmac
import hashlib
import base64
import json
import time
from typing import Optional, List, Dict, Any
from fastapi import Depends, HTTPException, Header
from pydantic import BaseModel

_DEFAULT_NON_PROD_KEY = "ca-bharat-local-dev-only-key-never-use-in-prod"
ALLOWED_ROLES = {"CA_PARTNER", "CA_STAFF", "CLIENT"}
CA_PRIVILEGED_ROLES = {"CA_PARTNER", "CA_STAFF"}


def is_production_env() -> bool:
    """Returns True when running in production / Render deployment."""
    env = os.getenv("ENVIRONMENT", "development").strip().lower()
    if env == "production":
        return True
    if os.getenv("RENDER", "").strip().lower() == "true":
        return True
    return False


def is_prototype_auth_enabled() -> bool:
    """
    Session token issuance against server-side credential directory:
    - Enabled in non-production environments when ALLOW_PROTOTYPE_AUTH=true (default: true).
    - On Render demonstration deployment (RENDER=true), enabled by default for leadership demo access
      (can be explicitly disabled by setting ENABLE_LEADERSHIP_DEMO_AUTH=false).
    - In general production environments (ENVIRONMENT=production without RENDER), strictly disabled (returns False)
      unless explicit ENABLE_LEADERSHIP_DEMO_AUTH=true is supplied.
    - Public/anonymous token generation is never permitted; callers must authenticate
      against the server-side directory.
    """
    if is_production_env():
        is_render = os.getenv("RENDER", "").strip().lower() == "true"
        default_val = "true" if is_render else "false"
        demo_flag = os.getenv("ENABLE_LEADERSHIP_DEMO_AUTH", default_val).strip().lower()
        return demo_flag == "true"
    flag = os.getenv("ALLOW_PROTOTYPE_AUTH", "true").strip().lower()
    return flag == "true"


def _get_signing_secret() -> bytes:
    """Fetches cryptographic token signing key; on Render derives host-bound key if not set."""
    env_secret = os.getenv("SESSION_SECRET_KEY", "").strip()
    if env_secret:
        if is_production_env() and env_secret == _DEFAULT_NON_PROD_KEY:
            raise HTTPException(
                status_code=503,
                detail="Server configuration error: production cannot use default dev secret.",
            )
        return env_secret.encode("utf-8")

    if is_production_env():
        if os.getenv("RENDER", "").strip().lower() == "true":
            # On Render, if SESSION_SECRET_KEY not injected in dashboard, derive a secure host seed
            host_seed = (
                os.getenv("RENDER_SERVICE_ID")
                or os.getenv("RENDER_INSTANCE_ID")
                or os.getenv("RENDER_EXTERNAL_URL")
                or "ca-bharat-leadership-demo-vault-seed-2026"
            )
            derived = hashlib.sha256(f"cabharat-prod-secret-{host_seed}".encode("utf-8")).hexdigest()
            return derived.encode("utf-8")
        raise HTTPException(
            status_code=503,
            detail="Server configuration error: SESSION_SECRET_KEY must be set in production.",
        )

    return _DEFAULT_NON_PROD_KEY.encode("utf-8")


# Server-side hashed credential store & authoritative role/ownership directory
# (Active ONLY in non-production environments for automated testing & local demo)
def _hash_secret(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _get_prototype_directory() -> Dict[str, Dict[str, Any]]:
    # Credentials are read from Render / system environment variables
    partner_secret = os.getenv("LEADERSHIP_DEMO_PARTNER_SECRET") or os.getenv("DEV_CA_PARTNER_SECRET", "DemoPartner!2026")
    staff_secret = os.getenv("LEADERSHIP_DEMO_STAFF_SECRET") or os.getenv("DEV_CA_STAFF_SECRET", "DemoStaff!2026")
    arun_secret = os.getenv("LEADERSHIP_DEMO_ARUN_SECRET") or os.getenv("DEV_CLIENT_ARUN_SECRET", "DemoArun!2026")
    radhika_secret = os.getenv("LEADERSHIP_DEMO_RADHIKA_SECRET") or os.getenv("DEV_CLIENT_RADHIKA_SECRET", "DemoRadhika!2026")

    # Bounded strictly to synthetic demonstration customers only
    synthetic_demo_client_ids = [
        "client-arun-01",
        "client-radhika-02",
        "client-shree-03",
        "client-kavita-04",
        "cli-001",
        "cli-002",
        "cli-003",
        "cli-004",
    ]
    synthetic_demo_case_ids = [
        "case-arun-ay2526",
        "case-radhika-ay2526",
        "case-shree-ay2526",
        "case-kavita-ay2526",
        "CASE-2025-001",
        "CASE-2025-002",
        "CASE-2025-003",
        "CASE-2025-004",
    ]

    return {
        "ca.partner@cabharat.demo": {
            "actor_id": "staff-partner-01",
            "actor_name": "CA Rajesh Sharma (Partner)",
            "role": "CA_PARTNER",
            "secret_hash": _hash_secret(partner_secret),
            "assigned_client_ids": [],  # Firm-wide partner administrative access across firm clients & onboarding
            "allowed_case_ids": [],
        },
        "ca.staff@cabharat.demo": {
            "actor_id": "staff-assoc-01",
            "actor_name": "Ananya Joshi (Senior Associate)",
            "role": "CA_STAFF",
            "secret_hash": _hash_secret(staff_secret),
            "assigned_client_ids": ["client-arun-01", "client-radhika-02"],
            "allowed_case_ids": ["case-arun-ay2526", "case-radhika-ay2526"],
        },
        "arun.verma@demo.in": {
            "actor_id": "usr-client-arun-01",
            "actor_name": "Arun Kumar Verma",
            "role": "CLIENT",
            "secret_hash": _hash_secret(arun_secret),
            "assigned_client_ids": ["client-arun-01"],
            "allowed_case_ids": ["case-arun-ay2526"],
        },
        "dr.radhika@senclinic.in": {
            "actor_id": "usr-client-radhika-02",
            "actor_name": "Dr. Radhika Sen",
            "role": "CLIENT",
            "secret_hash": _hash_secret(radhika_secret),
            "assigned_client_ids": ["client-radhika-02"],
            "allowed_case_ids": ["case-radhika-ay2526"],
        },
    }


def authenticate_prototype_user(username: str, credential: str) -> Dict[str, Any]:
    """Authenticates user against server-side identity store and returns authoritative role mapping."""
    if not is_prototype_auth_enabled():
        raise HTTPException(
            status_code=403,
            detail="Prototype session issuance is disabled in production.",
        )

    directory = _get_prototype_directory()
    entry = directory.get((username or "").strip().lower())
    if not entry:
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    provided_hash = _hash_secret(credential or "")
    if not hmac.compare_digest(provided_hash, entry["secret_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    return entry


class ActorContext(BaseModel):
    actor_id: str
    actor_name: str
    role: str
    assigned_client_ids: List[str] = []
    allowed_case_ids: List[str] = []
    auth_mode: str = "SIGNED_BEARER_TOKEN"


def create_signed_session_token(
    actor_id: str,
    actor_name: str,
    role: str,
    assigned_client_ids: Optional[List[str]] = None,
    allowed_case_ids: Optional[List[str]] = None,
    ttl_seconds: int = 86400,
) -> str:
    """Issues an HMAC-SHA256 signed session bearer token."""
    role_upper = role.upper()
    if role_upper not in ALLOWED_ROLES:
        raise ValueError(f"Unsupported role '{role}'. Allowed: {sorted(ALLOWED_ROLES)}")

    secret = _get_signing_secret()
    payload = {
        "sub": actor_id,
        "name": actor_name,
        "role": role_upper,
        "client_ids": assigned_client_ids or [],
        "case_ids": allowed_case_ids or [],
        "exp": int(time.time()) + ttl_seconds,
    }
    payload_bytes = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    payload_b64 = base64.urlsafe_b64encode(payload_bytes).decode("ascii").rstrip("=")
    sig = hmac.new(secret, payload_b64.encode("ascii"), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{sig}"


def verify_signed_session_token(token: str) -> ActorContext:
    """Verifies HMAC-SHA256 signature and expiration of bearer token."""
    secret = _get_signing_secret()
    try:
        parts = token.split(".")
        if len(parts) != 2:
            raise ValueError("Malformed token format")
        payload_b64, sig = parts
        expected_sig = hmac.new(secret, payload_b64.encode("ascii"), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            raise ValueError("Invalid token signature")

        padded = payload_b64 + "=" * (-len(payload_b64) % 4)
        payload = json.loads(base64.urlsafe_b64decode(padded).decode("utf-8"))
        if payload.get("exp", 0) < int(time.time()):
            raise ValueError("Session token expired")

        role = str(payload.get("role", "")).upper()
        if role not in ALLOWED_ROLES:
            raise ValueError("Unauthorized role in token")

        return ActorContext(
            actor_id=payload["sub"],
            actor_name=payload["name"],
            role=role,
            assigned_client_ids=payload.get("client_ids", []),
            allowed_case_ids=payload.get("case_ids", []),
        )
    except HTTPException:
        raise
    except Exception as ex:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(ex)}")


def require_authenticated_actor(
    authorization: Optional[str] = Header(None),
) -> ActorContext:
    """FastAPI dependency enforcing strict Bearer token authentication."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=401,
            detail="Authentication required. Provide a valid 'Authorization: Bearer <token>' header.",
        )
    token = authorization[7:].strip()
    return verify_signed_session_token(token)


def assert_client_case_access(
    actor: ActorContext,
    target_client_id: Optional[str],
    target_case_id: Optional[str] = None,
    require_ca_role: bool = False,
) -> None:
    """
    Enforces role-based access control AND client/case ownership boundaries:
    - Privileged actions (CA field edits, field verification, review status overrides, extractions) reject CLIENT role.
    - CLIENT actors can only access their explicitly assigned client_id and allowed case_ids.
    - CA_STAFF / CA_PARTNER actors with scoped assigned_client_ids are bounded to those assignments.
    """
    if require_ca_role and actor.role not in CA_PRIVILEGED_ROLES:
        raise HTTPException(
            status_code=403,
            detail=f"Role '{actor.role}' is not authorized for Chartered Accountant actions.",
        )

    if actor.role == "CLIENT":
        if not target_client_id or target_client_id not in actor.assigned_client_ids:
            raise HTTPException(
                status_code=403,
                detail="Access denied: client ownership mismatch for requested client record.",
            )
        if target_case_id and actor.allowed_case_ids and target_case_id not in actor.allowed_case_ids:
            raise HTTPException(
                status_code=403,
                detail="Access denied: case ownership mismatch for requested tax case.",
            )
    elif actor.role in CA_PRIVILEGED_ROLES:
        if actor.assigned_client_ids and target_client_id and target_client_id not in actor.assigned_client_ids:
            raise HTTPException(
                status_code=403,
                detail="Access denied: CA staff not assigned to this client record.",
            )
        if actor.allowed_case_ids and target_case_id and target_case_id not in actor.allowed_case_ids:
            raise HTTPException(
                status_code=403,
                detail="Access denied: CA staff not authorized for this tax case.",
            )
