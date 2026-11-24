// CA Bharat AI — Step 1 Client Intake & Tax Discovery Standard Schema
// Compliant with Section 2(31), 5 Income Heads, CBDT ITR Filing & DPDP Act 2023

export const DEFAULT_INTAKE_DISCOVERY = {
  // 1. Prior-Year Information & Benchmarking
  previousYear: {
    hasPriorYearFiling: 'YES', // YES | NO | NOT_SURE
    priorItrForm: 'ITR-1 (Sahaj)',
    priorAckNumber: '192837465019283',
    priorAssessmentYear: 'AY 2024-25',
    priorRegime: 'NEW', // OLD | NEW
    priorGrossIncome: 1350000,
    priorTotalTaxPaid: 98400,
    priorRefundReceived: 18400,
    // Brought-forward losses
    hasBroughtForwardLosses: 'NO', // YES | NO | NOT_SURE
    losses: {
      shortTermCapitalLoss: 0,
      longTermCapitalLoss: 0,
      businessLoss: 0,
      unabsorbedDepreciation: 0,
    },
    priorNoticesOrAppeals: 'None. AY 2024-25 processed smoothly u/s 143(1).',
  },

  // 2. Head 1: Income from Salaries (Section 15-17)
  salary: {
    hasIncome: 'YES', // YES | NO | NOT_SURE
    hasMultipleEmployers: 'NO', // YES | NO | NOT_SURE
    hasJobChangeInYear: 'NO', // YES | NO | NOT_SURE
    employers: [
      {
        employerName: 'Tata Consultancy Services Ltd',
        tan: 'BLRT01928F',
        grossSalary: 1442600,
        tdsDeducted: 135000,
        hasForm16: 'YES',
      },
    ],
    receivedAllowancesOrBonus: 'YES',
    pensionIncome: 0,
    caNotes: '',
  },

  // 3. Head 2: Income from House Property (Section 22-27)
  houseProperty: {
    hasIncome: 'NO', // YES | NO | NOT_SURE
    properties: [
      {
        propertyType: 'SELF_OCCUPIED', // SELF_OCCUPIED | LET_OUT | DEEMED_LET_OUT
        ownershipSharePercentage: 100,
        annualRentReceived: 0,
        municipalTaxesPaid: 0,
        hasHousingLoan: 'NO',
        housingLoanInterest24b: 0,
        lenderName: '',
      },
    ],
    caNotes: '',
  },

  // 4. Head 3: Profits and Gains from Business or Profession (Section 28-44D)
  businessProfession: {
    hasIncome: 'NO', // YES | NO | NOT_SURE
    businessName: '',
    businessType: 'PROFESSION', // PROFESSION | TRADING | MANUFACTURING | SERVICES
    grossTurnoverOrReceipts: 0,
    netProfitOrLoss: 0,
    isBooksMaintained: 'NO',
    // Presumptive applicability subject to CA validation:
    presumptiveElection: 'NONE', // NONE | 44AD | 44ADA | 44AE
    caPresumptiveValidated: false,
    hasGstin: 'NO',
    gstin: '',
    caNotes: '',
  },

  // 5. Head 4: Capital Gains (Section 45-55)
  capitalGains: {
    hasIncome: 'NO', // YES | NO | NOT_SURE
    tradedEquitiesOrMutualFunds: 'NO',
    soldImmovableProperty: 'NO',
    soldUnlistedSharesOrOtherAssets: 'NO',
    hasBrokerPnlStatement: 'NO',
    summary: {
      equityStcg111A: 0,
      equityLtcg112A: 0,
      propertyLtcg: 0,
      otherGains: 0,
    },
    caNotes: '',
  },

  // 6. Head 5: Income from Other Sources (Section 56-59)
  otherSources: {
    hasIncome: 'YES', // YES | NO | NOT_SURE
    hasSavingsBankInterest: 'YES',
    estimatedSavingsInterest: 18500,
    hasFdRdInterest: 'NO',
    estimatedFdInterest: 0,
    hasDividends: 'YES',
    estimatedDividends: 24500,
    hasFamilyPension: 'NO',
    hasGiftsOrOtherReceipts: 'NO',
    caNotes: '',
  },

  // 7. Special Disclosures & Statutory Questions
  specialDisclosures: {
    hasAgriculturalIncome: 'NO', // YES | NO | NOT_SURE
    agriculturalIncomeAmount: 0,
    hasForeignAssetsOrIncome: 'NO', // YES | NO | NOT_SURE (Schedule FA)
    foreignAssetsCountry: '',
    hasCryptoOrVDA: 'NO', // YES | NO | NOT_SURE (Sec 115BBH)
    hasDirectorship: 'NO', // YES | NO | NOT_SURE
    directorDin: '',
    companyName: '',
    hasUnlistedEquityShares: 'NO', // YES | NO | NOT_SURE
    receivedTaxNotice: 'NO', // YES | NO | NOT_SURE
  },

  // 8. Deductions and Investments (Chapter VI-A)
  deductions: {
    claimed80C: 150000,
    proof80CStatus: 'RECEIVED', // REQUIRED | REQUESTED | RECEIVED | UNDER_REVIEW | NA | WAIVED
    claimed80DHealth: 25000,
    proof80DStatus: 'RECEIVED',
    claimed80CCD1B_NPS: 50000,
    proofNPSStatus: 'RECEIVED',
    claimed80EEducationLoan: 0,
    proof80EStatus: 'NA',
    claimed80GDonation: 0,
    proof80GStatus: 'NA',
    claimed80GGRent: 0,
    proof80GGStatus: 'NA',
    otherDeductions: 0,
    caEligibilityNotes: 'Deductions documented for verification under Old Regime comparison. Final regime optimal under 115BAC.',
  },

  // 9. Tax Credits & Bank Details
  taxCreditsAndBank: {
    advanceTaxChallans: [],
    selfAssessmentChallans: [],
    bankAccounts: [
      {
        accountNumber: '50100294819281',
        ifscCode: 'HDFC0000060',
        bankName: 'HDFC Bank Ltd',
        accountType: 'SAVINGS',
        isPrimaryForRefund: true,
        isPrevalidated: true,
      },
    ],
  },
}

