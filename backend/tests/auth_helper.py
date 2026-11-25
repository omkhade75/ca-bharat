"""
Shared authentication helper for backend integration test suites.
Obtains signed bearer tokens via server-side verified non-production test credentials.
"""

from fastapi.testclient import TestClient


def authenticate_test_client(
    test_client: TestClient,
    username: str = "ca.partner@cabharat.demo",
    credential: str = "DemoPartner!2026",
) -> dict:
    """Authenticates via POST /api/auth/session and returns Authorization headers."""
    res = test_client.post(
        "/api/auth/session",
        json={"username": username, "credential": credential},
    )
    assert res.status_code == 200, f"Test authentication failed: {res.text}"
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
