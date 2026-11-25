import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from '../../../../context/AppContext'
import TaxReconciliationModule from '../TaxReconciliationModule'
import { apiClient } from '../../../../services/apiClient'
import { getClientDocumentBreakdown } from '../../../../utils/workflowHelper'

vi.mock('canvas-confetti', () => ({ default: vi.fn() }))

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

const MOCK_DOCS = [
  {
    id: 'doc-f16',
    client_id: 'client-arun-01',
    client_pan: 'ABCPA1092F',
    case_id: 'case-arun-ay2526',
    assessment_year: 'AY 2025-26',
    filename: 'Form16_Arun_TCS.pdf',
    category: 'FORM_16',
    processing_status: 'PARSED',
    ca_review_status: 'VERIFIED',
    extraction_supported: true,
    extraction_engine: 'DETERMINISTIC_PDF',
    extracted_data: { part_b: { gross_salary: 1800000 } },
    citations: [],
    corrected_fields: {},
  },
  {
    id: 'doc-26as',
    client_id: 'client-arun-01',
    client_pan: 'ABCPA1092F',
    case_id: 'case-arun-ay2526',
    assessment_year: 'AY 2025-26',
    filename: 'Form26AS_Arun.pdf',
    category: 'FORM_26AS',
    processing_status: 'PARSED',
    ca_review_status: 'VERIFIED',
    extraction_supported: true,
    extraction_engine: 'DETERMINISTIC_PDF',
    extracted_data: { total_tds_credit_claimed: 125000 },
    citations: [],
    corrected_fields: {},
  },
  {
    id: 'doc-ais',
    client_id: 'client-arun-01',
    client_pan: 'ABCPA1092F',
    case_id: 'case-arun-ay2526',
    assessment_year: 'AY 2025-26',
    filename: 'AIS_Arun.pdf',
    category: 'AIS',
    processing_status: 'PARSED',
    ca_review_status: 'VERIFIED',
    extraction_supported: true,
    extraction_engine: 'DETERMINISTIC_PDF',
    extracted_data: { total_reported_income: 1822000 },
    citations: [],
    corrected_fields: {},
  },
]

const UNRESOLVED_MATRIX = {
  client_id: 'client-arun-01',
  case_id: 'case-arun-ay2526',
  client_pan: 'ABCPA1092F',
  client_name: 'Arun Kumar Verma',
  assessment_year: '2025-26',
  total_items: 2,
  total_discrepancies: 1,
  high_risk_count: 1,
  all_reconciled: false,
  data_source: 'BACKEND_EXTRACTED_DOCS',
  source_documents: [
    { id: 'doc-f16', filename: 'Form16_Arun_TCS.pdf', category: 'FORM_16', has_extracted_data: true },
  ],
  rows: [
    {
      id: 'row-salary-gross',
      category: 'Salary Income',
      field_label: 'Gross Salary u/s 17(1) + 17(2)',
      form_16_value: 1800000,
      form_26as_value: 1800000,
      ais_value: 1800000,
      variance: 0,
      match_status: 'MATCHED',
      notice_risk: 'LOW',
      statutory_rule: 'Section 15-17 Salary Match',
      explanation: 'Salary matches across all three statutory sources.',
      recommended_action: 'NO_ACTION',
      is_resolved: true,
      resolved_value: 1800000,
      source_citations: [
        {
          document_name: 'Form16_Arun_TCS.pdf',
          page_number: 2,
          bounding_box: [275.5, 102.3, 344.1, 114.6],
          field_name: 'Salary u/s 17(1)',
          evidence_status: 'COORDINATE_VERIFIED',
          evidence_score: 1.0,
        },
      ],
      original_extracted_values: { form_16_original: 1800000, form_26as_original: 1800000, ais_original: 1800000 },
      ca_corrections_applied: [],
    },
    {
      id: 'row-tds-192',
      category: 'Tax Deducted at Source',
      field_label: 'Salary TDS Credit u/s 192',
      form_16_value: 138000,
      form_26as_value: 125000,
      ais_value: 125000,
      variance: 13000,
      match_status: 'MISMATCH_VARIANCE',
      notice_risk: 'HIGH',
      statutory_rule: 'Rule 37BA & Sec 143(1)(a) CPC Match',
      explanation: 'Form 16 TDS differs from Form 26AS portal credit.',
      recommended_action: 'CLAIM_PORTAL_SAFE',
      is_resolved: false,
      resolved_value: 125000,
      source_citations: [
        {
          document_name: 'Form26AS_Arun.pdf',
          page_number: 1,
          bounding_box: [320.4, 177.3, 368.0, 189.6],
          field_name: 'Salary TDS Deposited (Sec 192)',
          evidence_status: 'COORDINATE_VERIFIED',
          evidence_score: 1.0,
        },
      ],
      original_extracted_values: { form_16_original: 140000, form_26as_original: 125000, ais_original: 125000 },
      ca_corrections_applied: [
        {
          field_key: 'part_a.total_tax_deposited',
          original_value: 140000,
          corrected_value: 138000,
          corrected_by: 'CA Test Partner (CA_PARTNER)',
          correction_reason: 'Adjusted Surcharge component',
        },
      ],
    },
  ],
}

