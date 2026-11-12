// CA Bharat AI — Central Case Workflow Lifecycle & Status Model
// Single source of truth for taxpayer case states across all four modules

export const WORKFLOW_STAGES = {
  ONBOARDING: 'ONBOARDING',
  CONSENT_PENDING: 'CONSENT_PENDING',
  DOCUMENTS_PENDING: 'DOCUMENTS_PENDING',
  DOCUMENTS_UPLOADED: 'DOCUMENTS_UPLOADED',
  EXTRACTION_IN_PROGRESS: 'EXTRACTION_IN_PROGRESS',
  VALIDATION_REQUIRED: 'VALIDATION_REQUIRED',
  RECONCILIATION_PENDING: 'RECONCILIATION_PENDING',
  DISCREPANCIES_FOUND: 'DISCREPANCIES_FOUND',
  READY_FOR_CA_REVIEW: 'READY_FOR_CA_REVIEW',
  CA_APPROVED: 'CA_APPROVED',
  REPORT_GENERATED: 'REPORT_GENERATED',
}

export const WORKFLOW_STATUS_META = {
  [WORKFLOW_STAGES.ONBOARDING]: {
    id: WORKFLOW_STAGES.ONBOARDING,
    label: 'Onboarding',
    stepNumber: 1,
    badgeVariant: 'neutral',
    colorClasses: 'text-slate-700 bg-slate-100 border-slate-200',
    description: 'Taxpayer master profile setup and PAN category verification.',
    sidebarBadge: 'Onboarding',
    sidebarColor: 'text-slate-400',
  },
  [WORKFLOW_STAGES.CONSENT_PENDING]: {
    id: WORKFLOW_STAGES.CONSENT_PENDING,
    label: 'Consent Pending',
    stepNumber: 2,
    badgeVariant: 'warning',
    colorClasses: 'text-amber-800 bg-amber-50 border-amber-200',
    description: 'Awaiting DPDP digital client consent authorization.',
    sidebarBadge: 'Consent Pending',
    sidebarColor: 'text-amber-400',
  },
  [WORKFLOW_STAGES.DOCUMENTS_PENDING]: {
    id: WORKFLOW_STAGES.DOCUMENTS_PENDING,
    label: 'Documents Pending',
    stepNumber: 3,
    badgeVariant: 'warning',
    colorClasses: 'text-amber-800 bg-amber-50 border-amber-200',
    description: 'Incomplete intake: required statutory documents awaiting upload in Vault.',
    sidebarBadge: 'Docs Pending',
    sidebarColor: 'text-amber-400',
  },
  [WORKFLOW_STAGES.DOCUMENTS_UPLOADED]: {
    id: WORKFLOW_STAGES.DOCUMENTS_UPLOADED,
    label: 'Documents Uploaded',
    stepNumber: 4,
    badgeVariant: 'azure',
    colorClasses: 'text-blue-800 bg-blue-50 border-blue-200',
    description: 'All required documents in Vault; ready for AI OCR extraction.',
    sidebarBadge: 'Ready to Extract',
    sidebarColor: 'text-blue-400',
  },
  [WORKFLOW_STAGES.EXTRACTION_IN_PROGRESS]: {
    id: WORKFLOW_STAGES.EXTRACTION_IN_PROGRESS,
    label: 'Extraction in Progress',
    stepNumber: 5,
    badgeVariant: 'azure',
    colorClasses: 'text-indigo-800 bg-indigo-50 border-indigo-200',
    description: 'AI OCR pipeline actively parsing tables, bounding coordinates & schedules.',
    sidebarBadge: 'Extracting...',
    sidebarColor: 'text-indigo-400',
  },
  [WORKFLOW_STAGES.VALIDATION_REQUIRED]: {
    id: WORKFLOW_STAGES.VALIDATION_REQUIRED,
    label: 'Validation Required',
    stepNumber: 6,
    badgeVariant: 'warning',
    colorClasses: 'text-amber-800 bg-amber-50 border-amber-200',
    description: 'Extracted schedules and mandatory fields require CA validation review.',
    sidebarBadge: 'Validation Due',
    sidebarColor: 'text-amber-400',
  },
  [WORKFLOW_STAGES.RECONCILIATION_PENDING]: {
    id: WORKFLOW_STAGES.RECONCILIATION_PENDING,
    label: 'Reconciliation Pending',
    stepNumber: 7,
    badgeVariant: 'azure',
    colorClasses: 'text-blue-800 bg-blue-50 border-blue-200',
    description: 'Documents extracted; 3-way cross-audit matrix ready for review.',
    sidebarBadge: 'Reconciliation Due',
    sidebarColor: 'text-blue-400',
  },
  [WORKFLOW_STAGES.DISCREPANCIES_FOUND]: {
    id: WORKFLOW_STAGES.DISCREPANCIES_FOUND,
    label: 'Discrepancies Found',
    stepNumber: 8,
    badgeVariant: 'danger',
    colorClasses: 'text-rose-800 bg-rose-50 border-rose-200',
    description: 'Cross-document mismatches detected between Form 16, 26AS, and AIS.',
    sidebarBadge: 'Discrepancies',
    sidebarColor: 'text-rose-400',
  },
  [WORKFLOW_STAGES.READY_FOR_CA_REVIEW]: {
    id: WORKFLOW_STAGES.READY_FOR_CA_REVIEW,
    label: 'Ready for CA Review',
    stepNumber: 9,
    badgeVariant: 'gold',
    colorClasses: 'text-purple-800 bg-purple-50 border-purple-200',
    description: 'Reconciled; deterministic tax calculation ready for CA sign-off.',
    sidebarBadge: 'Ready for Review',
    sidebarColor: 'text-purple-400',
  },
  [WORKFLOW_STAGES.CA_APPROVED]: {
    id: WORKFLOW_STAGES.CA_APPROVED,
    label: 'CA Approved',
    stepNumber: 10,
    badgeVariant: 'success',
    colorClasses: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    description: 'Chartered Accountant simulated sign-off verified under ICAI standards.',
    sidebarBadge: 'CA Approved ✓',
    sidebarColor: 'text-emerald-400',
  },
  [WORKFLOW_STAGES.REPORT_GENERATED]: {
    id: WORKFLOW_STAGES.REPORT_GENERATED,
    label: 'Report Generated',
    stepNumber: 11,
    badgeVariant: 'success',
    colorClasses: 'text-emerald-900 bg-emerald-100 border-emerald-300',
    description: 'Filing pack JSON and 2-page Financial Eye-Opener report generated.',
    sidebarBadge: 'Report Generated ✓',
    sidebarColor: 'text-emerald-400',
  },
}

