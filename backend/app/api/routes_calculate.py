"""
Deterministic Direct Tax Calculation & Regime Optimization API Routes
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.tax_models import RegimeComparisonResult, IncomeHeadDetails, DeductionsDetail, TaxRegimeEnum
from ..engine.tax_calculator import TaxCalculator
from ..services.case_manager import case_manager

router = APIRouter(prefix="/api/calculate", tags=["Deterministic Tax Computation"])

class CalculateTaxRequest(BaseModel):
    client_pan: str
    income: IncomeHeadDetails
    deductions: Optional[DeductionsDetail] = None
    prepaid_tax: float = 0.0
    advance_tax: float = 0.0
    assessment_year: str = "2025-26"

class CASignOffRequest(BaseModel):
    client_pan: str
    ca_name: str = "CA Rajesh Sharma"
    ca_membership_no: str = "DEMO049281"
    chosen_regime: TaxRegimeEnum = TaxRegimeEnum.NEW_REGIME_115BAC
    verification_notes: str = "Verified Form 16, TRACES 26AS, and AIS. Slabs and deductions checked."

@router.post("/tax", response_model=RegimeComparisonResult)
def calculate_tax(req: CalculateTaxRequest):
    """Executes side-by-side deterministic calculation under Finance Act 2024 rules."""
    client = case_manager.get_client(req.client_pan)
    client_name = client.name if client else "Demo Taxpayer"

    result = TaxCalculator.compare_and_optimize(
        client_pan=req.client_pan,
        client_name=client_name,
        income=req.income,
        deductions=req.deductions or DeductionsDetail(),
        prepaid_tax=req.prepaid_tax,
        advance_tax=req.advance_tax,
        assessment_year=req.assessment_year,
    )
    case_manager.tax_computations[req.client_pan.upper()] = result

    case_manager.log_event(
        actor="System (Tax Calculation Engine)",
        action="DETERMINISTIC_TAX_COMPUTED",
        details=f"Calculated New vs Old regime for {req.client_pan}. Recommended: {result.recommended_regime.value}. Savings: ₹{result.tax_savings:,.2f}",
        pan=req.client_pan,
    )
    return result

@router.get("/{pan}", response_model=RegimeComparisonResult)
def get_tax_calculation(pan: str):
    """Retrieves active tax calculation and regime comparison for a taxpayer."""
    calc = case_manager.tax_computations.get(pan.upper())
    if not calc:
        # Generate default calculation for Arun
        income = IncomeHeadDetails(income_salaries=1442600.0, savings_interest=18400.0, dividend_income=24500.0, total_other_sources=42900.0, gross_total_income=1485500.0)
        ded = DeductionsDetail(standard_deduction=75000.0, professional_tax=2400.0, sec_80c=150000.0, sec_80ccd_1b_nps=50000.0, sec_80d_health=25000.0, sec_80tta_ttb_interest=10000.0)
        return calculate_tax(CalculateTaxRequest(client_pan=pan, income=income, deductions=ded, prepaid_tax=118560.0))
    return calc

@router.post("/ca-sign-off")
def ca_sign_off(req: CASignOffRequest):
    """Simulates mandatory Chartered Accountant statutory review and sign-off."""
    calc = case_manager.tax_computations.get(req.client_pan.upper())
    if not calc:
        raise HTTPException(status_code=404, detail="Tax computation must be executed prior to CA sign-off.")

    ts = datetime.now().isoformat()
    verification_hash = f"udin-{req.ca_membership_no}-{int(datetime.now().timestamp())}"
    calc.ca_sign_off_status = "CA_APPROVED"
    calc.ca_approver = f"{req.ca_name} (FCA #{req.ca_membership_no})"
    calc.ca_approval_timestamp = ts
    calc.verification_hash = verification_hash

    # Update client workflow status
    client = case_manager.get_client(req.client_pan)
    if client:
        client.workflow_status = "CA_APPROVED"

    case_manager.log_event(
        actor=f"{req.ca_name} (Demo Partner)",
        action="CA_STATUTORY_SIGN_OFF",
        details=f"Approved ITR under {req.chosen_regime.value}. Hash: {verification_hash}. Notes: {req.verification_notes}",
        pan=req.client_pan,
    )

    return {
        "status": "APPROVED",
        "verification_hash": verification_hash,
        "approved_at": ts,
        "message": f"Case for {req.client_pan} successfully approved by {req.ca_name}.",
    }
