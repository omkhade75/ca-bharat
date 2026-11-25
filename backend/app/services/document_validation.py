"""
Validated Document Extraction -> Reconciliation & Tax Engine Resolver
Reads immutable extracted data, source citations, and CA field corrections directly
from the relational DB (uploaded_documents + reconciliation_items), normalizes seeded
and parser schemas, and guarantees that downstream reconciliation and tax computations
consume backend-validated records rather than hardcoded/unverified frontend values.
"""

from typing import Dict, Any, List, Optional, Tuple
import copy
import json
from sqlalchemy.orm import Session

from ..db.models import DBUploadedDocument, DBReconciliationItem
from ..db.repository import TaxpayerRepository
from ..models.tax_models import IncomeHeadDetails, DeductionsDetail


CORE_RECONCILIATION_CATEGORIES = {
    "FORM_16",
    "FORM_26AS",
    "AIS",
    "TIS",
    "AIS_TIS",
}


def canonical_doc_category(category: str) -> str:
    upper = (category or "").strip().upper()
    if upper in ("FORM_16", "FORM 16"):
        return "FORM_16"
    if upper in ("FORM_26AS", "FORM 26AS"):
        return "FORM_26AS"
    if upper in ("AIS", "TIS", "AIS_TIS", "AIS / TIS"):
        return "AIS_TIS"
    return upper or "OTHER_PROOF"


def _to_float(value: Any, default: float = 0.0) -> float:
    if value is None or value == "":
        return default
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        cleaned = value.replace(",", "").replace("₹", "").replace("Rs.", "").strip()
        try:
            return float(cleaned)
        except ValueError:
            return default
    return default


def _normalize_citations(raw_cit: Any, filename: str) -> List[Dict[str, Any]]:
    if isinstance(raw_cit, list):
        out = []
        for c in raw_cit:
            if isinstance(c, dict):
                entry = dict(c)
                if "evidence_score" not in entry and "confidence" in entry:
                    entry["evidence_score"] = entry.pop("confidence")
                entry.setdefault("document_name", filename)
                entry.setdefault("page_number", 1)
                entry.setdefault("bounding_box", [0.0, 0.0, 0.0, 0.0])
                entry.setdefault(
                    "evidence_status",
                    "COORDINATE_VERIFIED"
                    if entry.get("bounding_box", [0, 0, 0, 0]) != [0.0, 0.0, 0.0, 0.0]
                    else "TEXT_MATCH_ONLY",
                )
                out.append(entry)
        return out
    if isinstance(raw_cit, dict):
        return [
            {
                "field_name": k,
                "page_number": v.get("page", 1) if isinstance(v, dict) else 1,
                "bounding_box": v.get("box", [0.0, 0.0, 0.0, 0.0])
                if isinstance(v, dict)
                else [0.0, 0.0, 0.0, 0.0],
                "raw_text": str(v.get("raw_text", "")) if isinstance(v, dict) else "",
                "evidence_score": float(v.get("evidence_score", v.get("confidence", 1.0)))
                if isinstance(v, dict)
                else 1.0,
                "evidence_status": "COORDINATE_VERIFIED",
                "document_name": filename,
            }
            for k, v in raw_cit.items()
        ]
    return []


def _apply_field_override(target: Dict[str, Any], field_key: str, value: Any) -> None:
    if field_key in target:
        target[field_key] = value
        return
    if "." in field_key:
        parts = field_key.split(".")
        curr: Any = target
        for part in parts[:-1]:
            if isinstance(curr, dict):
                if part not in curr or not isinstance(curr[part], dict):
                    curr[part] = {}
                curr = curr[part]
            else:
                curr = None
                break
        if isinstance(curr, dict):
            curr[parts[-1]] = value
            return
    for section in ("part_b", "part_a"):
        if isinstance(target.get(section), dict) and field_key in target[section]:
            target[section][field_key] = value
            return
    target[field_key] = value


