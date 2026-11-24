"""
Database Repository Layer for CA Bharat AI
Encapsulates CRUD operations, relations, and transactions for Taxpayer Profiles,
Documents, Reconciliations, and Computations.
"""

from typing import List, Optional, Dict, Any
import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from .models import (
    DBClientProfile,
    DBUploadedDocument,
    DBReconciliationItem,
    DBTaxComputation,
    DBDPDPConsent,
    DBAuditLog,
)

class TaxpayerRepository:
    def __init__(self, db: Session):
        self.db = db

    # --- Client Profile Operations ---
    def get_all_clients(self) -> List[DBClientProfile]:
        return self.db.query(DBClientProfile).order_by(DBClientProfile.name).all()

    def get_client_by_pan(self, pan: str) -> Optional[DBClientProfile]:
        return self.db.query(DBClientProfile).filter(DBClientProfile.pan == pan.upper()).first()

    def create_or_update_client(self, client_data: Dict[str, Any]) -> DBClientProfile:
        pan = client_data.get("pan", "").upper()
        existing = self.get_client_by_pan(pan)
        if existing:
            for k, v in client_data.items():
                if hasattr(existing, k) and v is not None:
                    setattr(existing, k, v)
            existing.updated_at = datetime.now(timezone.utc)
            self.db.commit()
            self.db.refresh(existing)
            return existing
        else:
            client = DBClientProfile(**client_data)
            self.db.add(client)
            self.db.commit()
            self.db.refresh(client)
            return client

    def delete_client(self, pan: str) -> bool:
        client = self.get_client_by_pan(pan)
        if client:
            self.db.delete(client)
            self.db.commit()
            return True
        return False

    # --- Document Operations ---
    def get_documents_by_pan(self, pan: str, case_id: Optional[str] = None) -> List[DBUploadedDocument]:
        query = self.db.query(DBUploadedDocument).filter(DBUploadedDocument.client_pan == pan.upper())
        if case_id:
            query = query.filter((DBUploadedDocument.case_id == case_id) | (DBUploadedDocument.case_id.is_(None)))
        return query.order_by(DBUploadedDocument.uploaded_at.desc()).all()

    def get_document_by_id(self, doc_id: str) -> Optional[DBUploadedDocument]:
        return self.db.query(DBUploadedDocument).filter(DBUploadedDocument.id == doc_id).first()

    def save_document(
        self,
        pan: str,
        filename: str,
        category: str,
        page_count: int = 1,
        extracted_data: Optional[Dict[str, Any]] = None,
        citations: Optional[Dict[str, Any]] = None,
        client_id: Optional[str] = None,
        case_id: Optional[str] = None,
        assessment_year: str = "AY 2025-26",
        checklist_item_ids: Optional[List[str]] = None,
        file_size_bytes: int = 0,
        file_hash_sha256: Optional[str] = None,
        file_type: str = "application/pdf",
        storage_path: Optional[str] = None,
        processing_status: str = "PARSED",
        ca_review_status: str = "PENDING_REVIEW",
    ) -> DBUploadedDocument:
        doc_id = f"doc-{pan.upper()}-{category.lower()}-{int(datetime.now(timezone.utc).timestamp()*1000)}"
        doc = DBUploadedDocument(
            id=doc_id,
            client_id=client_id,
            client_pan=pan.upper(),
            case_id=case_id,
            assessment_year=assessment_year,
            filename=filename,
            category=category,
            checklist_item_ids_json=json.dumps(checklist_item_ids or []),
            page_count=page_count,
            status=processing_status,
            processing_status=processing_status,
            ca_review_status=ca_review_status,
            file_hash_sha256=file_hash_sha256,
            file_size_bytes=file_size_bytes,
            file_type=file_type,
            storage_path=storage_path,
            extracted_data_json=json.dumps(extracted_data or {}),
            citations_json=json.dumps(citations or {}),
            uploaded_at=datetime.now(timezone.utc),
        )
        self.db.add(doc)
        self.db.commit()
        self.db.refresh(doc)
        return doc

    def update_document_status(
        self,
        doc_id: str,
        ca_review_status: str,
        review_notes: Optional[str] = None,
        waive_reason: Optional[str] = None,
    ) -> Optional[DBUploadedDocument]:
        doc = self.get_document_by_id(doc_id)
        if doc:
            doc.ca_review_status = ca_review_status
            if review_notes is not None:
                doc.review_notes = review_notes
            if waive_reason is not None:
                doc.waive_reason = waive_reason
            self.db.commit()
            self.db.refresh(doc)
            return doc
        return None

    def delete_document(self, doc_id: str) -> bool:
        doc = self.get_document_by_id(doc_id)
        if doc:
            self.db.delete(doc)
            self.db.commit()
            return True
        return False

    # --- Reconciliation Operations ---
    def get_reconciliation_items_by_pan(self, pan: str) -> List[DBReconciliationItem]:
        return self.db.query(DBReconciliationItem).filter(DBReconciliationItem.client_pan == pan.upper()).all()

    def set_reconciliation_items(self, pan: str, items: List[Dict[str, Any]]):
        # Clear existing items for fresh reconciliation run
        self.db.query(DBReconciliationItem).filter(DBReconciliationItem.client_pan == pan.upper()).delete()
        for idx, item in enumerate(items):
            recon = DBReconciliationItem(
                id=f"recon-{pan.upper()}-{idx+1}-{int(datetime.now(timezone.utc).timestamp())}",
                client_pan=pan.upper(),
                source_a=item.get("source_a", ""),
                source_b=item.get("source_b", ""),
                field_name=item.get("field_name", ""),
                amount_a=item.get("amount_a", 0.0),
                amount_b=item.get("amount_b", 0.0),
                variance=item.get("variance", 0.0),
                status=item.get("status", "MATCH"),
                notice_risk=item.get("notice_risk", "LOW"),
                resolution_action=item.get("resolution_action"),
                ca_notes=item.get("ca_notes"),
                is_accepted=item.get("is_accepted", False),
            )
            self.db.add(recon)
        self.db.commit()

    def update_reconciliation_item(self, item_id: str, is_accepted: bool, ca_notes: Optional[str] = None):
        item = self.db.query(DBReconciliationItem).filter(DBReconciliationItem.id == item_id).first()
        if item:
            item.is_accepted = is_accepted
            if ca_notes:
                item.ca_notes = ca_notes
            if is_accepted and item.status == "MISMATCH":
                item.status = "RESOLVED"
            self.db.commit()
            self.db.refresh(item)
            return item
        return None

    # --- Tax Computation & Approval Operations ---
    def get_tax_computation_by_pan(self, pan: str) -> Optional[DBTaxComputation]:
        return (
            self.db.query(DBTaxComputation)
            .filter(DBTaxComputation.client_pan == pan.upper())
            .order_by(DBTaxComputation.created_at.desc())
            .first()
        )

    def save_tax_computation(self, pan: str, computation_data: Dict[str, Any]) -> DBTaxComputation:
        comp_id = f"tax-{pan.upper()}-{int(datetime.now(timezone.utc).timestamp())}"
        comp = DBTaxComputation(
            id=comp_id,
            client_pan=pan.upper(),
            ay=computation_data.get("ay", "2025-26"),
            gross_total_income=computation_data.get("gross_total_income", 0.0),
            old_regime_tax=computation_data.get("old_regime_tax", 0.0),
            new_regime_tax=computation_data.get("new_regime_tax", 0.0),
            recommended_regime=computation_data.get("recommended_regime", "New Regime"),
            tds_credits=computation_data.get("tds_credits", 0.0),
            refund_due=computation_data.get("refund_due", 0.0),
            balance_payable=computation_data.get("balance_payable", 0.0),
            computation_json=json.dumps(computation_data.get("details", {})),
            is_ca_approved=computation_data.get("is_ca_approved", False),
            ca_sign_off_hash=computation_data.get("ca_sign_off_hash"),
            ca_notes=computation_data.get("ca_notes"),
            approved_at=datetime.now(timezone.utc) if computation_data.get("is_ca_approved") else None,
        )
        self.db.add(comp)
        self.db.commit()
        self.db.refresh(comp)
        return comp

    # --- Audit Log Operations ---
    def add_audit_log(
        self,
        actor: str,
        action: str,
        details: str,
        client_name: Optional[str] = None,
        pan: Optional[str] = None,
        category: str = "Compliance",
        ip_address: str = "127.0.0.1",
    ) -> DBAuditLog:
        log_id = f"log-{int(datetime.now(timezone.utc).timestamp()*1000)}"
        log = DBAuditLog(
            id=log_id,
            timestamp=datetime.now(timezone.utc),
            actor=actor,
            action=action,
            client_name=client_name,
            pan=pan.upper() if pan else None,
            details=details,
            ip_address=ip_address,
            category=category,
        )
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def get_all_audit_logs(self, limit: int = 50) -> List[DBAuditLog]:
        return self.db.query(DBAuditLog).order_by(DBAuditLog.timestamp.desc()).limit(limit).all()
