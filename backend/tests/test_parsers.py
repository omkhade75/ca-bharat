"""
Unit Tests for Zero-LLM Deterministic PDF Parsers
Verifies Form 16, Form 26AS, and AIS/TIS extraction with bounding box citations.
"""

import os
from app.parsers.form16_parser import Form16Parser
from app.parsers.form26as_parser import Form26ASParser
from app.parsers.ais_tis_parser import AISTISParser

def test_form16_parser_real_pdf():
    pdf_path = "backend/sample_data/Form16_Arun_TCS.pdf"
    assert os.path.exists(pdf_path)
    
    parser = Form16Parser()
    result = parser.parse(pdf_path)
    
    assert result.document_type == "FORM_16"
    assert result.client_pan == "ABCPA1092F"
    assert result.assessment_year == "2025-26"
    
    part_b = result.extracted_data["part_b"]
    assert part_b["salary_us_17_1"] == 1485000.0
    assert part_b["perquisites_us_17_2"] == 35000.0
    assert part_b["standard_deduction_us_16ia"] == 75000.0
    assert part_b["professional_tax_us_16iii"] == 2400.0
    assert part_b["income_chargeable_under_salaries"] == 1442600.0
    
    # Verify coordinate citations
    assert len(result.citations) > 0
    cit = result.citations[0]
    assert cit.page_number in [1, 2]
    assert len(cit.bounding_box) == 4

def test_form26as_parser_real_pdf():
    pdf_path = "backend/sample_data/Form26AS_Arun.pdf"
    assert os.path.exists(pdf_path)
    
    parser = Form26ASParser()
    result = parser.parse(pdf_path)
    
    assert result.document_type == "FORM_26AS"
    assert result.client_pan == "ABCPA1092F"
    
    data = result.extracted_data
    assert len(data["tds_salary_part_a"]) > 0
    salary_item = data["tds_salary_part_a"][0]
    assert salary_item["deductor_tan"] == "BLRT01928F"
    assert salary_item["total_tax_deposited"] == 118560.0

def test_ais_tis_parser_real_pdf():
    pdf_path = "backend/sample_data/AIS_TIS_Arun.pdf"
    assert os.path.exists(pdf_path)
    
    parser = AISTISParser()
    result = parser.parse(pdf_path)
    
    assert result.document_type == "AIS_TIS"
    assert result.client_pan == "ABCPA1092F"
    
    items = result.extracted_data["items"]
    codes = [i["info_code"] for i in items]
    assert "TDS-192" in codes
    assert "INT-SAV" in codes
    assert "DIV-001" in codes
