"""
Base PDF & Layout Parser for Zero-LLM Deterministic Document Intelligence
Leverages pdfplumber & PyMuPDF (fitz) with coordinate bounding box extraction
"""

import re
from typing import List, Dict, Any, Optional, Tuple
import pdfplumber
import fitz  # PyMuPDF
from ..models.document_models import SourceCitation

class BaseDocParser:
    """Deterministic, rule-based PDF and tabular data extraction engine."""

    @staticmethod
    def clean_numeric_str(val: str) -> float:
        """Cleans Indian currency formatted strings into float: '₹ 14,85,000.00' -> 1485000.0"""
        if not val:
            return 0.0
        cleaned = str(val).strip()
        # Remove currency words/symbols
        cleaned = re.sub(r"[₹\$,\s]", "", cleaned)
        cleaned = re.sub(r"(?i)\b(?:Rs|INR)\b\.?", "", cleaned)
        # Keep only numbers, decimal dot, minus, parentheses
        cleaned = re.sub(r"[^\d\.\-()]", "", cleaned).strip()
        if cleaned.startswith("(") and cleaned.endswith(")"):
            cleaned = "-" + cleaned[1:-1]
        try:
            return float(cleaned)
        except ValueError:
            return 0.0

    @staticmethod
    def extract_regex_with_coords(
        pdf_path: str,
        pattern: str,
        doc_name: str,
        group_idx: int = 1,
        page_num: int = 0
    ) -> Optional[Tuple[str, SourceCitation]]:
        """Finds regex pattern on a PDF page and extracts the matched value with bounding box coordinates."""
        try:
            doc = fitz.open(pdf_path)
            if page_num >= len(doc):
                return None
            page = doc[page_num]
            text = page.get_text("text")
            match = re.search(pattern, text, re.IGNORECASE)
            if not match:
                return None

            matched_text = match.group(group_idx).strip()
            # Search for rect of matched text
            rects = page.search_for(matched_text)
            bbox = [0.0, 0.0, 0.0, 0.0]
            score = 0.6
            status = "TEXT_MATCH_ONLY"
            if rects:
                r = rects[0]
                bbox = [round(r.x0, 2), round(r.y0, 2), round(r.x1, 2), round(r.y1, 2)]
                score = 1.0
                status = "COORDINATE_VERIFIED"

            citation = SourceCitation(
                field_name=pattern,
                page_number=page_num + 1,
                bounding_box=bbox,
                raw_text=matched_text,
                evidence_score=score,
                evidence_status=status,
                document_name=doc_name
            )
            return matched_text, citation
        except Exception:
            return None

    @staticmethod
    def extract_tables_pdfplumber(pdf_path: str) -> List[List[List[str]]]:
        """Extracts structured 2D tables from all pages of the document."""
        all_tables = []
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    tables = page.extract_tables()
                    for t in tables:
                        # Clean empty rows / cells
                        cleaned_table = [
                            [str(cell).strip() if cell is not None else "" for cell in row]
                            for row in t if any(row)
                        ]
                        if cleaned_table:
                            all_tables.append(cleaned_table)
        except Exception:
            pass
        return all_tables
