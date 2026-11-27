"""
Document Collection, Document Vault & Deterministic Extraction API Routes (Step 05 & Step 06)
Governed by ICAI Documentation Standards & DPDP Act, 2023.
Zero-LLM Deterministic Architecture.

Security:
All document APIs enforce strict Bearer token authentication, RBAC role checks,
and client/case ownership verification — including legacy PAN endpoints.
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Query
from typing import Optional, List, Dict, Any
import hashlib
import json
import os
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from ..db.session import get_db
from ..db.repository import TaxpayerRepository
from ..db.models import DBUploadedDocument
from ..models.document_models import (
    DocumentRecord,
    DocumentCategoryEnum,
    DocumentProcessingStatusEnum,
    CAReviewStatusEnum,
    DocumentStatusUpdateRequest,
    MissingDocRequestPayload,
    MissingDocDraftNotice,
    FieldCorrectionRequest,
    FieldVerifyRequest,
    BatchExtractRequest,
)
from ..services.case_manager import case_manager
from ..parsers.form16_parser import Form16Parser
from ..parsers.form26as_parser import Form26ASParser
from ..parsers.ais_tis_parser import AISTISParser
from .auth_context import (
    ActorContext,
    require_authenticated_actor,
    assert_client_case_access,
)

router = APIRouter(prefix="/api/documents", tags=["Document Vault & Extraction"])

# Maximum file size: 25 MB
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024
ALLOWED_EXTENSIONS = {".pdf", ".json", ".png", ".jpg", ".jpeg"}

# Categories backed by verified deterministic PDF parsers
SUPPORTED_DETERMINISTIC_CATEGORIES = {
    DocumentCategoryEnum.FORM_16.value,
    DocumentCategoryEnum.FORM_26AS.value,
    DocumentCategoryEnum.AIS.value,
    DocumentCategoryEnum.TIS.value,
    "AIS_TIS",
}

# Storage & sample data directories
BACKEND_APP_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_ROOT_DIR = os.path.dirname(BACKEND_APP_DIR)
STORAGE_BASE_DIR = os.getenv("CA_BHARAT_STORAGE_DIR") or os.path.join(BACKEND_APP_DIR, "storage", "uploads")
SAMPLE_DATA_DIR = os.path.join(BACKEND_ROOT_DIR, "sample_data")
os.makedirs(STORAGE_BASE_DIR, exist_ok=True)

SEEDED_SAMPLE_FILES = {
    "doc-arun-f16": os.path.join(SAMPLE_DATA_DIR, "Form16_Arun_TCS.pdf"),
    "doc-arun-26as": os.path.join(SAMPLE_DATA_DIR, "Form26AS_Arun.pdf"),
    "doc-arun-ais": os.path.join(SAMPLE_DATA_DIR, "AIS_TIS_Arun.pdf"),
}


def _normalize_citations(raw_cit: Any, filename: str) -> List[Dict[str, Any]]:
    """Normalizes list or legacy dict citations into standard SourceCitation dict list."""
    if isinstance(raw_cit, list):
        normalized = []
        for item in raw_cit:
            if not isinstance(item, dict):
                continue
            cit = dict(item)
            if "evidence_score" not in cit and "confidence" in cit:
                cit["evidence_score"] = cit.pop("confidence")
            cit.setdefault("evidence_status", "COORDINATE_VERIFIED" if cit.get("bounding_box", [0, 0, 0, 0]) != [0.0, 0.0, 0.0, 0.0] else "NOT_LOCATED")
            normalized.append(cit)
        return normalized
    if isinstance(raw_cit, dict):
        return [
            {
                "field_name": k,
                "page_number": v.get("page", 1) if isinstance(v, dict) else 1,
                "bounding_box": v.get("box", [0.0, 0.0, 0.0, 0.0]) if isinstance(v, dict) else [0.0, 0.0, 0.0, 0.0],
                "raw_text": str(v.get("raw_text", "")) if isinstance(v, dict) else "",
                "evidence_score": float(v.get("evidence_score", v.get("confidence", 1.0))) if isinstance(v, dict) else 1.0,
                "evidence_status": "COORDINATE_VERIFIED",
                "document_name": filename,
            }
            for k, v in raw_cit.items()
        ]
    return []


def _db_doc_to_record(d: DBUploadedDocument) -> DocumentRecord:
    """Converts DBUploadedDocument ORM row into DocumentRecord response schema."""
    checklist_items: List[str] = []
    if d.checklist_item_ids_json:
        try:
            checklist_items = json.loads(d.checklist_item_ids_json)
        except Exception:
            pass

    extracted_data: Optional[Dict[str, Any]] = None
    if d.extracted_data_json:
        try:
            parsed = json.loads(d.extracted_data_json)
            if isinstance(parsed, dict):
                extracted_data = parsed
        except Exception:
            pass

    citations: List[Dict[str, Any]] = []
    if d.citations_json:
        try:
            raw_cit = json.loads(d.citations_json)
            citations = _normalize_citations(raw_cit, d.filename)
        except Exception:
            pass

    corrected_fields: Dict[str, Any] = {}
    if getattr(d, "corrected_fields_json", None):
        try:
            parsed_corr = json.loads(d.corrected_fields_json)
            if isinstance(parsed_corr, dict):
                corrected_fields = parsed_corr
        except Exception:
            pass

    cat_upper = (d.category or "").upper()
    engine = getattr(d, "extraction_engine", None)
    if not engine:
        engine = "DETERMINISTIC_PDF" if cat_upper in SUPPORTED_DETERMINISTIC_CATEGORIES else "UNSUPPORTED_TYPE"

    ev_score = getattr(d, "evidence_score", None)
    if ev_score is None:
        ev_score = getattr(d, "ocr_confidence", None)

    return DocumentRecord(
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
        citations_count=len(citations),
        extracted_data=extracted_data,
        citations=citations,
        corrected_fields=corrected_fields,
        extraction_engine=engine,
        extraction_supported=(engine == "DETERMINISTIC_PDF"),
        evidence_score=ev_score,
        evidence_methodology="COORDINATE_LOCALIZATION_RATIO" if engine == "DETERMINISTIC_PDF" and ev_score is not None else None,
        uploaded_at=d.uploaded_at.isoformat() if d.uploaded_at else datetime.now(timezone.utc).isoformat(),
    )


def _sync_extracted_to_case_manager(pan: str, category: str, filename: str, doc_id: str, extracted_data: Dict[str, Any]):
    """Keeps CaseManager's reconciliation input cache aligned with latest extracted PDF data."""
    pan_upper = pan.upper()
    doc_type = "AIS_TIS" if category in ("AIS", "TIS", "AIS_TIS") else category
    existing_list = case_manager.documents.setdefault(pan_upper, [])
    updated = False
    for entry in existing_list:
        if entry.get("document_id") == doc_id or entry.get("document_type") == doc_type:
            entry["extracted_data"] = extracted_data
            entry["file_name"] = filename
            updated = True
            break
    if not updated:
        existing_list.append({
            "document_id": doc_id,
            "document_type": doc_type,
            "file_name": filename,
            "extracted_data": extracted_data,
        })


