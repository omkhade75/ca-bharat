# CA Bharat AI — Enterprise Direct Tax Python Backend

Deterministic, Zero-LLM Direct Tax Intelligence, 3-Way Reconciliation, and ICAI-Standard Multi-Sheet Excel Workpaper Engine.

---

## 1. Architectural Highlights

- **Zero-LLM Mandate**: 100% deterministic layout parsing, regex extraction, tabular extraction with `pdfplumber` and `PyMuPDF (fitz)`. Zero hallucination, zero API tokens, sub-second execution.
- **Source Coordinate Citations**: Every extracted figure (Gross Salary, Form 16 TDS, 26AS Tax Credit, 80C, 80D) returns page numbers and bounding box coordinates `[x0, y0, x1, y1]`.
- **7-Sheet ICAI Tax Audit Excel Workpaper (`openpyxl`)**:
  - `Sheet 1: Taxpayer_Profile`: Assessee details, PAN, Bank Details, DPDP Act 2023 Consent Token.
  - `Sheet 2: Form_16_Salary_TDS`: Extracted Section 17 salary, allowances u/s 10, deductions u/s 16 (Standard Deduction ₹75,000 for AY 2025-26), and quarterly TDS.
  - `Sheet 3: Form_26AS_Tax_Credits`: Part I (Salary), Part II (Non-Salary 194J/194C/194A), and Part IV (Advance Tax Challans).
  - `Sheet 4: AIS_TIS_Financials`: SFT interest (SFT-005/006), dividends (DIV-001), securities transactions (SFT-017).
  - `Sheet 5: 3Way_Reconciliation`: Form 16 vs 26AS vs AIS matrix with real-time variance flags and Section 143(1)(a) notice risk indicators.
  - `Sheet 6: Tax_Computation`: Side-by-side **New Tax Regime u/s 115BAC** vs **Old Tax Regime**, Rebate u/s 87A, Surcharge, Cess @ 4%, and UDIN signature block.
  - `Sheet 7: Audit_Trail`: Immutable chronological DPDP regulatory event stream.
- **Filing-Ready CBDT JSON Generator**: Compliant with official Income Tax Portal schemas for ITR-1 (Sahaj) and ITR-4 (Sugam).

---

## 2. Directory Structure

```
backend/
├── app/
│   ├── main.py                  # FastAPI application with CORS and route registration
│   ├── config.py                # Finance Act 2024 statutory slabs and limits
│   ├── models/                  # Pydantic schemas (Clients, Documents, Reconciliations, Tax)
│   ├── parsers/                 # Zero-LLM Deterministic Extraction Engines
│   │   ├── base_parser.py       # PDF layout & coordinate extractor
│   │   ├── form16_parser.py     # Form 16 Part A & Part B parser
│   │   ├── form26as_parser.py   # TRACES Form 26AS parser
│   │   └── ais_tis_parser.py    # AIS / TIS SFT & Dividend parser
│   ├── engine/                  # Core CA Rules Engine
│   │   ├── reconciliation_engine.py # 3-way reconciliation (Form 16 vs 26AS vs AIS)
│   │   └── tax_calculator.py    # Deterministic Old vs New Regime optimizer
│   ├── services/
│   │   ├── excel_generator.py   # 7-Sheet professional Excel workpaper generator
│   │   ├── cbdt_json_generator.py # Government e-filing JSON generator
│   │   └── case_manager.py      # Case orchestrator & in-memory state
│   └── api/                     # REST API Endpoints
│       ├── routes_clients.py    # /api/clients
│       ├── routes_extract.py    # /api/extract/form16, /form26as, /ais-tis
│       ├── routes_reconcile.py  # /api/reconcile/run, /resolve-item
│       ├── routes_calculate.py  # /api/calculate/tax, /ca-sign-off
│       ├── routes_export.py     # /api/export/workpaper/{pan}, /cbdt-json/{pan}
│       └── routes_audit.py      # /api/audit/logs
├── tests/                       # 17 Automated Unit & Integration Tests (100% Pass)
├── sample_data/                 # Authentic sample PDFs and workpapers
├── requirements.txt             # Backend dependencies
└── run_server.py                # Standalone uvicorn launcher
```

---

## 3. Running the Server

```bash
# Start FastAPI backend on http://localhost:8000
python backend/run_server.py

# Or via uvicorn directly:
uvicorn app.main:app --app-dir backend --reload --port 8000
```

Interactive OpenAPI Swagger Documentation: `http://localhost:8000/docs`

---

## 4. Running Automated Tests

```bash
# Run all 17 unit and integration tests
$env:PYTHONPATH = "backend"; python -m pytest backend/tests
```