const RESOLVED_MATRIX = {
  ...UNRESOLVED_MATRIX,
  total_discrepancies: 0,
  high_risk_count: 0,
  all_reconciled: true,
  rows: [
    UNRESOLVED_MATRIX.rows[0],
    {
      ...UNRESOLVED_MATRIX.rows[1],
      is_resolved: true,
      resolved_value: 125000,
      resolved_by: 'CA Test Partner (CA_PARTNER)',
      resolved_at: '2026-11-25T16:30:00Z',
      ca_notes: 'Claiming portal-safe TRACES credit of ₹1,25,000 u/s 143(1)(a).',
      resolution_action: 'CLAIM_PORTAL_SAFE',
    },
  ],
}

const BACKEND_TAX_RESULT = {
  client_id: 'client-arun-01',
  case_id: 'case-arun-ay2526',
  client_pan: 'ABCPA1092F',
  client_name: 'Arun Kumar Verma',
  assessment_year: '2025-26',
  recommended_regime: 'NEW_REGIME_115BAC',
  tax_savings: 18500,
  ca_sign_off_status: 'PENDING_CA_REVIEW',
  data_source: 'VALIDATED_BACKEND_DOCUMENTS',
  validation_status: 'UNRESOLVED_DISCREPANCIES',
  validation_gate: {
    core_parsed_docs: 3,
    applied_corrections_count: 1,
    unresolved_discrepancies_count: 1,
    has_validated_data: true,
  },
  income_summary: {
    income_salaries: 1800000,
    income_house_property: 0,
    income_pgbp: 0,
    total_capital_gains: 0,
    total_other_sources: 0,
    gross_total_income: 1800000,
  },
  deductions_summary: {
    standard_deduction: 75000,
    sec_80c: 150000,
    sec_80d_health: 25000,
    sec_80ccd_1b_nps: 50000,
    sec_80tta_ttb_interest: 0,
  },
  new_regime: {
    regime: 'NEW_REGIME_115BAC',
    assessment_year: '2025-26',
    gross_total_income: 1800000,
    total_deductions: 75000,
    total_taxable_income: 1725000,
    basic_tax: 207500,
    rebate_87a: 0,
    tax_after_rebate: 207500,
    surcharge: 0,
    health_and_education_cess: 8300,
    total_tax_liability: 215800,
    tds_tcs_credit: 125000,
    advance_tax_paid: 0,
    total_prepaid_tax: 125000,
    net_tax_payable_or_refund: 90800,
    effective_tax_rate: 11.99,
    is_refund: false,
    refund_amount: 0,
    tax_due_amount: 90800,
  },
  old_regime: {
    regime: 'OLD_REGIME',
    assessment_year: '2025-26',
    gross_total_income: 1800000,
    total_deductions: 275000,
    total_taxable_income: 1525000,
    basic_tax: 270000,
    rebate_87a: 0,
    tax_after_rebate: 270000,
    surcharge: 0,
    health_and_education_cess: 10800,
    total_tax_liability: 280800,
    tds_tcs_credit: 125000,
    advance_tax_paid: 0,
    total_prepaid_tax: 125000,
    net_tax_payable_or_refund: 155800,
    effective_tax_rate: 15.6,
    is_refund: false,
    refund_amount: 0,
    tax_due_amount: 155800,
  },
}

