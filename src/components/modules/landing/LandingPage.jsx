import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Scale,
  Sparkles,
  Cpu,
  Lock,
  Download,
  FileText,
  Award,
  Menu,
  X,
  ArrowUpRight,
  Check
} from 'lucide-react'
import Logo from '../../common/Logo'

export default function LandingPage() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLaunchApp = (path = '/dashboard') => {
    navigate(path)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* 1. TOP ANNOUNCEMENT TICKER */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-slate-800 text-xs py-2 px-4 text-center text-slate-300 flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase tracking-wider border border-amber-500/30">
          AY 2025-26 Live Prototype
        </span>
        <span className="hidden sm:inline text-slate-400">•</span>
        <span className="text-slate-300 font-medium">
          Built Specifically for Indian Chartered Accountants • Conforms to Finance Act 2024 & Section 115BAC
        </span>
        <button
          onClick={() => handleLaunchApp('/dashboard')}
          className="ml-2 font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 text-[11px] underline underline-offset-2 cursor-pointer"
        >
          Launch Mission Control <ArrowRight className="w-3 h-3 inline" />
        </button>
      </div>

      {/* 2. NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-10 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Logo size="md" theme="dark" />
            <div className="hidden xl:block h-6 w-px bg-slate-800" />
            <span className="hidden xl:inline text-xs text-slate-400 font-medium italic">
              "File better. Advise all year."
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-medium text-slate-300">
            <a href="#engines" className="hover:text-amber-400 transition-colors">The Two Engines</a>
            <a href="#how-it-works" className="hover:text-amber-400 transition-colors">Workflow</a>
            <a href="#reconciliation" className="hover:text-amber-400 transition-colors">3-Way Audit</a>
            <a href="#eye-opener" className="hover:text-amber-400 transition-colors">Eye-Opener Report</a>
            <a href="#for-ca-firms" className="hover:text-amber-400 transition-colors">For CA Firms</a>
            <a href="#security" className="hover:text-amber-400 transition-colors">Security & DPDP</a>
            <a href="#pricing" className="hover:text-amber-400 transition-colors">Advisory Tiers</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleLaunchApp('/insights-delivery')}
              className="hidden sm:flex px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Sample Eye-Opener</span>
            </button>

            <button
              onClick={() => handleLaunchApp('/dashboard')}
              className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-bold rounded-lg text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-900/30 active:scale-98 transition-all flex items-center gap-2 cursor-pointer border border-blue-400/30"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-slate-800 flex flex-col gap-2 pb-2 text-xs">
            <a
              href="#engines"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-slate-300 hover:bg-slate-900 rounded-lg"
            >
              The Two Engines
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-slate-300 hover:bg-slate-900 rounded-lg"
            >
              Workflow
            </a>
            <a
              href="#reconciliation"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-slate-300 hover:bg-slate-900 rounded-lg"
            >
              3-Way Audit Matrix
            </a>
            <a
              href="#eye-opener"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-slate-300 hover:bg-slate-900 rounded-lg"
            >
              Financial Eye-Opener Report
            </a>
            <a
              href="#for-ca-firms"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-slate-300 hover:bg-slate-900 rounded-lg"
            >
              For CA Firms & Tiers
            </a>
            <a
              href="#security"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-slate-300 hover:bg-slate-900 rounded-lg"
            >
              Security & DPDP Concept
            </a>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLaunchApp('/dashboard')
                }}
                className="w-full py-2.5 text-center text-xs font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-500"
              >
                Launch Mission Control →
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Subtle geometric background accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-radial from-blue-600/10 via-slate-950/0 to-transparent pointer-events-none" />
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-48 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* National & Compliance Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-slate-300 text-xs shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-slate-200">CA-Led Sovereign Tax Intelligence</span>
              <span className="text-slate-500">|</span>
              <span className="text-amber-400 font-medium">AY 2025-26 (FY 2024-25)</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
              The AI-Powered, CA-Led Tax & Personal Finance Platform for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500">
                India
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-3xl mx-auto">
              <strong className="text-white font-semibold">"File better. Advise all year."</strong> Transform seasonal, commoditized ITR compliance into high-margin, year-round personal wealth advisory. Deterministic tax computation, automated 3-way reconciliation (Form 16 vs 26AS vs AIS), and strict human-in-the-loop Chartered Accountant oversight.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                onClick={() => handleLaunchApp('/dashboard')}
                className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-900/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-400/40"
              >
                <span>Get Started — Launch Mission Control</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>

              <button
                onClick={() => handleLaunchApp('/tax-reconciliation')}
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold rounded-xl text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Scale className="w-4 h-4 text-amber-400" />
                <span>3-Way Reconciliation Audit</span>
              </button>
            </div>

            {/* 4 Trust Proof Indicators */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Zero LLM Math</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">100% deterministic rules engine conforming to Finance Act 2024</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>DPDP Act Concept</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Digital consent ledger with verified client IP & purpose limitation</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Mandatory CA Approval</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Human-in-the-loop sign-off with simulated DSC digest & checklist</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Government Ready</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Exports CBDT-compliant ITR-1, ITR-2 & ITR-4 JSON schemas</p>
              </div>
            </div>
          </div>

          {/* 4. LIVE INTERACTIVE HERO PREVIEW CARD */}
          <div className="mt-12 sm:mt-16 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 sm:p-6 lg:p-8 relative">
            {/* Top Workspace Chrome */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="font-mono text-slate-400 ml-2">app.cabharatai.in / mission-control</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Firm Profile:</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 font-semibold text-slate-200 border border-slate-700">
                  Sharma & Co. Chartered Accountants (FRN: DEMO012984N)
                </span>
              </div>
            </div>

            {/* Interactive Grid Inside Mockup */}
            <div className="pt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Card 1: 3-Way Reconciliation Live Teaser */}
              <div
                onClick={() => handleLaunchApp('/tax-reconciliation')}
                className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-blue-500/60 transition-all cursor-pointer group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800">
                    Engine 1 • Module 3
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                  3-Way Cross-Reconciliation Matrix
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automatically aligns Form 16 Part A/B against TRACES Form 26AS and AIS/TIS statement. Catches hidden bank interest (Sec 80TTA) and flags capital gains.
                </p>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Discrepancy Catch Rate:</span>
                  <span className="text-amber-400 font-bold">100% Flagged ✓</span>
                </div>
              </div>

              {/* Card 2: Deterministic Regime Optimizer */}
              <div
                onClick={() => handleLaunchApp('/tax-reconciliation')}
                className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/60 transition-all cursor-pointer group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                    Finance Act 2024
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                  Deterministic Regime Optimizer
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Side-by-side computation under Old Regime vs Section 115BAC New Regime with ₹75,000 standard deduction and 87A rebate.
                </p>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Active Demo Example:</span>
                  <span className="text-emerald-400 font-bold">New Regime saves ₹28,600</span>
                </div>
              </div>

              {/* Card 3: Engine 2 Personal Finance Eye-Opener */}
              <div
                onClick={() => handleLaunchApp('/insights-delivery')}
                className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-purple-500/60 transition-all cursor-pointer group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
                    Engine 2 • Wealth Advisory
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
                  2-Page Financial Eye-Opener
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The client-facing report delivered with their ITR acknowledgment: derived living expenses, effective tax rate, and idle cash auto-sweep heuristics.
                </p>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Firm Advisory Tier:</span>
                  <span className="text-purple-400 font-bold">Gold Advisory @ ₹499/mo</span>
                </div>
              </div>
            </div>

            {/* Bottom Bar: Quick Launch Action */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>6 Pre-Configured Taxpayer Profiles Ready (Salaried, Professional 44ADA, HUF, Stock Trader)</span>
              </div>
              <button
                onClick={() => handleLaunchApp('/dashboard')}
                className="font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                Click to Enter Full Platform Interactive Workspace <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. THE TWO ENGINES (CORE VALUE PROPOSITION) */}
      <section id="engines" className="py-20 border-t border-slate-800 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800">
              The Dual-Engine Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Why CA Bharat AI is Fundamentally Different
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Most tax software stops when the ITR JSON is generated. CA Bharat AI turns that seasonal filing data into year-round high-value advisory for your practice.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ENGINE 1 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 relative space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800 text-xs font-bold uppercase tracking-wider">
                  Engine 1: Seasonal Compliance
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">Tax Workflow Automation</h3>
                <p className="text-xs text-slate-400 mt-2">
                  Solves the intense July rush. Shrinks preparation and audit time from 45 minutes to under 5 minutes per taxpayer return.
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-blue-950 text-blue-400 mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Multi-Document Dropzones</h4>
                    <p className="text-[11px] text-slate-400">Dedicated ingestion for Form 16 (Part A & B), TRACES 26AS, AIS/TIS, and Broker P&L statements.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-blue-950 text-blue-400 mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">AI OCR with Coordinate Bounding Citations</h4>
                    <p className="text-[11px] text-slate-400">Extracted numbers tie back to exact page, line, and bounding-box coordinates for instant CA verification.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-blue-950 text-blue-400 mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">3-Way Cross-Reconciliation Matrix</h4>
                    <p className="text-[11px] text-slate-400">Cross-checks employer Form 16 against CBDT TRACES 26AS and AIS/TIS to catch unreported income.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-blue-950 text-blue-400 mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Deterministic Section 115BAC Optimizer</h4>
                    <p className="text-[11px] text-slate-400">100% hardcoded mathematical rule engine comparing Old vs New tax regime slabs with zero LLM guesswork.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-blue-950 text-blue-400 mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Pre-Filing Checklist & Simulated DSC Sign-Off</h4>
                    <p className="text-[11px] text-slate-400">Ensures professional ICAI standards are satisfied before generating e-filing JSON schemas.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={() => handleLaunchApp('/document-intelligence')}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 cursor-pointer"
                >
                  Explore Document Vault & OCR →
                </button>
              </div>
            </div>

            {/* ENGINE 2 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 relative space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-amber-950 border border-amber-700 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-700 text-xs font-bold uppercase tracking-wider">
                  Engine 2: Year-Round Wealth
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">Personal Finance Intelligence</h3>
                <p className="text-xs text-slate-400 mt-2">
                  Transforms your relationship with clients. Delivers actionable wealth insights alongside their tax return acknowledgment.
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-amber-950 text-amber-400 mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">The 2-Page Visual Financial Eye-Opener</h4>
                    <p className="text-[11px] text-slate-400">A polished, client-branded PDF report summarizing earnings, tax efficiency, and derived living expenses.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-amber-950 text-amber-400 mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Transparent Living Expenses Formula</h4>
                    <p className="text-[11px] text-slate-400">Calculates unrecorded spending via: <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300 font-mono">Gross Earnings − Taxes Paid − Documented Savings</code>.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-amber-950 text-amber-400 mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Section 80CCD(1B) Tier-1 NPS Advisory</h4>
                    <p className="text-[11px] text-slate-400">Highlights missed ₹50,000 deduction opportunity yielding potential ₹10,400 in direct tax relief.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-amber-950 text-amber-400 mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Idle Cash Sweep Opportunity Analysis</h4>
                    <p className="text-[11px] text-slate-400">Estimates average low-yield bank balance and demonstrates potential gains from 7% auto-sweep FDs.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-amber-950 text-amber-400 mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Quarterly Advance Tax Compliance Check</h4>
                    <p className="text-[11px] text-slate-400">Protects clients from Section 234B/234C interest penalties on unanticipated capital gains.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={() => handleLaunchApp('/insights-delivery')}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer"
                >
                  Explore Financial Eye-Opener & Insights →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS (4 STEPS) */}
      <section id="how-it-works" className="py-20 border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-800">
              Simple 4-Step Lifecycle
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              From Client Invite to Year-Round Advisory
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              An intuitive end-to-end workflow designed for busy CA firms and their article assistants.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 relative space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 font-bold text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-white">Onboard & Consent</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add taxpayer profile and dispatch a simulated WhatsApp invitation link. Consent logged with client IP and purpose limitation hash under DPDP guidelines.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 relative space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 font-bold text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-white">Dropzone Ingestion</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Drop Form 16, TRACES 26AS, AIS/TIS, and P&L files into designated vaults. OCR layout parser maps line items to visual coordinate bounding citations.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 relative space-y-3">
              <div className="w-10 h-10 rounded-lg bg-teal-950 border border-teal-800 flex items-center justify-center text-teal-400 font-bold text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-white">Reconcile & Optimize</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review automated 3-way matrix. Accept or resolve flagged interest or dividend discrepancies, then compare Old vs New tax regime slabs.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 relative space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 font-bold text-sm">
                04
              </div>
              <h3 className="text-base font-bold text-white">Sign-Off & Eye-Opener</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Complete pre-filing checklist, approve with demo DSC digest, export CBDT ITR JSON, and dispatch the 2-Page Eye-Opener report via WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. 3-WAY RECONCILIATION AUDIT HIGHLIGHT */}
      <section id="reconciliation" className="py-20 border-t border-slate-800 bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-950/60 px-3 py-1 rounded-full border border-teal-800">
                Eliminate Automated Notice Risks
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                3-Way Cross-Audit Matrix: Form 16 vs 26AS vs AIS
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Taxpayers routinely omit savings bank interest or fail to report small capital gains from mutual fund switches. When the Income Tax Department's AI cross-checks their return against AIS, an automated notice is issued.
              </p>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Catches SFT-005 bank interest absent from Form 16</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Flags SFT-017 mutual fund capital gains requiring ITR-2 upgrade</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verifies employer TDS matches TRACES Form 26AS ledger credits</span>
                </div>
              </div>
              <button
                onClick={() => handleLaunchApp('/tax-reconciliation')}
                className="px-5 py-2.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Test 3-Way Reconciliation Interactive Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reconciliation Table Preview Card */}
            <div className="lg:col-span-7 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
                <span className="font-bold text-slate-200">Reconciliation Matrix Demo (Client: Rahul S. DEMOP1234F)</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">2 Discrepancies Flagged</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                      <th className="pb-2 font-medium">Income Head</th>
                      <th className="pb-2 font-medium">Form 16</th>
                      <th className="pb-2 font-medium">TRACES 26AS</th>
                      <th className="pb-2 font-medium">AIS / TIS</th>
                      <th className="pb-2 font-medium">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
                    <tr>
                      <td className="py-2.5 font-sans font-medium text-slate-200">Gross Salary (17(1))</td>
                      <td className="py-2.5">₹15,00,000</td>
                      <td className="py-2.5">₹15,00,000</td>
                      <td className="py-2.5">₹15,00,000</td>
                      <td className="py-2.5 text-emerald-400">₹0 (Matched)</td>
                    </tr>
                    <tr className="bg-amber-950/20">
                      <td className="py-2.5 font-sans font-medium text-amber-300">Savings Bank Interest</td>
                      <td className="py-2.5 text-slate-500">—</td>
                      <td className="py-2.5 text-slate-500">—</td>
                      <td className="py-2.5 text-amber-300 font-bold">₹46,000</td>
                      <td className="py-2.5 text-amber-400 font-bold">+₹46,000 Flagged</td>
                    </tr>
                    <tr className="bg-amber-950/20">
                      <td className="py-2.5 font-sans font-medium text-amber-300">Mutual Fund Capital Gains</td>
                      <td className="py-2.5 text-slate-500">—</td>
                      <td className="py-2.5 text-slate-500">—</td>
                      <td className="py-2.5 text-amber-300 font-bold">₹58,000</td>
                      <td className="py-2.5 text-amber-400 font-bold">Triggers ITR-2</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-sans font-medium text-slate-200">Chapter VI-A (80C/80D)</td>
                      <td className="py-2.5">₹1,75,000</td>
                      <td className="py-2.5">—</td>
                      <td className="py-2.5">₹1,75,000</td>
                      <td className="py-2.5 text-emerald-400">₹0 (Matched)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Action: In the prototype, clicking <strong>"Accept & Add"</strong> automatically adds the ₹46,000 to Section 56(2) and recalculates tax.</span>
                <button
                  onClick={() => handleLaunchApp('/tax-reconciliation')}
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[10px]"
                >
                  Try in Prototype
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. 2-PAGE FINANCIAL EYE-OPENER HIGHLIGHT */}
      <section id="eye-opener" className="py-20 border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800">
              The Client Delivery Asset
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              The 2-Page Visual Financial Eye-Opener
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Instead of sending a dry, 15-page ITR acknowledgment PDF that clients never read, deliver an executive personal finance dossier that establishes your firm as their indispensable financial advisor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Page 1 Summary */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-purple-400 uppercase tracking-wider text-[11px]">Dossier Page 1</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">Annual Snapshot</span>
              </div>
              <h3 className="text-xl font-bold text-white">Financial Position & Trajectory</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Derives annual earnings, true effective tax rate, savings ratio, and living expenses with visible formulas and zero guesswork.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase">Annual Earnings</div>
                  <div className="text-base font-bold text-white mt-1">₹16,08,200</div>
                  <div className="text-[10px] text-slate-500">Gross salary + interest + gains</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase">Derived Expenses</div>
                  <div className="text-base font-bold text-amber-400 mt-1">₹10,42,780</div>
                  <div className="text-[10px] text-slate-500">~₹86,898/month run-rate</div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                Includes interactive 3-Year Trajectory chart comparing Gross Income vs Taxes Paid vs Wealth Accumulated.
              </div>
            </div>

            {/* Page 2 Summary */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">Dossier Page 2</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">Actionable Heuristics</span>
              </div>
              <h3 className="text-xl font-bold text-white">3 Critical Wealth Opportunities</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Translates tax schedules into wealth opportunities that justify ongoing retainers and fee-based advisory.
              </p>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2">
                  <span className="font-bold text-amber-400">1.</span>
                  <div>
                    <strong className="text-slate-200">Section 80CCD(1B) Tier-1 NPS:</strong>
                    <span className="text-slate-400 ml-1">Up to ₹50,000 additional deduction saving ~₹10,400 in direct tax.</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2">
                  <span className="font-bold text-amber-400">2.</span>
                  <div>
                    <strong className="text-slate-200">Idle Cash Sweep:</strong>
                    <span className="text-slate-400 ml-1">Assumed ~₹15.3L savings balance earning 3% could yield +₹61,333/yr in a 7% sweep FD.</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2">
                  <span className="font-bold text-amber-400">3.</span>
                  <div>
                    <strong className="text-slate-200">Capital Gains Advance Tax:</strong>
                    <span className="text-slate-400 ml-1">Section 234C compliance check ensuring installment deadlines are met.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => handleLaunchApp('/insights-delivery')}
              className="px-6 py-3 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-500 text-white inline-flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-900/30"
            >
              <Download className="w-4 h-4" />
              <span>Preview & Print Sample 2-Page Eye-Opener Report</span>
            </button>
          </div>
        </div>
      </section>

      {/* 9. MONETIZATION & ADVISORY TIERS */}
      <section id="pricing" className="py-20 border-t border-slate-800 bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
              Transform Your Firm's Revenue Model
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Three Advisory Tiers for Your Clients
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Break free from the ₹1,500/return seasonal filing trap. Offer tiered client plans that produce predictable monthly recurring revenue (MRR).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* SILVER TIER */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-bold uppercase">Silver Tier</span>
                <h3 className="text-xl font-bold text-white">Annual Filing + Eye-Opener</h3>
                <div className="text-2xl font-extrabold text-white font-mono">
                  ₹2,499 <span className="text-xs font-normal text-slate-400">/ annual filing</span>
                </div>
                <p className="text-xs text-slate-400">
                  Ideal for salaried professionals seeking automated 3-way reconciliation and an executive personal financial snapshot.
                </p>
                <div className="space-y-2 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Complete Form 16 & AIS Ingestion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>3-Way Reconciliation Audit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>2-Page Visual Financial Eye-Opener</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>CA Partner Certified Filing</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleLaunchApp('/firm-clients')}
                className="w-full py-2.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                View Silver Clients in Demo
              </button>
            </div>

            {/* GOLD TIER (HERO TIER) */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/30 border-2 border-amber-500/70 shadow-xl shadow-amber-900/20 space-y-5 flex flex-col justify-between relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider">
                Most Popular for Growth
              </div>

              <div className="space-y-4">
                <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase">
                  Gold Tier
                </span>
                <h3 className="text-xl font-bold text-white">Quarterly Advance Tax Advisory</h3>
                <div className="text-2xl font-extrabold text-amber-300 font-mono">
                  ₹499 <span className="text-xs font-normal text-slate-400">/ month (Retainer)</span>
                </div>
                <p className="text-xs text-slate-300">
                  For high-earners, traders, and Section 44ADA professionals needing advance tax calculation and capital gains harvesting.
                </p>
                <div className="space-y-2 pt-2 text-xs text-slate-200">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>All Silver Tier Capabilities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Quarterly Section 234C Advance Tax Run</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Year-End Capital Gains Tax Harvesting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Dedicated WhatsApp Priority Channel</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleLaunchApp('/insights-delivery')}
                className="w-full py-2.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-xs"
              >
                Inspect Gold Monthly Advisory Demo
              </button>
            </div>

            {/* PLATINUM TIER */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="px-2.5 py-1 rounded bg-purple-950 text-purple-300 border border-purple-800 text-xs font-bold uppercase">
                  Platinum Tier
                </span>
                <h3 className="text-xl font-bold text-white">SEBI RIA Wealth Advisory</h3>
                <div className="text-2xl font-extrabold text-white font-mono">
                  ₹1,499 <span className="text-xs font-normal text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-400">
                  For HNIs, family trusts, and business owners requiring comprehensive asset allocation, estate, and HUF structuring.
                </p>
                <div className="space-y-2 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>All Silver & Gold Deliverables</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Multi-Entity Family Portfolio Audit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>HUF Setup & Section 56 Structuring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Quarterly Strategic CA Video Review</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleLaunchApp('/firm-clients')}
                className="w-full py-2.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                View Platinum Entities in Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 10. ARCHITECTURAL TRUST & DPDP (THE 4 PILLARS) */}
      <section id="security" className="py-20 border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-800">
              Institutional Security & DPDP Compliance
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Engineered for Chartered Trust
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Tax data contains the most sensitive financial records in India. Our architectural design respects strict privacy and regulatory boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Deterministic Arithmetic</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generative AI models are strictly prohibited from performing tax math. Slabs, rebates, and cess are computed via 100% hardcoded statutory rules.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Mandatory CA Approval</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The platform never automatically files a return. Human-in-the-loop review by an ICAI partner is strictly required prior to JSON schema creation.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">DPDP Consent Model</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Digital notice and consent lifecycle tracking. Every client authorization records timestamp, purpose limitation, and verified client IP address.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Simulated In-Memory Decryption</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Architectural blueprint designed for ephemeral RAM processing: documents are decrypted, parsed into structured vectors, and destroyed without persistent disk exposure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FINAL CTA BANNER */}
      <section className="py-20 border-t border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950/40 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider border border-amber-500/30">
            Interactive Prototype Ready
          </span>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to Experience CA Bharat AI?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            Test the complete, live frontend prototype right now. Explore all four modules pre-loaded with fictional Indian taxpayer cases, simulated AI OCR parsing, and instant Old vs New regime calculations.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => handleLaunchApp('/dashboard')}
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-900/40 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-400/40"
            >
              <span>Get Started — Enter Mission Control</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>

            <button
              onClick={() => handleLaunchApp('/firm-clients')}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold rounded-xl text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
            >
              View Client Directory (7)
            </button>
          </div>

          <p className="text-xs text-slate-500 pt-2">
            No signup required • Runs entirely in your browser with LocalStorage persistence
          </p>
        </div>
      </section>

      {/* 12. FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 px-4 sm:px-6 lg:px-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800/80">
          <div className="space-y-3 md:col-span-1">
            <Logo size="md" theme="dark" />
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Chartered Tax & Wealth Intelligence platform for Indian CA firms. Powered by deterministic rules and human CA oversight.
            </p>
            <div className="text-[11px] text-slate-400 font-mono">
              Fictional Demo Firm: Sharma & Co. CA (FRN: DEMO012984N)
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Core Modules</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => handleLaunchApp('/dashboard')} className="hover:text-amber-400 cursor-pointer">
                  Mission Control Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => handleLaunchApp('/firm-clients')} className="hover:text-amber-400 cursor-pointer">
                  Module 1: Firm & Client Operations
                </button>
              </li>
              <li>
                <button onClick={() => handleLaunchApp('/document-intelligence')} className="hover:text-amber-400 cursor-pointer">
                  Module 2: Document Intelligence
                </button>
              </li>
              <li>
                <button onClick={() => handleLaunchApp('/tax-reconciliation')} className="hover:text-amber-400 cursor-pointer">
                  Module 3: Tax & Reconciliation
                </button>
              </li>
              <li>
                <button onClick={() => handleLaunchApp('/insights-delivery')} className="hover:text-amber-400 cursor-pointer">
                  Module 4: Insights & Client Delivery
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Statutory Engines</h4>
            <ul className="space-y-2">
              <li><span className="text-slate-400">Finance Act 2024 Slabs</span></li>
              <li><span className="text-slate-400">Section 115BAC New Regime Optimizer</span></li>
              <li><span className="text-slate-400">3-Way Cross-Reconciliation (AIS vs 26AS)</span></li>
              <li><span className="text-slate-400">2-Page Financial Eye-Opener</span></li>
              <li><span className="text-slate-400">CBDT ITR JSON Schema Generator</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Compliance & Ethics</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => handleLaunchApp('/help')} className="hover:text-amber-400 cursor-pointer">
                  Help & DPDP Compliance Guide
                </button>
              </li>
              <li>
                <button onClick={() => handleLaunchApp('/settings')} className="hover:text-amber-400 cursor-pointer">
                  Firm Settings & Master FRN
                </button>
              </li>
              <li><span className="text-slate-500">ICAI Professional Code of Conduct</span></li>
              <li><span className="text-slate-500">Zero LLM Math Mandate</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © 2026 CA Bharat AI. Built for India. Prototype Demonstration.
          </div>
          <div className="text-center sm:text-right">
            Disclaimer: CA Bharat AI is a frontend prototype. All tax calculations and AI extractions are sample demonstrations requiring certification by a practicing Chartered Accountant.
          </div>
        </div>
      </footer>
    </div>
  )
}
