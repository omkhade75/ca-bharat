"""
Case Manager & In-Memory Case Store for CA Bharat AI Enterprise Backend
Coordinates client records, extracted documents, 3-way reconciliation matrices, and CA approvals.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from ..models.client_models import ClientProfile, TaxpayerCategoryEnum, DPDPConsentRecord, BankAccountDetails
from ..models.reconciliation_models import ReconciliationMatrix
from ..models.tax_models import RegimeComparisonResult, IncomeHeadDetails, DeductionsDetail
from ..engine.reconciliation_engine import ReconciliationEngine
from ..engine.tax_calculator import TaxCalculator

class CaseManager:
    """Manages active taxpayer cases, uploaded documents, reconciliation, and audit streams."""

    def __init__(self):
        self.clients: Dict[str, ClientProfile] = {}
        self.documents: Dict[str, List[Dict[str, Any]]] = {}  # pan -> list of doc payloads
        self.reconciliations: Dict[str, ReconciliationMatrix] = {}  # pan -> matrix
        self.tax_computations: Dict[str, RegimeComparisonResult] = {}  # pan -> computation
        self.audit_logs: List[Dict[str, Any]] = []

        # Seed standard statutory profiles
        self.seed_statutory_cases()

    def seed_statutory_cases(self):
        """Seeds initial realistic statutory cases (Arun Kumar Verma & Dr. Radhika Sen)."""
        arun = ClientProfile(
            id="c-001",
            pan="ABCPA1092F",
            name="Arun Kumar Verma",
            category=TaxpayerCategoryEnum.INDIVIDUAL_SALARIED,
            recommended_itr="ITR-1 (Sahaj)",
            employer_or_trade_name="Tata Consultancy Services Ltd",
            tan="BLRT01928F",
            email="arun.verma@demo.in",
            mobile="+91 98200 12345",
            bank_details=BankAccountDetails(
                account_number="50100294819281",
                ifsc_code="HDFC0000060",
                bank_name="HDFC Bank Ltd",
                account_type="SAVINGS",
                is_primary_for_refund=True,
                is_prevalidated=True,
            ),
            consent=DPDPConsentRecord(
                consent_id="cst-ay2526-arun-0912",
                pan="ABCPA1092F",
                client_name="Arun Kumar Verma",
                assessment_year="2025-26",
                granted_at="2026-06-10T14:30:00Z",
                status="ACTIVE",
            ),
            advisory_tier="Gold",
            workflow_status="READY_FOR_CA_REVIEW",
        )
        self.clients[arun.pan] = arun

        # Seed pre-computed tax comparison for Arun
        income_arun = IncomeHeadDetails(
            income_salaries=1442600.0,
            savings_interest=18400.0,
            dividend_income=24500.0,
            total_other_sources=42900.0,
            gross_total_income=1485500.0,
        )
        ded_arun = DeductionsDetail(
            standard_deduction=75000.0,
            professional_tax=2400.0,
            sec_80c=150000.0,
            sec_80ccd_1b_nps=50000.0,
            sec_80d_health=25000.0,
            sec_80tta_ttb_interest=10000.0,
        )
        comp_arun = TaxCalculator.compare_and_optimize(
            client_pan=arun.pan,
            client_name=arun.name,
            income=income_arun,
            deductions=ded_arun,
            prepaid_tax=118560.0,
            advance_tax=0.0,
            assessment_year="2025-26",
        )
        self.tax_computations[arun.pan] = comp_arun

        # Dr. Radhika Sen (Sec 44ADA Professional)
        radhika = ClientProfile(
            id="c-002",
            pan="ABCPR5491M",
            name="Dr. Radhika Sen",
            category=TaxpayerCategoryEnum.INDIVIDUAL_PROFESSIONAL,
            recommended_itr="ITR-4 (Sugam)",
            employer_or_trade_name="Sen Super Speciality Dental Clinic",
            tan="DELF09281G",
            email="dr.radhika@senclinic.in",
            mobile="+91 98450 67890",
            bank_details=BankAccountDetails(
                account_number="000201004912",
                ifsc_code="ICIC0000002",
                bank_name="ICICI Bank Ltd",
                account_type="CURRENT",
                is_primary_for_refund=True,
                is_prevalidated=True,
            ),
            consent=DPDPConsentRecord(
                consent_id="cst-ay2526-radhika-8419",
                pan="ABCPR5491M",
                client_name="Dr. Radhika Sen",
                assessment_year="2025-26",
                granted_at="2026-06-10T15:00:00Z",
                status="ACTIVE",
            ),
            advisory_tier="Platinum",
            workflow_status="DISCREPANCIES_FOUND",
        )
        self.clients[radhika.pan] = radhika

        # Seed initial documents for Arun
        self.documents[arun.pan] = [
            {
                "document_id": "f16-arun",
                "document_type": "FORM_16",
                "file_name": "Form16_Arun_TCS.pdf",
                "extracted_data": {
                    "part_a": {"employer_name": "Tata Consultancy Services Ltd", "employer_tan": "BLRT01928F", "total_tax_deposited": 118560.0},
                    "part_b": {"gross_salary": 1520000.0, "salary_us_17_1": 1485000.0, "perquisites_us_17_2": 35000.0, "standard_deduction_us_16ia": 75000.0, "professional_tax_us_16iii": 2400.0, "total_deductions_us_16": 77400.0, "income_chargeable_under_salaries": 1442600.0},
                },
            },
            {
                "document_id": "26as-arun",
                "document_type": "FORM_26AS",
                "file_name": "Form26AS_Arun.pdf",
                "extracted_data": {
                    "tds_salary_part_a": [{"deductor_name": "Tata Consultancy Services Ltd", "deductor_tan": "BLRT01928F", "section": "192", "total_amount_credited": 1485000.0, "total_tax_deducted": 118560.0, "total_tax_deposited": 118560.0}],
                    "tds_non_salary_part_b": [],
                    "advance_tax_challans_part_d": [],
                },
            },
            {
                "document_id": "ais-arun",
                "document_type": "AIS_TIS",
                "file_name": "AIS_TIS_Arun.pdf",
                "extracted_data": {
                    "items": [
                        {"info_code": "TDS-192", "category": "Salary", "gross_amount": 1485000.0, "taxable_amount": 1485000.0, "tax_deducted": 118560.0},
                        {"info_code": "INT-SAV", "category": "Savings Bank Interest", "taxable_amount": 18400.0, "tax_deducted": 0.0},
                        {"info_code": "DIV-001", "category": "Dividend", "taxable_amount": 24500.0, "tax_deducted": 2450.0},
                    ]
                },
            },
        ]

        # Seed initial documents for Dr. Radhika Sen
        self.documents[radhika.pan] = [
            {
                "document_id": "f16a-radhika",
                "document_type": "FORM_16",
                "file_name": "Form16A_Fortis_Radhika.pdf",
                "extracted_data": {
                    "part_a": {"employer_name": "Fortis Healthcare Ltd", "employer_tan": "DELF09281G", "total_tax_deposited": 25000.0},
                    "part_b": {"gross_salary": 0.0},
                },
            },
            {
                "document_id": "26as-radhika",
                "document_type": "FORM_26AS",
                "file_name": "Form26AS_Radhika.pdf",
                "extracted_data": {
                    "tds_salary_part_a": [],
                    "tds_non_salary_part_b": [{"deductor_name": "Fortis Healthcare Ltd", "deductor_tan": "DELF09281G", "section": "194J", "total_amount_credited": 2850000.0, "total_tax_deducted": 23000.0, "total_tax_deposited": 23000.0}],
                    "advance_tax_challans_part_d": [{"major_head": "0021", "minor_head": "100", "bsr_code": "0210045", "challan_serial_no": "04912", "deposit_date": "15-Dec-2024", "tax_paid": 45000.0}],
                },
            },
            {
                "document_id": "ais-radhika",
                "document_type": "AIS_TIS",
                "file_name": "AIS_TIS_Radhika.pdf",
                "extracted_data": {
                    "items": [
                        {"info_code": "TDS-194J", "category": "Professional Receipts", "taxable_amount": 2850000.0, "tax_deducted": 23000.0},
                        {"info_code": "INT-SAV", "category": "Savings Bank Interest", "taxable_amount": 14200.0, "tax_deducted": 0.0},
                    ]
                },
            },
        ]

        # Pre-seed reconciliation showing the concrete ₹2,000 TDS mismatch
        recon_engine = ReconciliationEngine()
        recon_arun = recon_engine.reconcile(
            client_pan=arun.pan,
            client_name=arun.name,
            f16_data=self.documents[arun.pan][0]["extracted_data"],
            f26as_data=self.documents[arun.pan][1]["extracted_data"],
            ais_data=self.documents[arun.pan][2]["extracted_data"],
            assessment_year="2025-26",
        )
        self.reconciliations[arun.pan] = recon_arun
        recon_radhika = recon_engine.reconcile(
            client_pan=radhika.pan,
            client_name=radhika.name,
            f26as_data={"tds_non_salary_part_b": [{"section": "194J", "total_tax_deposited": 23000.0}]},
            assessment_year="2025-26",
        )
        self.reconciliations[radhika.pan] = recon_radhika

    def get_client(self, pan: str) -> Optional[ClientProfile]:
        return self.clients.get(pan.upper())

    def list_clients(self) -> List[ClientProfile]:
        return list(self.clients.values())

    def add_client(self, client: ClientProfile) -> ClientProfile:
        self.clients[client.pan] = client
        return client

    def log_event(self, actor: str, action: str, details: str, pan: str, ip: str = "127.0.0.1"):
        self.audit_logs.append({
            "id": f"evt-{len(self.audit_logs)+1:03d}",
            "timestamp": datetime.now().isoformat(),
            "actor": actor,
            "action": action,
            "details": details,
            "pan": pan,
            "ip_address": ip,
        })

case_manager = CaseManager()
