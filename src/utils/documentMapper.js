/**
 * Document & Client Payload Mapping Utilities
 * Bridges backend DocumentRecord / ClientProfile snake_case contracts
 * with the frontend React state while preserving immutable original values,
 * CA corrections, coordinate citations, and evidence methodology fields.
 */

export function normalizeDocumentCategory(category) {
  const raw = String(category || '').trim()
  const upper = raw.toUpperCase()
  if (upper === 'FORM_16' || upper === 'FORM 16' || upper.includes('FORM 16')) return 'Form 16'
  if (upper === 'FORM_26AS' || upper === 'FORM 26AS' || upper.includes('26AS')) return 'Form 26AS'
  if (upper === 'AIS' || upper === 'AIS_TIS' || upper === 'AIS / TIS' || upper.includes('AIS')) {
    return 'AIS / TIS'
  }
  if (
    upper === 'BANK_STATEMENT' ||
    upper === 'INVESTMENT_PROOF' ||
    upper === 'BUSINESS_RECORDS' ||
    upper === 'PROPERTY_DOCS' ||
    upper === 'CAPITAL_GAINS' ||
    upper.includes('BANK STATEMENT') ||
    upper === 'SUPPORTING SCHEDULE'
  ) {
    return 'Bank Statement / Certificate'
  }
  return raw
}

