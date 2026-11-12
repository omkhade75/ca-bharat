import React from 'react'
import {
  ShieldCheck,
  CheckCircle2
} from 'lucide-react'

export default function HelpModule() {
  const complianceGuides = [
    {
      section: 'Section 115BAC (New Tax Regime)',
      title: 'Default Tax Regime vs Old Regime Opt-Out',
      description: 'Under Finance Act 2024, the New Regime is the default regime for individuals and HUF. Salaried taxpayers must formally opt out by filing Form 10-IEA or declaring in the ITR before the due date u/s 139(1) to claim Chapter VI-A and Section 24(b) deductions.',
    },
    {
      section: 'Section 143(1)(a) & 139(9)',
      title: 'Preventing Defective Return & Discrepancy Notices',
      description: 'Omitting AIS SFT-005 bank savings interest or reporting capital gains under ITR-1 Sahaj causes automated CPC notices under 143(1)(a) or defect notices under 139(9). CA Bharat AI automatically flags discrepancies and upgrades the return form to ITR-2.',
    },
    {
      section: 'Sections 234B & 234C',
      title: 'Advance Tax Interest Penalties & Mitigation',
      description: 'Taxpayers with net tax liability exceeding ₹10,000 after TDS are liable for quarterly advance tax installments (15%, 45%, 75%, 100%). Failure attracts 1% per month simple interest. Engine 2 monitors quarterly liabilities to avoid fines.',
    },
    {
      section: 'Digital Personal Data Protection Act, 2023',
      title: 'DPDP Architecture Concept & Consent Vault (Demo)',
      description: 'Educational overview: Tax professionals must maintain purpose-limited, time-bound, verifiable consent before processing personal financial documents. In this prototype, uploads and consent entries are simulated for demonstration.',
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Module Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Knowledge & Compliance
            </span>
            <h1 className="text-xl font-bold text-slate-900">CA Bharat AI Technical & Regulatory Guide</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Statutory tax provisions, consent demonstration concepts, and prototype boundary specifications
          </p>
        </div>
      </div>

      {/* The Golden Architecture Rule Card */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            The Golden Architecture Rule: AI + Rules Engine + Licensed CA
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Large Language Models are probabilistic and prone to arithmetic hallucinations. Tax calculations carry legal penalties under the Income Tax Act, 1961. Therefore, CA Bharat AI strictly isolates responsibilities:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-xs space-y-2">
            <h4 className="font-bold text-teal-400">What AI Can & Must Do:</h4>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Extract structured tables & text from complex PDFs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Perform coordinate bounding-box layout citations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Match cross-document items (Form 16 vs 26AS vs AIS)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Generate narrative client advisory drafts & summaries</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-xs space-y-2">
            <h4 className="font-bold text-rose-400">What AI Must Never Do (Strict Non-Goals):</h4>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Never calculate tax liability using LLMs (100% deterministic rules)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Never overwrite original document figures without audit trace</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Never autonomously file or submit returns to Income Tax Portal</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Never execute trades or transactions without client authorization</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Compliance Guides Accordion/Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {complianceGuides.map((guide, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-block mb-2">
                {guide.section}
              </span>
              <h4 className="text-sm font-bold text-slate-900 mb-1">{guide.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{guide.description}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-teal-600 font-semibold">
              <span>Income Tax Act Conformance</span>
              <span>AY 2025-26 ✓</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
