"""
Export Services API Routes
Generates 7-Sheet Excel Workpaper (.xlsx) & Official CBDT ITR JSON
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, JSONResponse
import tempfile
import os
from ..services.excel_generator import CAWorkpaperExcelGenerator
from ..services.cbdt_json_generator import CBDTJsonGenerator
from ..services.case_manager import case_manager

router = APIRouter(prefix="/api/export", tags=["Export & Deliverables"])

@router.get("/workpaper/{pan}")
def export_excel_workpaper(pan: str):
    """Generates complete 7-sheet ICAI-standard Excel workpaper ready for CA filing & review."""
    client = case_manager.get_client(pan)
    if not client:
        raise HTTPException(status_code=404, detail=f"Client with PAN {pan.upper()} not found.")

    docs = case_manager.documents.get(pan.upper(), [])
    f16_data = next((d["extracted_data"] for d in docs if d["document_type"] == "FORM_16"), None)
    f26as_data = next((d["extracted_data"] for d in docs if d["document_type"] == "FORM_26AS"), None)
    ais_data = next((d["extracted_data"] for d in docs if d["document_type"] == "AIS_TIS"), None)
    recon = case_manager.reconciliations.get(pan.upper())
    calc = case_manager.tax_computations.get(pan.upper())

    # Create temporary file
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
        actor="CA Rajesh Sharma (Demo Partner)",
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
def export_cbdt_json(pan: str):
    """Generates official CBDT filing schema JSON for upload to incometax.gov.in portal."""
    client = case_manager.get_client(pan)
    if not client:
        raise HTTPException(status_code=404, detail=f"Client with PAN {pan.upper()} not found.")

    calc = case_manager.tax_computations.get(pan.upper())
    docs = case_manager.documents.get(pan.upper(), [])
    f16_data = next((d["extracted_data"] for d in docs if d["document_type"] == "FORM_16"), {})
    f26as_data = next((d["extracted_data"] for d in docs if d["document_type"] == "FORM_26AS"), {})

    json_payload = CBDTJsonGenerator.generate_itr1_json(
        client=client.model_dump(),
        tax_computation=calc.model_dump() if calc else {},
        f16_data=f16_data,
        f26as_data=f26as_data,
    )

    case_manager.log_event(
        actor="CA Rajesh Sharma (Demo Partner)",
        action="CBDT_JSON_EXPORTED",
        details=f"Generated filing-ready CBDT JSON schema for {pan.upper()}.",
        pan=pan,
    )

    return JSONResponse(content=json_payload)