def _build_effective_doc_payload(
    doc: DBUploadedDocument,
) -> Tuple[Dict[str, Any], Dict[str, Any], List[Dict[str, Any]], List[Dict[str, Any]], int]:
    """Returns (effective_data, original_data, citations, applied_corrections, unverified_field_count)."""
    original_data: Dict[str, Any] = {}
    if doc.extracted_data_json:
        try:
            original_data = json.loads(doc.extracted_data_json)
        except Exception:
            original_data = {}

    raw_citations: Any = []
    if doc.citations_json:
        try:
            raw_citations = json.loads(doc.citations_json)
        except Exception:
            raw_citations = []
    citations = _normalize_citations(raw_citations, doc.filename)

    corrected_fields: Dict[str, Any] = {}
    if doc.corrected_fields_json:
        try:
            corrected_fields = json.loads(doc.corrected_fields_json)
        except Exception:
            corrected_fields = {}

    effective_data = copy.deepcopy(original_data)
    applied_corrections: List[Dict[str, Any]] = []
    unverified_corrections = 0

    for fkey, c_entry in corrected_fields.items():
        if not isinstance(c_entry, dict):
            continue
        review_st = c_entry.get("review_status", "UNVERIFIED")
        if c_entry.get("is_corrected"):
            c_val = c_entry.get("corrected_value")
            _apply_field_override(effective_data, fkey, c_val)
            applied_corrections.append(
                {
                    "document_id": doc.id,
                    "document_name": doc.filename,
                    "category": doc.category,
                    "field_key": fkey,
                    "original_value": c_entry.get("original_value"),
                    "corrected_value": c_val,
                    "corrected_by": c_entry.get("corrected_by"),
                    "correction_reason": c_entry.get("correction_reason"),
                    "corrected_at": c_entry.get("corrected_at"),
                    "review_status": review_st,
                    "original_citation": c_entry.get("original_citation"),
                    "correction_history": c_entry.get("correction_history", []),
                }
            )
            if review_st not in ("VERIFIED", "CORRECTED"):
                unverified_corrections += 1

    return effective_data, original_data, citations, applied_corrections, unverified_corrections


def normalize_form16_payload(
    raw: Dict[str, Any], corrected_keys: Optional[set] = None
) -> Dict[str, Any]:
    """Converts either Form16Parser dict or seeded flat dict into canonical Form 16 schema."""
    if not raw:
        return {}
    corrected_keys = corrected_keys or set()

    if "part_a" in raw or "part_b" in raw:
        part_a = copy.deepcopy(raw.get("part_a") or {})
        part_b = copy.deepcopy(raw.get("part_b") or {})

        # Propagate top-level flat override keys if CA edited them
        if "gross_salary" in raw and "part_b.gross_salary" not in corrected_keys:
            part_b["gross_salary"] = _to_float(raw["gross_salary"])
        elif (
            "part_b.salary_us_17_1" in corrected_keys or "salary_us_17_1" in corrected_keys
        ) and "part_b.gross_salary" not in corrected_keys:
            part_b["gross_salary"] = (
                _to_float(part_b.get("salary_us_17_1"))
                + _to_float(part_b.get("perquisites_us_17_2"))
                + _to_float(part_b.get("profits_in_lieu_us_17_3"))
            )

        if "total_tds" in raw and "part_a.total_tax_deposited" not in corrected_keys:
            part_a["total_tax_deposited"] = _to_float(raw["total_tds"])
        elif (
            "part_a.total_tax_deducted" in corrected_keys
            or "total_tax_deducted" in corrected_keys
        ) and "part_a.total_tax_deposited" not in corrected_keys:
            part_a["total_tax_deposited"] = _to_float(part_a.get("total_tax_deducted"))

        return {"part_a": part_a, "part_b": part_b}

    gross_sal = _to_float(raw.get("gross_salary"))
    exemptions = _to_float(raw.get("exemptions_us_10"))
    std_ded = _to_float(raw.get("standard_deduction"), 75000.0 if gross_sal > 0 else 0.0)
    prof_tax = _to_float(raw.get("professional_tax"))
    total_tds = _to_float(raw.get("total_tds", raw.get("tds_194j", 0.0)))

    chap_items = []
    if _to_float(raw.get("deductions_80c")) > 0:
        chap_items.append({"section": "80C", "gross_amount": _to_float(raw.get("deductions_80c")), "deductible_amount": min(_to_float(raw.get("deductions_80c")), 150000.0)})
    if _to_float(raw.get("deductions_80ccd_1b")) > 0:
        chap_items.append({"section": "80CCD(1B)", "gross_amount": _to_float(raw.get("deductions_80ccd_1b")), "deductible_amount": min(_to_float(raw.get("deductions_80ccd_1b")), 50000.0)})
    if _to_float(raw.get("deductions_80d")) > 0:
        chap_items.append({"section": "80D", "gross_amount": _to_float(raw.get("deductions_80d")), "deductible_amount": min(_to_float(raw.get("deductions_80d")), 75000.0)})

    return {
        "part_a": {
            "employer_name": raw.get("employer_name", "Employer"),
            "employer_tan": raw.get("employer_tan", ""),
            "total_tax_deducted": total_tds,
            "total_tax_deposited": total_tds,
            "section": raw.get("section", "192" if gross_sal > 0 else "194J"),
        },
        "part_b": {
            "salary_us_17_1": gross_sal,
            "gross_salary": gross_sal,
            "total_exempt_allowances": exemptions,
            "standard_deduction_us_16ia": std_ded,
            "professional_tax_us_16iii": prof_tax,
            "total_deductions_us_16": std_ded + prof_tax,
            "income_chargeable_under_salaries": max(0.0, gross_sal - exemptions - std_ded - prof_tax),
            "chapter_via_deductions": chap_items,
            "deductions_80c": _to_float(raw.get("deductions_80c")),
            "deductions_80ccd_1b": _to_float(raw.get("deductions_80ccd_1b")),
            "deductions_80d": _to_float(raw.get("deductions_80d")),
        },
    }


