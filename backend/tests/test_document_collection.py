"""
Unit & Integration Tests for Step 05: Document Collection & Document Vault Integration
Covers:
- Dynamic Assessment Year determination
- Three-status architecture (Checklist, Processing, CA Review)
- Document Categories (FORM_16, 26AS, AIS, TIS, Bank Statements, Investment Proof, etc.)
- Multi-checklist mapping (one document satisfying multiple checklist items)
- Case ownership verification
- File integrity (SHA-256) and storage preservation
- Missing document request notice generation (draft outreach preview with disclaimer)
- Audit log tracking
"""

import pytest
import io
import json
from fastapi.testclient import TestClient
from app.main import app
from app.services.case_manager import case_manager

client = TestClient(app)

def test_get_client_documents():
    """Verify fetching seeded documents for Arun Kumar Verma."""
    response = client.get("/api/documents/ABCPA1092F")
    assert response.status_code == 200
    docs = response.json()
    assert isinstance(docs, list)
    assert len(docs) >= 1
    # Check status fields exist on records
    first_doc = docs[0]
    assert "processing_status" in first_doc
    assert "ca_review_status" in first_doc
    assert "checklist_item_ids" in first_doc
    assert "assessment_year" in first_doc
    assert first_doc["assessment_year"].startswith("AY")

def test_document_upload_with_sha256_and_multi_checklist():
    """Test valid file upload, SHA-256 hash calculation, dynamic AY, and multi-checklist linking."""
    dummy_pdf_content = b"%PDF-1.4 Mock document for investment proof under section 80C and medical 80D"
    test_file = io.BytesIO(dummy_pdf_content)

    payload_data = {
        "client_pan": "ABCPA1092F",
        "category": "INVESTMENT_PROOF",
        "case_id": "CASE-2025-001",
        "checklist_item_ids": json.dumps(["ded-80c-receipts", "ded-80d-mediclaim"]),
    }

    response = client.post(
        "/api/documents/upload",
        data=payload_data,
        files={"file": ("ELSS_and_Health_Receipts.pdf", test_file, "application/pdf")},
    )
    assert response.status_code == 200
    doc_data = response.json()
    assert doc_data["client_pan"] == "ABCPA1092F"
    assert doc_data["category"] == "INVESTMENT_PROOF"
    assert doc_data["ca_review_status"] == "PENDING_REVIEW"
    assert doc_data["processing_status"] == "PARSED"
    assert "ded-80c-receipts" in doc_data["checklist_item_ids"]
    assert "ded-80d-mediclaim" in doc_data["checklist_item_ids"]
    assert doc_data["file_hash_sha256"] is not None
    assert len(doc_data["file_hash_sha256"]) == 64
    assert doc_data["assessment_year"] == "AY 2025-26"

def test_document_upload_ownership_rejection():
    """Verify rejection when client PAN does not exist."""
    dummy_file = io.BytesIO(b"%PDF-1.4 content")
    response = client.post(
        "/api/documents/upload",
        data={"client_pan": "ZZZZZ9999Z", "category": "BANK_STATEMENT"},
        files={"file": ("Bank_Statement.pdf", dummy_file, "application/pdf")},
    )
    assert response.status_code == 403
    assert "ownership mismatch" in response.json()["detail"].lower() or "not found" in response.json()["detail"].lower()

def test_document_upload_disallows_invalid_extensions():
    """Verify rejection of non-whitelisted file formats."""
    dummy_script = io.BytesIO(b"echo 'malicious script'")
    response = client.post(
        "/api/documents/upload",
        data={"client_pan": "ABCPA1092F", "category": "OTHER_PROOF"},
        files={"file": ("malware.exe", dummy_script, "application/octet-stream")},
    )
    assert response.status_code == 400
    assert "unsupported file format" in response.json()["detail"].lower()

def test_update_ca_review_status():
    """Verify CA review status transition to VERIFIED and WAIVED."""
    # First upload a doc to test transitions
    dummy_file = io.BytesIO(b"%PDF-1.4 sample bank interest cert")
    upload_res = client.post(
        "/api/documents/upload",
        data={"client_pan": "ABCPA1092F", "category": "BANK_STATEMENT", "checklist_item_ids": "os-bank-interest"},
        files={"file": ("SBI_Interest_Certificate.pdf", dummy_file, "application/pdf")},
    )
    doc_id = upload_res.json()["id"]

    # 1. Update to VERIFIED
    verify_res = client.patch(
        f"/api/documents/{doc_id}/status",
        json={"ca_review_status": "VERIFIED", "review_notes": "Matches AIS interest transaction of Rs 18,450."},
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["ca_review_status"] == "VERIFIED"
    assert verify_res.json()["review_notes"] == "Matches AIS interest transaction of Rs 18,450."

    # 2. Update to WAIVED with reason
    waive_res = client.patch(
        f"/api/documents/{doc_id}/status",
        json={"ca_review_status": "WAIVED", "waive_reason": "Below statutory threshold; covered under TRACES credit."},
    )
    assert waive_res.status_code == 200
    assert waive_res.json()["ca_review_status"] == "WAIVED"
    assert waive_res.json()["waive_reason"] == "Below statutory threshold; covered under TRACES credit."

    # 3. Reject waive if no reason provided
    bad_waive = client.patch(
        f"/api/documents/{doc_id}/status",
        json={"ca_review_status": "WAIVED", "waive_reason": ""},
    )
    assert bad_waive.status_code == 400
    assert "mandatory" in bad_waive.json()["detail"].lower()

def test_request_missing_documents_generates_draft_preview_with_disclaimer():
    """Verify request missing documents generates draft notices and does NOT claim real transmission."""
    payload = {
        "client_pan": "ABCPA1092F",
        "case_id": "CASE-2025-001",
        "checklist_item_ids": ["hp-interest-cert", "cg-broker-statement"],
        "custom_notes": "Please provide annual home loan interest certificate from SBI before Friday.",
    }
    response = client.post("/api/documents/request-missing", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["recipient_name"] == "Arun Kumar Verma"
    assert data["is_simulated_dispatch"] is True
    assert "draft" in data["notice_disclaimer"].lower()
    assert "Housing Loan" in data["email_body"]
    assert "Capital Gains" in data["whatsapp_body"]
    assert "Friday" in data["email_body"]

    # Check audit trail recorded this action
    audit_res = client.get("/api/audit/logs")
    assert audit_res.status_code == 200
    audit_events = audit_res.json()
    assert any("MISSING_DOCS_REQUESTED" in evt.get("action", "") for evt in audit_events)
