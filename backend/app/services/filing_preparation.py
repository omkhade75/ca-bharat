"""
ITR Filing Preparation & Schedule Mapping Service
Governed by Rule 12 of Income-tax Rules, 1962 and CBDT e-Filing Specifications
Maps validated income, deductions, TDS credits, and CA review resolutions into statutory ITR schedules:
- Part A - GEN (General Information)
- Schedule S (Salary)
- Schedule HP (House Property)
- Schedule CG (Capital Gains)
- Schedule OS (Other Sources)
- Schedule VIA (Deductions u/c VI-A)
- Schedule TDS / IT (Prepaid Taxes)
- Part B - TI (Total Income)
- Part B - TTI (Computation of Tax Liability)
- Verification
Includes mandatory field validation and demo-only filing safeguards.
"""

from datetime import datetime, timezone
import hashlib
import json
import re
from typing import Dict, Any, List, Optional, Tuple
from pydantic import BaseModel, Field


DEMO_FILING_DISCLAIMER = (
    "Ready for Filing — Demo Only. This return has not been submitted to the Income Tax Department. "
    "Prototype demonstration for CA firm review. No real submission to CBDT e-Filing portal, "
    "DSC signing, or Aadhaar OTP e-verification is performed."
)


class FilingValidationReport(BaseModel):
    is_valid: bool
    total_checks_run: int
    errors: List[str]
    warnings: List[str]
    validated_at: str


class FilingPreparationPackage(BaseModel):
    client_id: str
    client_pan: str
    client_name: str
    assessment_year: str
    selected_itr_form: str
    is_ca_approved: bool
    ca_approver: Optional[str] = None
    approval_timestamp: Optional[str] = None
    verification_hash: Optional[str] = None
    filing_status: str  # "READY_FOR_FILING_DEMO" or "PENDING_CA_APPROVAL"
    demo_disclaimer: str = DEMO_FILING_DISCLAIMER
    schedules: Dict[str, Any]
    itr_json_payload: Dict[str, Any]
    validation_report: FilingValidationReport


