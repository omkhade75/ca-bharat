"""
Export Services API Routes
Generates 7-Sheet Excel Workpaper (.xlsx) & Official CBDT ITR JSON
Consumes validated DB documents, reconciliation matrices, and tax computations,
enforcing authentication and client ownership validation.
"""

import os
import tempfile
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session

from ..db.session import get_db
from ..services.excel_generator import CAWorkpaperExcelGenerator
from ..services.cbdt_json_generator import CBDTJsonGenerator
from ..services.case_manager import case_manager
from ..services.document_validation import resolve_client_documents_for_engine
from .routes_reconcile import _reconstruct_matrix_from_db
from .auth_context import (
    ActorContext,
    require_authenticated_actor,
    assert_client_case_access,
)

router = APIRouter(prefix="/api/export", tags=["Export & Deliverables"])


def _load_validated_export_bundle(db: Session, client):
    bundle = resolve_client_documents_for_engine(
        db=db, client_id=client.id, client_pan=client.pan, case_id=None
    )
    f16_data = bundle.get("f16_data")
    f26as_data = bundle.get("f26as_data")
    ais_data = bundle.get("ais_data")

    # Fallback ONLY if DB lacks parsed rows (e.g. unit fixtures in case_manager)
    if not (f16_data or f26as_data or ais_data):
        docs = case_manager.documents.get(client.pan.upper(), [])
        f16_data = next((d["extracted_data"] for d in docs if d["document_type"] == "FORM_16"), None)
        f26as_data = next((d["extracted_data"] for d in docs if d["document_type"] == "FORM_26AS"), None)
        ais_data = next((d["extracted_data"] for d in docs if d["document_type"] == "AIS_TIS"), None)

    recon = (
        _reconstruct_matrix_from_db(
            db=db,
            client_id=client.id,
            client_pan=client.pan,
            client_name=client.name,
            case_id=None,
            assessment_year="2025-26",
        )
        or case_manager.reconciliations.get(client.pan.upper())
    )
    calc = case_manager.tax_computations.get(client.pan.upper())
    return f16_data, f26as_data, ais_data, recon, calc


@router.get("/workpaper/{pan}")
def export_excel_workpaper(
    pan: str,
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """Generates complete 7-sheet ICAI-standard Excel workpaper ready for CA filing & review."""
    client = case_manager.get_client(pan)
    assert_client_case_access(
        actor,
        target_client_id=client.id if client else "__UNOWNED__",
        require_ca_role=False,
    )
    if not client:
        raise HTTPException(status_code=404, detail=f"Client with PAN {pan.upper()} not found.")

    f16_data, f26as_data, ais_data, recon, calc = _load_validated_export_bundle(db, client)

    temp_dir = tempfile.gettempdir()
    file_path = os.path.join(temp_dir, f"CA_Audit_Workpaper_{pan.upper()}_AY2025-26.xlsx")

    CAWorkpaperExcelGenerator.generate_workpaper(
        client=client.model_dump(),
        f16_data=f16_data,
        f26as_data=f26as_data,
        ais_data=ais_data,
        reconciliation=recon.model_dump() if recon else None,
        tax_comp=calc.model_dump() if calc else None,
        output_path=file_path,
    )

    case_manager.log_event(
        actor=f"{actor.actor_name} ({actor.role})",
        action="EXCEL_WORKPAPER_EXPORTED",
        details=f"Exported 7-sheet statutory Excel audit workpaper for {pan.upper()}.",
        pan=pan,
    )

    return FileResponse(
        path=file_path,
        filename=f"CA_Audit_Workpaper_{pan.upper()}_AY2025-26.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


@router.get("/cbdt-json/{pan}")
def export_cbdt_json(
    pan: str,
    actor: ActorContext = Depends(require_authenticated_actor),
    db: Session = Depends(get_db),
):
    """Generates official CBDT filing schema JSON for upload to incometax.gov.in portal."""
    client = case_manager.get_client(pan)
    assert_client_case_access(
        actor,
        target_client_id=client.id if client else "__UNOWNED__",
        require_ca_role=False,
    )
    if not client:
        raise HTTPException(status_code=404, detail=f"Client with PAN {pan.upper()} not found.")

    f16_data, f26as_data, _, _, calc = _load_validated_export_bundle(db, client)

    json_payload = CBDTJsonGenerator.generate_itr1_json(
        client=client.model_dump(),
        tax_computation=calc.model_dump() if calc else {},
        f16_data=f16_data or {},
        f26as_data=f26as_data or {},
    )

    case_manager.log_event(
        actor=f"{actor.actor_name} ({actor.role})",
        action="CBDT_JSON_EXPORTED",
        details=f"Generated filing-ready CBDT JSON schema for {pan.upper()}.",
        pan=pan,
    )

    return JSONResponse(content=json_payload)
