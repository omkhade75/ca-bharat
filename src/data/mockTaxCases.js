// Comprehensive Tax Case & 3-Way Reconciliation Mock Data for CA Bharat AI Prototype
// Compliant with Income-tax Act, 1961

export const SAMPLE_STATUTORY_TAX_CASES = [
  // --- Case 1: Arun Kumar Verma (cli-001) ---
  {
    caseId: 'CASE-2025-001',
    clientId: 'cli-001',
    clientName: 'Arun Kumar Verma',
    pan: 'ABCPA1092F',
    assessmentYear: 'AY 2025-26',
    financialYear: 'FY 2024-25',
    filingForm: 'ITR-1 (Sahaj)',
    status: 'Ready for Review',
    assignedCa: 'CA Rajesh Sharma (Partner • FCA #049281)',
    reviewerNotes: 'Form 16 and TRACES 26AS perfectly cross-verified. Section 115BAC New Tax Regime optimal with ₹75,000 Standard Deduction.',

    checklist: {
      panIdentityVerified: true,
      form16Reconciled: true,
      bankAccountValidated: true,
      consentLogged: true,
      discrepanciesResolved: true,
    },

    incomes: {
      salary: 1450000,
      houseProperty: 0,
      capitalGainsLTCG: 0,
      capitalGainsSTCG: 0,
      otherSources: 18500,
    },

    deductions: {
      sec80C: 150000,
      sec80D: 25000,
      sec80CCD1B: 0,
      sec24b: 0,
      sec80TTA: 10000,
    },

    taxesPaid: {
      tdsSalary: 135000,
      tdsOther: 0,
      advanceTax: 0,
      selfAssessmentTax: 0,
      totalTaxesPaid: 135000,
    },

    taxCalculation: {
      oldRegime: {
        grossTotalIncome: 1468500,
        totalDeductions: 260000,
        taxableIncome: 1208500,
        taxPayable: 179448,
        refundDue: 0,
        taxPayableDifference: 44448,
      },
      newRegime: {
        grossTotalIncome: 1468500,
        standardDeduction: 75000,
        taxableIncome: 1393500,
        taxPayable: 92500,
        rebate87A: 0,
        surcharge: 0,
        cess: 3700,
        totalTaxLiability: 96200,
        refundDue: 38800,
        isOptimal: true,
      },
      recommendedRegime: 'NEW',
      savingsUnderRecommended: 83248,
    },

    reconciliationMatrix: [
      {
        field: 'Gross Salary / Receipts',
        form16: 1450000,
        form26as: 1450000,
        ais: 1450000,
        variance: 0,
        status: 'MATCHED',
        note: 'Section 192 TDS entries fully match across Form 16, 26AS and AIS.',
      },
      {
        field: 'TDS Deducted (Sec 192)',
        form16: 135000,
        form26as: 135000,
        ais: 135000,
        variance: 0,
        status: 'MATCHED',
        note: 'TDS credit confirmed in TRACES Part A.',
      },
      {
        field: 'Savings Bank Interest (Sec 56(2))',
        form16: 0,
        form26as: 0,
        ais: 18500,
        variance: 0,
        status: 'MATCHED',
        note: 'AIS interest matches HDFC bank statement certificate.',
      },
    ],

    caApproval: {
      isApproved: false,
      approvedBy: null,
      approvedAt: null,
      verificationChecklist: {
        panIdentityConfirmed: true,
        traces26asVerified: true,
        aisSftReconciled: true,
        bankValidated: true,
        deductionReceiptsAudited: true,
      },
    },
  },

  // --- Case 2: Dr. Radhika Sen (cli-002) ---
  {
    caseId: 'CASE-2025-002',
    clientId: 'cli-002',
    clientName: 'Dr. Radhika Sen',
    pan: 'ABCPR5491M',
    assessmentYear: 'AY 2025-26',
    financialYear: 'FY 2024-25',
    filingForm: 'ITR-4 (Sugam)',
    status: 'Ready for Review',
    assignedCa: 'CA Rajesh Sharma (Partner • FCA #049281)',
    reviewerNotes: 'Presumptive taxation Sec 44ADA on gross professional receipts of ₹28.5 Lakhs (50% deemed profit = ₹14.25L). 98.5% digital receipts satisfy digital threshold.',

    checklist: {
      panIdentityVerified: true,
      form16Reconciled: true,
      bankAccountValidated: true,
      consentLogged: true,
      discrepanciesResolved: true,
    },

    incomes: {
      salary: 0,
      houseProperty: 0,
      capitalGainsLTCG: 0,
      capitalGainsSTCG: 0,
      otherSources: 1425000,
    },

    deductions: {
      sec80C: 150000,
      sec80D: 25000,
      sec80CCD1B: 0,
      sec24b: 0,
      sec80TTA: 0,
    },

    taxesPaid: {
      tdsSalary: 0,
      tdsOther: 142500,
      advanceTax: 0,
      selfAssessmentTax: 0,
      totalTaxesPaid: 142500,
    },

    taxCalculation: {
      oldRegime: {
        grossTotalIncome: 1425000,
        totalDeductions: 175000,
        taxableIncome: 1250000,
        taxPayable: 195000,
        refundDue: 0,
        taxPayableDifference: 52500,
      },
      newRegime: {
        grossTotalIncome: 1425000,
        standardDeduction: 0,
        taxableIncome: 1425000,
        taxPayable: 101250,
        rebate87A: 0,
        surcharge: 0,
        cess: 4050,
        totalTaxLiability: 105300,
        refundDue: 37200,
        isOptimal: true,
      },
      recommendedRegime: 'NEW',
      savingsUnderRecommended: 89700,
    },

    reconciliationMatrix: [
      {
        field: 'Gross Professional Receipts',
        form16: 0,
        form26as: 2850000,
        ais: 2850000,
        variance: 0,
        status: 'MATCHED',
        note: 'Section 194J receipts match 100% with bank current account credits.',
      },
      {
        field: 'TDS u/s 194J (10%)',
        form16: 0,
        form26as: 142500,
        ais: 142500,
        variance: 0,
        status: 'MATCHED',
        note: 'Tax deducted verified in TRACES Form 26AS.',
      },
    ],

    caApproval: {
      isApproved: false,
      approvedBy: null,
      approvedAt: null,
      verificationChecklist: {
        panIdentityConfirmed: true,
        traces26asVerified: true,
        aisSftReconciled: true,
        bankValidated: true,
        deductionReceiptsAudited: true,
      },
    },
  },
]

export const INITIAL_TAX_CASES = SAMPLE_STATUTORY_TAX_CASES

