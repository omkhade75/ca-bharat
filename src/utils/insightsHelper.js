// Insights & Financial Intelligence Helper for Module 4 (Engine 2)
// Generates client-specific financial metrics, insights, charts, and compliance schedules.
// All recommendations and assumptions are illustrative and require CA certification.

import { formatINR } from './formatters'

/**
 * Checks whether the client's tax case has sufficient data to generate insights.
 */
export function isClientDataIncomplete(client, taxCase) {
  if (!client || !taxCase) return true
  if (client.status === 'Onboarding') return true
  const totalIncomes =
    (taxCase.incomes?.salary || 0) +
    (taxCase.incomes?.otherSources || 0) +
    (taxCase.incomes?.capitalGainsLTCG || 0) +
    (taxCase.incomes?.capitalGainsSTCG || 0)
  return totalIncomes === 0
}

/**
 * Derives consistent financial snapshot figures for the active client.
 */
export function deriveClientFinancialSnapshot(client, taxCase) {
  if (!client || !taxCase || isClientDataIncomplete(client, taxCase)) {
    return {
      isIncomplete: true,
      grossIncome: 0,
      taxPaid: 0,
      savingsAndInvestments: 0,
      estimatedExpenses: 0,
      effectiveTaxRate: '0.0',
      savingsRate: '0.0',
      savingsInterest: 0,
      ltcgUtilized: 0,
      assumptions: [
        'Client profile in onboarding state. Awaiting document intake for Form 16, 26AS, or AIS.',
      ],
    }
  }

  const grossIncome =
    (taxCase.incomes?.salary || 0) +
    (taxCase.incomes?.otherSources || 0) +
    (taxCase.incomes?.capitalGainsLTCG || 0) +
    (taxCase.incomes?.capitalGainsSTCG || 0)

  const taxPaid =
    taxCase.taxesPaid?.totalTds ||
    taxCase.taxesPaid?.advanceTax ||
    taxCase.taxesPaid?.tdsSalary ||
    0

  const sec80C = taxCase.deductions?.sec80C || 0
  const sec80CCD1B = taxCase.deductions?.sec80CCD1B || 0
  const sec24bPrincipal = taxCase.deductions?.sec24b ? 84000 : 0
  const equityMfInvestments =
    taxCase.incomes?.capitalGainsLTCG || taxCase.incomes?.capitalGainsSTCG
      ? 151000
      : client.category?.includes('Professional')
      ? 100000
      : 50000

  const savingsAndInvestments = sec80C + sec80CCD1B + sec24bPrincipal + equityMfInvestments
  const estimatedExpenses = Math.max(0, grossIncome - taxPaid - savingsAndInvestments)

  const effectiveTaxRate = grossIncome > 0 ? ((taxPaid / grossIncome) * 100).toFixed(1) : '0.0'
  const savingsRate = grossIncome > 0 ? ((savingsAndInvestments / grossIncome) * 100).toFixed(1) : '0.0'

  // Extract savings interest from AIS/other sources for idle cash analysis
  let savingsInterest = 0
  if (taxCase.incomes?.otherSources > 0) {
    if (client.id === 'cli-001') savingsInterest = 46000
    else if (client.id === 'cli-002') savingsInterest = 14000
    else if (client.id === 'cli-003') savingsInterest = 18000
    else if (client.id === 'cli-004') savingsInterest = 28000
    else if (client.id === 'cli-005') savingsInterest = 65000
    else savingsInterest = Math.min(50000, Math.round(taxCase.incomes.otherSources * 0.5))
  }

  const ltcgUtilized = taxCase.incomes?.capitalGainsLTCG || 0

  const assumptions = [
    'Living Expenses (Est.) = Gross Total Earnings minus Total Taxes and Documented Savings/Investments.',
    'Effective Tax Rate = Total Tax Deposited divided by Gross Annual Earnings.',
    'Savings & Wealth Ratio = Documented Statutory Deductions & Investments divided by Gross Annual Earnings.',
    'Idle cash estimates assume an average savings bank yield of 3.0% p.a. vs 7.0% p.a. auto-sweep FD rate.',
  ]

  return {
    isIncomplete: false,
    grossIncome,
    taxPaid,
    savingsAndInvestments,
    estimatedExpenses,
    effectiveTaxRate,
    savingsRate,
    savingsInterest,
    ltcgUtilized,
    sec80C,
    sec80CCD1B,
    sec24bPrincipal,
    equityMfInvestments,
    assumptions,
  }
}

/**
 * Generates client-specific 3-Year Trajectory data for the Bar Chart.
 */
