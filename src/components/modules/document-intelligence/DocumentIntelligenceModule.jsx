import React, { useState } from 'react'
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
  CheckCircle2
} from 'lucide-react'
import { useApp } from '../../../context/AppContext'
import { formatDate } from '../../../utils/formatters'
import Modal from '../../common/Modal'

export default function DocumentIntelligenceModule() {
  const {
    activeClient,
    activeClientDocs,
    activeDocBreakdown,
    addDocument,
    isSimulatingExtraction,
    runSimulatedExtraction,
  } = useApp()

  const [activeTab, setActiveTab] = useState('VAULT') // 'VAULT', 'EXTRACTED_REVIEW', 'HISTORY'
  const [selectedDocForPreview, setSelectedDocForPreview] = useState(null)
  const [selectedCitationForInspection, setSelectedCitationForInspection] = useState(null)
  const [extractionProgressStep, setExtractionProgressStep] = useState(0)

  // Simulation steps
  const extractionSteps = [
    'Simulating in-memory processing sandbox using mock client credentials...',
    'Performing OCR & High-Fidelity Table Layout Analysis...',
    'Extracting Form 16 Part A TDS credits & verifying Employer TAN...',
    'Reconciling Part B Chapter VI-A Deductions (80C, 80D, 24b)...',
    'Cross-referencing Form 26AS OLTAS challans against AIS SFT codes...',
    'Calculating deterministic field confidence scores...',
    'Extraction Complete (98.6% Average Field Confidence)',
  ]

  const handleStartExtraction = () => {
    setExtractionProgressStep(0)
    const interval = setInterval(() => {
      setExtractionProgressStep((prev) => {
        if (prev >= extractionSteps.length - 1) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 450)

    runSimulatedExtraction(() => {
      clearInterval(interval)
      setActiveTab('EXTRACTED_REVIEW')
    })
  }

  // Handle mock file upload
  const handleSimulateDrop = (category, subType, defaultFileName) => {
    const isProfessional = activeClient?.category?.includes('Professional')
    const sanitizedName = (activeClient?.name || 'Taxpayer').replace(/[^a-zA-Z0-9]/g, '_')
    addDocument({
      name: `${sanitizedName}_${isProfessional && category === 'Form 16' ? 'Form16A_Receipts.pdf' : defaultFileName}`,
      category,
      subType,
      fileSize: '1.2 MB',
      pageCount: category === 'AIS / TIS' ? 7 : 3,
      isCompletePartB: true,
      extractionConfidence: 98.4,
      extractedData: isProfessional
        ? {
            grossSalary: 0,
            grossProfessional: 1800000,
            sec80C: 150000,
            sec80D: 50000,
            tdsSalary: 180000,
          }
        : {
            grossSalary: 1500000,
            standardDeduction: 50000,
            sec80C: 150000,
            sec80D: 25000,
            sec24b: 200000,
            tdsSalary: 180000,
          },
      boundingCitations: [
        {
          field: isProfessional ? 'Professional Receipts (Sec 194J)' : 'Gross Salary (Sec 17(1))',
          value: isProfessional ? '₹18,00,000' : '₹15,00,000',
          page: 2,
          line: 'Line 1(a)',
          bbox: { top: 210, left: 320, width: 140, height: 26 },
          confidence: 99.2,
        },
      ],
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Module 2 • Simulated OCR
            </span>
            <h1 className="text-xl font-bold text-slate-900">Document Intelligence & Vault</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulated in-memory decryption concept, mock OCR layout parsing, and sample coordinate bounding citations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleStartExtraction}
            disabled={isSimulatingExtraction}
            className={`px-4 py-2 text-xs font-bold rounded-lg text-white transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
              isSimulatingExtraction
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20 active:scale-98'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSimulatingExtraction ? 'animate-spin' : 'text-amber-300'}`} />
            <span>
              {isSimulatingExtraction ? 'Simulating Extraction...' : 'Run Simulated AI Extraction'}
            </span>
          </button>
        </div>
      </div>

      {/* Zero-Password Friction Concept Banner */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#0F172A] to-[#1E293B] text-white rounded-xl p-4.5 border border-slate-800 border-t-2 border-t-amber-400/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-400/10 text-amber-300 border border-amber-400/25 shrink-0">
            <KeyRound className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                Simulated In-Memory Vault & Decryption Concept
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                Prototype Mock
              </span>
            </div>
            <p className="text-slate-300 text-xs mt-1 leading-relaxed max-w-3xl">
              Demonstrates zero-password friction intake: in production architecture, password-protected PDFs are unlocked in ephemeral RAM using verified client PAN and DOB hashes without writing plaintext to disk. This prototype simulates extraction using sample mock data.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Security Concept</span>
          <span className="text-xs font-bold text-blue-400">Simulated RAM Vault</span>
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
          <span>Upload Vault & Dropzones ({activeClientDocs.length} Files)</span>
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
          <span>OCR Pipeline Audit Log</span>
        </button>
      </div>

      {/* TAB 1: SMART UPLOAD VAULT WITH 4 DROPZONES */}
      {activeTab === 'VAULT' && (
        <div className="space-y-6">
          {/* Missing Documents Alert Banner for Incomplete Intake */}
          {activeDocBreakdown?.missingCategories?.length > 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    Incomplete Intake for {activeClient?.name} • {activeDocBreakdown.missingCategories.length} Required Categories Missing
                  </h4>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    Uploaded: {activeClientDocs.length} of {activeClient?.docsRequired || 4} expected documents. Awaiting: {activeDocBreakdown.missingCategories.map((c) => c.title).join(', ')}. Upload missing documents below to enable full AI extraction, 3-way reconciliation, and financial insights.
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300">
                  {activeClientDocs.length} / {activeClient?.docsRequired || 4} Uploaded
                </span>
              </div>
            </div>
          )}

          {/* 4 Dedicated Dropzones */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Dropzone 1: Form 16 Part A & B */}
            {(() => {
              const isPresent = activeClientDocs.some((d) => d.category === 'Form 16')
              return (
                <div className={`bg-white rounded-xl border p-4 transition-colors flex flex-col justify-between group ${
                  isPresent ? 'border-teal-300 bg-teal-50/10' : 'border-dashed border-slate-300 hover:border-teal-500'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        isPresent ? 'bg-teal-100 text-teal-800 border-teal-300' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {isPresent ? 'Present ✓' : 'Mandatory'}
                      </span>
                      <FileText className={`w-4 h-4 ${isPresent ? 'text-teal-600' : 'text-slate-400 group-hover:text-teal-600'} transition-colors`} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-900">Form 16 (Part A & B)</h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Employer TDS certificate, salary breakup, standard deduction & Chapter VI-A.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleSimulateDrop('Form 16', 'Salary Certificate (Part A & B)', 'Form16_PartAB.pdf')}
                      className={`w-full py-1.5 px-2.5 rounded-lg font-semibold text-xs border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                        isPresent
                          ? 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-200'
                          : 'bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border-slate-200'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isPresent ? 'Upload Additional Form 16' : 'Upload Form 16'}</span>
                    </button>
                  </div>
                </div>
              )
            })()}

            {/* Dropzone 2: Form 26AS */}
            {(() => {
              const isPresent = activeClientDocs.some((d) => d.category === 'Form 26AS')
              return (
                <div className={`bg-white rounded-xl border p-4 transition-colors flex flex-col justify-between group ${
                  isPresent ? 'border-blue-300 bg-blue-50/10' : 'border-dashed border-slate-300 hover:border-blue-500'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        isPresent ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {isPresent ? 'Present ✓' : 'Tax Credit'}
                      </span>
                      <FileCheck2 className={`w-4 h-4 ${isPresent ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'} transition-colors`} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-900">Form 26AS</h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Annual Tax Credit Statement from TRACES. Employer TDS, 194A bank interest, dividend TDS.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleSimulateDrop('Form 26AS', 'Tax Credit Statement', 'Form26AS_AY2025-26.pdf')}
                      className={`w-full py-1.5 px-2.5 rounded-lg font-semibold text-xs border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                        isPresent
                          ? 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200'
                          : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isPresent ? 'Upload Additional 26AS' : 'Upload Form 26AS'}</span>
                    </button>
                  </div>
                </div>
              )
            })()}

            {/* Dropzone 3: AIS / TIS */}
            {(() => {
              const isPresent = activeClientDocs.some((d) => d.category === 'AIS / TIS')
              return (
                <div className={`bg-white rounded-xl border p-4 transition-colors flex flex-col justify-between group ${
                  isPresent ? 'border-purple-300 bg-purple-50/10' : 'border-dashed border-slate-300 hover:border-purple-500'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        isPresent ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {isPresent ? 'Present ✓' : 'Comprehensive'}
                      </span>
                      <Sparkles className={`w-4 h-4 ${isPresent ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'} transition-colors`} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-900">AIS & TIS Statement</h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Annual Information Statement. SFT bank savings interest, stock/mutual fund sales, dividends.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleSimulateDrop('AIS / TIS', 'Annual Information Statement', 'AIS_TIS_Summary.pdf')}
                      className={`w-full py-1.5 px-2.5 rounded-lg font-semibold text-xs border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                        isPresent
                          ? 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200'
                          : 'bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border-slate-200'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isPresent ? 'Upload Additional AIS' : 'Upload AIS / TIS'}</span>
                    </button>
                  </div>
                </div>
              )
            })()}

            {/* Dropzone 4: Bank Statements & Broker Capital Gains */}
            {(() => {
              const isPresent = activeClientDocs.some((d) => d.category === 'Bank Statement / Certificate' || d.category === 'Supporting Schedule')
              return (
                <div className={`bg-white rounded-xl border p-4 transition-colors flex flex-col justify-between group ${
                  isPresent ? 'border-amber-300 bg-amber-50/10' : 'border-dashed border-slate-300 hover:border-amber-500'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        isPresent ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {isPresent ? 'Present ✓' : 'Supporting'}
                      </span>
                      <KeyRound className={`w-4 h-4 ${isPresent ? 'text-amber-600' : 'text-slate-400 group-hover:text-amber-600'} transition-colors`} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-900">Bank & Broker P&L</h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Section 24(b) Home loan certificate, Zerodha/Groww P&L, 80D health insurance receipts.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleSimulateDrop('Bank Statement / Certificate', 'Sec 24b Interest Certificate', 'HomeLoan_Interest_Cert.pdf')}
                      className={`w-full py-1.5 px-2.5 rounded-lg font-semibold text-xs border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                        isPresent
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-700 border-slate-200'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isPresent ? 'Upload Additional P&L' : 'Upload Cert / P&L'}</span>
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
                  Document Vault for {activeClient?.name} ({activeClient?.pan})
                </h3>
                <p className="text-xs text-slate-500">
                  {activeClientDocs.length} encrypted documents stored with in-memory decryption access
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-teal-50 text-teal-800 border border-teal-200">
                Assessment Year: {activeClient?.activeAY}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-4">Document Name</th>
                    <th className="py-2.5 px-3">Classification</th>
                    <th className="py-2.5 px-3">Uploaded At</th>
                    <th className="py-2.5 px-3">Extraction Conf.</th>
                    <th className="py-2.5 px-3">Encryption Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeClientDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-900 truncate max-w-xs">{doc.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {doc.fileSize} • {doc.pageCount} pages
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-700">{doc.category}</span>
                        <p className="text-[10px] text-slate-400">{doc.subType}</p>
                      </td>

                      <td className="py-3 px-3 text-slate-600 text-[11px]">
                        {formatDate(doc.uploadDate, true)}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                          {doc.extractionConfidence}% High
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-[11px] text-slate-600 flex items-center gap-1 font-mono">
                          <KeyRound className="w-3 h-3 text-teal-600" />
                          {doc.encryptionStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedDocForPreview(doc)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXTRACTED DATA REVIEW & EVIDENCE CITATIONS */}
      {activeTab === 'EXTRACTED_REVIEW' && (
        <div className="space-y-6">
          {/* Missing Information / Status Alerts Banner */}
          {activeDocBreakdown?.missingCategories?.length > 0 ? (
            <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <h4 className="font-bold text-amber-900">
                  Document Intake Incomplete — {activeDocBreakdown.missingCategories.length} Required Categories Pending
                </h4>
                <p className="text-amber-800 mt-0.5 leading-relaxed">
                  {activeDocBreakdown.missingCategories.some((c) => c.category === 'Form 16')
                    ? `Form 16 has not been uploaded for ${activeClient?.name}. Only entities from uploaded files are displayed below.`
                    : `Awaiting upload of: ${activeDocBreakdown.missingCategories.map((c) => c.title).join(', ')}.`}{' '}
                  Full cross-document reconciliation requires all statutory files in Document Vault.
                </p>
              </div>
            </div>
          ) : activeClientDocs.some((d) => d.status === 'Uploaded' || d.status === 'Processing') ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <h4 className="font-bold text-blue-900">
                  AI Extraction Pending — Files Staged in In-Memory Vault
                </h4>
                <p className="text-blue-800 mt-0.5 leading-relaxed">
                  All {activeClientDocs.length} files are staged in the ephemeral memory sandbox for {activeClient?.name}. Click "Run Simulated AI Extraction" above to parse financial tables, bounding coordinates, and Chapter VI-A deductions.
                </p>
              </div>
            </div>
          ) : activeClientDocs.length > 0 ? (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <h4 className="font-bold text-emerald-900">
                  AI Entity Extraction Verified Across Uploaded Files ✓
                </h4>
                <p className="text-emerald-800 mt-0.5 leading-relaxed">
                  High-fidelity table layout extraction completed for {activeClient?.name} ({activeClient?.pan}). Click any field below to inspect simulated OCR bounding coordinates.
                </p>
              </div>
            </div>
          ) : null}

          {/* Extracted Fields Table with Interactive Coordinate Citations */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  AI Entity Extraction & Bounding-Box Evidence — {activeClient?.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Click any verified field to inspect the exact simulated OCR document coordinate snippet
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                Deterministic Extraction Concept
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {activeClientDocs.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-bold text-slate-800">No Documents Uploaded</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload files in Document Vault to extract financial entities for {activeClient?.name}.
                  </p>
                </div>
              ) : (
                activeClientDocs.map((doc) => {
                  const isProcessed = doc.status === 'Processed'
                  const hasCitations = doc.boundingCitations && doc.boundingCitations.length > 0
                  return (
                    <div key={doc.id} className="p-4 text-xs">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-teal-600" />
                          <span className="font-bold text-slate-900">{doc.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                            {doc.category}
                          </span>
                        </div>
                        <span className={`text-[11px] font-semibold ${isProcessed ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {isProcessed
                            ? `Average Confidence: ${doc.extractionConfidence || 98.4}%`
                            : 'Status: Staged (Pending Extraction)'}
                        </span>
                      </div>

                      {/* Bounding box citations */}
                      {isProcessed && hasCitations ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {doc.boundingCitations.map((citation, idx) => (
                            <div
                              key={idx}
                              onClick={() => setSelectedCitationForInspection({ doc, citation })}
                              className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-teal-50/50 hover:border-teal-300 transition-all cursor-pointer flex flex-col justify-between group"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-teal-700">
                                    Page {citation.page} • {citation.line}
                                  </span>
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                    {citation.confidence}%
                                  </span>
                                </div>
                                <p className="font-semibold text-slate-800">{citation.field}</p>
                              </div>

                              <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-900">{citation.value}</span>
                                <span className="text-[11px] text-teal-600 font-semibold group-hover:underline flex items-center gap-0.5">
                                  View Snippet <ArrowRight className="w-3 h-3" />
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-500 italic text-[11px]">
                          Pending AI extraction. Click "Run Simulated AI Extraction" in Document Vault to parse coordinate citations.
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OCR PIPELINE AUDIT LOG */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-0.5">
                OCR & In-Memory Pipeline Execution History — {activeClient?.name}
              </h3>
              <p className="text-xs text-slate-500">
                Cryptographic proof of zero disk leakage and field coordinate extraction for {activeClient?.pan}
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
                <p className="font-semibold text-slate-700">No Extraction Events Logged</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Upload documents in Document Vault to initiate in-memory OCR parsing for {activeClient?.name}.
                </p>
              </div>
            ) : (
              activeClientDocs.map((doc) => {
                const isProcessed = doc.status === 'Processed'
                return (
                  <div
                    key={doc.id}
                    className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">
                          {isProcessed ? 'In-Memory Processing' : 'Staged in Vault'}: {doc.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-semibold">
                          {doc.category}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">
                        {isProcessed
                          ? `Passcode derived from client PAN (${activeClient?.pan}). Decrypted in ephemeral RAM sandbox and parsed with ${doc.extractionConfidence || 98.4}% confidence.`
                          : `Uploaded to in-memory vault. Staged for OCR pipeline batch execution. (Zero disk write).`}
                      </p>
                      <div className="text-[10px] font-mono text-slate-400 mt-1 flex flex-wrap gap-2">
                        <span>Size: {doc.fileSize}</span>
                        <span>• Pages: {doc.pageCount}</span>
                        <span>• Status: {doc.status}</span>
                        {isProcessed && <span>• Memory Buffer: Ephemeral RAM</span>}
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded border shrink-0 ${
                        isProcessed
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : 'text-amber-700 bg-amber-50 border-amber-200'
                      }`}
                    >
                      {isProcessed ? 'SUCCESS ✓' : 'AWAITING EXTRACTION'}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* MODAL: DOCUMENT PREVIEW */}
      {selectedDocForPreview && (
        <Modal
          isOpen={!!selectedDocForPreview}
          onClose={() => setSelectedDocForPreview(null)}
          title={`Document Preview: ${selectedDocForPreview.name}`}
          subtitle={`${selectedDocForPreview.category} • ${selectedDocForPreview.fileSize} • Decrypted In-Memory`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4 text-xs">
            {/* Mock PDF Document Page View */}
            <div className="bg-slate-100 p-6 rounded-xl border border-slate-300 min-h-[380px] flex flex-col justify-between font-mono relative overflow-hidden">
              <div className="border-b border-slate-300 pb-3 mb-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{selectedDocForPreview.subType}</h4>
                  <p className="text-[11px] text-slate-500">Government of India — Income Tax Department</p>
                </div>
                <span className="text-[11px] bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-bold">
                  PAGE 1 OF {selectedDocForPreview.pageCount}
                </span>
              </div>

              <div className="space-y-3 bg-white p-5 rounded-lg border border-slate-200 shadow-inner">
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-slate-500">Name of Employer/Deductor:</span>
                  <span className="font-bold text-slate-900">{activeClient?.employer || 'Demo Employer Ltd'}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-slate-500">PAN of Employee:</span>
                  <span className="font-bold text-slate-900">{activeClient?.pan}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-slate-500">Assessment Year:</span>
                  <span className="font-bold text-slate-900">{activeClient?.activeAY}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-slate-500">Total TDS Deposited (Sec 192):</span>
                  <span className="font-bold text-emerald-700">₹1,80,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">In-Memory Security Token:</span>
                  <span className="text-slate-400 text-[10px]">Demonstration Identifier (Simulated Processing)</span>
                </div>
              </div>

              <div className="mt-4 text-center text-slate-400 text-[11px]">
                Preview rendered from safe memory stream. Original encrypted file intact.
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
      {selectedCitationForInspection && (
        <Modal
          isOpen={!!selectedCitationForInspection}
          onClose={() => setSelectedCitationForInspection(null)}
          title={`Source Evidence Citation: ${selectedCitationForInspection.citation.field}`}
          subtitle={`${selectedCitationForInspection.doc.name} • Page ${selectedCitationForInspection.citation.page}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-teal-50 rounded-lg border border-teal-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-teal-800">Verified Extracted Value</span>
                <h4 className="text-lg font-bold text-teal-950">{selectedCitationForInspection.citation.value}</h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-teal-700 block">OCR Confidence</span>
                <span className="font-bold text-emerald-700 text-sm">{selectedCitationForInspection.citation.confidence}%</span>
              </div>
            </div>

            {/* Simulated Bounding Box Visualization */}
            <div className="border border-slate-300 rounded-lg bg-slate-100 p-6 relative min-h-[160px] flex items-center justify-center">
              <div className="w-full max-w-md bg-white p-4 rounded border border-slate-200 text-slate-600 font-mono text-[11px] leading-relaxed relative">
                <p>1. Gross Salary as per provisions contained in section 17(1)</p>
                <div className="my-1.5 p-1.5 border-2 border-emerald-500 bg-emerald-50/60 rounded flex items-center justify-between font-bold text-slate-900">
                  <span>(a) Salary as per provisions contained in sec 17(1)</span>
                  <span className="text-emerald-800">{selectedCitationForInspection.citation.value}</span>
                </div>
                <p>2. Less: Allowance to the extent exempt under section 10</p>
                
                {/* Bounding box marker */}
                <span className="absolute -top-2.5 right-2 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow-xs">
                  OCR Coordinate Target [x:320, y:210, w:140, h:26]
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCitationForInspection(null)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer active:scale-98 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
