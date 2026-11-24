"""
Database Package for CA Bharat AI
"""

from .session import get_db, init_db, SessionLocal, Base
from .models import (
    DBClientProfile,
    DBUploadedDocument,
    DBReconciliationItem,
    DBTaxComputation,
    DBDPDPConsent,
    DBAuditLog,
)
from .repository import TaxpayerRepository

__all__ = [
    "get_db",
    "init_db",
    "SessionLocal",
    "Base",
    "DBClientProfile",
    "DBUploadedDocument",
    "DBReconciliationItem",
    "DBTaxComputation",
    "DBDPDPConsent",
    "DBAuditLog",
    "TaxpayerRepository",
]
