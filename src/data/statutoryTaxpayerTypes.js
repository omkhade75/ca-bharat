// Statutory Indian Taxpayer Entity Classifications & Occupation Profiles
// Compliant with Section 2(31) of the Income-tax Act, 1961, CBDT ITR Filing Rules, and Finance Act 2024

// ============================================================================
// 1. STATUTORY LEGAL TAXPAYER CATEGORIES (Section 2(31))
// Strictly separated from occupation and income profile
// ============================================================================
export const LEGAL_TAXPAYER_ENTITIES = [
  {
    id: 'INDIVIDUAL',
    label: 'Individual',
    statutorySection: 'Section 2(31)(i)',
    pan4thChar: 'P',
    description: 'Natural person assessed under their personal Permanent Account Number.',
    applicableItrs: ['ITR-1 (Sahaj)', 'ITR-2', 'ITR-3', 'ITR-4 (Sugam)'],
  },
  {
    id: 'HUF',
    label: 'Hindu Undivided Family (HUF)',
    statutorySection: 'Section 2(31)(ii)',
    pan4thChar: 'H',
    description: 'Distinct family entity assessed through the Karta with coparceners.',
    applicableItrs: ['ITR-2', 'ITR-3', 'ITR-4 (Sugam)'],
  },
  {
    id: 'PARTNERSHIP_FIRM',
    label: 'Partnership Firm',
    statutorySection: 'Section 2(31)(iv) read with Section 184',
    pan4thChar: 'F',
    description: 'Partnership constituted under Indian Partnership Act, 1932.',
    applicableItrs: ['ITR-5'],
  },
  {
    id: 'LLP',
    label: 'Limited Liability Partnership (LLP)',
    statutorySection: 'LLP Act 2008 & Section 2(31)(iv)',
    pan4thChar: 'F',
    description: 'Body corporate registered with MCA under Limited Liability Partnership Act.',
    applicableItrs: ['ITR-5'],
  },
  {
    id: 'COMPANY',
    label: 'Company (Domestic & Foreign)',
    statutorySection: 'Section 2(31)(iii) read with Companies Act, 2013',
    pan4thChar: 'C',
    description: 'Corporate body registered with MCA (Private Limited, Public Limited, or Foreign).',
    applicableItrs: ['ITR-6', 'ITR-7'],
  },
  {
    id: 'TRUST',
    label: 'Trust / Institution / Non-Profit',
    statutorySection: 'Section 11, 12, 10(23C) & Section 2(31)',
    pan4thChar: 'T',
    description: 'Charitable or religious trust, Section 8 non-profit company, or NGO.',
    applicableItrs: ['ITR-7'],
  },
  {
    id: 'OTHER',
    label: 'Other Applicable Entities (AOP / BOI / AJP)',
    statutorySection: 'Section 2(31)(v), (vi), (vii)',
    pan4thChar: 'A',
    description: 'Association of Persons, Body of Individuals, or Artificial Juridical Person.',
    applicableItrs: ['ITR-5', 'ITR-7'],
  },
]

// ============================================================================
// 2. INDIVIDUAL OCCUPATION & INCOME PROFILES
// Applicable ONLY when legal category is 'Individual'
// ============================================================================
export const INDIVIDUAL_OCCUPATION_PROFILES = [
  {
    id: 'MULTI_INCOME_UNSURE',
    label: 'Multiple Income Streams / Don\'t Know',
    description: 'Salary, business, stocks, rental properties, directorship, or unsure of exact ITR form.',
    defaultRecommendedItr: 'Auto-Detect via AI Engine (Rule 12)',
  },
  {
    id: 'SALARIED',
    label: 'Salaried Employee',
    description: 'Income predominantly from employment, pension, and employer allowances.',
    defaultRecommendedItr: 'ITR-1 / ITR-2 (Auto-Evaluated)',
  },
  {
    id: 'PROFESSIONAL',
    label: 'Professional / Consultant',
    description: 'Independent doctor, lawyer, CA, engineer, consultant, architect, or IT freelancer.',
    defaultRecommendedItr: 'ITR-3 / ITR-4 (Presumptive / Regular)',
  },
  {
    id: 'BUSINESS_OWNER',
    label: 'Business Owner / Proprietor',
    description: 'Trading, manufacturing, retail, or agency business under sole proprietorship.',
    defaultRecommendedItr: 'ITR-3 / ITR-4 (Presumptive / Regular)',
  },
  {
    id: 'TRADER_INVESTOR',
    label: 'Trader / Investor',
    description: 'Active trader in equities, derivatives (F&O), mutual funds, or digital assets.',
    defaultRecommendedItr: 'ITR-2 / ITR-3',
  },
  {
    id: 'PENSIONER',
    label: 'Pensioner / Senior Citizen',
    description: 'Retired individual with superannuation pension and investment interest.',
    defaultRecommendedItr: 'ITR-1 / ITR-2',
  },
  {
    id: 'OTHER',
    label: 'Other Income Earner',
    description: 'Individual with rental income, family pension, or miscellaneous sources.',
    defaultRecommendedItr: 'ITR-2 / Auto-Evaluated',
  },
]

