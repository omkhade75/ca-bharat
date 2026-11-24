"""
SQLAlchemy ORM Models for CA Bharat AI
Persistent storage for Taxpayer Profiles, Documents, 3-Way Reconciliations,
Deterministic Tax Computations, and DPDP Consent Audit Trail.
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    DateTime,
    Text,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from .session import Base

class DBClientProfile(Base):
    __tablename__ = "taxpayer_profiles"

    id = Column(String(64), primary_key=True, index=True)
    pan = Column(String(10), unique=True, index=True, nullable=False)
    name = Column(String(128), nullable=False)
    legal_type = Column(String(32), default="INDIVIDUAL")
    occupation_profile = Column(String(32), nullable=True)
    residential_status = Column(String(32), default="RESIDENT")
    dob_or_doi = Column(String(32), nullable=True)
    category = Column(String(128), nullable=False)
    tier = Column(String(32), default="Silver")
    recommended_itr = Column(String(16), default="ITR-1")
    email = Column(String(128), nullable=True)
    mobile = Column(String(20), nullable=True)
    employer_or_trade_name = Column(String(128), nullable=True)
    tan = Column(String(10), nullable=True)

    # HUF conditional fields
    karta_name = Column(String(128), nullable=True)
    karta_pan = Column(String(10), nullable=True)
    huf_deed_date = Column(String(32), nullable=True)

    # Firm / LLP / Company / Trust conditional fields
    entity_reg_no = Column(String(64), nullable=True)
    registered_office_address = Column(Text, nullable=True)
    responsible_person_name = Column(String(128), nullable=True)
    responsible_person_pan = Column(String(10), nullable=True)
    responsible_person_designation = Column(String(64), nullable=True)

    # Intake discovery & tax questions JSON
    discovery_json = Column(Text, nullable=True)

    bank_account_no = Column(String(32), nullable=True)
    bank_ifsc = Column(String(16), nullable=True)
    bank_name = Column(String(64), nullable=True)
    status = Column(String(32), default="Onboarding")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    documents = relationship("DBUploadedDocument", back_populates="taxpayer", cascade="all, delete-orphan")
    reconciliation_items = relationship("DBReconciliationItem", back_populates="taxpayer", cascade="all, delete-orphan")
    tax_computations = relationship("DBTaxComputation", back_populates="taxpayer", cascade="all, delete-orphan")
    consents = relationship("DBDPDPConsent", back_populates="taxpayer", cascade="all, delete-orphan")

class DBUploadedDocument(Base):
    __tablename__ = "uploaded_documents"

    id = Column(String(64), primary_key=True, index=True)
    client_id = Column(String(64), nullable=True, index=True)
    client_pan = Column(String(10), ForeignKey("taxpayer_profiles.pan"), index=True, nullable=False)
    case_id = Column(String(64), nullable=True, index=True)
    assessment_year = Column(String(16), default="AY 2025-26")
    filename = Column(String(256), nullable=False)
    category = Column(String(64), nullable=False)  # DocumentCategoryEnum or legacy
    checklist_item_ids_json = Column(Text, nullable=True)  # JSON list of satisfied checklist item IDs
    page_count = Column(Integer, default=1)
    status = Column(String(32), default="PARSED")  # legacy backward compat
    processing_status = Column(String(32), default="PARSED")  # UPLOADED, PARSING, PARSED, PARSING_FAILED
    ca_review_status = Column(String(32), default="PENDING_REVIEW")  # PENDING_REVIEW, VERIFIED, REJECTED, WAIVED
    file_hash_sha256 = Column(String(64), nullable=True)
    file_size_bytes = Column(Integer, default=0)
    file_type = Column(String(64), default="application/pdf")
    storage_path = Column(String(512), nullable=True)
    review_notes = Column(Text, nullable=True)
    waive_reason = Column(Text, nullable=True)
    extracted_data_json = Column(Text, nullable=True)  # JSON serialization of parsed fields
    citations_json = Column(Text, nullable=True)       # JSON bounding box coordinates [x0, y0, x1, y1]
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    taxpayer = relationship("DBClientProfile", back_populates="documents")

class DBReconciliationItem(Base):
    __tablename__ = "reconciliation_items"

    id = Column(String(64), primary_key=True, index=True)
    client_pan = Column(String(10), ForeignKey("taxpayer_profiles.pan"), index=True, nullable=False)
    source_a = Column(String(64), nullable=False)
    source_b = Column(String(64), nullable=False)
    field_name = Column(String(128), nullable=False)
    amount_a = Column(Float, default=0.0)
    amount_b = Column(Float, default=0.0)
    variance = Column(Float, default=0.0)
    status = Column(String(32), default="MATCH")  # MATCH, MISMATCH, RESOLVED
    notice_risk = Column(String(16), default="LOW")  # LOW, MEDIUM, HIGH
    resolution_action = Column(String(64), nullable=True)
    ca_notes = Column(Text, nullable=True)
    is_accepted = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    taxpayer = relationship("DBClientProfile", back_populates="reconciliation_items")

class DBTaxComputation(Base):
    __tablename__ = "tax_computations"

    id = Column(String(64), primary_key=True, index=True)
    client_pan = Column(String(10), ForeignKey("taxpayer_profiles.pan"), index=True, nullable=False)
    ay = Column(String(16), default="2025-26")
    gross_total_income = Column(Float, default=0.0)
    old_regime_tax = Column(Float, default=0.0)
    new_regime_tax = Column(Float, default=0.0)
    recommended_regime = Column(String(32), default="New Regime")
    tds_credits = Column(Float, default=0.0)
    refund_due = Column(Float, default=0.0)
    balance_payable = Column(Float, default=0.0)
    computation_json = Column(Text, nullable=True)  # Full breakdown JSON
    is_ca_approved = Column(Boolean, default=False)
    ca_sign_off_hash = Column(String(64), nullable=True)
    ca_notes = Column(Text, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    taxpayer = relationship("DBClientProfile", back_populates="tax_computations")

class DBDPDPConsent(Base):
    __tablename__ = "dpdp_consents"

    id = Column(String(64), primary_key=True, index=True)
    pan = Column(String(10), ForeignKey("taxpayer_profiles.pan"), index=True, nullable=False)
    client_name = Column(String(128), nullable=False)
    purpose = Column(Text, nullable=False)
    granted_at = Column(String(32), nullable=False)
    expires_at = Column(String(32), default="2027-03-31")
    ip_address = Column(String(45), default="127.0.0.1")
    status = Column(String(32), default="ACTIVE")
    verification_mode = Column(String(32), default="SIMULATED_OTP")
    token_hash = Column(String(64), nullable=True)

    taxpayer = relationship("DBClientProfile", back_populates="consents")

class DBAuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(64), primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    actor = Column(String(128), nullable=False)
    action = Column(String(64), nullable=False)
    client_name = Column(String(128), nullable=True)
    pan = Column(String(10), nullable=True, index=True)
    details = Column(Text, nullable=False)
    ip_address = Column(String(45), default="127.0.0.1")
    category = Column(String(64), default="Compliance")