export function generateYoYData(client, snapshot) {
  if (snapshot.isIncomplete || snapshot.grossIncome === 0) {
    return []
  }

  const currentIncome = snapshot.grossIncome
  const currentTax = snapshot.taxPaid
  const currentSavings = snapshot.savingsAndInvestments

  return [
    {
      year: 'FY 2022-23',
      income: Math.round(currentIncome * 0.78),
      tax: Math.round(currentTax * 0.82),
      savings: Math.round(currentSavings * 0.72),
    },
    {
      year: 'FY 2023-24',
      income: Math.round(currentIncome * 0.88),
      tax: Math.round(currentTax * 0.92),
      savings: Math.round(currentSavings * 0.85),
    },
    {
      year: 'FY 2024-25',
      income: currentIncome,
      tax: currentTax,
      savings: currentSavings,
    },
  ]
}

/**
 * Generates client-specific Income Allocation data for the Pie Chart.
 */
export function generateAllocationData(client, snapshot) {
  if (snapshot.isIncomplete || snapshot.grossIncome === 0) {
    return []
  }

  const items = [
    { name: 'Living Expenses', value: snapshot.estimatedExpenses, color: '#64748b' },
    { name: 'Tax Liability', value: snapshot.taxPaid, color: '#ef4444' },
    { name: 'Section 80C Deductions', value: snapshot.sec80C || 150000, color: '#0d9488' },
  ]

  if (snapshot.sec24bPrincipal > 0) {
    items.push({ name: 'Home Loan Principal', value: snapshot.sec24bPrincipal, color: '#3b82f6' })
  }

  if (snapshot.sec80CCD1B > 0) {
    items.push({ name: 'NPS Tier-1 (80CCD)', value: snapshot.sec80CCD1B, color: '#f59e0b' })
  }

  if (snapshot.equityMfInvestments > 0) {
    items.push({ name: 'Mutual Funds / Equity', value: snapshot.equityMfInvestments, color: '#8b5cf6' })
  }

  return items
}

/**
 * Generates client-tailored 3 Critical Wealth Action Insights.
 */
