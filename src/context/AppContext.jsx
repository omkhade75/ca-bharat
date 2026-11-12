import React, { createContext, useContext, useState, useEffect } from 'react'
import { INITIAL_CLIENTS } from '../data/mockClients'
import { INITIAL_DOCUMENTS } from '../data/mockDocuments'
import { INITIAL_TAX_CASES } from '../data/mockTaxCases'
import { INITIAL_CONSENTS } from '../data/mockConsents'
import { INITIAL_TEAM, FIRM_DETAILS } from '../data/mockTeam'
import { INITIAL_AUDIT_LOGS } from '../data/mockAuditLogs'
import { INITIAL_NOTIFICATIONS } from '../data/mockNotifications'
import { loadFromStorage, saveToStorage, STORAGE_KEYS, clearDemoStorage } from '../utils/storage'

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

  // Add audit log helper
  const addAuditLog = (action, details, clientName = activeClient?.name, pan = activeClient?.pan, category = 'General') => {
    const newLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      actor: 'CA Rajesh Sharma (Partner)',
      action,
      clientName: clientName || 'System',
      pan: pan || '—',
      details,
      ipAddress: '103.22.140.12',
      category,
    }
    setAuditLogs((prev) => [newLog, ...prev])
  }

  // Client Actions
  const addClient = (clientData) => {
    const newId = `cli-${String(clients.length + 1).padStart(3, '0')}`
    const newClient = {
      id: newId,
      status: 'Onboarding',
      tier: 'Silver',
      activeAY: activeAy,
      consentStatus: 'Pending',
      docsUploaded: 0,
      docsRequired: 3,
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
      status: 'Pending Intake',
      assignedCa: 'CA Rajesh Sharma (Partner)',
      reviewerNotes: 'New client onboarding initiated.',
      checklist: {
        panIdentityVerified: true,
        form16Reconciled: false,
        bankAccountValidated: false,
        consentLogged: false,
        discrepanciesResolved: true,
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

  // Document Actions
  const addDocument = (docData) => {
    const newDoc = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      clientId: activeClientId,
      uploadDate: new Date().toISOString(),
      status: 'Processing',
      encryptionStatus: 'Simulated In-Memory Sandbox',
      extractionConfidence: 98.2,
      isCompletePartB: true,
      boundingCitations: [],
      ...docData,
    }
    setDocuments((prev) => [newDoc, ...prev])
    setClients((prev) =>
      prev.map((c) =>
        c.id === activeClientId
          ? { ...c, docsUploaded: (c.docsUploaded || 0) + 1 }
          : c
      )
    )
    addAuditLog('DOC_UPLOAD', `Uploaded ${docData.name} (${docData.category}). Simulated in-memory processing engaged.`, activeClient?.name, activeClient?.pan, 'Document')
    return newDoc
  }

  // Simulate AI Extraction
  const runSimulatedExtraction = (callback) => {
    setIsSimulatingExtraction(true)
    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((d) =>
          d.clientId === activeClientId ? { ...d, status: 'Processed' } : d
        )
      )
      setIsSimulatingExtraction(false)
      addAuditLog('AI_EXTRACTION_COMPLETED', `Completed OCR extraction and bounding-box layout parsing across ${activeClientDocs.length} documents.`, activeClient?.name, activeClient?.pan, 'AI Pipeline')
      if (callback) callback()
    }, 2800)
  }

  // 3-Way Reconciliation Actions
  const acceptDiscrepancy = (itemId) => {
    if (!activeTaxCase) return

    setTaxCases((prev) =>
      prev.map((tc) => {
        if (tc.caseId !== activeTaxCase.caseId) return tc

        const updatedItems = tc.reconciliationItems.map((item) => {
          if (item.id === itemId) {
            return { ...item, isAccepted: true, status: 'MATCHED_RESOLVED' }
          }
          return item
        })

        const allResolved = updatedItems.every((item) => item.isAccepted || item.status === 'MATCHED' || item.status === 'MATCHED_RESOLVED')

        return {
          ...tc,
          reconciliationItems: updatedItems,
          status: allResolved ? 'Ready for Review' : 'Discrepancy Detected',
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
          status: newCount === 0 ? 'Ready for Review' : 'Action Required',
        }
      })
    )

    addAuditLog('DISCREPANCY_ACCEPTED', `Accepted discrepancy ${itemId} based on AIS verification. Adjusted gross income.`, activeClient?.name, activeClient?.pan, 'Reconciliation')
  }

  // CA Sign-off Action (Simulated Prototype Action)
  const approveTaxCase = (caseId, caNotes = 'Verified against TRACES 26AS, AIS SFT records, and Form 16 Part A+B. TDS credit validated.') => {
    const hash = 'demo-sha256-' + Math.random().toString(16).substring(2, 10) + '9e73d102' + Math.random().toString(16).substring(2, 10)
    
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
      prev.map((c) =>
        c.id === activeClientId ? { ...c, status: 'Filed' } : c
      )
    )

    addAuditLog('CA_ITR_APPROVED', `CA Rajesh Sharma simulated approval on ITR filing pack. Demo Identifier: ${hash}`, activeClient?.name, activeClient?.pan, 'Approval (Demo)')

    // Add notification
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: `Simulated Sign-Off: ${activeClient?.name}`,
      message: `Return approved under FCA #DEMO049281. Filing pack JSON is ready.`,
      timestamp: 'Just now',
      read: false,
      type: 'success',
      link: '/insights-delivery',
    }
    setNotifications((prev) => [newNotif, ...prev])
  }

  // Reject / Request Clarification
  const requestCorrection = (caseId, reason) => {
    setTaxCases((prev) =>
      prev.map((tc) => {
        if (tc.caseId !== caseId) return tc
        return {
          ...tc,
          status: 'Action Required',
          approval: {
            ...tc.approval,
            rejectionReason: reason,
          },
        }
      })
    )
    setClients((prev) =>
      prev.map((c) =>
        c.id === activeClientId ? { ...c, status: 'Action Required' } : c
      )
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
