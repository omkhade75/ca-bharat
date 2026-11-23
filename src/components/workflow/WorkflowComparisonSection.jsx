import React, { useState } from 'react'
import {
  Scale,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Info,
  Clock,
  Database,
  Eye,
  FileCheck2,
  Cpu,
} from 'lucide-react'
import {
  COMPARISON_SUMMARY,
  COMMON_CAPABILITIES,
  KEY_DIFFERENTIATORS,
  COMPARISON_CATEGORIES,
  COMPARISON_POINTS,
  CONCRETE_EXAMPLE,
} from '../../data/workflowComparisonData'

export default function WorkflowComparisonSection({ onOpenFullModal }) {
  const [activeCategory, setActiveCategory] = useState('ALL')
  const [activeDifferentiatorId, setActiveDifferentiatorId] = useState(
    KEY_DIFFERENTIATORS[0].id
  )
  const [selectedExampleResolution, setSelectedExampleResolution] = useState(
    'claim_portal'
  )

  const activeDiff =
    KEY_DIFFERENTIATORS.find((d) => d.id === activeDifferentiatorId) ||
    KEY_DIFFERENTIATORS[0]

  const previewPoints = COMPARISON_POINTS.filter((p) =>
    activeCategory === 'ALL' ? true : p.category === activeCategory
  ).slice(0, 4)

  return (
    <section id="comparison" className="scroll-mt-24 space-y-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-slate-900 text-amber-400 font-mono text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-2xs">
              <Scale className="w-3 h-3 text-amber-400" />
              <span>Statutory Benchmark & Comparison</span>
            </span>
            <span className="text-xs font-semibold text-slate-500">
              5 Phases / 14 Steps vs 7 Stages / 33 Steps
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Traditional CA Software vs CA Bharat AI
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            {COMPARISON_SUMMARY.subtitle}. Both workflows share the same statutory foundation under the Indian Income-tax Act, 1961. CA Bharat AI extends that foundation with AI document intelligence, automated completeness checking, 3-way variance auditing, and plain-language client advisory.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenFullModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all hover:shadow-sm cursor-pointer"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Inspect Full 22-Point Specification</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Quote Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-slate-700 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-amber-400">
              Core Architectural Mandate
            </span>
            <p className="text-sm font-medium text-slate-200 leading-relaxed italic">
              "{COMPARISON_SUMMARY.positioningQuote}"
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Human CA Approval Always Mandatory</span>
          </div>
        </div>
      </div>

      {/* Top Architecture Comparison (Side-by-Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Traditional Software Card (SAG Infotech Genius / Gen IT) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5">
          <div className="flex items-start justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Traditional Indian CA Compliance Software
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                SAG Infotech (Genius / Gen IT)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {COMPARISON_SUMMARY.sagOverview.description}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold font-mono border border-slate-200">
                5 Phases • 14 Steps
              </span>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">Desktop & Portal Sync</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                1
              </span>
              <div>
                <strong className="text-slate-800">Client Onboarding & Master Setup:</strong>
                <p className="text-slate-600 mt-0.5">Creates client profile holding PAN, contact details, previous filing history, and bank account masters.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                2
              </span>
              <div>
                <strong className="text-slate-800">Data Import & Section Entry:</strong>
                <p className="text-slate-600 mt-0.5">Imports portal AIS/TIS JSON, 26AS, or relies on manual keying into traditional section-by-section grids.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                3
              </span>
              <div>
                <strong className="text-slate-800">Gen IT Tax Calculation:</strong>
                <p className="text-slate-600 mt-0.5">Applies tax rates and Chapter VI-A deductions; computes tax or refund on traditional computation sheets.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                4
              </span>
              <div>
                <strong className="text-slate-800">ITR Return Generation & E-Filing:</strong>
                <p className="text-slate-600 mt-0.5">Populates applicable ITR forms (ITR-1 through ITR-7), generates CBDT JSON/XML, and submits to portal.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                5
              </span>
              <div>
                <strong className="text-slate-800">Post-Filing Acknowledgement & Intimation:</strong>
                <p className="text-slate-600 mt-0.5">Tracks ITR-V verification, downloads Section 143(1) intimation notices, and tracks refund credits.</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Primary Focus: Compliance & Portal Submission</span>
            <span className="font-mono">Genius Architecture</span>
          </div>
        </div>

        {/* Right: CA Bharat AI Platform Card */}
        <div className="rounded-2xl border-2 border-teal-600/30 bg-teal-50/20 p-6 shadow-2xs space-y-5 relative">
          <div className="flex items-start justify-between pb-4 border-b border-teal-100">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px] uppercase tracking-wider">
                  Next-Generation CA Platform
                </span>
                <span className="text-[10px] font-bold text-amber-600">Dual Engine</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mt-0.5 flex items-center gap-1.5">
                <span>CA Bharat AI Platform</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                {COMPARISON_SUMMARY.caBharatOverview.description}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-block px-2.5 py-1 rounded-lg bg-teal-600 text-white text-xs font-bold font-mono shadow-xs">
                7 Stages • 33 Steps
              </span>
              <p className="text-[10px] text-teal-800 mt-1 font-medium">Traceable & AI-Supervised</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                1
              </span>
              <div>
                <strong className="text-slate-900">Firm Setup, RBAC & DPDP Digital Consent:</strong>
                <p className="text-slate-600 mt-0.5">Partner / Associate role controls, explicit DPDP consent tokens with IP/timestamp, and multi-tenant firm isolation.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                2
              </span>
              <div>
                <strong className="text-slate-900">Ephemeral In-Memory OCR with Page Coordinates:</strong>
                <p className="text-slate-600 mt-0.5">Eliminates manual entry; retains click-to-source bounding citations back to exact PDF page and line numbers.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                3
              </span>
              <div>
                <strong className="text-slate-900">Dedicated 3-Way Reconciliation & Variance Engine:</strong>
                <p className="text-slate-600 mt-0.5">Side-by-side Form 16 vs 26AS vs AIS matrix. Real-time variance flags prevent unnoticed reporting mismatches.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                4
              </span>
              <div>
                <strong className="text-slate-900">Version-Controlled Rules & Human CA Sign-Off:</strong>
                <p className="text-slate-600 mt-0.5">Auditable calculation engine with versioned tax rules; filing disabled until authorised CA signs off.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                5
              </span>
              <div>
                <strong className="text-slate-900">Engine 2 Visual Client Financial Eye-Opener:</strong>
                <p className="text-slate-600 mt-0.5">Transforms dry returns into a 2-page visual financial summary in human language to drive year-round advisory retention.</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-teal-100 flex items-center justify-between text-[11px] text-teal-900 font-medium">
            <span>Primary Focus: AI Acceleration + Advisory Growth</span>
            <span className="font-mono">Engine 1 + Engine 2</span>
          </div>
        </div>
      </div>

      {/* 7 Common Statutory Capabilities (The Shared Foundation) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                Shared Legal Baseline
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Income-tax Act, 1961 Compliance
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              7 Common Statutory Capabilities Present in Both Platforms
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            100% Alignment with Indian Direct Tax Provisions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {COMMON_CAPABILITIES.map((cap, idx) => (
            <div
              key={cap.capability}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-slate-300 transition-all text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{cap.capability}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-600 font-semibold">
                  0{idx + 1}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">{cap.coverage}</p>
              <div className="pt-2 mt-2 border-t border-slate-200/60 text-[10px] text-slate-600 font-mono flex items-center gap-1">
                <span>Statute:</span>
                <span className="font-semibold">{cap.statutoryBasis}</span>
              </div>
            </div>
          ))}

          {/* 8th Card: The Takeaway */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Statutory Parity</span>
              </div>
              <p className="text-amber-950 leading-relaxed text-[11px]">
                CA Bharat AI does not reinvent tax law or bypass statutory computation. It respects every Section, Schedule, and CBDT XML/JSON rule established in India.
              </p>
            </div>
            <div className="mt-3 text-[10px] text-amber-900 font-semibold">
              Governed under Section 2(31) & Finance Act 2024
            </div>
          </div>
        </div>
      </div>

      {/* 6 Core AI Differentiators (Interactive Explorer) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Core Innovations
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Elevating Firm Productivity
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              The 6 Key Architectural Differentiators
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Click any differentiator to compare workflows
          </span>
        </div>

        {/* Differentiator Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {KEY_DIFFERENTIATORS.map((diff) => {
            const isSelected = diff.id === activeDifferentiatorId
            return (
              <button
                key={diff.id}
                onClick={() => setActiveDifferentiatorId(diff.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span
                  className={`text-[9px] font-bold font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-md inline-block mb-1.5 ${
                    isSelected
                      ? 'bg-amber-400 text-slate-900'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {diff.badge}
                </span>
                <span className="text-xs font-bold line-clamp-2 leading-snug">
                  {diff.differentiator}
                </span>
              </button>
            )
          })}
        </div>

        {/* Selected Differentiator Detail Card */}
        <div className="p-6 rounded-xl bg-slate-50 border border-slate-200/90 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">
                Differentiator Deep Dive
              </span>
              <h4 className="text-base font-extrabold text-slate-900 mt-0.5">
                {activeDiff.differentiator}
              </h4>
            </div>
            <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-800 font-bold text-xs">
              {activeDiff.badge}
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            <strong className="text-slate-900">Value Created for the Firm: </strong>
            {activeDiff.valueCreated}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Traditional Software Way */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-700 pb-2 border-b border-slate-100">
                <span>Traditional Software (SAG Infotech)</span>
                <span className="text-[10px] text-slate-400 font-mono">Standard Practice</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {activeDiff.traditionalApproach}
              </p>
            </div>

            {/* CA Bharat AI Way */}
            <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-teal-900 pb-2 border-b border-teal-100">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>CA Bharat AI Platform</span>
                </span>
                <span className="text-[10px] text-teal-700 font-mono">AI Supervised</span>
              </div>
              <p className="text-slate-800 leading-relaxed">
                {activeDiff.caBharatAdvantage}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Concrete Real-World Discrepancy Scenario Box */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Concrete Case Study
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {CONCRETE_EXAMPLE.taxpayer}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              {CONCRETE_EXAMPLE.title}: {CONCRETE_EXAMPLE.discrepancy}
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            Variance: {CONCRETE_EXAMPLE.variance}
          </span>
        </div>

        {/* Discrepancy Table */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-mono text-slate-500 block">Source 1: Uploaded Form 16A</span>
            <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
              {CONCRETE_EXAMPLE.clientDocValue}
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Issued by Fortis Healthcare Ltd (Sec 194J)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-mono text-slate-500 block">Source 2: Income Tax Portal (26AS)</span>
            <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
              {CONCRETE_EXAMPLE.portal26as}
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Reflected on TRACES database
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950">
            <span className="text-[10px] font-mono text-amber-700 block">Statutory Variance Detected</span>
            <span className="text-sm font-extrabold text-amber-900 mt-0.5 block">
              {CONCRETE_EXAMPLE.variance}
            </span>
            <span className="text-[10px] text-amber-800 mt-1 block">
              Risk: Notice u/s 143(1)(a) if ₹25,000 is claimed
            </span>
          </div>
        </div>

        {/* Side-by-side handling */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-800 pb-1.5 border-b border-slate-200 flex items-center justify-between">
              <span>Traditional Software Workflow (SAG Infotech)</span>
              <span className="text-[10px] text-slate-400 font-mono">Manual Tracking</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {CONCRETE_EXAMPLE.sagHandling}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 space-y-2">
            <div className="font-bold text-teal-950 pb-1.5 border-b border-teal-100 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>CA Bharat AI Proactive Resolution</span>
              </span>
              <span className="text-[10px] text-teal-800 font-mono">Governed Audit Trail</span>
            </div>
            <p className="text-slate-800 leading-relaxed">
              {CONCRETE_EXAMPLE.caBharatHandling}
            </p>

            {/* Interactive CA Action Radios */}
            <div className="pt-2 mt-2 border-t border-teal-200/80 space-y-1.5">
              <span className="text-[10px] font-bold text-teal-900 uppercase tracking-wider block">
                Simulate CA Decision (Recorded in Audit Trail):
              </span>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-md border border-slate-200 hover:border-teal-400">
                  <input
                    type="radio"
                    name="tds_res"
                    checked={selectedExampleResolution === 'claim_portal'}
                    onChange={() => setSelectedExampleResolution('claim_portal')}
                    className="text-teal-600"
                  />
                  <span>Claim ₹23,000 (Safe portal credit)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-md border border-slate-200 hover:border-teal-400">
                  <input
                    type="radio"
                    name="tds_res"
                    checked={selectedExampleResolution === 'draft_letter'}
                    onChange={() => setSelectedExampleResolution('draft_letter')}
                    className="text-teal-600"
                  />
                  <span>Draft Rectification Letter to Hospital</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 22-Point Comparison Matrix Preview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                Detailed Traceability
              </span>
              <span className="text-xs text-slate-500 font-medium">
                All 22 Workflow Points Documented
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              Granular Step-by-Step Architectural Matrix
            </h3>
          </div>

          <button
            onClick={onOpenFullModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>View All 22 Comparison Points in Modal</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {COMPARISON_CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* 4 Preview Cards */}
        <div className="space-y-3.5">
          {previewPoints.map((pt) => (
            <div
              key={pt.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all text-xs space-y-2.5"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-[10px]">
                    {pt.id}
                  </span>
                  <h4 className="font-bold text-slate-900">{pt.title}</h4>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{pt.source}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600">
                  <strong className="block text-slate-800 text-[11px] mb-0.5">SAG Infotech:</strong>
                  {pt.sagText}
                </div>
                <div className="p-2.5 rounded-lg bg-teal-50/60 border border-teal-200 text-slate-800">
                  <strong className="block text-teal-900 text-[11px] mb-0.5">CA Bharat AI:</strong>
                  {pt.caBharatText}
                </div>
              </div>

              <div className="p-2 rounded-lg bg-amber-50/50 border border-amber-200/60 text-[11px] text-amber-950 flex items-start gap-1.5">
                <span className="font-bold shrink-0">Difference:</span>
                <span>{pt.difference}</span>
              </div>
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-600">
            Read all 22 comparison points with citations from both software workflow guides.
          </span>
          <button
            onClick={onOpenFullModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors cursor-pointer shrink-0"
          >
            <span>Open Complete 22-Point Comparison</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>
      </div>
    </section>
  )
}
