"""
Database Seeding for CA Bharat AI
Populates statutory personas compliant with Section 2(31) of Income-tax Act, 1961.
"""

import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from .models import (
    DBClientProfile,
    DBUploadedDocument,
    DBReconciliationItem,
    DBTaxComputation,
    DBDPDPConsent,
    DBAuditLog,
)

def seed_initial_data(db: Session):
    # Only seed if no taxpayer profiles exist
    if db.query(DBClientProfile).count() > 0:
        return

    # 1. Taxpayer: Arun Kumar Verma (Salaried Individual)
    arun = DBClientProfile(
        id="client-arun-01",
        pan="ABCPA1092F",
        name="Arun Kumar Verma",
        category="Individual - Salaried",
        tier="Silver",
        recommended_itr="ITR-1",
        email="arun.verma@example.com",
        mobile="+91 98201 44819",
        employer_or_trade_name="Tata Consultancy Services Ltd (TAN: MUMT01928B)",
        tan="MUMT01928B",
        bank_account_no="XXXXXXXX4419",
        bank_ifsc="HDFC0000128",
        bank_name="HDFC Bank Limited",
        status="Reconciled",
    )
    db.add(arun)

    # Arun's Documents
    doc1 = DBUploadedDocument(
        id="doc-arun-f16",
        client_id="client-arun-01",
        client_pan="ABCPA1092F",
        case_id="case-arun-ay2526",
        assessment_year="AY 2025-26",
        filename="Form16_Arun_TCS_AY2025-26.pdf",
        category="FORM_16",
        checklist_item_ids_json=json.dumps(["salary-form16", "ded-80c-receipts"]),
        page_count=4,
        status="PARSED",
        processing_status="PARSED",
        ca_review_status="VERIFIED",
        file_size_bytes=342100,
        file_type="application/pdf",
        extraction_engine="DETERMINISTIC_PDF",
        evidence_score=1.0,
        extracted_data_json=json.dumps({
            "gross_salary": 1450000.0,
            "exemptions_us_10": 48000.0,
            "standard_deduction": 75000.0,
            "professional_tax": 2400.0,
            "deductions_80c": 150000.0,
            "deductions_80ccd_1b": 50000.0,
            "deductions_80d": 25000.0,
            "total_tds": 128450.0,
        }),
        citations_json=json.dumps({
            "gross_salary": {"page": 2, "box": [72.0, 140.0, 520.0, 160.0]},
            "total_tds": {"page": 1, "box": [72.0, 310.0, 520.0, 330.0]},
            "standard_deduction": {"page": 2, "box": [72.0, 210.0, 520.0, 230.0]},
        }),
    )
    doc2 = DBUploadedDocument(
        id="doc-arun-26as",
        client_id="client-arun-01",
        client_pan="ABCPA1092F",
        case_id="case-arun-ay2526",
        assessment_year="AY 2025-26",
        filename="Form26AS_TRACES_ABCPA1092F.pdf",
        category="FORM_26AS",
        checklist_item_ids_json=json.dumps(["tax-26as-traces"]),
        page_count=2,
        status="PARSED",
        processing_status="PARSED",
        ca_review_status="VERIFIED",
        file_size_bytes=184500,
        file_type="application/pdf",
        extraction_engine="DETERMINISTIC_PDF",
        evidence_score=1.0,
        extracted_data_json=json.dumps({
            "total_tds_salary": 128450.0,
            "total_tds_non_salary": 0.0,
            "total_advance_tax": 0.0,
            "total_tax_credit": 128450.0,
        }),
        citations_json=json.dumps({
            "total_tax_credit": {"page": 1, "box": [72.0, 180.0, 520.0, 200.0]}
        }),
    )
    doc3 = DBUploadedDocument(
        id="doc-arun-ais",
        client_id="client-arun-01",
        client_pan="ABCPA1092F",
        case_id="case-arun-ay2526",
        assessment_year="AY 2025-26",
        filename="AIS_TIS_ABCPA1092F_AY2025-26.pdf",
        category="AIS",
        checklist_item_ids_json=json.dumps(["tax-ais-tis", "os-bank-interest"]),
        page_count=3,
        status="PARSED",
        processing_status="PARSED",
        ca_review_status="VERIFIED",
        file_size_bytes=219400,
        file_type="application/pdf",
        extraction_engine="DETERMINISTIC_PDF",
        evidence_score=1.0,
        extracted_data_json=json.dumps({
            "savings_interest": 18450.0,
            "dividend_income": 4200.0,
            "tds_reported": 128450.0,
        }),
        citations_json=json.dumps({
            "savings_interest": {"page": 1, "box": [72.0, 250.0, 520.0, 270.0]}
        }),
    )
    db.add_all([doc1, doc2, doc3])

    # Arun's Reconciliation Items
    recon1 = DBReconciliationItem(
        id="recon-arun-1",
        client_id="client-arun-01",
        case_id="case-arun-ay2526",
        row_key="row-tds-192",
        category="Tax Deducted at Source",
        client_pan="ABCPA1092F",
        source_a="Form 16 Part A",
        source_b="Form 26AS Part I",
        field_name="TCS Salary TDS Credit",
        amount_a=128450.0,
        amount_b=128450.0,
        ais_value=128450.0,
        variance=0.0,
        status="MATCH",
        match_status="MATCHED",
        notice_risk="LOW",
        statutory_rule="Rule 37BA & Section 143(1)(a) CPC TDS Credit Match",
        explanation="100% matched across employer Form 16 certificate and TRACES Form 26AS database.",
        resolution_action="NO_ACTION",
        resolved_value=128450.0,
        ca_notes="100% matched across employer certificate and TRACES database.",
        is_accepted=True,
    )
    recon2 = DBReconciliationItem(
        id="recon-arun-2",
        client_id="client-arun-01",
        case_id="case-arun-ay2526",
        row_key="row-ais-savings-interest",
        category="Income from Other Sources",
        client_pan="ABCPA1092F",
        source_a="AIS (SFT-005)",
        source_b="Bank Interest Computation",
        field_name="HDFC & SBI Savings Bank Interest",
        amount_a=None,
        amount_b=None,
        ais_value=18450.0,
        variance=0.0,
        status="MATCH",
        match_status="MATCHED",
        notice_risk="LOW",
        statutory_rule="Section 56(2) & Section 80TTA Deduction Rule",
        explanation="Declared under Income from Other Sources u/s 56. Eligible for 80TTA deduction up to ₹10,000 under Old Regime.",
        resolution_action="ADD_TO_OTHER_SOURCES",
        resolved_value=18450.0,
        ca_notes="Declared under Income from Other Sources u/s 56. Eligible for 80TTA deduction of ₹10,000 under Old Regime.",
        is_accepted=True,
    )
    db.add_all([recon1, recon2])

    # Arun's Tax Computation
    comp1 = DBTaxComputation(
        id="tax-arun-01",
        client_id="client-arun-01",
        case_id="case-arun-ay2526",
        client_pan="ABCPA1092F",
        ay="2025-26",
        gross_total_income=1472650.0,
        old_regime_tax=132840.0,
        new_regime_tax=122450.0,
        recommended_regime="New Regime",
        tds_credits=128450.0,
        refund_due=6000.0,
        balance_payable=0.0,
        computation_json=json.dumps({
            "recommended": "New Regime (Sec 115BAC)",
            "tax_savings": 10390.0,
            "standard_deduction": 75000.0,
            "net_taxable_income_new": 1397650.0,
            "net_taxable_income_old": 1217650.0,
        }),
        is_ca_approved=True,
        ca_sign_off_hash="f292fd9e4e0b22269397a63e73f6a99bf3a99613",
        ca_notes="Assessee benefits by ₹10,390 under New Tax Regime (Section 115BAC) post Finance Act 2024 revisions. Return ready for ITR-1 e-filing.",
        approved_at=datetime.now(timezone.utc),
    )
    db.add(comp1)

    # Arun's DPDP Consent
    consent1 = DBDPDPConsent(
        id="dpdp-arun-01",
        pan="ABCPA1092F",
        client_name="Arun Kumar Verma",
        purpose="Direct Tax Return Preparation, TRACES/AIS Verification & Annual Advisory",
        granted_at="2024-06-12T10:00:00Z",
        expires_at="2027-03-31",
        ip_address="192.168.1.102",
        status="ACTIVE",
        verification_mode="DIGITAL_OTP",
        token_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    )
    db.add(consent1)

    # 2. Taxpayer: Dr. Radhika Sen (Professional Sec 44ADA)
    radhika = DBClientProfile(
        id="client-radhika-02",
        pan="ABCPR5491M",
        name="Dr. Radhika Sen",
        category="Individual - Professional (Sec 44ADA)",
        tier="Gold",
        recommended_itr="ITR-4",
        email="dr.radhika@healthcare.org",
        mobile="+91 98112 90182",
        employer_or_trade_name="Dr. Sen Clinical Diagnostics & Fortis Healthcare Consultant",
        tan="DELF09281A",
        bank_account_no="XXXXXXXX9018",
        bank_ifsc="ICIC0000047",
        bank_name="ICICI Bank Limited",
        status="Reconciled",
    )
    db.add(radhika)

    # Audit Logs
    log1 = DBAuditLog(
        id="log-001",
        timestamp=datetime.now(timezone.utc),
        actor="CA Rajesh Sharma (Demo Partner)",
        action="CASE_APPROVAL",
        client_name="Arun Kumar Verma",
        pan="ABCPA1092F",
        details="Completed 3-way cross-reconciliation and approved ITR-1 return under Section 115BAC. Refund of ₹6,000 verified.",
        ip_address="192.168.1.10",
        category="Approval (Demo)",
    )
    log2 = DBAuditLog(
        id="log-002",
        timestamp=datetime.now(timezone.utc),
        actor="System (Deterministic Database)",
        action="DB_INITIALIZATION",
        client_name="Firm Master",
        pan=None,
        details="Initialized relational schema and seeded statutory personas across Section 2(31) categories.",
        ip_address="127.0.0.1",
        category="System",
    )
    db.add_all([log1, log2])

    db.commit()
