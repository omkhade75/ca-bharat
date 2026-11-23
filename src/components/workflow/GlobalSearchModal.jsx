import React, { useState, useEffect, useMemo } from 'react'
import {
  Search,
  X,
  Layers,
  Shield,
  Building,
  UserCheck,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Command,
} from 'lucide-react'
import { WORKFLOW_STAGES } from '../../data/workflowStagesData'
import { DEVELOPER_MODULES } from '../../data/workflowModulesData'
import { PLATFORM_CONTROLS } from '../../data/workflowControlsData'
import { COMPARISON_POINTS } from '../../data/workflowComparisonData'

export default function GlobalSearchModal({ isOpen, onClose, onSelectStep }) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else onClose(false) // Toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const allSteps = useMemo(() => {
    return WORKFLOW_STAGES.flatMap((stage) => stage.steps)
  }, [])

  const results = useMemo(() => {
    if (!query.trim()) return { steps: allSteps.slice(0, 5), modules: DEVELOPER_MODULES.slice(0, 2), controls: PLATFORM_CONTROLS.slice(0, 2), comparison: COMPARISON_POINTS.slice(0, 2) }

    const q = query.toLowerCase()

    const matchedSteps = allSteps.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.moduleName.toLowerCase().includes(q) ||
        s.actor.toLowerCase().includes(q) ||
        s.controls.some((c) => c.toLowerCase().includes(q))
    )

    const matchedModules = DEVELOPER_MODULES.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.stage.toLowerCase().includes(q)
    )

    const matchedControls = PLATFORM_CONTROLS.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.whatItMeans.toLowerCase().includes(q)
    )

    const matchedComparison = COMPARISON_POINTS.filter(
      (cp) =>
        cp.title.toLowerCase().includes(q) ||
        cp.sagText.toLowerCase().includes(q) ||
        cp.caBharatText.toLowerCase().includes(q) ||
        cp.difference.toLowerCase().includes(q)
    )

    return { steps: matchedSteps, modules: matchedModules, controls: matchedControls, comparison: matchedComparison }
  }, [query, allSteps])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search 33 steps, 12 modules, and 8 controls (e.g., 'HUF', 'Form 16', 'Reconciliation', '115BAC')..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-200 text-slate-600 text-[10px] font-mono font-semibold">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 text-xs">
          {/* Steps */}
          {results.steps.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
                Workflow Steps ({results.steps.length})
              </span>
              <div className="space-y-1.5">
                {results.steps.map((step) => (
                  <button
                    key={step.number}
                    onClick={() => {
                      onSelectStep(step)
                      onClose()
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-100 flex items-center justify-between text-left transition-colors border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded bg-slate-900 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                        {String(step.number).padStart(2, '0')}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">{step.title}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          Stage {step.stageNumber} • {step.moduleName} • {step.actor}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Modules */}
          {results.modules.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
                Developer Modules ({results.modules.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.modules.map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Module {m.id}: {m.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        {m.stage}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 line-clamp-2 mt-1">
                      {m.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          {results.controls.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
                Platform Controls ({results.controls.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.controls.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200"
                  >
                    <span className="font-bold text-slate-900">{c.title}</span>
                    <p className="text-[10px] text-slate-600 line-clamp-2 mt-0.5">
                      "{c.whatItMeans}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SAG Infotech Comparison Points */}
          {results.comparison && results.comparison.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
                SAG Infotech vs CA Bharat AI Comparison ({results.comparison.length})
              </span>
              <div className="space-y-2">
                {results.comparison.slice(0, 3).map((cp) => (
                  <a
                    key={cp.id}
                    href="#comparison"
                    onClick={() => onClose()}
                    className="block p-2.5 rounded-xl bg-teal-50/60 border border-teal-200 hover:border-teal-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-[11px]">{cp.title}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-teal-100 text-teal-800">
                        {cp.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 line-clamp-2 mt-1">
                      <strong className="text-teal-900">Diff: </strong>{cp.difference}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {results.steps.length === 0 && results.modules.length === 0 && results.controls.length === 0 && (!results.comparison || results.comparison.length === 0) && (
            <div className="text-center py-8 text-slate-400 text-sm">
              No matching steps, modules, controls, or comparison points found for "{query}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Search 33 Steps • 12 Modules • 8 Controls • 22 Comparison Points</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  )
}
