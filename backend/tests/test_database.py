"""
Unit & Integration Tests for Database Models and Repository Layer
Verifies SQLite/PostgreSQL schema integrity and statutory taxpayer operations.
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.models import Base
from app.db.repository import TaxpayerRepository
from app.db.seed import seed_initial_data

@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSession()
    seed_initial_data(db)
    try:
        yield db
    finally:
        db.close()

def test_seeded_taxpayers(test_db):
    repo = TaxpayerRepository(test_db)
    clients = repo.get_all_clients()
    assert len(clients) >= 2
    pans = [c.pan for c in clients]
    assert "ABCPA1092F" in pans
    assert "ABCPR5491M" in pans

def test_create_and_fetch_taxpayer(test_db):
    repo = TaxpayerRepository(test_db)
    client_data = {
        "id": "test-c-01",
        "pan": "AAACH4490K",
        "name": "Harish Chandra Singhania HUF",
        "category": "Hindu Undivided Family (HUF)",
        "tier": "Silver",
        "recommended_itr": "ITR-2",
        "email": "huf@singhania.in",
        "status": "Onboarding",
    }
    created = repo.create_or_update_client(client_data)
    assert created.pan == "AAACH4490K"
    assert created.name == "Harish Chandra Singhania HUF"

    fetched = repo.get_client_by_pan("AAACH4490K")
    assert fetched is not None
    assert fetched.recommended_itr == "ITR-2"

def test_document_persistence(test_db):
    repo = TaxpayerRepository(test_db)
    doc = repo.save_document(
        pan="ABCPA1092F",
        filename="Form16_Test.pdf",
        category="FORM_16",
        page_count=3,
        extracted_data={"gross_salary": 1200000.0},
        citations={"gross_salary": {"page": 1, "box": [10, 10, 100, 20]}},
    )
    assert doc.id.startswith("doc-ABCPA1092F-")
    docs = repo.get_documents_by_pan("ABCPA1092F")
    assert len(docs) >= 1

def test_reconciliation_persistence(test_db):
    repo = TaxpayerRepository(test_db)
    items = [
        {
            "source_a": "Form 16",
            "source_b": "26AS",
            "field_name": "TDS Credit",
            "amount_a": 100000.0,
            "amount_b": 100000.0,
            "variance": 0.0,
            "status": "MATCH",
            "notice_risk": "LOW",
        }
    ]
    repo.set_reconciliation_items("ABCPA1092F", items)
    stored = repo.get_reconciliation_items_by_pan("ABCPA1092F")
    assert len(stored) == 1
    assert stored[0].field_name == "TDS Credit"

def test_audit_log_persistence(test_db):
    repo = TaxpayerRepository(test_db)
    log = repo.add_audit_log(
        actor="CA Rajesh Sharma",
        action="TEST_ACTION",
        details="Tested database audit stream",
        pan="ABCPA1092F",
    )
    assert log.id.startswith("log-")
    logs = repo.get_all_audit_logs()
    assert any(l.action == "TEST_ACTION" for l in logs)
