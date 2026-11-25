import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from '../../../../context/AppContext'
import DocumentIntelligenceModule from '../DocumentIntelligenceModule'
import { apiClient } from '../../../../services/apiClient'

const MOCK_CLIENT = {
  id: 'client-arun-01',
  name: 'Arun Kumar Verma',
  pan: 'ABCPA1092F',
  email: 'arun.verma@demo.in',
  phone: '+91 98201 44510',
  legal_type: 'INDIVIDUAL',
  occupation_profile: 'SALARIED',
  category: 'Individual - Salaried',
  residential_status: 'RESIDENT',
  assessment_year: '2025-26',
  itr_form_type: 'ITR-1 (Sahaj)',
  consent: { status: 'ACTIVE' },
}

const UPLOADED_F16_DOC = {
  id: 'doc-f16-01',
  client_id: 'client-arun-01',
  client_pan: 'ABCPA1092F',
  case_id: 'case-arun-ay2526',
  assessment_year: 'AY 2025-26',
  filename: 'Form16_Arun_TCS.pdf',
  category: 'Form 16',
  page_count: 2,
  processing_status: 'UPLOADED',
  ca_review_status: 'PENDING_REVIEW',
  checklist_item_ids: ['salary-form16'],
  file_size_bytes: 20480,
  file_hash_sha256: 'abc123def456',
  file_type: 'application/pdf',
  extraction_supported: true,
  extraction_engine: 'DETERMINISTIC_PDF',
  evidence_score: null,
  evidence_methodology: null,
  extracted_data: {},
  citations: [],
  corrected_fields: {},
  uploaded_at: '2026-11-20T10:00:00Z',
}

const UNSUPPORTED_BANK_DOC = {
  id: 'doc-bank-02',
  client_id: 'client-arun-01',
  client_pan: 'ABCPA1092F',
  case_id: 'case-arun-ay2526',
  assessment_year: 'AY 2025-26',
  filename: 'HDFC_Bank_Statement.pdf',
  category: 'Bank Statements',
  page_count: 5,
  processing_status: 'UPLOADED',
  ca_review_status: 'PENDING_REVIEW',
  checklist_item_ids: ['bank-statements'],
  file_size_bytes: 51200,
  file_hash_sha256: 'fedcba987654',
  file_type: 'application/pdf',
  extraction_supported: false,
  extraction_engine: 'UNSUPPORTED_TYPE',
  evidence_score: null,
  evidence_methodology: null,
  extracted_data: {},
  citations: [],
  corrected_fields: {},
  uploaded_at: '2026-11-20T10:05:00Z',
}

const EXTRACTED_F16_DOC = {
  ...UPLOADED_F16_DOC,
  processing_status: 'PARSED',
  extraction_supported: true,
  extraction_engine: 'DETERMINISTIC_PDF',
  evidence_score: 1.0,
  evidence_methodology: 'COORDINATE_LOCALIZATION_RATIO',
  citations_count: 2,
  extracted_data: {
    employer_name: 'Tata Consultancy Services Ltd',
    gross_salary_17_1: 1540000,
    tds_deducted: 142000,
  },
  citations: [
    {
      field_name: 'gross_salary_17_1',
      page_number: 2,
      bounding_box: [120.5, 410.0, 290.5, 425.0],
      raw_text: 'Gross Salary 17(1): 15,40,000',
      evidence_score: 1.0,
      evidence_status: 'COORDINATE_VERIFIED',
      document_name: 'Form16_Arun_TCS.pdf',
    },
    {
      field_name: 'tds_deducted',
      page_number: 1,
      bounding_box: [310.0, 220.0, 440.0, 236.0],
      raw_text: 'Total Tax Deposited: 1,42,000',
      evidence_score: 1.0,
      evidence_status: 'COORDINATE_VERIFIED',
      document_name: 'Form16_Arun_TCS.pdf',
    },
  ],
}

const CORRECTED_F16_DOC = {
  ...EXTRACTED_F16_DOC,
  corrected_fields: {
    gross_salary_17_1: {
      field_key: 'gross_salary_17_1',
      original_value: 1540000,
      corrected_value: 1560000,
      is_corrected: true,
      corrected_by: 'CA Test Partner (CA_PARTNER)',
      corrected_by_id: 'staff-partner-01',
      corrected_by_role: 'CA_PARTNER',
      correction_reason: 'Adjusted per supplementary Form 16 annexure',
      corrected_at: '2026-11-25T11:00:00Z',
      review_status: 'CORRECTED',
      original_citation: EXTRACTED_F16_DOC.citations[0],
      correction_history: [
        {
          previous_value: 1540000,
          new_value: 1560000,
          reason: 'Adjusted per supplementary Form 16 annexure',
          corrected_by: 'CA Test Partner (CA_PARTNER)',
          corrected_at: '2026-11-25T11:00:00Z',
        },
      ],
    },
  },
}

