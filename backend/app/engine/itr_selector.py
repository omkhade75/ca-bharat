"""
Deterministic Rule-Based ITR Selection Engine
Governed by Rule 12 of the Income-tax Rules, 1962 and CBDT Return Filing Notifications
Applicable Assessment Year: AY 2025-26 & AY 2024-25
Zero-LLM Statutory Logic: Pure deterministic rule evaluation.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

RULES_VERSION = "AY2025-26.V1"
STATUTORY_AUTHORITY = (
    "Rule 12 of Income-tax Rules, 1962 read with Section 139(1) of the Income-tax Act, 1961 "
    "and CBDT Notification No. 04/2024 (AY 2025-26)."
)


class IneligibleFormReason(BaseModel):
    form: str
    status: str  # "Ineligible" or "Alternative Applicable"
    reason: str


class ITRSelectionResult(BaseModel):
    rules_version: str = RULES_VERSION
    statutory_authority: str = STATUTORY_AUTHORITY
    taxpayer_entity: str
    residential_status: str
    recommended_form: str
    form_code: str  # "ITR-1", "ITR-2", "ITR-3", "ITR-4", "ITR-5", "ITR-6", "ITR-7"
    selection_rationale: str
    satisfied_conditions: List[str]
    ineligible_forms: List[IneligibleFormReason]
    ca_review_flags: List[str]
    is_ca_confirmed: bool = False
    confirmed_by: Optional[str] = None
    confirmed_at: Optional[str] = None
    confirmation_notes: Optional[str] = None


class ITRSelectionEngine:
    """
    Statutory rule-based decision tree for selecting the appropriate Indian Income Tax Return form.
    Never assumes eligibility solely from the income source.
    """

    @classmethod
    def evaluate(
        cls,
        entity_type: str,
        residential_status: str,
        incomes: Dict[str, Any],
        disclosures: Optional[Dict[str, Any]] = None,
        assessment_year: str = "2025-26",
    ) -> ITRSelectionResult:
        disclosures = disclosures or {}
        norm_entity = (entity_type or "INDIVIDUAL").upper().strip()
        norm_res = (residential_status or "RESIDENT").upper().strip()

        # Extract income head values
        salary = float(incomes.get("salary", 0.0) or 0.0)
        hp_income = float(incomes.get("house_property", 0.0) or 0.0)
        hp_count = int(incomes.get("house_property_count", 1 if hp_income != 0 else 0))
        hp_has_bf_loss = bool(incomes.get("hp_has_brought_forward_loss", False))

        pgbp_income = float(incomes.get("business_profession", 0.0) or incomes.get("pgbp", 0.0) or 0.0)
        has_business = bool(
            incomes.get("has_business_profession", False)
            or pgbp_income > 0
            or incomes.get("presumptive_election")
            or norm_entity in ["COMPANY", "LLP", "PARTNERSHIP_FIRM"]
        )
        presumptive_election = incomes.get("presumptive_election")  # "44AD", "44ADA", "44AE", or None
        gross_turnover = float(incomes.get("turnover", 0.0) or 0.0)
        gross_prof_receipts = float(incomes.get("professional_receipts", 0.0) or 0.0)

        stcg = float(incomes.get("capital_gains_stcg", 0.0) or 0.0)
        ltcg = float(incomes.get("capital_gains_ltcg", 0.0) or 0.0)
        total_cg = float(incomes.get("capital_gains", 0.0) or (stcg + ltcg))
        has_capital_gains = bool(total_cg > 0 or incomes.get("has_capital_gains", False))

        other_sources = float(incomes.get("other_sources", 0.0) or 0.0)
        has_lottery_gambling = bool(incomes.get("has_lottery_or_gambling", False))
        agricultural_income = float(incomes.get("agricultural_income", 0.0) or 0.0)

        # Disclosures / Special status conditions
        is_director = bool(disclosures.get("is_director_in_company", False))
        has_unlisted_shares = bool(disclosures.get("holds_unlisted_equity", False))
        has_foreign_assets = bool(
            disclosures.get("has_foreign_assets_or_income", False)
            or disclosures.get("has_foreign_assets", False)
        )
        has_crypto_vda = bool(disclosures.get("has_crypto_or_vda", False))
        has_relief_90_91 = bool(disclosures.get("claims_relief_90_91", False))
        is_partner_in_firm = bool(disclosures.get("is_partner_in_firm", False))

        # Gross Total Income
        gti = salary + hp_income + pgbp_income + total_cg + other_sources

        satisfied: List[str] = []
        ineligible: List[IneligibleFormReason] = []
        ca_flags: List[str] = []

        # ----------------------------------------------------------------------
        # 1. NON-INDIVIDUAL / NON-HUF CORPORATE & ENTITY ROUTING
        # ----------------------------------------------------------------------
        if norm_entity == "COMPANY":
            satisfied.append("Assessee entity is a Body Corporate registered under the Companies Act (Section 2(31)(iii)).")
            satisfied.append("Statutory electronic filing required under Section 139(1) with mandatory Digital Signature Certificate (DSC).")
            ineligible.append(IneligibleFormReason(form="ITR-1", status="Ineligible", reason="ITR-1 is strictly reserved for natural individuals."))
            ineligible.append(IneligibleFormReason(form="ITR-2", status="Ineligible", reason="ITR-2 is restricted to Individuals and HUFs."))
            ineligible.append(IneligibleFormReason(form="ITR-3", status="Ineligible", reason="ITR-3 is restricted to Individuals and HUFs."))
            ineligible.append(IneligibleFormReason(form="ITR-4", status="Ineligible", reason="ITR-4 excludes corporate entities."))
            ineligible.append(IneligibleFormReason(form="ITR-5", status="Ineligible", reason="ITR-5 is reserved for Firms, LLPs, AOPs, and BOIs."))
            ineligible.append(IneligibleFormReason(form="ITR-7", status="Alternative Applicable", reason="Applicable only if company is claiming Section 11 charitable/religious exemption."))
            ca_flags.append("Confirm whether company claims Section 11 charitable exemption (requires ITR-7) or standard corporate tax (ITR-6).")
            ca_flags.append("Verify mandatory MCA financial statements, Form 3CA/3CD tax audit report, and Transfer Pricing Form 3CEB if international transactions exist.")

            return ITRSelectionResult(
                taxpayer_entity="Company (Domestic / Foreign)",
                residential_status=norm_res,
                recommended_form="ITR-6",
                form_code="ITR-6",
                selection_rationale="Statutory corporate entity filing under Section 139(1) of the Income-tax Act, 1961.",
                satisfied_conditions=satisfied,
                ineligible_forms=ineligible,
                ca_review_flags=ca_flags,
            )

        if norm_entity == "TRUST":
            satisfied.append("Assessee is a Charitable or Religious Trust / Section 8 Non-Profit assessed under Section 11, 12, or 10(23C).")
            ineligible.append(IneligibleFormReason(form="ITR-1 to ITR-6", status="Ineligible", reason="Entities claiming exemption u/s 11, 12, or 139(4A)-(4D) must furnish return in ITR-7."))
            ca_flags.append("Verify Section 12AB/10(23C) final registration order number and Form 10B/10BB audit report filing.")

            return ITRSelectionResult(
                taxpayer_entity="Trust / Non-Profit / Institution",
                residential_status=norm_res,
                recommended_form="ITR-7",
                form_code="ITR-7",
                selection_rationale="Entity required to furnish return u/s 139(4A), 139(4B), 139(4C), or 139(4D).",
                satisfied_conditions=satisfied,
                ineligible_forms=ineligible,
                ca_review_flags=ca_flags,
            )

        if norm_entity in ["PARTNERSHIP_FIRM", "LLP", "OTHER"]:
            if norm_entity == "LLP":
                satisfied.append("Body corporate constituted under the Limited Liability Partnership Act, 2008.")
            elif norm_entity == "PARTNERSHIP_FIRM":
                satisfied.append("Partnership firm constituted under Indian Partnership Act, 1932 assessed u/s 184.")
            else:
                satisfied.append(f"Entity assessed as {norm_entity} under Section 2(31)(v)/(vi)/(vii).")

            # Check if eligible for ITR-4 (Partnership Firms other than LLP with presumptive income)
            if norm_entity == "PARTNERSHIP_FIRM" and presumptive_election in ["44AD", "44ADA", "44AE"] and gti <= 5000000.0:
                satisfied.append("Partnership firm electing presumptive taxation u/s 44AD/44ADA with total income <= ₹50 Lakhs.")
                ineligible.append(IneligibleFormReason(form="ITR-1", status="Ineligible", reason="ITR-1 is restricted to natural individuals."))
                ineligible.append(IneligibleFormReason(form="ITR-2/ITR-3", status="Ineligible", reason="Reserved for Individuals and HUFs."))
                ineligible.append(IneligibleFormReason(form="ITR-5", status="Alternative Applicable", reason="ITR-5 is applicable if regular books are maintained or audit applies."))
                return ITRSelectionResult(
                    taxpayer_entity="Partnership Firm (Presumptive)",
                    residential_status=norm_res,
                    recommended_form="ITR-4 (Sugam)",
                    form_code="ITR-4",
                    selection_rationale="Partnership firm electing presumptive taxation u/s 44AD/44ADA with turnover/income within statutory thresholds.",
                    satisfied_conditions=satisfied,
                    ineligible_forms=ineligible,
                    ca_review_flags=["Confirm partners' remuneration complies with Section 40(b) ceiling."],
                )

            ineligible.append(IneligibleFormReason(form="ITR-1 to ITR-4", status="Ineligible", reason="ITR-1 through ITR-4 are restricted to Individuals and HUFs (except non-LLP firms in ITR-4)."))
            ineligible.append(IneligibleFormReason(form="ITR-6", status="Ineligible", reason="Reserved for incorporated companies."))
            ca_flags.append("Confirm Section 44AB tax audit requirement and Form 3CB/3CD filing status.")
            ca_flags.append("Verify partner profit sharing ratio, interest on capital @ max 12% u/s 40(b), and working partner remuneration.")

            return ITRSelectionResult(
                taxpayer_entity="Partnership Firm / LLP / AOP / BOI",
                residential_status=norm_res,
                recommended_form="ITR-5",
                form_code="ITR-5",
                selection_rationale="Partnership Firm / LLP assessed under Section 2(31)(iv) of the Income-tax Act, 1961.",
                satisfied_conditions=satisfied,
                ineligible_forms=ineligible,
                ca_review_flags=ca_flags,
            )

        # ----------------------------------------------------------------------
        # 2. HUF (HINDU UNDIVIDED FAMILY)
        # ----------------------------------------------------------------------
        if norm_entity == "HUF":
            satisfied.append("Assessee is a Hindu Undivided Family assessed through Karta under Section 2(31)(ii).")
            ineligible.append(IneligibleFormReason(form="ITR-1", status="Ineligible", reason="Rule 12 explicitly bars HUF entities from filing ITR-1 (Sahaj)."))
            ineligible.append(IneligibleFormReason(form="ITR-5/6/7", status="Ineligible", reason="Reserved for corporate and firm entities."))

            if has_business:
                if presumptive_election in ["44AD", "44ADA", "44AE"] and gti <= 5000000.0 and not (is_director or has_unlisted_shares or has_foreign_assets):
                    satisfied.append("HUF carries on presumptive business u/s 44AD/44ADA with total income <= ₹50,00,000.")
                    return ITRSelectionResult(
                        taxpayer_entity="Hindu Undivided Family (HUF)",
                        residential_status=norm_res,
                        recommended_form="ITR-4 (Sugam)",
                        form_code="ITR-4",
                        selection_rationale="Resident HUF carrying on presumptive business/profession u/s 44AD/44ADA.",
                        satisfied_conditions=satisfied,
                        ineligible_forms=[IneligibleFormReason(form="ITR-3", status="Alternative Applicable", reason="ITR-3 is mandatory only if regular accounts or Section 44AB audit is required.")],
                        ca_review_flags=["Confirm Karta PAN and coparcener consent for presumptive income declaration."],
                    )
                satisfied.append("HUF has business or profession income requiring detailed accounting / audit.")
                return ITRSelectionResult(
                    taxpayer_entity="Hindu Undivided Family (HUF)",
                    residential_status=norm_res,
                    recommended_form="ITR-3",
                    form_code="ITR-3",
                    selection_rationale="HUF with proprietary business/profession income under Section 28.",
                    satisfied_conditions=satisfied,
                    ineligible_forms=[IneligibleFormReason(form="ITR-2", status="Ineligible", reason="ITR-2 excludes entities with business/profession income.")],
                    ca_review_flags=["Verify HUF deed, bank accounts, and coparceners' capital contributions."],
                )

            satisfied.append("HUF has no income under the head Profits & Gains of Business or Profession.")
            return ITRSelectionResult(
                taxpayer_entity="Hindu Undivided Family (HUF)",
                residential_status=norm_res,
                recommended_form="ITR-2",
                form_code="ITR-2",
                selection_rationale="HUF with investment, property, or capital gains income without business operations.",
                satisfied_conditions=satisfied,
                ineligible_forms=[IneligibleFormReason(form="ITR-1", status="Ineligible", reason="HUF is barred from ITR-1.")],
                ca_review_flags=["Confirm no business or professional receipts were credited to HUF bank accounts."],
            )

        # ----------------------------------------------------------------------
        # 3. INDIVIDUAL TAXPAYER EVALUATION (Statutory Rule 12 Decision Tree)
        # ----------------------------------------------------------------------
        satisfied.append("Assessee is an Individual assessed under Section 2(31)(i).")

        # Evaluate ITR-1 Disqualification Triggers
        disqualifications_itr1: List[str] = []
        if norm_res not in ["RESIDENT", "ROR"]:
            disqualifications_itr1.append(f"Residential status is '{norm_res}'; ITR-1 is restricted strictly to Resident & Ordinarily Resident individuals.")
        if gti > 5000000.0:
            disqualifications_itr1.append(f"Total Income (₹{gti:,.2f}) exceeds the statutory ceiling of ₹50,00,000 u/s Rule 12.")
        if has_business:
            disqualifications_itr1.append("Has income from Business or Profession (PGBP); ITR-1 strictly prohibits business income.")
        if has_capital_gains:
            disqualifications_itr1.append(f"Has Capital Gains (₹{total_cg:,.2f}); ITR-1 does not contain Schedule CG.")
        if hp_count > 1:
            disqualifications_itr1.append(f"Holds {hp_count} house properties; ITR-1 permits only ONE house property.")
        if hp_has_bf_loss:
            disqualifications_itr1.append("Has brought-forward loss from house property; requires Schedule CFL in ITR-2.")
        if agricultural_income > 5000.0:
            disqualifications_itr1.append(f"Agricultural income (₹{agricultural_income:,.2f}) exceeds ₹5,000 threshold.")
        if is_director:
            disqualifications_itr1.append("Taxpayer is a Director in an Indian or Foreign company; requires disclosures in ITR-2/3.")
        if has_unlisted_shares:
            disqualifications_itr1.append("Held unlisted equity shares during previous year; requires Schedule unlisted equity.")
        if has_foreign_assets:
            disqualifications_itr1.append("Holds foreign assets or foreign income; requires Schedule FA and Schedule FSI.")
        if has_crypto_vda:
            disqualifications_itr1.append("Has income from Virtual Digital Assets (VDA / Crypto) u/s 115BBH; requires Schedule VDA.")
        if has_lottery_gambling:
            disqualifications_itr1.append("Has winnings from lottery, betting, or online gaming u/s 115BB/115BBJ.")
        if has_relief_90_91:
            disqualifications_itr1.append("Claims foreign tax relief u/s 89, 90, 90A, or 91; requires Schedule TR.")
        if is_partner_in_firm:
            disqualifications_itr1.append("Is a partner in a partnership firm; requires Schedule IF in ITR-3.")

        # Always check missing information that requires explicit CA confirmation
        if not disclosures.get("confirmed_no_directorship"):
            ca_flags.append("Statutory Check: Confirm taxpayer held no Directorship in any company during FY 2024-25.")
        if not disclosures.get("confirmed_no_unlisted_equity"):
            ca_flags.append("Statutory Check: Confirm taxpayer held no unlisted equity shares at any time during FY 2024-25.")
        if not disclosures.get("confirmed_no_foreign_assets"):
            ca_flags.append("Schedule FA Check: Confirm taxpayer has no foreign bank accounts, financial interests, or foreign immovable property.")

        # --- Branch 3A: Business Income Exists ---
        if has_business:
            # Check Presumptive Eligibility for ITR-4
            is_presumptive = presumptive_election in ["44AD", "44ADA", "44AE"]
            disqualifications_itr4: List[str] = []

            if norm_res not in ["RESIDENT", "ROR"]:
                disqualifications_itr4.append("Non-Residents are not eligible for presumptive ITR-4.")
            if gti > 5000000.0:
                disqualifications_itr4.append(f"Total income (₹{gti:,.2f}) exceeds ₹50 Lakhs limit for ITR-4.")
            if has_capital_gains:
                disqualifications_itr4.append("Capital gains cannot be filed in ITR-4.")
            if hp_count > 1:
                disqualifications_itr4.append(f"More than 1 house property ({hp_count}) declared.")
            if is_director or has_unlisted_shares or has_foreign_assets:
                disqualifications_itr4.append("Directorship, unlisted shares, or foreign assets disqualify ITR-4.")
            if not is_presumptive:
                disqualifications_itr4.append("Taxpayer maintains regular books of accounts / does not elect presumptive taxation.")

            # Check turnover limits
            if presumptive_election == "44AD" and gross_turnover > 30000000.0:
                disqualifications_itr4.append(f"Turnover ₹{gross_turnover:,.2f} exceeds Section 44AD limit of ₹3 Crore.")
            if presumptive_election == "44ADA" and gross_prof_receipts > 7500000.0:
                disqualifications_itr4.append(f"Gross receipts ₹{gross_prof_receipts:,.2f} exceed Section 44ADA limit of ₹75 Lakh.")

            if is_presumptive and len(disqualifications_itr4) == 0:
                satisfied.append(f"Individual elects presumptive taxation u/s {presumptive_election}.")
                satisfied.append("Total Income is within ₹50,00,000 threshold for Sugam.")
                satisfied.append("No capital gains, foreign assets, or company directorships declared.")
                ineligible.append(IneligibleFormReason(form="ITR-1", status="Ineligible", reason="; ".join(disqualifications_itr1)))
                ineligible.append(IneligibleFormReason(form="ITR-2", status="Ineligible", reason="ITR-2 prohibits income from business or profession."))
                ineligible.append(IneligibleFormReason(form="ITR-3", status="Alternative Applicable", reason="Can be filed if taxpayer prefers regular books and balance sheet filing over presumptive Sugam."))

                return ITRSelectionResult(
                    taxpayer_entity="Individual (Resident)",
                    residential_status=norm_res,
                    recommended_form="ITR-4 (Sugam)",
                    form_code="ITR-4",
                    selection_rationale=(
                        f"Resident individual electing presumptive taxation u/s {presumptive_election} with total income "
                        f"within ₹50 Lakhs and no disqualifying capital gains or foreign assets."
                    ),
                    satisfied_conditions=satisfied,
                    ineligible_forms=ineligible,
                    ca_review_flags=ca_flags + ["Verify gross turnover/receipts against Form 26AS (194J/194C/194H) and GST returns."],
                )

            # Otherwise, Business requires ITR-3
            satisfied.append("Has income from business, profession, or partnership firm requiring Schedule PGBP, BS, and PL.")
            for reason in disqualifications_itr1:
                ineligible.append(IneligibleFormReason(form="ITR-1", status="Ineligible", reason=reason))
            ineligible.append(IneligibleFormReason(form="ITR-2", status="Ineligible", reason="ITR-2 is strictly prohibited for any individual with business or professional income."))
            if disqualifications_itr4:
                ineligible.append(IneligibleFormReason(form="ITR-4", status="Ineligible", reason="; ".join(disqualifications_itr4)))

            return ITRSelectionResult(
                taxpayer_entity="Individual (Business / Professional)",
                residential_status=norm_res,
                recommended_form="ITR-3",
                form_code="ITR-3",
                selection_rationale="Individual with business or professional income requiring Schedule PGBP and financial accounts.",
                satisfied_conditions=satisfied,
                ineligible_forms=ineligible,
                ca_review_flags=ca_flags + ["Check applicability of Section 44AB tax audit and Form 3CD requirement."],
            )

        # --- Branch 3B: Non-Business Individual (Evaluate ITR-1 vs ITR-2) ---
        if len(disqualifications_itr1) == 0:
            # Fully qualifies for ITR-1 (Sahaj)
            satisfied.append("Resident & Ordinarily Resident (ROR) individual.")
            satisfied.append(f"Total Income (₹{gti:,.2f}) is within the statutory ceiling of ₹50,00,000.")
            satisfied.append(f"Income limited to Salary (₹{salary:,.2f}), single house property, and other sources (interest/dividends).")
            satisfied.append(f"Agricultural income (₹{agricultural_income:,.2f}) does not exceed ₹5,000.")
            satisfied.append("No business income, capital gains, unlisted equity, or foreign assets.")

            ineligible.append(IneligibleFormReason(
                form="ITR-2",
                status="Alternative Applicable",
                reason="ITR-2 can legally be filed, but ITR-1 (Sahaj) is the simpler, designated statutory return form for salaried resident individuals without capital gains."
            ))
            ineligible.append(IneligibleFormReason(
                form="ITR-3",
                status="Ineligible",
                reason="Taxpayer has no income from business or profession."
            ))
            ineligible.append(IneligibleFormReason(
                form="ITR-4",
                status="Ineligible",
                reason="Taxpayer has no presumptive business/professional income u/s 44AD/44ADA."
            ))
            ineligible.append(IneligibleFormReason(
                form="ITR-5 / ITR-6 / ITR-7",
                status="Ineligible",
                reason="Reserved for corporate, partnership, and trust entities."
            ))

            return ITRSelectionResult(
                taxpayer_entity="Individual (Resident - Salaried)",
                residential_status=norm_res,
                recommended_form="ITR-1 (Sahaj)",
                form_code="ITR-1",
                selection_rationale=(
                    f"Resident individual with Total Income ₹{gti:,.2f} (<= ₹50L) from salary, "
                    "single house property, and other sources. No business or capital gains."
                ),
                satisfied_conditions=satisfied,
                ineligible_forms=ineligible,
                ca_review_flags=ca_flags,
            )

        # Otherwise, Non-Business Individual must file ITR-2
        satisfied.append("Individual with income from salaries, house property, capital gains, or foreign assets.")
        satisfied.append("No income under the head Profits and Gains of Business or Profession (PGBP).")
        for reason in disqualifications_itr1:
            satisfied.append(f"Statutory ITR-2 trigger: {reason}")
            ineligible.append(IneligibleFormReason(form="ITR-1", status="Ineligible", reason=reason))

        ineligible.append(IneligibleFormReason(form="ITR-3", status="Ineligible", reason="Taxpayer has no business or profession income."))
        ineligible.append(IneligibleFormReason(form="ITR-4", status="Ineligible", reason="No presumptive business income declared u/s 44AD/44ADA."))
        ineligible.append(IneligibleFormReason(form="ITR-5 / ITR-6 / ITR-7", status="Ineligible", reason="Reserved for corporate and firm entities."))

        return ITRSelectionResult(
            taxpayer_entity="Individual (Investor / Multiple Properties / High Net Worth / Capital Gains)",
            residential_status=norm_res,
            recommended_form="ITR-2",
            form_code="ITR-2",
            selection_rationale=(
                "Individual with non-business income exceeding ITR-1 thresholds or triggering statutory ITR-2 requirements "
                f"({disqualifications_itr1[0] if disqualifications_itr1 else 'Capital Gains/High Income'})."
            ),
            satisfied_conditions=satisfied,
            ineligible_forms=ineligible,
            ca_review_flags=ca_flags,
        )
