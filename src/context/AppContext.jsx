import React, { createContext, useContext, useState, useEffect } from 'react'
import { INITIAL_CLIENTS, SAMPLE_STATUTORY_CLIENTS } from '../data/mockClients'
import { INITIAL_DOCUMENTS, SAMPLE_STATUTORY_DOCUMENTS } from '../data/mockDocuments'
import { INITIAL_TAX_CASES, SAMPLE_STATUTORY_TAX_CASES } from '../data/mockTaxCases'
import { INITIAL_CONSENTS, SAMPLE_STATUTORY_CONSENTS } from '../data/mockConsents'
import { INITIAL_TEAM, FIRM_DETAILS } from '../data/mockTeam'
import { INITIAL_AUDIT_LOGS } from '../data/mockAuditLogs'
import { INITIAL_NOTIFICATIONS } from '../data/mockNotifications'
import { loadFromStorage, saveToStorage, STORAGE_KEYS, clearDemoStorage } from '../utils/storage'
import {
  getClientWorkflowStage,
  WORKFLOW_STATUS_META,
  getClientDocumentBreakdown,
  WORKFLOW_STAGES,
} from '../utils/workflowHelper'
import {
  getCategoryDetails,
  getRecommendedItr,
  getExpectedPan4thChar,
  validatePanStructure,
  computeRecommendedItr,
  LEGAL_TAXPAYER_ENTITIES,
  INDIVIDUAL_OCCUPATION_PROFILES,
} from '../data/statutoryTaxpayerTypes'
import { DEFAULT_INTAKE_DISCOVERY, generateDynamicChecklist } from '../data/intakeSchema'
import apiClient, { ApiError } from '../services/apiClient'
import {
  mapBackendDocumentToUi,
  mapBackendReconciliationToUi,
  mapBackendTaxComparisonToUi,
  mergeBackendClientsAndCases,
  resolveBackendCaseId,
} from '../utils/documentMapper'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  // State with LocalStorage persistence
  const [clients, setClients] = useState(() => loadFromStorage(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS))
  const [documents, setDocuments] = useState(() => loadFromStorage(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS))
  const [taxCases, setTaxCases] = useState(() => loadFromStorage(STORAGE_KEYS.TAX_CASES, INITIAL_TAX_CASES))
  const [consents, setConsents] = useState(() => loadFromStorage(STORAGE_KEYS.CONSENTS, INITIAL_CONSENTS))
  const [team, setTeam] = useState(() => loadFromStorage(STORAGE_KEYS.TEAM, INITIAL_TEAM))
  const [auditLogs, setAuditLogs] = useState(() => {
    const raw = loadFromStorage(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS)
    const seen = new Set()
    return raw.map((log, index) => {
      let id = log.id
      if (seen.has(id) || !id) {
        id = `log-${index}-${Date.now()}`
      }
      seen.add(id)
      return { ...log, id }
    })
  })
  const [notifications, setNotifications] = useState(() => loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS))

  const [activeAy, setActiveAy] = useState(() => loadFromStorage(STORAGE_KEYS.ACTIVE_AY, 'AY 2025-26'))
  const [activeClientId, setActiveClientId] = useState(() => loadFromStorage(STORAGE_KEYS.ACTIVE_CLIENT_ID, ''))
  const [globalSearch, setGlobalSearch] = useState('')
  const [isSimulatingExtraction, setIsSimulatingExtraction] = useState(false)
  const [authSession, setAuthSession] = useState(() => apiClient.getSession())
  const [authError, setAuthError] = useState(null)
  const [isSyncingBackend, setIsSyncingBackend] = useState(false)
  const [extractionError, setExtractionError] = useState(null)
  const [backendReconciliation, setBackendReconciliation] = useState(null)
  const [backendTaxComparison, setBackendTaxComparison] = useState(null)
  const [isLoadingReconciliation, setIsLoadingReconciliation] = useState(false)
  const [reconciliationError, setReconciliationError] = useState(null)
  const [isComputingTax, setIsComputingTax] = useState(false)
  const [taxError, setTaxError] = useState(null)

  // Sync to storage on updates
  useEffect(() => { saveToStorage(STORAGE_KEYS.CLIENTS, clients) }, [clients])
  useEffect(() => { saveToStorage(STORAGE_KEYS.DOCUMENTS, documents) }, [documents])
  useEffect(() => { saveToStorage(STORAGE_KEYS.TAX_CASES, taxCases) }, [taxCases])
  useEffect(() => { saveToStorage(STORAGE_KEYS.CONSENTS, consents) }, [consents])
  useEffect(() => { saveToStorage(STORAGE_KEYS.TEAM, team) }, [team])
  useEffect(() => { saveToStorage(STORAGE_KEYS.AUDIT_LOGS, auditLogs) }, [auditLogs])
  useEffect(() => { saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications) }, [notifications])
  useEffect(() => { saveToStorage(STORAGE_KEYS.ACTIVE_AY, activeAy) }, [activeAy])
  useEffect(() => { saveToStorage(STORAGE_KEYS.ACTIVE_CLIENT_ID, activeClientId) }, [activeClientId])

  // Computed active client & tax case
  const activeClient = clients.find((c) => c.id === activeClientId) || (clients.length > 0 ? clients[0] : null)
  const activeTaxCase = activeClient ? (taxCases.find((tc) => tc.clientId === activeClient.id) || null) : null
  const activeClientDocs = activeClient ? documents.filter((d) => d.clientId === activeClient.id) : []

  // Ensure activeClientId stays in sync if active client is auto-selected
  useEffect(() => {
    if (clients.length > 0 && (!activeClientId || !clients.some((c) => c.id === activeClientId))) {
      setActiveClientId(clients[0].id)
    } else if (clients.length === 0 && activeClientId) {
      setActiveClientId('')
    }
  }, [clients, activeClientId])

  // Dynamic Case Workflow Stage for Active Client
  const activeWorkflowStage = activeClient
    ? getClientWorkflowStage(activeClient, activeTaxCase, activeClientDocs, isSimulatingExtraction)
    : WORKFLOW_STAGES.ONBOARDING
  const activeWorkflowMeta = WORKFLOW_STATUS_META[activeWorkflowStage] || WORKFLOW_STATUS_META[WORKFLOW_STAGES.ONBOARDING]
  const activeDocBreakdown = activeClient
    ? getClientDocumentBreakdown(activeClient, activeClientDocs)
    : { totalRequired: 0, uploadedCount: 0, isComplete: false, missingCategories: [] }

  // Helper to query stage for any client
  const getWorkflowStageForClient = (client) => {
    if (!client) return WORKFLOW_STAGES.ONBOARDING
    const clientDocs = documents.filter((d) => d.clientId === client.id)
    const matchingCase = taxCases.find((tc) => tc.clientId === client.id)
    return getClientWorkflowStage(client, matchingCase, clientDocs, false)
  }

  // Add audit log helper
  const addAuditLog = (action, details, clientName = activeClient?.name, pan = activeClient?.pan, category = 'General') => {
    const newLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      actor: authSession?.actor_name
        ? `${authSession.actor_name} (${authSession.role})`
        : 'CA Rajesh Sharma (Demo Partner)',
      action,
      clientName: clientName || 'System',
      pan: pan || '—',
      details,
      ipAddress: authSession?.access_token ? 'Authenticated Session Token' : 'Local Prototype Session',
      category,
    }
    setAuditLogs((prev) => [newLog, ...prev])
  }

  // Client Actions
  const addClient = (clientData) => {
    const legalType = clientData.legalType || 'INDIVIDUAL'
    const occupationProfile = clientData.occupationProfile || 'SALARIED'
    const intakeDiscovery = clientData.intakeDiscovery || DEFAULT_INTAKE_DISCOVERY
    const recommendedItr = computeRecommendedItr(legalType, occupationProfile, intakeDiscovery)
    const categoryDetails = getCategoryDetails(clientData.category || legalType)
    
    // Generate dynamic document checklist
    const initialChecklist = generateDynamicChecklist({ ...clientData, legalType, occupationProfile }, intakeDiscovery)
    const mandatoryCount = initialChecklist.filter((c) => c.mandatory).length

    const newId = `cli-${String(clients.length + 1).padStart(3, '0')}`
    const newClient = {
      id: newId,
      status: 'Consent Pending',
      tier: clientData.tier || 'Gold',
      activeAY: activeAy,
      consentStatus: 'Pending',
      docsUploaded: 0,
      docsRequired: mandatoryCount || 4,
      refundExpected: 0,
      discrepancyCount: 0,
      legalType,
      occupationProfile: legalType === 'INDIVIDUAL' ? occupationProfile : null,
      residentialStatus: clientData.residentialStatus || 'RESIDENT',
      dobOrDoi: clientData.dobOrDoi || '',
      category: clientData.category || (legalType === 'INDIVIDUAL' ? `Individual - ${occupationProfile}` : legalType),
      itrType: recommendedItr,
      assignedTo: clientData.assignedStaff || 'Ananya Joshi (Senior Associate)',
      assignedPartner: clientData.assignedPartner || 'CA Rajesh Sharma (Partner)',
      requestedService: clientData.requestedService || 'REGULAR_ITR',
      isExistingClient: clientData.isExistingClient || false,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      intakeDiscovery,
      dynamicChecklist: initialChecklist,
      ...clientData,
    }

    // Also create initial blank tax case
    const newCase = {
      caseId: `CASE-2025-${String(taxCases.length + 1).padStart(3, '0')}`,
      clientId: newId,
      clientName: newClient.name,
      pan: newClient.pan,
      assessmentYear: activeAy,
      financialYear: activeAy === 'AY 2025-26' ? 'FY 2024-25' : 'FY 2023-24',
      filingForm: recommendedItr,
      status: 'Consent Pending',
      assignedCa: newClient.assignedPartner,
      reviewerNotes: `New taxpayer onboarding for ${newClient.category} (${legalType}). Initial recommended return: ${recommendedItr}.`,
      checklist: {
        panIdentityVerified: true,
        form16Reconciled: false,
        bankAccountValidated: false,
        consentLogged: false,
        discrepanciesResolved: false,
      },
      incomes: {
        salary: intakeDiscovery.salary?.hasIncome === 'YES' ? (intakeDiscovery.salary.employers?.[0]?.grossSalary || 0) : 0,
        houseProperty: intakeDiscovery.houseProperty?.hasIncome === 'YES' ? (intakeDiscovery.houseProperty.properties?.[0]?.annualRentReceived || 0) : 0,
        capitalGainsLTCG: intakeDiscovery.capitalGains?.hasIncome === 'YES' ? (intakeDiscovery.capitalGains.summary?.equityLtcg112A || 0) : 0,
        capitalGainsSTCG: intakeDiscovery.capitalGains?.hasIncome === 'YES' ? (intakeDiscovery.capitalGains.summary?.equityStcg111A || 0) : 0,
        otherSources: intakeDiscovery.otherSources?.hasIncome === 'YES' ? ((intakeDiscovery.otherSources.estimatedSavingsInterest || 0) + (intakeDiscovery.otherSources.estimatedDividends || 0)) : 0,
      },
      deductions: {
        sec80C: intakeDiscovery.deductions?.claimed80C || 0,
        sec80D: intakeDiscovery.deductions?.claimed80DHealth || 0,
        sec80CCD1B: intakeDiscovery.deductions?.claimed80CCD1B_NPS || 0,
        sec24b: 0,
        sec80TTA: 0,
      },
      taxesPaid: {
        tdsSalary: intakeDiscovery.salary?.employers?.[0]?.tdsDeducted || 0,
        tdsDividend: 0,
        advanceTax: 0,
        selfAssessmentTax: 0,
        totalTds: intakeDiscovery.salary?.employers?.[0]?.tdsDeducted || 0,
      },
      reconciliationMatrix: [],
      caApproval: {
        isApproved: false,
        approvedBy: null,
        approvedAt: null,
        verificationChecklist: {
          panIdentityConfirmed: true,
          traces26asVerified: false,
          aisSftReconciled: false,
          bankValidated: false,
          deductionReceiptsAudited: false,
        },
      },
    }

    // Also create initial consent record
    const newConsent = {
      id: `cns-${Date.now()}`,
      clientId: newId,
      clientName: newClient.name,
      pan: newClient.pan,
      assessmentYear: activeAy,
      scope: `${newClient.category} Tax Return Filing & Statutory Verification`,
      status: 'PENDING',
      ipAddress: 'Awaiting Client Digital Signature',
      userAgent: '—',
      timestamp: new Date().toISOString(),
      sessionIdHash: `cns-token-${newId}`,
      legalDeclaration: `Pending DPDP consent authorization for Sharma & Co. Chartered Accountants to process tax records for ${newClient.name} (${newClient.pan}).`,
      validUntil: '2027-03-31T23:59:59Z',
    }

    setClients((prev) => [newClient, ...prev])
    setTaxCases((prev) => [newCase, ...prev])
    setConsents((prev) => [newConsent, ...prev])
    setActiveClientId(newId)
    addAuditLog(
      'CLIENT_CREATED',
      `New taxpayer profile ${newClient.name} (${newClient.pan}) onboarded as ${legalType} (${newClient.category}) with recommended ${recommendedItr}.`,
      newClient.name,
      newClient.pan,
      'Intake'
    )
    return newId
  }

  // Update client intake questionnaire discovery answers & recalculate checklist
  const updateClientIntake = (clientId, intakeDiscovery) => {
    let updatedPan = ''
    let updatedName = ''
    let recommendedItr = 'ITR-1 (Sahaj)'

    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          updatedPan = c.pan
          updatedName = c.name
          recommendedItr = computeRecommendedItr(c.legalType || 'INDIVIDUAL', c.occupationProfile, intakeDiscovery)
          const newChecklist = generateDynamicChecklist(c, intakeDiscovery)
          const mandatoryCount = newChecklist.filter((item) => item.mandatory && item.status !== 'WAIVED').length
          return {
            ...c,
            intakeDiscovery,
            itrType: recommendedItr,
            dynamicChecklist: newChecklist,
            docsRequired: mandatoryCount,
          }
        }
        return c
      })
    )

    // Also update corresponding tax case with any updated figures
    setTaxCases((prev) =>
      prev.map((tc) => {
        if (tc.clientId === clientId) {
          return {
            ...tc,
            filingForm: recommendedItr,
            incomes: {
              ...tc.incomes,
              salary: intakeDiscovery.salary?.hasIncome === 'YES' ? (intakeDiscovery.salary.employers?.reduce((sum, e) => sum + (Number(e.grossSalary) || 0), 0) || 0) : 0,
              houseProperty: intakeDiscovery.houseProperty?.hasIncome === 'YES' ? (intakeDiscovery.houseProperty.properties?.reduce((sum, p) => sum + (Number(p.annualRentReceived) || 0), 0) || 0) : 0,
              capitalGainsLTCG: intakeDiscovery.capitalGains?.hasIncome === 'YES' ? (Number(intakeDiscovery.capitalGains.summary?.equityLtcg112A) || 0) : 0,
              capitalGainsSTCG: intakeDiscovery.capitalGains?.hasIncome === 'YES' ? (Number(intakeDiscovery.capitalGains.summary?.equityStcg111A) || 0) : 0,
              otherSources: intakeDiscovery.otherSources?.hasIncome === 'YES' ? ((Number(intakeDiscovery.otherSources.estimatedSavingsInterest) || 0) + (Number(intakeDiscovery.otherSources.estimatedDividends) || 0)) : 0,
            },
            deductions: {
              ...tc.deductions,
              sec80C: Number(intakeDiscovery.deductions?.claimed80C) || 0,
              sec80D: Number(intakeDiscovery.deductions?.claimed80DHealth) || 0,
              sec80CCD1B: Number(intakeDiscovery.deductions?.claimed80CCD1B_NPS) || 0,
            },
          }
        }
        return tc
      })
    )

    addAuditLog(
      'INTAKE_DISCOVERY_UPDATED',
      `Updated 5-head income discovery and regenerated dynamic checklist for ${updatedName} (${updatedPan}). Form aligned to ${recommendedItr}.`,
      updatedName,
      updatedPan,
      'Intake'
    )
  }

  const deleteClient = (id) => {
    const target = clients.find((c) => c.id === id)
    setClients((prev) => prev.filter((c) => c.id !== id))
    setDocuments((prev) => prev.filter((d) => d.clientId !== id))
    setTaxCases((prev) => prev.filter((tc) => tc.clientId !== id))
    setConsents((prev) => prev.filter((c) => c.clientId !== id))
    if (activeClientId === id) {
      const remaining = clients.filter((c) => c.id !== id)
      setActiveClientId(remaining.length > 0 ? remaining[0].id : '')
    }
    addAuditLog('CLIENT_DELETED', `Deleted taxpayer profile ${target?.name || id} (${target?.pan || '—'}) from firm records.`)
  }

  const clearAllClients = () => {
    setClients([])
    setDocuments([])
    setTaxCases([])
    setConsents([])
    setActiveClientId('')
    addAuditLog('CLEAR_ALL_DATA', 'Removed all taxpayer profiles from firm workspace as per user direction.')
  }

  const seedStatutoryTaxpayers = () => {
    setClients(SAMPLE_STATUTORY_CLIENTS)
    setDocuments(SAMPLE_STATUTORY_DOCUMENTS)
    setTaxCases(SAMPLE_STATUTORY_TAX_CASES)
    setConsents(SAMPLE_STATUTORY_CONSENTS)
    setActiveClientId('cli-001')
    addAuditLog('SEED_STATUTORY_DATA', 'Loaded 7 real statutory Indian tax entity demonstration profiles across Section 2(31).')
  }

  const updateClient = (id, updatedFields) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    )
    addAuditLog('CLIENT_UPDATED', `Updated profile records for client ID ${id}.`, activeClient?.name, activeClient?.pan, 'Management')
  }

  // Grant DPDP Consent Action
  const grantConsent = (clientId = activeClientId) => {
    const targetClient = clients.find((c) => c.id === clientId)
    if (!targetClient) return

    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c
        const up = c.docsUploaded || 0
        const req = c.docsRequired || 4
        return {
          ...c,
          consentStatus: 'Active',
          consentDate: new Date().toISOString(),
          status: up >= req ? 'Documents Uploaded' : 'Documents Pending',
        }
      })
    )

    setTaxCases((prev) =>
      prev.map((tc) => {
        if (tc.clientId !== clientId) return tc
        return {
          ...tc,
          checklist: {
            ...tc.checklist,
            consentLogged: true,
          },
        }
      })
    )

    // Update or add demonstration consent ledger entry
    setConsents((prev) => {
      const existingIdx = prev.findIndex((c) => c.clientId === targetClient.id)
      const newEntry = {
        id: `cns-${Date.now()}`,
        clientId: targetClient.id,
        clientName: targetClient.name,
        pan: targetClient.pan,
        assessmentYear: activeAy,
        scope: 'Comprehensive Tax Return Preparation & Personal Finance Advisory',
        status: 'ACTIVE',
        timestamp: new Date().toISOString(),
        validUntil: '2027-03-31T23:59:59Z',
        ipAddress: '103.22.140.12 (Simulated Sandbox IP, India)',
        userAgent: navigator.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Demo/1.0',
        sessionIdHash: `demo-hash-${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
        legalDeclaration: `Demonstration consent authorization granted by ${targetClient.name} for Sharma & Co. Chartered Accountants under DPDP guidelines.`,
      }
      if (existingIdx >= 0) {
        const updated = [...prev]
        updated[existingIdx] = newEntry
        return updated
      }
      return [newEntry, ...prev]
    })

    addAuditLog(
      'CONSENT_GRANTED_DEMO',
      `Demonstration DPDP digital consent captured for ${targetClient.name} (${targetClient.pan}). Purpose: ITR Filing & Personal Finance Advisory.`,
      targetClient.name,
      targetClient.pan,
      'Consent Concept'
    )
  }

  // Document Actions
  const mapCategoryToChecklistIds = (category) => {
    switch (category) {
      case 'FORM_16':
      case 'Form 16':
        return ['salary-form16']
      case 'FORM_26AS':
      case 'Form 26AS':
        return ['tax-26as-traces']
      case 'AIS':
      case 'TIS':
      case 'AIS_TIS':
      case 'AIS / TIS':
        return ['tax-ais-tis', 'os-bank-interest']
      case 'BANK_STATEMENT':
      case 'Bank Statements':
        return ['os-bank-interest', 'bp-44ad-bank-statement']
      case 'INVESTMENT_PROOF':
      case 'Investment Proofs':
        return ['ded-80c-receipts', 'ded-80d-mediclaim']
      case 'PROPERTY_DOCUMENT':
        return ['hp-interest-cert', 'hp-rent-agreement']
      case 'CAPITAL_GAINS_STATEMENT':
        return ['cg-broker-statement', 'cg-property-deeds']
      case 'BUSINESS_RECORD':
        return ['bp-pnl-balancesheet', 'bp-44ad-bank-statement']
      default:
        return []
    }
  }

  const addDocument = (docData) => {
    const normalizedBackendDoc =
      docData && (docData.extracted_data || docData.extraction_engine || docData.client_id)
        ? mapBackendDocumentToUi(docData)
        : null

    const baseData = normalizedBackendDoc || docData
    const targetChecklistIds =
      baseData.checklistItemIds && baseData.checklistItemIds.length > 0
        ? baseData.checklistItemIds
        : mapCategoryToChecklistIds(baseData.category)

    const newDoc = {
      id: baseData.id || `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      clientId: baseData.clientId || activeClientId,
      clientPan: baseData.clientPan || activeClient?.pan,
      caseId: baseData.caseId || activeTaxCase?.caseId || activeTaxCase?.id,
      assessmentYear: baseData.assessmentYear || activeTaxCase?.assessmentYear || activeAy,
      name: baseData.name || baseData.filename,
      category: baseData.category,
      checklistItemIds: targetChecklistIds,
      fileSizeBytes: baseData.fileSizeBytes || 0,
      fileHashSha256: baseData.fileHashSha256 || null,
      processingStatus: baseData.processingStatus || 'UPLOADED',
      caReviewStatus: baseData.caReviewStatus || 'PENDING_REVIEW',
      reviewNotes: baseData.reviewNotes || null,
      waiveReason: baseData.waiveReason || null,
      uploadDate: baseData.uploadDate || new Date().toISOString(),
      status: baseData.status || 'Uploaded',
      encryptionStatus: 'Secured Private Storage (SHA-256)',
      extractionSupported: Boolean(baseData.extractionSupported),
      extractionEngine:
        baseData.extractionEngine ||
        (baseData.extractionSupported ? 'DETERMINISTIC_PDF' : 'UNSUPPORTED_TYPE'),
      evidenceScore: baseData.evidenceScore ?? null,
      evidenceMethodology: baseData.evidenceMethodology || null,
      extractedData: baseData.extractedData || {},
      citations: baseData.citations || [],
      boundingCitations: baseData.boundingCitations || baseData.citations || [],
      correctedFields: baseData.correctedFields || {},
      ...baseData,
    }

    setDocuments((prev) => [newDoc, ...prev])

    // Update client uploaded count & dynamic checklist
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== (newDoc.clientId || activeClientId)) return c
        const updatedChecklist = (c.dynamicChecklist || []).map((item) => {
          if (targetChecklistIds.includes(item.id) && item.status !== 'WAIVED') {
            return { ...item, status: 'RECEIVED' }
          }
          return item
        })
        const newCount = (c.docsUploaded || 0) + 1
        const required = c.docsRequired || 4
        const newStatus = newCount >= required ? 'Documents Uploaded' : 'Documents Pending'
        return {
          ...c,
          docsUploaded: newCount,
          dynamicChecklist: updatedChecklist,
          status: newStatus,
        }
      })
    )

    setTaxCases((prev) =>
      prev.map((tc) => {
        if (tc.clientId !== (newDoc.clientId || activeClientId)) return tc
        const existingDocsCount =
          documents.filter((d) => d.clientId === (newDoc.clientId || activeClientId)).length + 1
        const required = activeClient?.docsRequired || 4
        return {
          ...tc,
          status: existingDocsCount >= required ? 'Documents Uploaded' : 'Documents Pending',
        }
      })
    )

    addAuditLog(
      'DOC_UPLOAD',
      `Uploaded ${newDoc.name} (${newDoc.category}). Case ownership verified & checksum indexed.`,
      activeClient?.name,
      activeClient?.pan,
      'Document'
    )
    return newDoc
  }

  const updateDocumentReviewStatus = async (docId, newStatus, reviewNotes = '', waiveReason = '') => {
    const targetDoc = documents.find((d) => d.id === docId)
    let mappedUpdated = null

    if (apiClient.getAccessToken() && targetDoc?.isBackendSynced) {
      const updatedRaw = await apiClient.updateDocumentStatus(
        docId,
        newStatus,
        reviewNotes || null,
        waiveReason || null
      )
      mappedUpdated = mapBackendDocumentToUi(updatedRaw)
    }

    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== docId) return d
        if (mappedUpdated) return mappedUpdated
        return {
          ...d,
          caReviewStatus: newStatus,
          reviewNotes: reviewNotes || d.reviewNotes,
          waiveReason: waiveReason || d.waiveReason,
        }
      })
    )

    if (targetDoc && targetDoc.checklistItemIds) {
      setClients((prev) =>
        prev.map((c) => {
          if (c.id !== targetDoc.clientId) return c
          const updatedChecklist = (c.dynamicChecklist || []).map((item) => {
            if (targetDoc.checklistItemIds.includes(item.id)) {
              return {
                ...item,
                status: newStatus === 'WAIVED' ? 'WAIVED' : newStatus === 'VERIFIED' ? 'RECEIVED' : item.status,
                waiveReason: newStatus === 'WAIVED' ? waiveReason : item.waiveReason,
              }
            }
            return item
          })
          return { ...c, dynamicChecklist: updatedChecklist }
        })
      )
    }

    addAuditLog(
      'DOCUMENT_REVIEW_UPDATED',
      `Document review status updated to ${newStatus} for doc ${docId}. Notes: ${reviewNotes || 'None'}. Reason: ${waiveReason || 'N/A'}.`,
      activeClient?.name,
      activeClient?.pan,
      'Document'
    )
    return mappedUpdated
  }

  const deleteDocument = async (docId) => {
    const docToDelete = documents.find((d) => d.id === docId)
    if (apiClient.getAccessToken() && docToDelete?.isBackendSynced) {
      await apiClient.deleteDocument(docId)
    }
    setDocuments((prev) => prev.filter((d) => d.id !== docId))
    if (docToDelete) {
      setClients((prev) =>
        prev.map((c) => {
          if (c.id !== docToDelete.clientId) return c
          return {
            ...c,
            docsUploaded: Math.max(0, (c.docsUploaded || 1) - 1),
          }
        })
      )
      addAuditLog(
        'DOCUMENT_DELETED',
        `Removed document ${docToDelete.name || docToDelete.filename || docId}.`,
        activeClient?.name,
        activeClient?.pan,
        'Document'
      )
    }
  }

  const requestMissingDocuments = async (clientId, missingItemIds, customNotes = '') => {
    const targetClient = clients.find((c) => c.id === clientId) || activeClient
    if (!targetClient) return null

    const matchingCase =
      taxCases.find((tc) => tc.clientId === targetClient.id) || activeTaxCase
    const resolvedCaseId =
      matchingCase?.caseId ||
      matchingCase?.id ||
      resolveBackendCaseId(targetClient.id, targetClient.activeAY || activeAy)

    let notice = null
    try {
      if (!apiClient.getAccessToken()) {
        throw new ApiError(0, 'Unauthenticated preview fallback')
      }
      notice = await apiClient.requestMissingDocuments({
        clientId: targetClient.id,
        caseId: resolvedCaseId,
        checklistItemIds: missingItemIds,
        customNotes,
      })
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        throw err
      }
      notice = {
        recipient_name: targetClient.name,
        recipient_email: targetClient.email || 'client@example.com',
        recipient_mobile: targetClient.mobile || '+91 98000 00000',
        subject: `Document Request: Pending ITR Filing for ${activeAy}`,
        email_body: `Dear ${targetClient.name},\n\nPlease provide your pending tax documents:\n${missingItemIds.join('\n')}\n\nWarm regards,\nCA Bharat AI`,
        whatsapp_body: `Hello ${targetClient.name}, please upload your pending tax documents to complete your return filing.`,
        missing_items: missingItemIds.map((id) => ({ id, title: id.replace('-', ' ').toUpperCase() })),
        is_simulated_dispatch: true,
        notice_disclaimer: 'Draft outreach preview only. No external SMS/email transmission performed.',
        generated_at: new Date().toISOString(),
      }
    }

    // Update checklist item statuses to 'REQUESTED'
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== targetClient.id) return c
        const updatedChecklist = (c.dynamicChecklist || []).map((item) => {
          if (missingItemIds.includes(item.id) && item.status !== 'RECEIVED' && item.status !== 'WAIVED') {
            return { ...item, status: 'REQUESTED' }
          }
          return item
        })
        return { ...c, dynamicChecklist: updatedChecklist }
      })
    )

    addAuditLog(
      'MISSING_DOCS_REQUESTED',
      `Generated draft missing documents outreach for ${targetClient.name} (${targetClient.pan}). Items: ${missingItemIds.join(', ')}.`,
      targetClient.name,
      targetClient.pan,
      'Outreach'
    )

    return notice
  }

  // Simulate AI Extraction
  const runSimulatedExtraction = (callback) => {
    setIsSimulatingExtraction(true)
    setTimeout(() => {
      // Mark active client's documents as Processed
      setDocuments((prev) =>
        prev.map((d) =>
          d.clientId === activeClientId ? { ...d, status: 'Processed' } : d
        )
      )
      setIsSimulatingExtraction(false)

      // Check if active client needs populated records upon extraction (e.g. Dr. Suresh or new client)
      if (
        activeTaxCase &&
        (activeTaxCase.incomes?.salary === 0 && activeTaxCase.incomes?.otherSources === 0)
      ) {
        const isProfessional = activeClient?.category?.includes('Professional')
        const grossSalary = isProfessional ? 0 : 1650000
        const grossProfessional = isProfessional ? 1800000 : 0
        const otherSources = 22000
        const totalTds = isProfessional ? 180000 : 190000

        const generatedReconciliationItems = [
          {
            id: `rec-${Date.now()}-1`,
            category: isProfessional ? 'Professional Receipts (Sec 194J)' : 'Salary Income',
            item: isProfessional ? 'Gross Professional Receipts (Sec 194J)' : 'Gross Salary (Sec 17(1))',
            form16: isProfessional ? grossProfessional : grossSalary,
            form26AS: isProfessional ? grossProfessional : grossSalary,
            aisTis: isProfessional ? grossProfessional : grossSalary,
            status: 'MATCHED',
            riskLevel: 'Low',
            notes: 'Consistent across TDS certificate, Form 26AS Part A, and AIS schedule.',
          },
          {
            id: `rec-${Date.now()}-2`,
            category: 'Tax Deducted at Source',
            item: isProfessional ? 'TDS on Professional Fees (Sec 194J)' : 'TDS on Salary (Sec 192)',
            form16: totalTds,
            form26AS: totalTds,
            aisTis: totalTds,
            status: 'MATCHED',
            riskLevel: 'Low',
            notes: 'TDS deposit verified in TRACES OLTAS database.',
          },
          {
            id: `rec-${Date.now()}-3`,
            category: 'Income from Other Sources',
            item: 'Savings Bank Interest (Demo Bank)',
            form16: 0,
            form26AS: 0,
            aisTis: otherSources,
            status: 'MISMATCH_UNREPORTED',
            riskLevel: 'Moderate',
            sourceCitation: 'AIS SFT-005 • Page 3 (Demo Bank savings interest)',
            noticeRisk: 'Moderate Risk: Potential mismatch notice u/s 143(1)(a) if omitted.',
            actionRequired: 'Add ₹22,000 under Income from Other Sources; claim ₹10,000 deduction u/s 80TTA.',
            isAccepted: false,
          },
        ]

        setTaxCases((prev) =>
          prev.map((tc) => {
            if (tc.clientId !== activeClientId) return tc
            return {
              ...tc,
              status: 'Discrepancies Found',
              filingForm: isProfessional ? 'ITR-3' : 'ITR-1',
              checklist: {
                ...tc.checklist,
                form16Reconciled: true,
                bankAccountValidated: true,
                discrepanciesResolved: false,
              },
              incomes: {
                salary: grossSalary,
                houseProperty: 0,
                capitalGainsLTCG: 0,
                capitalGainsSTCG: 0,
                otherSources: otherSources,
              },
              deductions: {
                sec80C: 150000,
                sec80D: 50000,
                sec80CCD1B: 0,
                sec24b: 0,
                sec80TTA: 10000,
              },
              taxesPaid: {
                tdsSalary: totalTds,
                tdsDividend: 0,
                advanceTax: 0,
                selfAssessmentTax: 0,
                totalTds: totalTds,
              },
              reconciliationItems: generatedReconciliationItems,
            }
          })
        )

        setClients((prev) =>
          prev.map((c) => {
            if (c.id !== activeClientId) return c
            return {
              ...c,
              status: 'Discrepancies Found',
              discrepancyCount: 1,
              refundExpected: 14400,
            }
          })
        )
      } else {
        // If client already had data, sync to proper stage
        setTaxCases((prev) =>
          prev.map((tc) => {
            if (tc.clientId !== activeClientId) return tc
            const hasUnresolved = tc.reconciliationItems?.some((i) => !i.isAccepted && i.status.includes('MISMATCH'))
            return {
              ...tc,
              status: hasUnresolved ? 'Discrepancies Found' : 'Ready for Review',
            }
          })
        )
        setClients((prev) =>
          prev.map((c) => {
            if (c.id !== activeClientId) return c
            const count = c.discrepancyCount || 0
            return {
              ...c,
              status: count > 0 ? 'Discrepancies Found' : 'Ready for Review',
            }
          })
        )
      }

      addAuditLog(
        'AI_EXTRACTION_COMPLETED',
        `Completed OCR extraction, schedule parsing, and bounding citations for ${activeClient?.name} (${activeClient?.pan}).`,
        activeClient?.name,
        activeClient?.pan,
        'AI Pipeline'
      )
      if (callback) callback()
    }, 2800)
  }

  // 3-Way Reconciliation Actions
  const acceptDiscrepancy = (itemId) => {
    if (!activeTaxCase) return

    let acceptedItem = null

    setTaxCases((prev) =>
      prev.map((tc) => {
        if (tc.caseId !== activeTaxCase.caseId) return tc

        const updatedItems = tc.reconciliationItems.map((item) => {
          if (item.id === itemId) {
            acceptedItem = item
            return { ...item, isAccepted: true, status: 'MATCHED_RESOLVED' }
          }
          return item
        })

        const allResolved = updatedItems.every(
          (item) => item.isAccepted || item.status === 'MATCHED' || item.status === 'MATCHED_RESOLVED'
        )

        // Adjust incomes if other sources or capital gains accepted
        const updatedIncomes = { ...tc.incomes }
        if (acceptedItem?.item?.includes('Savings Bank Interest') || acceptedItem?.category?.includes('Other Sources')) {
          updatedIncomes.otherSources = Math.max(updatedIncomes.otherSources, acceptedItem.aisTis || 46000)
        }
        if (acceptedItem?.category?.includes('Capital Gains')) {
          updatedIncomes.capitalGainsLTCG = Math.max(updatedIncomes.capitalGainsLTCG, acceptedItem.aisTis || 58000)
        }

        return {
          ...tc,
          incomes: updatedIncomes,
          reconciliationItems: updatedItems,
          status: allResolved ? 'Ready for Review' : 'Discrepancies Found',
          checklist: {
            ...tc.checklist,
            discrepanciesResolved: allResolved,
          },
        }
      })
    )

    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== activeClientId) return c
        const newCount = Math.max(0, (c.discrepancyCount || 1) - 1)
        return {
          ...c,
          discrepancyCount: newCount,
          status: newCount === 0 ? 'Ready for Review' : 'Discrepancies Found',
        }
      })
    )

    addAuditLog(
      'DISCREPANCY_ACCEPTED',
      `Accepted discrepancy ${itemId} based on AIS verification. Adjusted gross income.`,
      activeClient?.name,
      activeClient?.pan,
      'Reconciliation'
    )
  }

  // CA Sign-off Action (Simulated Prototype Action)
  const approveTaxCase = (
    caseId,
    caNotes = 'Verified against TRACES 26AS, AIS SFT records, and Form 16 Part A+B. TDS credit validated in OLTAS.'
  ) => {
    const hash =
      'demo-sha256-' +
      Math.random().toString(16).substring(2, 10) +
      '9e73d102' +
      Math.random().toString(16).substring(2, 10)

    setTaxCases((prev) =>
      prev.map((tc) => {
        if (tc.caseId !== caseId) return tc
        return {
          ...tc,
          status: 'CA Approved',
          reviewerNotes: caNotes,
          approval: {
            isApproved: true,
            approvedBy: 'CA Rajesh Sharma (Demo Partner • FCA #DEMO049281)',
            approvedAt: new Date().toISOString(),
            sha256Hash: hash,
          },
        }
      })
    )

    setClients((prev) =>
      prev.map((c) => (c.id === activeClientId ? { ...c, status: 'CA Approved' } : c))
    )

    addAuditLog(
      'CA_ITR_APPROVED',
      `CA Rajesh Sharma simulated approval on ITR filing pack for ${activeClient?.name} (${activeClient?.pan}). Demo Identifier: ${hash}`,
      activeClient?.name,
      activeClient?.pan,
      'Approval (Demo)'
    )

    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: `Simulated Sign-Off: ${activeClient?.name}`,
      message: `Return approved under FCA #DEMO049281. Filing pack JSON is ready for download.`,
      timestamp: 'Just now',
      read: false,
      type: 'success',
      link: '/tax-reconciliation',
    }
    setNotifications((prev) => [newNotif, ...prev])
  }

  // Record Report Generated
  // Step 06 Backend Auth & Synchronisation
  const clearAuthError = () => setAuthError(null)
  const clearExtractionError = () => setExtractionError(null)
  const clearReconciliationError = () => setReconciliationError(null)

  useEffect(() => {
    const unsubscribe = apiClient.onAuthError((err) => {
      if (err?.status === 401) {
        setAuthSession(null)
        setBackendReconciliation(null)
        setBackendTaxComparison(null)
      }
      setAuthError(err?.message || 'Backend authorization error.')
    })
    return unsubscribe
  }, [])

  const fetchClientReconciliationAndTax = async (clientId, caseId = null) => {
    if (!clientId || !apiClient.getAccessToken()) return null
    setIsLoadingReconciliation(true)
    setReconciliationError(null)
    setTaxError(null)
    try {
      const [rawMatrix, rawTax] = await Promise.all([
        apiClient.getBackendReconciliation(clientId, caseId).catch((err) => {
          if (err?.status !== 404) setReconciliationError(err?.message || 'Unable to load reconciliation.')
          return null
        }),
        apiClient.getBackendTaxCalculation(clientId, caseId).catch((err) => {
          if (err?.status !== 404) setTaxError(err?.message || 'Unable to load tax calculation.')
          return null
        }),
      ])
      const mappedMatrix = rawMatrix ? mapBackendReconciliationToUi(rawMatrix) : null
      const mappedTax = rawTax ? mapBackendTaxComparisonToUi(rawTax) : null
      setBackendReconciliation(mappedMatrix)
      setBackendTaxComparison(mappedTax)
      return { matrix: mappedMatrix, tax: mappedTax }
    } finally {
      setIsLoadingReconciliation(false)
    }
  }

  const fetchClientDocumentsFromBackend = async (clientId, caseId = null) => {
    if (!clientId || !apiClient.getAccessToken()) return []
    const rawDocs = await apiClient.getDocumentsByClient(clientId, caseId)
    const mapped = (Array.isArray(rawDocs) ? rawDocs : []).map(mapBackendDocumentToUi)
    setDocuments((prev) => [
      ...prev.filter((d) => d.clientId !== clientId),
      ...mapped,
    ])
    return mapped
  }

  const syncBackendWorkspace = async (sessionOverride = null) => {
    const activeToken = sessionOverride?.access_token || apiClient.getAccessToken()
    if (!activeToken) return null
    setIsSyncingBackend(true)
    setAuthError(null)
    try {
      const backendClients = await apiClient.getClients()
      if (!Array.isArray(backendClients)) return null

      const { mergedClients, mergedTaxCases, idRemap } = mergeBackendClientsAndCases({
        backendClients,
        localClients: clients,
        localTaxCases: taxCases,
        defaultIntakeDiscovery: DEFAULT_INTAKE_DISCOVERY,
        generateChecklist: generateDynamicChecklist,
        computeItr: computeRecommendedItr,
      })

      setClients(mergedClients)
      setTaxCases(mergedTaxCases)

      if (Object.keys(idRemap).length > 0) {
        setDocuments((prev) =>
          prev.map((d) => (idRemap[d.clientId] ? { ...d, clientId: idRemap[d.clientId] } : d))
        )
      }

      let resolvedActiveId = idRemap[activeClientId] || activeClientId
      if (!mergedClients.some((c) => c.id === resolvedActiveId)) {
        resolvedActiveId = backendClients[0]?.id || mergedClients[0]?.id || ''
      }
      if (resolvedActiveId && resolvedActiveId !== activeClientId) {
        setActiveClientId(resolvedActiveId)
      }

      if (resolvedActiveId) {
        const matchedClient = mergedClients.find((c) => c.id === resolvedActiveId)
        const matchedCase = mergedTaxCases.find((tc) => tc.clientId === resolvedActiveId)
        const caseId = matchedCase?.caseId || resolveBackendCaseId(resolvedActiveId, matchedClient?.activeAY)
        await fetchClientDocumentsFromBackend(resolvedActiveId, caseId)
        await fetchClientReconciliationAndTax(resolvedActiveId, caseId)
      }
      return backendClients
    } catch (err) {
      if (!(err instanceof ApiError)) {
        setAuthError(err?.message || 'Failed to sync workspace from backend.')
      }
      throw err
    } finally {
      setIsSyncingBackend(false)
    }
  }

  useEffect(() => {
    if (authSession?.access_token) {
      syncBackendWorkspace(authSession).catch(() => {
        // Error surfaced cleanly through authError / onAuthError
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authSession?.access_token])

  useEffect(() => {
    if (!authSession?.access_token || !activeClientId) return
    const matchedCase = taxCases.find((tc) => tc.clientId === activeClientId)
    const caseId =
      matchedCase?.caseId ||
      resolveBackendCaseId(activeClientId, activeClient?.activeAY || activeAy)
    fetchClientDocumentsFromBackend(activeClientId, caseId).catch((err) => {
      setExtractionError(err?.message || 'Unable to load documents from backend.')
    })
    fetchClientReconciliationAndTax(activeClientId, caseId).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClientId])

  const signInBackendSession = async ({ username, credential }) => {
    setAuthError(null)
    const session = await apiClient.authenticateSession({ username, credential })
    setAuthSession(session)
    addAuditLog(
      'BACKEND_SESSION_AUTHENTICATED',
      `Authenticated backend session for ${session.actor_name} (${session.role}).`,
      activeClient?.name,
      activeClient?.pan,
      'Security'
    )
    await syncBackendWorkspace(session)
    return session
  }

  const connectWithBearerToken = async (rawToken) => {
    setAuthError(null)
    const trimmed = (rawToken || '').trim()
    if (!trimmed) {
      throw new ApiError(400, 'Please provide a valid Bearer token.')
    }
    const candidateSession = {
      access_token: trimmed,
      token_type: 'bearer',
      actor_id: 'external-token-session',
      actor_name: 'Bearer Token Session',
      role: 'SERVER_ENFORCED',
      assigned_client_ids: [],
      allowed_case_ids: [],
      is_prototype_auth: false,
    }
    apiClient.setSession(candidateSession)
    try {
      setAuthSession(candidateSession)
      await syncBackendWorkspace(candidateSession)
      return candidateSession
    } catch (err) {
      apiClient.clearSession()
      setAuthSession(null)
      throw err
    }
  }

  const signOutBackendSession = () => {
    apiClient.clearSession()
    setAuthSession(null)
    setAuthError(null)
    setExtractionError(null)
    setBackendReconciliation(null)
    setBackendTaxComparison(null)
    setReconciliationError(null)
    setTaxError(null)
  }

  const runClientReconciliation = async (
    clientId = activeClientId,
    caseId = activeTaxCase?.caseId || resolveBackendCaseId(activeClientId, activeAy),
    assessmentYear = String(activeAy || '2025-26').replace(/^AY\s*/i, '')
  ) => {
    setIsLoadingReconciliation(true)
    setReconciliationError(null)
    try {
      const rawMatrix = await apiClient.runBackendReconciliation(clientId, {
        caseId,
        assessmentYear,
      })
      const mappedMatrix = mapBackendReconciliationToUi(rawMatrix)
      setBackendReconciliation(mappedMatrix)
      const rawTax = await apiClient
        .runBackendTaxCalculation(clientId, { caseId, assessmentYear })
        .catch(() => null)
      if (rawTax) setBackendTaxComparison(mapBackendTaxComparisonToUi(rawTax))
      addAuditLog(
        '3WAY_RECONCILIATION_EXECUTED',
        `Executed backend 3-way reconciliation for ${clientId}: ${mappedMatrix.totalDiscrepancies} discrepancy(ies).`,
        activeClient?.name,
        activeClient?.pan,
        'Reconciliation'
      )
      return mappedMatrix
    } catch (err) {
      setReconciliationError(err?.message || 'Reconciliation failed.')
      throw err
    } finally {
      setIsLoadingReconciliation(false)
    }
  }

  const resolveReconciliationIssue = async (
    clientId,
    rowId,
    {
      action,
      caNotes,
      resolvedValue = null,
      caseId = activeTaxCase?.caseId || resolveBackendCaseId(activeClientId, activeAy),
    }
  ) => {
    setReconciliationError(null)
    try {
      const rawMatrix = await apiClient.resolveBackendReconciliationRow(clientId, rowId, {
        action,
        caNotes,
        resolvedValue,
        caseId,
      })
      const mappedMatrix = mapBackendReconciliationToUi(rawMatrix)
      setBackendReconciliation(mappedMatrix)
      const ayClean = String(activeAy || '2025-26').replace(/^AY\s*/i, '')
      const rawTax = await apiClient
        .runBackendTaxCalculation(clientId, { caseId, assessmentYear: ayClean })
        .catch(() => null)
      if (rawTax) setBackendTaxComparison(mapBackendTaxComparisonToUi(rawTax))
      addAuditLog(
        'DISCREPANCY_RESOLVED',
        `Resolved reconciliation row ${rowId} (${action}). Notes: ${caNotes}`,
        activeClient?.name,
        activeClient?.pan,
        'Reconciliation'
      )
      return mappedMatrix
    } catch (err) {
      setReconciliationError(err?.message || 'Failed to resolve reconciliation item.')
      throw err
    }
  }

  const computeClientTax = async (
    clientId = activeClientId,
    caseId = activeTaxCase?.caseId || resolveBackendCaseId(activeClientId, activeAy),
    assessmentYear = String(activeAy || '2025-26').replace(/^AY\s*/i, '')
  ) => {
    setIsComputingTax(true)
    setTaxError(null)
    try {
      const rawTax = await apiClient.runBackendTaxCalculation(clientId, {
        caseId,
        assessmentYear,
      })
      const mapped = mapBackendTaxComparisonToUi(rawTax)
      setBackendTaxComparison(mapped)
      return mapped
    } catch (err) {
      setTaxError(err?.message || 'Tax computation failed.')
      throw err
    } finally {
      setIsComputingTax(false)
    }
  }

  const approveClientTaxBackend = async (
    clientId = activeClientId,
    {
      caseId = activeTaxCase?.caseId || resolveBackendCaseId(activeClientId, activeAy),
      caNotes,
      chosenRegime = 'NEW_REGIME_115BAC',
    }
  ) => {
    setTaxError(null)
    const res = await apiClient.submitBackendCaSignOff(clientId, {
      caseId,
      caNotes,
      chosenRegime,
    })
    await fetchClientReconciliationAndTax(clientId, caseId)
    addAuditLog(
      'CA_STATUTORY_SIGN_OFF',
      `Approved ITR return under ${chosenRegime}. Verification hash: ${res.verification_hash}`,
      activeClient?.name,
      activeClient?.pan,
      'CA Sign-Off'
    )
    return res
  }

  const extractClientDocuments = async (
    clientId = activeClientId,
    caseId = activeTaxCase?.caseId || resolveBackendCaseId(activeClientId, activeAy)
  ) => {
    setExtractionError(null)
    setIsSimulatingExtraction(true)
    try {
      const extractedRawDocs = await apiClient.extractAllDocuments({
        clientId,
        caseId,
      })
      const mapped = (Array.isArray(extractedRawDocs) ? extractedRawDocs : []).map(
        mapBackendDocumentToUi
      )
      setDocuments((prev) => [
        ...prev.filter((d) => d.clientId !== clientId),
        ...mapped,
      ])
      addAuditLog(
        'BACKEND_EXTRACTION_EXECUTED',
        `Executed deterministic PDF extraction for ${mapped.length} document(s) in client ${clientId}.`,
        activeClient?.name,
        activeClient?.pan,
        'Extraction'
      )
      const ayClean = String(activeAy || '2025-26').replace(/^AY\s*/i, '')
      await runClientReconciliation(clientId, caseId, ayClean).catch(() => {})
      return mapped
    } catch (err) {
      setExtractionError(err?.message || 'Document extraction failed.')
      throw err
    } finally {
      setIsSimulatingExtraction(false)
    }
  }

  const extractSingleDocument = async (
    docId,
    caseId = activeTaxCase?.caseId || resolveBackendCaseId(activeClientId, activeAy)
  ) => {
    setExtractionError(null)
    setIsSimulatingExtraction(true)
    try {
      const updatedRaw = await apiClient.extractDocumentById(docId, caseId)
      const mapped = mapBackendDocumentToUi(updatedRaw)
      setDocuments((prev) => prev.map((d) => (d.id === docId ? mapped : d)))
      addAuditLog(
        'DOCUMENT_EXTRACTED',
        `Ran extraction on ${mapped.name} (${mapped.extractionEngine || 'PARSER'}).`,
        activeClient?.name,
        activeClient?.pan,
        'Extraction'
      )
      if (mapped.clientId) {
        const ayClean = String(activeAy || '2025-26').replace(/^AY\s*/i, '')
        await runClientReconciliation(mapped.clientId, caseId, ayClean).catch(() => {})
      }
      return mapped
    } catch (err) {
      setExtractionError(err?.message || 'Extraction failed for document.')
      throw err
    } finally {
      setIsSimulatingExtraction(false)
    }
  }

  const correctDocumentField = async (
    docId,
    fieldKey,
    {
      correctedValue,
      correctionReason,
      caseId = activeTaxCase?.caseId || resolveBackendCaseId(activeClientId, activeAy),
    }
  ) => {
    setExtractionError(null)
    try {
      const updatedRaw = await apiClient.correctDocumentField(docId, fieldKey, {
        correctedValue,
        correctionReason,
        caseId,
      })
      const mapped = mapBackendDocumentToUi(updatedRaw)
      setDocuments((prev) => prev.map((d) => (d.id === docId ? mapped : d)))
      addAuditLog(
        'CA_FIELD_CORRECTED',
        `Corrected field '${fieldKey}' on ${mapped.name}. Reason: ${correctionReason}`,
        activeClient?.name,
        activeClient?.pan,
        'CA Review'
      )
      if (mapped.clientId) {
        const ayClean = String(activeAy || '2025-26').replace(/^AY\s*/i, '')
        await runClientReconciliation(mapped.clientId, caseId, ayClean).catch(() => {})
      }
      return mapped
    } catch (err) {
      setExtractionError(err?.message || 'Field correction failed.')
      throw err
    }
  }

  const verifyDocumentField = async (
    docId,
    fieldKey,
    { caseId = activeTaxCase?.caseId || resolveBackendCaseId(activeClientId, activeAy) } = {}
  ) => {
    setExtractionError(null)
    try {
      const updatedRaw = await apiClient.verifyDocumentField(docId, fieldKey, { caseId })
      const mapped = mapBackendDocumentToUi(updatedRaw)
      setDocuments((prev) => prev.map((d) => (d.id === docId ? mapped : d)))
      addAuditLog(
        'CA_FIELD_VERIFIED',
        `Verified extracted field '${fieldKey}' on ${mapped.name}.`,
        activeClient?.name,
        activeClient?.pan,
        'CA Review'
      )
      if (mapped.clientId) {
        await fetchClientReconciliationAndTax(mapped.clientId, caseId).catch(() => {})
      }
      return mapped
    } catch (err) {
      setExtractionError(err?.message || 'Field verification failed.')
      throw err
    }
  }

  // Record Report Generated
  const recordReportGenerated = (caseId = activeTaxCase?.caseId) => {
    const targetCaseId = caseId || activeTaxCase?.caseId || activeTaxCase?.id
    setTaxCases((prev) =>
      prev.map((tc) => {
        if (tc.caseId === targetCaseId || tc.id === targetCaseId || tc.clientId === activeClientId) {
          return {
            ...tc,
            reportGenerated: true,
            status: tc.approval?.isApproved ? 'Report Generated' : tc.status,
          }
        }
        return tc
      })
    )

    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== activeClientId) return c
        return {
          ...c,
          reportGenerated: true,
          status: c.status === 'CA Approved' ? 'Report Generated' : c.status,
        }
      })
    )

    addAuditLog(
      'REPORT_GENERATED',
      `Generated and exported 2-Page Visual Financial Eye-Opener report / Filing Pack for ${activeClient?.name} (${activeClient?.pan}).`,
      activeClient?.name,
      activeClient?.pan,
      'Report'
    )
  }

  // Reject / Request Clarification
  const requestCorrection = (caseId, reason) => {
    setTaxCases((prev) =>
      prev.map((tc) => {
        if (tc.caseId !== caseId) return tc
        return {
          ...tc,
          status: 'Discrepancies Found',
          approval: {
            ...tc.approval,
            rejectionReason: reason,
          },
        }
      })
    )
    setClients((prev) =>
      prev.map((c) => (c.id === activeClientId ? { ...c, status: 'Discrepancies Found' } : c))
    )
    addAuditLog('CORRECTION_REQUESTED', `Requested client clarification: ${reason}`, activeClient?.name, activeClient?.pan, 'Review')
  }

  // Reset to initial clean state
  const resetAllDataToDemo = () => {
    clearDemoStorage()
    setClients(INITIAL_CLIENTS)
    setDocuments(INITIAL_DOCUMENTS)
    setTaxCases(INITIAL_TAX_CASES)
    setConsents(INITIAL_CONSENTS)
    setTeam(INITIAL_TEAM)
    setAuditLogs(INITIAL_AUDIT_LOGS)
    setNotifications(INITIAL_NOTIFICATIONS)
    setActiveAy('AY 2025-26')
    setActiveClientId('')
    addAuditLog('SYSTEM_RESET', 'Demo state reset to clean initial configuration.')
  }

  return (
    <AppContext.Provider
      value={{
        authSession,
        authError,
        isSyncingBackend,
        extractionError,
        clearAuthError,
        clearExtractionError,
        signInBackendSession,
        connectWithBearerToken,
        signOutBackendSession,
        syncBackendWorkspace,
        fetchClientDocumentsFromBackend,
        extractClientDocuments,
        extractSingleDocument,
        correctDocumentField,
        verifyDocumentField,
        backendReconciliation,
        backendTaxComparison,
        isLoadingReconciliation,
        reconciliationError,
        isComputingTax,
        taxError,
        clearReconciliationError,
        fetchClientReconciliationAndTax,
        runClientReconciliation,
        resolveReconciliationIssue,
        computeClientTax,
        approveClientTaxBackend,
        clients,
        setClients,
        activeClient,
        activeClientId,
        setActiveClientId,
        addClient,
        updateClientIntake,
        deleteClient,
        clearAllClients,
        seedStatutoryTaxpayers,
        updateClient,
        grantConsent,
        documents,
        activeClientDocs,
        addDocument,
        updateDocumentReviewStatus,
        deleteDocument,
        requestMissingDocuments,
        isSimulatingExtraction,
        runSimulatedExtraction,
        taxCases,
        activeTaxCase,
        acceptDiscrepancy,
        approveTaxCase,
        requestCorrection,
        recordReportGenerated,
        consents,
        team,
        firmDetails: FIRM_DETAILS,
        auditLogs,
        addAuditLog,
        notifications,
        setNotifications,
        activeAy,
        setActiveAy,
        globalSearch,
        setGlobalSearch,
        resetAllDataToDemo,
        activeWorkflowStage,
        activeWorkflowMeta,
        activeDocBreakdown,
        getWorkflowStageForClient,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