const VERIFIED_F16_DOC = {
  ...CORRECTED_F16_DOC,
  corrected_fields: {
    gross_salary_17_1: {
      ...CORRECTED_F16_DOC.corrected_fields.gross_salary_17_1,
      review_status: 'VERIFIED',
    },
  },
}

function renderDocWorkspace() {
  return render(
    <MemoryRouter>
      <AppProvider>
        <DocumentIntelligenceModule />
      </AppProvider>
    </MemoryRouter>
  )
}

describe('DocumentExtractionWorkflow Integration', () => {
  beforeEach(() => {
    apiClient.clearSession()
    vi.restoreAllMocks()
  })

  it('completes sign-in, backend extraction without PAN in URL, CA field correction, verification, citation inspection, and Step 05 outreach', async () => {
    const user = userEvent.setup()

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input)
      const method = (init?.method || 'GET').toUpperCase()

      if (url.endsWith('/api/auth/session') && method === 'POST') {
        return new Response(
          JSON.stringify({
            access_token: 'mock-partner-jwt',
            token_type: 'bearer',
            actor_id: 'staff-partner-01',
            actor_name: 'CA Test Partner',
            role: 'CA_PARTNER',
            assigned_client_ids: [],
            allowed_case_ids: [],
            is_prototype_auth: true,
          }),
          { status: 200 }
        )
      }

      if (url.endsWith('/api/clients') && method === 'GET') {
        return new Response(JSON.stringify([MOCK_CLIENT]), { status: 200 })
      }

      if (url.includes('/api/documents/client/client-arun-01') && method === 'GET') {
        return new Response(JSON.stringify([UPLOADED_F16_DOC, UNSUPPORTED_BANK_DOC]), {
          status: 200,
        })
      }

      if (url.endsWith('/api/documents/extract-all') && method === 'POST') {
        return new Response(JSON.stringify([EXTRACTED_F16_DOC, UNSUPPORTED_BANK_DOC]), {
          status: 200,
        })
      }

      if (url.endsWith('/api/documents/doc-f16-01/fields/gross_salary_17_1') && method === 'PATCH') {
        return new Response(JSON.stringify(CORRECTED_F16_DOC), { status: 200 })
      }

      if (url.endsWith('/api/documents/doc-f16-01/fields/gross_salary_17_1/verify') && method === 'PATCH') {
        return new Response(JSON.stringify(VERIFIED_F16_DOC), { status: 200 })
      }

      if (url.endsWith('/api/documents/request-missing') && method === 'POST') {
        return new Response(
          JSON.stringify({
            recipient_name: 'Arun Kumar Verma',
            recipient_email: 'arun.verma@demo.in',
            recipient_mobile: '+91 98201 44510',
            subject: 'Draft Missing Documents Notice AY 2025-26',
            email_body: 'Draft body',
            whatsapp_body: 'Draft WhatsApp',
            missing_items: [{ id: 'salary-form16', title: 'Form 16' }],
            is_simulated_dispatch: true,
            notice_disclaimer: 'Draft outreach preview only.',
          }),
          { status: 200 }
        )
      }

      return new Response(JSON.stringify({ detail: `Unhandled mock endpoint: ${method} ${url}` }), {
        status: 404,
      })
    })

    renderDocWorkspace()

    // Unauthenticated state prompts backend sign-in
    const signInBtn = await screen.findByRole('button', { name: /Sign In to Backend API/i })
    await user.click(signInBtn)

    await user.type(screen.getByLabelText(/Account Username/i), 'partner@firm.test')
    await user.type(screen.getByLabelText(/Password \/ Credential/i), 'test-pass-123')
    await user.click(screen.getByRole('button', { name: /Authenticate Backend Session/i }))

    // Documents fetched by client ID without exposing PAN in URL
    await waitFor(() => {
      expect(screen.getAllByText('Form16_Arun_TCS.pdf').length).toBeGreaterThan(0)
      expect(screen.getAllByText('HDFC_Bank_Statement.pdf').length).toBeGreaterThan(0)
    })

    const docFetchCalls = fetchMock.mock.calls.filter(([u]) =>
      String(u).includes('/api/documents/client/')
    )
    expect(docFetchCalls.length).toBeGreaterThan(0)
    expect(String(docFetchCalls[0][0])).not.toContain('ABCPA1092F')

    // Trigger batch extraction -> switches to EXTRACTED_REVIEW tab
    const extractBtn = screen.getByRole('button', { name: /Run Document Intelligence/i })
    await user.click(extractBtn)

    // Verify backend extracted data, citations, evidence score, unsupported badge, and NO accuracy %
    await waitFor(() => {
      expect(screen.getByText('Tata Consultancy Services Ltd')).toBeInTheDocument()
      expect(screen.getByText(/Evidence Score: 1\.00 \(Coordinate Ratio\)/i)).toBeInTheDocument()
      expect(screen.getByText(/Unsupported \(UNSUPPORTED_TYPE\)/i)).toBeInTheDocument()
      expect(screen.getByText(/BBox \[120\.5, 410, 290\.5, 425\]/i)).toBeInTheDocument()
    })

    expect(document.body.textContent).not.toMatch(/99\.2%|99\.4%|OCR Confidence/i)

    // Open CA Correction modal on Gross Salary
    const docCard = screen.getByTestId('extracted-doc-card-doc-f16-01')
    const grossRow = within(docCard).getByText('gross_salary_17_1').closest('tr')
    await user.click(within(grossRow).getByRole('button', { name: /Correct/i }))

    expect(screen.getByTestId('immutable-original-value')).toHaveTextContent('1540000')
    const valInput = screen.getByLabelText(/Corrected Value/i)
    await user.clear(valInput)
    await user.type(valInput, '1560000')
    await user.type(
      screen.getByLabelText(/Mandatory CA Audit Reason/i),
      'Adjusted per supplementary Form 16 annexure'
    )
    await user.click(screen.getByRole('button', { name: /Save CA Correction/i }))

    // Verify immutable original value + CA override both rendered
    await waitFor(() => {
      expect(within(docCard).getByText('CA CORRECTED')).toBeInTheDocument()
      expect(within(docCard).getByText(/Original \(immutable\)/i)).toBeInTheDocument()
      expect(
        within(docCard).getByText(/Adjusted per supplementary Form 16 annexure/i)
      ).toBeInTheDocument()
    })

    // Inspect Citation Modal -> shows real snippet & coordinates & override
    const updatedGrossRow = within(docCard).getByText('gross_salary_17_1').closest('tr')
    await user.click(within(updatedGrossRow).getByRole('button', { name: /Inspect/i }))
    expect(screen.getByText(/Gross Salary 17\(1\): 15,40,000/i)).toBeInTheDocument()
    expect(screen.getByText(/BBox \[x0:120\.5, y0:410, x1:290\.5, y1:425\]/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^Done$/i }))

    // Verify field -> status becomes VERIFIED
    await user.click(within(updatedGrossRow).getByRole('button', { name: /Verify/i }))
    await waitFor(() => {
      expect(within(updatedGrossRow).getByRole('button', { name: /Verified/i })).toBeDisabled()
    })

    // Verify preserved Step 05 outreach action works with client_id
    await user.click(screen.getByRole('button', { name: /Request Missing Docs/i }))
    await waitFor(() => {
      expect(screen.getByText(/Draft Client Outreach: Request Missing Documents/i)).toBeInTheDocument()
    })
  })

  it('displays explicit 403 Forbidden error when backend rejects CA correction for unauthorized role', async () => {
    const user = userEvent.setup()

    apiClient.setSession({
      access_token: 'client-token-001',
      token_type: 'bearer',
      actor_id: 'usr-client-arun-01',
      actor_name: 'Arun Kumar Verma',
      role: 'CLIENT',
      assigned_client_ids: ['client-arun-01'],
      allowed_case_ids: ['case-arun-ay2526'],
      is_prototype_auth: true,
    })

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input)
      const method = (init?.method || 'GET').toUpperCase()
      if (url.endsWith('/api/clients')) {
        return new Response(JSON.stringify([MOCK_CLIENT]), { status: 200 })
      }
      if (url.includes('/api/documents/client/client-arun-01')) {
        return new Response(JSON.stringify([EXTRACTED_F16_DOC]), { status: 200 })
      }
      if (url.endsWith('/api/documents/doc-f16-01/fields/gross_salary_17_1') && method === 'PATCH') {
        return new Response(
          JSON.stringify({ detail: 'Forbidden: Only CA_PARTNER or CA_STAFF may modify fields.' }),
          { status: 403 }
        )
      }
      return new Response(JSON.stringify({ detail: 'Not found' }), { status: 404 })
    })

    renderDocWorkspace()

    await waitFor(() => {
      expect(screen.getByText('Form16_Arun_TCS.pdf')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Extracted Data & Evidence Citations/i }))
    await waitFor(() => {
      expect(screen.getByTestId('extracted-doc-card-doc-f16-01')).toBeInTheDocument()
    })

    const grossRow = screen.getByText('gross_salary_17_1').closest('tr')
    await user.click(within(grossRow).getByRole('button', { name: /Correct/i }))

    await user.type(
      screen.getByLabelText(/Mandatory CA Audit Reason/i),
      'Attempting unauthorized client override'
    )
    await user.click(screen.getByRole('button', { name: /Save CA Correction/i }))

    await waitFor(() => {
      expect(screen.getAllByText(/Only CA_PARTNER or CA_STAFF may modify fields/i).length).toBeGreaterThan(0)
    })
  })
})
