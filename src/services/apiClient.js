/**
 * CA Bharat AI - Frontend API Client
 * Connects the UI to the Render Python FastAPI Backend & Persistent Database
 * Governed by Income-tax Act, 1961 and Finance Act, 2024
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://ca-bharat-backend.onrender.com')

class ApiClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  async checkHealth() {
    try {
      const start = Date.now()
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000)
      const res = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      const latency = Date.now() - start
      if (res.ok) {
        const data = await res.json()
        return { online: true, latency, data }
      }
      return { online: false, status: res.status }
    } catch (err) {
      return { online: false, error: err.message }
    }
  }

  async getClients() {
    const res = await fetch(`${this.baseUrl}/api/clients`)
    if (!res.ok) throw new Error(`Failed to fetch clients: ${res.statusText}`)
    return res.json()
  }

  async getClientByPan(pan) {
    const res = await fetch(`${this.baseUrl}/api/clients/${pan}`)
    if (!res.ok) throw new Error(`Taxpayer ${pan} not found`)
    return res.json()
  }

  async onboardTaxpayer(taxpayerData) {
    const res = await fetch(`${this.baseUrl}/api/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taxpayerData),
    })
    if (!res.ok) throw new Error(`Onboarding failed: ${res.statusText}`)
    return res.json()
  }

  async extractDocument(file, clientPan = 'ABCPA1092F', docType = 'form16') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('client_pan', clientPan)

    const endpoint =
      docType === 'form26as'
        ? '/api/extract/form26as'
        : docType === 'ais_tis'
        ? '/api/extract/ais-tis'
        : '/api/extract/form16'

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      body: formData,
    })
    if (!res.ok) throw new Error(`Document extraction failed: ${res.statusText}`)
    return res.json()
  }

  async run3WayReconciliation(clientPan, assessmentYear = '2025-26') {
    const res = await fetch(`${this.baseUrl}/api/reconcile/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_pan: clientPan,
        assessment_year: assessmentYear,
      }),
    })
    if (!res.ok) throw new Error(`Reconciliation failed: ${res.statusText}`)
    return res.json()
  }

  async resolveReconciliationItem({ clientPan, rowId, action, caNotes }) {
    const res = await fetch(`${this.baseUrl}/api/reconcile/resolve-item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_pan: clientPan,
        row_id: rowId,
        action,
        ca_notes: caNotes,
      }),
    })
    if (!res.ok) throw new Error(`Failed to resolve item: ${res.statusText}`)
    return res.json()
  }

  async calculateTax(calculationPayload) {
    const res = await fetch(`${this.baseUrl}/api/calculate/tax`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(calculationPayload),
    })
    if (!res.ok) throw new Error(`Tax calculation failed: ${res.statusText}`)
    return res.json()
  }

  async caSignOff({ clientPan, caNotes, approvedRegime }) {
    const res = await fetch(`${this.baseUrl}/api/calculate/ca-sign-off`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_pan: clientPan,
        ca_notes: caNotes,
        approved_regime: approvedRegime,
      }),
    })
    if (!res.ok) throw new Error(`CA Sign-off failed: ${res.statusText}`)
    return res.json()
  }

  getExcelWorkpaperUrl(pan) {
    return `${this.baseUrl}/api/export/workpaper/${pan}`
  }

  getCbdtJsonUrl(pan) {
    return `${this.baseUrl}/api/export/cbdt-json/${pan}`
  }

  async getAuditLogs(limit = 50) {
    const res = await fetch(`${this.baseUrl}/api/audit/logs?limit=${limit}`)
    if (!res.ok) throw new Error(`Failed to fetch audit stream: ${res.statusText}`)
    return res.json()
  }
}

export const apiClient = new ApiClient()
export default apiClient
