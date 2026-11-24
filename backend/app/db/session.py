"""
Database Session and Engine Management for CA Bharat AI
Supports SQLite (Local Dev & Testing) and PostgreSQL (Production Render)
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from ..config import settings

def get_database_url() -> str:
    url = os.getenv("DATABASE_URL", settings.DATABASE_URL)
    # Render provides postgres:// which SQLAlchemy 1.4+ deprecated in favor of postgresql://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return url

DATABASE_URL = get_database_url()

# Configure engine based on database dialect
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """FastAPI Dependency for database session injection"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def _run_migrations(engine):
    """Safely adds missing columns to existing SQLite/Postgres tables without data loss."""
    from sqlalchemy import inspect, text
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    if "uploaded_documents" in tables:
        existing_cols = {col["name"] for col in inspector.get_columns("uploaded_documents")}
        cols_to_add = [
            ("client_id", "VARCHAR(64)"),
            ("case_id", "VARCHAR(64)"),
            ("assessment_year", "VARCHAR(16) DEFAULT 'AY 2025-26'"),
            ("checklist_item_ids_json", "TEXT"),
            ("processing_status", "VARCHAR(32) DEFAULT 'PARSED'"),
            ("ca_review_status", "VARCHAR(32) DEFAULT 'PENDING_REVIEW'"),
            ("file_hash_sha256", "VARCHAR(64)"),
            ("file_size_bytes", "INTEGER DEFAULT 0"),
            ("file_type", "VARCHAR(64) DEFAULT 'application/pdf'"),
            ("storage_path", "VARCHAR(512)"),
            ("review_notes", "TEXT"),
            ("waive_reason", "TEXT"),
        ]
        with engine.begin() as conn:
            for col_name, col_type in cols_to_add:
                if col_name not in existing_cols:
                    try:
                        conn.execute(text(f"ALTER TABLE uploaded_documents ADD COLUMN {col_name} {col_type}"))
                    except Exception as e:
                        print(f"Migration note for uploaded_documents.{col_name}: {e}")

    if "taxpayer_profiles" in tables:
        existing_cols = {col["name"] for col in inspector.get_columns("taxpayer_profiles")}
        cols_to_add = [
            ("legal_type", "VARCHAR(32) DEFAULT 'INDIVIDUAL'"),
            ("occupation_profile", "VARCHAR(32)"),
            ("residential_status", "VARCHAR(32) DEFAULT 'RESIDENT'"),
            ("dob_or_doi", "VARCHAR(32)"),
            ("karta_name", "VARCHAR(128)"),
            ("karta_pan", "VARCHAR(10)"),
            ("huf_deed_date", "VARCHAR(32)"),
            ("entity_reg_no", "VARCHAR(64)"),
            ("registered_office_address", "TEXT"),
            ("responsible_person_name", "VARCHAR(128)"),
            ("responsible_person_pan", "VARCHAR(10)"),
            ("responsible_person_designation", "VARCHAR(64)"),
            ("discovery_json", "TEXT"),
        ]
        with engine.begin() as conn:
            for col_name, col_type in cols_to_add:
                if col_name not in existing_cols:
                    try:
                        conn.execute(text(f"ALTER TABLE taxpayer_profiles ADD COLUMN {col_name} {col_type}"))
                    except Exception as e:
                        print(f"Migration note for taxpayer_profiles.{col_name}: {e}")

def init_db():
    """Initializes all database tables and runs initial statutory seed if empty"""
    from . import models
    Base.metadata.create_all(bind=engine)
    try:
        _run_migrations(engine)
    except Exception as e:
        print(f"Warning during DB migrations: {e}")
    from .seed import seed_initial_data
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()
