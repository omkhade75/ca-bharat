"""
End-to-End FastAPI Route Integration Tests
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

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