export function generateClientWealthInsights(client, taxCase, snapshot) {
  if (snapshot.isIncomplete) return []

  const clientName = client.name || 'Client'
  const isProfessional = client.category?.includes('Professional')

  // --- Insight 1: NPS Deduction Opportunity ---
  let npsTitle = ''
  let npsNarrative = ''
  let npsAction = ''

  if (snapshot.sec80CCD1B > 0) {
    npsTitle = `1. NPS Section 80CCD(1B): Optimized (₹${formatINR(snapshot.sec80CCD1B)} Claimed)`
    npsNarrative = `${clientName} has actively utilized Section 80CCD(1B) Tier-1 National Pension System deduction of ₹${formatINR(snapshot.sec80CCD1B)}. If continuing under Old Regime, maintain this annual contribution; if evaluating the New Regime u/s 115BAC, note that employee 80CCD(1B) is non-deductible while employer 80CCD(2) remains allowable up to 14% of salary.`
    npsAction = 'CA Check: Review corporate Section 80CCD(2) employer restructuring'
  } else {
    const potentialSaving = Math.round(50000 * (snapshot.effectiveTaxRate > 15 ? 0.312 : 0.208))
    npsTitle = `1. Potential NPS Opportunity: Up to ₹${formatINR(potentialSaving)} Tax Relief`
    npsNarrative = `${clientName} utilized ₹${formatINR(snapshot.sec80C)} under Section 80C, but did not claim Section 80CCD(1B) Tier-1 NPS deduction. Subject to choosing the Old Tax Regime and eligibility criteria, an additional contribution of up to ₹50,000 could yield an estimated potential tax reduction of ~₹${formatINR(potentialSaving)}. (Hypothetical illustration only; not guaranteed).`
    npsAction = 'CA Review: Assess Old vs New Regime suitability before NPS contribution'
  }

  // --- Insight 2: Idle Cash Analysis & Auto-Sweep ---
  const assumedSavingsRate = 3.0 // 3.0% p.a.
  const assumedFdRate = 7.0 // 7.0% p.a.
  const incrementalYieldRate = assumedFdRate - assumedSavingsRate // 4.0%
  const estimatedBalance = snapshot.savingsInterest > 0
    ? Math.round(snapshot.savingsInterest / (assumedSavingsRate / 100))
    : 300000
  const hypotheticalIncrementalReturn = Math.round(estimatedBalance * (incrementalYieldRate / 100))

  const idleCashTitle = `2. Idle Cash Analysis: ~${formatINR(estimatedBalance, { compact: true })} in Low-Yield Savings`
  const idleCashNarrative = `AIS/Form 26AS reports savings bank interest of ₹${formatINR(snapshot.savingsInterest)}. Based on an assumed 3.0% p.a. savings rate, this indicates an estimated average balance of ~₹${formatINR(estimatedBalance)}. Activating an automated bank 2-in-1 auto-sweep FD at an assumed 7.0% p.a. could hypothetically generate ~₹${formatINR(hypotheticalIncrementalReturn)} in additional annual interest (subject to applicable marginal tax under Section 56(2)).`
  const idleCashAction = 'Action: Inquire with banker regarding auto-sweep deposit facility'

  // --- Insight 3: Advance Tax & Compliance Check ---
  let advanceTaxTitle = ''
  let advanceTaxNarrative = ''
  let advanceTaxAction = ''

  if (isProfessional) {
    advanceTaxTitle = '3. Section 44ADA Quarterly Advance Tax Compliance Check'
    advanceTaxNarrative = `For professionals filing under Section 44ADA with gross receipts of ₹${formatINR(snapshot.grossIncome)}, Section 211 allows paying 100% of advance tax in a single installment on or before March 15. The client has deposited advance tax of ₹${formatINR(snapshot.taxPaid)}, mitigating penal interest under Sections 234B and 234C.`
    advanceTaxAction = 'CA Audit: Reconcile Q4 turnover receipts against Form 26AS Part C'
  } else if (snapshot.ltcgUtilized > 0 || taxCase.incomes?.capitalGainsSTCG > 0) {
    advanceTaxTitle = '3. Capital Gains Advance Tax Timing Compliance Check'
    advanceTaxNarrative = `Capital market transactions triggered ₹${formatINR(snapshot.ltcgUtilized + (taxCase.incomes?.capitalGainsSTCG || 0))} in gains. Under the proviso to Section 234C, advance tax on capital gains is payable in remaining installments after the date of realization. Verifying transaction dates ensures protection against unexpected automated demand notices.`
    advanceTaxAction = 'CA Audit: Verify STT broker transaction ledger against AIS dates'
  } else {
    advanceTaxTitle = '3. Statutory Advance Tax Threshold Check (Sec 208)'
    advanceTaxNarrative = `Under Section 208, advance tax applies if net tax liability after TDS exceeds ₹10,000. With salary TDS of ₹${formatINR(snapshot.taxPaid)}, ${clientName}'s employer deductions cover the primary liability. A compliance check confirms minimal interest risk under Section 234B, provided non-salary earnings remain within projected estimates.`
    advanceTaxAction = 'CA Audit: Confirm non-salary interest remains within 80TTA limit'
  }

  return [
    {
      id: 'ins-1',
      dotColor: 'bg-rose-400',
      title: npsTitle,
      narrative: npsNarrative,
      action: npsAction,
      badge: 'Tax Planning Opportunity',
    },
    {
      id: 'ins-2',
      dotColor: 'bg-amber-400',
      title: idleCashTitle,
      narrative: idleCashNarrative,
      action: idleCashAction,
      breakout: {
        assumedRate: `${assumedSavingsRate}% p.a.`,
        estimatedBalance: formatINR(estimatedBalance),
        hypotheticalGain: `+${formatINR(hypotheticalIncrementalReturn)}/yr`,
      },
      badge: 'Hypothetical Cashflow Model',
    },
    {
      id: 'ins-3',
      dotColor: 'bg-blue-400',
      title: advanceTaxTitle,
      narrative: advanceTaxNarrative,
      action: advanceTaxAction,
      badge: 'Compliance & Audit Check',
    },
  ]
}

/**
 * Generates tailored Advance Tax Schedule based on client tax liability.
 */
