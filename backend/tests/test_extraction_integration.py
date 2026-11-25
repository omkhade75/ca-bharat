"""
Step 06 Stage 2 Integration & Security Test Suite
Covers:
1. /api/auth/session privilege escalation prevention, server-side role mapping & prod disablement
2. Expired, tampered, malformed, and missing Bearer token rejections (401)
3. RBAC role restrictions, cross-client ownership denial, cross-case ownership denial (403)
4. Legacy PAN endpoint security across documents, clients, extract, reconcile, calculate, export, audit
5. Deterministic PDF extraction verification (Form 16, 26AS, AIS/TIS + custom non-Arun PDF)
6. Honest evidence_score & COORDINATE_LOCALIZATION_RATIO (no fabricated accuracy %)
7. Explicit distinction of SUPPORTED vs UNSUPPORTED_TYPE & corrupt/encrypted PDF handling
8. Repeated extraction idempotency & preservation of immutable original values + citations
9. CA field correction, verification, mandatory reason & persistence across DB session reloads
"""

import io
import os
import sys
import json
import base64
import tempfile
import fitz
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(__file__))
from auth_helper import authenticate_test_client

from app.main import app
from app.api.auth_context import create_signed_session_token
from app.db.session import SessionLocal
from app.db.repository import TaxpayerRepository
from app.services.case_manager import case_manager

unauth_client = TestClient(app)


def _make_custom_form16_pdf(pan: str, emp_name: str, salary_str: str, tds_str: str) -> bytes:
    """Generates a real vector PDF Form 16 in memory with non-default numbers for dynamic parser testing."""
    doc = fitz.open()
    p1 = doc.new_page()
    p1.insert_text((50, 60), "FORM NO. 16 - PART A", fontsize=12)
    p1.insert_text((50, 80), f"Name of Employer: {emp_name}", fontsize=10)
    p1.insert_text((50, 100), "TAN of Deductor: MUMX12345Z", fontsize=10)
    p1.insert_text((50, 120), f"PAN of Employee: {pan}", fontsize=10)
    p1.insert_text((50, 140), "Assessment Year: 2025-26", fontsize=10)
    p1.insert_text((50, 180), f"Total tax deducted at source: Rs. {tds_str}", fontsize=10)

    p2 = doc.new_page()
    p2.insert_text((50, 60), "FORM NO. 16 - PART B", fontsize=12)
    p2.insert_text((50, 100), f"(a) Salary as per provisions contained in sec 17(1): Rs. {salary_str}", fontsize=10)
    p2.insert_text((50, 130), "(a) Standard deduction under sec 16(ia): Rs. 75,000.00", fontsize=10)
    p2.insert_text((50, 160), "(a) Section 80C (Life Insurance, PPF): Rs. 1,00,000.00", fontsize=10)

    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


# ==============================================================================
# 1. AUTHENTICATION, ROLE ESCALATION & PRODUCTION DISABLEMENT TESTS
# ==============================================================================

def test_auth_session_rejects_anonymous_or_unverified_role_request():
    """Calling /api/auth/session without valid credentials or requesting CA_PARTNER blindly fails."""
    # Missing credentials (only role sent) -> 422 / 401
    res1 = unauth_client.post("/api/auth/session", json={"role": "CA_PARTNER"})
    assert res1.status_code in (401, 422)

    # Bad password for CA_PARTNER -> 401
    res2 = unauth_client.post(
        "/api/auth/session",
        json={"username": "ca.partner@cabharat.demo", "credential": "wrong-password"},
    )
    assert res2.status_code == 401


