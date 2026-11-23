"""
Unit Tests for 7-Sheet Excel Workpaper Generator (openpyxl)
"""

import os
import tempfile
import openpyxl
from app.services.excel_generator import CAWorkpaperExcelGenerator

def test_generate_7_sheet_workpaper():
    temp_dir = tempfile.gettempdir()
    output_path = os.path.join(temp_dir, "test_ca_workpaper.xlsx")
    
    client = {
        "pan": "ABCPA1092F",
        "name": "Arun Kumar Verma",
        "category": "Individual - Salaried",
        "recommended_itr": "ITR-1 (Sahaj)",
        "email": "arun.verma@demo.in",
        "mobile": "+91 98200 12345",
    }
    
    CAWorkpaperExcelGenerator.generate_workpaper(
        client=client,
        output_path=output_path,
    )
    
    assert os.path.exists(output_path)
    
    # Load and inspect sheets
    wb = openpyxl.load_workbook(output_path)
    sheet_names = wb.sheetnames
    
    expected_sheets = [
        "Taxpayer_Profile",
        "Form_16_Salary_TDS",
        "Form_26AS_Tax_Credits",
        "AIS_TIS_Financials",
        "3Way_Reconciliation",
        "Tax_Computation",
        "Audit_Trail",
    ]
    
    for sheet in expected_sheets:
        assert sheet in sheet_names, f"Missing required sheet: {sheet}"
        
    # Verify Taxpayer_Profile content
    ws_profile = wb["Taxpayer_Profile"]
    assert "CA BHARAT AI" in str(ws_profile["A1"].value)
    
    wb.close()
    if os.path.exists(output_path):
        os.remove(output_path)
