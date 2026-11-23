import React, { useState } from 'react'
import { DEVELOPER_MODULES } from '../../data/workflowModulesData'
import {
  Building2,
  Users,
  ShieldCheck,
  FolderLock,
  Cpu,
  CheckCheck,
  Scale,
  Calculator,
  FileCheck,
  Printer,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

const MODULE_ICONS = {
  Building2,
  Users,
  ShieldCheck,
  FolderLock,
  Cpu,
  CheckCheck,
  Scale,
  Calculator,
  FileCheck,
  Printer,
  MessageSquare,
  ShieldAlert,
}

export default function ModulesMatrixSection({ onSelectStepNumber }) {
  const [selectedStageFilter, setSelectedStageFilter] = useState('ALL')
  const [expandedModuleId, setExpandedModuleId] = useState(null)

  const filteredModules = DEVELOPER_MODULES.filter((m) => {
    if (selectedStageFilter === 'ALL') return true
    return m.stage.includes(selectedStageFilter)
  })

  return (
    <section id="modules" className="space-y-6 scroll-mt-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-900 border border-blue-200 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5 text-blue-700" />
            <span>THE 12 DEVELOPER MODULES</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Architectural Engine & Module Coverage
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-1.5 max-w-3xl leading-relaxed">
            The platform architecture covers 12 core developer modules mapped across the 7 business stages. Every module provides bounded technical capabilities with strict role-based access.
          </p>
        </div>

        {/* Stage Filter */}
        <div className="flex flex-wrap gap-1.5 self-start md:self-end">
          {['ALL', 'Stage 1', 'Stage 3', 'Stage 4', 'Stage 5', 'Stage 6', 'Stage 7'].map((stg) => (
            <button
              key={stg}
              onClick={() => setSelectedStageFilter(stg)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedStageFilter === stg
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {stg}
            </button>
          ))}
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModules.map((mod) => {
          const Icon = MODULE_ICONS[mod.iconName] || Layers
          const isExpanded = expandedModuleId === mod.id

          return (
            <div
              key={mod.id}
              className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                isExpanded
                  ? 'border-blue-500 shadow-md ring-1 ring-blue-400/40'
                  : 'border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-mono font-bold text-xs flex items-center justify-center border border-blue-200">
                      M{mod.id}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase font-mono">
                      {mod.stage}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {mod.status}
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 shrink-0 text-slate-700">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {mod.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Powers Step{mod.stepsCovered.length > 1 ? 's' : ''}: {mod.stepsCovered.join(', ')}
                    </p>
                  </div>
                </div>

                <p className="text-slate-600 text-xs mt-3 leading-relaxed">
                  {mod.description}
                </p>

                {isExpanded && (
                  <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2 animate-in fade-in duration-150">
                    <p className="text-[11px] text-slate-800 font-medium">
                      <strong>Purpose:</strong> {mod.purpose}
                    </p>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Technical Scope:</span>
                      <ul className="space-y-0.5 text-[11px] text-slate-700">
                        {mod.technicalScope.map((item, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-blue-500 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
                  className="font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 text-[11px]"
                >
                  {isExpanded ? 'Hide Technical Details' : 'View Technical Scope'}
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <div className="flex items-center gap-1">
                  {mod.stepsCovered.map((s) => (
                    <button
                      key={s}
                      onClick={() => onSelectStepNumber?.(s)}
                      className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] font-semibold"
                      title={`Inspect Step ${s}`}
                    >
                      Step {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
