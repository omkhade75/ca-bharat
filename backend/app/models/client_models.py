"""
Pydantic Models for Indian Taxpayer Master and DPDP Act 2023 Consent
Covers Section 2(31) Statutory Legal Categories, Occupation Profiles & Tax Discovery
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from enum import Enum
import re

# 1. Statutory Legal Taxpayer Entity Classifications (Section 2(31))
class LegalTaxpayerTypeEnum(str, Enum):
    INDIVIDUAL = "INDIVIDUAL"
    HUF = "HUF"
    PARTNERSHIP_FIRM = "PARTNERSHIP_FIRM"
    LLP = "LLP"
    COMPANY = "COMPANY"
    TRUST = "TRUST"
    OTHER = "OTHER"

# 2. Individual Occupation & Employment Profiles
class IndividualOccupationEnum(str, Enum):
    SALARIED = "SALARIED"
    PROFESSIONAL = "PROFESSIONAL"
    BUSINESS_OWNER = "BUSINESS_OWNER"
    TRADER_INVESTOR = "TRADER_INVESTOR"
    PENSIONER = "PENSIONER"
    OTHER = "OTHER"

# 3. Residential Status (Section 6)
class ResidentialStatusEnum(str, Enum):
    RESIDENT = "RESIDENT"
    RNOR = "RNOR"
    NON_RESIDENT = "NON_RESIDENT"

# Backward compatibility category enum
class TaxpayerCategoryEnum(str, Enum):
    INDIVIDUAL_SALARIED = "Individual - Salaried"
    INDIVIDUAL_PROFESSIONAL = "Individual - Professional (Sec 44ADA)"
    INDIVIDUAL_BUSINESS = "Individual - Small Business (Sec 44AD)"
    INDIVIDUAL_INVESTOR = "Individual - Capital Market Trader & Investor"
    INDIVIDUAL_SENIOR = "Individual - Senior Citizen (Age 60+)"
    INDIVIDUAL_NRI = "Individual - Non-Resident Indian (NRI)"
    HUF = "Hindu Undivided Family (HUF)"
    PARTNERSHIP_FIRM = "Partnership Firm (Registered u/s 184)"
    LLP = "Limited Liability Partnership (LLP)"
    DOMESTIC_COMPANY = "Domestic Company (Private & Public Limited)"
    FOREIGN_COMPANY = "Foreign Company"
    CHARITABLE_TRUST = "Charitable Trust / NGO (Sec 11 & 12A)"
    AOP_BOI = "Association of Persons (AOP) / Body of Individuals (BOI)"
    COOPERATIVE_SOCIETY = "Co-operative Society (Sec 80P)"
    LOCAL_AUTHORITY = "Local Authority / Artificial Juridical Person"

class BankAccountDetails(BaseModel):
    account_number: str
    ifsc_code: str
    bank_name: str
    account_type: str = "SAVINGS"  # SAVINGS, CURRENT, CASH_CREDIT
    is_primary_for_refund: bool = True
    is_prevalidated: bool = True

class DPDPConsentRecord(BaseModel):
    consent_id: str
    pan: str
    client_name: str
    assessment_year: str = "2025-26"
    purpose: str = "Income Tax Return Preparation, AIS/26AS Verification & Annual Wealth Advisory"
    granted_at: str
    ip_address: str = "127.0.0.1"
    verification_mode: str = "SIMULATED_OTP"
    status: str = "ACTIVE"
    valid_until: str = "2027-03-31"

class ClientProfile(BaseModel):
    id: str
    pan: str
    name: str
    legal_type: LegalTaxpayerTypeEnum = LegalTaxpayerTypeEnum.INDIVIDUAL
    occupation_profile: Optional[IndividualOccupationEnum] = IndividualOccupationEnum.SALARIED
    residential_status: ResidentialStatusEnum = ResidentialStatusEnum.RESIDENT
    category: Optional[str] = "Individual - Salaried"
    recommended_itr: str = "ITR-1"
    selected_itr_form: Optional[str] = "ITR-1"
    itr_form_type: Optional[str] = "ITR-1 (Sahaj)"
    dob_or_doi: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    employer_or_trade_name: Optional[str] = None
    tan: Optional[str] = None
    
    # Conditional fields for HUF
    karta_name: Optional[str] = None
    karta_pan: Optional[str] = None
    huf_deed_date: Optional[str] = None

    # Conditional fields for Firm / LLP / Company / Trust
    entity_reg_no: Optional[str] = None  # CIN / LLPIN / Registration No
    registered_office_address: Optional[str] = None
    responsible_person_name: Optional[str] = None
    responsible_person_pan: Optional[str] = None
    responsible_person_designation: Optional[str] = None

    # Step 1 Tax Discovery data (5 heads, special disclosures, prior year info)
    intake_discovery: Optional[Dict[str, Any]] = None

    bank_details: Optional[BankAccountDetails] = None
    consent: Optional[DPDPConsentRecord] = None
    advisory_tier: str = "Gold"
    workflow_status: str = "DOCUMENTS_PENDING"
    created_at: str = "2026-06-01T10:00:00Z"

    @field_validator("pan")
    @classmethod
    def validate_pan(cls, v: str) -> str:
        clean = v.strip().upper()
        if not re.match(r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$", clean):
            raise ValueError(f"Invalid Indian PAN format: {v}. Must follow 5 letters, 4 digits, 1 letter.")
        return clean