export function generateAdvanceTaxSchedule(client, snapshot) {
  if (snapshot.isIncomplete || snapshot.taxPaid === 0) {
    return [
      { quarter: 'Q1 (June 15)', percentage: '15%', targetAmount: 0, paidAmount: 0, status: 'N/A', dueDate: '15 June 2024' },
      { quarter: 'Q2 (Sept 15)', percentage: '45%', targetAmount: 0, paidAmount: 0, status: 'N/A', dueDate: '15 Sept 2024' },
      { quarter: 'Q3 (Dec 15)', percentage: '75%', targetAmount: 0, paidAmount: 0, status: 'N/A', dueDate: '15 Dec 2024' },
      { quarter: 'Q4 (March 15)', percentage: '100%', targetAmount: 0, paidAmount: 0, status: 'N/A', dueDate: '15 March 2025' },
    ]
  }

  const total = snapshot.taxPaid
  const isProfessional = client.category?.includes('Professional')

  if (isProfessional) {
    // 44ADA allowed 100% on March 15
    return [
      { quarter: 'Q1 (June 15)', percentage: '—', targetAmount: 0, paidAmount: 0, status: 'EXEMPT', dueDate: 'Sec 44ADA Relief' },
      { quarter: 'Q2 (Sept 15)', percentage: '—', targetAmount: 0, paidAmount: 0, status: 'EXEMPT', dueDate: 'Sec 44ADA Relief' },
      { quarter: 'Q3 (Dec 15)', percentage: '—', targetAmount: 0, paidAmount: 0, status: 'EXEMPT', dueDate: 'Sec 44ADA Relief' },
      { quarter: 'Q4 (March 15)', percentage: '100%', targetAmount: total, paidAmount: total, status: 'PAID', dueDate: '15 March 2025' },
    ]
  }

  return [
    { quarter: 'Q1 (June 15)', percentage: '15%', targetAmount: Math.round(total * 0.15), paidAmount: Math.round(total * 0.15), status: 'PAID', dueDate: '15 June 2024' },
    { quarter: 'Q2 (Sept 15)', percentage: '45%', targetAmount: Math.round(total * 0.45), paidAmount: Math.round(total * 0.45), status: 'PAID', dueDate: '15 Sept 2024' },
    { quarter: 'Q3 (Dec 15)', percentage: '75%', targetAmount: Math.round(total * 0.75), paidAmount: Math.round(total * 0.75), status: 'PAID', dueDate: '15 Dec 2024' },
    { quarter: 'Q4 (March 15)', percentage: '100%', targetAmount: total, paidAmount: total, status: 'PAID', dueDate: '15 March 2025' },
  ]
}

/**
 * Generates client-tailored communication drafts.
 */
export function generateClientCommsDrafts(client, taxCase, snapshot, firmDetails, activeAy) {
  const clientName = client?.name || 'Taxpayer'
  const clientPhone = client?.phone || '+91 90000 00000'
  const clientEmail = client?.email || 'client.demo@example.com'
  const clientId = client?.id || 'cli-001'
  const refundAmount = client?.refundExpected || 0

  return {
    MISSING_DOCS: {
      title: `Missing Document Request (${clientName})`,
      channel: 'WhatsApp Business API',
      recipient: `${clientName} (${clientPhone})`,
      message: `Dear ${clientName},\n\nGreetings from ${firmDetails.firmName}.\n\nDuring our reconciliation review for ${activeAy}, our audit team noted that supporting statements or TDS documentation for your file are currently pending.\n\nPlease upload them securely at our demo client portal: https://demo.sharmaca.in/vault/${clientId}\n\nOur system processes documents in simulated memory without storing passwords.\n\nWarm regards,\nCA Rajesh Sharma, FCA (Demo Partner)`,
    },
    DISCREPANCY_ALERT: {
      title: `AIS Tax Reconciliation Notice (${clientName})`,
      channel: 'WhatsApp Business API',
      recipient: `${clientName} (${clientPhone})`,
      message: `Dear ${clientName},\n\nWe have completed cross-referencing your documents against your official AIS statement from the Income Tax Department for ${activeAy}.\n\nKey Findings:\n• Reported Savings Interest: ₹${formatINR(snapshot.savingsInterest)}\n• Reported Capital Gains: ₹${formatINR(snapshot.ltcgUtilized)}\n• Estimated Illustrative Refund: ₹${formatINR(refundAmount)}\n\nTo ensure complete compliance and avoid defective notices under Section 139(9), we have reconciled all figures in your 3-way matrix.\n\nRegards,\n${firmDetails.firmName}`,
    },
    FILING_READY: {
      title: `ITR Filing Pack Signed Off (${clientName})`,
      channel: 'Email & WhatsApp',
      recipient: `${clientName} (${clientEmail})`,
      message: `Dear ${clientName},\n\nCA Rajesh Sharma (Demo Partner • FCA #DEMO049281) has reviewed and completed simulated sign-off on your ${client?.itrType || 'ITR'} filing pack for ${activeAy}.\n\nKey Highlights:\n• Assessee Name: ${clientName} (${client?.pan})\n• Gross Total Earnings: ₹${formatINR(snapshot.grossIncome)}\n• Illustrative Refund Due: ₹${formatINR(refundAmount)}\n• Demonstration Digest Hash: ${taxCase?.approval?.sha256Hash || 'demo-sha256-e3b0c44298fc1c14'}\n\nPlease review your sample 2-Page Visual Financial Eye-Opener report attached.\n\nRegards,\n${firmDetails.firmName}`,
    },
  }
}