def _execute_extraction_for_db_doc(d: DBUploadedDocument, repo: TaxpayerRepository) -> DBUploadedDocument:
    """Runs deterministic parser on stored PDF or explicitly marks unsupported types without fabrication."""
    cat_upper = (d.category or "").upper()
    _, ext = os.path.splitext((d.filename or "").lower())

    if cat_upper not in SUPPORTED_DETERMINISTIC_CATEGORIES or ext != ".pdf":
        notice = (
            f"Automated deterministic extraction is not supported for category '{d.category}' ({ext or 'unknown'}). "
            "Manual CA review and field verification required."
        )
        return repo.save_document_extraction(
            doc_id=d.id,
            extracted_data={"_extraction_notice": notice, "extraction_supported": False},
            citations=[],
            extraction_engine="UNSUPPORTED_TYPE",
            processing_status=DocumentProcessingStatusEnum.UPLOADED.value,
            evidence_score=None,
        )

    target_path = d.storage_path
    if (not target_path or not os.path.exists(target_path)) and d.id in SEEDED_SAMPLE_FILES:
        sample_candidate = SEEDED_SAMPLE_FILES[d.id]
        if os.path.exists(sample_candidate):
            target_path = sample_candidate

    if not target_path or not os.path.exists(target_path):
        return repo.save_document_extraction(
            doc_id=d.id,
            extracted_data={"error": "Original file not found in private storage; cannot execute extraction."},
            citations=[],
            extraction_engine="DETERMINISTIC_PDF",
            processing_status=DocumentProcessingStatusEnum.PARSING_FAILED.value,
            evidence_score=0.0,
        )

    client = case_manager.get_client_by_id(d.client_id) if d.client_id else case_manager.get_client(d.client_pan)
    unlock_passwords: List[str] = []
    if client:
        unlock_passwords.append(client.pan)
        if getattr(client, "dob_or_doi", None):
            digits = "".join(ch for ch in str(client.dob_or_doi) if ch.isdigit())
            if digits:
                unlock_passwords.append(digits)

    try:
        if cat_upper == DocumentCategoryEnum.FORM_16.value:
            res = Form16Parser().parse(target_path, file_name=d.filename, passwords=unlock_passwords)
        elif cat_upper == DocumentCategoryEnum.FORM_26AS.value:
            res = Form26ASParser().parse(target_path, file_name=d.filename, passwords=unlock_passwords)
        else:
            res = AISTISParser().parse(target_path, file_name=d.filename, passwords=unlock_passwords)

        citations_dicts = [c.model_dump() for c in res.citations]
        import fitz
        page_cnt = d.page_count or 1
        try:
            with fitz.open(target_path) as pdf_doc:
                page_cnt = len(pdf_doc)
        except Exception:
            pass

        updated_doc = repo.save_document_extraction(
            doc_id=d.id,
            extracted_data=res.extracted_data,
            citations=citations_dicts,
            extraction_engine="DETERMINISTIC_PDF",
            processing_status=DocumentProcessingStatusEnum.PARSED.value,
            evidence_score=res.evidence_score,
            page_count=page_cnt,
        )
        _sync_extracted_to_case_manager(d.client_pan, cat_upper, d.filename, d.id, res.extracted_data)
        return updated_doc
    except Exception as ex:
        return repo.save_document_extraction(
            doc_id=d.id,
            extracted_data={"error": f"Extraction failed: {str(ex)}"},
            citations=[],
            extraction_engine="DETERMINISTIC_PDF",
            processing_status=DocumentProcessingStatusEnum.PARSING_FAILED.value,
            evidence_score=0.0,
        )


