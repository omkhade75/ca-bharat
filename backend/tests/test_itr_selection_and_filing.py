"""
Comprehensive Unit & Integration Test Suite for:
1. Deterministic Rule-Based ITR Selection Engine (AY 2025-26)
2. CA Review Actions: Return for Correction, Rejection, Sign-Off Approval
3. Statutory ITR Filing Preparation & Schedule Mapping Package
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.engine.itr_selector import ITRSelectionEngine
from app.services.filing_preparation import FilingPreparationService
from app.engine.tax_calculator import TaxCalculator
from app.models.tax_models import IncomeHeadDetails, DeductionsDetail
from auth_helper import authenticate_test_client

client = TestClient(app)


def test_itr1_eligible_salaried_resident():
    """Resident individual with income <= 50L, single HP, other sources -> ITR-1."""
    res = ITRSelectionEngine.evaluate(
        entity_type="INDIVIDUAL",
        residential_status="RESIDENT",
        incomes={"salary": 1450000.0, "other_sources": 22650.0, "house_property_count": 1},
        disclosures={"confirmed_no_directorship": True, "confirmed_no_foreign_assets": True},
    )
    assert res.recommended_form == "ITR-1 (Sahaj)"
    assert res.form_code == "ITR-1"
    assert any("ceiling of ₹50,00,000" in s for s in res.satisfied_conditions)
    assert any(i.form == "ITR-2" and i.status == "Alternative Applicable" for i in res.ineligible_forms)


def test_itr1_disqualified_non_resident():
    """Non-resident individual cannot file ITR-1, must file ITR-2."""
    res = ITRSelectionEngine.evaluate(
        entity_type="INDIVIDUAL",
        residential_status="NON_RESIDENT",
        incomes={"salary": 800000.0},
    )
    assert res.recommended_form == "ITR-2"
    assert any("NON_RESIDENT" in i.reason for i in res.ineligible_forms if i.form == "ITR-1")


def test_itr1_disqualified_capital_gains():
    """Individual with Capital Gains is disqualified from ITR-1."""
    res = ITRSelectionEngine.evaluate(
        entity_type="INDIVIDUAL",
        residential_status="RESIDENT",
        incomes={"salary": 900000.0, "capital_gains": 120000.0, "has_capital_gains": True},
    )
    assert res.recommended_form == "ITR-2"
    assert any("Capital Gains" in i.reason for i in res.ineligible_forms if i.form == "ITR-1")


def test_itr1_disqualified_high_income():
    """Individual with Total Income > 50 Lakhs is disqualified from ITR-1."""
    res = ITRSelectionEngine.evaluate(
        entity_type="INDIVIDUAL",
        residential_status="RESIDENT",
        incomes={"salary": 5500000.0},
    )
    assert res.recommended_form == "ITR-2"
    assert any("exceeds the statutory ceiling" in i.reason for i in res.ineligible_forms if i.form == "ITR-1")


def test_itr1_disqualified_directorship_and_unlisted_shares():
    """Directorship or holding unlisted equity requires ITR-2."""
    res = ITRSelectionEngine.evaluate(
        entity_type="INDIVIDUAL",
        residential_status="RESIDENT",
        incomes={"salary": 1200000.0},
        disclosures={"is_director_in_company": True},
    )
    assert res.recommended_form == "ITR-2"
    assert any("Director" in i.reason for i in res.ineligible_forms if i.form == "ITR-1")


def test_presumptive_44ada_eligible_itr4():
    """Individual with presumptive professional income u/s 44ADA <= 50L -> ITR-4 (Sugam)."""
    res = ITRSelectionEngine.evaluate(
        entity_type="INDIVIDUAL",
        residential_status="RESIDENT",
        incomes={
            "business_profession": 1500000.0,
            "has_business_profession": True,
            "presumptive_election": "44ADA",
            "professional_receipts": 3000000.0,
        },
    )
    assert res.recommended_form == "ITR-4 (Sugam)"
    assert res.form_code == "ITR-4"


def test_presumptive_44ada_exceeding_receipts_requires_itr3():
    """Professional gross receipts exceeding 75L ceiling requires ITR-3."""
    res = ITRSelectionEngine.evaluate(
        entity_type="INDIVIDUAL",
        residential_status="RESIDENT",
        incomes={
            "business_profession": 4000000.0,
            "has_business_profession": True,
            "presumptive_election": "44ADA",
            "professional_receipts": 8500000.0,  # Exceeds 75L
        },
    )
    assert res.recommended_form == "ITR-3"


def test_entity_routing_huf_firm_llp_company_trust():
    """HUF, Firm, LLP, Company, Trust statutory form assignments."""
    huf = ITRSelectionEngine.evaluate(entity_type="HUF", residential_status="RESIDENT", incomes={})
    assert huf.recommended_form == "ITR-2"

    huf_biz = ITRSelectionEngine.evaluate(
        entity_type="HUF", residential_status="RESIDENT", incomes={"business_profession": 500000.0, "has_business_profession": True}
    )
    assert huf_biz.recommended_form == "ITR-3"

    firm = ITRSelectionEngine.evaluate(entity_type="PARTNERSHIP_FIRM", residential_status="RESIDENT", incomes={})
    assert firm.recommended_form == "ITR-5"

    llp = ITRSelectionEngine.evaluate(entity_type="LLP", residential_status="RESIDENT", incomes={})
    assert llp.recommended_form == "ITR-5"

    comp = ITRSelectionEngine.evaluate(entity_type="COMPANY", residential_status="RESIDENT", incomes={})
    assert comp.recommended_form == "ITR-6"

    trust = ITRSelectionEngine.evaluate(entity_type="TRUST", residential_status="RESIDENT", incomes={})
    assert trust.recommended_form == "ITR-7"


def test_filing_package_schedule_mapping_and_validation():
    """Validates complete statutory filing schedule generation and validation report."""
    client_dict = {
        "id": "client-arun-01",
        "name": "Arun Kumar Verma",
        "pan": "ABCPA1092F",
        "email": "arun.verma@demo.in",
        "phone": "+91 98200 12345",
        "residential_status": "RESIDENT",
        "bank_details": {
            "bank_name": "HDFC Bank Ltd",
            "ifsc_code": "HDFC0000060",
            "account_number": "50100294819281",
        },
    }
    tax_comp_dict = {
        "is_ca_approved": True,
        "ca_approver": "CA Rajesh Sharma (Partner)",
        "ca_approval_timestamp": "2026-11-25T12:00:00Z",
        "verification_hash": "48ed6a56926cf7e610fb95df",
        "recommended_regime": "New Regime",
        "selected_itr_form": "ITR-1 (Sahaj)",
        "tds_credits": 128450.0,
        "new_regime": {
            "gross_total_income": 1397650.0,
            "total_deductions": 75000.0,
            "total_taxable_income": 1397650.0,
            "basic_tax": 109930.0,
            "rebate_87a": 0.0,
            "health_and_education_cess": 4397.0,
            "total_tax_liability": 114327.0,
            "total_prepaid_tax": 128450.0,
            # Unrounded: 128450 - 114327 = 14123.0; Section 288B statutory rounding to multiple of 10: 14120.0
            "refund_amount": 14120.0,
            "tax_due_amount": 0.0,
        },
        "income_summary": {
            "salary": 1450000.0,
            "savings_interest": 18450.0,
            "dividend_income": 4200.0,
            "other_sources": 22650.0,
        },
    }

    pkg = FilingPreparationService.generate_filing_package(client_dict, tax_comp_dict)
    assert pkg.selected_itr_form == "ITR-1 (Sahaj)"
    assert pkg.is_ca_approved is True
    assert pkg.filing_status == "READY_FOR_FILING_DEMO"
    assert "Ready for Filing — Demo Only" in pkg.demo_disclaimer

    # Verify Schedule S
    sched_s = pkg.schedules["Schedule_S"]
    assert sched_s["GrossSalary"] == 1450000.0
    assert sched_s["StandardDeductionSec16ia"] == 75000.0

    # Verify Schedule OS
    sched_os = pkg.schedules["Schedule_OS"]
    assert sched_os["SavingsBankInterest"] == 18450.0
    assert sched_os["DividendIncome"] == 4200.0

    # Verify Validation Report
    assert pkg.validation_report.is_valid is True
    assert len(pkg.validation_report.errors) == 0
    assert pkg.validation_report.total_checks_run >= 8
    assert pkg.schedules["PartB_TTI"]["RefundDue"] == 14120.0


def test_api_routes_itr_selection_and_ca_confirmation():
    """Tests GET /api/itr/client/{client_id} and POST /confirm with CA authorization."""
    ca_headers = authenticate_test_client(client, "ca.partner@cabharat.demo", "DemoPartner!2026")
    client_headers = authenticate_test_client(client, "arun.verma@demo.in", "DemoArun!2026")

    # 1. GET ITR selection
    res = client.get(
        "/api/itr/client/client-arun-01",
        headers=ca_headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["recommended_form"] == "ITR-1 (Sahaj)"
    assert data["form_code"] == "ITR-1"
    assert len(data["satisfied_conditions"]) > 0

    # 2. Client role cannot confirm ITR selection (403 Forbidden)
    res_client = client.post(
        "/api/itr/client/client-arun-01/confirm",
        headers=client_headers,
        json={"confirmed_form": "ITR-1 (Sahaj)", "ca_notes": "Attempted by client"},
    )
    assert res_client.status_code == 403

    # 3. CA Partner confirms ITR selection
    res_ca = client.post(
        "/api/itr/client/client-arun-01/confirm",
        headers=ca_headers,
        json={"confirmed_form": "ITR-1 (Sahaj)", "ca_notes": "Statutory ITR-1 confirmed after Rule 12 verification."},
    )
    assert res_ca.status_code == 200
    conf_data = res_ca.json()
    assert conf_data["is_ca_confirmed"] is True
    assert "CA Rajesh Sharma" in conf_data["confirmed_by"]


def test_api_routes_ca_return_for_correction_and_rejection():
    """Tests CA returning case for correction and rejecting computation."""
    ca_headers = authenticate_test_client(client, "ca.partner@cabharat.demo", "DemoPartner!2026")
    client_headers = authenticate_test_client(client, "arun.verma@demo.in", "DemoArun!2026")

    # Client cannot return for correction
    res_403 = client.post(
        "/api/calculate/client/client-arun-01/return-for-correction",
        headers=client_headers,
        json={"reason": "Missing bank interest statement"},
    )
    assert res_403.status_code == 403

    # CA returns for correction
    res_return = client.post(
        "/api/calculate/client/client-arun-01/return-for-correction",
        headers=ca_headers,
        json={"reason": "Upload updated Form 16 Part A with employer digital signature."},
    )
    assert res_return.status_code == 200
    assert res_return.json()["status"] == "RETURNED_FOR_CORRECTION"

    # CA rejects computation
    res_reject = client.post(
        "/api/calculate/client/client-arun-01/reject",
        headers=ca_headers,
        json={"reason": "Ineligible deduction claim identified u/s 80C."},
    )
    assert res_reject.status_code == 200
    assert res_reject.json()["status"] == "REJECTED"


def test_api_routes_filing_package_and_download():
    """Tests GET /api/filing/client/{client_id}/package and JSON download."""
    ca_headers = authenticate_test_client(client, "ca.partner@cabharat.demo", "DemoPartner!2026")

    res = client.get(
        "/api/filing/client/client-arun-01/package",
        headers=ca_headers,
    )
    assert res.status_code == 200
    pkg = res.json()
    assert pkg["client_pan"] == "ABCPA1092F"
    assert "Schedule_S" in pkg["schedules"]
    assert "Schedule_OS" in pkg["schedules"]
    assert "PartB_TTI" in pkg["schedules"]

    # Test download JSON endpoint
    dl_res = client.get(
        "/api/filing/client/client-arun-01/download-json",
        headers=ca_headers,
    )
    assert dl_res.status_code == 200
    assert dl_res.headers["content-type"] == "application/json"
    assert "attachment; filename=" in dl_res.headers["content-disposition"]


def test_new_multi_income_client_end_to_end_all_steps():
    """
    Tests all 8 statutory stages for a newly onboarded client with MULTI_INCOME_UNSURE:
    Step 1 Onboard -> DB Reload Hydration -> Step 2 Multi-Income Discovery ->
    Step 3 & 4 Real Sample PDF Uploads -> Step 5 Reconciliation & Resolution ->
    Step 6 Rule 12 ITR-3 Auto-Selection & Tax Computation -> Step 7 CA Sign-off ->
    Step 8 Filing Package JSON without any hardcoded Arun Verma contamination.
    """
    import os
    from app.services.case_manager import case_manager

    ca_headers = authenticate_test_client(client, "ca.partner@cabharat.demo", "DemoPartner!2026")
    new_client_id = "client-abcpk9918f"
    new_pan = "ABCPK9918F"
    case_id = f"case-{new_client_id}-ay2526"

    # Step 1: Onboard brand-new taxpayer with MULTI_INCOME_UNSURE and long recommended_itr string
    onboard_res = client.post(
        "/api/clients",
        headers=ca_headers,
        json={
            "id": new_client_id,
            "pan": new_pan,
            "name": "Om Khade",
            "legal_type": "INDIVIDUAL",
            "occupation_profile": "MULTI_INCOME_UNSURE",
            "residential_status": "RESIDENT",
            "category": "Individual - MULTI_INCOME_UNSURE",
            "recommended_itr": "Auto-Detect via AI Engine (Rule 12)",
            "email": "om.khade@demo.in",
            "mobile": "+91 98222 33445",
        },
    )
    assert onboard_res.status_code == 200
    assert onboard_res.json()["id"] == new_client_id
    assert onboard_res.json()["occupation_profile"] == "MULTI_INCOME_UNSURE"

    # Step 2: Update Intake Discovery with Business + 2 Rental Houses + Stocks + Father's Company Directorship
    intake_payload = {
        "salary": {"hasIncome": "YES", "employers": [{"grossSalary": 1520000, "tdsDeducted": 118560}]},
        "houseProperty": {
            "hasIncome": "YES",
            "properties": [
                {"propertyType": "LET_OUT", "annualRentReceived": 240000},
                {"propertyType": "LET_OUT", "annualRentReceived": 180000},
            ],
        },
        "businessProfession": {"hasIncome": "YES", "grossTurnoverOrReceipts": 1800000, "presumptiveElection": "NONE"},
        "capitalGains": {"hasIncome": "YES", "tradedEquitiesOrMutualFunds": "YES"},
        "specialDisclosures": {"hasDirectorship": "YES", "hasUnlistedEquityShares": "YES"},
    }
    intake_res = client.put(f"/api/clients/{new_pan}/intake", headers=ca_headers, json=intake_payload)
    assert intake_res.status_code == 200

    # Simulate memory cache clear (e.g. Render worker restart) -> verify full DB hydration works
    case_manager.clients.pop(new_pan, None)
    reloaded = case_manager.get_client_by_id(new_client_id)
    assert reloaded is not None
    assert reloaded.occupation_profile.value == "MULTI_INCOME_UNSURE"
    assert reloaded.intake_discovery["specialDisclosures"]["hasDirectorship"] == "YES"

    # Verify Step 6 Rule 12 auto-engine selects ITR-3 BEFORE documents or after documents
    itr_res = client.get(f"/api/itr/client/{new_client_id}?case_id={case_id}", headers=ca_headers)
    assert itr_res.status_code == 200
    assert itr_res.json()["form_code"] == "ITR-3"
    assert any(i["form"] == "ITR-1" and i["status"] == "Ineligible" for i in itr_res.json()["ineligible_forms"])
    assert any(i["form"] == "ITR-4" and i["status"] == "Ineligible" for i in itr_res.json()["ineligible_forms"])

    # Step 3 & 4: Upload real sample PDFs from Sample_Tax_Documents_For_Testing
    sample_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "Sample_Tax_Documents_For_Testing"))
    uploads = [
        ("FORM_16", "01_Form16_Salary_TCS.pdf"),
        ("FORM_26AS", "02_Form26AS_TaxCredit_TRACES.pdf"),
        ("AIS", "03_AIS_TIS_Annual_Statement.pdf"),
    ]
    for cat, fname in uploads:
        fpath = os.path.join(sample_dir, fname)
        with open(fpath, "rb") as f:
            up_res = client.post(
                "/api/documents/upload",
                headers=ca_headers,
                data={"client_id": new_client_id, "client_pan": new_pan, "case_id": case_id, "category": cat, "assessment_year": "AY 2025-26"},
                files={"file": (fname, f.read(), "application/pdf")},
            )
            assert up_res.status_code == 200
            doc_json = up_res.json()
            assert doc_json["processing_status"] == "PARSED"
            # Mark doc VERIFIED for Step 7 readiness
            vr = client.patch(f"/api/documents/{doc_json['id']}/status", headers=ca_headers, json={"ca_review_status": "VERIFIED"})
            assert vr.status_code == 200

    # Step 5: Run 3-way reconciliation & resolve all unresolved rows
    recon_res = client.post(f"/api/reconcile/client/{new_client_id}/run", headers=ca_headers, json={"case_id": case_id, "assessment_year": "2025-26"})
    assert recon_res.status_code == 200
    recon_matrix = recon_res.json()
    assert len(recon_matrix["rows"]) >= 2

    for row in recon_matrix["rows"]:
        if not row["is_resolved"]:
            res_row = client.patch(
                f"/api/reconcile/client/{new_client_id}/rows/{row['id']}",
                headers=ca_headers,
                json={"action": row.get("recommended_action") or "NO_ACTION", "ca_notes": "Verified against sample tax records", "case_id": case_id},
            )
            assert res_row.status_code == 200

    # Step 6: Confirm ITR-3 & Compute Tax (verify confirming ITR-3 survives tax recompute)
    conf_itr = client.post(
        f"/api/itr/client/{new_client_id}/confirm",
        headers=ca_headers,
        json={"case_id": case_id, "confirmed_form": "ITR-3", "ca_notes": "Confirmed ITR-3 for business, CG, multiple HPs & directorship."},
    )
    assert conf_itr.status_code == 200

    calc_res = client.post(f"/api/calculate/client/{new_client_id}/tax", headers=ca_headers, json={"case_id": case_id, "assessment_year": "2025-26"})
    assert calc_res.status_code == 200
    calc_data = calc_res.json()
    assert calc_data["selected_itr_form"] == "ITR-3"

    # Step 7: CA Sign-Off
    sign_res = client.post(
        f"/api/calculate/client/{new_client_id}/sign-off",
        headers=ca_headers,
        json={"case_id": case_id, "chosen_regime": calc_data["recommended_regime"], "verification_notes": "All schedules audited cleanly."},
    )
    assert sign_res.status_code == 200
    assert sign_res.json()["status"] == "APPROVED"

    # Step 8: Generate Filing Package JSON without any Arun Verma fallback leakage
    pkg_res = client.get(f"/api/filing/client/{new_client_id}/package?case_id={case_id}", headers=ca_headers)
    assert pkg_res.status_code == 200
    pkg = pkg_res.json()
    assert pkg["client_pan"] == new_pan
    assert pkg["client_name"] == "Om Khade"
    assert pkg["selected_itr_form"] == "ITR-3"
    assert pkg["is_ca_approved"] is True
    assert "ITR3" in pkg["itr_json_payload"]["ITR"]
    assert pkg["schedules"]["Verification"]["FatherName"] != "Ramesh Kumar Verma"
    assert pkg["schedules"]["BankAccountDetails"][0]["account_number"] != "50100294819281"
    assert pkg["validation_report"]["is_valid"] is True