def normalize_form26as_payload(
    raw: Dict[str, Any], corrected_keys: Optional[set] = None
) -> Dict[str, Any]:
    """Converts either Form26ASParser dict or seeded flat dict into canonical Form 26AS schema."""
    if not raw:
        return {}
    corrected_keys = corrected_keys or set()

    if "tds_salary_part_a" in raw or "tds_non_salary_part_b" in raw:
        out = copy.deepcopy(raw)
        sal_items = out.get("tds_salary_part_a") or []
        non_sal_items = out.get("tds_non_salary_part_b") or []

        # Recompute or propagate explicit CA overrides on total_tds_credit_claimed
        base_sal_tds = sum(_to_float(i.get("total_tax_deposited")) for i in sal_items)
        base_non_sal_tds = sum(_to_float(i.get("total_tax_deposited")) for i in non_sal_items)
        computed_sum = base_sal_tds + base_non_sal_tds

        if "total_tds_credit_claimed" in corrected_keys:
            explicit_total = _to_float(out.get("total_tds_credit_claimed"))
            if sal_items and len(sal_items) == 1 and not non_sal_items:
                sal_items[0]["total_tax_deposited"] = explicit_total
                sal_items[0]["total_tax_deducted"] = explicit_total
            out["effective_total_tds_credit"] = explicit_total
        else:
            out["effective_total_tds_credit"] = (
                computed_sum if computed_sum > 0 else _to_float(out.get("total_tds_credit_claimed"))
            )
        return out

    tds_sal = _to_float(raw.get("total_tds_salary"))
    tds_non_sal = _to_float(raw.get("total_tds_non_salary"))
    adv = _to_float(raw.get("total_advance_tax"))
    explicit_credit = _to_float(raw.get("total_tax_credit"))
    if "total_tax_credit" in corrected_keys or "total_tds_credit_claimed" in corrected_keys:
        explicit_credit = _to_float(
            raw.get("total_tds_credit_claimed", raw.get("total_tax_credit")), explicit_credit
        )
        if tds_non_sal == 0.0:
            tds_sal = explicit_credit
    elif tds_sal == 0.0 and explicit_credit > 0 and tds_non_sal == 0.0:
        tds_sal = explicit_credit

    sal_rows = []
    if tds_sal > 0 or _to_float(raw.get("salary_credited")) > 0:
        sal_rows.append(
            {
                "deductor_name": raw.get("deductor_name", "Employer"),
                "deductor_tan": raw.get("deductor_tan", ""),
                "section": "192",
                "total_amount_credited": _to_float(raw.get("salary_credited")),
                "total_tax_deducted": tds_sal,
                "total_tax_deposited": tds_sal,
                "booking_status": "MATCHED",
            }
        )

    non_sal_rows = []
    if tds_non_sal > 0:
        non_sal_rows.append(
            {
                "deductor_name": raw.get("non_salary_deductor", "Deductor"),
                "section": raw.get("non_salary_section", "194J"),
                "total_amount_credited": _to_float(raw.get("non_salary_credited")),
                "total_tax_deducted": tds_non_sal,
                "total_tax_deposited": tds_non_sal,
                "booking_status": "MATCHED",
            }
        )

    return {
        "tds_salary_part_a": sal_rows,
        "tds_non_salary_part_b": non_sal_rows,
        "advance_tax_challans_part_d": [{"tax_paid": adv}] if adv > 0 else [],
        "total_tds_credit_claimed": explicit_credit or (tds_sal + tds_non_sal),
        "total_advance_tax_paid": adv,
        "effective_total_tds_credit": explicit_credit or (tds_sal + tds_non_sal),
    }


