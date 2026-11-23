"""
Pydantic Models for Extracted Tax Documents
Supports Form 16 (Part A & B), Form 26AS (TRACES), AIS/TIS with Source Citations
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class SourceCitation(BaseModel):
    field_name: str
    page_number: int
    bounding_box: List[float] = Field(default_factory=lambda: [0.0, 0.0, 0.0, 0.0])  # [x0, y0, x1, y1]
    raw_text: str
    confidence: float = 0.99
    document_name: str

class TDSQuarterRecord(BaseModel):
    quarter: str  # Q1, Q2, Q3, Q4
    receipt_number: Optional[str] = None
    amount_paid_credited: float
    tax_deducted: float
    tax_deposited: float

class Form16PartA(BaseModel):
    employer_name: str
    employer_tan: str
    employer_pan: Optional[str] = None
    employee_name: str
    employee_pan: str
    assessment_year: str = "2025-26"
    period_from: str = "01-Apr-2024"
    period_to: str = "31-Mar-2025"
    quarters: List[TDSQuarterRecord] = Field(default_factory=list)
    total_tax_deducted: float = 0.0
    total_tax_deposited: float = 0.0

class ChapterVIAItem(BaseModel):
    section: str  # e.g., "80C", "80CCD(1B)", "80D", "80E", "80TTA"
    gross_amount: float
    deductible_amount: float

class Form16PartB(BaseModel):
    # Gross Salary u/s 17
    salary_us_17_1: float = 0.0
    perquisites_us_17_2: float = 0.0
    profits_in_lieu_us_17_3: float = 0.0
    gross_salary: float = 0.0

    # Allowances exempt u/s 10
    hra_us_10_13a: float = 0.0
    lta_us_10_5: float = 0.0
    other_exempt_allowances: float = 0.0
    total_exempt_allowances: float = 0.0
    net_salary_after_exemptions: float = 0.0

    # Deductions u/s 16
    standard_deduction_us_16ia: float = 75000.0  # AY 2025-26 default
    entertainment_allowance_us_16ii: float = 0.0
    professional_tax_us_16iii: float = 0.0
    total_deductions_us_16: float = 75000.0
    income_chargeable_under_salaries: float = 0.0

    # Other income reported
    income_from_house_property: float = 0.0
    income_from_other_sources: float = 0.0
    gross_total_income: float = 0.0

    # Chapter VI-A Deductions
    chapter_via_deductions: List[ChapterVIAItem] = Field(default_factory=list)
    total_chapter_via: float = 0.0

    # Computation
    total_taxable_income: float = 0.0
    tax_on_total_income: float = 0.0
    rebate_us_87a: float = 0.0
    surcharge: float = 0.0
    health_and_education_cess: float = 0.0
    relief_us_89: float = 0.0
    net_tax_payable: float = 0.0

class Form26ASTDSItem(BaseModel):
    deductor_name: str
    deductor_tan: str
    section: str  # 192 (Salary), 194J (Professional), 194C (Contract), 194A (Interest)
    total_amount_credited: float
    total_tax_deducted: float
    total_tax_deposited: float
    booking_status: str = "MATCHED"  # MATCHED / UNMATCHED

class Form26ASAdvanceTaxItem(BaseModel):
    major_head: str = "0021"  # Income Tax
    minor_head: str = "100"   # 100 Advance Tax, 300 Self Assessment Tax
    bsr_code: str
    challan_serial_no: str
    deposit_date: str
    tax_paid: float

class Form26ASData(BaseModel):
    pan: str
    taxpayer_name: str
    financial_year: str = "2024-25"
    assessment_year: str = "2025-26"
    tds_salary_part_a: List[Form26ASTDSItem] = Field(default_factory=list)
    tds_non_salary_part_b: List[Form26ASTDSItem] = Field(default_factory=list)
    tcs_part_c: List[Dict[str, Any]] = Field(default_factory=list)
    advance_tax_challans_part_d: List[Form26ASAdvanceTaxItem] = Field(default_factory=list)
    total_tds_credit_claimed: float = 0.0
    total_advance_tax_paid: float = 0.0

class AISTISItem(BaseModel):
    info_code: str  # e.g., "TDS-192", "INT-SAV", "INT-TIME", "DIV-001", "SFT-005"
    category: str   # Salary, Savings Interest, Dividend, Securities Sale, Property
    description: str
    source_reporting_entity: str
    gross_amount: float
    taxable_amount: float
    tax_deducted: float = 0.0
    count: int = 1
    feedback_status: str = "ACCEPTED"  # ACCEPTED, MODIFIED, DENIED

class AISTISData(BaseModel):
    pan: str
    taxpayer_name: str
    financial_year: str = "2024-25"
    assessment_year: str = "2025-26"
    items: List[AISTISItem] = Field(default_factory=list)
    total_reported_income: float = 0.0
    total_tds_reported: float = 0.0

class ExtractionResult(BaseModel):
    document_id: str
    document_type: str  # FORM_16, FORM_26AS, AIS_TIS, BANK_STATEMENT
    file_name: str
    client_pan: str
    assessment_year: str = "2025-26"
    extracted_data: Dict[str, Any]
    citations: List[SourceCitation] = Field(default_factory=list)
    ocr_confidence: float = 0.99
    processed_at: str
