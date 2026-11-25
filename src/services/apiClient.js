/**
 * CA Bharat AI - Frontend API Client
 * Connects React application to FastAPI backend endpoints with:
 * - Signed Bearer token authentication headers
 * - Structured 401/403/HTTP error handling (ApiError)
 * - Client-ID / Case-ID Step 06 extraction & CA field correction endpoints
 * - Zero hardcoded credentials or frontend role overrides
 */

const getApiBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return 'http://localhost:8000'
  }
  return 'https://ca-bharat-backend.onrender.com'
}

export const API_BASE_URL = getApiBaseUrl()
export const SESSION_STORAGE_KEY = 'ca_bharat_backend_session_v1'

export class ApiError extends Error {
  constructor(status, detail, code = null, payload = null) {
    const message = ApiError.formatMessage(status, detail)
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
    this.code = code || ApiError.deriveCode(status)
    this.payload = payload
    this.isAuthError = status === 401
    this.isForbiddenError = status === 403
  }

  static deriveCode(status) {
    if (status === 401) return 'UNAUTHORIZED'
    if (status === 403) return 'FORBIDDEN'
    if (status === 404) return 'NOT_FOUND'
    if (status === 400 || status === 422) return 'VALIDATION_ERROR'
    if (status === 503) return 'SERVICE_UNAVAILABLE'
    if (status === 0) return 'NETWORK_ERROR'
    return `HTTP_${status}`
  }

  static formatMessage(status, detail) {
    const normalized =
      typeof detail === 'string' && detail.trim()
        ? detail.trim()
        : Array.isArray(detail)
        ? detail.map((item) => item?.msg || JSON.stringify(item)).join('; ')
        : ''

    if (status === 401) {
      return normalized || 'Authentication required or session expired (401).'
    }
    if (status === 403) {
      return normalized || 'Permission denied for this resource or role (403).'
    }
    if (normalized) return normalized
    return `Request failed with status ${status}`
  }
}

function safeReadSession() {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return null
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function safeWriteSession(sessionData) {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return
    if (!sessionData) {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
    } else {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData))
    }
  } catch {
    // Ignore storage quota/security errors in restricted environments
  }
}

class ApiClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this._session = safeReadSession()
    this._authErrorListeners = new Set()
  }

  getSession() {
    return this._session
  }

  getAccessToken() {
    return this._session?.access_token || null
  }

  setSession(sessionData) {
    this._session = sessionData || null
    safeWriteSession(this._session)
    return this._session
  }

  clearSession() {
    this._session = null
    safeWriteSession(null)
  }

  /**
   * Registers a callback invoked when any authenticated request returns 401 or 403.
   * Returns an unsubscribe function.
   */
  onAuthError(listener) {
    if (typeof listener !== 'function') return () => {}
    this._authErrorListeners.add(listener)
    return () => {
      this._authErrorListeners.delete(listener)
    }
  }

  _notifyAuthError(error) {
    for (const listener of this._authErrorListeners) {
      try {
        listener(error)
      } catch {
        // Isolate subscriber errors
      }
    }
  }

  async _fetchRaw(path, options = {}) {
    const {
      method = 'GET',
      body = null,
      headers = {},
      query = null,
      requiresAuth = true,
      clearSessionOn401 = true,
    } = options

    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    const url = new URL(`${this.baseUrl}${normalizedPath}`)
    if (query && typeof query === 'object') {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value))
        }
      })
    }

    const requestHeaders = { ...headers }
    const token = this.getAccessToken()
    if (token && !requestHeaders.Authorization && !requestHeaders.authorization) {
      requestHeaders.Authorization = `Bearer ${token}`
    }

    if (requiresAuth && !requestHeaders.Authorization && !requestHeaders.authorization) {
      const missingAuthErr = new ApiError(
        401,
        'Authentication required. Please sign in with a valid backend session.'
      )
      this._notifyAuthError(missingAuthErr)
      throw missingAuthErr
    }

    let requestBody = body
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
    if (body !== null && body !== undefined && !isFormData && typeof body !== 'string') {
      if (!requestHeaders['Content-Type']) {
        requestHeaders['Content-Type'] = 'application/json'
      }
      requestBody = JSON.stringify(body)
    }

    let response
    try {
      response = await fetch(url.toString(), {
        method,
        headers: requestHeaders,
        body: requestBody,
      })
    } catch (networkErr) {
      throw new ApiError(0, networkErr?.message || 'Unable to reach backend API server.')
    }

    if (!response.ok) {
      let errorPayload = null
      let detail = response.statusText
      try {
        const text = await response.text()
        if (text) {
          errorPayload = JSON.parse(text)
          detail = errorPayload?.detail || errorPayload?.message || text
        }
      } catch {
        // Keep statusText if response is not JSON
      }

      const apiError = new ApiError(response.status, detail, null, errorPayload)
      if (response.status === 401 && clearSessionOn401) {
        this.clearSession()
      }
      if (response.status === 401 || response.status === 403) {
        this._notifyAuthError(apiError)
      }
      throw apiError
    }

    return response
  }

  async _request(path, options = {}) {
    const response = await this._fetchRaw(path, options)
    if (response.status === 204) return null
    const text = await response.text()
    if (!text) return null
    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  }

  // ---------------------------------------------------------------------------
  // 1. Health & Authentication
  // ---------------------------------------------------------------------------
  async checkHealth() {
    try {
      const res = await this._request('/health', {
        requiresAuth: false,
        clearSessionOn401: false,
      })
      return { online: true, ...res }
    } catch (err) {
      return { online: false, error: err?.message || 'Backend Unreachable' }
    }
  }

  /**
   * Authenticates against backend POST /api/auth/session with runtime-supplied
   * credentials. Roles and client/case scopes are resolved strictly server-side.
   */
  async authenticateSession({ username, credential }) {
    const session = await this._request('/api/auth/session', {
      method: 'POST',
      requiresAuth: false,
      clearSessionOn401: false,
      body: {
        username: (username || '').trim(),
        credential: credential || '',
      },
    })
    this.setSession(session)
    return session
  }

  // ---------------------------------------------------------------------------
  // 2. Client Master & Step 01 Tax Discovery Intake
  // ---------------------------------------------------------------------------
  async getClients() {
    return this._request('/api/clients')
  }

  async getClientByPan(pan) {
    return this._request(`/api/clients/${encodeURIComponent(pan)}`)
  }

  async getClientIntake(pan) {
    return this._request(`/api/clients/${encodeURIComponent(pan)}/intake`)
  }

  async putClientIntake(pan, intakeData) {
    return this._request(`/api/clients/${encodeURIComponent(pan)}/intake`, {
      method: 'PUT',
      body: intakeData,
    })
  }

  async onboardTaxpayer(taxpayerData) {
    return this._request('/api/clients', {
      method: 'POST',
      body: taxpayerData,
    })
  }

  // ---------------------------------------------------------------------------
  // 3. Step 05 & Step 06 Document Vault, Extraction, Corrections & Verification
  // ---------------------------------------------------------------------------

  /**
   * Retrieves documents strictly by internal client_id & optional case_id.
   * Never exposes PAN in API URLs.
   */
  async getDocumentsByClient(clientId, caseId = null) {
    return this._request(`/api/documents/client/${encodeURIComponent(clientId)}`, {
      query: caseId ? { case_id: caseId } : null,
    })
  }

  async uploadDocumentVault({
    file,
    clientId,
    clientPan = null,
    caseId,
    assessmentYear = 'AY 2025-26',
    category,
    checklistItemIds = [],
    notes = '',
  }) {
    const formData = new FormData()
    formData.append('file', file)
    if (clientId) formData.append('client_id', clientId)
    if (clientPan) formData.append('client_pan', clientPan)
    if (caseId) formData.append('case_id', caseId)
    formData.append('assessment_year', assessmentYear)
    formData.append('category', category)
    formData.append('checklist_item_ids', JSON.stringify(checklistItemIds))
    formData.append('notes', notes)

    return this._request('/api/documents/upload', {
      method: 'POST',
      body: formData,
    })
  }

  async extractAllDocuments({ clientId, caseId = null }) {
    return this._request('/api/documents/extract-all', {
      method: 'POST',
      body: {
        client_id: clientId,
        ...(caseId ? { case_id: caseId } : {}),
      },
    })
  }

  async extractDocumentById(docId, caseId = null) {
    return this._request(`/api/documents/${encodeURIComponent(docId)}/extract`, {
      method: 'POST',
      query: caseId ? { case_id: caseId } : null,
    })
  }

  async correctDocumentField(
    docId,
    fieldKey,
    { correctedValue, correctionReason, caseId = null }
  ) {
    return this._request(
      `/api/documents/${encodeURIComponent(docId)}/fields/${encodeURIComponent(fieldKey)}`,
      {
        method: 'PATCH',
        body: {
          field_key: fieldKey,
          corrected_value: correctedValue,
          correction_reason: correctionReason,
          ...(caseId ? { case_id: caseId } : {}),
        },
      }
    )
  }

  async verifyDocumentField(docId, fieldKey, { caseId = null } = {}) {
    return this._request(
      `/api/documents/${encodeURIComponent(docId)}/fields/${encodeURIComponent(fieldKey)}/verify`,
      {
        method: 'PATCH',
        body: {
          field_key: fieldKey,
          ...(caseId ? { case_id: caseId } : {}),
        },
      }
    )
  }

  async updateDocumentStatus(docId, caReviewStatus, reviewNotes = null, waiveReason = null) {
    return this._request(`/api/documents/${encodeURIComponent(docId)}/status`, {
      method: 'PATCH',
      body: {
        ca_review_status: caReviewStatus,
        review_notes: reviewNotes,
        waive_reason: waiveReason,
      },
    })
  }

  async requestMissingDocuments({
    clientId = null,
    clientPan = null,
    caseId = null,
    checklistItemIds = [],
    customNotes = '',
  }) {
    return this._request('/api/documents/request-missing', {
      method: 'POST',
      body: {
        ...(clientId ? { client_id: clientId } : {}),
        ...(clientPan ? { client_pan: clientPan } : {}),
        ...(caseId ? { case_id: caseId } : {}),
        checklist_item_ids: checklistItemIds,
        custom_notes: customNotes,
      },
    })
  }

  async deleteDocument(docId) {
    return this._request(`/api/documents/${encodeURIComponent(docId)}`, {
      method: 'DELETE',
    })
  }

  // Legacy direct extraction endpoints (kept authenticated if invoked directly)
  async extractDocument(file, clientPan, docType = 'form16') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('client_pan', clientPan)

    const endpoints = {
      form16: '/api/extract/form16',
      form26as: '/api/extract/form26as',
      ais: '/api/extract/ais',
      tis: '/api/extract/ais',
    }
    const target = endpoints[docType.toLowerCase()] || '/api/extract/form16'
    return this._request(target, {
      method: 'POST',
      body: formData,
    })
  }

  // ---------------------------------------------------------------------------
  // 4. 3-Way Reconciliation Matrix (Client-ID & Legacy PAN Routes)
  // ---------------------------------------------------------------------------
  async runBackendReconciliation(clientId, { caseId = null, assessmentYear = '2025-26' } = {}) {
    return this._request(`/api/reconcile/client/${encodeURIComponent(clientId)}/run`, {
      method: 'POST',
      body: {
        ...(caseId ? { case_id: caseId } : {}),
        assessment_year: assessmentYear,
      },
    })
  }

  async getBackendReconciliation(clientId, caseId = null) {
    return this._request(`/api/reconcile/client/${encodeURIComponent(clientId)}`, {
      query: caseId ? { case_id: caseId } : null,
    })
  }

  async resolveBackendReconciliationRow(
    clientId,
    rowId,
    { action, caNotes, resolvedValue = null, caseId = null }
  ) {
    return this._request(
      `/api/reconcile/client/${encodeURIComponent(clientId)}/rows/${encodeURIComponent(rowId)}`,
      {
        method: 'PATCH',
        body: {
          action,
          ca_notes: caNotes,
          ...(resolvedValue !== null && resolvedValue !== undefined
            ? { resolved_value: Number(resolvedValue) }
            : {}),
          ...(caseId ? { case_id: caseId } : {}),
        },
      }
    )
  }

  async run3WayReconciliation(clientPan, assessmentYear = '2025-26') {
    return this._request('/api/reconcile/run', {
      method: 'POST',
      body: { client_pan: clientPan, assessment_year: assessmentYear },
    })
  }

  async resolveReconciliationItem({ clientPan, rowId, action, caNotes }) {
    return this._request('/api/reconcile/resolve-item', {
      method: 'POST',
      body: {
        client_pan: clientPan,
        row_id: rowId,
        action,
        ca_notes: caNotes,
      },
    })
  }

  // ---------------------------------------------------------------------------
  // 5. Tax Calculation & CA Sign-Off (Validated Backend Data)
  // ---------------------------------------------------------------------------
  async runBackendTaxCalculation(clientId, { caseId = null, assessmentYear = '2025-26' } = {}) {
    return this._request(`/api/calculate/client/${encodeURIComponent(clientId)}/tax`, {
      method: 'POST',
      body: {
        ...(caseId ? { case_id: caseId } : {}),
        assessment_year: assessmentYear,
      },
    })
  }

  async getBackendTaxCalculation(clientId, caseId = null) {
    return this._request(`/api/calculate/client/${encodeURIComponent(clientId)}`, {
      query: caseId ? { case_id: caseId } : null,
    })
  }

  async submitBackendCaSignOff(clientId, { caseId = null, caNotes, chosenRegime }) {
    return this._request(`/api/calculate/client/${encodeURIComponent(clientId)}/sign-off`, {
      method: 'POST',
      body: {
        ...(caseId ? { case_id: caseId } : {}),
        verification_notes: caNotes,
        chosen_regime: chosenRegime,
      },
    })
  }

  async calculateTax(calculationPayload) {
    return this._request('/api/calculate/tax', {
      method: 'POST',
      body: calculationPayload,
    })
  }

  async caSignOff({ clientPan, caNotes, approvedRegime }) {
    return this._request('/api/calculate/ca-sign-off', {
      method: 'POST',
      body: {
        client_pan: clientPan,
        verification_notes: caNotes,
        chosen_regime: approvedRegime,
      },
    })
  }

  // ---------------------------------------------------------------------------
  // 6. Regulatory Exports & Audit Logs
  // ---------------------------------------------------------------------------
  getExcelWorkpaperUrl(pan) {
    return `${this.baseUrl}/api/export/workpaper/${encodeURIComponent(pan)}`
  }

  getCbdtJsonUrl(pan) {
    return `${this.baseUrl}/api/export/cbdt-json/${encodeURIComponent(pan)}`
  }

  async downloadExcelWorkpaper(pan) {
    const response = await this._fetchRaw(`/api/export/workpaper/${encodeURIComponent(pan)}`)
    return response.blob()
  }

  async fetchCbdtJson(pan) {
    return this._request(`/api/export/cbdt-json/${encodeURIComponent(pan)}`)
  }

  async getAuditLogs() {
    return this._request('/api/audit/logs')
  }
}

export const apiClient = new ApiClient()
export default apiClient