def normalize_ais_payload(raw: Dict[str, Any]) -> Dict[str, Any]:
    """Converts either AISTISParser dict or seeded flat dict into canonical AIS schema."""
    if not raw:
        return {}
    if "items" in raw:
        return copy.deepcopy(raw)

    items = []
    sav = _to_float(raw.get("savings_interest"))
    div = _to_float(raw.get("dividend_income"))
    sal = _to_float(raw.get("salary_income"))
    tds_rep = _to_float(raw.get("tds_reported"))
    prof = _to_float(raw.get("professional_receipts"))

    if sal > 0 or tds_rep > 0:
        items.append(
            {
                "info_code": "TDS-192",
                "category": "Salary",
                "gross_amount": sal,
                "taxable_amount": sal,
                "tax_deducted": tds_rep,
            }
        )
    if prof > 0:
        items.append(
            {
                "info_code": "TDS-194J",
                "category": "Professional Receipts",
                "gross_amount": prof,
                "taxable_amount": prof,
                "tax_deducted": _to_float(raw.get("tds_194j")),
            }
        )
    if sav > 0:
        items.append(
            {
                "info_code": "INT-SAV",
                "category": "Savings Bank Interest",
                "gross_amount": sav,
                "taxable_amount": sav,
                "tax_deducted": 0.0,
            }
        )
    if div > 0:
        items.append(
            {
                "info_code": "DIV-001",
                "category": "Dividend",
                "gross_amount": div,
                "taxable_amount": div,
                "tax_deducted": _to_float(raw.get("dividend_tds")),
            }
        )

    return {
        "items": items,
        "total_reported_income": sum(_to_float(i.get("taxable_amount")) for i in items),
        "total_tds_reported": sum(_to_float(i.get("tax_deducted")) for i in items),
    }


