"""
End-to-End FastAPI Route Integration Tests
"""

import os
import sys
import pytest
from fastapi.testclient import TestClient
from app.main import app

sys.path.insert(0, os.path.dirname(__file__))
from auth_helper import authenticate_test_client

client = TestClient(app)
client.headers.update(authenticate_test_client(client))

def test_root_status():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ONLINE"
    assert data["statutory_baseline"]["governing_law"] == "Income-tax Act, 1961 & Finance Act, 2024"

def test_health_check():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "HEALTHY"

def test_list_clients():
    res = client.get("/api/clients")
    assert res.status_code == 200
    clients = res.json()
    assert len(clients) >= 2
    pans = [c["pan"] for c in clients]
    assert "ABCPA1092F" in pans

def test_get_single_client():
    res = client.get("/api/clients/ABCPA1092F")
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Arun Kumar Verma"
    assert data["category"] == "Individual - Salaried"

def test_run_reconciliation():
    res = client.post("/api/reconcile/run", json={"client_pan": "ABCPA1092F", "assessment_year": "2025-26"})
    assert res.status_code == 200
    data = res.json()
    assert data["client_pan"] == "ABCPA1092F"
    assert len(data["rows"]) > 0

def test_export_cbdt_json():
    res = client.get("/api/export/cbdt-json/ABCPA1092F")
    assert res.status_code == 200
    data = res.json()
    assert "ITR" in data
    assert "ITR1" in data["ITR"]
    assert data["ITR"]["ITR1"]["PersonalInfo"]["PAN"] == "ABCPA1092F"

def test_export_excel_workpaper():
    res = client.get("/api/export/workpaper/ABCPA1092F")
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    assert len(res.content) > 1000  # Non-empty binary xlsx

def test_taxpayer_intake_workflow():
    # 1. Fetch initial intake
    res = client.get("/api/clients/ABCPA1092F/intake")
    assert res.status_code == 200
    data = res.json()
    assert data["pan"] == "ABCPA1092F"
    assert data["legal_type"] == "INDIVIDUAL"
    assert data["occupation_profile"] == "SALARIED"

    # 2. Update 5-head income discovery answers
    discovery_payload = {
        "salary": {"hasIncome": "YES", "hasMultipleEmployers": "NO"},
        "houseProperty": {"hasIncome": "NO"},
        "businessProfession": {"hasIncome": "NO"},
        "capitalGains": {"hasIncome": "YES", "tradedEquitiesOrMutualFunds": "YES"},
        "otherSources": {"hasIncome": "YES", "hasDividends": "YES"},
        "specialDisclosures": {"hasAgriculturalIncome": "NO", "hasCryptoOrVDA": "NO"},
        "previousYear": {"priorItrForm": "ITR-1 (Sahaj)", "priorRegime": "NEW"}
    }
    update_res = client.put("/api/clients/ABCPA1092F/intake", json=discovery_payload)
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["status"] == "SUCCESS"
    assert updated_data["intake_discovery"]["capitalGains"]["hasIncome"] == "YES"

    # Restore clean seeded salaried state for downstream Arun ITR-1 integration tests
    restore_res = client.put(
        "/api/clients/ABCPA1092F/intake",
        json={
            "salary": {"hasIncome": "YES", "hasMultipleEmployers": "NO"},
            "houseProperty": {"hasIncome": "NO"},
            "businessProfession": {"hasIncome": "NO"},
            "capitalGains": {"hasIncome": "NO"},
            "otherSources": {"hasIncome": "YES", "hasDividends": "YES"},
            "specialDisclosures": {
                "hasDirectorship": "NO",
                "holdsUnlistedShares": "NO",
                "hasForeignAssetsOrIncome": "NO",
                "hasAgriculturalIncome": "NO",
                "hasCryptoOrVDA": "NO",
            },
        },
    )
    assert restore_res.status_code == 200