// DYNAMIC CHECKLIST GENERATOR ENGINE
// Generates personalized checklist based on legal taxpayer category and discovery questionnaire answers
export function generateDynamicChecklist(client, discovery = DEFAULT_INTAKE_DISCOVERY) {
  const checklist = []
  const legalType = client?.legalType || 'INDIVIDUAL'
  const occupation = client?.occupationProfile || 'SALARIED'

  // Mandatory for all taxpayers:
  checklist.push({
    id: 'chk-pan-aadhaar',
    name: legalType === 'INDIVIDUAL' ? 'PAN & Aadhaar Card Verification' : `${legalType} PAN & Constitutional Documents`,
    category: 'IDENTITY',
    status: 'RECEIVED',
    mandatory: true,
    reason: 'Statutory verification requirement under Section 139A & CBDT Rules.',
  })

  checklist.push({
    id: 'chk-26as-traces',
    name: 'Form 26AS (TRACES Tax Credit Statement)',
    category: 'TAX_CREDITS',
    status: 'RECEIVED',
    mandatory: true,
    reason: 'Verification of tax deducted at source (TDS) and collected at source (TCS).',
  })

  checklist.push({
    id: 'chk-ais-tis',
    name: 'Annual Information Statement (AIS) & Taxpayer Information Summary (TIS)',
    category: 'TAX_CREDITS',
    status: 'RECEIVED',
    mandatory: true,
    reason: 'Reconciliation of interest, dividends, SFT transactions, and securities trading.',
  })

  checklist.push({
    id: 'chk-bank-statement',
    name: 'Primary Bank Account Statement(s) (1st April to 31st March)',
    category: 'BANKING',
    status: 'RECEIVED',
    mandatory: true,
    reason: 'Validation of interest income, dividend credits, and large cash transactions.',
  })

  // Entity-specific documents:
  if (legalType === 'HUF') {
    checklist.push({
      id: 'chk-huf-deed',
      name: 'HUF Deed of Declaration & Karta PAN Copy',
      category: 'ENTITY_LEGAL',
      status: 'REQUIRED',
      mandatory: true,
      reason: 'Mandatory proof of constitution of the Hindu Undivided Family.',
    })
  }

  if (legalType === 'PARTNERSHIP_FIRM' || legalType === 'LLP') {
    checklist.push({
      id: 'chk-firm-deed',
      name: 'Partnership Deed / LLP Agreement & ROC Incorporation Certificate',
      category: 'ENTITY_LEGAL',
      status: 'REQUIRED',
      mandatory: true,
      reason: 'Governing agreement for partner remuneration ceiling u/s 40(b) and profit sharing.',
    })
    checklist.push({
      id: 'chk-audited-financials',
      name: 'Audited Financial Statements (Balance Sheet, P&L, Depreciation Schedule)',
      category: 'FINANCIALS',
      status: 'REQUIRED',
      mandatory: true,
      reason: 'Mandatory schedule requirements for ITR-5 filing.',
    })
  }

  if (legalType === 'COMPANY') {
    checklist.push({
      id: 'chk-company-roc',
      name: 'MCA Certificate of Incorporation, Memorandum & Articles of Association',
      category: 'ENTITY_LEGAL',
      status: 'REQUIRED',
      mandatory: true,
      reason: 'Statutory corporate constitution records.',
    })
    checklist.push({
      id: 'chk-company-audit',
      name: 'Statutory Audit Report & Form 3CA/3CD Tax Audit Report (if applicable)',
      category: 'AUDIT',
      status: 'REQUIRED',
      mandatory: true,
      reason: 'Mandatory filing schedules for Corporate ITR-6.',
    })
  }

  if (legalType === 'TRUST') {
    checklist.push({
      id: 'chk-trust-12ab',
      name: 'Section 12AB / 80G Registration Order & Trust Deed',
      category: 'ENTITY_LEGAL',
      status: 'REQUIRED',
      mandatory: true,
      reason: 'Mandatory for claiming exemption u/s 11 and 12 in ITR-7.',
    })
  }

  // Income Head 1: Salary
  if (discovery.salary?.hasIncome === 'YES') {
    checklist.push({
      id: 'chk-form-16',
      name: 'Form 16 Part A & Part B from Employer(s)',
      category: 'SALARY',
      status: 'RECEIVED',
      mandatory: true,
      reason: 'Certificate under Section 203 for tax deducted on salary income.',
    })
    if (discovery.salary?.hasMultipleEmployers === 'YES' || discovery.salary?.hasJobChangeInYear === 'YES') {
      checklist.push({
        id: 'chk-multiple-form-16',
        name: 'Form 16 / Salary Slips from Previous Employer(s)',
        category: 'SALARY',
        status: 'REQUESTED',
        mandatory: true,
        reason: 'Required to aggregate salary and prevent double basic slab exemption.',
      })
    }
  }

  // Income Head 2: House Property
  if (discovery.houseProperty?.hasIncome === 'YES') {
    const hasLoan = discovery.houseProperty.properties?.some((p) => p.hasHousingLoan === 'YES')
    if (hasLoan) {
      checklist.push({
        id: 'chk-housing-loan-cert',
        name: 'Housing Loan Interest Certificate u/s 24(b) & Principal Statement u/s 80C',
        category: 'HOUSE_PROPERTY',
        status: 'REQUESTED',
        mandatory: true,
        reason: 'Statutory proof of interest deduction up to ₹2,00,000 for self-occupied property.',
      })
    }
    const hasLetOut = discovery.houseProperty.properties?.some((p) => p.propertyType === 'LET_OUT')
    if (hasLetOut) {
      checklist.push({
        id: 'chk-rent-agreement',
        name: 'Rent Agreement / Municipal Property Tax Paid Receipts',
        category: 'HOUSE_PROPERTY',
        status: 'REQUESTED',
        mandatory: false,
        reason: 'Verification of gross annual rent and municipal tax deductions.',
      })
    }
  }

  // Income Head 3: Business or Profession
  if (discovery.businessProfession?.hasIncome === 'YES') {
    checklist.push({
      id: 'chk-business-books',
      name: discovery.businessProfession?.presumptiveElection !== 'NONE'
        ? 'Bank Statements & Gross Receipts / Turnover Summary (for Sec 44AD/44ADA)'
        : 'Full Books of Account (P&L, Balance Sheet, Ledger Summaries)',
      category: 'BUSINESS',
      status: 'REQUESTED',
      mandatory: true,
      reason: 'Verification of business turnover, cash vs digital transactions, and net profit.',
    })
    if (discovery.businessProfession?.hasGstin === 'YES') {
      checklist.push({
        id: 'chk-gst-returns',
        name: 'GSTR-1 & GSTR-9 Annual Turnover Reconciliation Statements',
        category: 'BUSINESS',
        status: 'REQUESTED',
        mandatory: true,
        reason: 'Mandatory turnover cross-reconciliation with Income Tax portal.',
      })
    }
  }

  // Income Head 4: Capital Gains
  if (discovery.capitalGains?.hasIncome === 'YES') {
    checklist.push({
      id: 'chk-broker-pnl',
      name: 'Consolidated Capital Gains Tax Statement (P&L) from Stock Brokers / Karvy / CAMS',
      category: 'CAPITAL_GAINS',
      status: 'REQUESTED',
      mandatory: true,
      reason: 'Required for Schedule CG (Equity STCG u/s 111A, LTCG u/s 112A, and ISIN reporting).',
    })
    if (discovery.capitalGains?.soldImmovableProperty === 'YES') {
      checklist.push({
        id: 'chk-property-sale-deed',
        name: 'Registered Sale Deed, Purchase Deed & Section 54/54EC Capital Gains Exemption Proofs',
        category: 'CAPITAL_GAINS',
        status: 'REQUESTED',
        mandatory: true,
        reason: 'Verification of stamp duty valuation u/s 50C and indexed cost of acquisition.',
      })
    }
  }

  // Special Disclosures:
  if (discovery.specialDisclosures?.hasForeignAssetsOrIncome === 'YES') {
    checklist.push({
      id: 'chk-schedule-fa',
      name: 'Foreign Bank Account Statements, RSUs/ESOP vesting, & Overseas Tax Returns (TRC / Form 67)',
      category: 'SPECIAL_DISCLOSURES',
      status: 'REQUESTED',
      mandatory: true,
      reason: 'Mandatory for Schedule FA. Failure to disclose attracts Black Money Act penalties.',
    })
  }

  if (discovery.specialDisclosures?.hasCryptoOrVDA === 'YES') {
    checklist.push({
      id: 'chk-crypto-vda',
      name: 'Cryptocurrency / VDA Exchange Trading Statements (Section 115BBH)',
      category: 'SPECIAL_DISCLOSURES',
      status: 'REQUESTED',
      mandatory: true,
      reason: 'Flat 30% tax calculation with Schedule VDA transaction details.',
    })
  }

  if (discovery.specialDisclosures?.hasAgriculturalIncome === 'YES' && discovery.specialDisclosures?.agriculturalIncomeAmount > 5000) {
    checklist.push({
      id: 'chk-agri-proof',
      name: 'Agricultural Land Ownership Records (7/12 Extract / Khasra / Mandi Receipts)',
      category: 'SPECIAL_DISCLOSURES',
      status: 'REQUESTED',
      mandatory: false,
      reason: 'Required for Schedule EI reporting where agricultural income exceeds ₹5,000.',
    })
  }

  // Deductions proofs:
  if (discovery.deductions?.claimed80C > 0) {
    checklist.push({
      id: 'chk-80c-proofs',
      name: 'Section 80C Investment Receipts (ELSS, PPF, LIC, EPF, Children School Tuition)',
      category: 'DEDUCTIONS',
      status: discovery.deductions.proof80CStatus || 'RECEIVED',
      mandatory: false,
      reason: 'Supporting receipts required for Old Tax Regime claim audit defense.',
    })
  }

  if (discovery.deductions?.claimed80DHealth > 0) {
    checklist.push({
      id: 'chk-80d-proofs',
      name: 'Section 80D Health Insurance Premium Receipts & Preventive Health Check-up Proof',
      category: 'DEDUCTIONS',
      status: discovery.deductions.proof80DStatus || 'RECEIVED',
      mandatory: false,
      reason: 'Supporting receipts for medical insurance deduction.',
    })
  }

  if (discovery.deductions?.claimed80CCD1B_NPS > 0) {
    checklist.push({
      id: 'chk-nps-tier1',
      name: 'NPS Tier-1 Contribution Statement u/s 80CCD(1B)',
      category: 'DEDUCTIONS',
      status: discovery.deductions.proofNPSStatus || 'RECEIVED',
      mandatory: false,
      reason: 'Proof of additional ₹50,000 deduction for National Pension System.',
    })
  }

  return checklist
}
