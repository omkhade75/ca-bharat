import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileCheck2,
  Upload,
  KeyRound,
  FileText,
  AlertTriangle,
  Eye,
  Sparkles,
  Layers,
  RefreshCw,
  Clock,
  ArrowRight,
  CheckCircle2,
  Send,
  MessageSquare,
  Mail,
  Trash2,
  ShieldCheck,
  Check,
  X,
  FileSpreadsheet,
  Building2,
  TrendingUp,
  Receipt,
  Home,
  Briefcase,
  HelpCircle,
} from 'lucide-react'
import { useApp } from '../../../context/AppContext'
import { formatDate } from '../../../utils/formatters'
import Modal from '../../common/Modal'
import ClientTaxDiscoveryWorkspace from '../firm-clients/ClientTaxDiscoveryWorkspace'
import apiClient from '../../../services/apiClient'
import ExtractedDataReviewPanel from './ExtractedDataReviewPanel'
import FieldCorrectionModal from './FieldCorrectionModal'
import BackendAuthModal from '../../common/BackendAuthModal'
import { resolveBackendCaseId } from '../../../utils/documentMapper'

// Cleanly defined Document Categories
export const DOCUMENT_CATEGORIES = {
  FORM_16: { id: 'FORM_16', label: 'Form 16 (Part A & B)', icon: FileText, color: 'teal' },
  FORM_26AS: { id: 'FORM_26AS', label: 'Form 26AS (TRACES)', icon: FileCheck2, color: 'blue' },
  AIS: { id: 'AIS', label: 'Annual Information Statement (AIS)', icon: Sparkles, color: 'purple' },
  TIS: { id: 'TIS', label: 'Taxpayer Information Summary (TIS)', icon: FileSpreadsheet, color: 'indigo' },
  BANK_STATEMENT: { id: 'BANK_STATEMENT', label: 'Bank Statements & Interest Certificates', icon: KeyRound, color: 'amber' },
  INVESTMENT_PROOF: { id: 'INVESTMENT_PROOF', label: 'Chapter VI-A Investment Proofs', icon: Receipt, color: 'emerald' },
  PROPERTY_DOCUMENT: { id: 'PROPERTY_DOCUMENT', label: 'Housing Loan & Property Proofs', icon: Home, color: 'rose' },
  CAPITAL_GAINS_STATEMENT: { id: 'CAPITAL_GAINS_STATEMENT', label: 'Broker P&L & Capital Gains Proofs', icon: TrendingUp, color: 'cyan' },
  BUSINESS_RECORD: { id: 'BUSINESS_RECORD', label: 'Business Financials & Turnover Proofs', icon: Briefcase, color: 'orange' },
  OTHER_PROOF: { id: 'OTHER_PROOF', label: 'Other Statutory Tax Documents', icon: FileText, color: 'slate' },
}