def test_auth_session_prevents_client_privilege_escalation():
    """Authenticated CLIENT cannot obtain a CA_PARTNER or CA_STAFF token even if requested in payload."""
    # Attempt escalation -> 403 Forbidden
    res_esc = unauth_client.post(
        "/api/auth/session",
        json={
            "username": "arun.verma@demo.in",
            "credential": "DemoArun!2026",
            "role": "CA_PARTNER",
        },
    )
    assert res_esc.status_code == 403
    assert "privilege escalation" in res_esc.json()["detail"].lower()

    # Normal login without role override -> server strictly assigns CLIENT + assigned client ID
    res_ok = unauth_client.post(
        "/api/auth/session",
        json={"username": "arun.verma@demo.in", "credential": "DemoArun!2026"},
    )
    assert res_ok.status_code == 200
    data = res_ok.json()
    assert data["role"] == "CLIENT"
    assert data["assigned_client_ids"] == ["client-arun-01"]


def test_auth_session_disabled_in_production(monkeypatch):
    """Prototype /api/auth/session must be disabled when ENVIRONMENT=production or RENDER=true."""
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.setenv("SESSION_SECRET_KEY", "unit-test-strong-prod-secret-key-2026")
    res = unauth_client.post(
        "/api/auth/session",
        json={"username": "ca.partner@cabharat.demo", "credential": "DemoPartner!2026"},
    )
    assert res.status_code == 403
    assert "disabled in production" in res.json()["detail"].lower()


