import React, { useState } from 'react'
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  FileText,
  Layers,
  Scale,
  Calculator,
  Eye,
  Building,
  UploadCloud,
  FileCheck2,
  ExternalLink,
  ChevronRight,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { COMPARISON_SUMMARY, KEY_DIFFERENTIATORS, CONCRETE_EXAMPLE } from '../../data/workflowComparisonData'
import SimulatorWorkspace from './SimulatorWorkspace'

export default function SimpleWorkflowOverview({ onSwitchToFullSpec, onOpenComparisonModal }) {
  const [activeStepTab, setActiveStepTab] = useState(1)
  const [archTab, setArchTab] = useState('modules') // 'modules' | 'controls' | 'roadmap'

  const simpleSteps = [
    {
      number: 1,
      shortTitle: 'Intake & Consent',
      title: 'Step 1: Document Upload & DPDP Digital Consent',
      tagline: 'Client sends documents via WhatsApp or portal. Consent token captured.',
      description:
        'Client provides PAN, Form 16, AIS/TIS, and Form 26AS. The platform captures a timestamped digital consent token compliant with the Digital Personal Data Protection (DPDP) Act, 2023 before any processing begins.',
      highlights: [
        'Automated intake checklist tailored to taxpayer type (Salaried, Clinic, HUF, Firm)',
        'Explicit DPDP consent tracking with timestamp and scope',
        'Incomplete upload detection (e.g. missing 26AS flagged before filing starts)',
      ],
      badge: 'DPDP Act 2023',
      color: 'blue',
    },
    {
      number: 2,
      shortTitle: 'AI OCR Extraction',
      title: 'Step 2: Ephemeral AI Extraction & Page Coordinates',
      tagline: 'In-memory parsing with click-to-source citations back to the exact PDF page.',
      description:
        'Documents are unlocked in an ephemeral RAM sandbox (zero plaintext disk persistence). Dedicated OCR extracts salary, Section 194J TDS, capital gains, and interest—attaching an exact bounding coordinate link back to the source PDF.',
      highlights: [
        'Zero manual data keying into complex grids',
        'Click any figure to jump directly to the highlighted line on the original document',
        'Automated confidence scores with immediate flags for low-confidence scans',
      ],
      badge: 'Zero Manual Entry',
      color: 'teal',
    },
    {
      number: 3,
      shortTitle: '3-Way Reconciliation',
      title: 'Step 3: Dedicated 3-Way Variance Matrix (Form 16 vs 26AS vs AIS)',
      tagline: 'Discrepancies are highlighted in amber alerts—never silently masked.',
      description:
        'The platform cross-checks Form 16 against TRACES Form 26AS and the Annual Information Statement (AIS). If a hospital deducted ₹25k but portal shows ₹23k, the ₹2,000 variance is flagged for CA resolution before submission.',
      highlights: [
        'Real-time variance calculation across TDS, gross income, and deductions',
        'Automatic drafts of clarification messages to deductors or clients',
        'Prevents automated CPC defect notices u/s 139(9) and 143(1)(a)',
      ],
      badge: 'Notice Prevention',
      color: 'amber',
    },
    {
      number: 4,
      shortTitle: 'CA Review & Advisory',
      title: 'Step 4: Deterministic Tax Calculation & 2-Page Client Report',
      tagline: 'Old vs New Regime comparison, human CA approval, and visual client report.',
      description:
        'Tax is calculated deterministically under Finance Act 2024 rules (Old vs Sec 115BAC New Regime). Filing is locked until the authorised CA verifies and signs off. Engine 2 generates a simple 2-page visual "Financial Eye-Opener" for the client.',
      highlights: [
        'Deterministic calculation logs with version-controlled tax rules',
        'Strict CA approval gateway (Filing JSON disabled without signature)',
        'Engine 2 visual advisory report turns tax clients into year-round advisory clients',
      ],
      badge: 'Human CA Control',
      color: 'emerald',
    },
  ]

  const currentStep = simpleSteps.find((s) => s.number === activeStepTab) || simpleSteps[0]

  return (
    <div className="space-y-16">
      {/* 1. SHORT & SIMPLE HERO EXPLAINER */}
      <section className="relative rounded-3xl bg-linear-to-b from-white via-slate-50 to-amber-50/30 border border-slate-200/90 p-6 sm:p-10 shadow-xs">
        <div className="max-w-4xl space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-amber-400 text-xs font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-mono text-[10px] tracking-wider uppercase">
              CA BHARAT AI • SIMPLE PRODUCT OVERVIEW
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              CA-Led Tax Automation & Year-Round Client Advisory
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl">
              Built specifically for Indian Chartered Accountants. We combine AI document intake and 3-way reconciliation with a 2-page visual client report—<strong className="text-slate-900 font-bold">while keeping the authorized CA in 100% control</strong>.
            </p>
          </div>

          {/* Two Engines in Plain English */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Engine 1 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-teal-400 transition-all">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-teal-600 text-white font-mono font-bold flex items-center justify-center text-xs">
                    E1
                  </span>
                  <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                    Engine 1: Tax Filing Machine
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                  ITR-1 to ITR-7
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                From Raw Documents to Filing-Ready JSON
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Extracts Form 16, AIS, and 26AS with AI OCR, matches entries across a 3-way reconciliation table, flags discrepancies, and computes tax under Finance Act 2024.
              </p>
            </div>

            {/* Engine 2 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-amber-400 transition-all">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-600 text-white font-mono font-bold flex items-center justify-center text-xs">
                    E2
                  </span>
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Engine 2: Client Advisory Eye-Opener
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  Advisory Retention
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Visual Financial Report in Human Language
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Transforms technical computation sheets into a simple 2-page visual infographic showing effective tax rates, idle cash drag, and missed deductions for year-round advisory.
              </p>
            </div>
          </div>

          {/* Core Human-in-the-Loop Principle Banner */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <strong className="font-bold text-emerald-950">Strict Operating Mandate: </strong>
                <span>AI processes documents & discovers variances. Tax rules verify. The Authorized CA approves.</span>
              </div>
            </div>
            <a
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shrink-0 transition-colors shadow-2xs"
            >
              <span>Open CA Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* 2. THE 4-STEP SIMPLE JOURNEY */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                Simple 4-Step Process
              </span>
              <span className="text-xs text-slate-500 font-medium">How It Works in Practice</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              The Client Journey in 4 Simple Steps
            </h2>
          </div>

          <button
            onClick={onSwitchToFullSpec}
            className="flex items-center gap-1.5 text-xs text-amber-800 hover:text-amber-900 font-bold transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>Need full engineering detail? Switch to 33-step spec</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Interactive Step Selector Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {simpleSteps.map((step) => {
            const isSelected = activeStepTab === step.number
            return (
              <button
                key={step.number}
                onClick={() => setActiveStepTab(step.number)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`w-6 h-6 rounded-md font-mono font-bold text-xs flex items-center justify-center ${
                        isSelected ? 'bg-amber-400 text-slate-900' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      0{step.number}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                        isSelected ? 'bg-slate-800 text-amber-300' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {step.badge}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold leading-snug">
                    {step.shortTitle}
                  </h3>
                </div>
                <p
                  className={`text-[11px] mt-2 line-clamp-2 ${
                    isSelected ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {step.tagline}
                </p>
              </button>
            )
          })}
        </div>

        {/* Selected Step Expanded Visual Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-wider">
                Step 0{currentStep.number} Breakdown
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                {currentStep.title}
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs self-start sm:self-auto">
              {currentStep.badge}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {currentStep.description}
          </p>

          <div className="pt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
              Key Capabilities in this Step:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {currentStep.highlights.map((h, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-start gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE SIMULATOR (HANDS-ON TRY IT NOW) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Interactive Sandbox
              </span>
              <span className="text-xs text-slate-500 font-medium">Test Live Demonstration</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              Try the End-to-End Workflow Simulator
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Switch between Salaried & Professional personas to experience 3-way reconciliation
          </p>
        </div>

        {/* Embedded Simulator */}
        <SimulatorWorkspace />
      </section>

      {/* 4. SHORT & SIMPLE COMPARISON: TRADITIONAL CA SOFTWARE VS CA BHARAT AI */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                Simple Benchmark
              </span>
              <span className="text-xs text-slate-500 font-medium">Traditional Tools vs CA Bharat AI</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              Traditional Software (SAG Infotech) vs CA Bharat AI
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Both platforms respect 100% of the Indian direct tax laws. Here is how CA Bharat AI transforms the CA's daily work.
            </p>
          </div>

          <button
            onClick={onOpenComparisonModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>Open Full 22-Point Traceability Matrix</span>
          </button>
        </div>

        {/* 4 Core Pillars of Difference */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pillar 1: Data Intake */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-2 shadow-2xs">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              1. Document Intake & Data Entry
            </span>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                <strong className="block text-slate-800 text-[11px] mb-1">Traditional (SAG Infotech):</strong>
                Manual typing into tax sections or downloading pre-filled portal JSON.
              </div>
              <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200 text-slate-800">
                <strong className="block text-teal-900 text-[11px] mb-1">CA Bharat AI:</strong>
                Instant AI OCR with page/line coordinates linking directly to source PDF.
              </div>
            </div>
          </div>

          {/* Pillar 2: Reconciliation */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-2 shadow-2xs">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              2. 3-Way Reconciliation
            </span>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                <strong className="block text-slate-800 text-[11px] mb-1">Traditional (SAG Infotech):</strong>
                CA manually cross-references Form 16, 26AS, and AIS on paper or separate screens.
              </div>
              <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200 text-slate-800">
                <strong className="block text-teal-900 text-[11px] mb-1">CA Bharat AI:</strong>
                Unified 3-way table with real-time variance alerts and notice prevention.
              </div>
            </div>
          </div>

          {/* Pillar 3: Client Deliverables */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-2 shadow-2xs">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              3. Client Value & Deliverables
            </span>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                <strong className="block text-slate-800 text-[11px] mb-1">Traditional (SAG Infotech):</strong>
                Dry statutory computation sheet and ITR-V filing acknowledgement.
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-slate-800">
                <strong className="block text-amber-900 text-[11px] mb-1">CA Bharat AI:</strong>
                Engine 2 visual 2-page "Financial Eye-Opener" report in human language.
              </div>
            </div>
          </div>

          {/* Pillar 4: Security & Governance */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-2 shadow-2xs">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              4. Data Privacy & Audit Trail
            </span>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                <strong className="block text-slate-800 text-[11px] mb-1">Traditional (SAG Infotech):</strong>
                Files stored on local PC without activity-level DPDP consent tokens.
              </div>
              <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200 text-slate-800">
                <strong className="block text-teal-900 text-[11px] mb-1">CA Bharat AI:</strong>
                Explicit DPDP consent tracking, Partner/Associate RBAC, and immutable audit logs.
              </div>
            </div>
          </div>
        </div>

        {/* Concrete Example Callout */}
        <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div>
            <strong className="text-slate-900 font-bold block">
              Real-World Case Study: Dr. Radhika Sen's ₹2,000 TDS Variance
            </strong>
            <span className="text-slate-600 text-[11px]">
              Form 16A TDS was ₹25,000 but 26AS showed ₹23,000. Traditional tools require manual notes; CA Bharat AI flags Section 143(1)(a) notice risks and captures the CA's decision.
            </span>
          </div>
          <button
            onClick={onOpenComparisonModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold shrink-0 transition-colors cursor-pointer"
          >
            <span>Inspect 22-Point Matrix</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
          </button>
        </div>
      </section>

      {/* 5. PLATFORM ARCHITECTURE IN 3 CLEAN TABS (MODULES, CONTROLS, ROADMAP) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                Enterprise Blueprint
              </span>
              <span className="text-xs text-slate-500 font-medium">Architecture & Guardrails</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              Modules, Governance Controls & Roadmap
            </h2>
          </div>

          {/* Architecture Tabs */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setArchTab('modules')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                archTab === 'modules'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              12 Modules
            </button>
            <button
              onClick={() => setArchTab('controls')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                archTab === 'controls'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              8 Controls
            </button>
            <button
              onClick={() => setArchTab('roadmap')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                archTab === 'roadmap'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Roadmap (Phases 1-4)
            </button>
          </div>
        </div>

        {/* Tab 1: 12 Modules (Compact 4-column cards) */}
        {archTab === 'modules' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {[
              { id: 1, name: 'Firm & User Management', desc: 'Firm registration, staff RBAC, and client assignment.' },
              { id: 2, name: 'Client & Case Management', desc: 'Annual tax cases, client profiles, and DPDP consent tracking.' },
              { id: 3, name: 'Taxpayer Discovery', desc: 'Taxpayer category classification (15 types) and checklist.' },
              { id: 4, name: 'Document Vault', desc: 'Encrypted document intake, category indexing, and versioning.' },
              { id: 5, name: 'AI Document Extraction', desc: 'Ephemeral in-memory OCR with page/line coordinate citations.' },
              { id: 6, name: 'Validation & Quality', desc: 'Taxpayer identity checks, required fields, and confidence scores.' },
              { id: 7, name: '3-Way Reconciliation', desc: 'Form 16 vs 26AS vs AIS matrix with real-time variance flags.' },
              { id: 8, name: 'Tax Calculation Engine', desc: 'Finance Act 2024 deterministic rules & regime comparison.' },
              { id: 9, name: 'CA Review & Sign-Off', desc: 'Review checklist, notes, and strict approval gate for filing.' },
              { id: 10, name: 'ITR Filing & Post-Filing', desc: 'CBDT JSON generation, filing status, and 143(1) tracking.' },
              { id: 11, name: 'Engine 2 Client Advisory', desc: '2-page visual Financial Eye-Opener report generation.' },
              { id: 12, name: 'Audit & Governance', desc: 'Immutable chronological activity logs and monitoring.' },
            ].map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1 hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Module {m.id}</span>
                  <span className="text-[10px] font-mono text-slate-600 font-bold">0{m.id}</span>
                </div>
                <h4 className="font-bold text-slate-800 text-[11px]">{m.name}</h4>
                <p className="text-[11px] text-slate-500 leading-snug">{m.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: 8 Essential Controls */}
        {archTab === 'controls' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {[
              { id: 1, title: 'Multi-Tenant Isolation', desc: 'Firm data is strictly separated at the database and application layer.' },
              { id: 2, title: 'Client Consent Recording', desc: 'Consent is captured and verified before processing personal data.' },
              { id: 3, title: 'Preserve Original Files', desc: 'Original uploaded files are never altered or overwritten.' },
              { id: 4, title: 'Traceable Extraction', desc: 'Every extracted field links directly to its source document page.' },
              { id: 5, title: 'Explicit Discrepancy Flagging', desc: 'Mismatches are highlighted for review, never silently resolved.' },
              { id: 6, title: 'Version-Controlled Rules', desc: 'Calculations use governed tax rules that record which version ran.' },
              { id: 7, title: 'Mandatory CA Sign-Off', desc: 'No return can be filed without explicit approval from an authorised CA.' },
              { id: 8, title: 'Immutable Audit Trail', desc: 'Every important action is recorded in an unalterable log.' },
            ].map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1 hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Control 0{c.id}</span>
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 text-[11px]">{c.title}</h4>
                <p className="text-[11px] text-slate-500 leading-snug">{c.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Roadmap (Phases 1-4) */}
        {archTab === 'roadmap' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {[
              { phase: 'Phase 1 (Current)', name: 'Direct Tax MVP', desc: 'ITR-1 & ITR-4, Form 16/26AS/AIS OCR, 3-way reconciliation, Engine 2 reports.' },
              { phase: 'Phase 2', name: 'Expanded Forms', desc: 'ITR-2, ITR-3, ITR-5 (Partnerships & LLPs), capital gains schedule automation.' },
              { phase: 'Phase 3', name: 'Corporate & Audit', desc: 'ITR-6 (Companies), Tax Audit Form 3CD schedules, and GST reconciliation.' },
              { phase: 'Phase 4', name: 'Year-Round Wealth', desc: 'Monthly cashflow advisory, direct wealth account aggregation, continuous advisory.' },
            ].map((p, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1 hover:border-slate-300 transition-all"
              >
                <span className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-wider block">
                  {p.phase}
                </span>
                <h4 className="font-bold text-slate-800 text-[11px]">{p.name}</h4>
                <p className="text-[11px] text-slate-500 leading-snug">{p.desc}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. BOTTOM CALL-TO-ACTION BANNER */}
      <section className="p-8 rounded-3xl bg-slate-900 text-white text-center space-y-4 shadow-sm">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Ready to Experience CA Bharat AI in Action?
        </h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Open the CA Workspace application to inspect the real-time client directory, test OCR document extraction, review 3-way reconciliation, and generate sample filing outputs.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href="/dashboard"
            className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition-colors"
          >
            Launch CA Workspace Application
          </a>
          <button
            onClick={onSwitchToFullSpec}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 transition-colors cursor-pointer"
          >
            View Full 33-Step Specification
          </button>
        </div>
      </section>
    </div>
  )
}