// ============================================================================
// 3. RESIDENTIAL STATUS OPTIONS (Section 6)
// ============================================================================
export const RESIDENTIAL_STATUS_OPTIONS = [
  { id: 'RESIDENT', label: 'Resident & Ordinarily Resident (ROR)' },
  { id: 'RNOR', label: 'Resident but Not Ordinarily Resident (RNOR)' },
  { id: 'NON_RESIDENT', label: 'Non-Resident Indian (NRI)' },
]

// ============================================================================
// 4. REQUESTED SERVICES
// ============================================================================
export const REQUESTED_SERVICES = [
  { id: 'REGULAR_ITR', label: 'Income Tax Return (ITR) Filing & Computation' },
  { id: 'TAX_PLANNING', label: 'Tax Planning & Advance Tax Advisory' },
  { id: 'TAX_AUDIT_44AB', label: 'Statutory Tax Audit u/s 44AB & Form 3CD' },
  { id: 'NOTICE_ASSISTANCE', label: 'IT Department Notice Assistance & Representation' },
  { id: 'CAPITAL_GAINS_STRUCTURING', label: 'Capital Gains & Property Sale Structuring' },
]

// ============================================================================
// 5. HELPER TO DETERMINE RECOMMENDED ITR
// ============================================================================
export function computeRecommendedItr(legalType, occupationProfile, intakeAnswers = {}) {
  if (legalType === 'COMPANY') return 'ITR-6'
  if (legalType === 'TRUST') return 'ITR-7'
  if (legalType === 'PARTNERSHIP_FIRM' || legalType === 'LLP' || legalType === 'OTHER') return 'ITR-5'
  if (legalType === 'HUF') {
    if (intakeAnswers.businessProfession?.hasIncome === 'YES') return 'ITR-3'
    return 'ITR-2'
  }

  // Legal Type is INDIVIDUAL:
  const hasBusiness = intakeAnswers.businessProfession?.hasIncome === 'YES'
  const hasCapitalGains = intakeAnswers.capitalGains?.hasIncome === 'YES'
  const hasForeignAssets = intakeAnswers.specialDisclosures?.hasForeignAssetsOrIncome === 'YES'
  const hasDirectorship = intakeAnswers.specialDisclosures?.hasDirectorship === 'YES'
  const hasCrypto = intakeAnswers.specialDisclosures?.hasCryptoOrVDA === 'YES'

  if (hasForeignAssets || hasDirectorship || hasCrypto) {
    return hasBusiness ? 'ITR-3' : 'ITR-2'
  }

  if (hasBusiness) {
    if (intakeAnswers.businessProfession?.presumptiveElection === '44AD' || 
        intakeAnswers.businessProfession?.presumptiveElection === '44ADA') {
      return 'ITR-4 (Sugam)'
    }
    return 'ITR-3'
  }

  if (hasCapitalGains) {
    return 'ITR-2'
  }

  if (occupationProfile === 'SALARIED' || occupationProfile === 'PENSIONER') {
    return 'ITR-1 (Sahaj)'
  }

  return 'ITR-2'
}

