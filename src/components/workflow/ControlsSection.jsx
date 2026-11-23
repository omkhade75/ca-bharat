import React from 'react'
import { PLATFORM_CONTROLS } from '../../data/workflowControlsData'
import {
  Lock,
  UserCheck,
  Layers,
  History,
  Cpu,
  Award,
  RefreshCw,
  Activity,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react'

const CONTROL_ICONS = {
  Lock,
  UserCheck,
  Layers,
  History,
  Cpu,
  Award,
  RefreshCw,
  Activity,
}

export default function ControlsSection() {
  return (
    <section id="controls" className="space-y-6 scroll-mt-20">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-900 border border-emerald-200 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>REQUIREMENTS ACROSS THE ENTIRE WORKFLOW</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          The 8 Essential Platform Governance Controls
        </h2>
        <p className="text-slate-600 text-sm sm:text-base mt-1.5 max-w-3xl leading-relaxed">
          These requirements apply across the whole platform. They are essential product controls, not separate tax-filing steps. They enforce security, privacy, firm isolation, and mandatory human review.
        </p>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLATFORM_CONTROLS.map((ctrl) => {
          const Icon = CONTROL_ICONS[ctrl.iconName] || ShieldCheck

          return (
            <div
              key={ctrl.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800">
                    <Icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                    {ctrl.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {ctrl.title}
                </h3>

                <p className="text-slate-700 text-xs font-medium mt-2 leading-relaxed bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                  "{ctrl.whatItMeans}"
                </p>

                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                      Architectural Scope:
                    </span>
                    <p className="text-slate-600 text-[11px] leading-relaxed mt-0.5">
                      {ctrl.architectureScope}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">
                      Critical Risk Mitigated:
                    </span>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      {ctrl.riskMitigated}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Governs:</span>
                <span className="text-slate-700 font-medium">{ctrl.stagesGoverned}</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
