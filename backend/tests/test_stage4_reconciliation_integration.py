"""
Stage 4 Integration Tests: Complete Backend Extraction -> Reconciliation -> Tax Computation Flow
Covers:
1. End-to-end extraction-to-reconciliation flow (no frontend mock constants)
2. Mismatch detection across Form 16, Form 26AS, and AIS/TIS with real source citations
3. CA document correction propagation into reconciliation while preserving immutable originals
4. CA discrepancy review, resolution, audit logs, and DB reload persistence
5. RBAC role enforcement (401/403) and cross-client access denial
6. Validated backend data gating for deterministic tax computation & CA sign-off
"""

import io
import os
import sys
import fitz
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(__file__))
from auth_helper import authenticate_test_client

from app.main import app
from app.db.session import SessionLocal
from app.db.repository import TaxpayerRepository

unauth_client = TestClient(app)


def _build_pdf_bytes(lines: list[str]) -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    y = 60
    for line in lines:
        page.insert_text((50, y), line, fontsize=10)
        y += 22
    data = doc.tobytes()
    doc.close()
    return data


def _create_isolated_stage4_client(client_id: str, pan: str, name: str, partner_headers: dict):
    payload = {
        "id": client_id,
        "pan": pan,
        "name": name,
        "legal_type": "INDIVIDUAL",
        "occupation_profile": "SALARIED",
        "category": "Individual - Salaried",
        "recommended_itr": "ITR-1 (Sahaj)",
        "email": f"{client_id}@test.in",
        "mobile": "+91 98000 11223",
    }
    res = unauth_client.post("/api/clients", json=payload, headers=partner_headers)
    assert res.status_code == 200


