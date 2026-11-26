import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from '../../../../context/AppContext'
import TaxReconciliationModule from '../TaxReconciliationModule'
import WorkflowMainPage from '../../../workflow/WorkflowMainPage'
import { apiClient } from '../../../../services/apiClient'

vi.mock('canvas-confetti', () => ({ default: vi.fn() }))

const MOCK_CLIENT = {
  id: 'client-arun-01',
  name: 'Arun Kumar Verma',
  pan: 'ABCPA1092F',
  email: 'arun.verma@demo.in',
  phone: '+91 98200 12345',
  legal_type: 'INDIVIDUAL',
  occupation_profile: 'SALARIED',
  category: 'Individual - Salaried',
  residential_status: 'RESIDENT',
  assessment_year: '2025-26',
  itr_form_type: 'ITR-1 (Sahaj)',
  consent: { status: 'ACTIVE' },
}

const MOCK_ITR_SELECTION = {
  client_id: 'client-arun-01',
  client_pan: 'ABCPA1092F',
  recommended_form: 'ITR-1 (Sahaj)',
  form_code: 'ITR-1',
  taxpayer_type: 'INDIVIDUAL',
  selection_reason: 'Salaried resident individual with single house property, income up to ₹50 Lakhs, no capital gains, no foreign assets.',
  is_eligible: true,
  satisfied_conditions: [
    'Taxpayer is a Resident Individual (or HUF)',
    'Total Gross Income does not exceed statutory ceiling of ₹50,00,000',
    'Income sources limited to Salaries, One House Property, and Other Sources',
    'Zero capital gains transactions requiring Schedule CG (ITR-2)',
  ],
  ineligible_forms: [
    { form: 'ITR-2', reason: 'Disqualified: No capital gains or foreign assets requiring Schedule CG/FSI.' },
    { form: 'ITR-3', reason: 'Disqualified: No income from business or profession (PGBP) reported.' },
  ],
  missing_information_flags: [],
  requires_ca_confirmation: true,
  is_ca_confirmed: false,
}

const MOCK_TAX_COMPARISON = {
  client_id: 'client-arun-01',
  case_id: 'case-arun-ay2526',
  client_pan: 'ABCPA1092F',
  assessment_year: '2025-26',
  recommended_regime: 'NEW_REGIME_115BAC',
  tax_savings: 42100.0,
  regime_comparison_reason: 'New Tax Regime (Sec 115BAC) is optimal for AY 2025-26 — saves ₹42,100 over Old Regime due to lower tax slabs and enhanced ₹75,000 standard deduction.',
  missing_information_flags: [],
  selected_itr_form: 'ITR-1 (Sahaj)',
  data_source: 'VALIDATED_BACKEND_DOCUMENTS',
  validation_status: 'READY',
  validation_gate: {
    core_parsed_docs: 3,
    applied_corrections_count: 0,
    has_validated_data: true,
  },
  income_summary: {
    salary: 1450000.0,
    income_salaries: 1450000.0,
    savings_interest: 18450.0,
    dividend_income: 4200.0,
    other_sources: 22650.0,
    total_other_sources: 22650.0,
    gross_total_income: 1397650.0,
  },
  deductions_summary: {
    standard_deduction: 75000.0,
  },
  new_regime: {
    gross_total_income: 1397650.0,
    total_deductions: 75000.0,
    total_taxable_income: 1397650.0,
    basic_tax: 109930.0,
    rebate_87a: 0.0,
    health_and_education_cess: 4397.0,
    total_tax_liability: 114327.0,
    total_prepaid_tax: 128450.0,
    refund_amount: 14123.0,
    tax_due_amount: 0.0,
    tds_tcs_credit: 128450.0,
  },
  old_regime: {
    gross_total_income: 1422650.0,
    total_deductions: 200000.0,
    total_taxable_income: 1222650.0,
    basic_tax: 179325.0,
    rebate_87a: 0.0,
    health_and_education_cess: 7173.0,
    total_tax_liability: 186498.0,
    total_prepaid_tax: 128450.0,
    refund_amount: 0.0,
    tax_due_amount: 58048.0,
    tds_tcs_credit: 128450.0,
  },
  calculation_breakdown: {
    salary: { gross_salary: 1450000.0, standard_deduction_old: 50000.0, standard_deduction_new: 75000.0 },
    other_sources: { total: 22650.0 },
    gti_old: 1422650.0,
    gti_new: 1397650.0,
  },
  ca_sign_off_status: 'PENDING_CA_REVIEW',
  ca_review_status: 'PENDING_CA_REVIEW',
}

