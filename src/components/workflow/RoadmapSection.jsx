import React from 'react'
import { PRODUCT_ROADMAP } from '../../data/workflowRoadmapData'
import {
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'

export default function RoadmapSection() {
  return (
    <section id="roadmap" className="space-y-6 scroll-mt-20">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-900 border border-purple-200 text-xs font-semibold mb-2">
          <TrendingUp className="w-3.5 h-3.5 text-purple-700" />
          <span>EVOLUTION & SCOPE BOUNDARIES</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Product Roadmap Beyond the Initial MVP
        </h2>
        <p className="text-slate-600 text-sm sm:text-base mt-1.5 max-w-3xl leading-relaxed">
          A disciplined multi-phase trajectory from core tax compliance (MVP) to monthly cash-flow insights, professional partner ecosystems, and bounded agentic AI.
        </p>
      </div>

      {/* Roadmap Phase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PRODUCT_ROADMAP.map((phase) => {
          const isMvp = phase.phase === 'Phase 1'

          return (
            <div
              key={phase.phase}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                isMvp
                  ? 'bg-white border-emerald-400 shadow-md ring-1 ring-emerald-300/40'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                    {phase.phase}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isMvp
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {phase.badge}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {phase.name}
                </h3>
                <p className="text-slate-500 text-xs mt-1 font-medium">
                  {phase.tagline}
                </p>

                <div className="mt-4 space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Deliverables & Capabilities:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {phase.scope.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                            isMvp ? 'text-emerald-600' : 'text-slate-400'
                          }`}
                        />
                        <span className="leading-snug text-[11px]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block mb-1">
                  Scope Boundaries & Governance:
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {phase.boundaries}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
