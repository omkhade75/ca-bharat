import React, { useState, useEffect } from 'react'
import {
  X,
  Search,
  Filter,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Scale,
  FileText,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react'
import {
  COMPARISON_SUMMARY,
  COMMON_CAPABILITIES,
  KEY_DIFFERENTIATORS,
  COMPARISON_CATEGORIES,
  COMPARISON_POINTS,
  CONCRETE_EXAMPLE,
} from '../../data/workflowComparisonData'

export default function WorkflowComparisonModal({ isOpen, onClose }) {
  const [activeCategory, setActiveCategory] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedPointId, setExpandedPointId] = useState(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const filteredPoints = COMPARISON_POINTS.filter((item) => {
    const matchesCategory =
      activeCategory === 'ALL' || item.category === activeCategory
    const q = searchQuery.toLowerCase().trim()
    if (!q) return matchesCategory

    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      item.sagText.toLowerCase().includes(q) ||
      item.caBharatText.toLowerCase().includes(q) ||
      item.difference.toLowerCase().includes(q) ||
      item.categoryName.toLowerCase().includes(q)

    return matchesCategory && matchesSearch
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-sm shadow-xs border border-slate-800">
              <Scale className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                  Full 22-Point Traceability Specification
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">•</span>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  SAG Infotech Genius vs CA Bharat AI Platform
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 leading-snug">
                Architectural & Workflow Comparison Matrix
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
            title="Close dialog (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {COMPARISON_CATEGORIES.map((cat) => {
              const count =
                cat.id === 'ALL'
                  ? COMPARISON_POINTS.length
                  : COMPARISON_POINTS.filter((p) => p.category === cat.id).length
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-slate-700 text-slate-200' : 'bg-white text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search points, rules, differences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {/* Executive Context Box */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-950 text-xs leading-relaxed flex items-start gap-3">
            <BookOpen className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Comparative Baseline: </span>
              {COMPARISON_SUMMARY.mainTakeaway} SAG Infotech (Genius / Gen IT) covers the 5 standard phases across 14 numbered steps. CA Bharat AI structures the same statutory foundation into 7 stages across 33 activities, augmenting it with ephemeral OCR extraction, 3-way variance auditing, versioned tax rules, and Engine 2 visual client reports.
            </div>
          </div>

          {/* Filtered Points Count */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Showing <strong className="text-slate-900">{filteredPoints.length}</strong> of{' '}
              {COMPARISON_POINTS.length} statutory workflow points
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-amber-800 hover:underline font-semibold"
              >
                Clear search filter
              </button>
            )}
          </div>

          {/* Comparison Cards List */}
          <div className="space-y-4">
            {filteredPoints.map((item) => {
              const isExpanded = expandedPointId === item.id
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs hover:border-slate-300 transition-all"
                >
                  {/* Point Header Bar */}
                  <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {item.id}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
                        {item.categoryName}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {item.source}
                      </span>
                    </div>
                  </div>

                  {/* Side-by-Side Comparison Grid */}
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* SAG Infotech Box */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-xs">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 text-[11px] font-bold text-slate-700">
                        <span>Traditional Workflow (SAG Infotech)</span>
                        <span className="text-[10px] text-slate-500 font-mono">Desktop / Portal Sync</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{item.sagText}</p>
                    </div>

                    {/* CA Bharat AI Box */}
                    <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200/80 text-xs">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-teal-100 text-[11px] font-bold text-teal-900">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                          <span>CA Bharat AI Platform</span>
                        </span>
                        <span className="text-[10px] text-teal-700 font-mono">AI-Assisted & Supervised</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed font-normal">{item.caBharatText}</p>
                    </div>
                  </div>

                  {/* Architectural Difference Box */}
                  <div className="mx-5 mb-5 p-3.5 rounded-lg bg-amber-50/60 border border-amber-200/70 text-xs text-slate-800">
                    <div className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-amber-700" />
                      <span>Key Architectural Difference:</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{item.difference}</p>
                  </div>
                </div>
              )
            })}

            {filteredPoints.length === 0 && (
              <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
                <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No matching comparison points found</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Try searching with different terms or selecting 'All 22 Workflow Points'.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-slate-500 font-medium text-center sm:text-left">
            Source: 8-Page End-to-End Workflow Comparison Specification (CA Bharat AI vs SAG Infotech Genius)
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Done / Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
