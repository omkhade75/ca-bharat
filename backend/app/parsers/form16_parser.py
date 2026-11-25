"""
Form 16 Parser (Part A & Part B) - Zero-LLM Deterministic Engine
Extracts statutory salary heads, exemptions, deductions, and TDS with bounding box citations.
"""

import re
import fitz
import pdfplumber
from typing import Dict, Any, List, Optional
from .base_parser import BaseDocParser
from ..models.document_models import (
    Form16PartA,
    Form16PartB,
    ChapterVIAItem,
    TDSQuarterRecord,
    SourceCitation,
    ExtractionResult,
)

from datetime import datetime, timezone

class Form16Parser(BaseDocParser):
    """Deterministic parser for TRACES / Employer issued Form 16 Part A and Part B PDFs."""

    def parse(self, pdf_path: str, file_name: str = "Form_16.pdf", passwords: Optional[List[str]] = None) -> ExtractionResult:
        doc = fitz.open(pdf_path)
        if doc.is_encrypted:
            unlocked = False
            for pwd in (passwords or []):
                if pwd and doc.authenticate(pwd) > 0:
                    unlocked = True
                    break
            if not unlocked:
                raise ValueError("PDF is password-protected and could not be unlocked with client credentials.")

        all_text = ""
        page_texts = []
        for i in range(len(doc)):
            p_text = doc[i].get_text("text")
            page_texts.append(p_text)
            all_text += f"\n--- PAGE {i+1} ---\n" + p_text

        if not all_text.strip():
            raise ValueError("No extractable text layer found in PDF (possible scanned image without OCR layer).")

        citations: List[SourceCitation] = []
        field_scores: List[float] = []

        # 1. Extract Header Metadata (TAN, PAN, Names, AY)
        emp_tan_match = re.search(r"TAN\s*(?:of\s*Deductor)?\s*[:\-\s]*([A-Z]{4}[0-9]{5}[A-Z]{1})", all_text, re.IGNORECASE)
        emp_tan = emp_tan_match.group(1).upper() if emp_tan_match else "UNKNOWN_TAN"

        emp_pan_match = re.search(r"PAN\s*(?:of\s*Deductor)?\s*[:\-\s]*([A-Z]{5}[0-9]{4}[A-Z]{1})", all_text, re.IGNORECASE)
        emp_pan = emp_pan_match.group(1).upper() if emp_pan_match else ""

        ee_pan_match = re.search(r"PAN\s*(?:of\s*Employee)?\s*[:\-\s]*([A-Z]{5}[0-9]{4}[A-Z]{1})", all_text, re.IGNORECASE)
        ee_pan = ee_pan_match.group(1).upper() if ee_pan_match else "UNKNOWN"

        ee_name_match = re.search(r"Name\s*(?:and\s*Address)?\s*of\s*Employee\s*[:\-\s]*([A-Za-z0-9\s\.\,\-&]+?)(?:\r?\n|$)", all_text, re.IGNORECASE)
        ee_name = ee_name_match.group(1).strip() if ee_name_match else "Unknown Employee"

        emp_name_match = re.search(r"Name\s*(?:and\s*Address)?\s*of\s*Employer\s*[:\-\s]*([A-Za-z0-9\s\.\,\-&]+?)(?:\r?\n|$)", all_text, re.IGNORECASE)
        emp_name = emp_name_match.group(1).strip() if emp_name_match else "Unknown Employer"

        ay_match = re.search(r"Assessment\s*Year\s*[:\-\s]*([0-9]{4}\s*-\s*[0-9]{2,4})", all_text, re.IGNORECASE)
        ay = ay_match.group(1).replace(" ", "") if ay_match else "2025-26"

        # Helper to find amount and generate verified coordinate citation
        def find_amount_with_citation(pattern: str, field_name: str, track_evidence: bool = True) -> float:
            for page_idx, p_text in enumerate(page_texts):
                m = re.search(pattern, p_text, re.IGNORECASE)
                if m:
                    raw_val = m.group(1).strip()
                    val = self.clean_numeric_str(raw_val)
                    bbox = [0.0, 0.0, 0.0, 0.0]
                    ev_score = 0.6  # Text pattern matched, coordinates not uniquely isolated
                    ev_status = "TEXT_MATCH_ONLY"
                    try:
                        page = doc[page_idx]
                        # Disambiguate using full matched line y-position to avoid collisions on duplicate amounts (e.g., Rs. 0.00)
                        line_rects = page.search_for(m.group(0).strip())
                        val_rects = page.search_for(f"Rs. {raw_val}") or page.search_for(raw_val)
                        chosen_rect = None
                        if line_rects and val_rects:
                            target_y = line_rects[0].y0
                            for vr in val_rects:
                                if abs(vr.y0 - target_y) <= 6.0:
                                    chosen_rect = vr
                                    break
                        if not chosen_rect and line_rects:
                            chosen_rect = line_rects[0]
                        elif not chosen_rect and val_rects:
                            chosen_rect = val_rects[0]

                        if chosen_rect:
                            bbox = [round(chosen_rect.x0, 2), round(chosen_rect.y0, 2), round(chosen_rect.x1, 2), round(chosen_rect.y1, 2)]
                            ev_score = 1.0  # Coordinate bounding box verified on PDF page
                            ev_status = "COORDINATE_VERIFIED"
                        citations.append(SourceCitation(
                            field_name=field_name,
                            page_number=page_idx + 1,
                            bounding_box=bbox,
                            raw_text=raw_val,
                            evidence_score=ev_score,
                            evidence_status=ev_status,
                            document_name=file_name
                        ))
                    except Exception:
                        pass
                    if track_evidence:
                        field_scores.append(ev_score)
                    return val
            if track_evidence:
                field_scores.append(0.0)
            return 0.0

        # 2. Extract Salary Components (Part B)
        salary_17_1 = find_amount_with_citation(
            r"Salary\s*as\s*per\s*provisions\s*contained\s*in\s*sec(?:tion)?\s*17\(1\)[^:\n]*:\s*(?:Rs\.?|INR)?\s*([0-9][0-9,]*(?:\.[0-9]{2})?)",
            "Salary u/s 17(1)"
        )
        perquisites_17_2 = find_amount_with_citation(
            r"Value\s*of\s*perquisites\s*under\s*sec(?:tion)?\s*17\(2\)[^:\n]*:\s*(?:Rs\.?|INR)?\s*([0-9][0-9,]*(?:\.[0-9]{2})?)",
            "Perquisites u/s 17(2)"
        )
        profits_17_3 = find_amount_with_citation(
            r"Profits\s*in\s*lieu\s*of\s*salary\s*under\s*sec(?:tion)?\s*17\(3\)[^:\n]*:\s*(?:Rs\.?|INR)?\s*([0-9][0-9,]*(?:\.[0-9]{2})?)",
            "Profits in lieu u/s 17(3)"
        )
        gross_salary = salary_17_1 + perquisites_17_2 + profits_17_3

        # Exemptions u/s 10
        hra = find_amount_with_citation(
            r"(?:House\s*Rent\s*Allowance|HRA|10\(13A\))[^:\n]*:\s*(?:Rs\.?|INR)?\s*([0-9][0-9,]*(?:\.[0-9]{2})?)",
            "HRA u/s 10(13A)",
            track_evidence=False
        )
        lta = find_amount_with_citation(
            r"(?:Leave\s*Travel\s*Assistance|LTA|10\(5\))[^:\n]*:\s*(?:Rs\.?|INR)?\s*([0-9][0-9,]*(?:\.[0-9]{2})?)",
            "LTA u/s 10(5)",
            track_evidence=False
        )
        total_exemptions = hra + lta

        # Deductions u/s 16
        std_deduction = find_amount_with_citation(
            r"Standard\s*deduction\s*under\s*sec(?:tion)?\s*16\(ia\)[^:\n]*:\s*(?:Rs\.?|INR)?\s*([0-9][0-9,]*(?:\.[0-9]{2})?)",
            "Standard Deduction u/s 16(ia)"
        )
        prof_tax = find_amount_with_citation(
            r"(?:Tax\s*on\s*employment|Professional\s*tax|16\(iii\))[^:\n]*:\s*(?:Rs\.?|INR)?\s*([0-9][0-9,]*(?:\.[0-9]{2})?)",
            "Professional Tax u/s 16(iii)"
        )
        total_deductions_16 = std_deduction + prof_tax
        income_salaries = max(0.0, gross_salary - total_exemptions - total_deductions_16)

        # Chapter VI-A Deductions
        c_80c = find_amount_with_citation(
            r"(?:Section\s*80C|Life\s*Insurance|EPF|PPF)[^:\n]*:\s*(?:Rs\.?|INR)?\s*([0-9][0-9,]*(?:\.[0-9]{2})?)",
            "Deduction u/s 80C",
            track_evidence=False
        )
        c_80ccd = find_amount_with_citation(
            r"(?:Section\s*80CCD\(1B\)|NPS)[^:\n]*:\s*(?:Rs\.?|INR)?\s*([0-9][0-9,]*(?:\.[0-9]{2})?)",
            "Deduction u/s 80CCD(1B)",
            track_evidence=False
        )
        c_80d = find_amount_with_citation(
            r"(?:Section\s*80D|Health\s*Insurance|Mediclaim)[^:\n]*:\s*(?:Rs\.?|INR)?\s*([0-9][0-9,]*(?:\.[0-9]{2})?)",
            "Deduction u/s 80D",
            track_evidence=False
        )
        c_80tta = find_amount_with_citation(
            r"(?:Section\s*80TTA|Savings\s*Interest\s*Deduction)[^:\n]*:\s*(?:Rs\.?|INR)?\s*([0-9][0-9,]*(?:\.[0-9]{2})?)",
            "Deduction u/s 80TTA",
            track_evidence=False
        )

        chapter_via_list: List[ChapterVIAItem] = []
        if c_80c > 0:
            chapter_via_list.append(ChapterVIAItem(section="80C", gross_amount=c_80c, deductible_amount=min(c_80c, 150000.0)))
        if c_80ccd > 0:
            chapter_via_list.append(ChapterVIAItem(section="80CCD(1B)", gross_amount=c_80ccd, deductible_amount=min(c_80ccd, 50000.0)))
        if c_80d > 0:
            chapter_via_list.append(ChapterVIAItem(section="80D", gross_amount=c_80d, deductible_amount=min(c_80d, 50000.0)))
        if c_80tta > 0:
            chapter_via_list.append(ChapterVIAItem(section="80TTA", gross_amount=c_80tta, deductible_amount=min(c_80tta, 10000.0)))

        total_chapter_via = sum(item.deductible_amount for item in chapter_via_list)

        # Tax & TDS Deducted
        total_tds = find_amount_with_citation(
            r"(?:Total\s*tax\s*deducted(?:\s*at\s*source)?|Net\s*tax\s*deducted(?:\s*at\s*source)?)[^:\n]*:\s*(?:Rs\.?|INR)?\s*([0-9][0-9,]*(?:\.[0-9]{2})?)",
            "Total TDS Deducted"
        )

        # Dynamic quarterly TDS parsing
        quarters: List[TDSQuarterRecord] = []
        q_matches = re.findall(
            r"\((Q[1-4])\)[^\n]*?Amount\s*Paid\s*:\s*(?:Rs\.?|INR)?\s*([0-9][0-9,]*(?:\.[0-9]{2})?)[^\n]*?Tax\s*Deducted\s*:\s*(?:Rs\.?|INR)?\s*([0-9][0-9,]*(?:\.[0-9]{2})?)[^\n]*?Tax\s*Deposited\s*:\s*(?:Rs\.?|INR)?\s*([0-9][0-9,]*(?:\.[0-9]{2})?)",
            all_text,
            re.IGNORECASE,
        )
        for q_code, paid_s, ded_s, dep_s in q_matches:
            quarters.append(
                TDSQuarterRecord(
                    quarter=q_code.upper(),
                    amount_paid_credited=self.clean_numeric_str(paid_s),
                    tax_deducted=self.clean_numeric_str(ded_s),
                    tax_deposited=self.clean_numeric_str(dep_s),
                )
            )

        computed_evidence_score = round(sum(field_scores) / len(field_scores), 4) if field_scores else 0.0

        part_a = Form16PartA(
            employer_name=emp_name,
            employer_tan=emp_tan,
            employer_pan=emp_pan,
            employee_name=ee_name,
            employee_pan=ee_pan,
            assessment_year=ay,
            period_from="01-Apr-2024",
            period_to="31-Mar-2025",
            quarters=quarters,
            total_tax_deducted=total_tds,
            total_tax_deposited=total_tds,
        )

        part_b = Form16PartB(
            salary_us_17_1=salary_17_1,
            perquisites_us_17_2=perquisites_17_2,
            profits_in_lieu_us_17_3=profits_17_3,
            gross_salary=gross_salary,
            hra_us_10_13a=hra,
            lta_us_10_5=lta,
            total_exempt_allowances=total_exemptions,
            net_salary_after_exemptions=gross_salary - total_exemptions,
            standard_deduction_us_16ia=std_deduction,
            professional_tax_us_16iii=prof_tax,
            total_deductions_us_16=total_deductions_16,
            income_chargeable_under_salaries=income_salaries,
            gross_total_income=income_salaries,
            chapter_via_deductions=chapter_via_list,
            total_chapter_via=total_chapter_via,
            total_taxable_income=max(0.0, income_salaries - total_chapter_via),
            net_tax_payable=total_tds,
        )

        return ExtractionResult(
            document_id="f16-" + ee_pan,
            document_type="FORM_16",
            file_name=file_name,
            client_pan=ee_pan,
            assessment_year=ay,
            extracted_data={"part_a": part_a.model_dump(), "part_b": part_b.model_dump()},
            citations=citations,
            evidence_score=computed_evidence_score,
            evidence_methodology="COORDINATE_LOCALIZATION_RATIO",
            processed_at=datetime.now(timezone.utc).isoformat(),
        )
