import React, { createContext, useContext, useState, useEffect } from 'react'
import { INITIAL_CLIENTS } from '../data/mockClients'
import { INITIAL_DOCUMENTS } from '../data/mockDocuments'
import { INITIAL_TAX_CASES } from '../data/mockTaxCases'
import { INITIAL_CONSENTS } from '../data/mockConsents'
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
  const [activeClientId, setActiveClientId] = useState(() => loadFromStorage(STORAGE_KEYS.ACTIVE_CLIENT_ID, 'cli-001'))
  const [globalSearch, setGlobalSearch] = useState('')
  const [isSimulatingExtraction, setIsSimulatingExtraction] = useState(false)

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
  const activeClient = clients.find((c) => c.id === activeClientId) || clients[0] || null
  const activeTaxCase = taxCases.find((tc) => tc.clientId === activeClientId) || taxCases[0] || null
  const activeClientDocs = documents.filter((d) => d.clientId === activeClientId)

  // Dynamic Case Workflow Stage for Active Client
  const activeWorkflowStage = getClientWorkflowStage(
    activeClient,
    activeTaxCase,
    activeClientDocs,
    isSimulatingExtraction
  )
  const activeWorkflowMeta = WORKFLOW_STATUS_META[activeWorkflowStage] || WORKFLOW_STATUS_META[WORKFLOW_STAGES.ONBOARDING]
  const activeDocBreakdown = getClientDocumentBreakdown(activeClient, activeClientDocs)

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
      actor: 'CA Rajesh Sharma (Demo Partner)',
      action,
      clientName: clientName || 'System',
      pan: pan || '—',
      details,
      ipAddress: '103.22.140.12 (Simulated Token)',
      category,
    }
    setAuditLogs((prev) => [newLog, ...prev])
  }

  // Client Actions
  const addClient = (clientData) => {
    const newId = `cli-${String(clients.length + 1).padStart(3, '0')}`
    const newClient = {
      id: newId,
      status: 'Consent Pending',
      tier: 'Silver',
      activeAY: activeAy,
      consentStatus: 'Pending',
      docsUploaded: 0,
      docsRequired: 4,
      refundExpected: 0,
      discrepancyCount: 0,
      assignedTo: 'Ananya Joshi (Senior Associate)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
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
      filingForm: 'ITR-1',
      status: 'Consent Pending',
      assignedCa: 'CA Rajesh Sharma (Partner)',
      reviewerNotes: 'New client onboarding initiated. Awaiting DPDP consent and document intake.',
      checklist: {
        panIdentityVerified: true,
        form16Reconciled: false,
        bankAccountValidated: false,
        consentLogged: false,
        discrepanciesResolved: false,
      },
      incomes: {
        salary: 0,
        houseProperty: 0,
        capitalGainsLTCG: 0,
        capitalGainsSTCG: 0,
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
        tdsSalary: 0,
        tdsDividend: 0,
        advanceTax: 0,
        selfAssessmentTax: 0,
        totalTds: 0,
      },
      reconciliationItems: [],
      approval: {
        isApproved: false,
        approvedBy: null,
        approvedAt: null,
        sha256Hash: null,
      },
    }

    setClients((prev) => [newClient, ...prev])
    setTaxCases((prev) => [newCase, ...prev])
    setActiveClientId(newId)
    addAuditLog('CLIENT_CREATED', `New taxpayer ${newClient.name} (${newClient.pan}) onboarded into system.`, newClient.name, newClient.pan, 'Intake')
    return newId
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

    // Add demonstration consent ledger entry
    setConsents((prev) => [
      {
        id: `cst-${Date.now()}`,
        clientId: targetClient.id,
        clientName: targetClient.name,
        pan: targetClient.pan,
        assessmentYear: activeAy,
        purpose: 'Comprehensive Tax Return Preparation & Personal Finance Advisory',
        status: 'Active',
        grantedAt: new Date().toISOString(),
        expiresAt: '2026-06-30T23:59:59Z',
        ipAddress: '103.22.140.12 (Simulated Sandbox IP)',
        method: 'Digital OTP Authorization (Simulated DPDP)',
        verifiedIdentity: targetClient.name,
      },
      ...prev,
    ])

    addAuditLog(
      'CONSENT_GRANTED_DEMO',
      `Demonstration DPDP digital consent captured for ${targetClient.name} (${targetClient.pan}). Purpose: ITR Filing & Personal Finance Advisory.`,
      targetClient.name,
      targetClient.pan,
      'Consent Concept'
    )
  }

  // Document Actions
  const addDocument = (docData) => {
    const newDoc = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      clientId: activeClientId,
      uploadDate: new Date().toISOString(),
      status: 'Uploaded',
      encryptionStatus: `Simulated In-Memory Sandbox (PAN ${activeClient?.pan || 'DEMO'})`,
      extractionConfidence: 98.4,
      isCompletePartB: true,
      boundingCitations: [],
      ...docData,
    }

    setDocuments((prev) => [newDoc, ...prev])

    // Update client uploaded count & status
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== activeClientId) return c
        const newCount = (c.docsUploaded || 0) + 1
        const required = c.docsRequired || 4
        const newStatus = newCount >= required ? 'Documents Uploaded' : 'Documents Pending'
        return {
          ...c,
          docsUploaded: newCount,
          status: newStatus,
        }
      })
    )

    setTaxCases((prev) =>
      prev.map((tc) => {
        if (tc.clientId !== activeClientId) return tc
        const existingDocsCount = documents.filter((d) => d.clientId === activeClientId).length + 1
        const required = activeClient?.docsRequired || 4
        return {
          ...tc,
          status: existingDocsCount >= required ? 'Documents Uploaded' : 'Documents Pending',
        }
      })
    )

    addAuditLog(
      'DOC_UPLOAD',
      `Uploaded ${docData.name} (${docData.category}). In-memory processing sandbox engaged.`,
      activeClient?.name,
      activeClient?.pan,
      'Document'
    )
    return newDoc
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

  // Reset to original mock data
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
    setActiveClientId('cli-001')
  }

  return (
    <AppContext.Provider
      value={{
        clients,
        setClients,
        activeClient,
        activeClientId,
        setActiveClientId,
        addClient,
        updateClient,
        grantConsent,
        documents,
        activeClientDocs,
        addDocument,
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