export const REQUIRED_DOCUMENT_CATEGORIES = [
  {
    category: 'Form 16',
    title: 'Form 16 (Part A & B)',
    description: 'Employer TDS certificate, salary breakup & Chapter VI-A deductions.',
    isMandatory: true,
  },
  {
    category: 'Form 26AS',
    title: 'TRACES Form 26AS',
    description: 'Annual Tax Credit Statement showing OLTAS tax deposits & dividend TDS.',
    isMandatory: true,
  },
  {
    category: 'AIS / TIS',
    title: 'AIS & TIS Statement',
    description: 'Annual Information Statement covering savings interest, capital gains & dividends.',
    isMandatory: true,
  },
  {
    category: 'Bank Statement / Certificate',
    title: 'Bank Statement / Certificate / P&L',
    description: 'Section 24(b) home loan certificate, 80D receipts, or clinic/professional P&L.',
    isMandatory: false,
  },
]

/**
 * Determine the exact workflow stage for any taxpayer client.
 */
export function getClientWorkflowStage(client, taxCase, clientDocs = [], isSimulating = false) {
  if (!client) return WORKFLOW_STAGES.ONBOARDING

  // 1. Onboarding check
  if (client.status === 'Onboarding' && (!client.pan || !client.email)) {
    return WORKFLOW_STAGES.ONBOARDING
  }

  // 2. Consent check
  if (client.consentStatus === 'Pending' || client.consentStatus === 'Pending Renewal') {
    return WORKFLOW_STAGES.CONSENT_PENDING
  }

  // 3. Document check
  const uploadedCount = clientDocs.length || client.docsUploaded || 0
  const requiredCount = client.docsRequired || 3

  if (uploadedCount < requiredCount) {
    return WORKFLOW_STAGES.DOCUMENTS_PENDING
  }

  // 4. Extraction check
  if (isSimulating) {
    return WORKFLOW_STAGES.EXTRACTION_IN_PROGRESS
  }

  const hasUnprocessed = clientDocs.some((d) => d.status === 'Uploaded' || d.status === 'Processing')
  if (hasUnprocessed) {
    return WORKFLOW_STAGES.DOCUMENTS_UPLOADED
  }

  // 5. CA Approval & Report check
  if (taxCase?.approval?.isApproved) {
    if (
      taxCase?.reportGenerated ||
      client?.reportGenerated ||
      taxCase?.status === 'Report Generated' ||
      client?.status === 'Report Generated' ||
      taxCase?.reportGeneratedAt ||
      taxCase?.workflowStage === 'REPORT_GENERATED'
    ) {
      return WORKFLOW_STAGES.REPORT_GENERATED
    }
    return WORKFLOW_STAGES.CA_APPROVED
  }

  // 6. Reconciliation check
  const reconciliationItems = taxCase?.reconciliationItems || []
  if (reconciliationItems.length === 0) {
    // If documents are uploaded but reconciliation not yet created
    return WORKFLOW_STAGES.RECONCILIATION_PENDING
  }

  const unacceptedDiscrepancies = reconciliationItems.filter(
    (item) => !item.isAccepted && (item.status === 'MISMATCH_UNREPORTED' || item.status === 'MISMATCH_FORM_UPGRADE' || item.status?.includes('MISMATCH'))
  )

  if (unacceptedDiscrepancies.length > 0 || (client.discrepancyCount && client.discrepancyCount > 0)) {
    return WORKFLOW_STAGES.DISCREPANCIES_FOUND
  }

  return WORKFLOW_STAGES.READY_FOR_CA_REVIEW
}

/**
 * Identify uploaded vs missing document categories for a client.
 */
export function getClientDocumentBreakdown(client, clientDocs = []) {
  const uploadedCategories = new Set(clientDocs.map((d) => d.category))
  
  const categoriesStatus = REQUIRED_DOCUMENT_CATEGORIES.map((cat) => {
    const isUploaded = uploadedCategories.has(cat.category)
    const matchingDocs = clientDocs.filter((d) => d.category === cat.category)
    return {
      ...cat,
      isUploaded,
      matchingDocs,
    }
  })

  const missingCategories = categoriesStatus.filter((c) => !c.isUploaded)
  const isComplete = missingCategories.filter((c) => c.isMandatory).length === 0

  return {
    categoriesStatus,
    missingCategories,
    isComplete,
    uploadedCount: clientDocs.length,
    requiredCount: client?.docsRequired || 4,
  }
}
