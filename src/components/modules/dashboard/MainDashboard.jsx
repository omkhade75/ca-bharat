import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  FileCheck2,
  Scale,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  Upload,
  UserPlus,
  ShieldAlert,
  ChevronRight
} from 'lucide-react'
import { useApp } from '../../../context/AppContext'
import { formatINR, formatDate, maskPAN } from '../../../utils/formatters'
import Badge from '../../common/Badge'
import { LogoMark } from '../../common/Logo'

export default function MainDashboard() {
  const navigate = useNavigate()
  const {
    clients,
    activeClient,
    setActiveClientId,
    documents,
    taxCases,
    activeTaxCase,
    auditLogs,
    activeAy,
  } = useApp()

  const [filterStatus, setFilterStatus] = useState('ALL')

  // Calculate metrics dynamically from coherent dataset
  const totalClientsCount = clients.length
  const activeCasesCount = taxCases.length
  const documentsProcessedCount = documents.length
  const discrepancyCount = clients.reduce((acc, c) => acc + (c.discrepancyCount || 0), 0)
  const awaitingApprovalCount = clients.filter((c) => c.status === 'Ready for Review').length
  const illustrativeRefundTotal = clients.reduce((acc, c) => acc + (c.refundExpected || 0), 0)

  // Filter clients table
  const filteredClients = clients.filter((c) => {
    if (filterStatus === 'ALL') return true
    if (filterStatus === 'ACTION_REQUIRED') return c.status === 'Action Required'
    if (filterStatus === 'READY_FOR_REVIEW') return c.status === 'Ready for Review'
    if (filterStatus === 'FILED') return c.status === 'Filed'
    return true
  })

  const openClientWorkspace = (clientId) => {
    setActiveClientId(clientId)
    navigate('/tax-reconciliation')
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner: Mission Statement & Active Context */}
      <div className="bg-gradient-to-br from-[#0B132B] via-[#0F172A] to-[#172554] text-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-800 border-t-2 border-t-amber-400/80 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/30">
                Sharma & Co. Chartered Accountants
              </span>
              <span className="text-xs text-slate-400">• {activeAy} Lifecycle (Enterprise Sandbox)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              Chartered Accountant Mission Control
            </h1>
            <p className="text-slate-300 text-xs sm:text-[13px] mt-1.5 max-w-2xl leading-relaxed">
              Deterministic 3-way cross-check (Form 16 vs 26AS vs AIS), sample regime optimization, and continuous client personal finance intelligence. All demo PANs and entities are fictional.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => navigate('/firm-clients')}
              className="px-4 py-2.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer active:scale-98"
            >
              <UserPlus className="w-3.5 h-3.5 text-blue-200" />
              <span>Add Client</span>
            </button>
            <button
              onClick={() => navigate('/document-intelligence')}
              className="px-4 py-2.5 text-xs font-semibold rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 transition-all flex items-center gap-1.5 border border-slate-700/80 cursor-pointer active:scale-98"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Upload Documents</span>
            </button>
          </div>
        </div>

        {/* Bespoke emblem watermark in background */}
        <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none select-none hidden sm:block">
          <LogoMark size={180} />
        </div>
      </div>

      {/* 6 High-Fidelity Enterprise Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200 border-t-2 border-t-slate-400 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Clients</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalClientsCount}</div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">{clients.filter((c) => c.status === 'Filed').length} Filed</span> • {clients.filter((c) => c.status === 'Onboarding').length} Intake
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 border-t-2 border-t-blue-500 shadow-xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Tax Cases</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{activeCasesCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">In progress for {activeAy}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 border-t-2 border-t-indigo-500 shadow-xs hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Docs Processed</span>
            <FileCheck2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{documentsProcessedCount}</div>
          <p className="text-[11px] text-indigo-600 font-semibold mt-1">Simulated Vault</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-amber-200/90 border-t-2 border-t-amber-500 bg-amber-50/20 shadow-xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">Discrepancies</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{discrepancyCount}</div>
          <p className="text-[11px] text-amber-700/80 mt-1">Cross-doc mismatches</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 border-t-2 border-t-violet-500 shadow-xs hover:border-violet-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">CA Approval Due</span>
            <Clock className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-2xl font-bold text-violet-600">{awaitingApprovalCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Ready for sign-off</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-emerald-200 border-t-2 border-t-emerald-500 shadow-xs bg-emerald-50/30 hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Illustrative Refunds</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono">{formatINR(illustrativeRefundTotal, { compact: true })}</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Sample Tax Calculation</p>
        </div>
      </div>

      {/* 5-Stage End-to-End Workflow Progress Pipeline */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Standard CA Tax Filing & Advisory Pipeline</h2>
            <p className="text-xs text-slate-500">Continuous 5-stage automated quality workflow with mandatory CA sign-off</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Prototype Demo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
          <div className="p-3 rounded-lg border border-teal-200 bg-teal-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-teal-800">
                <span>1. Client Intake</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <p className="text-[11px] text-teal-700 mt-1">Consent demonstration, PAN validation & WhatsApp intake links</p>
            </div>
            <div className="mt-3 text-[10px] font-semibold text-teal-800">{clients.filter((c) => c.status === 'Onboarding').length} Pending Intake</div>
          </div>

          <div className="p-3 rounded-lg border border-teal-200 bg-teal-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-teal-800">
                <span>2. In-Memory Vault Concept</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <p className="text-[11px] text-teal-700 mt-1">Simulated in-memory unlock & demonstration OCR parser</p>
            </div>
            <div className="mt-3 text-[10px] font-semibold text-teal-800">{documents.length} Docs Staged</div>
          </div>

          <div className="p-3 rounded-lg border border-amber-300 bg-amber-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span>3. 3-Way Reconciliation</span>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <p className="text-[11px] text-amber-800 mt-1">Form 16 vs 26AS vs AIS cross-check with coordinate citations</p>
            </div>
            <div className="mt-3 text-[10px] font-bold text-amber-900">{taxCases.filter((tc) => tc.status === 'Discrepancy Detected').length} Cases Flagged</div>
          </div>

          <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                <span>4. Deterministic Tax & CA Sign-off</span>
                <Scale className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <p className="text-[11px] text-blue-800 mt-1">Old vs New Regime optimizer + simulated CA approval gateway</p>
            </div>
            <div className="mt-3 text-[10px] font-semibold text-blue-900">{awaitingApprovalCount} Ready for CA Review</div>
          </div>

          <div className="p-3 rounded-lg border border-purple-200 bg-purple-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                <span>5. Annual Eye-Opener</span>
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <p className="text-[11px] text-purple-800 mt-1">Sample wealth scorecard, quarterly Advance Tax & advisory</p>
            </div>
            <div className="mt-3 text-[10px] font-semibold text-purple-900">{clients.filter((c) => c.status === 'Filed').length} Cases Delivered</div>
          </div>
        </div>
      </div>

      {/* Interactive Trigger Banner for Active Discrepancy */}
      {activeTaxCase && activeTaxCase.reconciliationItems?.some((i) => !i.isAccepted && i.status.includes('MISMATCH')) && (
        <div className="bg-amber-50/90 border border-amber-300/90 rounded-xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-700 shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200/80 text-amber-900">
                  Priority Action Required
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {activeClient?.name} ({activeClient?.pan})
                </span>
              </div>
              <p className="text-xs text-amber-900 font-medium mt-1">
                {activeTaxCase.reconciliationItems.filter((i) => !i.isAccepted && i.status.includes('MISMATCH')).length} Mismatches Detected in AIS vs Form 16: Review discrepancies in 3-way reconciliation before return filing.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/tax-reconciliation')}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors shrink-0 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>Open 3-Way Reconciliation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Client Directory Table & Real-Time Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Client Case Directory */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Client Case Master Directory</h3>
              <p className="text-xs text-slate-500">All active taxpayer lifecycles for {activeAy}</p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  filterStatus === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({clients.length})
              </button>
              <button
                onClick={() => setFilterStatus('ACTION_REQUIRED')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  filterStatus === 'ACTION_REQUIRED' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Discrepancy ({clients.filter((c) => c.status === 'Action Required').length})
              </button>
              <button
                onClick={() => setFilterStatus('READY_FOR_REVIEW')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  filterStatus === 'READY_FOR_REVIEW' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Review ({clients.filter((c) => c.status === 'Ready for Review').length})
              </button>
              <button
                onClick={() => setFilterStatus('FILED')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  filterStatus === 'FILED' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Filed ({clients.filter((c) => c.status === 'Filed').length})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-4">Taxpayer Profile</th>
                  <th className="py-2.5 px-3">Filing Form</th>
                  <th className="py-2.5 px-3">Tier</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Refund Est.</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((client) => {
                  const isCurrent = client.id === activeClient?.id
                  return (
                    <tr
                      key={client.id}
                      onClick={() => openClientWorkspace(client.id)}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                        isCurrent ? 'bg-teal-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={client.avatar}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 flex items-center gap-1.5 truncate">
                              {client.name}
                              {isCurrent && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 font-bold">
                                  ACTIVE
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono">
                              {maskPAN(client.pan)} • {client.category.split(' - ')[0]}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[11px]">
                          {client.itrType}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            client.tier === 'Platinum'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : client.tier === 'Gold'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {client.tier}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {client.status === 'Action Required' ? (
                          <Badge variant="warning" size="xs">
                            {client.discrepancyCount} Discrepancy
                          </Badge>
                        ) : client.status === 'Ready for Review' ? (
                          <Badge variant="primary" size="xs">
                            Ready for Review
                          </Badge>
                        ) : client.status === 'Filed' ? (
                          <Badge variant="success" size="xs">
                            Filed & Verified ✓
                          </Badge>
                        ) : (
                          <Badge variant="default" size="xs">
                            {client.status}
                          </Badge>
                        )}
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {client.refundExpected > 0 ? (
                          <span className="text-emerald-600 font-bold">
                            {formatINR(client.refundExpected)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center text-teal-600 hover:text-teal-700 font-semibold gap-1 text-[11px]">
                          Open Case <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Recent Audit Trail Feed */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Immutable Audit Stream</h3>
              <p className="text-xs text-slate-500">Demonstration regulatory log</p>
            </div>
            <button
              onClick={() => navigate('/insights-delivery')}
              className="text-[11px] text-teal-600 font-semibold hover:underline cursor-pointer"
            >
              Full Log
            </button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-3.5">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="text-xs flex items-start gap-2.5 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 text-[11px]">{log.actor}</span>
                    <span className="text-[10px] text-slate-400">{formatDate(log.timestamp, true)}</span>
                  </div>
                  <p className="text-slate-600 text-[11.5px] mt-0.5 leading-snug">{log.details}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono font-medium">
                      {log.category}
                    </span>
                    <span className="text-[9px] text-slate-400">IP: {log.ipAddress}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