// ============================================================================
// 6. BACKWARD COMPATIBILITY EXPORTS FOR EXISTING CODEBASE
// ============================================================================
export const ENTITY_GROUPS = [
  { id: 'INDIVIDUALS', label: '1. Individuals (Section 2(31)(i))' },
  { id: 'HUF', label: '2. Hindu Undivided Family (Section 2(31)(ii))' },
  { id: 'FIRMS_LLP', label: '3. Partnership Firms & LLPs (Section 2(31)(iv))' },
  { id: 'COMPANIES', label: '4. Companies (Section 2(31)(iii))' },
  { id: 'TRUSTS', label: '5. Trusts & Section 8 Non-Profits (Section 11, 12, 10(23C))' },
  { id: 'OTHERS', label: '6. Other Statutory Bodies (Section 2(31)(v), (vi), (vii))' },
]

export const STATUTORY_TAXPAYER_CATEGORIES = [
  {
    id: 'IND_SALARIED',
    category: 'Individual - Salaried',
    groupId: 'INDIVIDUALS',
    groupName: 'Individuals',
    legalType: 'INDIVIDUAL',
    occupationProfile: 'SALARIED',
    statutorySection: 'Section 2(31)(i) & Section 15-17',
    pan4thChar: 'P',
    applicableItr: ['ITR-1 (Sahaj)', 'ITR-2'],
    recommendedItr: 'ITR-1 (Sahaj)',
    taxRegimeOptions: ['Section 115BAC (New Default)', 'Old Tax Regime (with 80C/80D/HRA)'],
    governingRules: 'Standard Deduction u/s 16(ia) of ₹75,000 (AY 25-26), Form 16 Part A & B cross-validation.',
    requiredDocs: ['Form 16 Part A & B', 'AIS / TIS', 'TRACES 26AS', 'Bank Statements'],
  },
  {
    id: 'IND_PROFESSIONAL',
    category: 'Individual - Professional',
    groupId: 'INDIVIDUALS',
    groupName: 'Individuals',
    legalType: 'INDIVIDUAL',
    occupationProfile: 'PROFESSIONAL',
    statutorySection: 'Section 44ADA read with Sec 2(31)(i)',
    pan4thChar: 'P',
    applicableItr: ['ITR-4 (Sugam)', 'ITR-3'],
    recommendedItr: 'ITR-4 (Sugam)',
    taxRegimeOptions: ['Section 115BAC (New Default)', 'Old Tax Regime'],
    governingRules: 'Notified professionals. Presumptive profit @ 50% subject to CA evaluation.',
    requiredDocs: ['Gross Professional Receipts Ledger', 'Form 26AS (Sec 194J TDS)', 'AIS / TIS', 'Bank Statements'],
  },
  {
    id: 'HUF_FAMILY',
    category: 'Hindu Undivided Family (HUF)',
    groupId: 'HUF',
    groupName: 'Hindu Undivided Family',
    legalType: 'HUF',
    statutorySection: 'Section 2(31)(ii)',
    pan4thChar: 'H',
    applicableItr: ['ITR-2', 'ITR-3'],
    recommendedItr: 'ITR-2',
    taxRegimeOptions: ['Section 115BAC (New Default)', 'Old Tax Regime'],
    governingRules: 'Distinct statutory entity assessed through Karta.',
    requiredDocs: ['HUF Deed of Declaration', 'Karta PAN & Aadhaar', 'HUF Bank Statement', 'AIS / TIS'],
  },
  {
    id: 'FIRM_PARTNERSHIP',
    category: 'Partnership Firm (Registered u/s 184)',
    groupId: 'FIRMS_LLP',
    groupName: 'Partnership Firms & LLPs',
    legalType: 'PARTNERSHIP_FIRM',
    statutorySection: 'Section 2(31)(iv) read with Section 184',
    pan4thChar: 'F',
    applicableItr: ['ITR-5'],
    recommendedItr: 'ITR-5',
    governingRules: 'Flat 30% tax rate. Partner remuneration ceiling u/s 40(b).',
    requiredDocs: ['Partnership Deed', 'Audited Financial Statements', 'Form 26AS / AIS'],
  },
  {
    id: 'LLP_ENTITY',
    category: 'Limited Liability Partnership (LLP)',
    groupId: 'FIRMS_LLP',
    groupName: 'Partnership Firms & LLPs',
    legalType: 'LLP',
    statutorySection: 'LLP Act 2008 & Section 2(31)(iv)',
    pan4thChar: 'F',
    applicableItr: ['ITR-5'],
    recommendedItr: 'ITR-5',
    governingRules: 'Body corporate governed by LLP Act, 2008.',
    requiredDocs: ['LLP Agreement', 'ROC Filing Receipts', 'Audited Accounts', 'Form 26AS / AIS'],
  },
  {
    id: 'COMPANY_DOMESTIC',
    category: 'Domestic Company (Private & Public Limited)',
    groupId: 'COMPANIES',
    groupName: 'Companies',
    legalType: 'COMPANY',
    statutorySection: 'Section 2(31)(iii) & Companies Act, 2013',
    pan4thChar: 'C',
    applicableItr: ['ITR-6'],
    recommendedItr: 'ITR-6',
    governingRules: 'Corporate tax u/s 115BAA (22%) or 25%/30%.',
    requiredDocs: ['MCA Incorporation Certificate', 'Audited Balance Sheet & P&L', 'Form 3CA/3CD'],
  },
  {
    id: 'TRUST_CHARITABLE',
    category: 'Charitable Trust / NGO (Sec 11 & 12A)',
    groupId: 'TRUSTS',
    groupName: 'Trusts & Section 8 Non-Profits',
    legalType: 'TRUST',
    statutorySection: 'Section 11, 12, 12AB & 10(23C)',
    pan4thChar: 'T',
    applicableItr: ['ITR-7'],
    recommendedItr: 'ITR-7',
    governingRules: 'Income applied for charitable/religious purposes with Form 10B/10BB audit.',
    requiredDocs: ['Trust Deed / Section 8 MOA', 'Section 12AB Registration Order', 'Form 10B/10BB Audit'],
  },
]