def test_stage4_extraction_to_reconciliation_mismatch_correction_and_tax_flow():
    """
    Tests full pipeline on a clean taxpayer profile:
    Upload F16 + 26AS + AIS PDFs (with deliberate Salary TDS mismatch) -> Extract ->
    Reconcile -> Verify mismatch + citations -> Apply CA correction on F16 -> Re-reconcile
    (preserving immutable originals) -> Resolve AIS items -> Calculate tax -> CA sign-off.
    """
    partner_headers = authenticate_test_client(unauth_client)
    client_id = "cli-stage4-flow"
    pan = "AAACF8821K"
    case_id = "case-stage4-flow-ay2526"
    _create_isolated_stage4_client(client_id, pan, "Vikram Deshmukh", partner_headers)

    # 0. Before any parsed docs exist: tax endpoint returns validation gate NO_EXTRACTED_DOCS (no fake mock income!)
    pre_calc = unauth_client.get(f"/api/calculate/client/{client_id}?case_id={case_id}", headers=partner_headers)
    assert pre_calc.status_code == 200
    pre_data = pre_calc.json()
    assert pre_data["validation_status"] == "NO_EXTRACTED_DOCS"
    assert pre_data["new_regime"]["gross_total_income"] == 0.0

    # Sign-off must be blocked when no parsed docs exist
    blocked_sign = unauth_client.post(
        f"/api/calculate/client/{client_id}/sign-off",
        json={"case_id": case_id, "chosen_regime": "NEW_REGIME_115BAC", "verification_notes": "Attempt early approval"},
        headers=partner_headers,
    )
    assert blocked_sign.status_code == 400

    # 1. Upload realistic Form 16 (Salary 18,00,000, TDS 1,40,000), Form 26AS (Salary 18,00,000, TDS 1,25,000 -> MISMATCH!), and AIS (INT-SAV 22,000)
    f16_pdf = _build_pdf_bytes([
        "FORM NO. 16 - PART A & B",
        "Name of Employer: Infosys Limited",
        "TAN of Deductor: BLRI01234A",
        f"PAN of Employee: {pan}",
        "Assessment Year: 2025-26",
        "Total tax deducted at source: Rs. 1,40,000.00",
        "Salary as per provisions contained in sec 17(1): Rs. 18,00,000.00",
        "Standard deduction under sec 16(ia): Rs. 75,000.00",
        "Section 80C (EPF & PPF): Rs. 1,50,000.00",
    ])
    f26as_pdf = _build_pdf_bytes([
        "TRACES FORM 26AS",
        f"Assessee PAN: {pan}",
        "Name of Assessee: Vikram Deshmukh",
        "Financial Year: 2024-25",
        "Assessment Year: 2025-26",
        "Deductor : Infosys Limited | TAN : BLRI01234A",
        "Total Amount Credited : Rs. 18,00,000.00 | Total Tax Deducted : Rs. 1,25,000.00 | Total Tax Deposited : Rs. 1,25,000.00",
    ])
    ais_pdf = _build_pdf_bytes([
        "ANNUAL INFORMATION STATEMENT (AIS)",
        f"PAN: {pan} Name: Vikram Deshmukh Financial Year: 2024-25 Assessment Year: 2025-26",
        "[TDS-192] Employer Salary : Rs. 18,00,000.00 | TDS : Rs. 1,25,000.00",
        "[INT-SAV] Savings Bank Interest : Rs. 22,000.00",
    ])

    r_f16 = unauth_client.post(
        "/api/documents/upload",
        data={"client_id": client_id, "case_id": case_id, "category": "FORM_16", "assessment_year": "AY 2025-26"},
        files={"file": ("Vikram_Form16.pdf", io.BytesIO(f16_pdf), "application/pdf")},
        headers=partner_headers,
    )
    assert r_f16.status_code == 200
    f16_doc_id = r_f16.json()["id"]

    r_26 = unauth_client.post(
        "/api/documents/upload",
        data={"client_id": client_id, "case_id": case_id, "category": "FORM_26AS", "assessment_year": "AY 2025-26"},
        files={"file": ("Vikram_Form26AS.pdf", io.BytesIO(f26as_pdf), "application/pdf")},
        headers=partner_headers,
    )
    assert r_26.status_code == 200

    r_ais = unauth_client.post(
        "/api/documents/upload",
        data={"client_id": client_id, "case_id": case_id, "category": "AIS", "assessment_year": "AY 2025-26"},
        files={"file": ("Vikram_AIS.pdf", io.BytesIO(ais_pdf), "application/pdf")},
        headers=partner_headers,
    )
    assert r_ais.status_code == 200

    # Mark docs VERIFIED for clean sign-off testing later
    for did in (f16_doc_id, r_26.json()["id"], r_ais.json()["id"]):
        vr = unauth_client.patch(
            f"/api/documents/{did}/status",
            json={"ca_review_status": "VERIFIED", "review_notes": "Source PDF verified"},
            headers=partner_headers,
        )
        assert vr.status_code == 200

    # 2. Trigger backend batch extraction -> runs reconciliation cleanly from extracted data
    ext_res = unauth_client.post(
        "/api/documents/extract-all",
        json={"client_id": client_id, "case_id": case_id},
        headers=partner_headers,
    )
    assert ext_res.status_code == 200

    rec_res = unauth_client.post(
        f"/api/reconcile/client/{client_id}/run",
        json={"case_id": case_id, "assessment_year": "2025-26"},
        headers=partner_headers,
    )
    assert rec_res.status_code == 200
    matrix = rec_res.json()
    assert matrix["data_source"] == "BACKEND_EXTRACTED_DOCS"
    assert matrix["all_reconciled"] is False

    sal_row = next(r for r in matrix["rows"] if r["id"] == "row-salary-gross")
    assert sal_row["match_status"] == "MATCHED"
    assert sal_row["form_16_value"] == 1800000.0
    assert sal_row["form_26as_value"] == 1800000.0
    assert len(sal_row["source_citations"]) >= 1

    tds_row = next(r for r in matrix["rows"] if r["id"] == "row-tds-192")
    assert tds_row["match_status"] == "MISMATCH_VARIANCE"
    assert tds_row["variance"] == 15000.0
    assert tds_row["notice_risk"] == "HIGH"
    assert tds_row["resolved_value"] == 125000.0  # Safe portal credit, NOT inflated 140k
    assert len(tds_row["source_citations"]) >= 1

    sav_row = next(r for r in matrix["rows"] if r["id"] == "row-ais-savings-interest")
    assert sav_row["match_status"] == "AIS_UNRECORDED_INCOME"
    assert sav_row["ais_value"] == 22000.0
    assert sav_row["is_resolved"] is False

    # Sign-off MUST fail while unresolved discrepancies remain
    sign_blocked = unauth_client.post(
        f"/api/calculate/client/{client_id}/sign-off",
        json={"case_id": case_id, "chosen_regime": "NEW_REGIME_115BAC", "verification_notes": "Checking blockers"},
        headers=partner_headers,
    )
    assert sign_blocked.status_code == 400
    assert "unresolved" in sign_blocked.json()["detail"].lower()

    # 3. Apply CA field correction on Form 16 TDS (fix clerical typo 1,40,000 -> 1,25,000) & re-run reconciliation
    corr_res = unauth_client.patch(
        f"/api/documents/{f16_doc_id}/fields/part_a.total_tax_deposited",
        json={
            "field_key": "part_a.total_tax_deposited",
            "corrected_value": 125000.0,
            "correction_reason": "Corrected employer Form 16 typo per Q4 OLTAS challan",
            "case_id": case_id,
        },
        headers=partner_headers,
    )
    assert corr_res.status_code == 200
    assert corr_res.json()["extracted_data"]["part_a"]["total_tax_deposited"] == 140000.0  # Immutable!

    rec_after_corr = unauth_client.post(
        f"/api/reconcile/client/{client_id}/run",
        json={"case_id": case_id, "assessment_year": "2025-26"},
        headers=partner_headers,
    )
    assert rec_after_corr.status_code == 200
    m2 = rec_after_corr.json()
    tds_row2 = next(r for r in m2["rows"] if r["id"] == "row-tds-192")
    assert tds_row2["match_status"] == "MATCHED"
    assert tds_row2["form_16_value"] == 125000.0
    assert tds_row2["original_extracted_values"]["form_16_original"] == 140000.0  # Original preserved!
    assert len(tds_row2["ca_corrections_applied"]) == 1
    assert tds_row2["ca_corrections_applied"][0]["correction_reason"] == "Corrected employer Form 16 typo per Q4 OLTAS challan"

    # 4. Resolve AIS savings interest discrepancy via authorised CA endpoint
    res_sav = unauth_client.patch(
        f"/api/reconcile/client/{client_id}/rows/row-ais-savings-interest",
        json={
            "action": "ADD_TO_OTHER_SOURCES",
            "ca_notes": "Confirmed ₹22,000 savings interest per SBI passbook; eligible for ₹10,000 u/s 80TTA.",
            "resolved_value": 22000.0,
            "case_id": case_id,
        },
        headers=partner_headers,
    )
    assert res_sav.status_code == 200
    m3 = res_sav.json()
    assert m3["all_reconciled"] is True
    resolved_sav = next(r for r in m3["rows"] if r["id"] == "row-ais-savings-interest")
    assert resolved_sav["is_resolved"] is True
    assert "CA_PARTNER" in resolved_sav["resolved_by"]

    # Confirm DB reload persistence of resolved reconciliation rows & audit log
    reloaded = unauth_client.get(f"/api/reconcile/client/{client_id}?case_id={case_id}", headers=partner_headers)
    assert reloaded.status_code == 200
    assert reloaded.json()["all_reconciled"] is True

    # 5. Compute Tax strictly from validated DB docs + reconciliation -> Verify totals match (18,00,000 Salary + 22,000 Savings = 18,22,000 GTI, 1,25,000 TDS)
    calc_res = unauth_client.post(
        f"/api/calculate/client/{client_id}/tax",
        json={"case_id": case_id, "assessment_year": "2025-26"},
        headers=partner_headers,
    )
    assert calc_res.status_code == 200
    comp = calc_res.json()
    assert comp["data_source"] == "VALIDATED_BACKEND_DOCUMENTS"
    assert comp["validation_status"] == "READY"
    assert comp["new_regime"]["gross_total_income"] == 1822000.0
    assert comp["new_regime"]["tds_tcs_credit"] == 125000.0
    assert comp["old_regime"]["total_deductions"] >= 200000.0  # Std ded 50k + 80C 150k + 80TTA 10k = 210k

    # 6. CA Sign-off now succeeds and writes persistent audit record
    sign_ok = unauth_client.post(
        f"/api/calculate/client/{client_id}/sign-off",
        json={"case_id": case_id, "chosen_regime": comp["recommended_regime"], "verification_notes": "All docs & reconciliation verified."},
        headers=partner_headers,
    )
    assert sign_ok.status_code == 200
    sign_payload = sign_ok.json()
    assert sign_payload["status"] == "APPROVED"
    assert len(sign_payload["verification_hash"]) >= 16

    # Check DB audit logs recorded reconciliation, discrepancy resolution, computation, and sign-off
    audit_res = unauth_client.get("/api/audit/logs", headers=partner_headers)
    assert audit_res.status_code == 200
    actions = {evt["action"] for evt in audit_res.json()}
    assert "3WAY_RECONCILIATION_EXECUTED" in actions
    assert "DISCREPANCY_RESOLVED" in actions
    assert "DETERMINISTIC_TAX_COMPUTED" in actions
    assert "CA_STATUTORY_SIGN_OFF" in actions