class FilingPreparationService:
    """Deterministic statutory mapper from validated database outputs to CBDT return schedules."""

    @classmethod
    def generate_filing_package(
        cls,
        client_dict: Dict[str, Any],
        tax_comp_dict: Dict[str, Any],
        reconciled_rows: Optional[List[Dict[str, Any]]] = None,
        assessment_year: str = "2025-26",
    ) -> FilingPreparationPackage:
        client_id = client_dict.get("id") or client_dict.get("client_id", "")
        pan = (client_dict.get("pan") or "ABCPA1092F").upper()
        name = client_dict.get("name") or "Arun Kumar Verma"
        name_parts = name.strip().split(" ")
        first_name = name_parts[0]
        last_name = name_parts[-1] if len(name_parts) > 1 else first_name
        middle_name = " ".join(name_parts[1:-1]) if len(name_parts) > 2 else ""

        is_ca_approved = bool(tax_comp_dict.get("is_ca_approved", False))
        ca_approver = tax_comp_dict.get("ca_approver")
        approved_at = tax_comp_dict.get("ca_approval_timestamp") or tax_comp_dict.get("approved_at")
        v_hash = tax_comp_dict.get("verification_hash") or tax_comp_dict.get("ca_sign_off_hash") or ""

        # Extract income & deduction summaries
        inc = tax_comp_dict.get("income_summary", {}) or {}
        ded = tax_comp_dict.get("deductions_summary", {}) or {}
        rec_regime = tax_comp_dict.get("recommended_regime", "New Regime")
        is_new_regime = "NEW" in str(rec_regime).upper()

        new_reg = tax_comp_dict.get("new_regime", {}) or {}
        old_reg = tax_comp_dict.get("old_regime", {}) or {}
        chosen_reg = new_reg if is_new_regime else old_reg

        # Extract values
        gross_salary = float(inc.get("salary") or inc.get("income_salaries") or 1450000.0)
        std_ded = float(chosen_reg.get("total_deductions") or 75000.0) if is_new_regime else float(ded.get("standard_deduction") or 50000.0)
        pt = float(ded.get("professional_tax") or 0.0) if not is_new_regime else 0.0
        income_from_salary = max(0.0, gross_salary - std_ded - pt)

        income_hp = float(inc.get("house_property") or inc.get("income_house_property") or 0.0)
        income_pgbp = float(inc.get("pgbp") or inc.get("income_pgbp") or 0.0)
        income_cg = float(inc.get("capital_gains") or inc.get("total_capital_gains") or 0.0)

        savings_interest = float(inc.get("savings_interest") or 0.0)
        dividend_income = float(inc.get("dividend_income") or 0.0)
        other_sources_misc = float(inc.get("other_sources") or inc.get("total_other_sources") or 0.0)
        total_other_sources = max(other_sources_misc, savings_interest + dividend_income)

        # Statutory Gross Total Income (Section 14: sum of net income under 5 heads)
        gti = income_from_salary + income_hp + income_pgbp + income_cg + total_other_sources
        total_via = float(chosen_reg.get("total_deductions") or 0.0) if not is_new_regime else 0.0
        taxable_income = float(chosen_reg.get("total_taxable_income") or max(0.0, gti - total_via))

        basic_tax = float(chosen_reg.get("basic_tax") or 0.0)
        rebate_87a = float(chosen_reg.get("rebate_87a") or 0.0)
        surcharge = float(chosen_reg.get("surcharge") or 0.0)
        cess = float(chosen_reg.get("health_and_education_cess") or 0.0)
        total_tax_liability = float(chosen_reg.get("total_tax_liability") or 0.0)

        tds_credit = float(tax_comp_dict.get("tds_credits") or chosen_reg.get("tds_tcs_credit") or 0.0)
        advance_tax = float(chosen_reg.get("advance_tax_paid") or 0.0)
        total_prepaid = float(chosen_reg.get("total_prepaid_tax") or (tds_credit + advance_tax))
        # Net Tax / Refund (Strictly rounded to nearest multiple of ₹10 per Section 288B)
        raw_refund = float(chosen_reg.get("refund_amount") or (total_prepaid - total_tax_liability if total_prepaid > total_tax_liability else 0.0))
        refund_amount = float(round(raw_refund / 10.0) * 10) if raw_refund > 0 else 0.0

        raw_tax_due = float(chosen_reg.get("tax_due_amount") or (total_tax_liability - total_prepaid if total_tax_liability > total_prepaid else 0.0))
        tax_due = float(round(raw_tax_due / 10.0) * 10) if raw_tax_due > 0 else 0.0

        # Selected ITR form
        selected_itr_form = tax_comp_dict.get("selected_itr_form") or "ITR-1 (Sahaj)"
        form_short = selected_itr_form.split(" ")[0].upper()

        bank = client_dict.get("bank_details") or {
            "bank_name": "HDFC Bank Ltd",
            "ifsc_code": "HDFC0000060",
            "account_number": "50100294819281",
            "account_type": "SAV",
            "refund_flag": "YES",
        }

        # ----------------------------------------------------------------------
        # Statutory Schedules Mapping
        # ----------------------------------------------------------------------
        schedules = {
            "PartA_GEN": {
                "PersonalInfo": {
                    "FirstName": first_name,
                    "MiddleName": middle_name,
                    "SurName": last_name,
                    "PAN": pan,
                    "ResidentialStatus": client_dict.get("residential_status", "RESIDENT"),
                    "EmployerCategory": "OTH",
                    "Email": client_dict.get("email", "arun.verma@demo.in"),
                    "MobileNo": client_dict.get("phone", "+91 98200 12345"),
                },
                "FilingStatus": {
                    "ReturnFileSec": "11",  # Section 139(1) - On or before due date
                    "OptOutNewTaxRegime": "N" if is_new_regime else "Y",
                    "AssessmentYear": assessment_year,
                    "FinancialYear": f"FY {int(assessment_year.split('-')[0])-1}-{assessment_year.split('-')[0][-2:]}",
                },
            },
            "Schedule_S": {
                "ScheduleName": "Schedule Salary (Section 15 to 17)",
                "GrossSalary": gross_salary,
                "SalaryUnderSec17_1": gross_salary - 35000.0 if gross_salary > 35000 else gross_salary,
                "PerquisitesUnderSec17_2": 35000.0 if gross_salary > 35000 else 0.0,
                "ProfitsInLieuSec17_3": 0.0,
                "DeductionUnderSec16": std_ded + pt,
                "StandardDeductionSec16ia": std_ded,
                "EntertainmentAllowanceSec16ii": 0.0,
                "ProfessionalTaxSec16iii": pt,
                "IncomeChargeableUnderSalaries": income_from_salary,
            },
            "Schedule_HP": {
                "ScheduleName": "Schedule House Property (Section 22 to 27)",
                "PropertyType": "Self-Occupied" if income_hp == 0 else "Let-Out",
                "AnnualValue": max(0.0, income_hp / 0.7) if income_hp > 0 else 0.0,
                "StandardDeduction24a": round(income_hp * 0.3 / 0.7, 2) if income_hp > 0 else 0.0,
                "InterestOnBorrowedCapital24b": abs(income_hp) if income_hp < 0 else 0.0,
                "IncomeFromHouseProperty": income_hp,
            },
            "Schedule_CG": {
                "ScheduleName": "Schedule Capital Gains (Section 45 to 55)",
                "ShortTermCapitalGains111A": float(inc.get("stcg_111a") or 0.0),
                "LongTermCapitalGains112A": float(inc.get("ltcg_112a") or 0.0),
                "LongTermCapitalGains112": float(inc.get("ltcg_112") or 0.0),
                "TotalCapitalGains": income_cg,
            },
            "Schedule_OS": {
                "ScheduleName": "Schedule Income from Other Sources (Section 56 to 59)",
                "SavingsBankInterest": savings_interest or 18450.0,
                "DividendIncome": dividend_income or 4200.0,
                "OtherInterestAndIncome": max(0.0, total_other_sources - (savings_interest or 18450.0) - (dividend_income or 4200.0)),
                "DeductionsUnderSec57": 0.0,
                "TotalIncomeOtherSources": total_other_sources,
            },
            "Schedule_VIA": {
                "ScheduleName": "Schedule Chapter VI-A Deductions",
                "ApplicableRegime": "Old Regime Only" if not is_new_regime else "Disallowed u/s 115BAC(2)",
                "Sec80C": float(ded.get("sec_80c") or (150000.0 if not is_new_regime else 0.0)),
                "Sec80CCD_1B": float(ded.get("sec_80ccd_1b_nps") or (50000.0 if not is_new_regime else 0.0)),
                "Sec80D": float(ded.get("sec_80d_health") or (25000.0 if not is_new_regime else 0.0)),
                "Sec80TTA": min(savings_interest or 18450.0, 10000.0) if not is_new_regime else 0.0,
                "TotalChapterVIADeductions": total_via,
            },
            "Schedule_TaxesPaid": {
                "ScheduleName": "Schedule TDS, TCS & Advance Tax",
                "TDSOnSalaryForm16": tds_credit,
                "TDSNonSalaryForm26AS": 0.0,
                "TCSCredits": 0.0,
                "AdvanceTaxPaid": advance_tax,
                "SelfAssessmentTaxPaid": 0.0,
                "TotalTaxesPaid": total_prepaid,
            },
            "PartB_TI": {
                "GrossTotalIncome": gti,
                "TotalDeductions": total_via,
                "TotalIncomeTaxable": taxable_income,
            },
            "PartB_TTI": {
                "BasicTaxOnTotalIncome": basic_tax,
                "RebateUnderSection87A": rebate_87a,
                "TaxAfterRebate": max(0.0, basic_tax - rebate_87a),
                "Surcharge": surcharge,
                "HealthAndEducationCess4pct": cess,
                "TotalTaxLiability": total_tax_liability,
                "TotalPrepaidTaxes": total_prepaid,
                "NetTaxPayable": tax_due,
                "RefundDue": refund_amount,
            },
            "Verification": {
                "AssesseeName": name,
                "FatherName": "Ramesh Kumar Verma",
                "AssesseePAN": pan,
                "Capacity": "Self",
                "Place": "Bengaluru",
                "VerificationDate": datetime.now().strftime("%Y-%m-%d"),
                "CA_SignOff": {
                    "IsCAApproved": is_ca_approved,
                    "CA_Approver": ca_approver or "CA Rajesh Sharma (Partner)",
                    "ApprovalTimestamp": approved_at or datetime.now(timezone.utc).isoformat(),
                    "VerificationHash": v_hash,
                },
            },
            "BankAccountDetails": [bank],
        }

        # ----------------------------------------------------------------------
        # Structured JSON Filing Payload
        # ----------------------------------------------------------------------
        now_date = datetime.now().strftime("%Y-%m-%d")
        itr_root_key = "ITR1" if "ITR-1" in form_short else ("ITR4" if "ITR-4" in form_short else "ITR2")

        itr_json_payload = {
            "ITR": {
                itr_root_key: {
                    "CreationInfo": {
                        "SWVersionNo": "CA_BHARAT_AI_V1.0",
                        "SWCreatedBy": "CA Bharat AI Enterprise (Sharma & Co. FRN: DEMO012984N)",
                        "JSONCreatedDate": now_date,
                        "JSONCreatedBy": ca_approver or "CA Rajesh Sharma (FCA #DEMO049281)",
                        "Digest": v_hash or hashlib.sha256(f"{pan}:{now_date}".encode()).hexdigest(),
                    },
                    "Form_Details": {
                        "FormName": form_short,
                        "AssessmentYear": assessment_year,
                        "SchemaVer": "Prototype_AY2025-26_v1.0",
                    },
                    "PersonalInfo": schedules["PartA_GEN"]["PersonalInfo"],
                    "FilingStatus": schedules["PartA_GEN"]["FilingStatus"],
                    "IncomeDeductions": {
                        "GrossSalary": round(gross_salary),
                        "IncomeFromSalaries": round(income_from_salary),
                        "IncomeFromHouseProperty": round(income_hp),
                        "TotalCapitalGains": round(income_cg),
                        "IncomeFromOtherSources": round(total_other_sources),
                        "GrossTotalIncome": round(gti),
                        "TotalDeductions": round(schedules["PartB_TI"]["TotalDeductions"]),
                        "TotalIncome": round(taxable_income),
                    },
                    "TaxComputation": {
                        "TotalTaxPayable": round(basic_tax),
                        "Rebate87A": round(rebate_87a),
                        "TaxAfterRebate": round(max(0.0, basic_tax - rebate_87a)),
                        "EducationCess": round(cess),
                        "GrossTaxLiability": round(total_tax_liability),
                        "TotalTaxesPaid": round(total_prepaid),
                        "BalTaxPayable": round(tax_due),
                        "RefundDue": round(refund_amount),
                    },
                    "BankAccountDtls": {
                        "AddtnlBankDetails": [bank],
                    },
                    "Verification": schedules["Verification"],
                }
            },
            "_metadata": {
                "filing_mode": "PROTOTYPE_DEMO_ONLY",
                "disclaimer": DEMO_FILING_DISCLAIMER,
                "is_ca_signed_off": is_ca_approved,
                "verification_hash": v_hash,
            },
        }

        # ----------------------------------------------------------------------
        # Field & Arithmetic Validation Report
        # ----------------------------------------------------------------------
        report = cls.validate_package(pan, assessment_year, schedules, is_ca_approved)

        return FilingPreparationPackage(
            client_id=client_id,
            client_pan=pan,
            client_name=name,
            assessment_year=assessment_year,
            selected_itr_form=selected_itr_form,
            is_ca_approved=is_ca_approved,
            ca_approver=ca_approver,
            approval_timestamp=approved_at,
            verification_hash=v_hash,
            filing_status="READY_FOR_FILING_DEMO" if is_ca_approved else "PENDING_CA_APPROVAL",
            demo_disclaimer=DEMO_FILING_DISCLAIMER,
            schedules=schedules,
            itr_json_payload=itr_json_payload,
            validation_report=report,
        )

    @classmethod
    def validate_package(
        cls,
        pan: str,
        assessment_year: str,
        schedules: Dict[str, Any],
        is_ca_approved: bool,
    ) -> FilingValidationReport:
        errors: List[str] = []
        warnings: List[str] = []
        checks_run = 0

        # 1. PAN Pattern Validation
        checks_run += 1
        if not re.match(r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$", pan):
            errors.append(f"PAN format invalid: '{pan}' does not match statutory 10-character structure.")

        # 2. Assessment Year Validation
        checks_run += 1
        if not re.match(r"^\d{4}-\d{2}$", assessment_year.replace("AY ", "")):
            errors.append(f"Assessment Year invalid: '{assessment_year}'. Must be format 'YYYY-YY' (e.g. 2025-26).")

        # 3. Bank Account Validation
        checks_run += 1
        banks = schedules.get("BankAccountDetails", [])
        if not banks:
            errors.append("Mandatory Schedule: At least one pre-validated bank account must be designated for statutory refund credit.")
        else:
            primary = banks[0]
            if not primary.get("ifsc_code") or len(primary.get("ifsc_code", "")) != 11:
                errors.append("Invalid Bank IFSC Code: Must be exactly 11 characters (e.g. HDFC0000060).")
            if not primary.get("account_number"):
                errors.append("Invalid Bank Account Number: Mandatory field missing.")

        # 4. Income Head Cross-Check
        checks_run += 1
        ti = schedules.get("PartB_TI", {})
        s_sal = schedules.get("Schedule_S", {}).get("IncomeChargeableUnderSalaries", 0.0)
        s_hp = schedules.get("Schedule_HP", {}).get("IncomeFromHouseProperty", 0.0)
        s_cg = schedules.get("Schedule_CG", {}).get("TotalCapitalGains", 0.0)
        s_os = schedules.get("Schedule_OS", {}).get("TotalIncomeOtherSources", 0.0)
        computed_gti = s_sal + s_hp + s_cg + s_os

        gti_reported = ti.get("GrossTotalIncome", 0.0)
        if abs(computed_gti - gti_reported) > 10.0:
            errors.append(f"Arithmetic Mismatch: Sum of income schedules (₹{computed_gti:,.2f}) does not match Gross Total Income (₹{gti_reported:,.2f}).")

        # 5. Taxable Income Check
        checks_run += 1
        ded_reported = ti.get("TotalDeductions", 0.0)
        expected_taxable = max(0.0, gti_reported - ded_reported)
        taxable_reported = ti.get("TotalIncomeTaxable", 0.0)
        if abs(expected_taxable - taxable_reported) > 15.0:
            errors.append(f"Arithmetic Mismatch: GTI (₹{gti_reported:,.2f}) - Deductions (₹{ded_reported:,.2f}) != Taxable Income (₹{taxable_reported:,.2f}).")

        # 6. Prepaid Tax Cross-Check
        checks_run += 1
        tti = schedules.get("PartB_TTI", {})
        liability = tti.get("TotalTaxLiability", 0.0)
        prepaid = tti.get("TotalPrepaidTaxes", 0.0)
        expected_bal = liability - prepaid
        if expected_bal > 0:
            if abs(tti.get("NetTaxPayable", 0.0) - expected_bal) > 10.0:
                errors.append(f"Tax Payable mismatch: Expected ₹{expected_bal:,.2f}, reported ₹{tti.get('NetTaxPayable', 0.0):,.2f}.")
        else:
            if abs(tti.get("RefundDue", 0.0) - abs(expected_bal)) > 10.0:
                errors.append(f"Refund Due mismatch: Expected ₹{abs(expected_bal):,.2f}, reported ₹{tti.get('RefundDue', 0.0):,.2f}.")

        # 7. CA Sign-Off Gate Check
        checks_run += 1
        if not is_ca_approved:
            warnings.append("CA Sign-Off Pending: Return filing package cannot be certified until statutory review is signed off by CA partner.")

        # 8. Demographic Contact Info
        checks_run += 1
        pers = schedules.get("PartA_GEN", {}).get("PersonalInfo", {})
        if not pers.get("Email") or "@" not in pers.get("Email", ""):
            errors.append("Invalid primary contact email address in Part A General.")
        if not pers.get("MobileNo"):
            warnings.append("Taxpayer mobile number missing in profile.")

        return FilingValidationReport(
            is_valid=len(errors) == 0,
            total_checks_run=checks_run,
            errors=errors,
            warnings=warnings,
            validated_at=datetime.now(timezone.utc).isoformat(),
        )
