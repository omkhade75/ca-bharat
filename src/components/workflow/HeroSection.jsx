import React from 'react'
import {
  ShieldCheck,
  Cpu,
  Calculator,
  Award,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  Lock,
  Building,
} from 'lucide-react'
import { CORE_OPERATING_PRINCIPLE } from '../../data/workflowStagesData'

export default function HeroSection({ onExploreSteps, onLaunchSimulator }) {
  return (
    <section id="overview" className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 border-b border-slate-200/80 bg-linear-to-b from-white via-slate-50/50 to-slate-100/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Eyebrow Tag */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-slate-100 text-xs font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-mono tracking-wider text-[11px] uppercase text-amber-300">
              INDIA-FOCUSED TAX WORKFLOW PLATFORM
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-[11px] text-slate-300">AY 2025-26 BASELINE</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">FRN: DEMO012984N</span>
            <span className="hidden sm:inline text-slate-400">• Sharma & Co. CA Firm</span>
          </div>
        </div>

        {/* Main Hero Header */}
        <div className="max-w-4xl space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
            CA BHARAT AI
            <span className="block text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-800 mt-1">
              Final End-to-End Business Workflow
            </span>
          </h1>

          <p className="text-base sm:text-lg font-semibold text-amber-800 leading-snug">
            From firm setup and client onboarding to tax filing, reporting and ongoing management.
          </p>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl pt-1">
            This specification describes, in plain language, how a Chartered Accountancy firm uses CA Bharat AI to manage a client tax case from start to finish. It unites the 12 product modules, the CA tax-preparation workflow, and the reporting & continuous-management requirements into one seamless, verifiable system.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={onExploreSteps}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow-sm flex items-center gap-2 transition-all"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Explore The 7 Stages (33 Steps)</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={onLaunchSimulator}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs sm:text-sm border border-slate-300 hover:border-slate-400 shadow-2xs flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Interactive Case Simulator</span>
          </button>

          <a
            href="#modules"
            className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-semibold text-xs sm:text-sm hover:bg-slate-100/70 transition-colors"
          >
            The 12 Modules &rarr;
          </a>
        </div>

        {/* Core Operating Principle Callout Card */}
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-5 sm:p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-emerald-700 text-white flex items-center justify-center shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 font-mono">
                  CORE OPERATING PRINCIPLE
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
                {CORE_OPERATING_PRINCIPLE.title}
              </h3>
              <p className="text-emerald-900 text-sm font-medium leading-relaxed">
                "{CORE_OPERATING_PRINCIPLE.statement}"
              </p>
            </div>

            <div className="shrink-0 self-start md:self-center">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-200/80 text-emerald-950 font-bold text-xs border border-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                ICAI Professional Governance
              </span>
            </div>
          </div>

          {/* 3 Pillars Sub-cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-emerald-200/80 text-xs">
            {CORE_OPERATING_PRINCIPLE.pillars.map((pillar, i) => (
              <div
                key={i}
                className="bg-white/90 p-3.5 rounded-xl border border-emerald-200/80 shadow-2xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{pillar.label}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
                    {pillar.badge}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Live Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {[
            { label: 'Discrete Stages', value: '7 Stages', sub: 'End-to-End Lifecycle' },
            { label: 'Workflow Steps', value: '33 Steps', sub: 'Exhaustive Coverage' },
            { label: 'Developer Modules', value: '12 Modules', sub: 'Modular Engine' },
            { label: 'Platform Controls', value: '8 Controls', sub: 'Security & Governance' },
            { label: 'Statutory Math', value: '100% Rules', sub: 'Zero LLM Arithmetic' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs text-center sm:text-left"
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                {stat.label}
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 font-mono block mt-0.5">
                {stat.value}
              </span>
              <span className="text-[10px] text-slate-500 font-medium block">
                {stat.sub}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