def test_stage4_reconciliation_and_calculation_permissions_and_cross_client_guards():
    """Verify 401 anonymous rejection, 403 CLIENT mutation block, and 403 cross-client access block."""
    arun_headers = authenticate_test_client(unauth_client, "arun.verma@demo.in", "DemoArun!2026")

    # 1. Anonymous rejected (401)
    assert unauth_client.get("/api/reconcile/client/client-arun-01").status_code == 401
    assert unauth_client.post("/api/reconcile/client/client-arun-01/run").status_code == 401
    assert unauth_client.get("/api/calculate/client/client-arun-01").status_code == 401

    # 2. CLIENT cannot run reconciliation, resolve discrepancies, or trigger CA sign-off (403)
    assert unauth_client.post("/api/reconcile/client/client-arun-01/run", headers=arun_headers).status_code == 403
    assert (
        unauth_client.patch(
            "/api/reconcile/client/client-arun-01/rows/row-tds-192",
            json={"action": "NO_ACTION", "ca_notes": "Unauthorized resolution attempt"},
            headers=arun_headers,
        ).status_code
        == 403
    )
    assert (
        unauth_client.post(
            "/api/calculate/client/client-arun-01/tax",
            json={"assessment_year": "2025-26"},
            headers=arun_headers,
        ).status_code
        == 403
    )
    assert (
        unauth_client.post(
            "/api/calculate/client/client-arun-01/sign-off",
            json={"verification_notes": "Client cannot self-sign-off"},
            headers=arun_headers,
        ).status_code
        == 403
    )

    # 3. Cross-client access denied (Arun cannot read Radhika's reconciliation or calculation -> 403)
    assert unauth_client.get("/api/reconcile/client/client-radhika-02", headers=arun_headers).status_code == 403
    assert unauth_client.get("/api/calculate/client/client-radhika-02", headers=arun_headers).status_code == 403
