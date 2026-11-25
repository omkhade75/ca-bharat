"""
Document Intelligence & Zero-LLM Extraction API Routes (Legacy Direct Endpoints)
Handles Form 16, Form 26AS, and AIS/TIS with coordinate bounding box citations.
Enforces authentication, CA role checks, and client ownership validation.
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
import shutil
import tempfile
import os
from ..models.document_models import ExtractionResult
from ..parsers.form16_parser import Form16Parser
from ..parsers.form26as_parser import Form26ASParser
from ..parsers.ais_tis_parser import AISTISParser
from ..services.case_manager import case_manager
from .auth_context import (
    ActorContext,
    require_authenticated_actor,
    assert_client_case_access,
)

router = APIRouter(prefix="/api/extract", tags=["Document Intelligence Extraction"])


def _verify_legacy_extract_access(actor: ActorContext, client_pan: str) -> str:
    pan_upper = client_pan.upper()
    client = case_manager.get_client(pan_upper)
    assert_client_case_access(
        actor,
        target_client_id=client.id if client else "__UNOWNED__",
        require_ca_role=True,
    )
    if not client:
        raise HTTPException(status_code=404, detail=f"Taxpayer with PAN {pan_upper} not found.")
    return pan_upper


@router.post("/form16", response_model=ExtractionResult)
async def extract_form16(
    file: UploadFile = File(...),
    client_pan: str = Form("ABCPA1092F"),
    actor: ActorContext = Depends(require_authenticated_actor),
):
    """Uploads Form 16 PDF and runs zero-LLM deterministic extraction with coordinate citations."""
    pan_upper = _verify_legacy_extract_access(actor, client_pan)
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF format is supported for Form 16.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        parser = Form16Parser()
        result = parser.parse(tmp_path, file_name=file.filename or "Form16.pdf")
        if pan_upper not in case_manager.documents:
            case_manager.documents[pan_upper] = []
        case_manager.documents[pan_upper].append(result.model_dump())

        case_manager.log_event(
            actor=f"{actor.actor_name} ({actor.role})",
            action="FORM_16_EXTRACTED",
            details=f"Extracted Form 16 for PAN {pan_upper} with {len(result.citations)} coordinate citations.",
            pan=pan_upper,
        )
        return result
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@router.post("/form26as", response_model=ExtractionResult)
async def extract_form26as(
    file: UploadFile = File(...),
    client_pan: str = Form("ABCPA1092F"),
    actor: ActorContext = Depends(require_authenticated_actor),
):
    """Uploads Form 26AS (TRACES) PDF and extracts Part I, Part II TDS, and Part IV Advance Tax."""
    pan_upper = _verify_legacy_extract_access(actor, client_pan)
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF format is supported for Form 26AS.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        parser = Form26ASParser()
        result = parser.parse(tmp_path, file_name=file.filename or "Form26AS.pdf")
        if pan_upper not in case_manager.documents:
            case_manager.documents[pan_upper] = []
        case_manager.documents[pan_upper].append(result.model_dump())

        case_manager.log_event(
            actor=f"{actor.actor_name} ({actor.role})",
            action="FORM_26AS_EXTRACTED",
            details=f"Extracted Form 26AS for PAN {pan_upper} with TRACES TDS credit verification.",
            pan=pan_upper,
        )
        return result
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@router.post("/ais-tis", response_model=ExtractionResult)
async def extract_ais_tis(
    file: UploadFile = File(...),
    client_pan: str = Form("ABCPA1092F"),
    actor: ActorContext = Depends(require_authenticated_actor),
):
    """Uploads AIS / TIS PDF and extracts SFT transactions, interest, and dividends."""
    pan_upper = _verify_legacy_extract_access(actor, client_pan)
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF format is supported for AIS/TIS.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        parser = AISTISParser()
        result = parser.parse(tmp_path, file_name=file.filename or "AIS_TIS.pdf")
        if pan_upper not in case_manager.documents:
            case_manager.documents[pan_upper] = []
        case_manager.documents[pan_upper].append(result.model_dump())

        case_manager.log_event(
            actor=f"{actor.actor_name} ({actor.role})",
            action="AIS_TIS_EXTRACTED",
            details=f"Extracted AIS/TIS for PAN {pan_upper} with SFT interest & dividend discovery.",
            pan=pan_upper,
        )
        return result
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