describe('TaxReconciliationWorkflow Backend Integration', () => {
  beforeEach(() => {
    apiClient.clearSession()
    vi.restoreAllMocks()
  })

  it('consumes backend reconciliation & validated tax engine without mock fallback, resolves mismatch with citations & sign-off', async () => {
    const user = userEvent.setup()
    let isResolvedState = false
    let isSignedOffState = false

    apiClient.setSession({
      access_token: 'ca-partner-token',
      token_type: 'bearer',
      actor_id: 'staff-partner-01',
      actor_name: 'CA Test Partner',
      role: 'CA_PARTNER',
      assigned_client_ids: [],
      allowed_case_ids: [],
    })

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input)
      const method = (init?.method || 'GET').toUpperCase()

      if (url.endsWith('/api/clients')) {
        return new Response(JSON.stringify([MOCK_CLIENT]), { status: 200 })
      }
      if (url.includes('/api/documents/client/client-arun-01')) {
        return new Response(JSON.stringify(MOCK_DOCS), { status: 200 })
      }
      if (url.includes('/api/reconcile/client/client-arun-01/rows/row-tds-192') && method === 'PATCH') {
        isResolvedState = true
        return new Response(JSON.stringify(RESOLVED_MATRIX), { status: 200 })
      }
      if (url.includes('/api/reconcile/client/client-arun-01')) {
        return new Response(JSON.stringify(isResolvedState ? RESOLVED_MATRIX : UNRESOLVED_MATRIX), {
          status: 200,
        })
      }
      if (url.includes('/api/calculate/client/client-arun-01/sign-off') && method === 'POST') {
        isSignedOffState = true
        return new Response(
          JSON.stringify({
            status: 'APPROVED',
            verification_hash: 'sha256-verified-hash-01',
            approved_by: 'CA Test Partner (CA_PARTNER)',
            approved_at: '2026-11-25T16:31:00Z',
            message: 'Case approved cleanly.',
          }),
          { status: 200 }
        )
      }
      if (url.includes('/api/calculate/client/client-arun-01')) {
        return new Response(
          JSON.stringify({
            ...BACKEND_TAX_RESULT,
            validation_status: isResolvedState ? 'READY' : 'UNRESOLVED_DISCREPANCIES',
            ca_sign_off_status: isSignedOffState ? 'CA_APPROVED' : 'PENDING_CA_REVIEW',
            ca_approver: isSignedOffState ? 'CA Test Partner (CA_PARTNER)' : null,
            ca_approval_timestamp: isSignedOffState ? '2026-11-25T16:31:00Z' : null,
            verification_hash: isSignedOffState ? 'sha256-verified-hash-01' : null,
          }),
          { status: 200 }
        )
      }
      if (url.includes('/api/export/cbdt-json/')) {
        return new Response(JSON.stringify({ ITR: { ITR1: { FormName: 'ITR-1' } } }), { status: 200 })
      }

      return new Response(JSON.stringify({ detail: `Unhandled ${method} ${url}` }), { status: 404 })
    })

    render(
      <MemoryRouter>
        <AppProvider>
          <TaxReconciliationModule />
        </AppProvider>
      </MemoryRouter>
    )

    // Confirms backend data (₹1,38,000 F16 corrected vs ₹1,25,000 26AS & Orig ₹1,40,000 preserved & citation visible)
    await waitFor(() => {
      expect(screen.getByTestId('recon-row-row-tds-192')).toBeInTheDocument()
      expect(screen.getByText(/Orig: ₹1,40,000/i)).toBeInTheDocument()
      expect(screen.getByText(/Form26AS_Arun\.pdf • Pg 1/i)).toBeInTheDocument()
    })

    // Verifies zero PAN exposure in reconciliation/calculation API URLs
    const reconCalls = fetchMock.mock.calls.filter(([u]) => String(u).includes('/api/reconcile/client/'))
    expect(reconCalls.length).toBeGreaterThan(0)
    expect(String(reconCalls[0][0])).not.toContain('ABCPA1092F')

    // Resolves discrepancy via CA modal
    const tdsRow = screen.getByTestId('recon-row-row-tds-192')
    await user.click(within(tdsRow).getByRole('button', { name: /Review & Resolve/i }))
    expect(screen.getByText(/F16 Orig: ₹1,40,000/i)).toBeInTheDocument()

    await user.type(
      screen.getByLabelText(/Mandatory CA Audit Notes/i),
      'Claiming portal-safe TRACES credit of ₹1,25,000 u/s 143(1)(a).'
    )
    await user.click(screen.getByRole('button', { name: /Confirm & Record Resolution/i }))

    await waitFor(() => {
      expect(within(screen.getByTestId('recon-row-row-tds-192')).getByText(/CA Resolved ✓/i)).toBeInTheDocument()
    })

    // Optimizer tab reflects validated backend tax comparison (not hardcoded client values)
    await user.click(screen.getByRole('button', { name: /Deterministic Regime Optimizer/i }))
    await waitFor(() => {
      expect(screen.getByText(/Backend Deterministic Engine \(VALIDATED_BACKEND_DOCUMENTS\)/i)).toBeInTheDocument()
      expect(screen.getByText(/Gate: READY/i)).toBeInTheDocument()
      expect(screen.getByText(/₹2,15,800/)).toBeInTheDocument()
    })

    // CA Sign-off tab calls backend sign-off endpoint
    await user.click(screen.getByRole('button', { name: /CA Review, Checklist & Sign-Off/i }))
    await user.click(screen.getByRole('button', { name: /Approve & Record CA Sign-Off/i }))

    await waitFor(() => {
      expect(screen.getByText(/sha256-verified-hash-01/i)).toBeInTheDocument()
    })
  })

  it('displays 403 Forbidden inside resolution modal when non-CA client attempts resolution', async () => {
    const user = userEvent.setup()

    apiClient.setSession({
      access_token: 'client-token',
      token_type: 'bearer',
      actor_id: 'usr-client-arun-01',
      actor_name: 'Arun Kumar Verma',
      role: 'CLIENT',
      assigned_client_ids: ['client-arun-01'],
      allowed_case_ids: ['case-arun-ay2526'],
    })

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input)
      const method = (init?.method || 'GET').toUpperCase()
      if (url.endsWith('/api/clients')) return new Response(JSON.stringify([MOCK_CLIENT]), { status: 200 })
      if (url.includes('/api/documents/client/client-arun-01')) return new Response(JSON.stringify(MOCK_DOCS), { status: 200 })
      if (url.includes('/api/reconcile/client/client-arun-01/rows/row-tds-192') && method === 'PATCH') {
        return new Response(
          JSON.stringify({ detail: 'Forbidden: Only CA_PARTNER or CA_STAFF may resolve discrepancies.' }),
          { status: 403 }
        )
      }
      if (url.includes('/api/reconcile/client/client-arun-01')) return new Response(JSON.stringify(UNRESOLVED_MATRIX), { status: 200 })
      if (url.includes('/api/calculate/client/client-arun-01')) return new Response(JSON.stringify(BACKEND_TAX_RESULT), { status: 200 })
      return new Response('{}', { status: 404 })
    })

    render(
      <MemoryRouter>
        <AppProvider>
          <TaxReconciliationModule />
        </AppProvider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('recon-row-row-tds-192')).toBeInTheDocument()
    })

    const tdsRow = screen.getByTestId('recon-row-row-tds-192')
    await user.click(within(tdsRow).getByRole('button', { name: /Review & Resolve/i }))
    await user.type(screen.getByLabelText(/Mandatory CA Audit Notes/i), 'Unauthorized client attempt')
    await user.click(screen.getByRole('button', { name: /Confirm & Record Resolution/i }))

    await waitFor(() => {
      expect(screen.getAllByText(/Only CA_PARTNER or CA_STAFF may resolve discrepancies/i).length).toBeGreaterThan(0)
    })
  })

  it('keeps supporting category optional for simple salaried taxpayers and mandatory when triggered by discovery disclosures', () => {
    const simpleSalariedBreakdown = getClientDocumentBreakdown(
      { legalType: 'INDIVIDUAL', occupationProfile: 'SALARIED', intakeDiscovery: { salary: { hasIncome: 'YES' } } },
      [
        { id: '1', category: 'FORM_16' },
        { id: '2', category: 'FORM_26AS' },
        { id: '3', category: 'AIS' },
      ]
    )
    expect(simpleSalariedBreakdown.isComplete).toBe(true)
    expect(simpleSalariedBreakdown.missingMandatoryCategories).toHaveLength(0)

    const cgTriggeredBreakdown = getClientDocumentBreakdown(
      { legalType: 'INDIVIDUAL', occupationProfile: 'SALARIED', intakeDiscovery: { salary: { hasIncome: 'YES' }, capitalGains: { hasIncome: 'YES' } } },
      [
        { id: '1', category: 'FORM_16' },
        { id: '2', category: 'FORM_26AS' },
        { id: '3', category: 'AIS' },
      ]
    )
    expect(cgTriggeredBreakdown.isComplete).toBe(false)
    expect(cgTriggeredBreakdown.missingMandatoryCategories.some((c) => c.isSupportingCategory)).toBe(true)
  })
})
