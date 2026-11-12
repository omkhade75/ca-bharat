import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Calendar,
  Download,
  AlertCircle,
  Clock,
  ShieldCheck,
  Send,
  Copy,
  Check,
  PhoneCall,
  CheckCircle2,
  Info,
  Upload
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { useApp } from '../../../context/AppContext'
import { formatINR, formatDate, maskPAN } from '../../../utils/formatters'
import Modal from '../../common/Modal'
import { LogoMark } from '../../common/Logo'
import {
  deriveClientFinancialSnapshot,
  generateYoYData,
  generateAllocationData,
  generateClientWealthInsights,
  generateAdvanceTaxSchedule,
  generateClientCommsDrafts,
} from '../../../utils/insightsHelper'

export default function InsightsDeliveryModule() {
  const navigate = useNavigate()
  const { activeClient, activeTaxCase, activeClientDocs, recordReportGenerated, auditLogs, firmDetails, activeAy } = useApp()

  const [activeTab, setActiveTab] = useState('EYE_OPENER') // 'EYE_OPENER', 'GOLD_ADVISORY', 'COMMS', 'AUDIT'
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false)
  const [copiedCommsId, setCopiedCommsId] = useState(null)
  const [selectedCommsTemplate, setSelectedCommsTemplate] = useState('MISSING_DOCS')

  // Derive client-specific financial snapshot & intelligence with actual client docs
  const snapshot = deriveClientFinancialSnapshot(activeClient, activeTaxCase, activeClientDocs)
  const yoyData = generateYoYData(activeClient, snapshot)
  const allocationData = generateAllocationData(activeClient, snapshot)
  const clientInsights = generateClientWealthInsights(activeClient, activeTaxCase, snapshot)
  const advanceTaxSchedule = generateAdvanceTaxSchedule(activeClient, snapshot)
  const commsDrafts = generateClientCommsDrafts(activeClient, activeTaxCase, snapshot, firmDetails, activeAy)

  const handleCopyComms = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedCommsId(key)
    setTimeout(() => setCopiedCommsId(null), 2000)
  }

  const ltcgHeadroom = Math.max(0, 125000 - (snapshot.ltcgUtilized || 0))
  const ltcgPercentage = Math.min(100, ((snapshot.ltcgUtilized || 0) / 125000) * 100)

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Module Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              Module 4
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
              {activeClient?.name} ({maskPAN(activeClient?.pan)})
            </span>
            <h1 className="text-xl font-bold text-slate-900">Insights & Client Delivery</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Engine 2 Personal Finance Eye-Opener, Gold monthly advisory, client communication drafts, and audit log
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (snapshot.isIncomplete) {
                alert(`Cannot generate Financial Eye-Opener: Tax documents for ${activeClient?.name} are incomplete. Missing: ${snapshot.missingDocs?.join(', ') || 'Required documents'}.`)
                return
              }
              setIsReportModalOpen(true)
            }}
            disabled={snapshot.isIncomplete}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-all ${
              snapshot.isIncomplete
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer active:scale-98'
            }`}
            title={snapshot.isIncomplete ? `Intake incomplete for ${activeClient?.name}` : 'Download 2-Page Eye-Opener PDF'}
          >
            <Download className="w-4 h-4" />
            <span>Download 2-Page Eye-Opener PDF</span>
          </button>
        </div>
      </div>

      {/* Prominent Statutory Disclaimer Banner */}
      <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 shadow-xs">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-900 leading-relaxed">
          <strong className="font-semibold">Statutory Disclaimer:</strong> All financial health indicators, regime comparisons, and wealth optimization suggestions presented are sample illustrative models for demonstration purposes. They do not constitute formal investment or tax advice and require independent verification and certification by a practicing Chartered Accountant.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('EYE_OPENER')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'EYE_OPENER'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Annual Financial Eye-Opener (Silver Tier)</span>
        </button>

        <button
          onClick={() => setActiveTab('GOLD_ADVISORY')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'GOLD_ADVISORY'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Gold Monthly Advisory (Advance Tax & Harvesting)</span>
        </button>

        <button
          onClick={() => setActiveTab('COMMS')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'COMMS'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Client Communication Drafts</span>
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'AUDIT'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Regulatory Audit Trail</span>
        </button>
      </div>

      {/* TAB 1: ANNUAL FINANCIAL EYE-OPENER (ENGINE 2 - SILVER TIER) */}
      {activeTab === 'EYE_OPENER' && (
        <div className="space-y-6">
          {/* Incomplete / Onboarding State Banner when client has insufficient data */}
          {snapshot.isIncomplete ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">
                  Financial Eye-Opener Pending Document Intake
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Tax records for <span className="font-semibold text-slate-800">{activeClient?.name}</span> ({activeClient?.pan}) are currently in onboarding or awaiting intake verification. Upload Form 16, Form 26AS, or AIS statements to generate the visual financial snapshot and wealth insights.
                </p>
              </div>

              {snapshot.missingDocs && snapshot.missingDocs.length > 0 && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3 text-left max-w-md mx-auto text-xs">
                  <p className="font-bold text-amber-900 mb-1.5 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    Missing Required Intake Documents ({snapshot.missingDocs.length}):
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-amber-800">
                    {snapshot.missingDocs.map((doc, idx) => (
                      <li key={idx} className="font-medium">{doc}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => navigate('/document-intelligence')}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Go to Document Vault</span>
                </button>
                <button
                  onClick={() => setActiveTab('COMMS')}
                  className="px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  <span>Draft Intake WhatsApp</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Executive Eye-Opener Scorecard */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Total Annual Earnings
                  </span>
                  <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                    {formatINR(snapshot.grossIncome)}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Salary + Other Sources + Gains</p>
                </div>

                <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Effective Tax Rate
                  </span>
                  <div className="text-2xl font-bold text-teal-700 mt-1 font-mono">
                    {snapshot.effectiveTaxRate}%
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Total Tax: {formatINR(snapshot.taxPaid)}</p>
                </div>

                <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Savings & Wealth Ratio
                  </span>
                  <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
                    {snapshot.savingsRate}%
                  </div>
                  <p className="text-[11px] text-emerald-600 font-medium mt-1">Documented Deductions & Wealth</p>
                </div>

                <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Living Expenses (Est.)
                  </span>
                  <div className="text-2xl font-bold text-slate-700 mt-1 font-mono">
                    {formatINR(snapshot.estimatedExpenses)}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">~{formatINR(Math.round(snapshot.estimatedExpenses / 12))}/month</p>
                </div>
              </div>

              {/* Calculation Methodology & Visible Assumptions Card */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-slate-500" />
                    <span className="font-bold text-slate-800">Calculation Methodology & Visible Assumptions</span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    Client Context: {activeClient?.name}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-600 text-[11px] pt-1">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-800 block mb-0.5">Living Expenses Formula</span>
                    <span>Gross Earnings ({formatINR(snapshot.grossIncome)}) − Taxes ({formatINR(snapshot.taxPaid)}) − Documented Savings ({formatINR(snapshot.savingsAndInvestments)}) = <strong className="text-slate-900">{formatINR(snapshot.estimatedExpenses)}</strong></span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-800 block mb-0.5">Effective Tax Rate Formula</span>
                    <span>Total Tax Deposited ({formatINR(snapshot.taxPaid)}) ÷ Gross Earnings ({formatINR(snapshot.grossIncome)}) = <strong className="text-teal-700">{snapshot.effectiveTaxRate}%</strong></span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-800 block mb-0.5">Idle Cash Assumption</span>
                    <span>Assumed 3.0% p.a. savings bank interest vs 7.0% p.a. auto-sweep FD rate. Illustrative model subject to Section 56(2) taxation.</span>
                  </div>
                </div>
              </div>

              {/* 3 Critical Wealth Insights (The Differentiator) */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/20 px-2 py-0.5 rounded border border-teal-500/30">
                        Engine 2 Prototype Intelligence
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                        Illustrative Examples • Requires CA Review
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">
                      3 Critical Wealth Action Insights for {activeClient?.name}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    Simulated from {activeClient?.name}'s AIS & Form 16 Records
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {clientInsights.map((insight) => (
                    <div
                      key={insight.id}
                      className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${insight.dotColor}`} />
                            <h4 className="text-xs font-bold text-slate-100">{insight.title}</h4>
                          </div>
                        </div>
                        <span className="text-[9px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-700/80 text-teal-300 mb-2 inline-block">
                          {insight.badge}
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed mt-1">
                          {insight.narrative}
                        </p>

                        {/* Separate Breakout for Idle Cash if present */}
                        {insight.breakout && (
                          <div className="mt-3 pt-2.5 border-t border-slate-700/80 grid grid-cols-3 gap-1.5 text-[10px] text-center">
                            <div className="bg-slate-900/60 p-1.5 rounded border border-slate-700/60">
                              <span className="text-slate-400 block text-[9px]">Assumed Rate</span>
                              <span className="font-semibold text-slate-200">{insight.breakout.assumedRate}</span>
                            </div>
                            <div className="bg-slate-900/60 p-1.5 rounded border border-slate-700/60">
                              <span className="text-slate-400 block text-[9px]">Est. Balance</span>
                              <span className="font-semibold text-amber-300">{insight.breakout.estimatedBalance}</span>
                            </div>
                            <div className="bg-slate-900/60 p-1.5 rounded border border-slate-700/60">
                              <span className="text-slate-400 block text-[9px]">Hypo. Gain</span>
                              <span className="font-semibold text-emerald-400">{insight.breakout.hypotheticalGain}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-700 text-[11px] text-teal-400 font-semibold">
                        {insight.action}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Analytics: Income vs Deductions and Allocation */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Year-over-Year Growth Chart */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        3-Year Financial Trajectory — {activeClient?.name}
                      </h3>
                      <p className="text-xs text-slate-500">Gross Income vs Taxes Paid vs Wealth Creation ({activeAy})</p>
                    </div>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={yoyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(val) => `₹${val / 100000}L`} tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(val) => formatINR(val)}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Bar dataKey="income" name="Gross Income" fill="#0d9488" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="savings" name="Savings & Investments" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="tax" name="Taxes Paid" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Income Allocation Pie Chart */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Income Allocation — Where {activeClient?.name}'s {formatINR(snapshot.grossIncome)} Goes
                      </h3>
                      <p className="text-xs text-slate-500">Living expenses, tax payments & statutory deductions</p>
                    </div>
                  </div>
                  <div className="h-64 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={allocationData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {allocationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val) => formatINR(val)}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: GOLD MONTHLY ADVISORY PORTAL */}
      {activeTab === 'GOLD_ADVISORY' && (
        <div className="space-y-6">
          {snapshot.isIncomplete ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">
                  Gold Advisory Pending Document Intake
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Advance tax compliance calendars and capital gains harvesting models for <span className="font-semibold text-slate-800">{activeClient?.name}</span> require verified income records. Please complete document intake and reconciliation before accessing monthly advisory modules.
                </p>
              </div>

              {snapshot.missingDocs && snapshot.missingDocs.length > 0 && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3 text-left max-w-md mx-auto text-xs">
                  <p className="font-bold text-amber-900 mb-1.5 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    Missing Required Intake Documents ({snapshot.missingDocs.length}):
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-amber-800">
                    {snapshot.missingDocs.map((doc, idx) => (
                      <li key={idx} className="font-medium">{doc}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => navigate('/document-intelligence')}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Go to Document Vault</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Gold Advisory Banner */}
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-50 border border-amber-300 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                    Gold Monthly Advisory • Active Context: {activeClient?.name}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    Ongoing Tax Planning & Advance Tax Monitoring
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                    CAs eliminate the July burnout by managing client cash flow and advance tax quarterly. Taxpayers avoid surprise interest penalties under Section 234B and 234C.
                  </p>
                </div>

                <button
                  onClick={() => setIsConsultationModalOpen(true)}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Schedule CA Quarterly Call</span>
                </button>
              </div>

              {/* Advance Tax Progress Calendar */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Advance Tax Compliance Calendar — {activeClient?.name} ({activeAy})
                    </h3>
                    <p className="text-xs text-slate-500">Mandatory quarterly tax deposits under Sections 208-211</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Compliance Verified by CA
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {advanceTaxSchedule.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border flex flex-col justify-between ${
                        item.status === 'PAID'
                          ? 'border-emerald-200 bg-emerald-50/40'
                          : item.status === 'EXEMPT'
                          ? 'border-blue-200 bg-blue-50/40'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-900">{item.quarter}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              item.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'EXEMPT'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <span className="text-lg font-bold text-slate-900 font-mono">
                          {formatINR(item.targetAmount)}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">Cumulative target: {item.percentage}</p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center justify-between">
                        <span>Due: {item.dueDate}</span>
                        {item.status === 'PAID' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* March LTCG Tax-Loss Harvesting Widget */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      March LTCG Tax Harvesting Advisor (Sec 112A) — {activeClient?.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Utilize the annual ₹1.25 Lakhs tax-free equity capital gain exemption before March 31
                    </p>
                  </div>
                  <span className="text-xs font-bold text-teal-700 font-mono">
                    {formatINR(snapshot.ltcgUtilized)} / ₹1,25,000 Utilized
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-3 mb-3 overflow-hidden">
                  <div className="bg-teal-600 h-3 rounded-full transition-all" style={{ width: `${ltcgPercentage}%` }} />
                </div>

                <div className="p-3.5 bg-teal-50/80 rounded-xl border border-teal-200 text-xs text-teal-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold">1-Click Harvesting Recommendation:</span>
                    <p className="text-teal-800 mt-0.5">
                      {activeClient?.name} has <b>{formatINR(ltcgHeadroom)} remaining</b> of tax-free headroom under Section 112A. Selling and repurchasing up to {formatINR(ltcgHeadroom)} of appreciated mutual funds before March 31 permanently resets the acquisition cost basis at <b>0% tax</b>. (Subject to STT and brokerage).
                    </p>
                  </div>
                  <button
                    onClick={() => alert(`Harvesting trade instructions dispatched to ${activeClient?.name}'s WhatsApp.`)}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold shrink-0 cursor-pointer text-xs"
                  >
                    Send Advice to Client
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 3: CLIENT COMMUNICATION DRAFTS */}
      {activeTab === 'COMMS' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => setSelectedCommsTemplate('MISSING_DOCS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                selectedCommsTemplate === 'MISSING_DOCS'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Missing Docs Request
            </button>
            <button
              onClick={() => setSelectedCommsTemplate('DISCREPANCY_ALERT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                selectedCommsTemplate === 'DISCREPANCY_ALERT'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              AIS Discrepancy Notice
            </button>
            <button
              onClick={() => setSelectedCommsTemplate('FILING_READY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                selectedCommsTemplate === 'FILING_READY'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Filing Approved & Refund Notice
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {commsDrafts[selectedCommsTemplate].title}
                </h4>
                <p className="text-slate-500 text-[11px]">
                  Channel: {commsDrafts[selectedCommsTemplate].channel} • Recipient: {commsDrafts[selectedCommsTemplate].recipient}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyComms(commsDrafts[selectedCommsTemplate].message, selectedCommsTemplate)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedCommsId === selectedCommsTemplate ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCommsId === selectedCommsTemplate ? 'Copied' : 'Copy Text'}</span>
                </button>
                <button
                  onClick={() => alert(`Simulated message dispatched to ${activeClient?.name} via verified business channel.`)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send via WhatsApp</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl font-mono text-[11.5px] border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner">
              {commsDrafts[selectedCommsTemplate].message}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL LOG */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Tamper-Proof Audit & Monitoring Log</h3>
              <p className="text-xs text-slate-500">Every view, edit, override, and CA sign-off logged with IP hash</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {auditLogs.length} Events Logged
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.actor}</span>
                    <span className="px-2 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-mono">
                      {log.action}
                    </span>
                    <span className="text-slate-500">({log.clientName})</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {formatDate(log.timestamp, true)}
                  </span>
                </div>
                <p className="text-slate-700 mt-1 leading-relaxed">{log.details}</p>
                <div className="mt-1 text-[10px] text-slate-400 font-mono">
                  IP: {log.ipAddress} • Category: {log.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: 2-PAGE VISUAL FINANCIAL EYE-OPENER REPORT PREVIEW */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title={`Annual Financial Eye-Opener Report — ${activeClient?.name}`}
        subtitle={`Fictional Taxpayer: ${activeClient?.name} (${maskPAN(activeClient?.pan)}) • ${firmDetails.firmName} • Sample Report`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6 text-xs print:p-0 relative">
          {/* Prominent Prototype Demonstration Watermark */}
          <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-lg p-2.5 text-center text-amber-900 font-bold uppercase tracking-wider text-[11px] flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>PROTOTYPE DEMONSTRATION ONLY • NOT A STATUTORY TAX FILING OR LEGAL AUDIT CERTIFICATE</span>
          </div>

          {/* Page 1: Executive Tax & Earnings Summary */}
          <div className="border border-slate-300 rounded-xl p-6 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-xl bg-[#0B132B] shadow-xs border border-amber-400/40 shrink-0">
                  <LogoMark size={36} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{firmDetails.firmName}</h3>
                  <p className="text-slate-500 text-[11px]">FRN: {firmDetails.registrationNo} • Chartered Accountants</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 block">
                  ANNUAL FINANCIAL EYE-OPENER
                </span>
                <span className="text-xs font-semibold text-slate-700">{activeAy}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Taxpayer Name</span>
                <p className="font-bold text-slate-900 text-sm">{activeClient?.name}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">PAN (Masked)</span>
                <p className="font-mono font-bold text-slate-900 text-sm">{activeClient?.pan}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Gross Annual Earnings</span>
                <p className="font-mono font-bold text-slate-900 text-sm">{formatINR(snapshot.grossIncome)}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Illustrative Tax Refund</span>
                <p className="font-mono font-bold text-emerald-700 text-sm">{formatINR(activeClient?.refundExpected || 0)}</p>
              </div>
            </div>

            {/* Financial Health Indicators */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Effective Tax Rate</span>
                <span className="text-base font-bold text-teal-700 font-mono">{snapshot.effectiveTaxRate}%</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Tax Paid: {formatINR(snapshot.taxPaid)}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Savings & Wealth Ratio</span>
                <span className="text-base font-bold text-emerald-600 font-mono">{snapshot.savingsRate}%</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Documented: {formatINR(snapshot.savingsAndInvestments)}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Est. Living Expenses</span>
                <span className="text-base font-bold text-slate-700 font-mono">{formatINR(snapshot.estimatedExpenses)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">~{formatINR(Math.round(snapshot.estimatedExpenses / 12))}/mo</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 space-y-2">
              <h4 className="font-bold text-slate-900">Tax Optimization & Statutory Deductions Breakdown</h4>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                By filing under the statutory optimized regime with verified deductions, {activeClient?.name} retained maximum capital. With total TDS/Advance tax paid of {formatINR(snapshot.taxPaid)}, an illustrative electronic refund of <b>{formatINR(activeClient?.refundExpected || 0)}</b> is indicated. (Sample tax computation for demonstration only).
              </p>
            </div>

            {/* Client Wealth Insights Summary */}
            <div className="border border-slate-200 rounded-lg p-4 space-y-2.5">
              <h4 className="font-bold text-slate-900">Client Wealth Action Points for {activeClient?.name}</h4>
              <div className="space-y-2">
                {clientInsights.map((ins) => (
                  <div key={ins.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px]">
                    <span className="font-semibold text-slate-800">{ins.title}</span>
                    <p className="text-slate-600 mt-0.5">{ins.narrative}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Visible Assumptions Callout */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[10.5px] text-slate-500 space-y-1">
              <span className="font-semibold text-slate-700 block">Report Assumptions:</span>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Living Expenses = Gross Annual Earnings minus Taxes Paid and Documented Savings/Investments.</li>
                <li>Effective Tax Rate = Total Tax Deposited divided by Gross Annual Earnings.</li>
                <li>Savings interest model assumes 3.0% savings yield vs 7.0% auto-sweep FD rate. Not guaranteed.</li>
                <li>All tax computations and regime choices require certification by a licensed CA.</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <span className="text-[11px] text-slate-500">
              Powered by CA Bharat AI • Certified by CA Rajesh Sharma (Demo Partner • FCA #DEMO049281)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  recordReportGenerated(activeTaxCase?.id)
                  window.print()
                }}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Print / Save PDF (Simulated)
              </button>
              <button
                onClick={() => {
                  recordReportGenerated(activeTaxCase?.id)
                  alert(`2-Page Visual Financial Eye-Opener PDF downloaded for ${activeClient?.name}. Case state updated to Report Generated.`)
                  setIsReportModalOpen(false)
                }}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* MODAL: SCHEDULE CA CONSULTATION */}
      <Modal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        title={`Schedule Quarterly Tax Review — ${activeClient?.name}`}
        subtitle={`1-on-1 Consultation with CA Rajesh Sharma, FCA (#DEMO049281)`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Taxpayer Profile</label>
            <input
              type="text"
              readOnly
              value={`${activeClient?.name} (${activeClient?.pan})`}
              className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Consultation Date</label>
            <input
              type="date"
              defaultValue="2024-07-05"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Preferred Time Slot</label>
            <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
              <option>11:00 AM - 11:15 AM (IST)</option>
              <option>02:30 PM - 02:45 PM (IST)</option>
              <option>05:00 PM - 05:15 PM (IST)</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Agenda / Discussion Topics</label>
            <textarea
              rows={3}
              defaultValue={`Review Section 80CCD(1B) NPS contribution options and set up auto-sweep FD to avoid idle cash loss for ${activeClient?.name}.`}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              onClick={() => setIsConsultationModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                alert(`Calendar invite and Google Meet link dispatched to ${activeClient?.email}.`)
                setIsConsultationModalOpen(false)
              }}
              className="px-4 py-1.5 rounded-lg bg-teal-600 text-white font-semibold cursor-pointer"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