const MOCK_FILING_PACKAGE = {
  client_id: 'client-arun-01',
  client_pan: 'ABCPA1092F',
  client_name: 'Arun Kumar Verma',
  assessment_year: '2025-26',
  selected_itr_form: 'ITR-1 (Sahaj)',
  is_ca_approved: true,
  ca_approver: 'CA Rajesh Sharma (Partner)',
  approval_timestamp: '2026-11-26T12:00:00Z',
  verification_hash: '48ed6a56926cf7e610fb95df',
  filing_status: 'READY_FOR_FILING_DEMO',
  demo_disclaimer: 'Ready for Filing — Demo Only. This return has not been submitted to the Income Tax Department. Prototype demonstration for CA firm review.',
  schedules: {
    PartA_GEN: { PersonalInfo: { FirstName: 'Arun', PAN: 'ABCPA1092F' } },
    Schedule_S: { GrossSalary: 1450000.0, StandardDeductionSec16ia: 75000.0 },
    Schedule_OS: { SavingsBankInterest: 18450.0, DividendIncome: 4200.0 },
    PartB_TI: { GrossTotalIncome: 1397650.0, TotalIncomeTaxable: 1397650.0 },
    PartB_TTI: { TotalTaxLiability: 114327.0, RefundDue: 14123.0 },
  },
  itr_json_payload: { ITR: { FormName: 'ITR-1' } },
  validation_report: {
    is_valid: true,
    total_checks_run: 8,
    errors: [],
    warnings: [],
    validated_at: '2026-11-26T12:00:00Z',
  },
}

