import React, { useState } from 'react'
import {
  Sparkles,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Download,
  FileText,
  Calculator,
  Lock,
  Building,
  Check,
  Copy,
  Layers,
  Award,
  TrendingUp,
} from 'lucide-react'
import { CORE_OPERATING_PRINCIPLE } from '../../data/workflowStagesData'

export default function SimulatorWorkspace() {
  const [activePersona, setActivePersona] = useState('rahul')
  const [currentStageIndex, setCurrentStageIndex] = useState(0) // 0 to 6

  // Persona simulation states
  const [consentGranted, setConsentGranted] = useState(true)
  const [docsUploaded, setDocsUploaded] = useState(true)
  const [ocrRun, setOcrRun] = useState(true)
  const [discrepancyAccepted, setDiscrepancyAccepted] = useState(true)
  const [selectedRegime, setSelectedRegime] = useState('new')
  const [caSignedOff, setCaSignedOff] = useState(false)
  const [reportDownloaded, setReportDownloaded] = useState(false)

  const STAGE_TITLES = [
    { number: 1, name: 'Setup & Consent', steps: 'Steps 01-04' },
    { number: 2, name: 'Taxpayer Profile', steps: 'Steps 05-08' },
    { number: 3, name: 'Vault & 3-Way Audit', steps: 'Steps 09-14' },
    { number: 4, name: 'ITR & Tax Computation', steps: 'Steps 15-20' },
    { number: 5, name: 'CA Review & Filing', steps: 'Steps 21-25' },
    { number: 6, name: 'Reporting & Engine 2', steps: 'Steps 26-29' },
    { number: 7, name: 'Continuous Management', steps: 'Steps 30-33' },
  ]

  const handleNextStage = () => {
    if (currentStageIndex < 6) setCurrentStageIndex((prev) => prev + 1)
  }

  const handlePrevStage = () => {
    if (currentStageIndex > 0) setCurrentStageIndex((prev) => prev - 1)
  }

  const resetSimulation = () => {
    setCurrentStageIndex(0)
    setCaSignedOff(false)
    setReportDownloaded(false)
  }

  return (
    <section id="simulator" className="space-y-6 scroll-mt-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-900 border border-amber-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>INTERACTIVE STAGE SIMULATOR</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Walk Through a Live Taxpayer Case Across All 7 Stages
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-1.5 max-w-3xl leading-relaxed">
            Test how real data flows from Stage 1 setup and DPDP consent to Stage 3 3-way reconciliation, Stage 4 regime optimization, Stage 5 CA sign-off, and Stage 6 Engine 2 advisory.
          </p>
        </div>

        {/* Persona Selector */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => { setActivePersona('rahul'); resetSimulation(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activePersona === 'rahul'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rahul S. (Salaried VP)
          </button>
          <button
            onClick={() => { setActivePersona('suresh'); resetSimulation(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activePersona === 'suresh'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dr. Suresh (Clinic & HUF)
          </button>
        </div>
      </div>

      {/* Simulator Workspace Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Stages Progress Indicator Bar */}
        <div className="bg-slate-900 p-4 border-b border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {STAGE_TITLES.map((stg, idx) => {
              const isPast = idx < currentStageIndex
              const isCurrent = idx === currentStageIndex

              return (
                <button
                  key={stg.number}
                  onClick={() => setCurrentStageIndex(idx)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md ring-2 ring-amber-300/40'
                      : isPast
                      ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750'
                      : 'bg-slate-850/60 text-slate-400 border-slate-800/80 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="font-mono">Stage {stg.number}</span>
                    {isPast && <Check className="w-3 h-3 text-emerald-400" />}
                    {isCurrent && <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse" />}
                  </div>
                  <div className="text-xs font-semibold truncate leading-tight">
                    {stg.name}
                  </div>
                  <div className="text-[9px] opacity-70 mt-0.5">
                    {stg.steps}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Dynamic Stage Interactive Content */}
        <div className="p-6 space-y-6">
          {/* Stage 1: Setup & Consent */}
          {currentStageIndex === 0 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Stage 1: Firm Setup & DPDP Client Consent (Steps 01-04)</h3>
                  <p className="text-xs text-slate-500">Firm registered, team permissions assigned, and digital client consent authorized.</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                  Consent Authorized ✓
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 block">Step 1 & 2: Firm & Taxpayer Profile</span>
                  <div className="space-y-1 text-slate-700">
                    <p><strong>Firm:</strong> Sharma & Co. Chartered Accountants (FRN: DEMO012984N)</p>
                    <p><strong>Client:</strong> {activePersona === 'rahul' ? 'Rahul Sharma (Salaried Tech VP)' : 'Dr. Suresh S. (Consultant Doctor)'}</p>
                    <p><strong>PAN:</strong> <span className="font-mono font-bold text-amber-700">{activePersona === 'rahul' ? 'DEMOP1234F' : 'DEMOP4419E'}</span></p>
                    <p><strong>Assessment Year:</strong> AY 2025-26 (FY 2024-25)</p>
                  </div>
                </div>

                <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2">
                  <span className="font-bold text-slate-900 block">Step 4: DPDP Digital Consent Token</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Consent granted for tax computation, in-memory vault processing, and continuous wealth advisory.
                  </p>
                  <div className="font-mono text-[10px] bg-white p-2 rounded border border-amber-200 text-slate-700 truncate">
                    Hash: demo-hash-e3b0c44298fc1c149afbf4c8996fb92427ae41e...
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>IP: 192.168.1.101 (Bengaluru)</span>
                    <span>Valid Through: 31 Mar 2027</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stage 2: Taxpayer & Financial Understanding */}
          {currentStageIndex === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Stage 2: Taxpayer & Financial Understanding (Steps 05-08)</h3>
                  <p className="text-xs text-slate-500">Entity type classification, prior year review, and dynamic checklist synthesis.</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                  Profile Synthesized ✓
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Step 5: Entity Type</span>
                  <p className="font-bold text-slate-900 text-sm">
                    {activePersona === 'rahul' ? 'Individual (Salaried)' : 'Individual + HUF'}
                  </p>
                  <p className="text-slate-500 text-[11px] mt-1">
                    {activePersona === 'rahul' ? 'Resident & Ordinarily Resident (ROR)' : 'HUF has distinct PAN & separate Karta records'}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Step 7: Income Sources</span>
                  <p className="font-bold text-slate-900 text-sm">
                    {activePersona === 'rahul' ? 'Salary + HP + Capital Gains + Other' : 'Clinic Profession 44ADA + HUF Rent'}
                  </p>
                  <p className="text-slate-500 text-[11px] mt-1">
                    {activePersona === 'rahul' ? '4 Income heads active' : 'Presumptive 50% limit u/s 44ADA'}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Step 8: Generated Checklist</span>
                  <p className="font-bold text-emerald-700 text-sm">4 Mandatory Categories</p>
                  <p className="text-slate-500 text-[11px] mt-1">Form 16, 26AS, AIS/TIS, and Broker P&L</p>
                </div>
              </div>
            </div>
          )}

          {/* Stage 3: Document Collection & AI Processing */}
          {currentStageIndex === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Stage 3: Document AI & 3-Way Reconciliation (Steps 09-14)</h3>
                  <p className="text-xs text-slate-500">In-memory vault intake, OCR coordinate extraction, and 3-way cross-referencing.</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                  3-Way Audit Complete ✓
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <span className="font-bold text-slate-900 block">Step 13 & 14: 3-Way Reconciliation Matrix (Form 16 vs 26AS vs AIS)</span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left bg-white border border-slate-200 rounded-lg">
                    <thead className="bg-slate-100 text-[10px] text-slate-600 uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-2">Income Schedule</th>
                        <th className="p-2">Form 16</th>
                        <th className="p-2">Form 26AS</th>
                        <th className="p-2">AIS / TIS</th>
                        <th className="p-2">Variance</th>
                        <th className="p-2">CA Resolution</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      <tr>
                        <td className="p-2 font-medium">Salary u/s 17(1)</td>
                        <td className="p-2 font-mono">₹24,50,000</td>
                        <td className="p-2 font-mono">₹24,50,000</td>
                        <td className="p-2 font-mono">₹24,50,000</td>
                        <td className="p-2 text-emerald-600 font-bold">₹0</td>
                        <td className="p-2 text-emerald-700 font-semibold">Matched ✓</td>
                      </tr>
                      <tr className="bg-amber-50/50">
                        <td className="p-2 font-medium">Savings Interest SFT-005</td>
                        <td className="p-2 text-slate-400">N/A</td>
                        <td className="p-2 text-slate-400">N/A</td>
                        <td className="p-2 font-mono font-bold">₹46,000</td>
                        <td className="p-2 text-amber-700 font-bold font-mono">+₹46,000</td>
                        <td className="p-2 text-emerald-700 font-semibold">Included in OS (80TTA applied) ✓</td>
                      </tr>
                      <tr className="bg-amber-50/50">
                        <td className="p-2 font-medium">Dividend Income u/s 194</td>
                        <td className="p-2 text-slate-400">N/A</td>
                        <td className="p-2 font-mono">₹4,200</td>
                        <td className="p-2 font-mono font-bold">₹4,200</td>
                        <td className="p-2 text-amber-700 font-bold font-mono">+₹4,200</td>
                        <td className="p-2 text-emerald-700 font-semibold">TDS ₹420 Credited u/s 56(2) ✓</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Stage 4: ITR Selection & Tax Computation */}
          {currentStageIndex === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Stage 4: ITR Selection & Tax Computation (Steps 15-20)</h3>
                  <p className="text-xs text-slate-500">ITR-2 assigned, dual-regime comparison, and deterministic computation.</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                  New Regime Saves ₹28,600 ✓
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 block">Step 15: Form Assignment</span>
                  <p className="text-slate-700">
                    Assigned <strong>ITR-2</strong> due to equity capital gains (₹1,45,000). ITR-1 Sahaj disqualified.
                  </p>
                  <div className="pt-2 border-t border-slate-200 text-[11px] space-y-1">
                    <div className="flex justify-between"><span>Gross Total Income:</span><span className="font-mono font-bold">₹24,50,000</span></div>
                    <div className="flex justify-between"><span>Prepaid TDS Credit:</span><span className="font-mono text-emerald-700 font-bold">₹4,30,500</span></div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-300 space-y-2">
                  <span className="font-bold text-slate-900 block">Step 18 & 20: Optimal Regime Settlement</span>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between"><span>Old Regime Liability:</span><span className="font-mono">₹4,40,700</span></div>
                    <div className="flex justify-between text-emerald-800 font-bold">
                      <span>New Regime u/s 115BAC:</span><span className="font-mono">₹4,12,100</span>
                    </div>
                    <div className="flex justify-between border-t border-emerald-200 pt-1 font-bold text-emerald-950">
                      <span>Net Direct Refund Due:</span>
                      <span className="font-mono text-sm bg-emerald-200 px-2 py-0.5 rounded">₹18,400 (Refund)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stage 5: CA Review, Payment & Filing */}
          {currentStageIndex === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Stage 5: CA Review, Payment & Filing (Steps 21-25)</h3>
                  <p className="text-xs text-slate-500">Statutory pre-filing checklist, CA digital signature approval, and e-verification.</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                  caSignedOff ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {caSignedOff ? 'CA Approved ✓' : 'Awaiting CA Approval'}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <span className="font-bold text-slate-900 block">Step 23: Mandatory CA Approval Gateway (ICAI Standards)</span>
                <p className="text-slate-600 text-[11px]">
                  Under Indian income tax law, AI cannot file returns autonomously. A practicing Chartered Accountant must review and sign off.
                </p>

                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-800 font-semibold">Signatory: CA Rajesh Sharma (FCA #049281)</span>
                    <button
                      onClick={() => setCaSignedOff(!caSignedOff)}
                      className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all ${
                        caSignedOff
                          ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                      }`}
                    >
                      {caSignedOff ? 'Revoke Approval (Demo)' : 'Simulate DSC Sign-Off Approval'}
                    </button>
                  </div>
                  {caSignedOff && (
                    <div className="text-[11px] text-emerald-700 font-mono pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span>Approval Stamp: CA_VERIFIED_FA2024_049281</span>
                      <span>Acknowledgement: ACK-2025-99824102</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Stage 6: Reporting & Engine 2 */}
          {currentStageIndex === 5 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Stage 6: Reporting & Engine 2 Wealth Insights (Steps 26-29)</h3>
                  <p className="text-xs text-slate-500">Annual financial snapshot and plain-language advisory explanation for the client.</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 font-bold text-xs">
                  Engine 2 Ready ✓
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2.5">
                  <span className="font-bold text-slate-900 block">Step 27: 1-Page Financial Snapshot</span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50 p-2 rounded">
                      <span className="text-[9px] text-slate-400 block uppercase">Total Earnings</span>
                      <span className="font-bold text-slate-900 font-mono">₹24.50 L</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <span className="text-[9px] text-slate-400 block uppercase">Effective Tax</span>
                      <span className="font-bold text-blue-700 font-mono">16.8%</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <span className="text-[9px] text-slate-400 block uppercase">Living Expenses</span>
                      <span className="font-bold text-amber-700 font-mono">₹15.80 L</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    Derived formula: Gross Income (₹24.5L) − Total Tax (₹4.12L) − Documented Savings (₹4.58L) = ₹15.80L living expenses.
                  </p>
                </div>

                <div className="p-4 bg-teal-50/70 rounded-xl border border-teal-200 space-y-2.5">
                  <span className="font-bold text-teal-950 block">Step 28 & 29: Client Advisory & Delivery</span>
                  <p className="text-teal-900 text-[11px] leading-relaxed">
                    "AIS reports ₹46,000 in low-yield savings interest (~₹15.3 Lakhs idle balance). Activating an auto-sweep 2-in-1 FD could generate ~₹61,000 in additional interest."
                  </p>
                  <button
                    onClick={() => setReportDownloaded(true)}
                    className="w-full py-2 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-slate-800 flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    {reportDownloaded ? 'Downloaded Sample 2-Page PDF ✓' : 'Download 2-Page Eye-Opener Report PDF'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stage 7: Continuous Management */}
          {currentStageIndex === 6 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Stage 7: Continuous Management (Always On) (Steps 30-33)</h3>
                  <p className="text-xs text-slate-500">Immutable audit log, statutory 8-year document retention, and system security monitoring.</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-xs">
                  Always-On Active
                </span>
              </div>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs space-y-2">
                <span className="text-white font-sans font-bold flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-400" /> Append-Only Immutable Compliance Ledger
                </span>
                <div className="space-y-1 text-[11px] text-slate-400 pt-1">
                  <p>[2025-06-12 16:30:00] FIRM_INITIALIZE: Sharma & Co. (FRN: DEMO012984N)</p>
                  <p>[2025-06-12 16:31:15] DPDP_CONSENT_GRANTED: Client IP 192.168.1.101 (SHA-256 Verified)</p>
                  <p>[2025-06-12 16:35:40] OCR_BATCH_SUCCESS: 4 documents decrypted in ephemeral RAM</p>
                  <p>[2025-06-12 16:42:10] 3WAY_RECON_COMPLETED: 2 variances identified and accepted by CA</p>
                  <p>[2025-06-12 16:48:22] REGIME_OPTIMIZER: New Regime Section 115BAC saved ₹28,600</p>
                  <p className="text-emerald-400">[2025-06-12 17:02:18] CA_APPROVAL_STAMPED: CA Rajesh Sharma (FCA #049281)</p>
                  <p className="text-blue-300">[2025-06-12 17:05:40] CLIENT_DELIVERY_DISPATCHED: 2-Page Eye-Opener PDF delivered</p>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={handlePrevStage}
              disabled={currentStageIndex === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                currentStageIndex > 0
                  ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Previous Stage
            </button>

            <button
              onClick={resetSimulation}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Demo
            </button>

            <button
              onClick={handleNextStage}
              disabled={currentStageIndex === 6}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                currentStageIndex < 6
                  ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
                  : 'bg-emerald-600 text-white cursor-default'
              }`}
            >
              {currentStageIndex < 6 ? (
                <>
                  Next Stage ({currentStageIndex + 2} of 7)
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Full Workflow Completed
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
