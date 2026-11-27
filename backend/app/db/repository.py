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

    def get_client_by_id(self, client_id: str) -> Optional[DBClientProfile]:
        return self.db.query(DBClientProfile).filter(DBClientProfile.id == client_id).first()

    def create_or_update_client(self, client_data: Dict[str, Any]) -> DBClientProfile:
        cleaned = dict(client_data)
        pan = str(cleaned.get("pan") or "").strip().upper()
        cleaned["pan"] = pan

        # Normalize optional empty strings & column caps for strict PostgreSQL VARCHAR constraints
        for opt_pan_key in ("tan", "karta_pan", "responsible_person_pan"):
            if opt_pan_key in cleaned:
                val = str(cleaned[opt_pan_key] or "").strip().upper()
                cleaned[opt_pan_key] = val[:10] if val else None

        cap_map = {
            "id": 64,
            "name": 128,
            "legal_type": 32,
            "occupation_profile": 32,
            "residential_status": 32,
            "dob_or_doi": 32,
            "category": 128,
            "tier": 32,
            "recommended_itr": 64,
            "email": 128,
            "mobile": 20,
            "employer_or_trade_name": 128,
            "entity_reg_no": 64,
            "bank_account_no": 32,
            "bank_ifsc": 16,
            "bank_name": 64,
            "status": 32,
        }
        for col, max_len in cap_map.items():
            if col in cleaned and cleaned[col] is not None:
                val = str(cleaned[col]).strip()
                cleaned[col] = val[:max_len] if val else ("" if col in ("category", "name") else None)

        existing = self.get_client_by_pan(pan) or (
            self.get_client_by_id(cleaned["id"]) if cleaned.get("id") else None
        )
        if existing:
            for k, v in cleaned.items():
                if hasattr(existing, k) and k != "id" and v is not None:
                    setattr(existing, k, v)
            existing.updated_at = datetime.now(timezone.utc)
            self.db.commit()
            self.db.refresh(existing)
            return existing
        else:
            client = DBClientProfile(**cleaned)
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

    def get_documents_by_client_id(self, client_id: str, case_id: Optional[str] = None) -> List[DBUploadedDocument]:
        """Fetches documents using authenticated client_id without exposing PAN in URL routes."""
        query = self.db.query(DBUploadedDocument).filter(DBUploadedDocument.client_id == client_id)
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
        extraction_engine: str = "DETERMINISTIC_PDF",
        evidence_score: Optional[float] = None,
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
            citations_json=json.dumps(citations or []),
            corrected_fields_json=json.dumps({}),
            extraction_engine=extraction_engine,
            evidence_score=evidence_score,
            uploaded_at=datetime.now(timezone.utc),
        )
        self.db.add(doc)
        self.db.commit()
        self.db.refresh(doc)
        return doc

    def save_document_extraction(
        self,
        doc_id: str,
        extracted_data: Dict[str, Any],
        citations: List[Dict[str, Any]],
        extraction_engine: str = "DETERMINISTIC_PDF",
        processing_status: str = "PARSED",
        evidence_score: Optional[float] = None,
        page_count: Optional[int] = None,
    ) -> Optional[DBUploadedDocument]:
        """Saves immutable parsed data and source citations to document record."""
        doc = self.get_document_by_id(doc_id)
        if doc:
            doc.extracted_data_json = json.dumps(extracted_data)
            doc.citations_json = json.dumps(citations)
            doc.extraction_engine = extraction_engine
            doc.processing_status = processing_status
            doc.status = processing_status
            doc.evidence_score = evidence_score
            if page_count is not None:
                doc.page_count = page_count
            self.db.commit()
            self.db.refresh(doc)
            return doc
        return None

    @staticmethod
    def _resolve_original_value(orig_data: Dict[str, Any], field_key: str) -> Any:
        """Resolves original extracted value from flat keys, dotted paths, or Form 16 sections."""
        if not isinstance(orig_data, dict):
            return None
        if field_key in orig_data:
            return orig_data[field_key]
        if "." in field_key:
            curr: Any = orig_data
            found = True
            for part in field_key.split("."):
                if isinstance(curr, dict) and part in curr:
                    curr = curr[part]
                elif isinstance(curr, list) and part.isdigit() and int(part) < len(curr):
                    curr = curr[int(part)]
                else:
                    found = False
                    break
            if found:
                return curr
        for section in ("part_b", "part_a"):
            sub = orig_data.get(section)
            if isinstance(sub, dict) and field_key in sub:
                return sub[field_key]
        return None

    @staticmethod
    def _find_matching_citation(citations_raw: Any, field_key: str) -> Optional[Dict[str, Any]]:
        """Locates immutable source citation corresponding to field_key when available."""
        key_leaf = field_key.split(".")[-1].lower().replace("_", " ")
        key_hints = {
            "salary_us_17_1": "17(1)",
            "perquisites_us_17_2": "17(2)",
            "profits_in_lieu_us_17_3": "17(3)",
            "hra_us_10_13a": "10(13a)",
            "lta_us_10_5": "10(5)",
            "standard_deduction_us_16ia": "16(ia)",
            "professional_tax_us_16iii": "16(iii)",
            "total_tax_deposited": "tds",
            "total_tax_deducted": "tds",
        }
        hint = key_hints.get(field_key.split(".")[-1].lower(), key_leaf)
        if isinstance(citations_raw, list):
            for c in citations_raw:
                fname = str(c.get("field_name", "")).lower()
                if hint in fname or key_leaf in fname:
                    return c
        elif isinstance(citations_raw, dict):
            leaf = field_key.split(".")[-1]
            if leaf in citations_raw:
                return {"field_name": leaf, **citations_raw[leaf]}
        return None

    def update_document_field_correction(
        self,
        doc_id: str,
        field_key: str,
        corrected_value: Any,
        reason: str,
        ca_identity: str = "Assigned Chartered Accountant",
        ca_actor_id: Optional[str] = None,
        ca_actor_role: Optional[str] = None,
    ) -> Optional[DBUploadedDocument]:
        """
        Stores CA corrected value separately with CA identity, mandatory justification, and timestamp,
        while strictly preserving the immutable original extracted value and citation.
        """
        doc = self.get_document_by_id(doc_id)
        if not doc:
            return None

        orig_data = {}
        if doc.extracted_data_json:
            try:
                orig_data = json.loads(doc.extracted_data_json)
            except Exception:
                pass

        citations_raw: Any = []
        if doc.citations_json:
            try:
                citations_raw = json.loads(doc.citations_json)
            except Exception:
                pass

        corrections = {}
        if doc.corrected_fields_json:
            try:
                corrections = json.loads(doc.corrected_fields_json)
            except Exception:
                pass

        # Preserve immutable first original value if already present in corrections
        if field_key in corrections and "original_value" in corrections[field_key]:
            orig_val = corrections[field_key]["original_value"]
        else:
            orig_val = self._resolve_original_value(orig_data, field_key)

        orig_citation = (
            corrections.get(field_key, {}).get("original_citation")
            or self._find_matching_citation(citations_raw, field_key)
        )

        now_iso = datetime.now(timezone.utc).isoformat()
        history = list(corrections.get(field_key, {}).get("correction_history", []))
        history.append({
            "corrected_value": corrected_value,
            "corrected_by": ca_identity,
            "corrected_by_id": ca_actor_id,
            "corrected_by_role": ca_actor_role,
            "correction_reason": reason,
            "corrected_at": now_iso,
        })

        corrections[field_key] = {
            "field_key": field_key,
            "original_value": orig_val,
            "corrected_value": corrected_value,
            "is_corrected": True,
            "corrected_by": ca_identity,
            "corrected_by_id": ca_actor_id,
            "corrected_by_role": ca_actor_role,
            "correction_reason": reason,
            "corrected_at": now_iso,
            "review_status": "CORRECTED",
            "original_citation": orig_citation,
            "correction_history": history,
        }

        doc.corrected_fields_json = json.dumps(corrections)
        self.db.commit()
        self.db.refresh(doc)
        return doc

    def verify_document_field(
        self,
        doc_id: str,
        field_key: str,
        ca_identity: str = "Assigned Chartered Accountant",
        ca_actor_id: Optional[str] = None,
        ca_actor_role: Optional[str] = None,
    ) -> Optional[DBUploadedDocument]:
        """Marks a field as verified by CA while preserving original extracted value and citation."""
        doc = self.get_document_by_id(doc_id)
        if not doc:
            return None

        orig_data = {}
        if doc.extracted_data_json:
            try:
                orig_data = json.loads(doc.extracted_data_json)
            except Exception:
                pass

        citations_raw: Any = []
        if doc.citations_json:
            try:
                citations_raw = json.loads(doc.citations_json)
            except Exception:
                pass

        corrections = {}
        if doc.corrected_fields_json:
            try:
                corrections = json.loads(doc.corrected_fields_json)
            except Exception:
                pass

        existing = corrections.get(field_key, {})
        if "original_value" not in existing:
            existing["original_value"] = self._resolve_original_value(orig_data, field_key)
        if "original_citation" not in existing:
            existing["original_citation"] = self._find_matching_citation(citations_raw, field_key)

        existing.update({
            "field_key": field_key,
            "review_status": "VERIFIED",
            "verified_by": ca_identity,
            "verified_by_id": ca_actor_id,
            "verified_by_role": ca_actor_role,
            "verified_at": datetime.now(timezone.utc).isoformat(),
        })
        corrections[field_key] = existing

        doc.corrected_fields_json = json.dumps(corrections)
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
    def get_reconciliation_items_by_pan(
        self, pan: str, case_id: Optional[str] = None
    ) -> List[DBReconciliationItem]:
        query = self.db.query(DBReconciliationItem).filter(
            DBReconciliationItem.client_pan == pan.upper()
        )
        if case_id:
            query = query.filter(
                (DBReconciliationItem.case_id == case_id)
                | (DBReconciliationItem.case_id.is_(None))
            )
        return query.all()

    def get_reconciliation_items_by_client_id(
        self, client_id: str, case_id: Optional[str] = None
    ) -> List[DBReconciliationItem]:
        query = self.db.query(DBReconciliationItem).filter(
            DBReconciliationItem.client_id == client_id
        )
        if case_id:
            query = query.filter(
                (DBReconciliationItem.case_id == case_id)
                | (DBReconciliationItem.case_id.is_(None))
            )
        return query.all()

    def set_reconciliation_items(self, pan: str, items: List[Dict[str, Any]]):
        # Clear existing items for fresh reconciliation run
        self.db.query(DBReconciliationItem).filter(DBReconciliationItem.client_pan == pan.upper()).delete()
        ts = int(datetime.now(timezone.utc).timestamp())
        for idx, item in enumerate(items):
            recon = DBReconciliationItem(
                id=item.get("id") or f"recon-{pan.upper()}-{idx+1}-{ts}",
                client_id=item.get("client_id"),
                case_id=item.get("case_id"),
                client_pan=pan.upper(),
                row_key=item.get("row_key") or item.get("id"),
                category=item.get("category"),
                source_a=item.get("source_a", ""),
                source_b=item.get("source_b", ""),
                field_name=item.get("field_name", ""),
                amount_a=item.get("amount_a"),
                amount_b=item.get("amount_b"),
                ais_value=item.get("ais_value"),
                variance=item.get("variance", 0.0),
                status=item.get("status", "MATCH"),
                match_status=item.get("match_status"),
                notice_risk=item.get("notice_risk", "LOW"),
                statutory_rule=item.get("statutory_rule"),
                explanation=item.get("explanation"),
                resolution_action=item.get("resolution_action"),
                resolved_value=item.get("resolved_value", 0.0),
                ca_notes=item.get("ca_notes"),
                is_accepted=item.get("is_accepted", False),
                resolved_by=item.get("resolved_by"),
                resolved_at=item.get("resolved_at"),
                source_citations_json=json.dumps(item.get("source_citations", [])),
                original_values_json=json.dumps(item.get("original_extracted_values", {})),
                corrections_applied_json=json.dumps(item.get("ca_corrections_applied", [])),
            )
            self.db.add(recon)
        self.db.commit()

    def save_reconciliation_matrix(self, matrix: Any) -> List[DBReconciliationItem]:
        """Persists a full ReconciliationMatrix to database preserving client/case IDs and citations."""
        pan_upper = matrix.client_pan.upper()
        self.db.query(DBReconciliationItem).filter(
            DBReconciliationItem.client_pan == pan_upper
        ).delete()

        saved_rows: List[DBReconciliationItem] = []
        ts = int(datetime.now(timezone.utc).timestamp() * 1000)
        for row in matrix.rows:
            status_str = "RESOLVED" if row.is_resolved else "MISMATCH"
            if row.match_status.value == "MATCHED" and row.is_resolved:
                status_str = "MATCH"
            item = DBReconciliationItem(
                id=f"{pan_upper}-{row.id}-{ts}",
                client_id=matrix.client_id,
                case_id=matrix.case_id,
                client_pan=pan_upper,
                row_key=row.id,
                category=row.category,
                source_a="Form 16",
                source_b="Form 26AS / AIS",
                field_name=row.field_label,
                amount_a=row.form_16_value,
                amount_b=row.form_26as_value,
                ais_value=row.ais_value,
                variance=row.variance,
                status=status_str,
                match_status=row.match_status.value,
                notice_risk=row.notice_risk.value,
                statutory_rule=row.statutory_rule,
                explanation=row.explanation,
                resolution_action=(row.resolution_action.value if hasattr(row.resolution_action, "value") else str(row.resolution_action)),
                resolved_value=row.resolved_value,
                ca_notes=row.ca_notes,
                is_accepted=row.is_resolved,
                resolved_by=row.resolved_by,
                resolved_at=row.resolved_at,
                source_citations_json=json.dumps(row.source_citations or []),
                original_values_json=json.dumps(row.original_extracted_values or {}),
                corrections_applied_json=json.dumps(row.ca_corrections_applied or []),
            )
            self.db.add(item)
            saved_rows.append(item)

        self.db.commit()
        for obj in saved_rows:
            self.db.refresh(obj)
        return saved_rows

    def resolve_reconciliation_row(
        self,
        pan: str,
        row_key_or_id: str,
        action: str,
        ca_notes: str,
        resolved_by: str,
        resolved_value: Optional[float] = None,
        client_id: Optional[str] = None,
    ) -> Optional[DBReconciliationItem]:
        query = self.db.query(DBReconciliationItem).filter(
            DBReconciliationItem.client_pan == pan.upper()
        )
        if client_id:
            query = query.filter(
                (DBReconciliationItem.client_id == client_id)
                | (DBReconciliationItem.client_id.is_(None))
            )
        rows = query.all()
        target = next(
            (r for r in rows if r.row_key == row_key_or_id or r.id == row_key_or_id),
            None,
        )
        if not target:
            return None

        target.is_accepted = True
        target.status = "RESOLVED"
        target.resolution_action = action
        target.ca_notes = ca_notes
        target.resolved_by = resolved_by
        target.resolved_at = datetime.now(timezone.utc).isoformat()
        if resolved_value is not None:
            target.resolved_value = float(resolved_value)
        elif action == "CLAIM_PORTAL_SAFE":
            candidates = [v for v in (target.form_26as_value if hasattr(target, "form_26as_value") else target.amount_b, target.ais_value) if v is not None]
            if candidates:
                target.resolved_value = float(candidates[0])
        elif action == "ACCEPT_CLIENT_DOCUMENT" and target.amount_a is not None:
            target.resolved_value = float(target.amount_a)
        elif action == "ADD_TO_OTHER_SOURCES" and target.ais_value is not None:
            target.resolved_value = float(target.ais_value)

        self.db.commit()
        self.db.refresh(target)
        return target

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

    def get_tax_computation_by_client_id(self, client_id: str) -> Optional[DBTaxComputation]:
        return (
            self.db.query(DBTaxComputation)
            .filter(DBTaxComputation.client_id == client_id)
            .order_by(DBTaxComputation.created_at.desc())
            .first()
        )

    def save_tax_computation(self, pan: str, computation_data: Dict[str, Any]) -> DBTaxComputation:
        comp_id = f"tax-{pan.upper()}-{int(datetime.now(timezone.utc).timestamp()*1000)}"
        comp = DBTaxComputation(
            id=comp_id,
            client_id=computation_data.get("client_id"),
            case_id=computation_data.get("case_id"),
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
            data_source=computation_data.get("data_source", "VALIDATED_BACKEND_DOCUMENTS"),
            validation_status=computation_data.get("validation_status", "READY"),
            validation_gate_json=json.dumps(computation_data.get("validation_gate", {})),
            selected_itr_form=computation_data.get("selected_itr_form", "ITR-1"),
            itr_selection_json=json.dumps(computation_data.get("itr_selection", {})) if computation_data.get("itr_selection") else None,
            filing_package_json=json.dumps(computation_data.get("filing_package", {})) if computation_data.get("filing_package") else None,
            ca_review_status=computation_data.get("ca_review_status", "PENDING_CA_REVIEW"),
            ca_return_reason=computation_data.get("ca_return_reason"),
            is_ca_approved=computation_data.get("is_ca_approved", False),
            ca_approver=computation_data.get("ca_approver"),
            ca_sign_off_hash=computation_data.get("ca_sign_off_hash"),
            ca_notes=computation_data.get("ca_notes"),
            approved_at=datetime.now(timezone.utc) if computation_data.get("is_ca_approved") else None,
        )
        self.db.add(comp)
        self.db.commit()
        self.db.refresh(comp)
        return comp

    def approve_tax_computation(
        self,
        pan: str,
        ca_approver: str,
        sign_off_hash: str,
        ca_notes: str,
        recommended_regime: Optional[str] = None,
        client_id: Optional[str] = None,
    ) -> Optional[DBTaxComputation]:
        comp = self.get_tax_computation_by_client_id(client_id) if client_id else None
        if not comp:
            comp = self.get_tax_computation_by_pan(pan)
        if not comp:
            return None
        comp.is_ca_approved = True
        comp.ca_approver = ca_approver
        comp.ca_sign_off_hash = sign_off_hash
        comp.ca_notes = ca_notes
        if recommended_regime:
            comp.recommended_regime = recommended_regime
        comp.approved_at = datetime.now(timezone.utc)
        comp.ca_review_status = "CA_APPROVED"
        self.db.commit()
        self.db.refresh(comp)
        return comp

    def update_itr_selection(
        self,
        pan: str,
        selected_itr_form: str,
        itr_selection_data: Dict[str, Any],
        client_id: Optional[str] = None,
        ca_notes: Optional[str] = None,
        confirmed_by: Optional[str] = None,
    ) -> Optional[DBTaxComputation]:
        comp = self.get_tax_computation_by_client_id(client_id) if client_id else None
        if not comp:
            comp = self.get_tax_computation_by_pan(pan)
        if not comp:
            comp = self.save_tax_computation(
                pan=pan,
                computation_data={
                    "client_id": client_id,
                    "selected_itr_form": selected_itr_form,
                    "itr_selection": itr_selection_data,
                    "details": {},
                },
            )
        comp.selected_itr_form = selected_itr_form
        comp.itr_selection_json = json.dumps(itr_selection_data)
        if ca_notes:
            comp.ca_notes = ca_notes
        self.db.commit()
        self.db.refresh(comp)
        return comp

    def reject_tax_computation(
        self,
        pan: str,
        ca_rejector: str,
        reason: str,
        client_id: Optional[str] = None,
    ) -> Optional[DBTaxComputation]:
        comp = self.get_tax_computation_by_client_id(client_id) if client_id else None
        if not comp:
            comp = self.get_tax_computation_by_pan(pan)
        if not comp:
            return None
        comp.is_ca_approved = False
        comp.ca_review_status = "REJECTED"
        comp.ca_approver = ca_rejector
        comp.ca_return_reason = reason
        comp.ca_notes = f"REJECTED by CA: {reason}"
        self.db.commit()
        self.db.refresh(comp)
        return comp

    def return_tax_computation_for_correction(
        self,
        pan: str,
        ca_actor: str,
        reason: str,
        client_id: Optional[str] = None,
    ) -> Optional[DBTaxComputation]:
        comp = self.get_tax_computation_by_client_id(client_id) if client_id else None
        if not comp:
            comp = self.get_tax_computation_by_pan(pan)
        if not comp:
            return None
        comp.is_ca_approved = False
        comp.ca_review_status = "RETURNED_FOR_CORRECTION"
        comp.ca_approver = ca_actor
        comp.ca_return_reason = reason
        comp.ca_notes = f"RETURNED FOR CORRECTION: {reason}"
        self.db.commit()
        self.db.refresh(comp)
        return comp

    def save_filing_package(
        self,
        pan: str,
        filing_package_data: Dict[str, Any],
        client_id: Optional[str] = None,
    ) -> Optional[DBTaxComputation]:
        comp = self.get_tax_computation_by_client_id(client_id) if client_id else None
        if not comp:
            comp = self.get_tax_computation_by_pan(pan)
        if not comp:
            comp = self.save_tax_computation(
                pan=pan,
                computation_data={
                    "client_id": client_id,
                    "selected_itr_form": filing_package_data.get("selected_itr_form", "ITR-1 (Sahaj)"),
                    "filing_package": filing_package_data,
                    "details": {},
                },
            )
            return comp
        comp.filing_package_json = json.dumps(filing_package_data)
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