describe('ITR Selection & Filing Workflow', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    apiClient.clearSession()
    vi.restoreAllMocks()

    apiClient.setSession({
      access_token: 'test-ca-token',
      role: 'CA_PARTNER',
      actor_id: 'ca-partner-01',
      actor_name: 'CA Rajesh Sharma (Partner)',
    })

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input)
      if (url.endsWith('/api/clients')) {
        return new Response(JSON.stringify([MOCK_CLIENT]), { status: 200 })
      }
      if (url.includes('/api/documents/client/client-arun-01')) {
        return new Response(JSON.stringify([]), { status: 200 })
      }
      if (url.includes('/api/reconcile/client/client-arun-01')) {
        return new Response(JSON.stringify({ client_id: 'client-arun-01', rows: [], total_discrepancies: 0, validation_summary: { is_complete: true } }), { status: 200 })
      }
      if (url.includes('/api/calculate/client/client-arun-01')) {
        return new Response(JSON.stringify(MOCK_TAX_COMPARISON), { status: 200 })
      }
      if (url.includes('/api/itr/client/client-arun-01')) {
        return new Response(JSON.stringify(MOCK_ITR_SELECTION), { status: 200 })
      }
      if (url.includes('/api/filing/client/client-arun-01/package')) {
        return new Response(JSON.stringify(MOCK_FILING_PACKAGE), { status: 200 })
      }
      return new Response(JSON.stringify({}), { status: 200 })
    })
  })

  it('renders minimal landing page with visual workflow and two primary actions', () => {
    render(
      <MemoryRouter>
        <WorkflowMainPage />
      </MemoryRouter>
    )

    // Check product name and branding
    expect(screen.getAllByText(/CA Bharat/i).length).toBeGreaterThanOrEqual(1)

    // Check visual workflow stages are visible
    expect(screen.getByText(/Client Onboarding/i)).toBeInTheDocument()
    expect(screen.getByText(/Taxpayer & Income Details/i)).toBeInTheDocument()
    expect(screen.getByText(/Document Collection/i)).toBeInTheDocument()
    expect(screen.getByText(/Document Extraction & Validation/i)).toBeInTheDocument()
    expect(screen.getByText(/^Reconciliation$/i)).toBeInTheDocument()
    expect(screen.getByText(/ITR Selection & Tax Computation/i)).toBeInTheDocument()
    expect(screen.getByText(/CA Review & Approval/i)).toBeInTheDocument()
    expect(screen.getByText(/ITR Filing Preparation/i)).toBeInTheDocument()

    // Check two primary choices
    expect(screen.getByRole('button', { name: /Add New Customer/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Existing Customers/i })).toBeInTheDocument()
  })

  it('renders Deterministic ITR Selection tab with Rule 12 decision tree and satisfied conditions', async () => {
    const user = userEvent.setup()

    render(
      <AppProvider>
        <MemoryRouter>
          <TaxReconciliationModule />
        </MemoryRouter>
      </AppProvider>
    )

    // Wait for client to load
    await waitFor(() => {
      expect(screen.getByText(/Tax & 3-Way Reconciliation/i)).toBeInTheDocument()
    })

    // Click ITR Selection tab
    const itrTabBtn = screen.getByRole('button', { name: /Deterministic ITR Selection/i })
    await user.click(itrTabBtn)

    await waitFor(() => {
      expect(screen.getByText(/Rule 12 Deterministic Decision Tree/i)).toBeInTheDocument()
      expect(screen.getByText(/Satisfied Statutory Eligibility Conditions/i)).toBeInTheDocument()
      expect(screen.getByText(/Disqualified Return Forms Analysis/i)).toBeInTheDocument()
      expect(screen.getByText(/Confirm Form Selection/i)).toBeInTheDocument()
    })
  })

  it('renders head-wise calculation breakdown and statutory comparison in Optimizer tab', async () => {
    const user = userEvent.setup()

    render(
      <AppProvider>
        <MemoryRouter>
          <TaxReconciliationModule />
        </MemoryRouter>
      </AppProvider>
    )

    // Wait for client to load
    await waitFor(() => {
      expect(screen.getByText(/Tax & 3-Way Reconciliation/i)).toBeInTheDocument()
    })

    // Click Regime Optimizer tab
    const optTabBtn = screen.getByRole('button', { name: /Deterministic Regime Optimizer/i })
    await user.click(optTabBtn)

    await waitFor(() => {
      expect(screen.getByText(/Head-Wise Statutory Tax Computation Breakdown/i)).toBeInTheDocument()
      expect(screen.getByText(/Gross Salary \(Section 17\)/i)).toBeInTheDocument()
      expect(screen.getByText(/Standard Deduction \(Section 16\(ia\)\)/i)).toBeInTheDocument()
      expect(screen.getByText(/Gross Total Income \(GTI\)/i)).toBeInTheDocument()
      expect(screen.getByText(/Rebate under Section 87A/i)).toBeInTheDocument()
    })
  })

  it('opens Return for Correction modal with mandatory reason textarea', async () => {
    const user = userEvent.setup()

    render(
      <AppProvider>
        <MemoryRouter>
          <TaxReconciliationModule />
        </MemoryRouter>
      </AppProvider>
    )

    // Wait for client to load
    await waitFor(() => {
      expect(screen.getByText(/Tax & 3-Way Reconciliation/i)).toBeInTheDocument()
    })

    // Click CA Review tab
    const caTabBtn = screen.getByRole('button', { name: /CA Review, Checklist & Sign-Off/i })
    await user.click(caTabBtn)

    // Click Return for Correction
    const returnBtn = screen.getByRole('button', { name: /Return for Correction/i })
    await user.click(returnBtn)

    await waitFor(() => {
      expect(screen.getByText(/Return Tax Computation for Correction/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Mandatory Correction Reason & Review Remarks/i)).toBeInTheDocument()
    })
  })
})