def test_production_fails_closed_without_session_secret(monkeypatch):
    """In production without SESSION_SECRET_KEY, token verification must fail closed (503)."""
    token = create_signed_session_token("staff-partner-01", "CA Rajesh", "CA_PARTNER")
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.delenv("SESSION_SECRET_KEY", raising=False)
    res = unauth_client.get(
        "/api/documents/client/client-arun-01",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 503


# ==============================================================================
# 2. EXPIRED, TAMPERED, AND MALFORMED TOKEN TESTS
# ==============================================================================

def test_expired_and_tampered_tokens_rejected():
    """Expired tokens, tampered payloads, tampered signatures, and bad headers return 401."""
    # Expired token
    expired_tok = create_signed_session_token(
        "staff-partner-01", "CA Rajesh", "CA_PARTNER", ttl_seconds=-30
    )
    res_exp = unauth_client.get(
        "/api/documents/client/client-arun-01",
        headers={"Authorization": f"Bearer {expired_tok}"},
    )
    assert res_exp.status_code == 401
    assert "expired" in res_exp.json()["detail"].lower()

    # Tampered signature
    valid_tok = create_signed_session_token("usr-cli", "Arun", "CLIENT", ["client-arun-01"])
    bad_sig_tok = valid_tok[:-4] + ("0000" if valid_tok[-4:] != "0000" else "1111")
    assert unauth_client.get(
        "/api/documents/client/client-arun-01",
        headers={"Authorization": f"Bearer {bad_sig_tok}"},
    ).status_code == 401

    # Tampered payload attempting role upgrade from CLIENT to CA_PARTNER without re-signing
    payload_b64, sig = valid_tok.split(".")
    padded = payload_b64 + "=" * (-len(payload_b64) % 4)
    decoded = json.loads(base64.urlsafe_b64decode(padded).decode("utf-8"))
    decoded["role"] = "CA_PARTNER"
    forged_b64 = base64.urlsafe_b64encode(json.dumps(decoded).encode("utf-8")).decode("ascii").rstrip("=")
    assert unauth_client.get(
        "/api/documents/client/client-arun-01",
        headers={"Authorization": f"Bearer {forged_b64}.{sig}"},
    ).status_code == 401

    # Non-bearer scheme
    assert unauth_client.get(
        "/api/documents/client/client-arun-01",
        headers={"Authorization": "Basic dXNlcjpwYXNz"},
    ).status_code == 401


# ==============================================================================
# 3. RBAC, CROSS-CLIENT, CROSS-CASE & LEGACY PAN ENDPOINT SECURITY TESTS
# ==============================================================================

def test_cross_client_cross_case_and_role_boundaries():
    """Verify strict 403 enforcement across client IDs, case IDs, and CA-only operations."""
    arun_headers = authenticate_test_client(unauth_client, "arun.verma@demo.in", "DemoArun!2026")
    ca_headers = authenticate_test_client(unauth_client, "ca.partner@cabharat.demo", "DemoPartner!2026")

    # Arun CAN read his own documents in his allowed case
    assert unauth_client.get(
        "/api/documents/client/client-arun-01?case_id=case-arun-ay2526",
        headers=arun_headers,
    ).status_code == 200

    # Cross-client access denied (Arun -> Dr. Radhika)
    assert unauth_client.get(
        "/api/documents/client/client-radhika-02",
        headers=arun_headers,
    ).status_code == 403

    # Cross-case access denied (Arun -> unauthorized case ID)
    assert unauth_client.get(
        "/api/documents/client/client-arun-01?case_id=CASE-OTHER-999",
        headers=arun_headers,
    ).status_code == 403

    # CLIENT cannot run batch extraction, single extraction, field corrections, field verify, status change, or delete
    assert unauth_client.post(
        "/api/documents/extract-all",
        json={"client_id": "client-arun-01"},
        headers=arun_headers,
    ).status_code == 403

    assert unauth_client.post(
        "/api/documents/doc-arun-f16/extract",
        headers=arun_headers,
    ).status_code == 403

    assert unauth_client.patch(
        "/api/documents/doc-arun-f16/fields/gross_salary",
        json={"corrected_value": 9999999, "correction_reason": "Self edit attempt"},
        headers=arun_headers,
    ).status_code == 403

    assert unauth_client.patch(
        "/api/documents/doc-arun-f16/fields/gross_salary/verify",
        json={},
        headers=arun_headers,
    ).status_code == 403

    # Case mismatch on CA extraction rejected with 403
    assert unauth_client.post(
        "/api/documents/doc-arun-f16/extract?case_id=WRONG-CASE-ID",
        headers=ca_headers,
    ).status_code == 403


def test_legacy_pan_endpoints_cannot_bypass_auth_role_or_ownership():
    """All legacy PAN-based document, client, extract, reconcile, export, and audit endpoints enforce auth & ownership."""
    arun_headers = authenticate_test_client(unauth_client, "arun.verma@demo.in", "DemoArun!2026")

    # 1. Anonymous callers must be rejected with 401 on ALL legacy PAN routes
    legacy_get_routes = [
        "/api/documents/ABCPA1092F",
        "/api/clients",
        "/api/clients/ABCPA1092F",
        "/api/clients/ABCPA1092F/intake",
        "/api/reconcile/ABCPA1092F",
        "/api/calculate/ABCPA1092F",
        "/api/export/cbdt-json/ABCPA1092F",
        "/api/export/workpaper/ABCPA1092F",
        "/api/audit/logs",
    ]
    for route in legacy_get_routes:
        res = unauth_client.get(route)
        assert res.status_code == 401, f"Expected 401 on unauthenticated GET {route}, got {res.status_code}"

    # Unauthenticated POST / PATCH / DELETE on legacy routes
    assert unauth_client.post(
        "/api/documents/upload",
        data={"client_pan": "ABCPA1092F", "category": "BANK_STATEMENT"},
        files={"file": ("b.pdf", io.BytesIO(b"%PDF-1.4"), "application/pdf")},
    ).status_code == 401
    assert unauth_client.patch(
        "/api/documents/doc-arun-f16/status",
        json={"ca_review_status": "VERIFIED"},
    ).status_code == 401
    assert unauth_client.post(
        "/api/documents/request-missing",
        json={"client_pan": "ABCPA1092F", "checklist_item_ids": ["salary-form16"]},
    ).status_code == 401
    assert unauth_client.delete("/api/documents/doc-arun-f16").status_code == 401
    assert unauth_client.put("/api/clients/ABCPA1092F/intake", json={}).status_code == 401

    # 2. Cross-client access denied on legacy PAN routes (Arun querying Dr. Radhika's PAN)
    assert unauth_client.get("/api/documents/ABCPR5491M", headers=arun_headers).status_code == 403
    assert unauth_client.get("/api/clients/ABCPR5491M", headers=arun_headers).status_code == 403
    assert unauth_client.get("/api/clients/ABCPR5491M/intake", headers=arun_headers).status_code == 403
    assert unauth_client.put("/api/clients/ABCPR5491M/intake", json={}, headers=arun_headers).status_code == 403
    assert unauth_client.get("/api/reconcile/ABCPR5491M", headers=arun_headers).status_code == 403
    assert unauth_client.get("/api/export/cbdt-json/ABCPR5491M", headers=arun_headers).status_code == 403

    # 3. Unknown PAN probing by CLIENT must return 403 (not leak existence via 404)
    assert unauth_client.get("/api/documents/ZZZZZ9999Z", headers=arun_headers).status_code == 403
    assert unauth_client.get("/api/clients/ZZZZZ9999Z", headers=arun_headers).status_code == 403

    # 4. CLIENT /api/clients listing scoped strictly to owned records
    cli_list = unauth_client.get("/api/clients", headers=arun_headers)
    assert cli_list.status_code == 200
    returned_ids = [c["id"] for c in cli_list.json()]
    assert returned_ids == ["client-arun-01"]

    # 5. CLIENT blocked from CA-only legacy actions
    assert unauth_client.patch(
        "/api/documents/doc-arun-f16/status",
        json={"ca_review_status": "VERIFIED"},
        headers=arun_headers,
    ).status_code == 403
    assert unauth_client.post(
        "/api/documents/request-missing",
        json={"client_pan": "ABCPA1092F", "checklist_item_ids": ["salary-form16"]},
        headers=arun_headers,
    ).status_code == 403
    assert unauth_client.delete("/api/documents/doc-arun-f16", headers=arun_headers).status_code == 403
    assert unauth_client.get("/api/audit/logs", headers=arun_headers).status_code == 403
    assert unauth_client.post(
        "/api/extract/form16",
        data={"client_pan": "ABCPA1092F"},
        files={"file": ("f16.pdf", io.BytesIO(b"%PDF-1.4"), "application/pdf")},
        headers=arun_headers,
    ).status_code == 403


# ==============================================================================
# 4. EXTRACTION ACCURACY, EVIDENCE SCORE, UNSUPPORTED TYPES & DB RELOAD CONSISTENCY
# ==============================================================================

def test_real_sample_pdfs_extraction_evidence_and_custom_pdf_dynamic_parsing():
    """Verify deterministic extraction against real sample PDFs AND a custom non-Arun PDF."""
    ca_headers = authenticate_test_client(unauth_client, "ca.partner@cabharat.demo", "DemoPartner!2026")
    created_ids = []

    try:
        # 1. Form 16 sample PDF
        with open("backend/sample_data/Form16_Arun_TCS.pdf", "rb") as f:
            r1 = unauth_client.post(
                "/api/documents/upload",
                data={"client_id": "client-arun-01", "case_id": "case-arun-ay2526", "category": "FORM_16"},
                files={"file": ("Sample_Form16.pdf", f, "application/pdf")},
                headers=ca_headers,
            )
        assert r1.status_code == 200
        d1 = r1.json()
        created_ids.append(d1["id"])
        assert d1["extraction_engine"] == "DETERMINISTIC_PDF"
        assert d1["extraction_supported"] is True
        assert d1["evidence_methodology"] == "COORDINATE_LOCALIZATION_RATIO"
        assert d1["evidence_score"] == 1.0
        assert "ocr_confidence" not in d1
        assert d1["processing_status"] == "PARSED"
        assert d1["ca_review_status"] == "PENDING_REVIEW"

        # Verify against PDF expected figures
        part_b = d1["extracted_data"]["part_b"]
        assert part_b["salary_us_17_1"] == 1485000.0
        assert part_b["perquisites_us_17_2"] == 35000.0
        assert part_b["standard_deduction_us_16ia"] == 75000.0
        assert part_b["professional_tax_us_16iii"] == 2400.0
        assert part_b["total_chapter_via"] == 235000.0
        assert d1["extracted_data"]["part_a"]["total_tax_deposited"] == 118560.0

        # Verify citations carry document name, page_number, non-zero bounding box, evidence_score
        assert len(d1["citations"]) >= 6
        sal_cit = next(c for c in d1["citations"] if c["field_name"] == "Salary u/s 17(1)")
        assert sal_cit["document_name"] == "Sample_Form16.pdf"
        assert sal_cit["page_number"] == 2
        assert sal_cit["evidence_status"] == "COORDINATE_VERIFIED"
        assert sal_cit["evidence_score"] == 1.0
        assert any(coord > 0 for coord in sal_cit["bounding_box"])

        # 2. Form 26AS & AIS sample PDFs
        with open("backend/sample_data/Form26AS_Arun.pdf", "rb") as f26:
            r2 = unauth_client.post(
                "/api/documents/upload",
                data={"client_id": "client-arun-01", "case_id": "case-arun-ay2526", "category": "FORM_26AS"},
                files={"file": ("Sample_26AS.pdf", f26, "application/pdf")},
                headers=ca_headers,
            )
        assert r2.status_code == 200
        d2 = r2.json()
        created_ids.append(d2["id"])
        assert d2["extracted_data"]["total_tds_credit_claimed"] == 123180.0
        assert d2["evidence_score"] == 1.0

        with open("backend/sample_data/AIS_TIS_Arun.pdf", "rb") as fais:
            r3 = unauth_client.post(
                "/api/documents/upload",
                data={"client_id": "client-arun-01", "case_id": "case-arun-ay2526", "category": "AIS"},
                files={"file": ("Sample_AIS.pdf", fais, "application/pdf")},
                headers=ca_headers,
            )
        assert r3.status_code == 200
        d3 = r3.json()
        created_ids.append(d3["id"])
        codes = {itm["info_code"]: itm for itm in d3["extracted_data"]["items"]}
        assert codes["INT-SAV"]["gross_amount"] == 18400.0
        assert codes["DIV-001"]["gross_amount"] == 24500.0
        assert codes["SFT-017"]["gross_amount"] == 185000.0

        # 3. Custom dynamic PDF proving non-hardcoded extraction
        custom_bytes = _make_custom_form16_pdf("ABCPA1092F", "Infosys Technologies Ltd", "9,25,000.00", "42,100.00")
        r_cust = unauth_client.post(
            "/api/documents/upload",
            data={"client_id": "client-arun-01", "case_id": "case-arun-ay2526", "category": "FORM_16"},
            files={"file": ("Custom_Form16.pdf", io.BytesIO(custom_bytes), "application/pdf")},
            headers=ca_headers,
        )
        assert r_cust.status_code == 200
        dc = r_cust.json()
        created_ids.append(dc["id"])
        assert dc["extracted_data"]["part_a"]["employer_name"] == "Infosys Technologies Ltd"
        assert dc["extracted_data"]["part_b"]["salary_us_17_1"] == 925000.0
        assert dc["extracted_data"]["part_a"]["total_tax_deposited"] == 42100.0
        assert dc["extracted_data"]["part_b"]["total_chapter_via"] == 100000.0
    finally:
        for did in created_ids:
            unauth_client.delete(f"/api/documents/{did}", headers=ca_headers)


def test_unsupported_document_types_and_image_uploads_distinguished():
    """Unsupported types and raster images explicitly mark extraction_supported=False and evidence_score=None."""
    ca_headers = authenticate_test_client(unauth_client, "ca.partner@cabharat.demo", "DemoPartner!2026")
    created_ids = []

    try:
        # Bank statement (unsupported type)
        r_bank = unauth_client.post(
            "/api/documents/upload",
            data={"client_id": "client-arun-01", "case_id": "case-arun-ay2526", "category": "BANK_STATEMENT"},
            files={"file": ("Bank_Statement.pdf", io.BytesIO(b"%PDF-1.4 statement"), "application/pdf")},
            headers=ca_headers,
        )
        assert r_bank.status_code == 200
        dbank = r_bank.json()
        created_ids.append(dbank["id"])
        assert dbank["extraction_engine"] == "UNSUPPORTED_TYPE"
        assert dbank["extraction_supported"] is False
        assert dbank["evidence_score"] is None

        # Explicit re-extract call on unsupported document
        r_ext = unauth_client.post(f"/api/documents/{dbank['id']}/extract", headers=ca_headers)
        assert r_ext.status_code == 200
        dext = r_ext.json()
        assert dext["extraction_engine"] == "UNSUPPORTED_TYPE"
        assert dext["extraction_supported"] is False
        assert dext["processing_status"] == "UPLOADED"
        assert dext["evidence_score"] is None

        # PNG image uploaded under FORM_16 -> not a vector PDF, marked UNSUPPORTED_TYPE
        r_img = unauth_client.post(
            "/api/documents/upload",
            data={"client_id": "client-arun-01", "category": "FORM_16"},
            files={"file": ("scan.png", io.BytesIO(b"\x89PNG\r\n\x1a\nfake"), "image/png")},
            headers=ca_headers,
        )
        assert r_img.status_code == 200
        dimg = r_img.json()
        created_ids.append(dimg["id"])
        assert dimg["extraction_engine"] == "UNSUPPORTED_TYPE"
        assert dimg["extraction_supported"] is False
        assert dimg["evidence_score"] is None

        # Corrupt PDF under FORM_16 -> PARSING_FAILED gracefully (no crash)
        r_bad = unauth_client.post(
            "/api/documents/upload",
            data={"client_id": "client-arun-01", "category": "FORM_16"},
            files={"file": ("corrupt.pdf", io.BytesIO(b"not-valid-pdf"), "application/pdf")},
            headers=ca_headers,
        )
        assert r_bad.status_code == 200
        dbad = r_bad.json()
        created_ids.append(dbad["id"])
        assert dbad["processing_status"] == "PARSING_FAILED"
        assert dbad["evidence_score"] == 0.0
    finally:
        for did in created_ids:
            unauth_client.delete(f"/api/documents/{did}", headers=ca_headers)


def test_repeated_extraction_ca_corrections_and_db_reload_persistence():
    """
    Tests:
    - CA field corrections & verification preserve immutable original extracted values + original citations
    - Repeated extraction runs remain consistent AND do not overwrite CA correction history
    - Document status and CA review status stay cleanly decoupled
    - Re-querying via fresh SQLAlchemy SessionLocal() confirms full DB persistence across reloads
    """
    ca_headers = authenticate_test_client(unauth_client, "ca.partner@cabharat.demo", "DemoPartner!2026")
    staff_headers = authenticate_test_client(unauth_client, "ca.staff@cabharat.demo", "DemoStaff!2026")

    with open("backend/sample_data/Form16_Arun_TCS.pdf", "rb") as f:
        up = unauth_client.post(
            "/api/documents/upload",
            data={"client_id": "client-arun-01", "case_id": "case-arun-ay2526", "category": "FORM_16"},
            files={"file": ("Reload_Verify_Form16.pdf", f, "application/pdf")},
            headers=ca_headers,
        )
    assert up.status_code == 200
    doc_id = up.json()["id"]

    try:
        # 1. CA Staff corrects Salary 17(1) once, then CA Partner corrects again
        r_edit1 = unauth_client.patch(
            f"/api/documents/{doc_id}/fields/part_b.salary_us_17_1",
            json={"corrected_value": 1500000.0, "correction_reason": "Variable pay addendum confirmed"},
            headers=staff_headers,
        )
        assert r_edit1.status_code == 200

        r_edit2 = unauth_client.patch(
            f"/api/documents/{doc_id}/fields/part_b.salary_us_17_1",
            json={"corrected_value": 1512000.0, "correction_reason": "Joining bonus adjustment verified"},
            headers=ca_headers,
        )
        assert r_edit2.status_code == 200

        # 2. CA verifies Standard Deduction 16(ia)
        r_ver = unauth_client.patch(
            f"/api/documents/{doc_id}/fields/part_b.standard_deduction_us_16ia/verify",
            json={},
            headers=ca_headers,
        )
        assert r_ver.status_code == 200

        # 3. Repeated extraction run
        r_reext = unauth_client.post(f"/api/documents/{doc_id}/extract", headers=ca_headers)
        assert r_reext.status_code == 200
        re_data = r_reext.json()

        # Verify original immutable values + citations remained unchanged after repeated extraction
        assert re_data["extracted_data"]["part_b"]["salary_us_17_1"] == 1485000.0
        sal_cits = [c for c in re_data["citations"] if c["field_name"] == "Salary u/s 17(1)"]
        assert len(sal_cits) == 1
        assert sal_cits[0]["page_number"] == 2
        assert sal_cits[0]["raw_text"] == "14,85,000.00"

        # Verify corrections survived repeated extraction
        corr = re_data["corrected_fields"]["part_b.salary_us_17_1"]
        assert corr["original_value"] == 1485000.0
        assert corr["corrected_value"] == 1512000.0
        assert corr["corrected_by"] == "CA Rajesh Sharma (Partner)"
        assert corr["correction_reason"] == "Joining bonus adjustment verified"
        assert len(corr["correction_history"]) == 2
        assert corr["correction_history"][0]["corrected_by_role"] == "CA_STAFF"
        assert corr["correction_history"][1]["corrected_by_role"] == "CA_PARTNER"
        assert corr["original_citation"]["raw_text"] == "14,85,000.00"
        assert re_data["corrected_fields"]["part_b.standard_deduction_us_16ia"]["review_status"] == "VERIFIED"

        # 4. Update document CA review status separately from processing_status
        r_stat = unauth_client.patch(
            f"/api/documents/{doc_id}/status",
            json={"ca_review_status": "VERIFIED", "review_notes": "Finalized post correction"},
            headers=ca_headers,
        )
        assert r_stat.status_code == 200
        assert r_stat.json()["processing_status"] == "PARSED"
        assert r_stat.json()["ca_review_status"] == "VERIFIED"

        # 5. Simulate DB reload using a fresh SQLAlchemy SessionLocal() + fresh GET API call
        fresh_db = SessionLocal()
        try:
            fresh_repo = TaxpayerRepository(fresh_db)
            db_row = fresh_repo.get_document_by_id(doc_id)
            assert db_row is not None
            reloaded_orig = json.loads(db_row.extracted_data_json)
            reloaded_corr = json.loads(db_row.corrected_fields_json)
            reloaded_cits = json.loads(db_row.citations_json)

            assert reloaded_orig["part_b"]["salary_us_17_1"] == 1485000.0
            assert reloaded_corr["part_b.salary_us_17_1"]["original_value"] == 1485000.0
            assert reloaded_corr["part_b.salary_us_17_1"]["corrected_value"] == 1512000.0
            assert len(reloaded_corr["part_b.salary_us_17_1"]["correction_history"]) == 2
            assert any(c["field_name"] == "Salary u/s 17(1)" for c in reloaded_cits)
            assert db_row.ca_review_status == "VERIFIED"
            assert db_row.processing_status == "PARSED"
        finally:
            fresh_db.close()

        # Also check authenticated client API fetch reloads consistent records
        api_list = unauth_client.get(
            "/api/documents/client/client-arun-01?case_id=case-arun-ay2526",
            headers=ca_headers,
        )
        assert api_list.status_code == 200
        match = next(d for d in api_list.json() if d["id"] == doc_id)
        assert match["extracted_data"]["part_b"]["salary_us_17_1"] == 1485000.0
        assert match["corrected_fields"]["part_b.salary_us_17_1"]["corrected_value"] == 1512000.0
    finally:
        unauth_client.delete(f"/api/documents/{doc_id}", headers=ca_headers)