export function formatFileSize(bytes) {
  const num = Number(bytes)
  if (!Number.isFinite(num) || num <= 0) return '—'
  if (num < 1024) return `${num} B`
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`
  return `${(num / (1024 * 1024)).toFixed(2)} MB`
}

export function deriveLegacyDocStatus(processingStatus, caReviewStatus) {
  if (caReviewStatus === 'VERIFIED') return 'Verified'
  if (caReviewStatus === 'REJECTED') return 'Rejected'
  if (caReviewStatus === 'WAIVED') return 'Waived'
  if (processingStatus === 'PARSING_FAILED') return 'Parsing Failed'
  if (processingStatus === 'PARSED') return 'Processed'
  return 'Uploaded'
}

export function mapBackendCitationToUi(citation, fallbackDocName = '') {
  if (!citation || typeof citation !== 'object') return null
  const bbox = Array.isArray(citation.bounding_box)
    ? citation.bounding_box
    : Array.isArray(citation.bbox)
    ? citation.bbox
    : null
  const pageNum = citation.page_number ?? citation.page ?? 1
  const evidenceScore =
    typeof citation.evidence_score === 'number'
      ? citation.evidence_score
      : typeof citation.evidenceScore === 'number'
      ? citation.evidenceScore
      : null
  const evidenceStatus =
    citation.evidence_status || citation.evidenceStatus || 'UNVERIFIED'
  const fieldName = citation.field_name || citation.field || 'extracted_field'
  const rawText = citation.raw_text || citation.rawText || ''
  const documentName = citation.document_name || citation.documentName || fallbackDocName

  return {
    // Authoritative backend keys
    field_name: fieldName,
    page_number: pageNum,
    bounding_box: bbox,
    raw_text: rawText,
    evidence_score: evidenceScore,
    evidence_status: evidenceStatus,
    document_name: documentName,
    // Convenience UI keys (never includes legacy percentage confidence)
    field: fieldName,
    page: pageNum,
    bbox,
    rawText,
    evidenceScore,
    evidenceStatus,
    documentName,
  }
}

export function mapBackendDocumentToUi(doc) {
  if (!doc || typeof doc !== 'object') return doc

  const filename = doc.filename || doc.name || 'Document.pdf'
  const processingStatus = doc.processing_status || doc.processingStatus || 'UPLOADED'
  const caReviewStatus = doc.ca_review_status || doc.caReviewStatus || 'PENDING_REVIEW'
  const rawCitations = Array.isArray(doc.citations)
    ? doc.citations
    : Array.isArray(doc.boundingCitations)
    ? doc.boundingCitations
    : []
  const mappedCitations = rawCitations
    .map((c) => mapBackendCitationToUi(c, filename))
    .filter(Boolean)

  const extractionSupported =
    typeof doc.extraction_supported === 'boolean'
      ? doc.extraction_supported
      : Boolean(doc.extractionSupported)

  const extractionEngine =
    doc.extraction_engine ||
    doc.extractionEngine ||
    (extractionSupported ? 'DETERMINISTIC_PDF' : 'UNSUPPORTED_TYPE')

  const evidenceScore =
    typeof doc.evidence_score === 'number'
      ? doc.evidence_score
      : typeof doc.evidenceScore === 'number'
      ? doc.evidenceScore
      : null

  return {
    id: doc.id,
    clientId: doc.client_id || doc.clientId,
    clientPan: doc.client_pan || doc.clientPan || '',
    caseId: doc.case_id || doc.caseId || '',
    assessmentYear: doc.assessment_year || doc.assessmentYear || 'AY 2025-26',
    name: filename,
    filename,
    category: doc.category || 'Tax Document',
    rawCategory: doc.category || 'Tax Document',
    pageCount: doc.page_count ?? doc.pageCount ?? 1,
    processingStatus,
    caReviewStatus,
    status: deriveLegacyDocStatus(processingStatus, caReviewStatus),
    checklistItemIds: Array.isArray(doc.checklist_item_ids)
      ? doc.checklist_item_ids
      : Array.isArray(doc.checklistItemIds)
      ? doc.checklistItemIds
      : [],
    fileSizeBytes: doc.file_size_bytes ?? doc.fileSizeBytes ?? 0,
    fileSize: doc.fileSize || formatFileSize(doc.file_size_bytes ?? doc.fileSizeBytes ?? 0),
    fileHashSha256: doc.file_hash_sha256 || doc.fileHashSha256 || '',
    fileType: doc.file_type || doc.fileType || 'application/pdf',
    storagePath: doc.storage_path || doc.storagePath || '',
    reviewNotes: doc.review_notes ?? doc.reviewNotes ?? null,
    waiveReason: doc.waive_reason ?? doc.waiveReason ?? null,
    uploadDate: doc.uploaded_at || doc.uploadDate || new Date().toISOString(),
    uploadedAt: doc.uploaded_at || doc.uploadedAt || new Date().toISOString(),
    extractionSupported,
    extractionEngine,
    evidenceScore,
    evidenceMethodology:
      doc.evidence_methodology || doc.evidenceMethodology || null,
    citationsCount: doc.citations_count ?? mappedCitations.length,
    extractedData: doc.extracted_data || doc.extractedData || {},
    citations: mappedCitations,
    boundingCitations: mappedCitations,
    correctedFields: doc.corrected_fields || doc.correctedFields || {},
    isBackendSynced: true,
  }
}

export function resolveBackendCaseId(clientId, assessmentYear = 'AY 2025-26') {
  if (clientId === 'client-arun-01') return 'case-arun-ay2526'
  if (clientId === 'client-radhika-02') return 'case-radhika-ay2526'
  const aySuffix = String(assessmentYear || 'AY 2025-26')
    .replace(/[^0-9]/g, '')
    .slice(0, 4) || '2526'
  return `case-${clientId}-ay${aySuffix}`
}

export function mergeBackendClientsAndCases({
  backendClients = [],
  localClients = [],
  localTaxCases = [],
  defaultIntakeDiscovery,
  generateChecklist,
  computeItr,
}) {
  const idRemap = {}
  const mergedClients = [...localClients]
  const mergedTaxCases = [...localTaxCases]

  for (const bClient of backendClients) {
    const panUpper = (bClient.pan || '').toUpperCase()
    const matchIdx = mergedClients.findIndex(
      (c) => c.id === bClient.id || (panUpper && (c.pan || '').toUpperCase() === panUpper)
    )

    const existing = matchIdx >= 0 ? mergedClients[matchIdx] : null
    if (existing && existing.id !== bClient.id) {
      idRemap[existing.id] = bClient.id
    }

    const legalType = bClient.legal_type || existing?.legalType || 'INDIVIDUAL'
    const occupationProfile = bClient.occupation_profile || existing?.occupationProfile || null
    const intakeDiscovery =
      (bClient.intake_discovery && Object.keys(bClient.intake_discovery).length > 0
        ? bClient.intake_discovery
        : existing?.intakeDiscovery) || defaultIntakeDiscovery

    const mergedRecord = {
      ...(existing || {}),
      id: bClient.id,
      name: bClient.name || existing?.name || 'Taxpayer',
      pan: panUpper || existing?.pan || '',
      email: bClient.email || existing?.email || '',
      phone: bClient.phone || existing?.phone || '',
      legalType,
      occupationProfile,
      category: bClient.category || existing?.category || legalType,
      residentialStatus: bClient.residential_status || existing?.residentialStatus || 'RESIDENT',
      activeAY: bClient.assessment_year ? `AY ${bClient.assessment_year.replace(/^AY\s*/i, '')}` : existing?.activeAY || 'AY 2025-26',
      itrType: bClient.itr_form_type || existing?.itrType || computeItr(legalType, occupationProfile, intakeDiscovery),
      consentStatus: bClient.consent?.status === 'ACTIVE' ? 'Verified' : existing?.consentStatus || 'Verified',
      intakeDiscovery,
      dynamicChecklist:
        existing?.dynamicChecklist ||
        generateChecklist({ name: bClient.name, legalType, occupationProfile }, intakeDiscovery),
      isBackendSynced: true,
    }

    if (matchIdx >= 0) {
      mergedClients[matchIdx] = mergedRecord
    } else {
      mergedClients.push(mergedRecord)
    }

    const targetCaseId = resolveBackendCaseId(bClient.id, mergedRecord.activeAY)
    const caseIdx = mergedTaxCases.findIndex(
      (tc) =>
        tc.clientId === bClient.id ||
        (existing?.id && tc.clientId === existing.id) ||
        (panUpper && (tc.pan || '').toUpperCase() === panUpper)
    )
    if (caseIdx >= 0) {
      mergedTaxCases[caseIdx] = {
        ...mergedTaxCases[caseIdx],
        clientId: bClient.id,
        caseId: mergedTaxCases[caseIdx].caseId?.startsWith('case-')
          ? mergedTaxCases[caseIdx].caseId
          : targetCaseId,
        pan: panUpper || mergedTaxCases[caseIdx].pan,
      }
    } else {
      mergedTaxCases.push({
        caseId: targetCaseId,
        clientId: bClient.id,
        clientName: mergedRecord.name,
        pan: mergedRecord.pan,
        assessmentYear: mergedRecord.activeAY,
        financialYear: mergedRecord.activeAY === 'AY 2025-26' ? 'FY 2024-25' : 'FY 2023-24',
        filingForm: mergedRecord.itrType,
        status: 'In Progress',
        incomes: {
          salary: 0,
          houseProperty: 0,
          businessProfession: 0,
          capitalGainsSTCG: 0,
          capitalGainsLTCG: 0,
          otherSources: 0,
        },
        deductions: {
          sec80C: 0,
          sec80D: 0,
          sec80CCD1B: 0,
          sec24b: 0,
          sec80TTA: 0,
        },
        taxesPaid: {
          totalTds: 0,
          advanceTax: 0,
          selfAssessmentTax: 0,
        },
        reconciliationItems: [],
        reconciliationMatrix: [],
        approval: {
          isApproved: false,
        },
      })
    }
  }

  return { mergedClients, mergedTaxCases, idRemap }
}

function deriveUiReconStatus(row) {
  const rawMatch = row.match_status || 'MATCHED'
  if (row.is_resolved && rawMatch === 'MATCHED') return 'MATCHED'
  if (row.is_resolved) return 'MATCHED_RESOLVED'
  if (rawMatch === 'AIS_UNRECORDED_INCOME') return 'MISMATCH_AIS_UNRECORDED'
  return 'MISMATCH_VARIANCE'
}

export function mapBackendReconciliationToUi(matrix) {
  if (!matrix || typeof matrix !== 'object') return null

  const mappedRows = (Array.isArray(matrix.rows) ? matrix.rows : []).map((row) => {
    const riskRaw = String(row.notice_risk || 'LOW').toUpperCase()
    const riskLabel = riskRaw === 'HIGH' ? 'High' : riskRaw === 'MEDIUM' ? 'Medium' : 'Low'
    const cits = Array.isArray(row.source_citations)
      ? row.source_citations.map((c) => mapBackendCitationToUi(c))
      : []

    return {
      id: row.id,
      category: row.category || 'Statutory Cross-Check',
      item: row.field_label || row.id,
      fieldLabel: row.field_label || row.id,
      form16: row.form_16_value ?? null,
      form26AS: row.form_26as_value ?? null,
      aisTis: row.ais_value ?? null,
      variance: Number(row.variance || 0),
      matchStatus: row.match_status || 'MATCHED',
      status: deriveUiReconStatus(row),
      riskLevel: riskLabel,
      noticeRiskRaw: riskRaw,
      noticeRisk: row.explanation || '',
      statutoryRule: row.statutory_rule || '',
      recommendedAction: row.recommended_action || 'NO_ACTION',
      resolutionAction: row.resolution_action || row.recommended_action || null,
      isResolved: Boolean(row.is_resolved),
      isAccepted: Boolean(row.is_resolved),
      resolvedValue: Number(row.resolved_value || 0),
      caNotes: row.ca_notes || null,
      resolvedBy: row.resolved_by || null,
      resolvedAt: row.resolved_at || null,
      sourceCitations: cits,
      sourceCitation:
        cits.length > 0
          ? `${cits[0].document_name || 'PDF'} (Page ${cits[0].page_number})`
          : null,
      originalExtractedValues: row.original_extracted_values || {},
      caCorrectionsApplied: Array.isArray(row.ca_corrections_applied)
        ? row.ca_corrections_applied
        : [],
      sourceDocIds: Array.isArray(row.source_doc_ids) ? row.source_doc_ids : [],
    }
  })

  return {
    clientId: matrix.client_id || null,
    caseId: matrix.case_id || null,
    clientPan: matrix.client_pan || '',
    clientName: matrix.client_name || '',
    assessmentYear: matrix.assessment_year || '2025-26',
    rows: mappedRows,
    totalItems: matrix.total_items ?? mappedRows.length,
    totalDiscrepancies: matrix.total_discrepancies ?? mappedRows.filter((r) => !r.isResolved).length,
    highRiskCount: matrix.high_risk_count ?? 0,
    allReconciled: Boolean(matrix.all_reconciled),
    reconciledAt: matrix.reconciled_at || null,
    caReviewerName: matrix.ca_reviewer_name || null,
    dataSource: matrix.data_source || 'BACKEND_EXTRACTED_DOCS',
    sourceDocuments: Array.isArray(matrix.source_documents) ? matrix.source_documents : [],
    validationSummary: matrix.validation_summary || {},
  }
}

export function mapBackendTaxComparisonToUi(comp) {
  if (!comp || typeof comp !== 'object' || !comp.new_regime || !comp.old_regime) return null

  const newR = comp.new_regime
  const oldR = comp.old_regime
  const ded = comp.deductions_summary || {}
  const inc = comp.income_summary || {}

  const recEnum = String(comp.recommended_regime || 'NEW_REGIME_115BAC')
  const recommendedLabel =
    recEnum.includes('OLD') ? 'Old Regime' : 'New Regime'
  const chosenResult = recommendedLabel === 'Old Regime' ? oldR : newR
  const taxSaved = Number(comp.tax_savings || 0)
  const totalPrepaid = Number(chosenResult.total_prepaid_tax || 0)
  const tdsPaid = Number(chosenResult.tds_tcs_credit || 0)
  const advanceTaxPaid = Number(chosenResult.advance_tax_paid || 0)

  const recommendationReason =
    recommendedLabel === 'New Regime'
      ? `New Tax Regime (Sec 115BAC) is optimal — saves ₹${Math.round(taxSaved).toLocaleString('en-IN')} over Old Regime.`
      : `Old Tax Regime is optimal — Chapter VI-A deductions save ₹${Math.round(taxSaved).toLocaleString('en-IN')} over New Regime.`

  return {
    clientId: comp.client_id || null,
    caseId: comp.case_id || null,
    clientPan: comp.client_pan || '',
    assessmentYear: comp.assessment_year || '2025-26',
    recommendedRegime: recommendedLabel,
    recommendedRegimeEnum: recEnum,
    taxSaved,
    recommendationReason,
    tdsPaid,
    advanceTaxPaid,
    totalPrepaidTax: totalPrepaid,
    activeTaxLiability: Number(chosenResult.total_tax_liability || 0),
    refundAmount: Number(chosenResult.refund_amount || 0),
    taxDueAmount: Number(chosenResult.tax_due_amount || 0),
    dataSource: comp.data_source || 'VALIDATED_BACKEND_DOCUMENTS',
    validationStatus: comp.validation_status || 'READY',
    validationGate: comp.validation_gate || {},
    incomeSummary: {
      salary: Number(inc.income_salaries || 0),
      houseProperty: Number(inc.income_house_property || 0),
      pgbp: Number(inc.income_pgbp || 0),
      capitalGains: Number(inc.total_capital_gains || 0),
      otherSources: Number(inc.total_other_sources || 0),
      grossTotalIncome: Number(inc.gross_total_income || 0),
    },
    deductionsSummary: ded,
    caSignOffStatus: comp.ca_sign_off_status || 'PENDING_CA_REVIEW',
    caApprover: comp.ca_approver || null,
    caApprovalTimestamp: comp.ca_approval_timestamp || null,
    verificationHash: comp.verification_hash || null,
    caNotes: comp.ca_notes || null,
    oldRegime: {
      regime: 'Old Regime',
      grossTotalIncome: Number(oldR.gross_total_income || 0),
      standardDeduction: Number(ded.standard_deduction ?? (inc.income_salaries > 0 ? 50000 : 0)),
      deductionsBreakdown: {
        standardDeduction: Number(ded.standard_deduction ?? (inc.income_salaries > 0 ? 50000 : 0)),
        sec80C: Number(ded.sec_80c || 0),
        sec80D: Number(ded.sec_80d_health || 0),
        sec80CCD1B: Number(ded.sec_80ccd_1b_nps || 0),
        sec24b: 0,
        sec80TTA: Number(ded.sec_80tta_ttb_interest || 0),
      },
      totalDeductions: Number(oldR.total_deductions || 0),
      netTaxableIncome: Number(oldR.total_taxable_income || 0),
      baseTax: Number(oldR.basic_tax || 0),
      rebate87A: Number(oldR.rebate_87a || 0),
      surcharge: Number(oldR.surcharge || 0),
      cess: Number(oldR.health_and_education_cess || 0),
      totalTaxLiability: Number(oldR.total_tax_liability || 0),
      refundAmount: Number(oldR.refund_amount || 0),
      taxDueAmount: Number(oldR.tax_due_amount || 0),
    },
    newRegime: {
      regime: 'New Regime (Default)',
      grossTotalIncome: Number(newR.gross_total_income || 0),
      standardDeduction: Number(newR.total_deductions || 0),
      deductionsBreakdown: {
        standardDeduction: Number(newR.total_deductions || 0),
      },
      totalDeductions: Number(newR.total_deductions || 0),
      netTaxableIncome: Number(newR.total_taxable_income || 0),
      baseTax: Number(newR.basic_tax || 0),
      rebate87A: Number(newR.rebate_87a || 0),
      surcharge: Number(newR.surcharge || 0),
      cess: Number(newR.health_and_education_cess || 0),
      totalTaxLiability: Number(newR.total_tax_liability || 0),
      refundAmount: Number(newR.refund_amount || 0),
      taxDueAmount: Number(newR.tax_due_amount || 0),
    },
  }
}
