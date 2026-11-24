"""
Document Collection & Document Vault Integration API Routes (Phase B - Step 05)
Governed by ICAI Documentation Standards & DPDP Act, 2023.
Zero-LLM Deterministic Architecture.
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Query
from typing import Optional, List, Dict, Any
import hashlib
import json
import os
import shutil
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from ..db.session import get_db
from ..db.repository import TaxpayerRepository
from ..models.document_models import (
    DocumentRecord,
    DocumentCategoryEnum,
    ChecklistStatusEnum,
    DocumentProcessingStatusEnum,
    CAReviewStatusEnum,
    DocumentStatusUpdateRequest,
    MissingDocRequestPayload,
    MissingDocDraftNotice,
)
from ..services.case_manager import case_manager
from ..parsers.form16_parser import Form16Parser
from ..parsers.form26as_parser import Form26ASParser
from ..parsers.ais_tis_parser import AISTISParser

router = APIRouter(prefix="/api/documents", tags=["Document Vault & Collection"])

# Maximum file size: 25 MB
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024
ALLOWED_EXTENSIONS = {".pdf", ".json", ".png", ".jpg", ".jpeg"}

# Private storage base directory
STORAGE_BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "storage", "uploads")
os.makedirs(STORAGE_BASE_DIR, exist_ok=True)


@router.get("/{pan}", response_model=List[DocumentRecord])
def get_client_documents(
    pan: str,
    case_id: Optional[str] = Query(None, description="Optional tax case ID filter"),
    db: Session = Depends(get_db),
):
    """Fetches all documents linked to a client tax case with three-status indicators."""
    pan_upper = pan.upper()
    repo = TaxpayerRepository(db)
    db_docs = repo.get_documents_by_pan(pan_upper, case_id=case_id)

    records: List[DocumentRecord] = []
    for d in db_docs:
        checklist_items = []
        if d.checklist_item_ids_json:
            try:
                checklist_items = json.loads(d.checklist_item_ids_json)
            except Exception:
                pass

        citations_cnt = 0
        if d.citations_json:
            try:
                c_data = json.loads(d.citations_json)
                citations_cnt = len(c_data) if isinstance(c_data, list) else len(c_data.keys())
            except Exception:
                pass

        records.append(
            DocumentRecord(
                id=d.id,
                client_id=d.client_id,
                client_pan=d.client_pan,
                case_id=d.case_id,
                assessment_year=d.assessment_year or "AY 2025-26",
                filename=d.filename,
                category=d.category,
                page_count=d.page_count or 1,
                processing_status=d.processing_status or "PARSED",
                ca_review_status=d.ca_review_status or "PENDING_REVIEW",
                checklist_item_ids=checklist_items,
                file_size_bytes=d.file_size_bytes or 0,
                file_hash_sha256=d.file_hash_sha256,
                file_type=d.file_type or "application/pdf",
                storage_path=d.storage_path,
                review_notes=d.review_notes,
                waive_reason=d.waive_reason,
                citations_count=citations_cnt,
                uploaded_at=d.uploaded_at.isoformat() if d.uploaded_at else datetime.now(timezone.utc).isoformat(),
            )
        )
    return records


@router.post("/upload", response_model=DocumentRecord)
async def upload_document(
    file: UploadFile = File(...),
    client_pan: str = Form(...),
    client_id: Optional[str] = Form(None),
    case_id: Optional[str] = Form(None),
    assessment_year: Optional[str] = Form(None),
    category: str = Form(DocumentCategoryEnum.OTHER_PROOF.value),
    checklist_item_ids: Optional[str] = Form(None),  # JSON array string or comma separated
    db: Session = Depends(get_db),
):
    """
    Uploads a document to private storage with:
    1. Case ownership validation
    2. File type and 25MB size verification
    3. SHA-256 integrity hash calculation
    4. Dynamic tax period linking
    5. Multi-checklist item satisfaction
    """
    pan_upper = client_pan.upper()

    # 1. Verify case ownership
    if not case_manager.verify_client_case_ownership(pan_upper, client_id=client_id, case_id=case_id):
        raise HTTPException(status_code=403, detail=f"Client case ownership mismatch or client {pan_upper} not found.")

    # 2. File validation
    filename = file.filename or "uploaded_document.pdf"
    _, ext = os.path.splitext(filename.lower())
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    content = await file.read()
    file_size = len(content)
    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail=f"File exceeds maximum allowed limit of 25MB.")
    if file_size == 0:
        raise HTTPException(status_code=400, detail="Cannot upload empty file.")

    # 3. SHA-256 Integrity Verification
    sha256_hash = hashlib.sha256(content).hexdigest()

    # 4. Save to private storage
    client_storage_dir = os.path.join(STORAGE_BASE_DIR, pan_upper)
    os.makedirs(client_storage_dir, exist_ok=True)
    sanitized_filename = f"{sha256_hash[:10]}_{os.path.basename(filename)}"
    storage_path = os.path.join(client_storage_dir, sanitized_filename)

    with open(storage_path, "wb") as f_out:
        f_out.write(content)

    # 5. Determine dynamic assessment year
    effective_ay = assessment_year or case_manager.get_client_assessment_year(pan_upper, case_id=case_id)

    # 6. Parse satisfied checklist items
    parsed_checklist_item_ids: List[str] = []
    if checklist_item_ids:
        try:
            parsed_checklist_item_ids = json.loads(checklist_item_ids)
            if not isinstance(parsed_checklist_item_ids, list):
                parsed_checklist_item_ids = [str(checklist_item_ids)]
        except Exception:
            parsed_checklist_item_ids = [s.strip() for s in checklist_item_ids.split(",") if s.strip()]

    # 7. Document category normalization
    matched_cat = category.upper()
    valid_categories = [c.value for c in DocumentCategoryEnum]
    if matched_cat not in valid_categories:
        matched_cat = DocumentCategoryEnum.OTHER_PROOF.value

    # 8. Extraction if Form 16, 26AS, or AIS
    extracted_data: Dict[str, Any] = {}
    citations_data: Dict[str, Any] = {}
    processing_status = DocumentProcessingStatusEnum.PARSED.value

    if ext == ".pdf":
        try:
            if matched_cat == DocumentCategoryEnum.FORM_16.value:
                parser = Form16Parser()
                res = parser.parse(storage_path, file_name=filename)
                extracted_data = res.extracted_data
                citations_data = [c.model_dump() for c in res.citations]
            elif matched_cat == DocumentCategoryEnum.FORM_26AS.value:
                parser = Form26ASParser()
                res = parser.parse(storage_path, file_name=filename)
                extracted_data = res.extracted_data
                citations_data = [c.model_dump() for c in res.citations]
            elif matched_cat in (DocumentCategoryEnum.AIS.value, DocumentCategoryEnum.TIS.value):
                parser = AISTISParser()
                res = parser.parse(storage_path, file_name=filename)
                extracted_data = res.extracted_data
                citations_data = [c.model_dump() for c in res.citations]
        except Exception as ex:
            processing_status = DocumentProcessingStatusEnum.PARSED.value
            extracted_data = {"error": f"OCR extraction note: {str(ex)}"}

    # 9. Save to database
    repo = TaxpayerRepository(db)
    db_doc = repo.save_document(
        pan=pan_upper,
        filename=filename,
        category=matched_cat,
        page_count=1,
        extracted_data=extracted_data,
        citations=citations_data,
        client_id=client_id,
        case_id=case_id,
        assessment_year=effective_ay,
        checklist_item_ids=parsed_checklist_item_ids,
        file_size_bytes=file_size,
        file_hash_sha256=sha256_hash,
        file_type=file.content_type or "application/pdf",
        storage_path=storage_path,
        processing_status=processing_status,
        ca_review_status=CAReviewStatusEnum.PENDING_REVIEW.value,
    )

    # 10. Audit log
    case_manager.log_event(
        actor="CA Staff (Document Vault)",
        action="DOCUMENT_UPLOADED",
        details=(
            f"Uploaded '{filename}' ({matched_cat}) for {pan_upper}. "
            f"Size: {file_size} bytes. SHA-256: {sha256_hash[:12]}... "
            f"Satisfies checklist: {parsed_checklist_item_ids}."
        ),
        pan=pan_upper,
    )

    return DocumentRecord(
        id=db_doc.id,
        client_id=db_doc.client_id,
        client_pan=db_doc.client_pan,
        case_id=db_doc.case_id,
        assessment_year=db_doc.assessment_year or effective_ay,
        filename=db_doc.filename,
        category=db_doc.category,
        page_count=db_doc.page_count or 1,
        processing_status=db_doc.processing_status or processing_status,
        ca_review_status=db_doc.ca_review_status or CAReviewStatusEnum.PENDING_REVIEW.value,
        checklist_item_ids=parsed_checklist_item_ids,
        file_size_bytes=file_size,
        file_hash_sha256=sha256_hash,
        file_type=file.content_type or "application/pdf",
        storage_path=storage_path,
        review_notes=None,
        waive_reason=None,
        citations_count=len(citations_data) if isinstance(citations_data, list) else len(citations_data.keys()),
        uploaded_at=db_doc.uploaded_at.isoformat(),
    )


@router.patch("/{doc_id}/status", response_model=DocumentRecord)
def update_document_review_status(
    doc_id: str,
    payload: DocumentStatusUpdateRequest,
    db: Session = Depends(get_db),
):
    """
    Updates CA review status:
    PENDING_REVIEW -> VERIFIED, REJECTED, or WAIVED with mandatory reason.
    """
    repo = TaxpayerRepository(db)
    doc = repo.get_document_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document {doc_id} not found.")

    valid_statuses = [s.value for s in CAReviewStatusEnum]
    new_status = payload.ca_review_status.upper()
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid review status. Must be one of: {valid_statuses}")

    if new_status == CAReviewStatusEnum.WAIVED.value and not payload.waive_reason:
        raise HTTPException(status_code=400, detail="Waive reason is mandatory when waiving a document.")

    updated_doc = repo.update_document_status(
        doc_id=doc_id,
        ca_review_status=new_status,
        review_notes=payload.review_notes,
        waive_reason=payload.waive_reason,
    )

    checklist_items = []
    if updated_doc.checklist_item_ids_json:
        try:
            checklist_items = json.loads(updated_doc.checklist_item_ids_json)
        except Exception:
            pass

    # Audit event
    case_manager.log_event(
        actor="Assigned Chartered Accountant",
        action="DOCUMENT_REVIEW_UPDATED",
        details=(
            f"Document '{updated_doc.filename}' ({doc_id}) review status updated to {new_status}. "
            f"Notes: {payload.review_notes or 'None'}. Reason: {payload.waive_reason or 'N/A'}"
        ),
        pan=updated_doc.client_pan,
    )

    return DocumentRecord(
        id=updated_doc.id,
        client_id=updated_doc.client_id,
        client_pan=updated_doc.client_pan,
        case_id=updated_doc.case_id,
        assessment_year=updated_doc.assessment_year or "AY 2025-26",
        filename=updated_doc.filename,
        category=updated_doc.category,
        page_count=updated_doc.page_count or 1,
        processing_status=updated_doc.processing_status or "PARSED",
        ca_review_status=updated_doc.ca_review_status,
        checklist_item_ids=checklist_items,
        file_size_bytes=updated_doc.file_size_bytes or 0,
        file_hash_sha256=updated_doc.file_hash_sha256,
        file_type=updated_doc.file_type or "application/pdf",
        storage_path=updated_doc.storage_path,
        review_notes=updated_doc.review_notes,
        waive_reason=updated_doc.waive_reason,
        citations_count=0,
        uploaded_at=updated_doc.uploaded_at.isoformat() if updated_doc.uploaded_at else datetime.now(timezone.utc).isoformat(),
    )


@router.post("/request-missing", response_model=MissingDocDraftNotice)
def request_missing_documents(
    payload: MissingDocRequestPayload,
    db: Session = Depends(get_db),
):
    """
    Generates a draft missing-document request notice for Email & WhatsApp outreach.
    Does NOT transmit real third-party SMS/emails; provides a preview and records an audit log.
    """
    pan_upper = payload.client_pan.upper()
    client = case_manager.get_client(pan_upper)
    if not client:
        raise HTTPException(status_code=404, detail=f"Client with PAN {pan_upper} not found.")

    if not payload.checklist_item_ids:
        raise HTTPException(status_code=400, detail="At least one missing checklist item ID must be specified.")

    client_name = client.name
    client_email = client.email or "client@example.com"
    client_mobile = client.mobile or "+91 98000 00000"

    # Human-readable label mapper for standard checklist IDs
    label_map = {
        "salary-form16": "Form 16 (Part A & B) with Employer Signature",
        "salary-multiple-f16": "Form 16 / Salary Slips from All Employers",
        "hp-interest-cert": "Housing Loan Interest & Principal Repayment Certificate",
        "hp-rent-agreement": "Rent Agreement & Rent Receipt Proofs",
        "bp-pnl-balancesheet": "Audited Profit & Loss Statement and Balance Sheet",
        "bp-44ad-bank-statement": "12-Month Current/Savings Bank Statement for Presumptive Turnover",
        "cg-broker-statement": "Capital Gains Realized P&L Statement (Zerodha/Groww/CAMS/KFintech)",
        "cg-property-deeds": "Registered Purchase Deed, Sale Deed & Cost of Improvement Receipts",
        "os-bank-interest": "Consolidated Interest Certificates (Savings & Term Deposits)",
        "tax-26as-traces": "Form 26AS Annual Tax Statement from TRACES",
        "tax-ais-tis": "AIS & TIS Statement from Income Tax e-Filing Portal",
        "tax-advance-challans": "Advance Tax / Self-Assessment Tax Payment Challans",
        "ded-80c-receipts": "Section 80C Investment Receipts (ELSS, PPF, LIC, Children Tuition Fee)",
        "ded-80d-mediclaim": "Section 80D Health Insurance Premium Receipts & Preventive Checkup",
    }

    missing_items_structured = []
    item_bullets_email = []
    item_bullets_wa = []

    for idx, item_id in enumerate(payload.checklist_item_ids):
        item_title = label_map.get(item_id, item_id.replace("-", " ").title())
        missing_items_structured.append({"id": item_id, "title": item_title})
        item_bullets_email.append(f"  {idx+1}. {item_title}")
        item_bullets_wa.append(f"• *{item_title}*")

    items_text_email = "\n".join(item_bullets_email)
    items_text_wa = "\n".join(item_bullets_wa)
    ay_label = case_manager.get_client_assessment_year(pan_upper, case_id=payload.case_id)

    email_body = f"""Dear {client_name},

