"""
Pydantic Models for 3-Way Reconciliation Matrix & Discrepancy Audits
Form 16 vs TRACES Form 26AS vs AIS/TIS with Section 143(1)(a) Notice Prevention
Preserves immutable original extracted values, source citations, CA corrections, and resolution history.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
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
    category: str  # Salary Income, Professional Receipts, Tax Deducted at Source, Income from Other Sources, Capital Gains
    field_label: str
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
    source_citations: List[Dict[str, Any]] = Field(default_factory=list)
    original_extracted_values: Dict[str, Any] = Field(default_factory=dict)
    ca_corrections_applied: List[Dict[str, Any]] = Field(default_factory=list)
    source_doc_ids: List[str] = Field(default_factory=list)
    resolved_by: Optional[str] = None
    resolved_at: Optional[str] = None
    resolution_action: Optional[str] = None


class ReconciliationMatrix(BaseModel):
    client_id: Optional[str] = None
    case_id: Optional[str] = None
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
    data_source: str = "BACKEND_EXTRACTED_DOCS"
    source_documents: List[Dict[str, Any]] = Field(default_factory=list)
    validation_summary: Dict[str, Any] = Field(default_factory=dict)
