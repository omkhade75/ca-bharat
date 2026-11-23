"""
Document Intelligence & Zero-LLM Extraction API Routes
Handles Form 16, Form 26AS, and AIS/TIS with coordinate bounding box citations.
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import shutil
import tempfile
import os
from ..models.document_models import ExtractionResult
from ..parsers.form16_parser import Form16Parser
from ..parsers.form26as_parser import Form26ASParser
from ..parsers.ais_tis_parser import AISTISParser
from ..services.case_manager import case_manager

router = APIRouter(prefix="/api/extract", tags=["Document Intelligence Extraction"])

@router.post("/form16", response_model=ExtractionResult)
async def extract_form16(file: UploadFile = File(...), client_pan: str = Form("ABCPA1092F")):
    """Uploads Form 16 PDF and runs zero-LLM deterministic extraction with coordinate citations."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF format is supported for Form 16.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        parser = Form16Parser()
        result = parser.parse(tmp_path, file_name=file.filename)
        # Store in case manager
        if client_pan not in case_manager.documents:
            case_manager.documents[client_pan] = []
        case_manager.documents[client_pan].append(result.model_dump())

        case_manager.log_event(
            actor="System (Deterministic OCR Engine)",
            action="FORM_16_EXTRACTED",
            details=f"Extracted Form 16 for PAN {client_pan} with {len(result.citations)} coordinate citations.",
            pan=client_pan,
        )
        return result
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@router.post("/form26as", response_model=ExtractionResult)
async def extract_form26as(file: UploadFile = File(...), client_pan: str = Form("ABCPA1092F")):
    """Uploads Form 26AS (TRACES) PDF and extracts Part I, Part II TDS, and Part IV Advance Tax."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF format is supported for Form 26AS.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        parser = Form26ASParser()
        result = parser.parse(tmp_path, file_name=file.filename)
        if client_pan not in case_manager.documents:
            case_manager.documents[client_pan] = []
        case_manager.documents[client_pan].append(result.model_dump())

        case_manager.log_event(
            actor="System (Deterministic OCR Engine)",
            action="FORM_26AS_EXTRACTED",
            details=f"Extracted Form 26AS for PAN {client_pan} with TRACES TDS credit verification.",
            pan=client_pan,
        )
        return result
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@router.post("/ais-tis", response_model=ExtractionResult)
async def extract_ais_tis(file: UploadFile = File(...), client_pan: str = Form("ABCPA1092F")):
    """Uploads AIS / TIS PDF and extracts SFT transactions, interest, and dividends."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF format is supported for AIS/TIS.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        parser = AISTISParser()
        result = parser.parse(tmp_path, file_name=file.filename)
        if client_pan not in case_manager.documents:
            case_manager.documents[client_pan] = []
        case_manager.documents[client_pan].append(result.model_dump())

        case_manager.log_event(
            actor="System (Deterministic OCR Engine)",
            action="AIS_TIS_EXTRACTED",
            details=f"Extracted AIS/TIS for PAN {client_pan} with SFT interest & dividend discovery.",
            pan=client_pan,
        )
        return result
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
