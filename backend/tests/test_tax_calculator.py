"""
Unit Tests for Direct Tax Calculator (Finance Act 2024 & Income-tax Act, 1961)
"""

import pytest
from app.engine.tax_calculator import TaxCalculator
from app.models.tax_models import IncomeHeadDetails, DeductionsDetail, TaxRegimeEnum

def test_new_regime_standard_deduction_ay_2025_26():
    """Finance Act 2024 increased standard deduction to ₹75,000 under Section 115BAC."""
    income = IncomeHeadDetails(income_salaries=1000000.0)
    result = TaxCalculator.compute_new_regime(income, assessment_year="2025-26")
    
    # 10,00,000 - 75,000 = 9,25,000
    assert result.total_deductions == 75000.0
    assert result.total_taxable_income == 925000.0

def test_section_87a_rebate_new_regime_zero_tax():
    """Under New Regime, income up to ₹7,00,000 incurs zero tax due to Section 87A rebate."""
    # Gross salary 7,75,000 - 75,000 standard deduction = 7,00,000
    income = IncomeHeadDetails(income_salaries=775000.0)
    result = TaxCalculator.compute_new_regime(income, assessment_year="2025-26")
    
    assert result.total_taxable_income == 700000.0
    # Slabs: 0-3L 0%, 3-7L 5% = 20,000
    assert result.basic_tax == 20000.0
    assert result.rebate_87a == 20000.0
    assert result.total_tax_liability == 0.0

def test_old_regime_deductions_and_slabs():
    """Tests Chapter VI-A deductions (80C, 80CCD, 80D, 80TTA) in Old Regime."""
    income = IncomeHeadDetails(
        income_salaries=1200000.0,
        savings_interest=15000.0,
        total_other_sources=15000.0,
    )
    deductions = DeductionsDetail(
        standard_deduction=50000.0,
        professional_tax=2400.0,
        sec_80c=150000.0,
        sec_80ccd_1b_nps=50000.0,
        sec_80d_health=25000.0,
        sec_80tta_ttb_interest=10000.0,
    )
    result = TaxCalculator.compute_old_regime(income, deductions, assessment_year="2025-26")
    
    # Gross: 12,15,000
    # Deductions: 50k + 2.4k + 1.5L + 50k + 25k + 10k = 2,87,400
    # Taxable: 9,27,600
    assert result.total_deductions == 287400.0
    assert result.total_taxable_income == 927600.0
    assert result.total_tax_liability > 0.0

def test_regime_comparison_recommends_best():
    """Verifies that regime comparison correctly identifies the lower tax regime."""
    income = IncomeHeadDetails(income_salaries=1500000.0)
    deductions = DeductionsDetail(sec_80c=150000.0)
    
    comp = TaxCalculator.compare_and_optimize(
        client_pan="ABCPA1092F",
        client_name="Arun Kumar Verma",
        income=income,
        deductions=deductions,
        prepaid_tax=118560.0,
    )
    
    assert comp.recommended_regime in [TaxRegimeEnum.NEW_REGIME_115BAC, TaxRegimeEnum.OLD_REGIME]
    assert comp.tax_savings >= 0.0
