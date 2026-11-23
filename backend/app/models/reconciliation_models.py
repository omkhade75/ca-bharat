"""
Pydantic Models for 3-Way Reconciliation Matrix & Discrepancy Audits
Form 16 vs TRACES Form 26AS vs AIS/TIS with Section 143(1)(a) Notice Prevention
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

class MatchStatusEnum(str, Enum):
    MATCHED = "MATCHED"
    MISMATCH_VARIANCE = "MISMATCH_VARIANCE"
    MISSING_IN_CLIENT_DOC = "MISSING_IN_CLIENT_DOC"
    MISSING_IN_PORTAL_26AS = "MISSING_IN_PORTAL_26AS"
    AIS_UNRECORDED_INCOME = "AIS_UNRECORDED_INCOME"

class NoticeRiskEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class ResolutionActionEnum(str, Enum):
    NO_ACTION = "NO_ACTION"
    CLAIM_PORTAL_SAFE = "CLAIM_PORTAL_SAFE"
    DRAFT_DEDUCTOR_RECTIFICATION = "DRAFT_DEDUCTOR_RECTIFICATION"
    ADD_TO_OTHER_SOURCES = "ADD_TO_OTHER_SOURCES"
    ACCEPT_CLIENT_DOCUMENT = "ACCEPT_CLIENT_DOCUMENT"

class ReconciliationRow(BaseModel):
    id: str
    category: str  # Salary, Professional Receipts, TDS, Other Sources, Capital Gains
    field_label: str  # e.g., "Salary Income", "TDS on Salary (Sec 192)", "Savings Bank Interest"
    form_16_value: Optional[float] = None
    form_26as_value: Optional[float] = None
    ais_value: Optional[float] = None
    variance: float = 0.0
    match_status: MatchStatusEnum = MatchStatusEnum.MATCHED
    notice_risk: NoticeRiskEnum = NoticeRiskEnum.LOW
    statutory_rule: str
    explanation: str
    recommended_action: ResolutionActionEnum
    is_resolved: bool = True
    resolved_value: float = 0.0
    ca_notes: Optional[str] = None

class ReconciliationMatrix(BaseModel):
    client_pan: str
    client_name: str
    assessment_year: str = "2025-26"
    rows: List[ReconciliationRow] = Field(default_factory=list)
    total_items: int = 0
    total_discrepancies: int = 0
    high_risk_count: int = 0
    all_reconciled: bool = True
    reconciled_at: Optional[str] = None
    ca_reviewer_name: Optional[str] = None
