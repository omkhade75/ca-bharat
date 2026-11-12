// Indian Currency and Date Formatting Utilities

/**
 * Format number into Indian Rupee format (e.g. ₹16,04,200 or ₹38.4L)
 */
export function formatINR(amount, options = {}) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0'
  
  const { compact = false, showSymbol = true } = options
  const symbol = showSymbol ? '₹' : ''
  const num = Number(amount)

  if (compact) {
    if (Math.abs(num) >= 10000000) {
      return `${symbol}${(num / 10000000).toFixed(2)} Cr`
    }
    if (Math.abs(num) >= 100000) {
      return `${symbol}${(num / 100000).toFixed(1)}L`
    }
    if (Math.abs(num) >= 1000) {
      return `${symbol}${(num / 1000).toFixed(1)}k`
    }
  }

  // Standard Indian comma separator (12,34,567)
  const isNegative = num < 0
  const absNumStr = Math.abs(Math.round(num)).toString()
  
  let lastThree = absNumStr.substring(absNumStr.length - 3)
  const otherNumbers = absNumStr.substring(0, absNumStr.length - 3)
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree
  }
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree
  return `${isNegative ? '-' : ''}${symbol}${formatted}`
}

/**
 * Format ISO date string or timestamp to readable Indian date
 */
export function formatDate(dateString, includeTime = false) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString

  const options = {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }
  if (includeTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
    options.hour12 = true
  }

  return new Intl.DateTimeFormat('en-IN', options).format(date)
}

/**
 * Mask PAN identifier (e.g., ABCPS****F)
 */
export function maskPAN(pan) {
  if (!pan || pan.length < 10) return pan
  return `${pan.slice(0, 5)}****${pan.slice(9)}`
}

/**
 * Mask Aadhaar identifier (e.g., •••• •••• 1234)
 */
export function maskAadhaar(aadhaarLast4) {
  return `•••• •••• ${aadhaarLast4 || '0000'}`
}