export function getCategoryDetails(categoryName) {
  if (!categoryName) return STATUTORY_TAXPAYER_CATEGORIES[0]
  return (
    STATUTORY_TAXPAYER_CATEGORIES.find(
      (c) => c.category?.toLowerCase() === categoryName?.toLowerCase() || c.id === categoryName || c.legalType === categoryName
    ) ||
    LEGAL_TAXPAYER_ENTITIES.find((e) => e.id === categoryName) ||
    STATUTORY_TAXPAYER_CATEGORIES[0]
  )
}

export function getRecommendedItr(categoryName) {
  const cat = getCategoryDetails(categoryName)
  return cat ? cat.recommendedItr || cat.applicableItrs?.[0] : 'ITR-1 (Sahaj)'
}

export function getExpectedPan4thChar(legalTypeOrCategory) {
  const entity = LEGAL_TAXPAYER_ENTITIES.find((e) => e.id === legalTypeOrCategory)
  if (entity) return entity.pan4thChar
  const cat = getCategoryDetails(legalTypeOrCategory)
  return cat ? cat.pan4thChar : 'P'
}

export function validatePanStructure(pan, legalTypeOrCategory = 'INDIVIDUAL') {
  if (!pan || pan.length !== 10) {
    return { valid: false, message: 'PAN must be exactly 10 alphanumeric characters (e.g. ABCDE1234F).' }
  }
  const panUpper = pan.toUpperCase()
  const fourthChar = panUpper.charAt(3)
  const expectedChar = getExpectedPan4thChar(legalTypeOrCategory)

  const panTypes = {
    P: 'Individual / Person',
    H: 'Hindu Undivided Family (HUF)',
    F: 'Firm / Limited Liability Partnership (LLP)',
    C: 'Company',
    T: 'Trust',
    A: 'Association of Persons (AOP)',
    B: 'Body of Individuals (BOI)',
    L: 'Local Authority',
    J: 'Artificial Juridical Person',
    G: 'Government Agency',
  }

  if (fourthChar !== expectedChar) {
    if (expectedChar === 'A' && (fourthChar === 'B' || fourthChar === 'A')) {
      return { valid: true }
    }
    return {
      valid: false,
      warning: true,
      message: `Statutory Check: Under Indian IT Rules, the 4th character of PAN for "${legalTypeOrCategory}" is typically '${expectedChar}' (${panTypes[expectedChar] || expectedChar}). Provided PAN "${panUpper}" has '${fourthChar}' (${panTypes[fourthChar] || 'Unknown'}).`,
    }
  }

  return { valid: true }
}
