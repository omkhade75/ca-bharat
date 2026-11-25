"""
Case Manager & In-Memory Case Store for CA Bharat AI Enterprise Backend
Coordinates client records, extracted documents, 3-way reconciliation matrices, and CA approvals.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from ..models.client_models import (
    ClientProfile,
    TaxpayerCategoryEnum,
    LegalTaxpayerTypeEnum,
    IndividualOccupationEnum,
    DPDPConsentRecord,
    BankAccountDetails,
)
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
            id="client-arun-01",
            pan="ABCPA1092F",
            name="Arun Kumar Verma",
            legal_type=LegalTaxpayerTypeEnum.INDIVIDUAL,
            occupation_profile=IndividualOccupationEnum.SALARIED,
            category="Individual - Salaried",
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

        # Dr. Radhika Sen (Professional u/s 44ADA)
        radhika = ClientProfile(
            id="client-radhika-02",
            pan="ABCPR5491M",
            name="Dr. Radhika Sen",
            legal_type=LegalTaxpayerTypeEnum.INDIVIDUAL,
            occupation_profile=IndividualOccupationEnum.PROFESSIONAL,
            category="Individual - Professional",
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
        pan_upper = pan.upper()
        if pan_upper in self.clients:
            return self.clients[pan_upper]
        # Query from database if present
        try:
            from ..db.session import SessionLocal
            from ..db.repository import TaxpayerRepository
            db = SessionLocal()
            try:
                repo = TaxpayerRepository(db)
                db_client = repo.get_client_by_pan(pan_upper)
                if db_client:
                    cat_val = TaxpayerCategoryEnum.INDIVIDUAL_SALARIED
                    for c in TaxpayerCategoryEnum:
                        if c.value == db_client.category or c.name == db_client.category:
                            cat_val = c
                            break
                    profile = ClientProfile(
                        id=db_client.id,
                        pan=db_client.pan,
                        name=db_client.name,
                        category=cat_val,
                        recommended_itr=db_client.recommended_itr or "ITR-1",
                        email=db_client.email,
                        mobile=db_client.mobile,
                        employer_or_trade_name=db_client.employer_or_trade_name,
                        tan=db_client.tan,
                        advisory_tier=db_client.tier or "Silver",
                        workflow_status=db_client.status or "Onboarding",
                    )
                    self.clients[pan_upper] = profile
                    return profile
            finally:
                db.close()
        except Exception:
            pass
        return None

    def get_client_by_id(self, client_id: str) -> Optional[ClientProfile]:
        """Finds client using internal client_id to avoid exposing PAN in URL parameters."""
        for client in self.clients.values():
            if client.id == client_id:
                return client
        try:
            from ..db.session import SessionLocal
            from ..db.repository import TaxpayerRepository
            db = SessionLocal()
            try:
                repo = TaxpayerRepository(db)
                all_clients = repo.get_all_clients()
                for c in all_clients:
                    if c.id == client_id:
                        return self.get_client(c.pan)
            finally:
                db.close()
        except Exception:
            pass
        return None

    def verify_client_case_ownership(self, pan: Optional[str] = None, client_id: Optional[str] = None, case_id: Optional[str] = None) -> bool:
        """Verifies that client exists and matches PAN / client_id before allowing document ops."""
        client = None
        if client_id:
            client = self.get_client_by_id(client_id)
        if not client and pan:
            client = self.get_client(pan.upper())
        if not client:
            return False
        if client_id and client.id and client.id != client_id:
            return False
        if pan and client.pan and client.pan != pan.upper():
            return False
        return True

    def get_client_assessment_year(self, pan: str, case_id: Optional[str] = None) -> str:
        """Reads assessment year dynamically from client tax case rather than hardcoding."""
        pan_upper = pan.upper()
        client = self.get_client(pan_upper)
        if client and getattr(client, "consent", None) and getattr(client.consent, "assessment_year", None):
            ay = client.consent.assessment_year
            return ay if ay.startswith("AY ") else f"AY {ay}"
        if client and getattr(client, "intake_discovery", None):
            ay = client.intake_discovery.get("assessment_year") or client.intake_discovery.get("tax_year")
            if ay:
                return ay if ay.startswith("AY ") else f"AY {ay}"
        return "AY 2025-26"

    def list_clients(self) -> List[ClientProfile]:
        # Merge database clients with memory cache
        try:
            from ..db.session import SessionLocal
            from ..db.repository import TaxpayerRepository
            db = SessionLocal()
            try:
                repo = TaxpayerRepository(db)
                db_clients = repo.get_all_clients()
                for c in db_clients:
                    if c.pan not in self.clients:
                        cat_val = TaxpayerCategoryEnum.INDIVIDUAL_SALARIED
                        for e in TaxpayerCategoryEnum:
                            if e.value == c.category:
                                cat_val = e
                                break
                        self.clients[c.pan] = ClientProfile(
                            id=c.id,
                            pan=c.pan,
                            name=c.name,
                            category=cat_val,
                            recommended_itr=c.recommended_itr or "ITR-1",
                            email=c.email,
                            mobile=c.mobile,
                            employer_or_trade_name=c.employer_or_trade_name,
                            tan=c.tan,
                            advisory_tier=c.tier or "Silver",
                            workflow_status=c.status or "Onboarding",
                        )
            finally:
                db.close()
        except Exception:
            pass
        return list(self.clients.values())

    def add_client(self, client: ClientProfile) -> ClientProfile:
        self.clients[client.pan] = client
        # Persist to database
        try:
            from ..db.session import SessionLocal
            from ..db.repository import TaxpayerRepository
            db = SessionLocal()
            try:
                repo = TaxpayerRepository(db)
                repo.create_or_update_client({
                    "id": client.id,
                    "pan": client.pan.upper(),
                    "name": client.name,
                    "category": client.category.value if hasattr(client.category, "value") else str(client.category),
                    "tier": getattr(client, "advisory_tier", "Silver"),
                    "recommended_itr": client.recommended_itr,
                    "email": client.email,
                    "mobile": client.mobile,
                    "employer_or_trade_name": client.employer_or_trade_name,
                    "tan": client.tan,
                    "bank_account_no": client.bank_details.account_number if client.bank_details else None,
                    "bank_ifsc": client.bank_details.ifsc_code if client.bank_details else None,
                    "bank_name": client.bank_details.bank_name if client.bank_details else None,
                    "status": getattr(client, "workflow_status", "Onboarding"),
                    "legal_type": client.legal_type.value if hasattr(client.legal_type, "value") else str(client.legal_type),
                    "occupation_profile": client.occupation_profile.value if hasattr(client.occupation_profile, "value") else str(client.occupation_profile),
                    "residential_status": client.residential_status.value if hasattr(client.residential_status, "value") else str(client.residential_status),
                    "dob_or_doi": client.dob_or_doi,
                    "karta_name": client.karta_name,
                    "karta_pan": client.karta_pan,
                    "huf_deed_date": client.huf_deed_date,
                    "entity_reg_no": client.entity_reg_no,
                    "registered_office_address": client.registered_office_address,
                    "responsible_person_name": client.responsible_person_name,
                    "responsible_person_pan": client.responsible_person_pan,
                    "responsible_person_designation": client.responsible_person_designation,
                    "discovery_json": json.dumps(client.intake_discovery) if client.intake_discovery else None,
                })
            finally:
                db.close()
        except Exception:
            pass
        return client

    def update_client_intake(self, pan: str, intake_discovery: Dict[str, Any]) -> Optional[ClientProfile]:
        pan_upper = pan.upper()
        client = self.get_client(pan_upper)
        if not client:
            return None
        client.intake_discovery = intake_discovery
        self.clients[pan_upper] = client
        try:
            import json
            from ..db.session import SessionLocal
            from ..db.repository import TaxpayerRepository
            db = SessionLocal()
            try:
                repo = TaxpayerRepository(db)
                repo.create_or_update_client({
                    "pan": pan_upper,
                    "discovery_json": json.dumps(intake_discovery),
                })
            finally:
                db.close()
        except Exception:
            pass
        return client

    def log_event(self, actor: str, action: str, details: str, pan: str, ip: str = "127.0.0.1"):
        log_entry = {
            "id": f"evt-{len(self.audit_logs)+1:03d}",
            "timestamp": datetime.now().isoformat(),
            "actor": actor,
            "action": action,
            "details": details,
            "pan": pan,
            "ip_address": ip,
        }
        self.audit_logs.append(log_entry)
        # Persist to database
        try:
            from ..db.session import SessionLocal
            from ..db.repository import TaxpayerRepository
            db = SessionLocal()
            try:
                repo = TaxpayerRepository(db)
                repo.add_audit_log(
                    actor=actor,
                    action=action,
                    details=details,
                    pan=pan,
                    ip_address=ip,
                )
            finally:
                db.close()
        except Exception:
            pass

case_manager = CaseManager()
