import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from '../../../../context/AppContext'
import FirmClientsModule from '../FirmClientsModule'
import DocumentIntelligenceModule from '../../document-intelligence/DocumentIntelligenceModule'
import { apiClient } from '../../../../services/apiClient'

describe('Onboarding PAN Validation, Backend Sync & Upload Integration', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    apiClient.clearSession()
    vi.restoreAllMocks()
  })

  it('rejects invalid 6-character PAN during onboarding and persists valid client to POST /api/clients before PDF upload', async () => {
    const user = userEvent.setup()

    apiClient.setSession({
      access_token: 'partner-token',
      token_type: 'bearer',
      actor_id: 'staff-partner-01',
      actor_name: 'CA Rajesh Sharma (Partner)',
      role: 'CA_PARTNER',
      assigned_client_ids: [],
      allowed_case_ids: [],
      is_prototype_auth: true,
    })

    const backendClientsStore = [
      {
        id: 'client-arun-01',
        name: 'Arun Kumar Verma',
        pan: 'ABCPA1092F',
        email: 'arun.verma@demo.in',
        legal_type: 'INDIVIDUAL',
        occupation_profile: 'SALARIED',
        category: 'Individual - Salaried',
        residential_status: 'RESIDENT',
        assessment_year: '2025-26',
        itr_form_type: 'ITR-1 (Sahaj)',
        consent: { status: 'ACTIVE' },
      },
    ]

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input)
      const method = (init?.method || 'GET').toUpperCase()

      if (url.endsWith('/api/clients') && method === 'GET') {
        return new Response(JSON.stringify(backendClientsStore), { status: 200 })
      }
      if (url.endsWith('/api/clients') && method === 'POST') {
        const body = JSON.parse(init.body)
        backendClientsStore.push(body)
        return new Response(JSON.stringify(body), { status: 200 })
      }
      if (url.includes('/intake') && method === 'PUT') {
        return new Response(JSON.stringify({ status: 'SUCCESS' }), { status: 200 })
      }
      if (url.includes('/api/documents/client/')) {
        return new Response(JSON.stringify([]), { status: 200 })
      }
      if (url.endsWith('/api/documents/upload') && method === 'POST') {
        return new Response(
          JSON.stringify({
            id: 'doc-om-f16',
            client_id: 'client-abcpk9918f',
            client_pan: 'ABCPK9918F',
            case_id: 'case-client-abcpk9918f-ay2526',
            assessment_year: 'AY 2025-26',
            filename: '01_Form16_Salary_TCS.pdf',
            category: 'FORM_16',
            page_count: 2,
            processing_status: 'PARSED',
            ca_review_status: 'PENDING_REVIEW',
            checklist_item_ids: ['salary-form16'],
            file_size_bytes: 3269,
            file_hash_sha256: 'hash-1234',
            file_type: 'application/pdf',
            extraction_supported: true,
            extraction_engine: 'DETERMINISTIC_PDF',
            evidence_score: 1.0,
            extracted_data: { part_b: { gross_salary: 1520000 } },
            citations: [],
            corrected_fields: {},
            uploaded_at: '2026-11-27T10:00:00Z',
          }),
          { status: 200 }
        )
      }
      return new Response(JSON.stringify({}), { status: 200 })
    })

    render(
      <MemoryRouter>
        <AppProvider>
          <FirmClientsModule />
          <DocumentIntelligenceModule />
        </AppProvider>
      </MemoryRouter>
    )

    // Wait for initial sync
    await waitFor(() => {
      expect(screen.getAllByText(/Arun Kumar Verma/i).length).toBeGreaterThan(0)
    })

    // Open Onboard Modal
    await user.click(screen.getByRole('button', { name: /Add Taxpayer Profile/i }))

    await user.type(screen.getByPlaceholderText(/e\.g\. Ramesh K\. Narayanan/i), 'Om Khade')
    const panInput = screen.getByPlaceholderText(/e\.g\. ABCPK9918F/i)
    await user.type(panInput, 'FBVKJS')

    // Inline format error visible and submit blocks POST /api/clients
    expect(screen.getByText(/Format: 5 letters, 4 digits, 1 letter/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Onboard & Open Discovery/i }))

    expect(screen.getByText(/Invalid PAN "FBVKJS"/i)).toBeInTheDocument()
    const postClientCallsBefore = fetchMock.mock.calls.filter(
      ([u, o]) => String(u).endsWith('/api/clients') && (o?.method || 'GET').toUpperCase() === 'POST'
    )
    expect(postClientCallsBefore.length).toBe(0)

    // Fix PAN to valid 10-char PAN and select Multiple Income Streams / Don't Know
    await user.clear(panInput)
    await user.type(panInput, 'ABCPK9918F')
    await user.click(screen.getByRole('button', { name: /Onboard & Open Discovery/i }))

    await waitFor(() => {
      const postCalls = fetchMock.mock.calls.filter(
        ([u, o]) => String(u).endsWith('/api/clients') && (o?.method || 'GET').toUpperCase() === 'POST'
      )
      expect(postCalls.length).toBe(1)
      const body = JSON.parse(postCalls[0][1].body)
      expect(body.id).toBe('client-abcpk9918f')
      expect(body.pan).toBe('ABCPK9918F')
    })

    // Close discovery modal
    const saveDiscoveryBtn = await screen.findByRole('button', { name: /Save & Link to Case/i })
    await user.click(saveDiscoveryBtn)

    await waitFor(() => {
      const putIntakeCalls = fetchMock.mock.calls.filter(
        ([u, o]) => String(u).includes('/ABCPK9918F/intake') && o?.method === 'PUT'
      )
      expect(putIntakeCalls.length).toBe(1)
    })

    // Verify DocumentIntelligenceModule reflects Om Khade as active client & uploads PDF cleanly
    expect(screen.getByText(/Dynamic Document Checklist for Om Khade/i)).toBeInTheDocument()
    expect(screen.queryByText(/Client 'cli-001' not found/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Client case ownership mismatch/i)).not.toBeInTheDocument()

    // Simulate uploading a sample Form 16 PDF for the newly onboarded client
    const fileInput = document.querySelector('input[type="file"]')
    expect(fileInput).not.toBeNull()
    const pdfFile = new File(['%PDF-1.4 Form 16 sample content'], '01_Form16_Salary_TCS.pdf', {
      type: 'application/pdf',
    })
    await user.upload(fileInput, pdfFile)

    await waitFor(() => {
      expect(
        screen.getByText(/Uploaded and verified '01_Form16_Salary_TCS\.pdf'/i)
      ).toBeInTheDocument()
    })
    const uploadCalls = fetchMock.mock.calls.filter(
      ([u, o]) => String(u).endsWith('/api/documents/upload') && o?.method === 'POST'
    )
    expect(uploadCalls.length).toBe(1)
    expect(uploadCalls[0][1].body.get('client_id')).toBe('client-abcpk9918f')
    expect(uploadCalls[0][1].body.get('client_pan')).toBe('ABCPK9918F')
  })
})
