"""
Deterministic Direct Tax Calculator & Regime Optimizer
Governed by Finance Act, 2024 and Income-tax Act, 1961
Handles AY 2025-26 & AY 2024-25, Section 115BAC, Surcharge, Rebate 87A, Section 44ADA
Zero-LLM Mathematical Engine
"""

import math
from typing import Dict, Any, Optional
from ..config import settings
from ..models.tax_models import (
    IncomeHeadDetails,
    DeductionsDetail,
    TaxComputationResult,
    RegimeComparisonResult,
    TaxRegimeEnum,
)

class TaxCalculator:
    """Deterministic statutory direct tax calculation engine."""

    @staticmethod
    def calculate_basic_tax_slabs(income: float, slabs: list) -> float:
        """Calculates slab-based tax for a given taxable income."""
        if income <= 0:
            return 0.0
        tax = 0.0
        for slab in slabs:
            s_min = slab["min"]
            s_max = slab["max"]
            rate = slab["rate"]
            if income > s_min:
                taxable_in_slab = min(income, s_max) - s_min
                tax += taxable_in_slab * rate
            else:
                break
        return round(tax, 2)

    @classmethod
    def compute_new_regime(
        cls,
        income: IncomeHeadDetails,
        prepaid_tax: float = 0.0,
        advance_tax: float = 0.0,
        assessment_year: str = "2025-26",
    ) -> TaxComputationResult:
        """Computes tax under Section 115BAC New Tax Regime (Finance Act 2024)."""
        gross_income = (
            income.income_salaries
            + income.income_house_property
            + income.income_pgbp
            + income.total_capital_gains
            + income.total_other_sources
        )

        # Standard deduction for salaried taxpayers under New Regime
        # AY 2025-26: ₹75,000 (increased by Finance Act 2024); earlier AYs: ₹50,000
        std_ded = 0.0
        if income.income_salaries > 0:
            std_ded = min(
                income.income_salaries,
                settings.STANDARD_DEDUCTION_NEW_REGIME_AY_2025_26 if assessment_year == "2025-26" else 50000.0,
            )

        # In New Regime, most Chapter VI-A deductions (80C, 80D) are disallowable u/s 115BAC(2)
        total_deductions = std_ded
        taxable_income = max(0.0, gross_income - total_deductions)
        # Round to nearest 10 as per Section 288A
        taxable_income = round(taxable_income / 10.0) * 10

        # Compute basic slab tax
        slabs = settings.NEW_REGIME_SLABS_AY_2025_26
        basic_tax = cls.calculate_basic_tax_slabs(taxable_income, slabs)

        # Rebate under Section 87A:
        # Full rebate if taxable income <= 7,00,000 (Max rebate ₹25,000)
        rebate_87a = 0.0
        if taxable_income <= settings.REBATE_87A_NEW_REGIME_THRESHOLD:
            rebate_87a = min(basic_tax, settings.REBATE_87A_NEW_REGIME_MAX)
        elif taxable_income > 700000.0 and taxable_income <= 727770.0:
            # Marginal relief under Section 87A:
            # Tax payable cannot exceed income in excess of ₹7,00,000
            diff = taxable_income - 700000.0
            if basic_tax > diff:
                rebate_87a = basic_tax - diff

        tax_after_rebate = max(0.0, basic_tax - rebate_87a)

        # Surcharge (Capped at 25% under New Regime)
        surcharge = 0.0
        if taxable_income > 5000000.0:
            for s_slab in settings.SURCHARGE_SLABS_NEW_REGIME:
                if taxable_income > s_slab["min"]:
                    surcharge = tax_after_rebate * s_slab["rate"]

        # Health & Education Cess @ 4% on (Tax + Surcharge)
        cess = round((tax_after_rebate + surcharge) * settings.HEALTH_AND_EDUCATION_CESS_RATE, 2)
        total_liability = round(tax_after_rebate + surcharge + cess)

        # Net Tax / Refund (Round to nearest 10 as per Section 288B)
        total_prepaid = prepaid_tax + advance_tax
        net_balance = total_liability - total_prepaid
        net_rounded = round(net_balance / 10.0) * 10

        is_refund = net_rounded < 0
        refund_amount = abs(net_rounded) if is_refund else 0.0
        tax_due = net_rounded if not is_refund else 0.0
        eff_rate = round((total_liability / gross_income * 100), 2) if gross_income > 0 else 0.0

        return TaxComputationResult(
            regime=TaxRegimeEnum.NEW_REGIME_115BAC,
            assessment_year=assessment_year,
            gross_total_income=gross_income,
            total_deductions=total_deductions,
            total_taxable_income=taxable_income,
            basic_tax=basic_tax,
            rebate_87a=rebate_87a,
            tax_after_rebate=tax_after_rebate,
            surcharge=surcharge,
            health_and_education_cess=cess,
            total_tax_liability=float(total_liability),
            tds_tcs_credit=prepaid_tax,
            advance_tax_paid=advance_tax,
            self_assessment_tax_paid=0.0,
            total_prepaid_tax=total_prepaid,
            net_tax_payable_or_refund=float(net_rounded),
            effective_tax_rate=eff_rate,
            is_refund=is_refund,
            refund_amount=float(refund_amount),
            tax_due_amount=float(tax_due),
        )

    @classmethod
    def compute_old_regime(
        cls,
        income: IncomeHeadDetails,
        deductions: DeductionsDetail,
        prepaid_tax: float = 0.0,
        advance_tax: float = 0.0,
        assessment_year: str = "2025-26",
    ) -> TaxComputationResult:
        """Computes tax under Old Tax Regime with Chapter VI-A deductions."""
        gross_income = (
            income.income_salaries
            + income.income_house_property
            + income.income_pgbp
            + income.total_capital_gains
            + income.total_other_sources
        )

        # Standard deduction (₹50,000 for salaried in Old Regime)
        std_ded = min(income.income_salaries, settings.STANDARD_DEDUCTION_OLD_REGIME) if income.income_salaries > 0 else 0.0

        # Chapter VI-A allowable limits
        c_80c = min(deductions.sec_80c, settings.MAX_80C_LIMIT)
        c_80ccd = min(deductions.sec_80ccd_1b_nps, settings.MAX_80CCD_1B_NPS_LIMIT)
        c_80d = min(deductions.sec_80d_health, settings.MAX_80D_SELF_LIMIT + settings.MAX_80D_PARENTS_SENIOR_LIMIT)
        c_80tta = min(income.savings_interest, settings.MAX_80TTA_SAVINGS_LIMIT)

        total_via = c_80c + c_80ccd + c_80d + c_80tta + deductions.sec_80e_education_loan + deductions.sec_80g_donations
        total_deductions = std_ded + deductions.professional_tax + total_via

        taxable_income = max(0.0, gross_income - total_deductions)
        taxable_income = round(taxable_income / 10.0) * 10

        # Slabs
        slabs = settings.OLD_REGIME_SLABS
        basic_tax = cls.calculate_basic_tax_slabs(taxable_income, slabs)

        # Rebate 87A (Old Regime threshold: ₹5,00,000; Max rebate: ₹12,500)
        rebate_87a = 0.0
        if taxable_income <= settings.REBATE_87A_OLD_REGIME_THRESHOLD:
            rebate_87a = min(basic_tax, settings.REBATE_87A_OLD_REGIME_MAX)

        tax_after_rebate = max(0.0, basic_tax - rebate_87a)

        # Surcharge (Up to 37% in Old Regime for >5 Cr)
        surcharge = 0.0
        if taxable_income > 5000000.0:
            for s_slab in settings.SURCHARGE_SLABS_OLD_REGIME:
                if taxable_income > s_slab["min"]:
                    surcharge = tax_after_rebate * s_slab["rate"]

        cess = round((tax_after_rebate + surcharge) * settings.HEALTH_AND_EDUCATION_CESS_RATE, 2)
        total_liability = round(tax_after_rebate + surcharge + cess)

        total_prepaid = prepaid_tax + advance_tax
        net_balance = total_liability - total_prepaid
        net_rounded = round(net_balance / 10.0) * 10

        is_refund = net_rounded < 0
        refund_amount = abs(net_rounded) if is_refund else 0.0
        tax_due = net_rounded if not is_refund else 0.0
        eff_rate = round((total_liability / gross_income * 100), 2) if gross_income > 0 else 0.0

        return TaxComputationResult(
            regime=TaxRegimeEnum.OLD_REGIME,
            assessment_year=assessment_year,
            gross_total_income=gross_income,
            total_deductions=total_deductions,
            total_taxable_income=taxable_income,
            basic_tax=basic_tax,
            rebate_87a=rebate_87a,
            tax_after_rebate=tax_after_rebate,
            surcharge=surcharge,
            health_and_education_cess=cess,
            total_tax_liability=float(total_liability),
            tds_tcs_credit=prepaid_tax,
            advance_tax_paid=advance_tax,
            self_assessment_tax_paid=0.0,
            total_prepaid_tax=total_prepaid,
            net_tax_payable_or_refund=float(net_rounded),
            effective_tax_rate=eff_rate,
            is_refund=is_refund,
            refund_amount=float(refund_amount),
            tax_due_amount=float(tax_due),
        )

    @classmethod
    def compare_and_optimize(
        cls,
        client_pan: str,
        client_name: str,
        income: IncomeHeadDetails,
        deductions: Optional[DeductionsDetail] = None,
        prepaid_tax: float = 0.0,
        advance_tax: float = 0.0,
        assessment_year: str = "2025-26",
    ) -> RegimeComparisonResult:
        """Runs side-by-side computation of New vs Old Regime and selects optimal statutory regime."""
        if deductions is None:
            deductions = DeductionsDetail()

        new_res = cls.compute_new_regime(
            income=income,
            prepaid_tax=prepaid_tax,
            advance_tax=advance_tax,
            assessment_year=assessment_year,
        )

        old_res = cls.compute_old_regime(
            income=income,
            deductions=deductions,
            prepaid_tax=prepaid_tax,
            advance_tax=advance_tax,
            assessment_year=assessment_year,
        )

        # Determine optimal regime (lower total liability)
        if new_res.total_tax_liability <= old_res.total_tax_liability:
            rec = TaxRegimeEnum.NEW_REGIME_115BAC
            savings = old_res.total_tax_liability - new_res.total_tax_liability
            reason = (
                f"New Tax Regime (Sec 115BAC) is optimal: saves ₹{savings:,.2f} over Old Regime. "
                f"The enhanced Standard Deduction of ₹{new_res.total_deductions:,.0f} (AY {assessment_year}) "
                f"and wider concessional slabs (5%-20%) yield lower net tax liability than available Old Regime deductions."
            )
        else:
            rec = TaxRegimeEnum.OLD_REGIME
            savings = new_res.total_tax_liability - old_res.total_tax_liability
            reason = (
                f"Old Tax Regime is optimal: Chapter VI-A deductions and allowances (₹{old_res.total_deductions:,.2f}) "
                f"reduce net taxable income to ₹{old_res.total_taxable_income:,.2f}, saving ₹{savings:,.2f} over New Regime."
            )

        # Flag missing information requiring CA verification
        missing_flags = []
        if deductions.sec_80d_health > 0:
            missing_flags.append(
                "Verify Section 80D health insurance premium payment mode (cash ineligible except preventive checkup max ₹5,000)."
            )
        if deductions.sec_80c > 0:
            missing_flags.append(
                "Verify Section 80C investment proofs (ELSS statement, PPF deposit receipt, EPF statement, LIC receipts)."
            )
        if income.savings_interest > 10000.0 and deductions.sec_80tta_ttb_interest == 0:
            missing_flags.append(
                "Savings interest exceeds ₹10,000 limit; confirm eligibility for Section 80TTA deduction under Old Regime."
            )
        if prepaid_tax == 0.0 and advance_tax == 0.0:
            missing_flags.append(
                "No prepaid tax credit recorded; verify 26AS/AIS SFT records to ensure all TDS/TCS entries are claimed."
            )

        breakdown = {
            "income_heads": {
                "salary": income.income_salaries,
                "house_property": income.income_house_property,
                "pgbp": income.income_pgbp,
                "capital_gains": income.total_capital_gains,
                "other_sources": income.total_other_sources,
                "gross_total_income": new_res.gross_total_income,
            },
            "new_regime_steps": {
                "standard_deduction": new_res.total_deductions,
                "taxable_income": new_res.total_taxable_income,
                "slab_tax": new_res.basic_tax,
                "rebate_87a": new_res.rebate_87a,
                "tax_after_rebate": new_res.tax_after_rebate,
                "surcharge": new_res.surcharge,
                "cess_4pct": new_res.health_and_education_cess,
                "total_liability": new_res.total_tax_liability,
                "total_prepaid_tax": new_res.total_prepaid_tax,
                "net_tax_payable_or_refund": new_res.net_tax_payable_or_refund,
            },
            "old_regime_steps": {
                "standard_deduction": min(income.income_salaries, 50000.0) if income.income_salaries > 0 else 0.0,
                "professional_tax": deductions.professional_tax,
                "chapter_via_deductions": max(
                    0.0,
                    old_res.total_deductions
                    - (50000.0 if income.income_salaries > 0 else 0.0)
                    - deductions.professional_tax,
                ),
                "total_deductions": old_res.total_deductions,
                "taxable_income": old_res.total_taxable_income,
                "slab_tax": old_res.basic_tax,
                "rebate_87a": old_res.rebate_87a,
                "tax_after_rebate": old_res.tax_after_rebate,
                "surcharge": old_res.surcharge,
                "cess_4pct": old_res.health_and_education_cess,
                "total_liability": old_res.total_tax_liability,
                "total_prepaid_tax": old_res.total_prepaid_tax,
                "net_tax_payable_or_refund": old_res.net_tax_payable_or_refund,
            },
        }

        return RegimeComparisonResult(
            client_pan=client_pan,
            client_name=client_name,
            assessment_year=assessment_year,
            new_regime=new_res,
            old_regime=old_res,
            recommended_regime=rec,
            tax_savings=round(savings, 2),
            ca_sign_off_status="PENDING_CA_REVIEW",
            regime_comparison_reason=reason,
            missing_information_flags=missing_flags,
            calculation_breakdown=breakdown,
        )
