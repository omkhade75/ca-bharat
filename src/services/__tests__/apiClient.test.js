import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient, ApiError, SESSION_STORAGE_KEY } from '../apiClient'
import { getClientDocumentBreakdown } from '../../utils/workflowHelper'

describe('ApiClient Auth, Error Handling, and Step 06 Extraction Endpoints', () => {
  beforeEach(() => {
    apiClient.clearSession()
    vi.restoreAllMocks()
  })

  it('rejects protected endpoints with 401 ApiError when no session token exists', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const authEvents = []
    const unsub = apiClient.onAuthError((err) => authEvents.push(err))

    await expect(apiClient.getDocumentsByClient('client-arun-01', 'case-arun-ay2526')).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
      isAuthError: true,
    })

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(authEvents).toHaveLength(1)
    expect(authEvents[0].status).toBe(401)
    unsub()
  })

  it('authenticates via /api/auth/session and attaches Bearer header without exposing PAN in document URLs', async () => {
    const mockSession = {
      access_token: 'signed-test-token-123',
      token_type: 'bearer',
      actor_id: 'staff-partner-01',
      actor_name: 'CA Test Partner',
      role: 'CA_PARTNER',
      assigned_client_ids: [],
      allowed_case_ids: [],
      is_prototype_auth: true,
    }

    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockSession), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ id: 'doc-1', filename: 'Form16.pdf' }]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )

    const session = await apiClient.authenticateSession({
      username: 'partner@firm.test',
      credential: 'runtime-input-secret',
    })
    expect(session.role).toBe('CA_PARTNER')
    expect(window.sessionStorage.getItem(SESSION_STORAGE_KEY)).toContain('signed-test-token-123')

    const docs = await apiClient.getDocumentsByClient('client-arun-01', 'case-arun-ay2526')
    expect(docs).toHaveLength(1)

    const [authUrl, authOpts] = fetchMock.mock.calls[0]
    expect(authUrl).toBe('http://localhost:8000/api/auth/session')
    expect(JSON.parse(authOpts.body)).toEqual({
      username: 'partner@firm.test',
      credential: 'runtime-input-secret',
    })

    const [docsUrl, docsOpts] = fetchMock.mock.calls[1]
    expect(docsUrl).toBe('http://localhost:8000/api/documents/client/client-arun-01?case_id=case-arun-ay2526')
    expect(docsUrl).not.toContain('ABCPA1092F')
    expect(docsOpts.headers.Authorization).toBe('Bearer signed-test-token-123')
  })

  it('calls Step 06 extract, field correction, and verification endpoints with Bearer header', async () => {
    apiClient.setSession({
      access_token: 'ca-token-xyz',
      role: 'CA_STAFF',
      actor_name: 'Associate CA',
    })

    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'doc-9' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'doc-9', corrected_fields: {} }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'doc-9', corrected_fields: {} }), { status: 200 }))

    await apiClient.extractAllDocuments({ clientId: 'client-arun-01', caseId: 'case-arun-ay2526' })
    await apiClient.extractDocumentById('doc-9', 'case-arun-ay2526')
    await apiClient.correctDocumentField('doc-9', 'gross_salary_17_1', {
      correctedValue: 1600000,
      correctionReason: 'Updated per annexure',
      caseId: 'case-arun-ay2526',
    })
    await apiClient.verifyDocumentField('doc-9', 'gross_salary_17_1', { caseId: 'case-arun-ay2526' })

    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:8000/api/documents/extract-all')
    expect(fetchMock.mock.calls[1][0]).toBe('http://localhost:8000/api/documents/doc-9/extract?case_id=case-arun-ay2526')
    expect(fetchMock.mock.calls[2][0]).toBe('http://localhost:8000/api/documents/doc-9/fields/gross_salary_17_1')
    expect(fetchMock.mock.calls[2][1].method).toBe('PATCH')
    expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toEqual({
      field_key: 'gross_salary_17_1',
      corrected_value: 1600000,
      correction_reason: 'Updated per annexure',
      case_id: 'case-arun-ay2526',
    })
    expect(fetchMock.mock.calls[3][0]).toBe('http://localhost:8000/api/documents/doc-9/fields/gross_salary_17_1/verify')
  })

  it('clears stale session and emits ApiError on 401 Unauthorized', async () => {
    apiClient.setSession({ access_token: 'expired-token', role: 'CA_PARTNER' })
    const authEvents = []
    const unsub = apiClient.onAuthError((e) => authEvents.push(e))

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: 'Session expired' }), { status: 401 })
    )

    let caught = null
    try {
      await apiClient.getClients()
    } catch (err) {
      caught = err
    }

    expect(caught).toBeInstanceOf(ApiError)
    expect(caught.status).toBe(401)
    expect(caught.detail).toBe('Session expired')
    expect(apiClient.getSession()).toBeNull()
    expect(authEvents).toHaveLength(1)
    unsub()
  })

  it('preserves session and emits ApiError with 403 Forbidden details on permission denial', async () => {
    apiClient.setSession({ access_token: 'client-token', role: 'CLIENT' })

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: 'Forbidden: CA role required' }), { status: 403 })
    )

    let caught = null
    try {
      await apiClient.extractAllDocuments({ clientId: 'client-arun-01' })
    } catch (err) {
      caught = err
    }

    expect(caught).toBeInstanceOf(ApiError)
    expect(caught.status).toBe(403)
    expect(caught.isForbiddenError).toBe(true)
    expect(caught.detail).toBe('Forbidden: CA role required')
    expect(apiClient.getAccessToken()).toBe('client-token')
  })

  it('recognizes backend document category keys when computing reconciliation completeness', () => {
    const breakdown = getClientDocumentBreakdown({ id: 'client-arun-01', docsRequired: 3 }, [
      { id: 'd1', category: 'FORM_16' },
      { id: 'd2', category: 'FORM_26AS' },
      { id: 'd3', category: 'AIS' },
    ])
    expect(breakdown.isComplete).toBe(true)
    expect(breakdown.missingCategories.filter((c) => c.isMandatory)).toHaveLength(0)
  })
})