Greetings from your Tax Advisory Team at CA Bharat AI.

We are currently compiling your statutory Income Tax Return computation for {ay_label}. During our initial tax discovery and document reconciliation, we identified that the following supporting documents are still pending:

{items_text_email}

{f"Special Note from your CA: {payload.custom_notes}" if payload.custom_notes else ""}

Please upload these documents securely through your dedicated client document vault or reply to this communication at your earliest convenience to avoid filing delays.

Warm regards,
Tax & Regulatory Practice
CA Bharat AI Advisory Services
"""

    whatsapp_body = f"""*CA Bharat AI Tax Advisory*
Hello *{client_name}* (PAN: {pan_upper[:5]}***{pan_upper[-2:]}),

To finalize your {ay_label} Income Tax Return filing, our CA team requires the following pending documents:

{items_text_wa}

{f"📌 Note: {payload.custom_notes}" if payload.custom_notes else ""}

📲 Please upload these directly via your CA Bharat secure client portal link.

Thank you!
_CA Bharat AI Compliance Team_"""

    # Record audit log
    case_manager.log_event(
        actor="CA Staff (Client Outreach)",
        action="MISSING_DOCS_REQUESTED",
        details=(
            f"Generated missing documents request for {client_name} ({pan_upper}). "
            f"Requested items: {payload.checklist_item_ids}. Outreach channels: Email ({client_email}), WhatsApp ({client_mobile})."
        ),
        pan=pan_upper,
    )

    return MissingDocDraftNotice(
        recipient_name=client_name,
        recipient_email=client_email,
        recipient_mobile=client_mobile,
        subject=f"Document Request: Finalizing your ITR Filing for {ay_label} - {pan_upper}",
        email_body=email_body,
        whatsapp_body=whatsapp_body,
        missing_items=missing_items_structured,
        is_simulated_dispatch=True,
        notice_disclaimer="Draft outreach preview only. No external SMS/email transmission performed.",
        generated_at=datetime.now(timezone.utc).isoformat(),
    )


@router.delete("/{doc_id}")
def delete_document(
    doc_id: str,
    db: Session = Depends(get_db),
):
    """Deletes a document record and purges physical storage if applicable."""
    repo = TaxpayerRepository(db)
    doc = repo.get_document_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document {doc_id} not found.")

    pan = doc.client_pan
    filename = doc.filename
    storage_path = doc.storage_path

    success = repo.delete_document(doc_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete document from database.")

    # Remove file from disk if present
    if storage_path and os.path.exists(storage_path):
        try:
            os.remove(storage_path)
        except Exception:
            pass

    case_manager.log_event(
        actor="Assigned Chartered Accountant",
        action="DOCUMENT_DELETED",
        details=f"Deleted document '{filename}' (ID: {doc_id}) for PAN {pan}.",
        pan=pan,
    )

    return {"status": "SUCCESS", "deleted_id": doc_id, "message": f"Document {filename} removed successfully."}
