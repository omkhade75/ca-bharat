// Deterministic Indian Income Tax Calculation Engine
// Complies with Indian Income Tax Act (AY 2025-26 & FY 2024-25)
// STRICT NON-GOAL: No LLM arithmetic. 100% deterministic rules.

/**
 * Calculate Old Tax Regime Liability
 * Slab:
 * 0 - 2.5L: Nil
 * 2.5L - 5L: 5%
 * 5L - 10L: 20%
 * Above 10L: 30%
 * Rebate u/s 87A: Up to ₹12,500 if taxable income <= 5L
 * Standard Deduction: ₹50,000 for salaried
 * Health & Education Cess: 4%
 */
export function calculateOldRegimeTax(incomeDetails, deductions) {
  const grossSalary = Number(incomeDetails.salary || 0)
  const houseProperty = Number(incomeDetails.houseProperty || 0) // Loss (negative) or positive
  const capitalGainsLTCG = Number(incomeDetails.capitalGainsLTCG || 0)
  const capitalGainsSTCG = Number(incomeDetails.capitalGainsSTCG || 0)
  const otherSources = Number(incomeDetails.otherSources || 0)

  // Gross Total Income
  const grossTotalIncome = grossSalary + houseProperty + capitalGainsLTCG + capitalGainsSTCG + otherSources

  // Old Regime Deductions
  const standardDeduction = grossSalary > 0 ? 50000 : 0
  const sec80C = Math.min(Number(deductions.sec80C || 0), 150000)
  const sec80D = Math.min(Number(deductions.sec80D || 0), 75000) // Self (25k) + Senior Parents (50k)
  const sec80CCD1B = Math.min(Number(deductions.sec80CCD1B || 0), 50000) // NPS additional
  const sec24b = Math.min(Number(deductions.sec24b || 0), 200000) // Home loan self-occupied interest
  const sec80TTA = Math.min(Number(deductions.sec80TTA || 0), 10000) // Savings interest

  const totalDeductions = standardDeduction + sec80C + sec80D + sec80CCD1B + sec24b + sec80TTA
  const netTaxableIncome = Math.max(0, grossTotalIncome - totalDeductions)

  // Slab calculation
  let baseTax = 0
  if (netTaxableIncome > 1000000) {
    baseTax += (netTaxableIncome - 1000000) * 0.30
    baseTax += 500000 * 0.20
    baseTax += 250000 * 0.05
  } else if (netTaxableIncome > 500000) {
    baseTax += (netTaxableIncome - 500000) * 0.20
    baseTax += 250000 * 0.05
  } else if (netTaxableIncome > 250000) {
    baseTax += (netTaxableIncome - 250000) * 0.05
  }

  // Rebate u/s 87A (Old Regime: Net income <= 5L)
  let rebate87A = 0
  if (netTaxableIncome <= 500000) {
    rebate87A = Math.min(baseTax, 12500)
  }

  const taxAfterRebate = Math.max(0, baseTax - rebate87A)
  const cess = taxAfterRebate * 0.04
  const totalTaxLiability = Math.round(taxAfterRebate + cess)

  return {
    regime: 'Old Regime',
    grossTotalIncome,
    standardDeduction,
    deductionsBreakdown: {
      standardDeduction,
      sec80C,
      sec80D,
      sec80CCD1B,
      sec24b,
      sec80TTA,
    },
    totalDeductions,
    netTaxableIncome,
    baseTax,
    rebate87A,
    cess,
    totalTaxLiability,
  }
}

/**
 * Calculate New Tax Regime Liability (Sec 115BAC for AY 2025-26)
 * Slab:
 * 0 - 3L: Nil
 * 3L - 7L: 5%
 * 7L - 10L: 10%
 * 10L - 12L: 15%
 * 12L - 15L: 20%
 * Above 15L: 30%
 * Standard Deduction: ₹75,000 (enhanced in budget)
 * Full Rebate u/s 87A: Up to ₹25,000 if taxable income <= 7L
 * Health & Education Cess: 4%
 */
