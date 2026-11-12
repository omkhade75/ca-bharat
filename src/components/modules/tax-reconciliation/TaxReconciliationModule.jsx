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
  ShieldCheck,
  Send,
  Copy
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { useApp } from '../../../context/AppContext'
import { formatINR, formatDate } from '../../../utils/formatters'
import { compareTaxRegimes } from '../../../utils/taxCalculator'
import Badge from '../../common/Badge'
import Modal from '../../common/Modal'

export default function TaxReconciliationModule() {
  const navigate = useNavigate()
  const {
    activeClient,
    activeTaxCase,
    acceptDiscrepancy,
    approveTaxCase,
    requestCorrection,
    activeAy,
  } = useApp()

  const [activeTab, setActiveTab] = useState('RECONCILIATION') // 'RECONCILIATION', 'OPTIMIZER', 'CA_SIGN_OFF'
  const [isItrJsonOpen, setIsItrJsonOpen] = useState(false)
  const [isClarificationOpen, setIsClarificationOpen] = useState(false)
  const [clarificationReason, setClarificationReason] = useState('')
  const [caApprovalNotes, setCaApprovalNotes] = useState(
    'Verified against TRACES 26AS, AIS SFT records, and Form 16 Part A+B. TDS credit validated in OLTAS.'
  )
  const [copiedJson, setCopiedJson] = useState(false)

  // Compute live tax comparison using deterministic engine
  const taxComparison = activeTaxCase
    ? compareTaxRegimes(
        activeTaxCase.incomes,
        activeTaxCase.deductions,
        activeTaxCase.taxesPaid?.totalTds || 180420
      )
    : null

  const pendingDiscrepancies =
    activeTaxCase?.reconciliationItems?.filter((i) => !i.isAccepted && i.status.includes('MISMATCH')) || []

  // Handle CA Sign-off with celebration confetti
  const handleApproveCase = () => {
    approveTaxCase(activeTaxCase.caseId, caApprovalNotes)
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    })
    setIsItrJsonOpen(true)
  }

  // Handle Request Clarification
  const handleSendClarification = (e) => {
    e.preventDefault()
    requestCorrection(activeTaxCase.caseId, clarificationReason || 'Clarification required regarding AIS mismatch.')
    setIsClarificationOpen(false)
    alert(`Clarification request sent to ${activeClient?.name} via WhatsApp alert.`)
  }

  // Generate Sample Government ITR-2 JSON Schema
  const generatedItrJson = activeTaxCase
    ? JSON.stringify(
        {
          ITR: {
            ITR2: {
              CreationInfo: {
                SWVersionNo: 'CA_BHARAT_AI_V1.0',
                SWCreatedBy: 'Sharma & Co. Chartered Accountants',
                JSONCreatedBy: 'CA Rajesh Sharma (FCA #049281)',
                CreationDate: activeTaxCase.approval?.approvedAt?.split('T')[0] || '2026-07-28',
                IntermediaryCity: 'Mumbai',
                Digest: activeTaxCase.approval?.sha256Hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
              },
              PersonalInfo: {
                AssesseeName: {
                  FirstName: activeClient?.name?.split(' ')[0] || 'Rahul',
                  SurNameOrOrgName: activeClient?.name?.split(' ')[1] || 'Sharma',
                },
                PAN: activeClient?.pan || 'DEMOP1234F',
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
                Salaries: activeTaxCase.incomes.salary,
                IncomeFromOtherSources: activeTaxCase.incomes.otherSources,
                CapitalGains: {
                  LTCG: activeTaxCase.incomes.capitalGainsLTCG,
                },
                GrossTotalIncome: taxComparison?.oldRegime?.grossTotalIncome,
                TotalDeductions: taxComparison?.oldRegime?.totalDeductions,
                TotalIncome: taxComparison?.oldRegime?.netTaxableIncome,
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
    navigator.clipboard.writeText(generatedItrJson)
    setCopiedJson(true)
    setTimeout(() => setCopiedJson(false), 2000)
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
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Case Status</span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full inline-block ${
                activeTaxCase?.status === 'CA Approved'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : pendingDiscrepancies.length > 0
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}
            >
              {activeTaxCase?.status || 'Active'}
            </span>
          </div>

          {activeTaxCase?.approval?.isApproved ? (
            <button
              onClick={() => setIsItrJsonOpen(true)}
              className="px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>View ITR JSON</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('CA_SIGN_OFF')}
              className="px-3.5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Review & Sign-Off</span>
            </button>
          )}
        </div>
      </div>

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
            {activeTaxCase?.filingForm || 'ITR-2'}
          </span>
          <p className="text-[11px] text-slate-400">Upgraded via AIS Capital Gains</p>
        </div>

        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Optimal Regime</span>
          <span className="text-sm font-bold text-emerald-400">
            {taxComparison?.recommendedRegime}
          </span>
          <p className="text-[11px] text-slate-400">Saves {formatINR(taxComparison?.taxSaved || 0)}</p>
        </div>

        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Expected Direct Refund</span>
          <span className="text-base font-bold text-emerald-400 font-mono">
            {formatINR(taxComparison?.refundAmount || 0)}
          </span>
          <p className="text-[11px] text-slate-400">TDS: {formatINR(taxComparison?.tdsPaid || 0)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('RECONCILIATION')}
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
          onClick={() => setActiveTab('OPTIMIZER')}
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
          {/* Summary Banner */}
          <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900">
                  {pendingDiscrepancies.length > 0
                    ? `${pendingDiscrepancies.length} Cross-Document Discrepancies Detected • Moderate to High Risk`
                    : 'All Cross-Document Items Successfully Reconciled ✓'}
                </h4>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  Comparing Form 16 (Part A & B), Form 26AS TRACES credits, and AIS / TIS SFT transaction codes. Accepting discrepancies automatically updates gross income schedules.
                </p>
              </div>
            </div>

            {pendingDiscrepancies.length > 0 && (
              <button
                onClick={() => {
                  pendingDiscrepancies.forEach((i) => acceptDiscrepancy(i.id))
                }}
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 shadow-xs cursor-pointer"
              >
                Accept All & Recalculate
              </button>
            )}
          </div>

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
                  {activeTaxCase?.reconciliationItems?.map((item) => {
                    const isMismatch = !item.isAccepted && item.status.includes('MISMATCH')
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isMismatch ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{item.item}</p>
                          <p className="text-[11px] text-slate-500">{item.category}</p>
                          {item.sourceCitation && (
                            <p className="text-[10px] text-teal-700 font-medium mt-0.5">
                              Citation: {item.sourceCitation}
                            </p>
                          )}
                        </td>

                        <td className="py-3 px-3 font-mono font-medium text-slate-800">
                          {formatINR(item.form16)}
                        </td>

                        <td className="py-3 px-3 font-mono font-medium text-slate-800">
                          {formatINR(item.form26AS)}
                        </td>

                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {formatINR(item.aisTis)}
                        </td>

                        <td className="py-3 px-3">
                          {item.isAccepted || item.status === 'MATCHED' || item.status === 'MATCHED_RESOLVED' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Reconciled ✓
                            </span>
                          ) : (
                            <Badge variant={item.riskLevel === 'High' ? 'danger' : 'warning'} size="xs">
                              {item.riskLevel}: Mismatch
                            </Badge>
                          )}
                          {isMismatch && item.noticeRisk && (
                            <p className="text-[10px] text-amber-800 mt-1 leading-tight font-medium">
                              {item.noticeRisk}
                            </p>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          {isMismatch ? (
                            <button
                              onClick={() => acceptDiscrepancy(item.id)}
                              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] transition-all shadow-xs cursor-pointer active:scale-98"
                            >
                              Accept & Add
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">Verified</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Explanations Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <h4 className="text-xs font-bold text-slate-900">
                  Finding 1: Unreported Savings Bank Interest (Sec 80TTA)
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                AIS SFT-005 reports ₹32,000 from HDFC Bank and ₹14,000 from SBI (Total: ₹46,000). Form 16 does not report this. Under Section 80TTA, taxpayers get a deduction up to ₹10,000. Net ₹36,000 must be taxed under Income from Other Sources to prevent CPC intimation under Section 143(1)(a).
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <h4 className="text-xs font-bold text-slate-900">
                  Finding 2: Mutual Fund LTCG Triggers ITR-2 Upgrade
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                AIS SFT-017 reports ₹58,000 long-term capital gains on Groww platform redemptions. Taxpayers cannot file ITR-1 Sahaj when capital gains exist; doing so generates a defective return notice under Section 139(9). System automatically upgrades filing to ITR-2 with Schedule CG.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DETERMINISTIC REGIME OPTIMIZER */}
      {activeTab === 'OPTIMIZER' && taxComparison && (
        <div className="space-y-6">
          {/* Smart Recommendation Banner */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  Sample Mathematical Optimizer (Prototype Calculation)
                </span>
                <h3 className="text-base font-bold text-emerald-950 mt-1">
                  {taxComparison.recommendationReason}
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Illustrative rule-based calculation conforming to Finance Act 2024. For prototype demonstration only; not formal tax advice.
                </p>
              </div>
            </div>

            <div className="text-right shrink-0 bg-white px-4 py-2.5 rounded-lg border border-emerald-200 shadow-xs">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Net Tax Saved</span>
              <span className="text-xl font-bold text-emerald-600">
                {formatINR(taxComparison.taxSaved)}
              </span>
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
                  Statutory CA Pre-Filing Checklist (ICAI Professional Standards)
                </h3>
                <p className="text-xs text-slate-500">
                  Mandatory verification criteria before generating government filing schema
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
                    Sample PAN Master & Aadhaar Profile (Simulated Verification Demo)
                  </span>
                </div>
                <span className="text-emerald-700 font-bold text-[11px]">PASSED ✓</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium text-slate-800">
                    Sample Form 16 Part A TDS matched with TRACES Form 26AS demo data
                  </span>
                </div>
                <span className="text-emerald-700 font-bold text-[11px]">PASSED ✓</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium text-slate-800">
                    Pre-Validated Bank Account Sample (Simulated Direct Electronic Refund Demo)
                  </span>
                </div>
                <span className="text-emerald-700 font-bold text-[11px]">PASSED ✓</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {pendingDiscrepancies.length === 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <span className="font-medium text-slate-800">
                    3-Way Cross-Reconciliation Discrepancies Resolved (AIS SFT-005 interest & SFT-017 LTCG)
                  </span>
                </div>
                <span
                  className={`font-bold text-[11px] ${
                    pendingDiscrepancies.length === 0 ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {pendingDiscrepancies.length === 0 ? 'RESOLVED ✓' : `${pendingDiscrepancies.length} PENDING`}
                </span>
              </div>
            </div>
          </div>

          {/* CA Sign-Off Action Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-6 shadow-sm border border-slate-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                  Simulated CA Sign-Off Gateway (Prototype Action)
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  Simulated Chartered Accountant Review & Approval
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                  Under the Income Tax Act, real e-filing requires a valid digital signature certificate (DSC) or Aadhaar OTP. This is an illustrative prototype action demonstrating CA oversight.
                </p>
                {!activeTaxCase?.approval?.isApproved && (
                  <div className="mt-3">
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      CA Sign-Off Certification Notes:
                    </label>
                    <textarea
                      rows={2}
                      value={caApprovalNotes}
                      onChange={(e) => setCaApprovalNotes(e.target.value)}
                      className="w-full bg-slate-950/70 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-hidden focus:border-blue-500 placeholder:text-slate-500"
                      placeholder="Add formal certification notes..."
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setIsClarificationOpen(true)}
                  className="px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600 transition-colors cursor-pointer"
                >
                  Request Client Clarification
                </button>

                <button
                  onClick={handleApproveCase}
                  disabled={activeTaxCase?.approval?.isApproved}
                  className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-98 ${
                    activeTaxCase?.approval?.isApproved
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-blue-600 hover:bg-blue-500 text-white font-bold'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {activeTaxCase?.approval?.isApproved
                      ? 'Approved by CA (Simulated Prototype Action) ✓'
                      : 'Simulate Sign-Off & Generate Filing Pack'}
                  </span>
                </button>
              </div>
            </div>

            {/* Approval Metadata Display */}
            {activeTaxCase?.approval?.isApproved && (
              <div className="mt-4 pt-4 border-t border-slate-700/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Approved By:</span>
                  <p className="text-teal-300 font-semibold">{activeTaxCase.approval.approvedBy}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Timestamp:</span>
                  <p className="text-slate-200">{formatDate(activeTaxCase.approval.approvedAt, true)}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Demonstration Identifier (Not a Legal DSC Signature):</span>
                  <p className="font-mono text-slate-300 text-[11px] truncate">
                    {activeTaxCase.approval.sha256Hash}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: GOVERNMENT ITR JSON VIEWER */}
      <Modal
        isOpen={isItrJsonOpen}
        onClose={() => setIsItrJsonOpen(false)}
        title="Sample Government ITR-2 Filing Schema"
        subtitle={`Fictional PAN: ${activeClient?.pan} • Assessment Year: ${activeAy} • Simulated Schema (No Live Portal Connection)`}
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
    </div>
  )
}
