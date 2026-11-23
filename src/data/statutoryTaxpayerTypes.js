// Statutory Indian Taxpayer Entity Classifications
// Based on Section 2(31) of the Income-tax Act, 1961, CBDT Filing Rules, and Central Government ITR-1 through ITR-7

export const ENTITY_GROUPS = [
  { id: 'INDIVIDUALS', label: '1. Individuals (Section 2(31)(i))' },
  { id: 'HUF', label: '2. Hindu Undivided Family (Section 2(31)(ii))' },
  { id: 'FIRMS_LLP', label: '3. Partnership Firms & LLPs (Section 2(31)(iv))' },
  { id: 'COMPANIES', label: '4. Companies (Section 2(31)(iii))' },
  { id: 'TRUSTS', label: '5. Trusts & Section 8 Non-Profits (Section 11, 12, 10(23C))' },
  { id: 'OTHERS', label: '6. Other Statutory Bodies (Section 2(31)(v), (vi), (vii))' },
]

export const STATUTORY_TAXPAYER_CATEGORIES = [
  // --- GROUP 1: INDIVIDUALS (Section 2(31)(i)) ---
  {
    id: 'IND_SALARIED',
    category: 'Individual - Salaried',
    groupId: 'INDIVIDUALS',
    groupName: 'Individuals',
    statutorySection: 'Section 2(31)(i) & Section 15-17',
    pan4thChar: 'P',
    applicableItr: ['ITR-1 (Sahaj)', 'ITR-2'],
    recommendedItr: 'ITR-1 (Sahaj)',
    taxRegimeOptions: ['Section 115BAC (New Default)', 'Old Tax Regime (with 80C/80D/HRA)'],
    governingRules: 'Standard Deduction u/s 16(ia) of ₹75,000 (AY 25-26), Form 16 Part A & B cross-validation, 1 house property, total income up to ₹50L.',
    requiredDocs: ['Form 16 Part A & B', 'AIS / TIS', 'TRACES 26AS', 'Bank Interest Statements', 'Rent Receipts (if Old Regime HRA)'],
    description: 'Resident individuals with income from salary, pension, and one house property.',
  },
  {
    id: 'IND_PROFESSIONAL_44ADA',
    category: 'Individual - Professional (Sec 44ADA)',
    groupId: 'INDIVIDUALS',
    groupName: 'Individuals',
    statutorySection: 'Section 44ADA read with Sec 2(31)(i)',
    pan4thChar: 'P',
    applicableItr: ['ITR-4 (Sugam)', 'ITR-3'],
    recommendedItr: 'ITR-4 (Sugam)',
    taxRegimeOptions: ['Section 115BAC (New Default)', 'Old Tax Regime'],
    governingRules: 'Notified professionals (Doctors, CAs, Lawyers, Tech Consultants, Architects). Presumptive profit @ 50% of gross receipts up to ₹75 Lakh (if digital receipts >= 95%). Single installment advance tax by March 15.',
    requiredDocs: ['Gross Professional Receipts Ledger', 'Form 26AS (Sec 194J TDS)', 'AIS / TIS', 'Bank Statements (Savings & Current)'],
    description: 'Independent consultants, doctors, lawyers, and tech freelancers opting for 50% deemed profit.',
  },
  {
    id: 'IND_BUSINESS_44AD',
    category: 'Individual - Business / Presumptive Trader (Sec 44AD / 44AE)',
    groupId: 'INDIVIDUALS',
    groupName: 'Individuals',
    statutorySection: 'Section 44AD / 44AE read with Sec 2(31)(i)',
    pan4thChar: 'P',
    applicableItr: ['ITR-4 (Sugam)', 'ITR-3'],
    recommendedItr: 'ITR-4 (Sugam)',
    taxRegimeOptions: ['Section 115BAC (New Default)', 'Old Tax Regime'],
    governingRules: 'Turnover up to ₹3 Crore (if 95% digital transactions). Deemed profit @ 6% (digital receipts) or 8% (cash receipts). Transport operators u/s 44AE.',
    requiredDocs: ['GST Returns (GSTR-1 & 3B)', 'Bank Current Account Statements', 'AIS / TIS', 'Form 26AS (194C / 194H / 194Q)'],
    description: 'Small retailers, wholesale traders, contractors, and goods transport operators.',
  },
  {
    id: 'IND_INVESTOR_TRADER',
    category: 'Individual - Capital Market Trader & Investor',
    groupId: 'INDIVIDUALS',
    groupName: 'Individuals',
    statutorySection: 'Section 111A, 112, 112A, 115BBH & Sec 43(5)',
    pan4thChar: 'P',
    applicableItr: ['ITR-2', 'ITR-3'],
    recommendedItr: 'ITR-2',
    taxRegimeOptions: ['Section 115BAC (New Default)', 'Old Tax Regime'],
    governingRules: 'LTCG u/s 112A @ 12.5% (exemption up to ₹1.25L), STCG u/s 111A @ 20%, F&O derivatives business turnover u/s 43(5), VDA / Crypto @ 30% u/s 115BBH.',
    requiredDocs: ['Broker Tax P&L Statement', 'Demated Holding Statement', 'AIS SFT Schedules', 'Form 26AS (194S / 194-IA)', 'Crypto / VDA Ledger'],
    description: 'Equity delivery investors, mutual fund holders, F&O derivatives traders, and crypto asset owners.',
  },
  {
    id: 'IND_SENIOR_CITIZEN',
    category: 'Individual - Senior / Super Senior Citizen (Age 60+ / 80+)',
    groupId: 'INDIVIDUALS',
    groupName: 'Individuals',
    statutorySection: 'Section 2(31)(i) read with Section 80TTB & 207',
    pan4thChar: 'P',
    applicableItr: ['ITR-1 (Sahaj)', 'ITR-2'],
    recommendedItr: 'ITR-1 (Sahaj)',
    taxRegimeOptions: ['Section 115BAC (New Default)', 'Old Tax Regime (₹3L / ₹5L Exemption)'],
    governingRules: 'Section 80TTB interest deduction up to ₹50,000, Section 207 exemption from advance tax for non-business seniors, higher basic exemption limits under Old Regime.',
    requiredDocs: ['Pension Form 16 / Pension Passbook', 'Bank Interest Certificates (Savings & FD)', 'Form 15H Acknowledgment', 'Health Insurance 80D', 'AIS / 26AS'],
    description: 'Senior citizens (age 60-79) and Super senior citizens (age 80+) with pension and interest income.',
  },
  {
    id: 'IND_NRI',
    category: 'Individual - Non-Resident Indian (NRI / RNOR)',
    groupId: 'INDIVIDUALS',
    groupName: 'Individuals',
    statutorySection: 'Section 6 (Residential Status) & Chapter XII-A',
    pan4thChar: 'P',
    applicableItr: ['ITR-2', 'ITR-3'],
    recommendedItr: 'ITR-2',
    taxRegimeOptions: ['Section 115BAC (New Default)', 'Old Tax Regime'],
    governingRules: 'Section 6 physical stay residency test, DTAA Foreign Tax Credit u/s 90/91 (Form 67 mandatory before filing), Schedule FA foreign asset disclosure, Section 195 TDS.',
    requiredDocs: ['Passport (Entry & Exit stamps)', 'Tax Residency Certificate (TRC)', 'Form 67 (FTC Claim)', 'NRE / NRO Bank Statements', 'AIS / 26AS'],
    description: 'Non-resident Indians or Resident but Not Ordinarily Resident with Indian source income or overseas asset reporting.',
  },

  // --- GROUP 2: HINDU UNDIVIDED FAMILY (Section 2(31)(ii)) ---
  {
    id: 'HUF_FAMILY',
    category: 'Hindu Undivided Family (HUF)',
    groupId: 'HUF',
    groupName: 'Hindu Undivided Family',
    statutorySection: 'Section 2(31)(ii)',
    pan4thChar: 'H',
    applicableItr: ['ITR-2', 'ITR-3', 'ITR-4 (Sugam)'],
    recommendedItr: 'ITR-2',
    taxRegimeOptions: ['Section 115BAC (New Default)', 'Old Tax Regime'],
    governingRules: 'Distinct statutory entity with separate PAN. Assessed through Karta. Coparcener rights, separate basic slab & 80C deductions.',
    requiredDocs: ['HUF Deed of Declaration', 'Karta PAN & Aadhaar', 'HUF Bank Account Statement', 'AIS / TIS', 'Asset / Investment Records'],
    description: 'Hindu Undivided Family with separate ancestral or joint family income and capital investments.',
  },

  // --- GROUP 3: PARTNERSHIP FIRMS & LLPs (Section 2(31)(iv)) ---
  {
    id: 'FIRM_PARTNERSHIP',
    category: 'Partnership Firm (Registered u/s 184)',
    groupId: 'FIRMS_LLP',
    groupName: 'Partnership Firms & LLPs',
    statutorySection: 'Section 2(31)(iv) read with Section 184',
    pan4thChar: 'F',
    applicableItr: ['ITR-5', 'ITR-4 (Sugam)'],
    recommendedItr: 'ITR-5',
    taxRegimeOptions: ['Flat 30% Tax + 12% Surcharge (if TI > ₹1 Cr) + 4% Cess'],
    governingRules: 'Flat 30% tax rate. Partner remuneration & interest ceiling u/s 40(b). Tax Audit u/s 44AB if turnover > ₹1 Cr (or ₹10 Cr if digital >= 95%).',
    requiredDocs: ['Partnership Deed & Certificate', 'Audited Financial Statements', 'Form 3CA/3CD (Tax Audit)', 'Form 26AS / AIS', 'GST Returns'],
    description: 'Conventional partnership firm constituted under Indian Partnership Act, 1932.',
  },
  {
    id: 'LLP_ENTITY',
    category: 'Limited Liability Partnership (LLP)',
    groupId: 'FIRMS_LLP',
    groupName: 'Partnership Firms & LLPs',
    statutorySection: 'LLP Act 2008 & Section 2(31)(iv)',
    pan4thChar: 'F',
    applicableItr: ['ITR-5'],
    recommendedItr: 'ITR-5',
    taxRegimeOptions: ['Flat 30% Tax + 12% Surcharge (if TI > ₹1 Cr) + 4% Cess'],
    governingRules: 'Body corporate with limited liability. Alternate Minimum Tax (AMT) u/s 115JC @ 18.5%. MCA Form 11 & Form 8 compliance.',
    requiredDocs: ['LLP Agreement & ROC Certificate', 'DPIN details of Designated Partners', 'Audited Balance Sheet & P&L', 'Form 3CEB (if TP applies)'],
    description: 'Limited Liability Partnership registered with Ministry of Corporate Affairs (MCA).',
  },

  // --- GROUP 4: COMPANIES (Section 2(31)(iii)) ---
  {
    id: 'COMPANY_DOMESTIC',
    category: 'Domestic Company (Private Limited / Public Limited)',
    groupId: 'COMPANIES',
    groupName: 'Companies',
    statutorySection: 'Section 2(31)(iii) & Companies Act, 2013',
    pan4thChar: 'C',
    applicableItr: ['ITR-6'],
    recommendedItr: 'ITR-6',
    taxRegimeOptions: ['Section 115BAA (22% Concessional)', 'Section 115BAB (15% Mfg)', 'Old Corporate Rate (25% / 30% + MAT u/s 115JB)'],
    governingRules: 'Corporate tax with optional Section 115BAA concessional 22% rate (no MAT, no incentives). Statutory MCA audit + Tax Audit u/s 44AB + Transfer Pricing.',
    requiredDocs: ['Certificate of Incorporation & CIN', 'Audited Financial Statements (MCA)', 'Form 3CA-3CD', 'Form 29B (MAT Report)', 'GSTR-9 / 9C'],
    description: 'Private Limited or Public Limited company incorporated under Indian Companies Act.',
  },
  {
    id: 'COMPANY_FOREIGN',
    category: 'Foreign Company (Branch / Project / Liaison Office)',
    groupId: 'COMPANIES',
    groupName: 'Companies',
    statutorySection: 'Section 2(31)(iii) read with Section 90/91',
    pan4thChar: 'C',
    applicableItr: ['ITR-6'],
    recommendedItr: 'ITR-6',
    taxRegimeOptions: ['35% Base Corporate Rate (Finance Act 2024) + Surcharge + Cess'],
    governingRules: 'Corporate entity incorporated outside India. Base tax rate reduced to 35% by Finance Act 2024. Permanent Establishment (PE) & Equalisation levy compliances.',
    requiredDocs: ['RBI / ROC Branch Approval', 'Transfer Pricing Documentation (Form 3CEB)', 'PE Financial Statements', 'Withholding Certificates u/s 195'],
    description: 'Foreign corporate entity operating a branch office, project office, or Permanent Establishment in India.',
  },

  // --- GROUP 5: TRUSTS & SECTION 8 (Section 11, 12, 10(23C)) ---
  {
    id: 'TRUST_CHARITABLE',
    category: 'Charitable / Religious Trust & Section 8 Institution',
    groupId: 'TRUSTS',
    groupName: 'Trusts & Section 8',
    statutorySection: 'Section 11, 12, 12A, 12AB, 10(23C) & Section 2(31)',
    pan4thChar: 'T',
    applicableItr: ['ITR-7'],
    recommendedItr: 'ITR-7',
    taxRegimeOptions: ['Exempt u/s 11 & 12 (Subject to 85% Application Rule)'],
    governingRules: 'Mandatory 12AB registration. 85% income must be applied for charitable purposes. Form 10B / 10BB audit report. Section 115BBI tax @ 30% for specified violations.',
    requiredDocs: ['Trust Deed / Section 8 MOA', 'Section 12AB Registration Order', '80G Approval Certificate', 'Form 10B / 10BB Audit Report', 'Form 9A / 10 Accumulation Notices'],
    description: 'Charitable trust, educational institution, hospital, religious trust or Section 8 non-profit company.',
  },

  // --- GROUP 6: OTHER STATUTORY BODIES (Section 2(31)(v), (vi), (vii)) ---
  {
    id: 'AOP_BOI_ENTITY',
    category: 'Association of Persons (AOP) / Body of Individuals (BOI)',
    groupId: 'OTHERS',
    groupName: 'Other Statutory Bodies',
    statutorySection: 'Section 2(31)(v)',
    pan4thChar: 'A',
    applicableItr: ['ITR-5'],
    recommendedItr: 'ITR-5',
    taxRegimeOptions: ['Maximum Marginal Rate (MMR) or Slab Rates (Sec 167B)'],
    governingRules: 'Taxed at Maximum Marginal Rate (MMR 30% + surcharge) if member shares are indeterminate or member total income exceeds basic limit.',
    requiredDocs: ['AOP Agreement / Joint Venture Contract', 'List of Members & Profit Sharing Ratios', 'Financial Statements', 'AIS / 26AS'],
    description: 'Unincorporated joint ventures, consortiums, estate executors, or body of individuals.',
  },
  {
    id: 'COOP_SOCIETY',
    category: 'Co-operative Society (Urban / Housing / Agri)',
    groupId: 'OTHERS',
    groupName: 'Other Statutory Bodies',
    statutorySection: 'Section 2(31) read with Section 80P, 115BAD, 115BAE',
    pan4thChar: 'A',
    applicableItr: ['ITR-5'],
    recommendedItr: 'ITR-5',
    taxRegimeOptions: ['Section 115BAD (22% Concessional)', 'Section 115BAE (15% Mfg)', 'Regular Slab (10%/20%/30%) + Sec 80P Deduction'],
    governingRules: 'Co-operative society special tax brackets (10% up to ₹10k, 20% next ₹10k, 30% balance) or Section 115BAD 22% flat rate without 80P.',
    requiredDocs: ['Co-operative Registration Certificate', 'Audited Accounts by Co-operative Auditor', 'Section 80P Deduction Schedule', 'AIS / 26AS'],
    description: 'Credit societies, agricultural marketing cooperatives, housing societies, and cooperative banks.',
  },
  {
    id: 'LOCAL_AUTH_AJP',
    category: 'Artificial Juridical Person / Local Authority',
    groupId: 'OTHERS',
    groupName: 'Other Statutory Bodies',
    statutorySection: 'Section 2(31)(vi) & (vii) read with Section 10(20)',
    pan4thChar: 'L',
    applicableItr: ['ITR-5'],
    recommendedItr: 'ITR-5',
    taxRegimeOptions: ['Flat 30% or Exemption u/s 10(20) / Section 10(23BBH)'],
    governingRules: 'Municipal corporations, panchayats, port trusts, statutory boards, bar councils, university bodies, temple deities.',
    requiredDocs: ['Statutory Enactment Charter / Gazetted Notification', 'Audited Accounts', 'Exemption Claim documentation'],
    description: 'Local authority, statutory corporation, autonomous government board, or artificial juridical deity/institution.',
  },
]