# ==============================================================================
# STEP 06 AUTHENTICATED ROUTES (NO PAN EXPOSED IN URL)
# IMPORTANT: Declare literal/specific paths BEFORE wildcard `/{pan}`!
# ==============================================================================

@router.get("/client/{client_id}", response_model=List[DocumentRecord])
def get_documents_by_authenticated_client(
    client_id: str,
    case_id: Optional[str] = Query(None, description="Tax case ID filter"),
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """
    Fetches all documents linked to a client and optional tax case using authenticated
    client/case identifiers without exposing PAN in the URL.
    """
    assert_client_case_access(actor, target_client_id=client_id, target_case_id=case_id, require_ca_role=False)

    client = case_manager.get_client_by_id(client_id)
    if not client:
        raise HTTPException(status_code=404, detail=f"Client '{client_id}' not found.")

    repo = TaxpayerRepository(db)
    db_docs = repo.get_documents_by_client_id(client_id, case_id=case_id)
    return [_db_doc_to_record(d) for d in db_docs]


@router.post("/extract-all", response_model=List[DocumentRecord])
def extract_all_client_documents(
    payload: BatchExtractRequest,
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """
    Triggers deterministic extraction on all documents for the specified client_id and case_id.
    Enforces CA role & ownership checks without exposing PAN in the URL.
    """
    assert_client_case_access(
        actor,
        target_client_id=payload.client_id,
        target_case_id=payload.case_id,
        require_ca_role=True,
    )

    client = case_manager.get_client_by_id(payload.client_id)
    if not client:
        raise HTTPException(status_code=404, detail=f"Client '{payload.client_id}' not found.")

    repo = TaxpayerRepository(db)
    docs = repo.get_documents_by_client_id(payload.client_id, case_id=payload.case_id)
    updated_records: List[DocumentRecord] = []

    for d in docs:
        updated_doc = _execute_extraction_for_db_doc(d, repo)
        updated_records.append(_db_doc_to_record(updated_doc))

    case_manager.log_event(
        actor=f"{actor.actor_name} ({actor.role})",
        action="BATCH_EXTRACTION_EXECUTED",
        details=f"Executed extraction across {len(updated_records)} document(s) for client {payload.client_id} (case: {payload.case_id or 'ALL'}).",
        pan=client.pan,
    )
    return updated_records


@router.post("/{doc_id}/extract", response_model=DocumentRecord)
def extract_single_document(
    doc_id: str,
    case_id: Optional[str] = Query(None, description="Optional case ownership verification ID"),
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """
    Runs deterministic extraction on a stored Vault document by ID.
    Verifies client/case ownership and CA role before executing.
    """
    repo = TaxpayerRepository(db)
    doc = repo.get_document_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document '{doc_id}' not found.")

    if case_id and doc.case_id and doc.case_id != case_id:
        raise HTTPException(status_code=403, detail="Access denied: tax case ownership mismatch.")

    assert_client_case_access(
        actor,
        target_client_id=doc.client_id,
        target_case_id=case_id or doc.case_id,
        require_ca_role=True,
    )

    updated_doc = _execute_extraction_for_db_doc(doc, repo)
    rec = _db_doc_to_record(updated_doc)

    case_manager.log_event(
        actor=f"{actor.actor_name} ({actor.role})",
        action="DOCUMENT_EXTRACTION_EXECUTED",
        details=(
            f"Ran extraction for '{rec.filename}' ({doc_id}). Engine: {rec.extraction_engine}, "
            f"Status: {rec.processing_status}, Evidence Score: {rec.evidence_score}."
        ),
        pan=doc.client_pan,
    )
    return rec


@router.patch("/{doc_id}/fields/{field_key}", response_model=DocumentRecord)
def correct_extracted_field(
    doc_id: str,
    field_key: str,
    payload: FieldCorrectionRequest,
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """
    Allows Chartered Accountant / CA Staff to correct an extracted field value.
    Strictly preserves immutable original extracted value and citations, storing
    the corrected value separately with CA identity, mandatory reason, and timestamp.
    """
    repo = TaxpayerRepository(db)
    doc = repo.get_document_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document '{doc_id}' not found.")

    if payload.case_id and doc.case_id and doc.case_id != payload.case_id:
        raise HTTPException(status_code=403, detail="Access denied: tax case ownership mismatch.")

    assert_client_case_access(
        actor,
        target_client_id=doc.client_id,
        target_case_id=payload.case_id or doc.case_id,
        require_ca_role=True,
    )

    clean_reason = (payload.correction_reason or "").strip()
    if len(clean_reason) < 3:
        raise HTTPException(status_code=400, detail="Mandatory correction reason (min 3 characters) is required.")

    effective_field_key = payload.field_key or field_key
    updated_doc = repo.update_document_field_correction(
        doc_id=doc_id,
        field_key=effective_field_key,
        corrected_value=payload.corrected_value,
        reason=clean_reason,
        ca_identity=actor.actor_name,
        ca_actor_id=actor.actor_id,
        ca_actor_role=actor.role,
    )

    rec = _db_doc_to_record(updated_doc)
    corr_entry = rec.corrected_fields.get(effective_field_key, {})

    case_manager.log_event(
        actor=f"{actor.actor_name} ({actor.role})",
        action="EXTRACTED_FIELD_CORRECTED",
        details=(
            f"Corrected field '{effective_field_key}' in doc '{doc.filename}' ({doc_id}). "
            f"Original: {corr_entry.get('original_value')} -> Corrected: {payload.corrected_value}. "
            f"Reason: {clean_reason}"
        ),
        pan=doc.client_pan,
    )
    return rec


@router.patch("/{doc_id}/fields/{field_key}/verify", response_model=DocumentRecord)
def verify_extracted_field(
    doc_id: str,
    field_key: str,
    payload: Optional[FieldVerifyRequest] = None,
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """Marks a specific extracted field as VERIFIED by CA staff/partner."""
    repo = TaxpayerRepository(db)
    doc = repo.get_document_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document '{doc_id}' not found.")

    if payload and payload.case_id and doc.case_id and doc.case_id != payload.case_id:
        raise HTTPException(status_code=403, detail="Access denied: tax case ownership mismatch.")

    assert_client_case_access(
        actor,
        target_client_id=doc.client_id,
        target_case_id=(payload.case_id if payload else None) or doc.case_id,
        require_ca_role=True,
    )

    effective_field_key = (payload.field_key if payload and payload.field_key else None) or field_key
    updated_doc = repo.verify_document_field(
        doc_id=doc_id,
        field_key=effective_field_key,
        ca_identity=actor.actor_name,
        ca_actor_id=actor.actor_id,
        ca_actor_role=actor.role,
    )

    case_manager.log_event(
        actor=f"{actor.actor_name} ({actor.role})",
        action="EXTRACTED_FIELD_VERIFIED",
        details=f"Verified extracted field '{effective_field_key}' in doc '{doc.filename}' ({doc_id}).",
        pan=doc.client_pan,
    )
    return _db_doc_to_record(updated_doc)


# ==============================================================================
# AUTHENTICATED STEP 05 VAULT & LEGACY ROUTES (STRICT AUTH + OWNERSHIP CHECKS)
# ==============================================================================

@router.post("/upload", response_model=DocumentRecord)
async def upload_document(
    file: UploadFile = File(...),
    client_pan: Optional[str] = Form(None),
    client_id: Optional[str] = Form(None),
    case_id: Optional[str] = Form(None),
    assessment_year: Optional[str] = Form(None),
    category: str = Form(DocumentCategoryEnum.OTHER_PROOF.value),
    checklist_item_ids: Optional[str] = Form(None),
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """
    Uploads a document to private storage with mandatory authentication, case & client
    ownership checks, SHA-256 integrity hashing, and deterministic PDF extraction.
    """
    resolved_client = None
    if client_id:
        resolved_client = case_manager.get_client_by_id(client_id)
    if not resolved_client and client_pan:
        resolved_client = case_manager.get_client(client_pan.upper())

    if not resolved_client:
        raise HTTPException(
            status_code=403,
            detail="Client case ownership mismatch or client not found.",
        )

    if client_id and resolved_client.id != client_id:
        raise HTTPException(status_code=403, detail="Client case ownership mismatch.")
    if client_pan and resolved_client.pan != client_pan.upper():
        raise HTTPException(status_code=403, detail="Client PAN/ID ownership mismatch.")

    effective_client_id = resolved_client.id
    pan_upper = resolved_client.pan

    assert_client_case_access(actor, target_client_id=effective_client_id, target_case_id=case_id, require_ca_role=False)

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
        raise HTTPException(status_code=400, detail="File exceeds maximum allowed limit of 25MB.")
    if file_size == 0:
        raise HTTPException(status_code=400, detail="Cannot upload empty file.")

    sha256_hash = hashlib.sha256(content).hexdigest()

    client_storage_dir = os.path.join(STORAGE_BASE_DIR, effective_client_id or pan_upper)
    os.makedirs(client_storage_dir, exist_ok=True)
    sanitized_filename = f"{sha256_hash[:10]}_{os.path.basename(filename)}"
    storage_path = os.path.join(client_storage_dir, sanitized_filename)

    with open(storage_path, "wb") as f_out:
        f_out.write(content)

    effective_ay = assessment_year or case_manager.get_client_assessment_year(pan_upper, case_id=case_id)

    parsed_checklist_item_ids: List[str] = []
    if checklist_item_ids:
        try:
            parsed_checklist_item_ids = json.loads(checklist_item_ids)
            if not isinstance(parsed_checklist_item_ids, list):
                parsed_checklist_item_ids = [str(checklist_item_ids)]
        except Exception:
            parsed_checklist_item_ids = [s.strip() for s in checklist_item_ids.split(",") if s.strip()]

    matched_cat = category.upper()
    valid_categories = [c.value for c in DocumentCategoryEnum]
    if matched_cat not in valid_categories:
        matched_cat = DocumentCategoryEnum.OTHER_PROOF.value

    extracted_data: Dict[str, Any] = {}
    citations_data: List[Dict[str, Any]] = []
    processing_status = DocumentProcessingStatusEnum.PARSED.value
    extraction_engine = "UNSUPPORTED_TYPE"
    evidence_score: Optional[float] = None
    page_count = 1

    if matched_cat in SUPPORTED_DETERMINISTIC_CATEGORIES and ext == ".pdf":
        extraction_engine = "DETERMINISTIC_PDF"
        unlock_passwords = [pan_upper]
        if getattr(resolved_client, "dob_or_doi", None):
            digits = "".join(ch for ch in str(resolved_client.dob_or_doi) if ch.isdigit())
            if digits:
                unlock_passwords.append(digits)
        try:
            if matched_cat == DocumentCategoryEnum.FORM_16.value:
                res = Form16Parser().parse(storage_path, file_name=filename, passwords=unlock_passwords)
            elif matched_cat == DocumentCategoryEnum.FORM_26AS.value:
                res = Form26ASParser().parse(storage_path, file_name=filename, passwords=unlock_passwords)
            else:
                res = AISTISParser().parse(storage_path, file_name=filename, passwords=unlock_passwords)

            extracted_data = res.extracted_data
            citations_data = [c.model_dump() for c in res.citations]
            evidence_score = res.evidence_score
            import fitz
            try:
                with fitz.open(storage_path) as pdf_doc:
                    page_count = len(pdf_doc)
            except Exception:
                pass
        except Exception as ex:
            processing_status = DocumentProcessingStatusEnum.PARSING_FAILED.value
            extracted_data = {"error": f"PDF parsing failed: {str(ex)}"}
            evidence_score = 0.0
    else:
        extraction_engine = "UNSUPPORTED_TYPE"
        extracted_data = {
            "_extraction_notice": (
                f"Automated deterministic extraction is not implemented for '{matched_cat}' ({ext}). "
                "Manual CA verification required."
            ),
            "extraction_supported": False,
        }

    repo = TaxpayerRepository(db)
    db_doc = repo.save_document(
        pan=pan_upper,
        filename=filename,
        category=matched_cat,
        page_count=page_count,
        extracted_data=extracted_data,
        citations=citations_data,
        client_id=effective_client_id,
        case_id=case_id,
        assessment_year=effective_ay,
        checklist_item_ids=parsed_checklist_item_ids,
        file_size_bytes=file_size,
        file_hash_sha256=sha256_hash,
        file_type=file.content_type or "application/pdf",
        storage_path=storage_path,
        processing_status=processing_status,
        ca_review_status=CAReviewStatusEnum.PENDING_REVIEW.value,
        extraction_engine=extraction_engine,
        evidence_score=evidence_score,
    )

    if extraction_engine == "DETERMINISTIC_PDF" and processing_status == DocumentProcessingStatusEnum.PARSED.value:
        _sync_extracted_to_case_manager(pan_upper, matched_cat, filename, db_doc.id, extracted_data)

    case_manager.log_event(
        actor=f"{actor.actor_name} ({actor.role})",
        action="DOCUMENT_UPLOADED",
        details=(
            f"Uploaded '{filename}' ({matched_cat}) for client {effective_client_id}. "
            f"Size: {file_size} bytes. SHA-256: {sha256_hash[:12]}... "
            f"Engine: {extraction_engine}, Status: {processing_status}."
        ),
        pan=pan_upper,
    )

    return _db_doc_to_record(db_doc)


@router.patch("/{doc_id}/status", response_model=DocumentRecord)
def update_document_review_status(
    doc_id: str,
    payload: DocumentStatusUpdateRequest,
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """
    Updates CA review status:
    PENDING_REVIEW -> VERIFIED, REJECTED, or WAIVED with mandatory reason.
    Strictly enforces CA role & ownership checks.
    """
    repo = TaxpayerRepository(db)
    doc = repo.get_document_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document {doc_id} not found.")

    assert_client_case_access(actor, target_client_id=doc.client_id, target_case_id=doc.case_id, require_ca_role=True)

    valid_statuses = [s.value for s in CAReviewStatusEnum]
    new_status = payload.ca_review_status.upper()
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid review status. Must be one of: {valid_statuses}")

    if new_status == CAReviewStatusEnum.WAIVED.value and not (payload.waive_reason or "").strip():
        raise HTTPException(status_code=400, detail="Waive reason is mandatory when waiving a document.")

    updated_doc = repo.update_document_status(
        doc_id=doc_id,
        ca_review_status=new_status,
        review_notes=payload.review_notes,
        waive_reason=payload.waive_reason,
    )

    case_manager.log_event(
        actor=f"{actor.actor_name} ({actor.role})",
        action="DOCUMENT_REVIEW_UPDATED",
        details=(
            f"Document '{updated_doc.filename}' ({doc_id}) CA review status updated to {new_status}. "
            f"Notes: {payload.review_notes or 'None'}. Reason: {payload.waive_reason or 'N/A'}"
        ),
        pan=updated_doc.client_pan,
    )

    return _db_doc_to_record(updated_doc)


@router.post("/request-missing", response_model=MissingDocDraftNotice)
def request_missing_documents(
    payload: MissingDocRequestPayload,
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """
    Generates a draft missing-document request notice for Email & WhatsApp outreach.
    Strictly requires CA role & client/case ownership; does NOT transmit real messages.
    """
    client = None
    if payload.client_id:
        client = case_manager.get_client_by_id(payload.client_id)
    if not client and payload.client_pan:
        client = case_manager.get_client(payload.client_pan.upper())

    pan_upper = (client.pan if client else (payload.client_pan or "")).upper()
    if not client:
        assert_client_case_access(actor, target_client_id=payload.client_id or "__NONEXISTENT__", target_case_id=payload.case_id, require_ca_role=True)
        raise HTTPException(status_code=404, detail=f"Client '{payload.client_id or pan_upper}' not found.")

    assert_client_case_access(actor, target_client_id=client.id, target_case_id=payload.case_id, require_ca_role=True)

    if not payload.checklist_item_ids:
        raise HTTPException(status_code=400, detail="At least one missing checklist item ID must be specified.")

    client_name = client.name
    client_email = client.email or "client@example.com"
    client_mobile = client.mobile or "+91 98000 00000"

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

    case_manager.log_event(
        actor=f"{actor.actor_name} ({actor.role})",
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
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """Deletes a document record and purges physical storage; requires CA role & ownership."""
    repo = TaxpayerRepository(db)
    doc = repo.get_document_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document {doc_id} not found.")

    assert_client_case_access(actor, target_client_id=doc.client_id, target_case_id=doc.case_id, require_ca_role=True)

    pan = doc.client_pan
    filename = doc.filename
    storage_path = doc.storage_path

    success = repo.delete_document(doc_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete document from database.")

    if storage_path and os.path.exists(storage_path):
        try:
            os.remove(storage_path)
        except Exception:
            pass

    case_manager.log_event(
        actor=f"{actor.actor_name} ({actor.role})",
        action="DOCUMENT_DELETED",
        details=f"Deleted document '{filename}' (ID: {doc_id}) for PAN {pan}.",
        pan=pan,
    )

    return {"status": "SUCCESS", "deleted_id": doc_id, "message": f"Document {filename} removed successfully."}


@router.get("/{pan}", response_model=List[DocumentRecord])
def get_client_documents_legacy(
    pan: str,
    case_id: Optional[str] = Query(None, description="Optional tax case ID filter"),
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """
    Legacy compatibility endpoint to fetch client documents by PAN.
    Enforces strict authentication, role checks, and client/case ownership validation.
    Prefer `GET /api/documents/client/{client_id}` to avoid PAN in URLs.
    """
    pan_upper = pan.upper()
    client = case_manager.get_client(pan_upper)
    assert_client_case_access(
        actor,
        target_client_id=client.id if client else "__UNOWNED__",
        target_case_id=case_id,
        require_ca_role=False,
    )
    repo = TaxpayerRepository(db)
    db_docs = repo.get_documents_by_pan(pan_upper, case_id=case_id)
    return [_db_doc_to_record(d) for d in db_docs]
