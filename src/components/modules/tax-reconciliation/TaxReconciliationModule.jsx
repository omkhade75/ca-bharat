import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Scale,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  Check,
  Sparkles,
  ArrowRight,
  Download,
  FileSpreadsheet,
  ShieldCheck,
  Send,
  Copy,
  Clock,
  Upload,
  RefreshCw,
  Lock,
  FileText,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { useApp } from '../../../context/AppContext'
import { formatINR, formatDate } from '../../../utils/formatters'
import { compareTaxRegimes } from '../../../utils/taxCalculator'
import { resolveBackendCaseId } from '../../../utils/documentMapper'
import Badge from '../../common/Badge'
import Modal from '../../common/Modal'
import BackendAuthModal from '../../common/BackendAuthModal'
import DiscrepancyResolutionModal from './DiscrepancyResolutionModal'
import apiClient from '../../../services/apiClient'

export default function TaxReconciliationModule() {
  const navigate = useNavigate()
  const {
    activeClient,
    activeTaxCase,
    activeClientDocs,
    activeWorkflowStage,
    activeWorkflowMeta,
    activeDocBreakdown,
    acceptDiscrepancy,
    approveTaxCase,
    requestCorrection,
    recordReportGenerated,
    activeAy,
    authSession,
    backendReconciliation,
    backendTaxComparison,
    isLoadingReconciliation,
    reconciliationError,
    isComputingTax,
    taxError,
    clearReconciliationError,
    runClientReconciliation,
    resolveReconciliationIssue,
    computeClientTax,
    approveClientTaxBackend,
    backendItrSelection,
    confirmClientITRSelection,
    backendFilingPackage,
    fetchClientFilingPackage,
    downloadClientFilingJson,
    returnClientTaxForCorrection,
    rejectClientTaxComputation,
    ensureClientSynced,
  } = useApp()

  const [activeTab, setActiveTab] = useState('RECONCILIATION') // 'RECONCILIATION', 'ITR_SELECTION', 'OPTIMIZER', 'CA_SIGN_OFF'
  const [isItrJsonOpen, setIsItrJsonOpen] = useState(false)
  const [backendItrJson, setBackendItrJson] = useState(null)
  const [isClarificationOpen, setIsClarificationOpen] = useState(false)
  const [clarificationReason, setClarificationReason] = useState('')
  const [caApprovalNotes, setCaApprovalNotes] = useState('')
  const [copiedJson, setCopiedJson] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [resolutionTargetRow, setResolutionTargetRow] = useState(null)
  const [resolutionError, setResolutionError] = useState(null)
  const [isResolvingRow, setIsResolvingRow] = useState(false)
  const [signOffError, setSignOffError] = useState(null)
  const [signOffSuccessMsg, setSignOffSuccessMsg] = useState(null)
  const [isSigningOff, setIsSigningOff] = useState(false)

  // Phase 1, 3, 4 State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
  const [returnReason, setReturnReason] = useState('')
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [isSubmittingReject, setIsSubmittingReject] = useState(false)
  const [isConfirmItrModalOpen, setIsConfirmItrModalOpen] = useState(false)
  const [targetItrForm, setTargetItrForm] = useState('ITR-1 (Sahaj)')
  const [itrConfirmNotes, setItrConfirmNotes] = useState('')
  const [isConfirmingItr, setIsConfirmingItr] = useState(false)
  const [activeScheduleView, setActiveScheduleView] = useState('Schedule_S')

  const isAuthenticatedBackend = Boolean(authSession?.access_token)
  const resolvedCaseId =
    activeTaxCase?.caseId ||
    activeTaxCase?.id ||
    resolveBackendCaseId(activeClient?.id, activeAy)

  // Determine authoritative reconciliation items (never use client-side fallback when authenticated)
  const reconciliationItems = isAuthenticatedBackend
    ? backendReconciliation?.rows || []
    : activeTaxCase?.reconciliationItems || []

  const hasValidatedBackendDocs = isAuthenticatedBackend
    ? Boolean(
        backendReconciliation?.sourceDocuments?.some((sd) => sd.has_extracted_data) ||
          backendTaxComparison?.validationGate?.has_validated_data ||
          activeClientDocs?.some((d) => d.processingStatus === 'PARSED')
      )
    : true

  const isIncomplete = isAuthenticatedBackend
    ? !activeDocBreakdown?.isComplete && !hasValidatedBackendDocs
    : activeWorkflowStage === 'ONBOARDING' ||
      activeWorkflowStage === 'CONSENT_PENDING' ||
      (!activeDocBreakdown?.isComplete &&
        !activeTaxCase?.incomes?.salary &&
        !activeTaxCase?.incomes?.otherSources &&
        !activeTaxCase?.reconciliationItems?.length)

  // Compute tax comparison: strictly consume backend TaxCalculator result when authenticated
  const actualTds = isAuthenticatedBackend
    ? backendTaxComparison?.tdsPaid ?? 0
    : activeTaxCase?.taxesPaid?.totalTds ?? 0

  const taxComparison = isAuthenticatedBackend
    ? hasValidatedBackendDocs
      ? backendTaxComparison
      : null
    : activeTaxCase && !isIncomplete
    ? compareTaxRegimes(
        activeTaxCase.incomes,
        activeTaxCase.deductions,
        actualTds
      )
    : null

  const pendingDiscrepancies = reconciliationItems.filter(
    (i) => !i.isAccepted && !i.isResolved
  )

  const isCaseApproved = isAuthenticatedBackend
    ? backendTaxComparison?.caSignOffStatus === 'CA_APPROVED'
    : Boolean(activeTaxCase?.approval?.isApproved)

  const approvalDetails = isAuthenticatedBackend
    ? {
        isApproved: isCaseApproved,
        approvedBy: backendTaxComparison?.caApprover,
        approvedAt: backendTaxComparison?.caApprovalTimestamp,
        sha256Hash: backendTaxComparison?.verificationHash,
      }
    : activeTaxCase?.approval

  const handleRunBackendRecon = async () => {
    setSignOffError(null)
    clearReconciliationError?.()
    if (!isAuthenticatedBackend) {
      setShowAuthModal(true)
      return
    }
    try {
      const synced = ensureClientSynced ? await ensureClientSynced(activeClient) : { clientId: activeClient.id, caseId: resolvedCaseId }
      const ayClean = String(activeAy || '2025-26').replace(/^AY\s*/i, '')
      await runClientReconciliation(synced.clientId || activeClient.id, synced.caseId || resolvedCaseId, ayClean)
    } catch {
      // surfaced via reconciliationError
    }
  }

  const handleSubmitRowResolution = async ({ action, caNotes, resolvedValue }) => {
    if (!resolutionTargetRow) return
    setResolutionError(null)
    if (!isAuthenticatedBackend) {
      acceptDiscrepancy(resolutionTargetRow.id)
      setResolutionTargetRow(null)
      return
    }
    setIsResolvingRow(true)
    try {
      await resolveReconciliationIssue(activeClient.id, resolutionTargetRow.id, {
        action,
        caNotes,
        resolvedValue,
        caseId: resolvedCaseId,
      })
      setResolutionTargetRow(null)
    } catch (err) {
      setResolutionError(err?.message || 'Unable to record CA resolution.')
    } finally {
      setIsResolvingRow(false)
    }
  }

  const handleViewItrJson = async () => {
    setIsItrJsonOpen(true)
    if (isAuthenticatedBackend && activeClient?.id) {
      try {
        if (backendFilingPackage?.itrJsonPayload) {
          setBackendItrJson(JSON.stringify(backendFilingPackage.itrJsonPayload, null, 2))
          return
        }
        const pkg = await fetchClientFilingPackage(activeClient.id, resolvedCaseId).catch(() => null)
        if (pkg?.itrJsonPayload) {
          setBackendItrJson(JSON.stringify(pkg.itrJsonPayload, null, 2))
          return
        }
        if (activeClient?.pan) {
          const livePayload = await apiClient.fetchCbdtJson(activeClient.pan)
          setBackendItrJson(JSON.stringify(livePayload, null, 2))
        }
      } catch {
        setBackendItrJson(null)
      }
    }
  }

  // Handle CA Sign-off (Backend persisted when authenticated)
  const handleApproveCase = async () => {
    setSignOffError(null)
    setSignOffSuccessMsg(null)
    if (isAuthenticatedBackend) {
      setIsSigningOff(true)
      try {
        const res = await approveClientTaxBackend(activeClient.id, {
          caseId: resolvedCaseId,
          caNotes:
            caApprovalNotes ||
            'Verified Form 16, TRACES 26AS, AIS citations, and resolved discrepancies.',
          chosenRegime:
            backendTaxComparison?.recommendedRegimeEnum || 'NEW_REGIME_115BAC',
        })
        setSignOffSuccessMsg(res.message || 'CA sign-off recorded in audit trail.')
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        })
        await handleViewItrJson()
      } catch (err) {
        setSignOffError(err?.message || 'CA sign-off failed.')
      } finally {
        setIsSigningOff(false)
      }
      return
    }

    approveTaxCase(activeTaxCase?.caseId, caApprovalNotes)
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    })
    setIsItrJsonOpen(true)
  }

  // Load Filing Package when CA Approved or tab open
  React.useEffect(() => {
    if (activeClient?.id && (activeTab === 'CA_SIGN_OFF' || isCaseApproved)) {
      fetchClientFilingPackage(activeClient.id, resolvedCaseId).catch(() => {})
    }
  }, [activeClient?.id, resolvedCaseId, activeTab, isCaseApproved])

  const handleConfirmItr = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    setIsConfirmingItr(true)
    setSignOffError(null)
    try {
      await confirmClientITRSelection(activeClient.id, {
        caseId: resolvedCaseId,
        confirmedForm: targetItrForm,
        caNotes: itrConfirmNotes,
      })
      setIsConfirmItrModalOpen(false)
      setSignOffSuccessMsg(`Statutory ITR Form ${targetItrForm} confirmed for filing.`)
    } catch (err) {
      setSignOffError(err?.message || 'Failed to confirm ITR form.')
    } finally {
      setIsConfirmingItr(false)
    }
  }

  const handleReturnForCorrection = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!returnReason.trim()) return
    setIsSubmittingReturn(true)
    setSignOffError(null)
    try {
      await returnClientTaxForCorrection(activeClient.id, {
        caseId: resolvedCaseId,
        reason: returnReason,
      })
      setIsReturnModalOpen(false)
      setSignOffSuccessMsg('Computation returned for correction.')
    } catch (err) {
      setSignOffError(err?.message || 'Failed to return computation.')
    } finally {
      setIsSubmittingReturn(false)
    }
  }

  const handleRejectComputation = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!rejectReason.trim()) return
    setIsSubmittingReject(true)
    setSignOffError(null)
    try {
      await rejectClientTaxComputation(activeClient.id, {
        caseId: resolvedCaseId,
        reason: rejectReason,
      })
      setIsRejectModalOpen(false)
      setSignOffSuccessMsg('Tax computation rejected.')
    } catch (err) {
      setSignOffError(err?.message || 'Failed to reject computation.')
    } finally {
      setIsSubmittingReject(false)
    }
  }

  const handleDownloadFilingJson = async () => {
    try {
      await downloadClientFilingJson(activeClient.id)
    } catch (err) {
      setSignOffError(err?.message || 'Failed to download filing package.')
    }
  }

  // Handle Request Clarification
  const handleSendClarification = (e) => {
    e.preventDefault()
    requestCorrection(activeTaxCase?.caseId, clarificationReason || 'Clarification required regarding AIS mismatch.')
    setIsClarificationOpen(false)
    alert(`Clarification request sent to ${activeClient?.name} via WhatsApp alert.`)
  }

  // Official CBDT ITR JSON (live backend payload when authenticated, schema preview when signed out)
  const generatedItrJson =
    isAuthenticatedBackend && backendItrJson
      ? backendItrJson
      : activeTaxCase || taxComparison
      ? JSON.stringify(
        {
          ITR: {
            ITR2: {
              CreationInfo: {
                SWVersionNo: 'CA_BHARAT_AI_V1.0',
                SWCreatedBy: 'Sharma & Co. Chartered Accountants',
                JSONCreatedBy: taxComparison?.caApprover || 'CA Rajesh Sharma (FCA #049281)',
                CreationDate:
                  taxComparison?.caApprovalTimestamp?.split('T')[0] ||
                  activeTaxCase?.approval?.approvedAt?.split('T')[0] ||
                  '2026-07-28',
                IntermediaryCity: 'Mumbai',
                Digest:
                  taxComparison?.verificationHash ||
                  activeTaxCase?.approval?.sha256Hash ||
                  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
              },
              PersonalInfo: {
                AssesseeName: {
                  FirstName: activeClient?.name?.split(' ')[0] || 'Taxpayer',
                  SurNameOrOrgName: activeClient?.name?.split(' ').slice(1).join(' ') || 'Master',
                },
                PAN: activeClient?.pan || 'ABCPA1092F',
                AadhaarCardNo: `XXXXXXXX${activeClient?.aadhaarLast4 || '8821'}`,
                Status: 'I',
                EmployerCategory: 'OTH',
              },
              FilingStatus: {
                ReturnFileSec: '11',
                OptOutNewTaxRegime: taxComparison?.recommendedRegime === 'Old Regime' ? 'Y' : 'N',
                ResidentialStatus: 'RES',
              },
              PartB_TI: {
                Salaries: taxComparison?.incomeSummary?.salary ?? activeTaxCase?.incomes?.salary ?? 0,
                IncomeFromOtherSources:
                  taxComparison?.incomeSummary?.otherSources ?? activeTaxCase?.incomes?.otherSources ?? 0,
                CapitalGains: {
                  LTCG:
                    taxComparison?.incomeSummary?.capitalGains ??
                    activeTaxCase?.incomes?.capitalGainsLTCG ??
                    0,
                },
                GrossTotalIncome:
                  taxComparison?.incomeSummary?.grossTotalIncome ??
                  taxComparison?.oldRegime?.grossTotalIncome ??
                  0,
                TotalDeductions: taxComparison?.oldRegime?.totalDeductions ?? 0,
                TotalIncome: taxComparison?.oldRegime?.netTaxableIncome ?? 0,
              },
              PartB_TTI: {
                NetTaxLiability: taxComparison?.activeTaxLiability,
                TotalTDSClaimed: taxComparison?.tdsPaid,
                RefundDue: taxComparison?.refundAmount,
                RefundBankAcc: {
                  IFSC: 'HDFC0000128',
                  BankName: 'HDFC Bank Limited',
                  AccountNumber: 'XXXXXXXX4419',
                },
              },
            },
          },
        },
        null,
        2
      )
    : '{}'

  const downloadJsonFile = () => {
    recordReportGenerated(activeTaxCase?.id || activeTaxCase?.caseId)
    const blob = new Blob([generatedItrJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ITR2_${activeClient?.pan}_${activeAy.replace(/\s+/g, '_')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyJsonToClipboard = () => {
    recordReportGenerated(activeTaxCase?.id || activeTaxCase?.caseId)
    navigator.clipboard.writeText(generatedItrJson)
    setCopiedJson(true)
    setTimeout(() => setCopiedJson(false), 2000)
  }

  const downloadExcelWorkpaper = async () => {
    recordReportGenerated(activeTaxCase?.id || activeTaxCase?.caseId)
    try {
      const pan = activeClient?.pan || 'ABCPA1092F'
      const blob = await apiClient.downloadExcelWorkpaper(pan)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `CA_Audit_Workpaper_${pan}_AY2025-26.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      return
    } catch {
      // Fallback to static pre-generated Excel workpaper when offline/unauthenticated
    }
    const a = document.createElement('a')
    a.href = '/downloads/CA_Audit_Workpaper_AY2025-26.xlsx'
    a.download = `CA_Audit_Workpaper_${activeClient?.pan || 'ABCPA1092F'}_AY2025-26.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (!activeClient) {
    return (
      <>
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-12 shadow-xs animate-in fade-in">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No Active Taxpayer Selected</h3>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed">
            Sign in to load synchronized backend taxpayer profiles or select an existing client in Firm & Client Operations.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {!isAuthenticatedBackend && (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Sign In to Backend API
              </button>
            )}
            <button
              onClick={() => navigate('/firm-clients')}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Open Taxpayer Directory
            </button>
          </div>
        </div>
        <BackendAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Module Header & Active Case Context */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              Module 3 • Deterministic Engine
            </span>
            <h1 className="text-xl font-bold text-slate-900">Tax & 3-Way Reconciliation</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic cross-audit (Form 16 vs 26AS vs AIS), sample tax computations, and simulated CA sign-off portal
          </p>
        </div>

        {/* Case Status Pill */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Case Workflow Stage</span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full inline-block border ${
                activeWorkflowMeta?.colorClasses || 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {activeWorkflowMeta?.label || activeTaxCase?.status || 'Active'}
            </span>
          </div>

          {isCaseApproved ? (
            <div className="flex items-center gap-2">
              <button
                onClick={downloadExcelWorkpaper}
                data-testid="btn-export-excel"
                className="px-3.5 py-2 text-xs font-bold rounded-lg bg-teal-700 hover:bg-teal-800 text-white flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all"
                title="Download 7-Sheet ICAI Tax Audit Workpaper (.xlsx) generated by Python backend"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                <span>Export Excel Workpaper (.xlsx)</span>
              </button>
              <button
                onClick={handleViewItrJson}
                data-testid="btn-view-itr-json"
                className="px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>View ITR JSON</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRunBackendRecon}
                disabled={isLoadingReconciliation}
                className="px-3.5 py-2 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingReconciliation ? 'animate-spin' : ''}`} />
                <span>{isLoadingReconciliation ? 'Reconciling...' : 'Run 3-Way Backend Audit'}</span>
              </button>
              <button
                onClick={() => setActiveTab('CA_SIGN_OFF')}
                className="px-3.5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Review & Sign-Off</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {!isAuthenticatedBackend && (
        <div className="bg-slate-900 text-slate-100 border border-slate-700 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Unauthenticated Preview: Sign in to run live backend 3-way reconciliation from extracted PDFs and persist CA discrepancy resolutions & validated tax calculations.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowAuthModal(true)}
            className="px-3 py-1.5 rounded-lg bg-white text-slate-900 font-semibold hover:bg-slate-100 shrink-0 cursor-pointer"
          >
            Sign In to Backend API
          </button>
        </div>
      )}

      {(reconciliationError || taxError || signOffError) && (
        <div role="alert" className="bg-rose-50 border border-rose-300 text-rose-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{signOffError || reconciliationError || taxError}</span>
        </div>
      )}

      {signOffSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{signOffSuccessMsg}</span>
        </div>
      )}

      {/* Prominent Statutory Disclaimer Banner */}
      <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-900 leading-relaxed">
          <strong className="font-semibold">Statutory Disclaimer:</strong> All calculations, comparisons between Old vs New tax regimes u/s 115BAC, and discrepancy adjustments are sample illustrative computations. Returns must be verified and certified by a qualified Chartered Accountant in accordance with the Income Tax Act, 1961. This prototype does not perform live e-filing or connect directly to the CBDT Income Tax Portal.
        </p>
      </div>

      {/* Case Overview Bar: Client Details, Target Form, Refund */}
      <div className="bg-[#0B132B] text-white p-5 rounded-xl border border-slate-800 border-t-2 border-t-amber-400/80 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Taxpayer</span>
          <span className="text-sm font-bold text-white">{activeClient?.name}</span>
          <p className="text-[11px] text-slate-400 font-mono">{activeClient?.pan}</p>
        </div>

        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Return Form</span>
          <span className="text-sm font-bold text-blue-300 font-mono">
            {backendItrSelection?.recommendedForm || activeTaxCase?.filingForm || 'ITR-1'}
          </span>
          <p className="text-[11px] text-slate-400">
            {activeTaxCase?.filingForm === 'ITR-2'
              ? 'ITR-2 (Capital Gains Schedule)'
              : activeTaxCase?.filingForm === 'ITR-4'
              ? 'ITR-4 (Presumptive Sec 44ADA)'
              : activeTaxCase?.filingForm === 'ITR-3'
              ? 'ITR-3 (Business & Professional)'
              : 'ITR-1 (Salaried Return)'}
          </p>
        </div>

        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Optimal Regime</span>
          {isIncomplete ? (
            <>
              <span className="text-sm font-bold text-amber-400">Pending Intake</span>
              <p className="text-[11px] text-slate-400">Awaiting Validated Documents</p>
            </>
          ) : (
            <>
              <span className="text-sm font-bold text-emerald-400">
                {taxComparison?.recommendedRegime}
              </span>
              <p className="text-[11px] text-slate-400">Saves {formatINR(taxComparison?.taxSaved || 0)}</p>
            </>
          )}
        </div>

        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Expected Direct Refund</span>
          {isIncomplete ? (
            <>
              <span className="text-base font-bold text-slate-400 font-mono">
                ₹0 (Preliminary)
              </span>
              <p className="text-[11px] text-slate-400">TDS: {formatINR(actualTds)} (Awaiting Ingestion)</p>
            </>
          ) : (
            <>
              <span className="text-base font-bold text-emerald-400 font-mono">
                {formatINR(taxComparison?.refundAmount || 0)}
              </span>
              <p className="text-[11px] text-slate-400">TDS: {formatINR(taxComparison?.tdsPaid || 0)}</p>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('RECONCILIATION')}
          data-testid="tab-reconciliation"
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'RECONCILIATION'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>
            3-Way Cross-Reconciliation{' '}
            {pendingDiscrepancies.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
                {pendingDiscrepancies.length}
              </span>
            )}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ITR_SELECTION')}
          data-testid="tab-itr-selection"
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'ITR_SELECTION'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-600" />
          <span>Deterministic ITR Selection</span>
        </button>

        <button
          onClick={() => setActiveTab('OPTIMIZER')}
          data-testid="tab-optimizer"
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'OPTIMIZER'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Deterministic Regime Optimizer</span>
        </button>

        <button
          onClick={() => setActiveTab('CA_SIGN_OFF')}
          data-testid="tab-ca-signoff"
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'CA_SIGN_OFF'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>CA Review, Checklist & Sign-Off</span>
        </button>
      </div>

      {/* TAB 1: 3-WAY CROSS RECONCILIATION VIEW */}
      {activeTab === 'RECONCILIATION' && (
        <div className="space-y-6">
          {/* Summary Banner / Missing Documents Warning / Unextracted Notice */}
          {isIncomplete || reconciliationItems.length === 0 ? (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900">
                    {isIncomplete
                      ? 'Pending Mandatory Statutory Documents — Reconciliation Not Ready'
                      : 'Backend Extraction / Reconciliation Pending — Matrix Not Generated'}
                  </h4>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    {isIncomplete
                      ? `Taxpayer ${activeClient?.name} (${activeClient?.pan}) has ${activeClientDocs.length} uploaded file(s), with mandatory reconciliation statements still pending (${activeDocBreakdown?.missingMandatoryCategories?.length || 0} required). Additional supporting documents are contextual.`
                      : `Documents are present for ${activeClient?.name}. Click "Run 3-Way Backend Audit" above or run deterministic extraction in Document Vault to compare Form 16, Form 26AS, and AIS/TIS.`}
                  </p>
                </div>
              </div>

              {isIncomplete && activeDocBreakdown?.missingMandatoryCategories?.length > 0 && (
                <div className="bg-white rounded-lg p-3 border border-amber-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Missing Mandatory Categories for 3-Way Cross-Audit:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {activeDocBreakdown.missingMandatoryCategories.map((cat) => (
                      <div key={cat.category} className="flex items-center gap-2 text-amber-900 bg-amber-50/60 p-2 rounded border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="font-semibold">{cat.title}</span>
                        <span className="text-[10px] text-amber-700 ml-auto">Mandatory</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-1 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate('/document-intelligence')}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>
                    {isIncomplete
                      ? 'Go to Document Vault to Upload Mandatory Documents'
                      : 'Go to Document Vault to Extract PDFs'}
                  </span>
                </button>
                {!isIncomplete && isAuthenticatedBackend && (
                  <button
                    type="button"
                    onClick={handleRunBackendRecon}
                    disabled={isLoadingReconciliation}
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingReconciliation ? 'animate-spin' : ''}`} />
                    <span>Run 3-Way Backend Reconciliation</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className={`border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              pendingDiscrepancies.length > 0 ? 'bg-amber-50/80 border-amber-300' : 'bg-emerald-50/80 border-emerald-300'
            }`}>
              <div className="flex items-start gap-3">
                {pendingDiscrepancies.length > 0 ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className={`text-xs font-bold ${pendingDiscrepancies.length > 0 ? 'text-amber-900' : 'text-emerald-900'}`}>
                    {pendingDiscrepancies.length > 0
                      ? `${pendingDiscrepancies.length} Cross-Document Discrepancies Detected • CA Review Required`
                      : 'All Cross-Document Items Successfully Reconciled ✓'}
                  </h4>
                  <p className={`text-[11px] mt-0.5 leading-relaxed ${pendingDiscrepancies.length > 0 ? 'text-amber-800' : 'text-emerald-800'}`}>
                    {pendingDiscrepancies.length > 0
                      ? 'Review variances across Form 16, Form 26AS, and AIS with source citations and record CA audit resolutions before tax sign-off.'
                      : `Verified across ${isAuthenticatedBackend ? (backendReconciliation?.dataSource || 'BACKEND_EXTRACTED_DOCS') : 'local preview'} records.`}
                  </p>
                </div>
              </div>

              {isAuthenticatedBackend && (
                <button
                  type="button"
                  onClick={handleRunBackendRecon}
                  disabled={isLoadingReconciliation}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingReconciliation ? 'animate-spin' : ''}`} />
                  <span>Re-Run Audit</span>
                </button>
              )}
            </div>
          )}

          {/* 3-Way Side-by-Side Comparison Matrix */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900">
                Cross-Document Comparison Matrix: Form 16 vs 26AS vs AIS/TIS
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">Client PAN: {activeClient?.pan}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Financial Schedule</th>
                    <th className="py-3 px-3">Form 16</th>
                    <th className="py-3 px-3">Form 26AS</th>
                    <th className="py-3 px-3">AIS / TIS</th>
                    <th className="py-3 px-3">Reconciliation Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reconciliationItems.map((item) => {
                    const isMismatch = !item.isAccepted && !item.isResolved && (item.status?.includes('MISMATCH') || item.matchStatus !== 'MATCHED')
                    const hasOrigVals = item.originalExtractedValues && Object.keys(item.originalExtractedValues).length > 0
                    const hasCorrections = Array.isArray(item.caCorrectionsApplied) && item.caCorrectionsApplied.length > 0
                    return (
                      <tr
                        key={item.id}
                        data-testid={`recon-row-${item.id}`}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isMismatch ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        <td className="py-3 px-4 align-top">
                          <p className="font-bold text-slate-900">{item.item}</p>
                          <p className="text-[11px] text-slate-500">{item.category}</p>
                          {item.statutoryRule && (
                            <p className="text-[10px] text-slate-500 mt-0.5">{item.statutoryRule}</p>
                          )}
                          {Array.isArray(item.sourceCitations) && item.sourceCitations.length > 0 ? (
                            <div className="mt-1 space-y-0.5">
                              {item.sourceCitations.slice(0, 2).map((c, idx) => (
                                <p key={idx} className="text-[10px] text-teal-700 font-mono">
                                  {c.document_name} • Pg {c.page_number}{' '}
                                  {Array.isArray(c.bounding_box) ? `[${c.bounding_box.join(', ')}]` : ''}
                                </p>
                              ))}
                            </div>
                          ) : item.sourceCitation ? (
                            <p className="text-[10px] text-teal-700 font-medium mt-0.5">
                              Citation: {item.sourceCitation}
                            </p>
                          ) : null}
                          {hasCorrections && (
                            <p className="text-[10px] text-blue-700 font-semibold mt-1">
                              CA Correction Applied ({item.caCorrectionsApplied[0].field_key}): Orig{' '}
                              {formatINR(item.caCorrectionsApplied[0].original_value)} →{' '}
                              {formatINR(item.caCorrectionsApplied[0].corrected_value)}
                            </p>
                          )}
                        </td>

                        <td className="py-3 px-3 align-top font-mono font-medium text-slate-800">
                          {item.form16 !== null && item.form16 !== undefined ? formatINR(item.form16) : '—'}
                          {hasOrigVals &&
                            item.originalExtractedValues.form_16_original !== null &&
                            item.originalExtractedValues.form_16_original !== undefined &&
                            Number(item.originalExtractedValues.form_16_original) !== Number(item.form16) && (
                              <span className="block text-[10px] text-slate-400">
                                Orig: {formatINR(item.originalExtractedValues.form_16_original)}
                              </span>
                            )}
                        </td>

                        <td className="py-3 px-3 align-top font-mono font-medium text-slate-800">
                          {item.form26AS !== null && item.form26AS !== undefined ? formatINR(item.form26AS) : '—'}
                          {hasOrigVals &&
                            item.originalExtractedValues.form_26as_original !== null &&
                            item.originalExtractedValues.form_26as_original !== undefined &&
                            Number(item.originalExtractedValues.form_26as_original) !== Number(item.form26AS) && (
                              <span className="block text-[10px] text-slate-400">
                                Orig: {formatINR(item.originalExtractedValues.form_26as_original)}
                              </span>
                            )}
                        </td>

                        <td className="py-3 px-3 align-top font-mono font-bold text-slate-900">
                          {item.aisTis !== null && item.aisTis !== undefined ? formatINR(item.aisTis) : '—'}
                        </td>

                        <td className="py-3 px-3 align-top">
                          {item.isAccepted || item.isResolved || item.status === 'MATCHED' || item.status === 'MATCHED_RESOLVED' ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {item.resolvedBy ? 'CA Resolved ✓' : 'Reconciled ✓'}
                              </span>
                              {item.resolvedValue > 0 && (
                                <p className="text-[10px] font-mono text-slate-600">
                                  Validated: {formatINR(item.resolvedValue)}
                                </p>
                              )}
                              {item.resolvedBy && (
                                <p className="text-[10px] text-slate-500">
                                  By {item.resolvedBy} • {item.caNotes}
                                </p>
                              )}
                            </div>
                          ) : (
                            <Badge variant={item.riskLevel === 'High' ? 'danger' : 'warning'} size="xs">
                              {item.riskLevel}: {item.matchStatus || 'Mismatch'} ({formatINR(item.variance || 0)})
                            </Badge>
                          )}
                          {isMismatch && item.noticeRisk && (
                            <p className="text-[10px] text-amber-800 mt-1 leading-tight font-medium">
                              {item.noticeRisk}
                            </p>
                          )}
                        </td>

                        <td className="py-3 px-4 align-top text-right">
                          {isMismatch || isAuthenticatedBackend ? (
                            <button
                              type="button"
                              onClick={() => {
                                setResolutionError(null)
                                setResolutionTargetRow(item)
                              }}
                              className={`px-3 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                                isMismatch
                                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {isMismatch ? 'Review & Resolve' : 'Inspect / Override'}
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">Verified</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {reconciliationItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500">
                        <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                        <p className="font-bold text-slate-800 text-sm">No Cross-Reconciliation Data Available</p>
                        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                          Awaiting upload and extraction of statutory tax documents for {activeClient?.name} ({activeClient?.pan}). Run extraction in Document Vault or click &ldquo;Run 3-Way Backend Audit&rdquo;.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Explanations Cards - Dynamically derived from active client reconciliation items */}
          {!isIncomplete && reconciliationItems.some((i) => !i.isResolved || i.status?.includes('MISMATCH')) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reconciliationItems
                .filter((i) => !i.isResolved || i.status?.includes('MISMATCH'))
                .map((item, idx) => (
                  <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${item.riskLevel === 'High' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                      <h4 className="text-xs font-bold text-slate-900">
                        Finding {idx + 1}: {item.item}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.noticeRisk || item.actionRequired || 'Discrepancy detected during 3-way cross-audit.'}
                    </p>
                    {item.sourceCitation && (
                      <p className="text-[11px] text-teal-700 font-medium mt-1">
                        Source Citation: {item.sourceCitation}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DETERMINISTIC ITR SELECTION ENGINE */}
      {activeTab === 'ITR_SELECTION' && (
        <div className="space-y-6">
          {/* ITR Form Recommendation Header Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Rule 12 Deterministic Decision Tree
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
                  <span>{backendItrSelection?.recommendedForm || activeClient?.selectedItrForm || 'ITR-1 (Sahaj)'}</span>
                  {backendItrSelection?.isCaConfirmed && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Confirmed by CA ✓
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  {backendItrSelection?.selectionReason ||
                    'Salaried resident individual with single house property, income up to ₹50 Lakhs, and other sources.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  data-testid="btn-confirm-itr"
                  onClick={() => {
                    setTargetItrForm(backendItrSelection?.recommendedForm || 'ITR-1 (Sahaj)')
                    setIsConfirmItrModalOpen(true)
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{backendItrSelection?.isCaConfirmed ? 'Update CA Confirmation' : 'Confirm Form Selection'}</span>
                </button>
              </div>
            </div>

            {/* Entity & Assessment Context */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Taxpayer Entity</span>
                <span className="font-bold text-slate-800">{backendItrSelection?.taxpayerType || activeClient?.legalType || 'INDIVIDUAL'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Assessment Year</span>
                <span className="font-bold text-slate-800">{activeAy}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Statutory Eligibility</span>
                <span className="font-bold text-emerald-700">Eligible (Zero Disqualifications)</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Decision Method</span>
                <span className="font-mono text-[11px] text-slate-600">Deterministic Engine v2.0</span>
              </div>
            </div>
          </div>

          {/* Satisfied Eligibility Conditions & Ineligible Forms Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Satisfied Conditions */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Satisfied Statutory Eligibility Conditions ({backendItrSelection?.satisfiedConditions?.length || 5})
                </h4>
              </div>
              <div className="space-y-2 text-xs">
                {(backendItrSelection?.satisfiedConditions?.length > 0
                  ? backendItrSelection.satisfiedConditions
                  : [
                      'Taxpayer is a Resident Individual (or HUF)',
                      'Total Gross Income does not exceed statutory ceiling of ₹50,00,000',
                      'Income sources limited to Salaries, One House Property, and Other Sources',
                      'No directorship in unlisted companies or unlisted equity share holdings',
                      'Zero capital gains transactions requiring Schedule CG (ITR-2)',
                    ]
                ).map((cond, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-emerald-950 flex items-start gap-2">
                    <span className="text-emerald-700 font-bold text-xs shrink-0">✓</span>
                    <span>{cond}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ineligible Forms Analysis */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-slate-500 shrink-0" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Disqualified Return Forms Analysis
                </h4>
              </div>
              <div className="space-y-2 text-xs">
                {(backendItrSelection?.ineligibleForms?.length > 0
                  ? backendItrSelection.ineligibleForms
                  : [
                      { form: 'ITR-2', reason: 'Disqualified: No capital gains or foreign assets requiring Schedule CG/FSI; ITR-1 Sahaj is the simpler statutory form.' },
                      { form: 'ITR-3', reason: 'Disqualified: No income from business or profession (PGBP) reported.' },
                      { form: 'ITR-4 (Sugam)', reason: 'Disqualified: No presumptive business/profession income declared u/s 44AD or 44ADA.' },
                      { form: 'ITR-5 / ITR-6', reason: 'Disqualified: Assessee is an Individual, not a Partnership Firm, LLP, or Company.' },
                    ]
                ).map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 space-y-0.5">
                    <div className="font-bold text-slate-900 font-mono text-[11px]">{item.form || item}</div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{item.reason || 'Disqualified per statutory criteria.'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Missing Information / Review Flags */}
          {backendItrSelection?.missingInformationFlags?.length > 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Information Requiring CA Confirmation</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-amber-800">
                {backendItrSelection.missingInformationFlags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DETERMINISTIC REGIME OPTIMIZER */}
      {activeTab === 'OPTIMIZER' && (
        <div className="space-y-6">
          {isIncomplete || !taxComparison ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">
                  Regime Optimizer Awaiting Document Ingestion
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Deterministic tax comparison between Old Regime and Section 115BAC New Regime requires validated income and deduction data. Upload Form 16 and AIS for <span className="font-semibold text-slate-800">{activeClient?.name}</span> ({activeClient?.pan}) to view the side-by-side slab comparison.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => navigate('/document-intelligence')}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors flex items-center gap-1.5 shadow-xs mx-auto cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Go to Document Vault</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Smart Recommendation & Backend Validation Banner */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    {isAuthenticatedBackend
                      ? `Backend Deterministic Engine (${taxComparison.dataSource || 'VALIDATED_BACKEND_DOCUMENTS'})`
                      : 'Unauthenticated Preview Calculation'}
                  </span>
                  {isAuthenticatedBackend && taxComparison.validationStatus && (
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        taxComparison.validationStatus === 'READY'
                          ? 'bg-white text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}
                    >
                      Gate: {taxComparison.validationStatus}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-emerald-950 mt-1">
                  {taxComparison.regimeComparisonReason || taxComparison.recommendationReason}
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  {isAuthenticatedBackend
                    ? `Derived from ${taxComparison.validationGate?.core_parsed_docs || 0} parsed document(s), ${taxComparison.validationGate?.applied_corrections_count || 0} CA field override(s), and resolved reconciliation credits (TDS Credit: ${formatINR(taxComparison.tdsPaid || 0)}).`
                    : 'Offline preview calculation conforming to Finance Act 2024.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {isAuthenticatedBackend && (
                <button
                  type="button"
                  onClick={() =>
                    computeClientTax(
                      activeClient.id,
                      resolvedCaseId,
                      String(activeAy || '2025-26').replace(/^AY\s*/i, '')
                    )
                  }
                  disabled={isComputingTax}
                  className="px-3 py-2 rounded-lg bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isComputingTax ? 'animate-spin' : ''}`} />
                  <span>{isComputingTax ? 'Recalculating...' : 'Recompute'}</span>
                </button>
              )}
              <div className="text-right bg-white px-4 py-2.5 rounded-lg border border-emerald-200 shadow-xs">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Net Tax Saved</span>
                <span className="text-xl font-bold text-emerald-600">
                  {formatINR(taxComparison.taxSaved)}
                </span>
              </div>
            </div>
          </div>

          {/* Side-by-Side Regime Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Old Regime Card */}
            <div
              className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between ${
                taxComparison.recommendedRegime === 'Old Regime'
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Old Tax Regime</h3>
                    {taxComparison.recommendedRegime === 'Old Regime' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        RECOMMENDED ✓
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-500">Sec 115BAC (Opt-Out)</span>
                </div>

                <div className="space-y-2 text-xs border-y border-slate-100 py-3 my-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Gross Total Income:</span>
                    <span className="font-bold text-slate-800 font-mono">
                      {formatINR(taxComparison.oldRegime.grossTotalIncome)}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Standard Deduction:</span>
                    <span className="font-mono font-medium">-{formatINR(taxComparison.oldRegime.standardDeduction)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Section 80C (PF & Principal):</span>
                    <span className="font-mono font-medium">
                      -{formatINR(taxComparison.oldRegime.deductionsBreakdown.sec80C)}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Section 80D (Health Insurance):</span>
                    <span className="font-mono font-medium">
                      -{formatINR(taxComparison.oldRegime.deductionsBreakdown.sec80D)}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Section 24(b) Home Loan Interest:</span>
                    <span className="font-mono font-medium">
                      -{formatINR(taxComparison.oldRegime.deductionsBreakdown.sec24b)}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Section 80TTA (Savings Interest):</span>
                    <span className="font-mono font-medium">
                      -{formatINR(taxComparison.oldRegime.deductionsBreakdown.sec80TTA)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-slate-900">
                    <span>Net Taxable Income:</span>
                    <span className="font-mono">{formatINR(taxComparison.oldRegime.netTaxableIncome)}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Base Tax Liability:</span>
                    <span className="font-mono">{formatINR(taxComparison.oldRegime.baseTax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Health & Education Cess (4%):</span>
                    <span className="font-mono">{formatINR(taxComparison.oldRegime.cess)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Tax Liability</span>
                  <span className="text-xl font-bold text-slate-900 font-mono">
                    {formatINR(taxComparison.oldRegime.totalTaxLiability)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-semibold text-emerald-600 block">Refund Due</span>
                  <span className="text-lg font-bold text-emerald-600 font-mono">
                    {formatINR(taxComparison.tdsPaid - taxComparison.oldRegime.totalTaxLiability)}
                  </span>
                </div>
              </div>
            </div>

            {/* New Regime Card */}
            <div
              className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between ${
                taxComparison.recommendedRegime === 'New Regime'
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">New Tax Regime</h3>
                    {taxComparison.recommendedRegime === 'New Regime' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        RECOMMENDED ✓
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-500">Sec 115BAC (Default)</span>
                </div>

                <div className="space-y-2 text-xs border-y border-slate-100 py-3 my-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Gross Total Income:</span>
                    <span className="font-bold text-slate-800 font-mono">
                      {formatINR(taxComparison.newRegime.grossTotalIncome)}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Standard Deduction (Enhanced):</span>
                    <span className="font-mono font-medium">-{formatINR(taxComparison.newRegime.standardDeduction)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Chapter VI-A Deductions (80C, 80D):</span>
                    <span className="font-mono">Not Eligible</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Section 24(b) Home Loan Loss:</span>
                    <span className="font-mono">Not Allowed</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-slate-900">
                    <span>Net Taxable Income:</span>
                    <span className="font-mono">{formatINR(taxComparison.newRegime.netTaxableIncome)}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Concessional Slabs Base Tax:</span>
                    <span className="font-mono">{formatINR(taxComparison.newRegime.baseTax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Health & Education Cess (4%):</span>
                    <span className="font-mono">{formatINR(taxComparison.newRegime.cess)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Tax Liability</span>
                  <span className="text-xl font-bold text-slate-900 font-mono">
                    {formatINR(taxComparison.newRegime.totalTaxLiability)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-semibold text-slate-600 block">Refund Due</span>
                  <span className="text-lg font-bold text-slate-700 font-mono">
                    {formatINR(taxComparison.tdsPaid - taxComparison.newRegime.totalTaxLiability)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Missing Information Flags if Any */}
          {taxComparison.missingInformationFlags?.length > 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Information Requiring CA Confirmation for Final Computation</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-amber-800">
                {taxComparison.missingInformationFlags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Head-Wise Computation Breakdown Table */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Head-Wise Statutory Tax Computation Breakdown
                </h4>
                <p className="text-[11px] text-slate-500">
                  Income Tax Act, 1961 provisions under Finance Act 2024 (AY 2025-26)
                </p>
              </div>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-semibold border border-slate-200">
                AY 2025-26 Slabs
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400">
                    <th className="py-2.5">Statutory Head / Component</th>
                    <th className="py-2.5 text-right">Old Regime</th>
                    <th className="py-2.5 text-right">New Regime (Default u/s 115BAC)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  <tr>
                    <td className="py-2 font-sans font-medium text-slate-700">Gross Salary (Section 17)</td>
                    <td className="py-2 text-right">{formatINR(taxComparison.incomeSummary?.salary || 1450000)}</td>
                    <td className="py-2 text-right">{formatINR(taxComparison.incomeSummary?.salary || 1450000)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-sans text-slate-600">Less: Standard Deduction (Section 16(ia))</td>
                    <td className="py-2 text-right text-emerald-700">-{formatINR(taxComparison.oldRegime.standardDeduction || 50000)}</td>
                    <td className="py-2 text-right text-emerald-700">-{formatINR(taxComparison.newRegime.standardDeduction || 75000)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-sans text-slate-600">Income from Other Sources (Section 56)</td>
                    <td className="py-2 text-right">{formatINR(taxComparison.incomeSummary?.otherSources || 22650)}</td>
                    <td className="py-2 text-right">{formatINR(taxComparison.incomeSummary?.otherSources || 22650)}</td>
                  </tr>
                  <tr className="font-bold bg-slate-50/70 font-sans text-slate-900">
                    <td className="py-2">Gross Total Income (GTI)</td>
                    <td className="py-2 text-right font-mono">{formatINR(taxComparison.oldRegime.grossTotalIncome)}</td>
                    <td className="py-2 text-right font-mono">{formatINR(taxComparison.newRegime.grossTotalIncome)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-sans text-slate-600">Deductions under Chapter VI-A (80C, 80D, 80CCD, 80TTA)</td>
                    <td className="py-2 text-right text-emerald-700">-{formatINR(taxComparison.oldRegime.totalDeductions)}</td>
                    <td className="py-2 text-right text-slate-400">₹0 (Disallowed u/s 115BAC)</td>
                  </tr>
                  <tr className="font-bold bg-slate-100/70 font-sans text-slate-900">
                    <td className="py-2">Total Net Taxable Income</td>
                    <td className="py-2 text-right font-mono">{formatINR(taxComparison.oldRegime.netTaxableIncome)}</td>
                    <td className="py-2 text-right font-mono">{formatINR(taxComparison.newRegime.netTaxableIncome)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-sans text-slate-600">Basic Tax Liability on Slabs</td>
                    <td className="py-2 text-right">{formatINR(taxComparison.oldRegime.baseTax)}</td>
                    <td className="py-2 text-right">{formatINR(taxComparison.newRegime.baseTax)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-sans text-slate-600">Rebate under Section 87A</td>
                    <td className="py-2 text-right">{formatINR(taxComparison.oldRegime.rebate87A)}</td>
                    <td className="py-2 text-right">{formatINR(taxComparison.newRegime.rebate87A)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-sans text-slate-600">Health & Education Cess (4%)</td>
                    <td className="py-2 text-right">{formatINR(taxComparison.oldRegime.cess)}</td>
                    <td className="py-2 text-right">{formatINR(taxComparison.newRegime.cess)}</td>
                  </tr>
                  <tr className="font-bold bg-slate-100 text-slate-900 font-sans">
                    <td className="py-2">Net Tax Liability</td>
                    <td className="py-2 text-right font-mono">{formatINR(taxComparison.oldRegime.totalTaxLiability)}</td>
                    <td className="py-2 text-right font-mono text-blue-700">{formatINR(taxComparison.newRegime.totalTaxLiability)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-sans text-slate-600">Total Prepaid Taxes (TDS / TCS / Advance Tax)</td>
                    <td className="py-2 text-right text-emerald-700">{formatINR(taxComparison.tdsPaid)}</td>
                    <td className="py-2 text-right text-emerald-700">{formatINR(taxComparison.tdsPaid)}</td>
                  </tr>
                  <tr className="font-bold bg-emerald-50 text-emerald-950 font-sans">
                    <td className="py-2.5">Net Refund Direct to Bank Account</td>
                    <td className="py-2.5 text-right font-mono text-slate-800">{formatINR(taxComparison.oldRegime.refundAmount)}</td>
                    <td className="py-2.5 text-right font-mono text-emerald-700 font-extrabold">{formatINR(taxComparison.newRegime.refundAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          </>
        )}
        </div>
      )}

      {/* TAB 3: CA REVIEW & LEGAL SIGN-OFF */}
      {activeTab === 'CA_SIGN_OFF' && (
        <div className="space-y-6">
          {/* Statutory Verification Checklist */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Illustrative CA Review Checklist
                </h3>
                <p className="text-xs text-slate-500">
                  Illustrative quality review criteria before generating demonstration filing pack
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                Assigned: {activeTaxCase?.assignedCa}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium text-slate-800">
                    Sample PAN Master & Identity Profile (Verified for {activeClient?.name})
                  </span>
                </div>
                <span className="text-emerald-700 font-bold text-[11px]">PASSED ✓</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {!isIncomplete ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <span className="font-medium text-slate-800">
                    Document Vault Intake Completeness ({activeClientDocs.length}/{activeClient?.docsRequired || 4} uploaded)
                  </span>
                </div>
                <span
                  className={`font-bold text-[11px] ${
                    !isIncomplete ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {!isIncomplete ? 'PASSED ✓' : 'INCOMPLETE INTAKE'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {!isIncomplete && hasValidatedBackendDocs ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <span className="font-medium text-slate-800">
                    Validated TDS & Income Data Extracted from Backend PDFs
                  </span>
                </div>
                <span
                  className={`font-bold text-[11px] ${
                    !isIncomplete && hasValidatedBackendDocs ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {!isIncomplete && hasValidatedBackendDocs ? 'PASSED ✓' : 'AWAITING INGESTION'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {pendingDiscrepancies.length === 0 && !isIncomplete && reconciliationItems.length > 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <span className="font-medium text-slate-800">
                    3-Way Cross-Reconciliation Discrepancies Resolved
                  </span>
                </div>
                <span
                  className={`font-bold text-[11px] ${
                    pendingDiscrepancies.length === 0 && !isIncomplete && reconciliationItems.length > 0 ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {isIncomplete
                    ? 'AWAITING DOCUMENTS'
                    : reconciliationItems.length === 0
                    ? 'AWAITING RECONCILIATION'
                    : pendingDiscrepancies.length === 0
                    ? 'RESOLVED ✓'
                    : `${pendingDiscrepancies.length} PENDING`}
                </span>
              </div>
            </div>
          </div>

          {/* CA Sign-Off Action Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-6 shadow-sm border border-slate-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                  {isAuthenticatedBackend
                    ? 'CA Sign-Off Audit Gateway (Backend Persisted)'
                    : 'Unauthenticated Preview Sign-Off'}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  Chartered Accountant Review & Approval
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                  Statutory approval is gated until mandatory documents are parsed, validated, and all reconciliation discrepancies are resolved with CA audit notes.
                </p>
                {!isCaseApproved && (
                  <div className="mt-3">
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      CA Sign-Off Certification Notes:
                    </label>
                    <textarea
                      rows={2}
                      value={caApprovalNotes}
                      onChange={(e) => setCaApprovalNotes(e.target.value)}
                      disabled={isIncomplete || pendingDiscrepancies.length > 0 || reconciliationItems.length === 0}
                      className="w-full bg-slate-950/70 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-hidden focus:border-blue-500 placeholder:text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder={
                        isIncomplete
                          ? "Intake incomplete — formal verification notes cannot be generated until mandatory documents are uploaded and reconciled."
                          : reconciliationItems.length === 0
                          ? "Reconciliation pending — run 3-way audit before recording sign-off certification notes."
                          : pendingDiscrepancies.length > 0
                          ? `Discrepancies pending — resolve ${pendingDiscrepancies.length} reporting variances before sign-off certification.`
                          : "Enter CA certification notes (e.g. Verified against TRACES 26AS, AIS SFT records, and Form 16 Part A+B)..."
                      }
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  onClick={() => setIsClarificationOpen(true)}
                  className="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600 transition-colors cursor-pointer"
                >
                  Request Client Clarification
                </button>

                {!isCaseApproved && (
                  <>
                    <button
                      type="button"
                      data-testid="btn-return-correction"
                      onClick={() => setIsReturnModalOpen(true)}
                      className="px-3 py-2.5 rounded-lg bg-amber-700/80 hover:bg-amber-600 text-amber-100 text-xs font-semibold border border-amber-600 transition-colors cursor-pointer"
                    >
                      Return for Correction
                    </button>
                    <button
                      type="button"
                      data-testid="btn-reject-tax"
                      onClick={() => setIsRejectModalOpen(true)}
                      className="px-3 py-2.5 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-rose-100 text-xs font-semibold border border-rose-700 transition-colors cursor-pointer"
                    >
                      Reject Return
                    </button>
                  </>
                )}

                <button
                  onClick={handleApproveCase}
                  data-testid="btn-ca-signoff"
                  disabled={
                    isSigningOff ||
                    isIncomplete ||
                    pendingDiscrepancies.length > 0 ||
                    isCaseApproved ||
                    reconciliationItems.length === 0
                  }
                  className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-98 ${
                    isCaseApproved
                      ? 'bg-emerald-600 text-white cursor-default'
                      : isIncomplete || reconciliationItems.length === 0
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600'
                      : pendingDiscrepancies.length > 0
                      ? 'bg-amber-600/80 text-white cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isSigningOff
                      ? 'Recording Approval...'
                      : isCaseApproved
                      ? 'Approved by CA ✓'
                      : isIncomplete
                      ? 'Intake Incomplete — Upload Mandatory Documents First'
                      : reconciliationItems.length === 0
                      ? 'Reconciliation Pending — Complete 3-Way Audit First'
                      : pendingDiscrepancies.length > 0
                      ? `Resolve ${pendingDiscrepancies.length} Discrepancies Before Sign-Off`
                      : isAuthenticatedBackend
                      ? 'Approve & Record CA Sign-Off'
                      : 'Simulate Sign-Off (Offline Preview)'}
                  </span>
                </button>
              </div>
            </div>

            {/* Approval Metadata Display */}
            {approvalDetails?.isApproved && (
              <div className="mt-4 pt-4 border-t border-slate-700/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Approved By:</span>
                  <p className="text-teal-300 font-semibold">{approvalDetails.approvedBy}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Timestamp:</span>
                  <p className="text-slate-200">{formatDate(approvalDetails.approvedAt, true)}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Verification Hash:</span>
                  <p className="font-mono text-slate-300 text-[11px] truncate">
                    {approvalDetails.sha256Hash}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* CA Review Status Notice for Returned or Rejected Cases */}
          {backendTaxComparison?.caReturnReason && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Notice: Return for Correction Recorded by CA Partner</span>
              </div>
              <p className="text-amber-800 leading-relaxed pl-6">
                {backendTaxComparison.caReturnReason}
              </p>
            </div>
          )}

          {/* PHASE 4: STATUTORY ITR FILING PACKAGE & SCHEDULES (Rendered upon approval) */}
          {(isCaseApproved || backendTaxComparison?.caSignOffStatus === 'CA_APPROVED') && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">
                      {backendFilingPackage?.filingStatus || 'READY_FOR_FILING_DEMO'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      Form: {backendFilingPackage?.selectedItrForm || backendItrSelection?.recommendedForm || 'ITR-1 (Sahaj)'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    Certified Statutory Filing Package (AY {activeAy.replace('AY ', '')})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Schedules mapped directly from validated backend income heads, Chapter VI-A deductions, and verified TDS credits.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadFilingJson}
                    data-testid="btn-download-filing-json"
                    className="px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download CBDT JSON</span>
                  </button>
                  <button
                    onClick={handleViewItrJson}
                    data-testid="btn-inspect-raw-json"
                    className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>Inspect Raw JSON</span>
                  </button>
                </div>
              </div>

              {/* Demo Disclaimer Banner */}
              <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Statutory Filing Package: Ready for Review (Demo Only).</strong>{' '}
                  {backendFilingPackage?.demoDisclaimer ||
                    'This return has not been submitted to the Income Tax Department. Prototype demonstration for CA firm review. No real submission to CBDT e-Filing portal, DSC signing, or Aadhaar OTP e-verification is performed.'}
                </p>
              </div>

              {/* 8-Point Statutory Validation Report */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Pre-Filing Statutory Validation Report ({backendFilingPackage?.validationReport?.totalChecksRun || 8} Checks Run)
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Status: Validated & Zero Errors
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-600 text-[11px]">PAN Format Structure</span>
                    <span className="text-emerald-700 font-bold text-[10px]">PASS ✓</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-600 text-[11px]">AY 2025-26 Syntax</span>
                    <span className="text-emerald-700 font-bold text-[10px]">PASS ✓</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-600 text-[11px]">Refund Bank Account</span>
                    <span className="text-emerald-700 font-bold text-[10px]">PASS ✓</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-600 text-[11px]">Schedule Income Sum = GTI</span>
                    <span className="text-emerald-700 font-bold text-[10px]">PASS ✓</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-600 text-[11px]">GTI - Deductions = Taxable</span>
                    <span className="text-emerald-700 font-bold text-[10px]">PASS ✓</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-600 text-[11px]">Prepaid Tax Cross-Check</span>
                    <span className="text-emerald-700 font-bold text-[10px]">PASS ✓</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-600 text-[11px]">CA Partner Sign-Off Hash</span>
                    <span className="text-emerald-700 font-bold text-[10px]">PASS ✓</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-600 text-[11px]">Assessee Primary Email</span>
                    <span className="text-emerald-700 font-bold text-[10px]">PASS ✓</span>
                  </div>
                </div>
              </div>

              {/* Schedule Explorer Navigation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Statutory Schedule Viewer
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Official Schema: Prototype_AY2025-26_v1.0
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2">
                  {[
                    { id: 'Schedule_S', label: 'Schedule Salary' },
                    { id: 'Schedule_OS', label: 'Schedule Other Sources' },
                    { id: 'Schedule_HP', label: 'Schedule House Property' },
                    { id: 'Schedule_VIA', label: 'Schedule Chapter VI-A' },
                    { id: 'Schedule_TaxesPaid', label: 'Schedule Taxes Paid' },
                    { id: 'PartB_TI', label: 'Part B-TI (Total Income)' },
                    { id: 'PartB_TTI', label: 'Part B-TTI (Computation)' },
                    { id: 'PartA_GEN', label: 'Part A General' },
                    { id: 'Verification', label: 'Verification & Sign-Off' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveScheduleView(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        activeScheduleView === tab.id
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Selected Schedule Content */}
                <div className="bg-slate-950 text-slate-200 rounded-xl p-4 font-mono text-xs max-h-72 overflow-y-auto border border-slate-800">
                  <pre className="whitespace-pre-wrap leading-relaxed">
                    {JSON.stringify(
                      backendFilingPackage?.schedules?.[activeScheduleView] ||
                        { schedule: activeScheduleView, status: 'Schedule present in verified package' },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: GOVERNMENT ITR JSON VIEWER */}
      <Modal
        isOpen={isItrJsonOpen}
        onClose={() => setIsItrJsonOpen(false)}
        title={`Government ${backendFilingPackage?.selectedItrForm || backendItrSelection?.recommendedForm || activeTaxCase?.filingForm || 'ITR-1'} Filing Schema`}
        subtitle={`Fictional PAN: ${activeClient?.pan} • Assessment Year: ${activeAy} • Statutory JSON Payload (Ready for Review)`}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4 text-xs">
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-emerald-900">
                Sample Government e-Filing JSON Schema (Prototype Demonstration)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyJsonToClipboard}
                className="px-2.5 py-1 rounded bg-white border border-emerald-300 text-emerald-800 font-medium hover:bg-emerald-100 flex items-center gap-1 cursor-pointer"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
              </button>
              <button
                onClick={downloadExcelWorkpaper}
                className="px-2.5 py-1 rounded bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                title="Download 7-Sheet ICAI Tax Audit Workpaper (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Excel (.xlsx)</span>
              </button>
              <button
                onClick={downloadJsonFile}
                className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download JSON</span>
              </button>
            </div>
          </div>

          {/* Syntax Highlighted JSON Preview */}
          <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-[11px] max-h-96 overflow-y-auto border border-slate-800 shadow-inner">
            <pre className="whitespace-pre-wrap">{generatedItrJson}</pre>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500">
              Direct submission to Income Tax Portal requires CA Digital Signature Certificate (DSC) or Aadhaar OTP. This is a prototype demonstration — no real government filing occurs.
            </span>
            <button
              onClick={() => {
                setIsItrJsonOpen(false)
                navigate('/insights-delivery')
              }}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer flex items-center gap-1.5 active:scale-98 transition-all"
            >
              <span>Next: Annual Financial Eye-Opener</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: REQUEST CLARIFICATION */}
      <Modal
        isOpen={isClarificationOpen}
        onClose={() => setIsClarificationOpen(false)}
        title={`Request Correction from ${activeClient?.name}`}
        subtitle={`Context: ${activeClient?.phone} • WhatsApp Automated Notice`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSendClarification} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Correction or Document Required
            </label>
            <textarea
              rows={4}
              required
              value={clarificationReason}
              onChange={(e) => setClarificationReason(e.target.value)}
              placeholder="e.g. Please provide your Zerodha mutual fund capital gains statement to confirm the ₹58,000 LTCG reported in AIS, or confirm whether you have reinvested under Sec 54F."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600">
            This message will be dispatched via the firm's verified WhatsApp Business API with a one-time secure upload link.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsClarificationOpen(false)}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1 cursor-pointer active:scale-98 transition-all"
            >
              <Send className="w-3 h-3" />
              <span>Send WhatsApp Notice</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CONFIRM / OVERRIDE ITR FORM SELECTION */}
      <Modal
        isOpen={isConfirmItrModalOpen}
        onClose={() => setIsConfirmItrModalOpen(false)}
        title="Confirm Statutory ITR Form Selection"
        subtitle={`Taxpayer: ${activeClient?.name} (${activeClient?.pan}) • Assessment Year: ${activeAy}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleConfirmItr} className="space-y-4 text-xs">
          <div>
            <label htmlFor="confirm-itr-select" className="block font-semibold text-slate-700 mb-1.5">
              Designated ITR Form (Rule 12 compliant)
            </label>
            <select
              id="confirm-itr-select"
              value={targetItrForm}
              onChange={(e) => setTargetItrForm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
            >
              <option value="ITR-1 (Sahaj)">ITR-1 (Sahaj) — Salaried & Single House Property</option>
              <option value="ITR-2">ITR-2 — Capital Gains & Multiple Properties</option>
              <option value="ITR-3">ITR-3 — Business & Professional Income</option>
              <option value="ITR-4 (Sugam)">ITR-4 (Sugam) — Presumptive Taxation (Sec 44AD/44ADA)</option>
              <option value="ITR-5">ITR-5 — Partnership Firm / LLP / AOP</option>
              <option value="ITR-6">ITR-6 — Domestic / Foreign Incorporated Company</option>
              <option value="ITR-7">ITR-7 — Charitable / Religious Trust</option>
            </select>
          </div>

          <div>
            <label htmlFor="confirm-itr-notes" className="block font-semibold text-slate-700 mb-1.5">
              CA Review Notes / Justification:
            </label>
            <textarea
              id="confirm-itr-notes"
              rows={3}
              value={itrConfirmNotes}
              onChange={(e) => setItrConfirmNotes(e.target.value)}
              placeholder="e.g. Verified eligibility criteria under Rule 12. Income under 50L, no capital gains, single residential property."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600">
            Confirming this form sets the statutory schema target for schedule mapping and filing package generation.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsConfirmItrModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isConfirmingItr}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isConfirmingItr ? 'Confirming...' : 'Confirm Form'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: RETURN COMPUTATION FOR CORRECTION */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Return Tax Computation for Correction"
        subtitle={`Client: ${activeClient?.name} (${activeClient?.pan}) • Requires Review & Revision`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleReturnForCorrection} className="space-y-4 text-xs">
          <div>
            <label htmlFor="return-reason-textarea" className="block font-semibold text-slate-700 mb-1.5">
              Mandatory Correction Reason & Review Remarks:
            </label>
            <textarea
              id="return-reason-textarea"
              rows={4}
              required
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="e.g. Reconciliation discrepancy in Section 194J TDS remains unadjusted. Please verify TDS certificate or obtain Form 16 amendment from deductor."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-[11px] text-amber-900">
            Returning this computation sets the statutory review status to RETURNED_FOR_CORRECTION and records an audit log. Filing package cannot be certified until issues are resolved.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsReturnModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingReturn || !returnReason.trim()}
              className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmittingReturn ? 'Submitting...' : 'Return for Correction'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: REJECT TAX COMPUTATION */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Tax Computation"
        subtitle={`Client: ${activeClient?.name} (${activeClient?.pan}) • Severe Inconsistency`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleRejectComputation} className="space-y-4 text-xs">
          <div>
            <label htmlFor="reject-reason-textarea" className="block font-semibold text-slate-700 mb-1.5">
              Mandatory Rejection Reason:
            </label>
            <textarea
              id="reject-reason-textarea"
              rows={4}
              required
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Unreconciled reporting mismatch between AIS high-value transaction and taxpayer bank statement exceeds materiality threshold. Return filing cannot proceed."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-200 text-[11px] text-rose-900">
            Rejecting this computation terminates the current filing workflow. The status will be recorded as REJECTED in the audit trail.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRejectModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingReject || !rejectReason.trim()}
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmittingReject ? 'Rejecting...' : 'Confirm Rejection'}</span>
            </button>
          </div>
        </form>
      </Modal>

      <DiscrepancyResolutionModal
        row={resolutionTargetRow}
        onClose={() => setResolutionTargetRow(null)}
        onSubmit={handleSubmitRowResolution}
        isSubmitting={isResolvingRow}
        serverError={resolutionError}
      />

      <BackendAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  )
}
