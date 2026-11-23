import React, { useState, useMemo } from 'react'
import {
  WORKFLOW_STAGES,
  CORE_OPERATING_PRINCIPLE,
} from '../../data/workflowStagesData'
import {
  Building2,
  UserCheck,
  FileSearch,
  Calculator,
  CheckCircle2,
  PieChart,
  ShieldAlert,
  Search,
  Filter,
  ArrowRight,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
  ExternalLink,
  Shield,
  Eye,
} from 'lucide-react'
import StepDetailModal from './StepDetailModal'

const STAGE_ICONS = {
  'stage-1': Building2,
  'stage-2': UserCheck,
  'stage-3': FileSearch,
  'stage-4': Calculator,
  'stage-5': CheckCircle2,
  'stage-6': PieChart,
  'stage-7': ShieldAlert,
}

export default function WorkflowStagesExplorer({ onOpenSimulator }) {
  const [activeStageId, setActiveStageId] = useState('stage-1')
  const [selectedStep, setSelectedStep] = useState(null)
  const [viewMode, setViewMode] = useState('stage') // 'stage' | 'all'
  const [searchQuery, setSearchQuery] = useState('')

  // Flatten all 33 steps
  const allSteps = useMemo(() => {
    return WORKFLOW_STAGES.flatMap((stage) => stage.steps)
  }, [])

  // Filtered steps based on search query and active view mode
  const displayedSteps = useMemo(() => {
    let list = viewMode === 'all'
      ? allSteps
      : WORKFLOW_STAGES.find((s) => s.id === activeStageId)?.steps || []

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = allSteps.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.moduleName.toLowerCase().includes(q) ||
          s.actor.toLowerCase().includes(q) ||
          s.controls.some((c) => c.toLowerCase().includes(q))
      )
    }

    return list
  }, [viewMode, activeStageId, allSteps, searchQuery])

  const activeStage = WORKFLOW_STAGES.find((s) => s.id === activeStageId) || WORKFLOW_STAGES[0]

  return (
    <section id="workflow-stages" className="space-y-8 scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-amber-400 text-xs font-semibold mb-2 shadow-2xs">
            <Layers className="w-3.5 h-3.5" />
            <span>THE 7-STAGE COMPLETE WORKFLOW ARCHITECTURE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            From Firm Setup to Final Return & Year-Round Insights
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-1.5 max-w-3xl leading-relaxed">
            Every client tax case moves through 7 discrete stages and 33 exhaustive steps. Click any stage or step to inspect operating rules, required inputs, and live simulations.
          </p>
        </div>

        {/* View Mode & Filter Switcher */}
        <div className="flex items-center gap-2 self-start md:self-end">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              onClick={() => { setViewMode('stage'); setSearchQuery(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'stage' && !searchQuery
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stage-by-Stage (7)
            </button>
            <button
              onClick={() => { setViewMode('all'); setSearchQuery(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'all' && !searchQuery
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All 33 Steps
            </button>
          </div>
        </div>
      </div>

      {/* Stage Selector Tabs (When in Stage View) */}
      {(!searchQuery || viewMode === 'stage') && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {WORKFLOW_STAGES.map((stg) => {
            const Icon = STAGE_ICONS[stg.id] || Layers
            const isActive = activeStageId === stg.id && viewMode === 'stage'

            return (
              <button
                key={stg.id}
                onClick={() => {
                  setActiveStageId(stg.id)
                  setViewMode('stage')
                  setSearchQuery('')
                }}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isActive
                    ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-400/50 -translate-y-0.5'
                    : 'bg-white/80 hover:bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-[11px] font-bold ${
                        isActive
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {stg.number}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {stg.stepCount} Steps
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug">
                    {stg.shortTitle}
                  </h4>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-medium text-slate-400">
                    {stg.stepRange}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Active Stage Banner Card */}
      {viewMode === 'stage' && !searchQuery && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-300 font-mono text-[11px] font-bold">
                  STAGE {activeStage.number} OF 07
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {activeStage.stepRange} ({activeStage.stepCount} Complete Steps)
                </span>
                {activeStage.alwaysOn && (
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200">
                    ALWAYS ON
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {activeStage.title}
              </h3>
              <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
                {activeStage.subtitle}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={() => onOpenSimulator?.(activeStage.steps[0])}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Simulate This Stage
              </button>
            </div>
          </div>

          {activeStage.alwaysOnBadge && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-rose-800 bg-rose-50/70 p-2.5 rounded-lg border border-rose-200/60 text-xs font-medium">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{activeStage.alwaysOnBadge}</span>
            </div>
          )}
        </div>
      )}

      {/* Step Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across all 33 steps, 12 modules, and controls (e.g. 'HUF', 'Reconciliation', 'Section 115BAC', 'Consent')..."
            className="w-full pl-9 pr-4 py-2 bg-white text-slate-900 text-xs rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all placeholder:text-slate-400 shadow-2xs font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {searchQuery && (
          <span className="text-xs text-slate-500 font-mono whitespace-nowrap">
            Showing {displayedSteps.length} of 33 steps
          </span>
        )}
      </div>

      {/* Steps Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedSteps.map((step) => {
          return (
            <div
              key={step.number}
              onClick={() => setSelectedStep(step)}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-amber-400 hover:shadow-md p-5 flex flex-col justify-between transition-all cursor-pointer group hover:-translate-y-0.5"
            >
              <div>
                {/* Card Top Info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shadow-2xs group-hover:bg-amber-600 transition-colors">
                      {String(step.number).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                      Stage {step.stageNumber} • Step {step.number}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                    Mod {step.moduleId}
                  </span>
                </div>

                {/* Step Title */}
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-800 transition-colors leading-snug">
                  {step.title}
                </h4>

                {/* Step Description */}
                <p className="text-slate-600 text-xs mt-2 line-clamp-3 leading-relaxed">
                  {step.description}
                </p>

                {/* Actor & Module Badge */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-blue-600" />
                    <span className="truncate max-w-[140px]">{step.actor}</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-700 font-medium truncate max-w-[140px]">
                    {step.moduleName}
                  </span>
                </div>
              </div>

              {/* Card Action Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Shield className="w-3 h-3" />
                  <span>{step.controls?.[0] || 'Security'}</span>
                </div>
                <span className="font-semibold text-slate-900 group-hover:text-amber-700 flex items-center gap-1 text-xs">
                  Inspect Simulation <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal Detail & Simulation Drawer */}
      {selectedStep && (
        <StepDetailModal
          step={selectedStep}
          allSteps={allSteps}
          onClose={() => setSelectedStep(null)}
          onSelectStep={(next) => setSelectedStep(next)}
        />
      )}
    </section>
  )
}