def resolve_client_documents_for_engine(
    db: Session,
    client_id: Optional[str],
    client_pan: str,
    case_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Loads authoritative documents from DB by client_id / case_id (or PAN fallback),
    applies verified/CA corrections over immutable originals, preserves citations &
    correction history, and returns a normalized bundle ready for ReconciliationEngine.
    """
    repo = TaxpayerRepository(db)
    docs: List[DBUploadedDocument] = []
    if client_id:
        docs = repo.get_documents_by_client_id(client_id, case_id=case_id)
    if not docs and client_pan:
        docs = repo.get_documents_by_pan(client_pan, case_id=case_id)

    active_docs = [d for d in docs if (d.ca_review_status or "").upper() != "REJECTED"]

    f16_norm: Optional[Dict[str, Any]] = None
    f26as_norm: Optional[Dict[str, Any]] = None
    ais_norm: Optional[Dict[str, Any]] = None
    originals: Dict[str, Any] = {}
    all_citations: List[Dict[str, Any]] = []
    applied_corrections: List[Dict[str, Any]] = []
    source_documents: List[Dict[str, Any]] = []

    parsed_count = 0
    verified_count = 0
    pending_review_count = 0
    unverified_correction_fields = 0

    for d in active_docs:
        cat_canon = canonical_doc_category(d.category)
        proc_status = (d.processing_status or "UPLOADED").upper()
        rev_status = (d.ca_review_status or "PENDING_REVIEW").upper()

        has_parsed_payload = False
        eff_raw, orig_raw, doc_cits, doc_corrs, unverified_corr = _build_effective_doc_payload(d)
        if proc_status == "PARSED" and isinstance(eff_raw, dict) and len(eff_raw) > 0:
            has_parsed_payload = True
            parsed_count += 1

        if rev_status == "VERIFIED":
            verified_count += 1
        elif rev_status == "PENDING_REVIEW":
            pending_review_count += 1

        unverified_correction_fields += unverified_corr
        all_citations.extend(doc_cits)
        applied_corrections.extend(doc_corrs)
        corr_keys = {c["field_key"] for c in doc_corrs}

        source_documents.append(
            {
                "id": d.id,
                "filename": d.filename,
                "category": cat_canon,
                "raw_category": d.category,
                "processing_status": proc_status,
                "ca_review_status": rev_status,
                "extraction_engine": d.extraction_engine or "DETERMINISTIC_PDF",
                "evidence_score": d.evidence_score,
                "corrections_count": len(doc_corrs),
                "has_extracted_data": has_parsed_payload,
            }
        )

        if not has_parsed_payload:
            continue

        if cat_canon == "FORM_16" and f16_norm is None:
            f16_norm = normalize_form16_payload(eff_raw, corr_keys)
            originals["FORM_16"] = normalize_form16_payload(orig_raw)
        elif cat_canon == "FORM_26AS" and f26as_norm is None:
            f26as_norm = normalize_form26as_payload(eff_raw, corr_keys)
            originals["FORM_26AS"] = normalize_form26as_payload(orig_raw)
        elif cat_canon == "AIS_TIS" and ais_norm is None:
            ais_norm = normalize_ais_payload(eff_raw)
            originals["AIS_TIS"] = normalize_ais_payload(orig_raw)

    core_parsed_docs = [
        sd
        for sd in source_documents
        if sd["category"] in CORE_RECONCILIATION_CATEGORIES and sd["has_extracted_data"]
    ]

    return {
        "f16_data": f16_norm,
        "f26as_data": f26as_norm,
        "ais_data": ais_norm,
        "originals": originals,
        "citations": all_citations,
        "applied_corrections": applied_corrections,
        "source_documents": source_documents,
        "validation_summary": {
            "total_docs": len(source_documents),
            "parsed_docs": parsed_count,
            "core_parsed_docs": len(core_parsed_docs),
            "verified_docs": verified_count,
            "pending_review_docs": pending_review_count,
            "applied_corrections_count": len(applied_corrections),
            "unverified_correction_fields": unverified_correction_fields,
            "has_validated_data": len(core_parsed_docs) > 0,
        },
    }


def derive_validated_tax_inputs_from_db(
    db: Session,
    client_id: Optional[str],
    client_pan: str,
    case_id: Optional[str] = None,
    assessment_year: str = "2025-26",
    occupation_profile: Optional[str] = None,
    reconciled_rows: Optional[List[Any]] = None,
) -> Dict[str, Any]:
    """
    Derives deterministic IncomeHeadDetails, DeductionsDetail, and prepaid tax credits
    strictly from validated backend extracted documents, CA corrections, and
    reconciliation resolution outputs.
    """
    bundle = resolve_client_documents_for_engine(
        db=db, client_id=client_id, client_pan=client_pan, case_id=case_id
    )
    f16 = bundle.get("f16_data") or {}
    f26as = bundle.get("f26as_data") or {}
    ais = bundle.get("ais_data") or {}
    val_summary = bundle["validation_summary"]

    # Index resolved/persisted reconciliation rows by canonical row_key
    row_map: Dict[str, Dict[str, Any]] = {}
    if reconciled_rows:
        for r in reconciled_rows:
            if hasattr(r, "row_key"):
                rk = r.row_key or r.id
                row_map[rk] = {
                    "is_resolved": bool(r.is_accepted),
                    "resolved_value": _to_float(r.resolved_value),
                    "amount_a": r.amount_a,
                    "amount_b": r.amount_b,
                    "ais_value": r.ais_value,
                    "status": r.status,
                }
            elif isinstance(r, dict):
                rk = r.get("id") or r.get("row_key")
                if rk:
                    row_map[rk] = {
                        "is_resolved": bool(r.get("is_resolved")),
                        "resolved_value": _to_float(r.get("resolved_value")),
                        "amount_a": r.get("form_16_value"),
                        "amount_b": r.get("form_26as_value"),
                        "ais_value": r.get("ais_value"),
                    }

    # 1. Head 1: Salaries
    part_b = f16.get("part_b") or {}
    part_a = f16.get("part_a") or {}
    raw_gross_sal = _to_float(part_b.get("gross_salary"))
    exemptions_10 = _to_float(part_b.get("total_exempt_allowances"))
    std_ded = _to_float(
        part_b.get("standard_deduction_us_16ia"),
        75000.0 if raw_gross_sal > 0 else 0.0,
    )
    prof_tax = _to_float(part_b.get("professional_tax_us_16iii"))

    sal_recon = row_map.get("row-salary-gross")
    if sal_recon and sal_recon["is_resolved"] and sal_recon["resolved_value"] > 0:
        effective_gross_salary = sal_recon["resolved_value"]
    elif raw_gross_sal > 0:
        effective_gross_salary = raw_gross_sal
    else:
        effective_gross_salary = sum(
            _to_float(i.get("total_amount_credited"))
            for i in (f26as.get("tds_salary_part_a") or [])
        )

    # TaxCalculator.compute_* expects gross salary before std_ded/prof_tax because TaxCalculator subtracts std_ded + prof_tax itself
    income_salaries = max(0.0, effective_gross_salary - exemptions_10)

    # 2. Head 3: Business/Profession (44ADA 50% on 194J receipts if applicable)
    prof_receipts = 0.0
    for item in f26as.get("tds_non_salary_part_b") or []:
        if str(item.get("section", "")).upper() == "194J":
            prof_receipts += _to_float(item.get("total_amount_credited"))
    if prof_receipts == 0.0:
        for item in ais.get("items") or []:
            if item.get("info_code") == "TDS-194J":
                prof_receipts += _to_float(item.get("taxable_amount"))
    income_pgbp = (
        round(prof_receipts * 0.50, 2)
        if prof_receipts > 0
        else 0.0
    )

    # 3. Head 5: Other Sources (Savings Interest + Dividend)
    savings_interest = 0.0
    dividend_income = 0.0
    for item in ais.get("items") or []:
        code = item.get("info_code", "")
        cat = item.get("category", "")
        if code == "INT-SAV" or "Interest" in cat:
            savings_interest += _to_float(item.get("taxable_amount"))
        elif code == "DIV-001" or "Dividend" in cat:
            dividend_income += _to_float(item.get("taxable_amount"))

    if "row-ais-savings-interest" in row_map and row_map["row-ais-savings-interest"]["is_resolved"]:
        savings_interest = row_map["row-ais-savings-interest"]["resolved_value"]
    if "row-ais-dividend" in row_map and row_map["row-ais-dividend"]["is_resolved"]:
        dividend_income = row_map["row-ais-dividend"]["resolved_value"]

    # 4. Head 4: Capital Gains (AIS SFT-017)
    stcg_111a = 0.0
    for item in ais.get("items") or []:
        if item.get("info_code") == "SFT-017":
            stcg_111a += _to_float(item.get("taxable_amount"))
    if "row-ais-capital-gains" in row_map and row_map["row-ais-capital-gains"]["is_resolved"]:
        stcg_111a = row_map["row-ais-capital-gains"]["resolved_value"]

    total_other_sources = savings_interest + dividend_income
    gross_total_income = income_salaries + income_pgbp + stcg_111a + total_other_sources

    # 5. Chapter VI-A Deductions (from validated Form 16 Part B)
    sec_80c = _to_float(part_b.get("deductions_80c"))
    sec_80ccd = _to_float(part_b.get("deductions_80ccd_1b"))
    sec_80d = _to_float(part_b.get("deductions_80d"))
    sec_80tta = min(savings_interest, 10000.0) if savings_interest > 0 else 0.0
    for ch in part_b.get("chapter_via_deductions") or []:
        sec = str(ch.get("section", "")).upper()
        amt = _to_float(ch.get("deductible_amount", ch.get("gross_amount")))
        if sec == "80C":
            sec_80c = max(sec_80c, amt)
        elif "80CCD" in sec:
            sec_80ccd = max(sec_80ccd, amt)
        elif sec == "80D":
            sec_80d = max(sec_80d, amt)
        elif "80TTA" in sec:
            sec_80tta = max(sec_80tta, amt)

    # 6. Safe TDS & Advance Tax Credits (respecting resolved reconciliation values / portal safe values)
    sal_tds_credit = 0.0
    if "row-tds-192" in row_map:
        sal_tds_credit = row_map["row-tds-192"]["resolved_value"]
    elif f26as.get("tds_salary_part_a"):
        sal_tds_credit = sum(
            _to_float(i.get("total_tax_deposited"))
            for i in f26as.get("tds_salary_part_a") or []
        )
    elif part_a.get("total_tax_deposited") is not None:
        sal_tds_credit = _to_float(part_a.get("total_tax_deposited"))

    non_sal_tds_credit = 0.0
    if "row-tds-194j" in row_map:
        non_sal_tds_credit += row_map["row-tds-194j"]["resolved_value"]
    else:
        non_sal_tds_credit += sum(
            _to_float(i.get("total_tax_deposited"))
            for i in (f26as.get("tds_non_salary_part_b") or [])
            if str(i.get("section", "")) == "194J"
        )
    if "row-tds-194a" in row_map:
        non_sal_tds_credit += row_map["row-tds-194a"]["resolved_value"]
    else:
        non_sal_tds_credit += sum(
            _to_float(i.get("total_tax_deposited"))
            for i in (f26as.get("tds_non_salary_part_b") or [])
            if str(i.get("section", "")) != "194J"
        )

    prepaid_tds = sal_tds_credit + non_sal_tds_credit
    if prepaid_tds == 0.0 and _to_float(f26as.get("effective_total_tds_credit")) > 0:
        prepaid_tds = _to_float(f26as.get("effective_total_tds_credit"))

    advance_tax = _to_float(f26as.get("total_advance_tax_paid"))
    if advance_tax == 0.0 and f26as.get("advance_tax_challans_part_d"):
        advance_tax = sum(
            _to_float(c.get("tax_paid")) for c in f26as.get("advance_tax_challans_part_d") or []
        )

    unresolved_rows = [k for k, v in row_map.items() if not v["is_resolved"]]
    if not val_summary["has_validated_data"]:
        validation_status = "NO_EXTRACTED_DOCS"
    elif len(unresolved_rows) > 0:
        validation_status = "UNRESOLVED_DISCREPANCIES"
    elif val_summary["pending_review_docs"] > 0:
        validation_status = "UNVERIFIED_DOCS"
    else:
        validation_status = "READY"

    income_model = IncomeHeadDetails(
        income_salaries=income_salaries,
        income_pgbp=income_pgbp,
        is_presumptive_44ada=bool(prof_receipts > 0),
        gross_professional_receipts=prof_receipts,
        stcg_111a=stcg_111a,
        total_capital_gains=stcg_111a,
        savings_interest=savings_interest,
        dividend_income=dividend_income,
        total_other_sources=total_other_sources,
        gross_total_income=gross_total_income,
    )
    deductions_model = DeductionsDetail(
        standard_deduction=std_ded,
        professional_tax=prof_tax,
        sec_80c=sec_80c,
        sec_80ccd_1b_nps=sec_80ccd,
        sec_80d_health=sec_80d,
        sec_80tta_ttb_interest=sec_80tta,
    )

    return {
        "bundle": bundle,
        "income": income_model,
        "deductions": deductions_model,
        "prepaid_tax": prepaid_tds,
        "advance_tax": advance_tax,
        "validation_status": validation_status,
        "validation_gate": {
            **val_summary,
            "unresolved_discrepancies_count": len(unresolved_rows),
            "unresolved_row_ids": unresolved_rows,
            "is_ready_for_sign_off": validation_status == "READY",
        },
        "income_summary": income_model.model_dump(),
        "deductions_summary": deductions_model.model_dump(),
    }
