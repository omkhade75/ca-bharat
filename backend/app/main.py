"""
CA Bharat AI - Enterprise FastAPI Server
Statutory Tax Intelligence & CA Audit Workpaper Backend
Governed by Income-tax Act, 1961, Finance Act 2024 & DPDP Act, 2023
Zero-LLM Deterministic Architecture
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .config import settings
from .db.session import init_db
from .api import (
    routes_clients,
    routes_extract,
    routes_documents,
    routes_reconcile,
    routes_calculate,
    routes_export,
    routes_audit,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        init_db()
    except Exception as e:
        print(f"Warning during DB initialization: {e}")
    yield

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Deterministic Direct Tax Intelligence, 3-Way Reconciliation, and ICAI-Standard Excel Workpaper Engine.",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Enable CORS for frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "https://ca-bharat-ai.onrender.com",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Subsystem Routers
app.include_router(routes_clients.router)
app.include_router(routes_extract.router)
app.include_router(routes_documents.router)
app.include_router(routes_reconcile.router)
app.include_router(routes_calculate.router)
app.include_router(routes_export.router)
app.include_router(routes_audit.router)

@app.get("/", tags=["Health & Status"])
def root_status():
    return {
        "status": "ONLINE",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "statutory_baseline": {
            "assessment_year": settings.DEFAULT_AY,
            "financial_year": settings.DEFAULT_FY,
            "governing_law": "Income-tax Act, 1961 & Finance Act, 2024",
            "standard_deduction_new_regime": f"₹ {settings.STANDARD_DEDUCTION_NEW_REGIME_AY_2025_26:,.2f}",
            "standard_deduction_old_regime": f"₹ {settings.STANDARD_DEDUCTION_OLD_REGIME:,.2f}",
            "ai_approach": "Zero-LLM Deterministic OCR & Coordinate Layout Parser",
        },
        "docs_url": "/docs",
    }

@app.get("/health", tags=["Health & Status"])
def health_check():
    return {"status": "HEALTHY", "code": 200}