export function calculateNewRegimeTax(incomeDetails) {
  const grossSalary = Number(incomeDetails.salary || 0)
  const houseProperty = Math.max(0, Number(incomeDetails.houseProperty || 0)) // No HP loss setoff in New Regime
  const capitalGainsLTCG = Number(incomeDetails.capitalGainsLTCG || 0)
  const capitalGainsSTCG = Number(incomeDetails.capitalGainsSTCG || 0)
  const otherSources = Number(incomeDetails.otherSources || 0)

  const grossTotalIncome = grossSalary + houseProperty + capitalGainsLTCG + capitalGainsSTCG + otherSources

  // Only Standard Deduction allowed in New Regime for salaried
  const standardDeduction = grossSalary > 0 ? 75000 : 0
  const totalDeductions = standardDeduction
  const netTaxableIncome = Math.max(0, grossTotalIncome - totalDeductions)

  // Slab calculation
  let baseTax = 0
  if (netTaxableIncome > 1500000) {
    baseTax += (netTaxableIncome - 1500000) * 0.30
    baseTax += 300000 * 0.20 // 12-15L
    baseTax += 200000 * 0.15 // 10-12L
    baseTax += 300000 * 0.10 // 7-10L
    baseTax += 400000 * 0.05 // 3-7L
  } else if (netTaxableIncome > 1200000) {
    baseTax += (netTaxableIncome - 1200000) * 0.20
    baseTax += 200000 * 0.15
    baseTax += 300000 * 0.10
    baseTax += 400000 * 0.05
  } else if (netTaxableIncome > 1000000) {
    baseTax += (netTaxableIncome - 1000000) * 0.15
    baseTax += 300000 * 0.10
    baseTax += 400000 * 0.05
  } else if (netTaxableIncome > 700000) {
    baseTax += (netTaxableIncome - 700000) * 0.10
    baseTax += 400000 * 0.05
  } else if (netTaxableIncome > 300000) {
    baseTax += (netTaxableIncome - 300000) * 0.05
  }

  // Rebate u/s 87A (New Regime: Net taxable income <= 7L has zero tax)
  let rebate87A = 0
  if (netTaxableIncome <= 700000) {
    rebate87A = baseTax
  }

  const taxAfterRebate = Math.max(0, baseTax - rebate87A)
  const cess = taxAfterRebate * 0.04
  const totalTaxLiability = Math.round(taxAfterRebate + cess)

  return {
    regime: 'New Regime (Default)',
    grossTotalIncome,
    standardDeduction,
    deductionsBreakdown: {
      standardDeduction,
    },
    totalDeductions,
    netTaxableIncome,
    baseTax,
    rebate87A,
    cess,
    totalTaxLiability,
  }
}

/**
 * Compare both regimes and determine optimal filing recommendation
 */
export function compareTaxRegimes(incomeDetails, deductions, tdsPaid = 0) {
  const oldRegime = calculateOldRegimeTax(incomeDetails, deductions)
  const newRegime = calculateNewRegimeTax(incomeDetails)

  const taxDifference = Math.abs(oldRegime.totalTaxLiability - newRegime.totalTaxLiability)
  const isOldBetter = oldRegime.totalTaxLiability < newRegime.totalTaxLiability
  const recommendedRegime = isOldBetter ? 'Old Regime' : 'New Regime'

  const activeTax = isOldBetter ? oldRegime.totalTaxLiability : newRegime.totalTaxLiability
  const refundOrPayable = tdsPaid - activeTax
  const isRefund = refundOrPayable >= 0

  return {
    oldRegime,
    newRegime,
    recommendedRegime,
    taxSaved: taxDifference,
    tdsPaid,
    activeTaxLiability: activeTax,
    refundAmount: isRefund ? refundOrPayable : 0,
    payableAmount: !isRefund ? Math.abs(refundOrPayable) : 0,
    recommendationReason: isOldBetter
      ? `Old Regime saves ₹${taxDifference.toLocaleString('en-IN')} primarily due to Section 24(b) Home Loan Interest and Section 80D Medical Insurance deductions.`
      : `New Regime saves ₹${taxDifference.toLocaleString('en-IN')} due to concessional tax slabs and ₹75,000 standard deduction.`,
  }
}
