"""
Pydantic Models for 5 Statutory Heads of Income, Regime Optimization & Tax Computation
Governed by Finance Act, 2024 and Section 115BAC (AY 2025-26 & AY 2024-25)
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum

class TaxRegimeEnum(str, Enum):
    NEW_REGIME_115BAC = "NEW_REGIME_115BAC"
    OLD_REGIME = "OLD_REGIME"

class IncomeHeadDetails(BaseModel):
    # Head 1: Salaries (Sec 15-17)
    income_salaries: float = 0.0

    # Head 2: House Property (Sec 22-27)
    income_house_property: float = 0.0  # Can be negative for interest u/s 24(b)

    # Head 3: Profits and Gains of Business / Profession (Sec 28-44)
    # Includes Sec 44ADA 50% deemed profit or Sec 44AD 6%/8% profit
    income_pgbp: float = 0.0
    is_presumptive_44ada: bool = False
    gross_professional_receipts: float = 0.0

    # Head 4: Capital Gains (Sec 45-55)
    stcg_111a: float = 0.0
    stcg_slab: float = 0.0
    ltcg_112a: float = 0.0
    ltcg_112: float = 0.0
    total_capital_gains: float = 0.0

    # Head 5: Other Sources (Sec 56-59)
    savings_interest: float = 0.0
    fd_interest: float = 0.0
    dividend_income: float = 0.0
    other_sources_misc: float = 0.0
    total_other_sources: float = 0.0

    # Total Gross Income
    gross_total_income: float = 0.0

class DeductionsDetail(BaseModel):
    standard_deduction: float = 75000.0  # 75k New / 50k Old
    professional_tax: float = 0.0
    sec_80c: float = 0.0
    sec_80ccd_1b_nps: float = 0.0
    sec_80d_health: float = 0.0
    sec_80e_education_loan: float = 0.0
    sec_80g_donations: float = 0.0
    sec_80tta_ttb_interest: float = 0.0
    total_chapter_via_deductions: float = 0.0

class TaxComputationResult(BaseModel):
    regime: TaxRegimeEnum
    assessment_year: str = "2025-26"
    gross_total_income: float
    total_deductions: float
    total_taxable_income: float
    basic_tax: float
    rebate_87a: float
    tax_after_rebate: float
    surcharge: float
    health_and_education_cess: float
    total_tax_liability: float
    tds_tcs_credit: float
    advance_tax_paid: float
    self_assessment_tax_paid: float = 0.0
    total_prepaid_tax: float
    net_tax_payable_or_refund: float  # Negative indicates Refund
    effective_tax_rate: float
    is_refund: bool
    refund_amount: float
    tax_due_amount: float

class RegimeComparisonResult(BaseModel):
    client_id: Optional[str] = None
    case_id: Optional[str] = None
    client_pan: str
    client_name: str
    assessment_year: str = "2025-26"
    new_regime: TaxComputationResult
    old_regime: TaxComputationResult
    recommended_regime: TaxRegimeEnum
    tax_savings: float
    ca_sign_off_status: str = "PENDING_CA_REVIEW"  # PENDING_CA_REVIEW / CA_APPROVED
    ca_approver: Optional[str] = None
    ca_approval_timestamp: Optional[str] = None
    verification_hash: Optional[str] = None
    ca_notes: Optional[str] = None
    data_source: str = "VALIDATED_BACKEND_DOCUMENTS"
    validation_status: str = "READY"  # READY / UNVERIFIED_DOCS / UNRESOLVED_DISCREPANCIES
    validation_gate: Dict[str, Any] = Field(default_factory=dict)
    income_summary: Dict[str, Any] = Field(default_factory=dict)
    deductions_summary: Dict[str, Any] = Field(default_factory=dict)
