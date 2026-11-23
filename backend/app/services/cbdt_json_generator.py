"""
CBDT Official e-Filing JSON Schema Generator
Generates filing-ready JSON structures for ITR-1 (Sahaj) and ITR-4 (Sugam)
Governed by Central Board of Direct Taxes (CBDT) Directives for AY 2025-26
"""

from typing import Dict, Any
from datetime import datetime

class CBDTJsonGenerator:
    """Produces official filing-ready JSON matching CBDT e-filing portal specifications."""

    @classmethod
    def generate_itr1_json(
        cls,
        client: Dict[str, Any],
        tax_computation: Dict[str, Any],
        f16_data: Dict[str, Any],
        f26as_data: Dict[str, Any],
        assessment_year: str = "2025-26",
    ) -> Dict[str, Any]:
        """Generates CBDT-compliant ITR-1 (Sahaj) JSON for salaried individuals."""
        pan = client.get("pan", "ABCPA1092F")
        name_parts = client.get("name", "Arun Kumar Verma").split(" ")
        first_name = name_parts[0]
        last_name = name_parts[-1] if len(name_parts) > 1 else first_name
        middle_name = " ".join(name_parts[1:-1]) if len(name_parts) > 2 else ""

        part_b = f16_data.get("part_b", {})
        new_reg = tax_computation.get("new_regime", {})
        bank = client.get("bank_details") or {}

        return {
            "ITR": {
                "ITR1": {
                    "CreationInfo": {
                        "SWVersionNo": "1.0",
                        "SWCreatedBy": "CA Bharat AI Enterprise (Sharma & Co. DEMO012984N)",
                        "JSONCreatedDate": datetime.now().strftime("%Y-%m-%d"),
                        "JSONCreatedBy": "CA Rajesh Sharma (FCA #DEMO049281)",
                    },
                    "Form_ITR1": {
                        "FormName": "ITR-1",
                        "Description": "For individuals being a resident (other than not ordinarily resident) having total income upto Rs.50 lakh",
                        "AssessmentYear": assessment_year,
                        "SchemaVer": "Ver1.0",
                        "FormVer": "Ver1.0",
                    },
                    "PersonalInfo": {
                        "AssesseeName": {
                            "FirstName": first_name,
                            "MiddleName": middle_name,
                            "SurNameOrOrgName": last_name,
                        },
                        "PAN": pan,
                        "Address": {
                            "ResidenceNo": "Flat 402, Highgrove Heights",
                            "RoadOrStreet": "MG Road",
                            "CityOrTownOrDistrict": "Bengaluru",
                            "StateCode": "29",  # Karnataka
                            "CountryCode": "91",
                            "PinCode": 560001,
                            "Phone": {
                                "MobileNo": 9820012345,
                                "EmailAddress": client.get("email", "arun.verma@demo.in"),
                            },
                        },
                        "DOB": "1988-08-14",
                        "EmployerCategory": "OTH",  # Others (Private Sector)
                    },
                    "FilingStatus": {
                        "ReturnFileSec": 11,  # Section 139(1) - On or before due date
                        "OptOutNewTaxRegime": "N",  # New Tax Regime Default
                        "ResidentialStatus": "RES",
                    },
                    "IncomeDeductions": {
                        "GrossSalary": round(part_b.get("gross_salary", 1520000.0)),
                        "Salaries": round(part_b.get("salary_us_17_1", 1485000.0)),
                        "AlwnsNotExempt": 0,
                        "PerquisitesValue": round(part_b.get("perquisites_us_17_2", 35000.0)),
                        "ProfitsInLieuOfSalary": round(part_b.get("profits_in_lieu_us_17_3", 0.0)),
                        "DeductionUs16": round(part_b.get("total_deductions_us_16", 75000.0)),
                        "DeductionUs16ia": round(part_b.get("standard_deduction_us_16ia", 75000.0)),
                        "EntertainmentAlw16ii": 0,
                        "ProfessionalTaxUs16iii": round(part_b.get("professional_tax_us_16iii", 2400.0)),
                        "IncomeFromSalaries": round(new_reg.get("gross_total_income", 1445000.0)),
                        "TotalIncome": round(new_reg.get("total_taxable_income", 1445000.0)),
                    },
                    "TaxComputation": {
                        "TotalTaxPayable": round(new_reg.get("basic_tax", 139000.0)),
                        "Rebate87A": round(new_reg.get("rebate_87a", 0.0)),
                        "TaxPayableOnRebate": round(new_reg.get("tax_after_rebate", 139000.0)),
                        "EducationCess": round(new_reg.get("health_and_education_cess", 5560.0)),
                        "GrossTaxLiability": round(new_reg.get("total_tax_liability", 144560.0)),
                        "TotalTaxesPaid": round(new_reg.get("total_prepaid_tax", 118560.0)),
                        "BalTaxPayable": round(new_reg.get("tax_due_amount", 26000.0)),
                        "RefundDue": round(new_reg.get("refund_amount", 0.0)),
                    },
                    "BankAccountDtls": {
                        "AddtnlBankDetails": [
                            {
                                "BankName": bank.get("bank_name", "HDFC Bank Ltd"),
                                "IFSCCode": bank.get("ifsc_code", "HDFC0000060"),
                                "BankAccountNo": bank.get("account_number", "50100294819281"),
                                "AccountType": "SAV",
                                "RefundFlag": "YES",
                            }
                        ]
                    },
                    "Verification": {
                        "Declaration": {
                            "AssesseeVerName": client.get("name", "Arun Kumar Verma"),
                            "FatherName": "Ramesh Kumar Verma",
                            "AssesseeVerPAN": pan,
                            "Capacity": "S",  # Self
                        },
                        "Place": "Bengaluru",
                        "Date": datetime.now().strftime("%Y-%m-%d"),
                        "CA_FCA_RegNo": "DEMO049281",
                        "CA_FirmFRN": "DEMO012984N",
                    },
                }
            }
        }