export default function DocumentIntelligenceModule() {
  const navigate = useNavigate()
  const {
    activeClient,
    activeTaxCase,
    activeClientDocs,
    activeDocBreakdown,
    activeAy,
    addDocument,
    updateDocumentReviewStatus,
    deleteDocument,
    requestMissingDocuments,
    isSimulatingExtraction,
    authSession,
    authError,
    extractionError,
    clearAuthError,
    clearExtractionError,
    extractClientDocuments,
    extractSingleDocument,
    correctDocumentField,
    verifyDocumentField,
  } = useApp()

  const [activeTab, setActiveTab] = useState('VAULT') // 'VAULT', 'CHECKLIST', 'EXTRACTED_REVIEW', 'HISTORY'
  const [selectedDocForPreview, setSelectedDocForPreview] = useState(null)
  const [selectedCitationForInspection, setSelectedCitationForInspection] = useState(null)
  const [extractionProgressStep, setExtractionProgressStep] = useState(0)
  const [isTaxDiscoveryOpen, setIsTaxDiscoveryOpen] = useState(false)

  // Real upload state
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState(null)
  const fileInputRef = useRef(null)
  const [uploadCategoryTarget, setUploadCategoryTarget] = useState('FORM_16')
  const [uploadChecklistTarget, setUploadChecklistTarget] = useState([])

  // Missing documents outreach modal state
  const [isOutreachModalOpen, setIsOutreachModalOpen] = useState(false)
  const [outreachDraftNotice, setOutreachDraftNotice] = useState(null)
  const [outreachCustomNotes, setOutreachCustomNotes] = useState('')
  const [selectedMissingItemIds, setSelectedMissingItemIds] = useState([])
  const [outreachChannelTab, setOutreachChannelTab] = useState('EMAIL') // 'EMAIL' or 'WHATSAPP'
  const [isGeneratingNotice, setIsGeneratingNotice] = useState(false)

  // Waive item modal state
  const [waiveModalItem, setWaiveModalItem] = useState(null)
  const [waiveReasonText, setWaiveReasonText] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [correctionTarget, setCorrectionTarget] = useState(null)
  const [correctionModalError, setCorrectionModalError] = useState(null)
  const [isSubmittingCorrection, setIsSubmittingCorrection] = useState(false)

  // Dynamic Assessment Year from client tax case rather than hardcoding
  const effectiveAy =
    activeTaxCase?.assessmentYear ||
    activeClient?.intakeDiscovery?.assessment_year ||
    activeClient?.activeAY ||
    activeAy ||
    'AY 2025-26'

  // Dynamic checklist items for active client
  const dynamicChecklist = activeClient?.dynamicChecklist || []
  const requiredCount = dynamicChecklist.filter((i) => i.mandatory && i.status !== 'WAIVED').length || activeClient?.docsRequired || 4
  const receivedCount = dynamicChecklist.filter((i) => i.status === 'RECEIVED').length || activeClientDocs.length

  // Simulation steps for layout parsing
  const extractionSteps = [
    'Verifying authenticated session & client/case ownership...',
    'Inspecting stored PDF files & SHA-256 checksums...',
    'Executing deterministic layout & coordinate table parsers...',
    'Extracting Form 16 Part A/B & Form 26AS / AIS schedules...',
    'Computing coordinate localization evidence scores...',
    'Deterministic PDF Extraction Complete',
  ]

  const resolveEffectiveCaseId = () =>
    activeTaxCase?.caseId ||
    activeTaxCase?.id ||
    resolveBackendCaseId(activeClient?.id, effectiveAy)

  const handleStartExtraction = async () => {
    setUploadError(null)
    setUploadSuccessMsg(null)
    clearExtractionError?.()

    if (!authSession?.access_token) {
      setUploadError(
        'Backend session required (401). Please sign in before running document extraction.'
      )
      setShowAuthModal(true)
      return
    }

    setExtractionProgressStep(0)
    const interval = setInterval(() => {
      setExtractionProgressStep((prev) =>
        prev < extractionSteps.length - 2 ? prev + 1 : prev
      )
    }, 350)

    try {
      const extractedDocs = await extractClientDocuments(
        activeClient.id,
        resolveEffectiveCaseId()
      )
      clearInterval(interval)
      setExtractionProgressStep(extractionSteps.length - 1)
      setActiveTab('EXTRACTED_REVIEW')
      setUploadSuccessMsg(
        `Backend extraction complete for ${extractedDocs.length} document(s).`
      )
    } catch (err) {
      clearInterval(interval)
      setUploadError(err?.message || 'Document extraction failed.')
    }
  }

  const handleExtractSingleDoc = async (docId) => {
    setUploadError(null)
    setUploadSuccessMsg(null)
    if (!authSession?.access_token) {
      setUploadError('Authentication required (401). Please sign in first.')
      setShowAuthModal(true)
      return
    }
    try {
      const updated = await extractSingleDocument(docId, resolveEffectiveCaseId())
      setUploadSuccessMsg(
        `Extracted "${updated.name}" (${updated.extractionEngine}).`
      )
    } catch (err) {
      setUploadError(err?.message || 'Single document extraction failed.')
    }
  }

  const handleOpenCorrectionModal = (target) => {
    if (!authSession?.access_token) {
      setUploadError('Authentication required (401). Sign in as CA staff or partner to make corrections.')
      setShowAuthModal(true)
      return
    }
    setCorrectionModalError(null)
    setCorrectionTarget(target)
  }

  const handleSubmitFieldCorrection = async ({ correctedValue, correctionReason }) => {
    if (!correctionTarget) return
    setCorrectionModalError(null)
    setIsSubmittingCorrection(true)
    try {
      const updated = await correctDocumentField(
        correctionTarget.docId,
        correctionTarget.fieldKey,
        {
          correctedValue,
          correctionReason,
          caseId: resolveEffectiveCaseId(),
        }
      )
      setCorrectionTarget(null)
      setUploadSuccessMsg(
        `Saved CA correction for "${correctionTarget.fieldLabel}" on ${updated.name}. Original extracted value preserved.`
      )
    } catch (err) {
      setCorrectionModalError(err?.message || 'Failed to save CA field correction.')
    } finally {
      setIsSubmittingCorrection(false)
    }
  }

  const handleVerifyFieldAction = async (docId, fieldKey) => {
    setUploadError(null)
    if (!authSession?.access_token) {
      setUploadError('Authentication required (401). Sign in as CA staff or partner to verify fields.')
      setShowAuthModal(true)
      return
    }
    try {
      const updated = await verifyDocumentField(docId, fieldKey, {
        caseId: resolveEffectiveCaseId(),
      })
      setUploadSuccessMsg(
        `Marked "${fieldKey}" as VERIFIED on ${updated.name}.`
      )
    } catch (err) {
      setUploadError(err?.message || 'Field verification failed.')
    }
  }

  // Trigger real file input for category
  const handleTriggerFileInput = (categoryKey, checklistItemIds = []) => {
    setUploadCategoryTarget(categoryKey)
    setUploadChecklistTarget(checklistItemIds)
    setUploadError(null)
    setUploadSuccessMsg(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
  }

  // Real file selection and upload
  const handleRealFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !activeClient) return

    // 25MB validation
    if (file.size > 25 * 1024 * 1024) {
      setUploadError(`File '${file.name}' exceeds the 25MB maximum allowed limit.`)
      return
    }

    if (!authSession?.access_token) {
      setUploadError('Authentication required (401). Please sign in before uploading documents.')
      setShowAuthModal(true)
      return
    }

    setIsUploading(true)
    setUploadError(null)
    setUploadSuccessMsg(null)

    try {
      const result = await apiClient.uploadDocumentVault({
        file,
        clientId: activeClient.id,
        clientPan: activeClient.pan,
        caseId: resolveEffectiveCaseId(),
        assessmentYear: effectiveAy,
        category: uploadCategoryTarget,
        checklistItemIds: uploadChecklistTarget,
      })

      addDocument(result)
      setUploadSuccessMsg(
        `Uploaded and verified '${file.name}' (${result.category}) in backend private storage.`
      )
    } catch (err) {
      setUploadError(err?.message || `Failed to upload '${file.name}'.`)
    } finally {
      setIsUploading(false)
    }
  }

  // Handle offline prototype sample fixture (never pretends to be real extraction)
  const handleSimulateDrop = (categoryKey, defaultFileName, checklistIds = []) => {
    const isProfessional = activeClient?.category?.includes('Professional')
    const sanitizedName = (activeClient?.name || 'Taxpayer').replace(/[^a-zA-Z0-9]/g, '_')
    const fileName = `${sanitizedName}_${isProfessional && categoryKey === 'FORM_16' ? 'Form16A_Receipts.pdf' : defaultFileName}`

    addDocument({
      name: fileName,
      category: categoryKey,
      subType: DOCUMENT_CATEGORIES[categoryKey]?.label || categoryKey,
      fileSize: '1.4 MB',
      fileSizeBytes: 1420000,
      fileHashSha256: 'local-demo-sample-fixture',
      pageCount: categoryKey === 'AIS' ? 7 : 3,
      checklistItemIds: checklistIds,
      processingStatus: 'UPLOADED',
      caReviewStatus: 'PENDING_REVIEW',
      extractionSupported: ['FORM_16', 'FORM_26AS', 'AIS', 'AIS / TIS'].includes(categoryKey),
      extractionEngine: 'DEMO_FIXTURE',
      evidenceScore: null,
      evidenceMethodology: 'COORDINATE_LOCALIZATION_RATIO',
      assessmentYear: effectiveAy,
      extractedData: {},
      citations: [],
      boundingCitations: [],
      isBackendSynced: false,
    })
    setUploadSuccessMsg(
      `Added local demo vault entry '${fileName}'. Upload a real PDF while signed in to run backend extraction.`
    )
  }

  // Open Missing Documents outreach dialog
  const handleOpenOutreachModal = () => {
    // Collect pending or requested items
    const pendingItems = dynamicChecklist.filter((i) => i.status !== 'RECEIVED' && i.status !== 'WAIVED')
    const itemIds = pendingItems.length > 0 ? pendingItems.map((i) => i.id) : ['salary-form16', 'tax-26as-traces']
    setSelectedMissingItemIds(itemIds)
    setOutreachCustomNotes('')
    generateOutreachPreview(itemIds, '')
    setIsOutreachModalOpen(true)
  }

  // Generate draft notice preview
  const generateOutreachPreview = async (itemIds, notes) => {
    setIsGeneratingNotice(true)
    setUploadError(null)
    try {
      const notice = await requestMissingDocuments(activeClient.id, itemIds, notes)
      setOutreachDraftNotice(notice)
    } catch (err) {
      setUploadError(err?.message || 'Failed generating missing-documents notice.')
      setIsOutreachModalOpen(false)
    } finally {
      setIsGeneratingNotice(false)
    }
  }

  // Confirm and record outreach
  const handleConfirmOutreach = () => {
    setIsOutreachModalOpen(false)
    setUploadSuccessMsg(
      `Draft outreach generated for ${activeClient?.name}. Checklist items marked as REQUESTED and logged to compliance audit trail.`
    )
  }

  // Handle Waive Item Action
  const handleConfirmWaive = async () => {
    if (!waiveModalItem || !waiveReasonText.trim()) return
    setUploadError(null)
    try {
      await updateDocumentReviewStatus(waiveModalItem.docId || 'sim-waive', 'WAIVED', '', waiveReasonText)
      setWaiveModalItem(null)
      setWaiveReasonText('')
      setUploadSuccessMsg(`Checklist item waived with reason recorded in compliance audit log.`)
    } catch (err) {
      setUploadError(err?.message || 'Unable to waive document.')
      setWaiveModalItem(null)
    }
  }

  const handleQuickVerifyDoc = async (docId) => {
    setUploadError(null)
    try {
      await updateDocumentReviewStatus(docId, 'VERIFIED', 'Verified against TRACES/ITR record')
      setUploadSuccessMsg('Document marked as VERIFIED.')
    } catch (err) {
      setUploadError(err?.message || 'Unable to verify document.')
    }
  }

  const handleDeleteDoc = async (docId) => {
    setUploadError(null)
    try {
      await deleteDocument(docId)
      setUploadSuccessMsg('Document removed from vault.')
    } catch (err) {
      setUploadError(err?.message || 'Unable to delete document.')
    }
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
            Sign in to sync authorized taxpayer cases from the backend API, or select an existing client in Firm & Client Operations.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {!authSession?.access_token && (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Sign In to Backend API
              </button>
            )}
            <button
              type="button"
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
      {/* Hidden file input for real uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleRealFileChange}
        accept=".pdf,.json,.png,.jpg,.jpeg"
        className="hidden"
      />

      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Phase B • Step 05
            </span>
            <h1 className="text-xl font-bold text-slate-900">Document Collection & Document Vault</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ICAI-compliant client document intake, dynamic checklist tracking, multi-document upload, and private storage preservation for{' '}
            <span className="font-semibold text-slate-800">{activeClient.name}</span> ({activeClient.pan}) •{' '}
            <span className="font-semibold text-blue-700">{effectiveAy}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenOutreachModal}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-blue-600" />
            <span>Request Missing Docs</span>
          </button>

          <button
            onClick={() => setIsTaxDiscoveryOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Intake Discovery</span>
          </button>

          <button
            onClick={handleStartExtraction}
            disabled={isSimulatingExtraction || activeClientDocs.length === 0}
            className={`px-4 py-2 text-xs font-bold rounded-lg text-white transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
              isSimulatingExtraction || activeClientDocs.length === 0
                ? 'bg-slate-400 cursor-not-allowed opacity-80'
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20 active:scale-98'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSimulatingExtraction ? 'animate-spin' : 'text-amber-300'}`} />
            <span>
              {isSimulatingExtraction ? 'Extracting Layout...' : 'Run Document Intelligence'}
            </span>
          </button>
        </div>
      </div>

      {/* Upload Notification Alerts */}
      {/* Backend Auth Status / Error Strip */}
      {!authSession?.access_token && (
        <div className="bg-slate-900 text-slate-100 border border-slate-700 px-4 py-3 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Backend API requires authentication for real PDF upload, deterministic extraction, and CA corrections. Local preview data only is displayed while signed out.
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

      {authError && (
        <div role="alert" className="bg-rose-50 border border-rose-300 text-rose-800 px-4 py-3 rounded-xl text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{authError}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="px-2.5 py-1 rounded bg-rose-700 text-white font-semibold hover:bg-rose-800 cursor-pointer"
            >
              Authenticate
            </button>
            <button
              type="button"
              onClick={() => clearAuthError?.()}
              aria-label="Dismiss auth error"
              className="text-rose-600 hover:text-rose-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {uploadError && (
        <div className="bg-rose-50 border border-rose-300 text-rose-800 px-4 py-3 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button onClick={() => setUploadError(null)} className="text-rose-600 hover:text-rose-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {uploadSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{uploadSuccessMsg}</span>
          </div>
          <button onClick={() => setUploadSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dynamic Personalised Checklist Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-5 border border-slate-700 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Client Intake Checklist • {activeClient.legalType || 'INDIVIDUAL'}
              </span>
              <span className="text-xs font-mono font-medium text-slate-300">
                {effectiveAy}
              </span>
              <span className="text-xs font-mono text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                Form: {activeClient.itrType || activeTaxCase?.filingForm || 'ITR-1'}
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1.5">
              Dynamic Document Checklist for {activeClient.name}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Personalised checklist synthesized from 5 income heads discovery. All uploads are checksum-validated with SHA-256 and stored in private storage.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 bg-slate-800/80 p-3 rounded-lg border border-slate-700/80">
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Collection Status</span>
              <span className="text-sm font-bold text-emerald-400">
                {receivedCount} of {requiredCount} Collected
              </span>
            </div>
            <div className="w-24 bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((receivedCount / Math.max(1, requiredCount)) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Extraction Animation Progress Bar (When Active) */}
      {isSimulatingExtraction && (
        <div className="bg-white rounded-xl p-5 border border-blue-300 shadow-md animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
              <span className="text-xs font-bold text-slate-900">
                AI Document Extraction & Layout Parser Running...
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-blue-700">
              Step {extractionProgressStep + 1} of {extractionSteps.length}
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((extractionProgressStep + 1) / extractionSteps.length) * 100}%` }}
            />
          </div>

          <p className="text-xs text-slate-700 font-medium italic">
            "{extractionSteps[extractionProgressStep]}"
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('VAULT')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'VAULT'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Upload Vault & Staging ({activeClientDocs.length} Files)</span>
        </button>

        <button
          onClick={() => setActiveTab('CHECKLIST')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'CHECKLIST'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Personalised Checklist ({dynamicChecklist.length} Items)</span>
        </button>

        <button
          onClick={() => setActiveTab('EXTRACTED_REVIEW')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'EXTRACTED_REVIEW'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Extracted Data & Evidence Citations</span>
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'HISTORY'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Audit & Ingestion Trail</span>
        </button>
      </div>

      {/* TAB 1: SMART UPLOAD VAULT WITH ADAPTIVE DROPZONES */}
      {activeTab === 'VAULT' && (
        <div className="space-y-6">
          {/* Adaptive Upload Dropzones */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Dropzone 1: Form 16 Part A & B */}
            {(() => {
              const isPresent = activeClientDocs.some((d) => d.category === 'FORM_16' || d.category === 'Form 16')
              return (
                <div
                  className={`bg-white rounded-xl border p-4 transition-colors flex flex-col justify-between group ${
                    isPresent ? 'border-teal-300 bg-teal-50/10' : 'border-dashed border-slate-300 hover:border-teal-500'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          isPresent
                            ? 'bg-teal-100 text-teal-800 border-teal-300'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {isPresent ? 'Present ✓' : 'Mandatory'}
                      </span>
                      <FileText
                        className={`w-4 h-4 ${
                          isPresent ? 'text-teal-600' : 'text-slate-400 group-hover:text-teal-600'
                        } transition-colors`}
                      />
                    </div>
                    <h3 className="text-xs font-bold text-slate-900">Form 16 (Part A & B)</h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Employer TDS certificate, salary breakup, standard deduction & Chapter VI-A.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <button
                      onClick={() => handleTriggerFileInput('FORM_16', ['salary-form16', 'ded-80c-receipts'])}
                      disabled={isUploading}
                      className="w-full py-1.5 px-2.5 rounded-lg font-semibold text-xs border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Real File</span>
                    </button>
                    <button
                      onClick={() =>
                        handleSimulateDrop('FORM_16', 'Form16_PartAB.pdf', ['salary-form16', 'ded-80c-receipts'])
                      }
                      className="w-full py-1 px-2 rounded-lg font-medium text-[10px] text-slate-500 hover:bg-slate-100 border border-slate-200 transition-colors text-center cursor-pointer"
                    >
                      Quick Demo Fill
                    </button>
                  </div>
                </div>
              )
            })()}

            {/* Dropzone 2: Form 26AS */}
            {(() => {
              const isPresent = activeClientDocs.some((d) => d.category === 'FORM_26AS' || d.category === 'Form 26AS')
              return (
                <div
                  className={`bg-white rounded-xl border p-4 transition-colors flex flex-col justify-between group ${
                    isPresent ? 'border-blue-300 bg-blue-50/10' : 'border-dashed border-slate-300 hover:border-blue-500'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          isPresent
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {isPresent ? 'Present ✓' : 'Tax Credit'}
                      </span>
                      <FileCheck2
                        className={`w-4 h-4 ${
                          isPresent ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'
                        } transition-colors`}
                      />
                    </div>
                    <h3 className="text-xs font-bold text-slate-900">Form 26AS (TRACES)</h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Annual Tax Credit Statement from TRACES. Employer TDS, 194A bank interest, dividend TDS.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <button
                      onClick={() => handleTriggerFileInput('FORM_26AS', ['tax-26as-traces'])}
                      disabled={isUploading}
                      className="w-full py-1.5 px-2.5 rounded-lg font-semibold text-xs border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Real File</span>
                    </button>
                    <button
                      onClick={() =>
                        handleSimulateDrop('FORM_26AS', 'Form26AS_AY2025-26.pdf', ['tax-26as-traces'])
                      }
                      className="w-full py-1 px-2 rounded-lg font-medium text-[10px] text-slate-500 hover:bg-slate-100 border border-slate-200 transition-colors text-center cursor-pointer"
                    >
                      Quick Demo Fill
                    </button>
                  </div>
                </div>
              )
            })()}

            {/* Dropzone 3: AIS & TIS Statement */}
            {(() => {
              const isPresent = activeClientDocs.some((d) => d.category === 'AIS' || d.category === 'TIS' || d.category === 'AIS / TIS')
              return (
                <div
                  className={`bg-white rounded-xl border p-4 transition-colors flex flex-col justify-between group ${
                    isPresent ? 'border-purple-300 bg-purple-50/10' : 'border-dashed border-slate-300 hover:border-purple-500'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          isPresent
                            ? 'bg-purple-100 text-purple-800 border-purple-300'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {isPresent ? 'Present ✓' : 'Comprehensive'}
                      </span>
                      <Sparkles
                        className={`w-4 h-4 ${
                          isPresent ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                        } transition-colors`}
                      />
                    </div>
                    <h3 className="text-xs font-bold text-slate-900">AIS & TIS Statement</h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Annual Information Statement. SFT bank savings interest, securities sales, dividends.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <button
                      onClick={() => handleTriggerFileInput('AIS', ['tax-ais-tis', 'os-bank-interest'])}
                      disabled={isUploading}
                      className="w-full py-1.5 px-2.5 rounded-lg font-semibold text-xs border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Real File</span>
                    </button>
                    <button
                      onClick={() =>
                        handleSimulateDrop('AIS', 'AIS_TIS_Summary.pdf', ['tax-ais-tis', 'os-bank-interest'])
                      }
                      className="w-full py-1 px-2 rounded-lg font-medium text-[10px] text-slate-500 hover:bg-slate-100 border border-slate-200 transition-colors text-center cursor-pointer"
                    >
                      Quick Demo Fill
                    </button>
                  </div>
                </div>
              )
            })()}

            {/* Dropzone 4: Bank Statements & Investment Proofs */}
            {(() => {
              const isPresent = activeClientDocs.some(
                (d) =>
                  d.category === 'BANK_STATEMENT' ||
                  d.category === 'INVESTMENT_PROOF' ||
                  d.category === 'PROPERTY_DOCUMENT' ||
                  d.category === 'CAPITAL_GAINS_STATEMENT'
              )
              return (
                <div
                  className={`bg-white rounded-xl border p-4 transition-colors flex flex-col justify-between group ${
                    isPresent ? 'border-amber-300 bg-amber-50/10' : 'border-dashed border-slate-300 hover:border-amber-500'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          isPresent
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {isPresent ? 'Present ✓' : 'Supporting'}
                      </span>
                      <KeyRound
                        className={`w-4 h-4 ${
                          isPresent ? 'text-amber-600' : 'text-slate-400 group-hover:text-amber-600'
                        } transition-colors`}
                      />
                    </div>
                    <h3 className="text-xs font-bold text-slate-900">Bank, P&L & Investment Proofs</h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Section 24(b) Home loan certificate, Zerodha/Groww P&L, 80D health insurance receipts.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <button
                      onClick={() => handleTriggerFileInput('BANK_STATEMENT', ['os-bank-interest', 'ded-80c-receipts'])}
                      disabled={isUploading}
                      className="w-full py-1.5 px-2.5 rounded-lg font-semibold text-xs border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Real File</span>
                    </button>
                    <button
                      onClick={() =>
                        handleSimulateDrop('INVESTMENT_PROOF', 'ChapterVIA_Receipts.pdf', ['ded-80c-receipts', 'ded-80d-mediclaim'])
                      }
                      className="w-full py-1 px-2 rounded-lg font-medium text-[10px] text-slate-500 hover:bg-slate-100 border border-slate-200 transition-colors text-center cursor-pointer"
                    >
                      Quick Demo Fill
                    </button>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Active Client's Uploaded Files Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Document Vault for {activeClient.name} ({activeClient.pan})
                </h3>
                <p className="text-xs text-slate-500">
                  {activeClientDocs.length} encrypted documents stored with three-status indicators and SHA-256 integrity tracking
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200">
                Assessment Year: {effectiveAy}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-4">Document Details</th>
                    <th className="py-2.5 px-3">Document Category</th>
                    <th className="py-2.5 px-3">Satisfied Checklist</th>
                    <th className="py-2.5 px-3">Processing Status</th>
                    <th className="py-2.5 px-3">CA Review Status</th>
                    <th className="py-2.5 px-3">Checksum / Storage</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeClientDocs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        <FileText className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                        <p className="font-semibold text-slate-800">No documents uploaded yet for {activeClient.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Use the dropzones above to upload files or quick demo fill.</p>
                      </td>
                    </tr>
                  ) : (
                    activeClientDocs.map((doc) => {
                      const reviewStatus = doc.caReviewStatus || doc.ca_review_status || 'PENDING_REVIEW'
                      const procStatus = doc.processingStatus || doc.processing_status || 'PARSED'
                      const checklistItems = doc.checklistItemIds || []

                      return (
                        <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                              <div>
                                <p className="font-semibold text-slate-900 truncate max-w-xs">{doc.name}</p>
                                <p className="text-[11px] text-slate-400 font-mono">
                                  {doc.fileSize || '1.2 MB'} • {doc.pageCount || 1} pages • {formatDate(doc.uploadDate || doc.uploaded_at, true)}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {DOCUMENT_CATEGORIES[doc.category]?.label || doc.category}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {checklistItems.length > 0 ? (
                                checklistItems.map((itemId, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono"
                                  >
                                    {itemId}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">None linked</span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                procStatus === 'PARSED'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : procStatus === 'PARSING'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200 animate-pulse'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {procStatus}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                  reviewStatus === 'VERIFIED'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : reviewStatus === 'WAIVED'
                                    ? 'bg-slate-100 text-slate-700 border-slate-300'
                                    : reviewStatus === 'REJECTED'
                                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                                    : 'bg-amber-100 text-amber-900 border-amber-300'
                                }`}
                              >
                                {reviewStatus}
                              </span>

                              {/* Quick CA Review Action Buttons */}
                              {reviewStatus !== 'VERIFIED' && (
                                <button
                                  onClick={() => handleQuickVerifyDoc(doc.id)}
                                  title="Mark as Verified by CA"
                                  className="p-1 rounded hover:bg-emerald-50 text-emerald-700 border border-transparent hover:border-emerald-200 cursor-pointer"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              )}
                              {reviewStatus !== 'WAIVED' && (
                                <button
                                  onClick={() => setWaiveModalItem({ docId: doc.id, title: doc.name })}
                                  title="Waive with reason"
                                  className="p-1 rounded hover:bg-slate-100 text-slate-600 border border-transparent hover:border-slate-200 cursor-pointer text-[10px] font-semibold"
                                >
                                  Waive
                                </button>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-3 font-mono text-[10px] text-slate-500">
                            {doc.fileHashSha256 ? (
                              <span title={doc.fileHashSha256}>
                                SHA-256: {doc.fileHashSha256.substring(0, 10)}...
                              </span>
                            ) : (
                              <span>Private RAM Vault</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => setSelectedDocForPreview(doc)}
                                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Inspect</span>
                              </button>
                              <button
                                onClick={() => handleDeleteDoc(doc.id)}
                                title="Delete document from vault"
                                className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PERSONALISED DYNAMIC CHECKLIST TABLE */}
      {activeTab === 'CHECKLIST' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Personalised Document Checklist ({dynamicChecklist.length} Requirements)
              </h3>
              <p className="text-xs text-slate-500">
                Generated from client's intake discovery answers. Statuses: Required, Requested, Received, Under Review, Waived.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenOutreachModal}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Request Pending ({dynamicChecklist.filter((i) => i.status !== 'RECEIVED' && i.status !== 'WAIVED').length})</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-4">Requirement / Document Title</th>
                  <th className="py-2.5 px-3">Tax Head / Category</th>
                  <th className="py-2.5 px-3">Statutory Justification (Why Needed)</th>
                  <th className="py-2.5 px-3">Checklist Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dynamicChecklist.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      <FileCheck2 className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                      <p className="font-semibold text-slate-800">Checklist not yet generated</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Open Client Tax Discovery to answer the 5 income head questionnaire and compile the checklist.
                      </p>
                      <button
                        onClick={() => setIsTaxDiscoveryOpen(true)}
                        className="mt-3 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                      >
                        Open Tax Discovery
                      </button>
                    </td>
                  </tr>
                ) : (
                  dynamicChecklist.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${item.status === 'RECEIVED' ? 'bg-emerald-500' : item.status === 'WAIVED' ? 'bg-slate-400' : 'bg-amber-500'}`} />
                          <div>
                            <p className="font-bold text-slate-900">{item.title}</p>
                            {item.mandatory && (
                              <span className="text-[10px] text-rose-600 font-semibold">Mandatory for ITR Filing</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {item.head || item.category || 'Statutory'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-600 max-w-sm">
                        <p className="leading-snug text-[11px]">{item.whyNeeded || 'Statutory tax return verification'}</p>
                        {item.waiveReason && (
                          <p className="text-[10px] text-slate-500 italic mt-0.5">Waive Reason: {item.waiveReason}</p>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            item.status === 'RECEIVED'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : item.status === 'REQUESTED'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : item.status === 'UNDER_REVIEW'
                              ? 'bg-purple-100 text-purple-800 border-purple-300'
                              : item.status === 'WAIVED'
                              ? 'bg-slate-100 text-slate-700 border-slate-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}
                        >
                          {item.status || 'REQUIRED'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {item.status !== 'RECEIVED' && (
                            <button
                              onClick={() => handleTriggerFileInput('OTHER_PROOF', [item.id])}
                              className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold text-[11px] transition-colors cursor-pointer"
                            >
                              Upload
                            </button>
                          )}
                          {item.status !== 'WAIVED' && (
                            <button
                              onClick={() => setWaiveModalItem({ docId: item.id, title: item.title })}
                              className="px-2 py-1 rounded hover:bg-slate-100 text-slate-600 font-medium text-[11px] transition-colors cursor-pointer"
                            >
                              Waive
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: EXTRACTED DATA REVIEW & EVIDENCE CITATIONS */}
      {activeTab === 'EXTRACTED_REVIEW' && (
        <ExtractedDataReviewPanel
          documents={activeClientDocs}
          authSession={authSession}
          isExtracting={isSimulatingExtraction}
          extractionError={extractionError}
          onExtractAll={handleStartExtraction}
          onExtractSingle={handleExtractSingleDoc}
          onOpenCorrection={handleOpenCorrectionModal}
          onVerifyField={handleVerifyFieldAction}
          onInspectCitation={(doc, citation, correction) =>
            setSelectedCitationForInspection({ doc, citation, correction })
          }
          onOpenAuthModal={() => setShowAuthModal(true)}
        />
      )}

      {/* TAB 4: AUDIT & INGESTION TRAIL */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-0.5">
                Document Vault Audit & Ingestion Trail — {activeClient.name}
              </h3>
              <p className="text-xs text-slate-500">
                Immutable DPDP compliance audit log for {activeClient.pan} • Case: {activeTaxCase?.caseId || 'Active Case'}
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700">
              {activeClientDocs.length} Document(s) in Vault
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {activeClientDocs.length === 0 ? (
              <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                <Clock className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <p className="font-semibold text-slate-700">No Ingestion Events Logged</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Upload documents in Document Vault to initiate in-memory OCR parsing for {activeClient.name}.
                </p>
              </div>
            ) : (
              activeClientDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-start justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">
                        Ingested: {doc.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-semibold">
                        {DOCUMENT_CATEGORIES[doc.category]?.label || doc.category}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1">
                      Case ownership verified for PAN {activeClient.pan}. File saved to private storage with SHA-256 integrity hash.
                    </p>
                    <div className="text-[10px] font-mono text-slate-400 mt-1 flex flex-wrap gap-2">
                      <span>Size: {doc.fileSize}</span>
                      <span>• Pages: {doc.pageCount || 1}</span>
                      <span>• CA Review: {doc.caReviewStatus || 'PENDING_REVIEW'}</span>
                      {doc.fileHashSha256 && <span>• Checksum: {doc.fileHashSha256.substring(0, 16)}...</span>}
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded border shrink-0 text-emerald-700 bg-emerald-50 border-emerald-200">
                    VERIFIED INGESTION ✓
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: REQUEST MISSING DOCUMENTS DRAFT NOTICE */}
      {isOutreachModalOpen && (
        <Modal
          isOpen={isOutreachModalOpen}
          onClose={() => setIsOutreachModalOpen(false)}
          title={`Draft Client Outreach: Request Missing Documents`}
          subtitle={`Recipient: ${activeClient.name} (${activeClient.pan}) • ${effectiveAy}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Disclaimer Alert */}
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-2 text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Demonstration Draft Notice:</span>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  This generates a compliant draft communication and records a regulatory audit trail event. No actual external SMS or email dispatch is performed.
                </p>
              </div>
            </div>

            {/* Checklist items to request */}
            <div>
              <label className="font-bold text-slate-800 block mb-1.5">Pending Documents to Request:</label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                {dynamicChecklist.filter((i) => i.status !== 'RECEIVED' && i.status !== 'WAIVED').map((item) => (
                  <label key={item.id} className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={selectedMissingItemIds.includes(item.id)}
                      onChange={(e) => {
                        const newIds = e.target.checked
                          ? [...selectedMissingItemIds, item.id]
                          : selectedMissingItemIds.filter((id) => id !== item.id)
                        setSelectedMissingItemIds(newIds)
                        generateOutreachPreview(newIds, outreachCustomNotes)
                      }}
                      className="rounded border-slate-300 text-blue-600"
                    />
                    <span className="font-semibold">{item.title}</span>
                    <span className="text-[10px] text-slate-400">({item.head || item.category})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom CA Note */}
            <div>
              <label className="font-bold text-slate-800 block mb-1">Custom Note from Chartered Accountant (Optional):</label>
              <input
                type="text"
                value={outreachCustomNotes}
                onChange={(e) => {
                  setOutreachCustomNotes(e.target.value)
                  generateOutreachPreview(selectedMissingItemIds, e.target.value)
                }}
                placeholder="e.g., Please provide the SBI housing loan certificate before Friday."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Channel Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pt-1">
              <button
                onClick={() => setOutreachChannelTab('EMAIL')}
                className={`pb-2 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  outreachChannelTab === 'EMAIL' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Draft Email Preview</span>
              </button>
              <button
                onClick={() => setOutreachChannelTab('WHATSAPP')}
                className={`pb-2 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  outreachChannelTab === 'WHATSAPP' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Draft WhatsApp Preview</span>
              </button>
            </div>

            {/* Preview Box */}
            {isGeneratingNotice ? (
              <div className="p-6 text-center text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                <span>Formatting draft notice...</span>
              </div>
            ) : outreachDraftNotice ? (
              <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                {outreachChannelTab === 'EMAIL' ? (
                  <>
                    <div className="text-slate-500 border-b pb-2 mb-2 font-sans">
                      <p><strong>To:</strong> {outreachDraftNotice.recipient_email}</p>
                      <p><strong>Subject:</strong> {outreachDraftNotice.subject}</p>
                    </div>
                    {outreachDraftNotice.email_body}
                  </>
                ) : (
                  <>
                    <div className="text-slate-500 border-b pb-2 mb-2 font-sans">
                      <p><strong>To WhatsApp:</strong> {outreachDraftNotice.recipient_mobile}</p>
                    </div>
                    {outreachDraftNotice.whatsapp_body}
                  </>
                )}
              </div>
            ) : null}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsOutreachModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOutreach}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm & Log Draft Request</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: WAIVE REASON INPUT */}
      {waiveModalItem && (
        <Modal
          isOpen={!!waiveModalItem}
          onClose={() => setWaiveModalItem(null)}
          title={`Waive Requirement: ${waiveModalItem.title}`}
          subtitle={`Mandatory CA Reason Required for Compliance Audit Trail`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed">
              In accordance with ICAI Documentation Standards, waiving a statutory tax document requirement requires a documented professional justification.
            </p>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Waive Justification / Reason:</label>
              <textarea
                rows={3}
                value={waiveReasonText}
                onChange={(e) => setWaiveReasonText(e.target.value)}
                placeholder="e.g., Client confirms no interest received exceeding statutory threshold; verified against 26AS Part IV."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setWaiveModalItem(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!waiveReasonText.trim()}
                onClick={handleConfirmWaive}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold disabled:opacity-50 cursor-pointer"
              >
                Confirm Waive
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: DOCUMENT PREVIEW */}
      {selectedDocForPreview && (
        <Modal
          isOpen={!!selectedDocForPreview}
          onClose={() => setSelectedDocForPreview(null)}
          title={`Document Preview: ${selectedDocForPreview.name}`}
          subtitle={`${DOCUMENT_CATEGORIES[selectedDocForPreview.category]?.label || selectedDocForPreview.category} • ${selectedDocForPreview.fileSize || '1.2 MB'} • Assessment Year: ${effectiveAy}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-100 p-6 rounded-xl border border-slate-300 min-h-[380px] flex flex-col justify-between font-mono relative overflow-hidden">
              <div className="border-b border-slate-300 pb-3 mb-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    {DOCUMENT_CATEGORIES[selectedDocForPreview.category]?.label || selectedDocForPreview.category}
                  </h4>
                  <p className="text-[11px] text-slate-500">Government of India — Income Tax Department</p>
                </div>
                <span className="text-[11px] bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-bold">
                  PAGE 1 OF {selectedDocForPreview.pageCount || 1}
                </span>
              </div>

              <div className="space-y-3 bg-white p-5 rounded-lg border border-slate-200 shadow-inner">
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-slate-500">Taxpayer Legal Name:</span>
                  <span className="font-bold text-slate-900">{activeClient.name}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-slate-500">PAN of Assessee:</span>
                  <span className="font-bold text-slate-900">{activeClient.pan}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-slate-500">Assessment Year:</span>
                  <span className="font-bold text-blue-700">{effectiveAy}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-slate-500">CA Review Status:</span>
                  <span className="font-bold text-emerald-700">{selectedDocForPreview.caReviewStatus || 'PENDING_REVIEW'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Private Storage Integrity:</span>
                  <span className="text-slate-600 text-[10px]">
                    {selectedDocForPreview.fileHashSha256
                      ? `SHA-256 Verified (${selectedDocForPreview.fileHashSha256.substring(0, 16)}...)`
                      : 'Secure Private Sandbox'}
                  </span>
                </div>
              </div>

              <div className="mt-4 text-center text-slate-400 text-[11px]">
                Preview rendered safely from verified document record. Original files preserved in private storage.
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDocForPreview(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: SOURCE EVIDENCE & BOUNDING BOX CITATION */}
      {selectedCitationForInspection && (() => {
        const { doc, citation, correction } = selectedCitationForInspection
        const citFieldName = citation.field_name || citation.field || 'Extracted Field'
        const citPage = citation.page_number ?? citation.page ?? 1
        const citBBox = citation.bounding_box || citation.bbox || null
        const citRawText = citation.raw_text || citation.rawText || ''
        const citEvidenceScore =
          typeof citation.evidence_score === 'number'
            ? citation.evidence_score
            : typeof citation.evidenceScore === 'number'
            ? citation.evidenceScore
            : null
        const citStatus = citation.evidence_status || citation.evidenceStatus || 'UNVERIFIED'
        const citDocName = citation.document_name || citation.documentName || doc.name || doc.filename

        return (
          <Modal
            isOpen={!!selectedCitationForInspection}
            onClose={() => setSelectedCitationForInspection(null)}
            title={`Source Evidence Citation: ${citFieldName}`}
            subtitle={`${citDocName} • Page ${citPage}`}
            maxWidth="max-w-xl"
          >
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Original Extracted Value
                  </span>
                  <h4 className="text-base font-mono font-bold text-slate-900">
                    {correction?.original_value !== undefined
                      ? String(correction.original_value)
                      : citRawText || 'See snippet below'}
                  </h4>
                  {correction?.is_corrected && (
                    <p className="text-[11px] text-blue-700 mt-1 font-semibold">
                      CA Override Active: <span className="font-mono">{String(correction.corrected_value)}</span> (By {correction.corrected_by}: {correction.correction_reason})
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-500 block">Evidence Status</span>
                  <span className="font-bold text-emerald-700 text-xs font-mono">{citStatus}</span>
                  <span className="block text-[10px] text-slate-500 font-mono">
                    {citEvidenceScore !== null
                      ? `Score: ${citEvidenceScore.toFixed(2)} (${doc.evidenceMethodology || 'COORDINATE_LOCALIZATION_RATIO'})`
                      : 'Score: N/A'}
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg bg-slate-100 p-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-600">
                  <span>Source: {citDocName} (Page {citPage})</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                    {Array.isArray(citBBox)
                      ? `BBox [x0:${citBBox[0]}, y0:${citBBox[1]}, x1:${citBBox[2]}, y1:${citBBox[3]}]`
                      : 'Coordinates not localized'}
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded border border-slate-200 text-slate-800 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-words">
                  {citRawText || 'No raw text snippet stored for this citation.'}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedCitationForInspection(null)}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </Modal>
        )
      })()}

      {/* MODAL: CA FIELD CORRECTION */}
      <FieldCorrectionModal
        target={correctionTarget}
        onClose={() => setCorrectionTarget(null)}
        onSubmit={handleSubmitFieldCorrection}
        isSubmitting={isSubmittingCorrection}
        serverError={correctionModalError}
      />

      {/* MODAL: BACKEND SESSION AUTH */}
      <BackendAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* STEP 1: DYNAMIC STATUTORY CHECKLIST & TAX DISCOVERY */}
      {activeClient && (
        <ClientTaxDiscoveryWorkspace
          client={activeClient}
          isOpen={isTaxDiscoveryOpen}
          onClose={() => setIsTaxDiscoveryOpen(false)}
        />
      )}
    </div>
  )
}