// Helper lookup functions
export function getCategoryDetails(categoryName) {
  if (!categoryName) return STATUTORY_TAXPAYER_CATEGORIES[0]
  return (
    STATUTORY_TAXPAYER_CATEGORIES.find(
      (c) => c.category.toLowerCase() === categoryName.toLowerCase() || c.id === categoryName
    ) ||
    STATUTORY_TAXPAYER_CATEGORIES.find((c) =>
      c.category.toLowerCase().includes(categoryName.toLowerCase())
    ) ||
    STATUTORY_TAXPAYER_CATEGORIES[0]
  )
}

export function getRecommendedItr(categoryName) {
  const cat = getCategoryDetails(categoryName)
  return cat ? cat.recommendedItr : 'ITR-1 (Sahaj)'
}

export function getExpectedPan4thChar(categoryName) {
  const cat = getCategoryDetails(categoryName)
  return cat ? cat.pan4thChar : 'P'
}

export function validatePanStructure(pan, categoryName) {
  if (!pan || pan.length !== 10) {
    return { valid: false, message: 'PAN must be exactly 10 alphanumeric characters (e.g. ABCDE1234F).' }
  }
  const panUpper = pan.toUpperCase()
  const fourthChar = panUpper.charAt(3)
  const expectedChar = getExpectedPan4thChar(categoryName)

  // Map of accepted characters
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
    // If it is AOP/BOI or Firm/LLP allow variants
    if (expectedChar === 'A' && (fourthChar === 'B' || fourthChar === 'A')) {
      return { valid: true }
    }
    return {
      valid: false,
      warning: true,
      message: `Statutory Check: Under Indian IT Rules, the 4th character of PAN for "${categoryName}" is typically '${expectedChar}' (${panTypes[expectedChar] || expectedChar}). Provided PAN "${panUpper}" has '${fourthChar}' (${panTypes[fourthChar] || 'Unknown'}).`,
    }
  }

  return { valid: true }
}
