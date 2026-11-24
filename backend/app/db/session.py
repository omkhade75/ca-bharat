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

def init_db():
    """Initializes all database tables and runs initial statutory seed if empty"""
    from . import models
    Base.metadata.create_all(bind=engine)
    from .seed import seed_initial_data
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()
