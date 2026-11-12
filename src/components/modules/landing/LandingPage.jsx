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
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 font-sans selection:bg-amber-200 selection:text-amber-950">
      {/* 1. TOP ANNOUNCEMENT BAR (WARM SAND / GOLD TINT) */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-100/70 border-b border-amber-200/80 text-xs py-2 px-4 text-center text-amber-950 flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white text-amber-900 font-bold text-[11px] border border-amber-300 shadow-2xs">
          AY 2025-26 Live Prototype
        </span>
        <span className="hidden sm:inline text-amber-300">•</span>
        <span className="text-amber-950 font-medium">
          Built for Indian Chartered Accountants • Conforms to Finance Act 2024 & Section 115BAC
        </span>
        <button
          onClick={() => handleLaunchApp('/dashboard')}
          className="ml-2 font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 text-[11px] underline underline-offset-2 cursor-pointer"
        >
          Launch Mission Control <ArrowRight className="w-3 h-3 inline" />
        </button>
      </div>

      {/* 2. STICKY LIGHT NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 lg:px-10 py-3.5 transition-all shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Logo size="md" theme="light" />
            <div className="hidden xl:block h-5 w-px bg-slate-200" />
            <span className="hidden xl:inline text-xs text-slate-600 font-normal italic">
              "File better. Advise all year."
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-700">
            <a href="#engines" className="hover:text-blue-700 transition-colors">The Two Engines</a>
            <a href="#how-it-works" className="hover:text-blue-700 transition-colors">Workflow</a>
            <a href="#reconciliation" className="hover:text-blue-700 transition-colors">3-Way Audit</a>
            <a href="#eye-opener" className="hover:text-blue-700 transition-colors">Financial Eye-Opener</a>
            <a href="#for-ca-firms" className="hover:text-blue-700 transition-colors">Advisory Tiers</a>
            <a href="#security" className="hover:text-blue-700 transition-colors">Security & DPDP</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleLaunchApp('/insights-delivery')}
              className="hidden sm:flex px-3.5 py-2 text-xs font-medium rounded-lg text-slate-700 hover:text-slate-900 bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200/80 transition-colors items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-amber-700" />
              <span>Sample Eye-Opener</span>
            </button>

            <button
              onClick={() => handleLaunchApp('/dashboard')}
              className="px-4 sm:px-5 py-2 text-xs font-bold rounded-lg text-white bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 shadow-xs active:scale-98 transition-all flex items-center gap-2 cursor-pointer border border-blue-600"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-slate-200 flex flex-col gap-2 pb-2 text-xs bg-white rounded-b-xl">
            <a
              href="#engines"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              The Two Engines
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Workflow
            </a>
            <a
              href="#reconciliation"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              3-Way Audit Matrix
            </a>
            <a
              href="#eye-opener"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Financial Eye-Opener Report
            </a>
            <a
              href="#for-ca-firms"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Advisory Tiers & Retainers
            </a>
            <a
              href="#security"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Security & DPDP Concept
            </a>
            <div className="pt-2 px-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLaunchApp('/dashboard')
                }}
                className="w-full py-2.5 text-center text-xs font-bold rounded-lg text-white bg-blue-700 hover:bg-blue-600"
              >
                Launch Mission Control →
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION (WARM PASTEL GRADIENTS, AMBIENT DEPTH) */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-amber-200/50 bg-gradient-to-b from-amber-50/60 via-[#FDFBF7] to-blue-50/40">
        {/* Soft atmospheric background color splashes */}
        <div className="absolute top-6 left-1/4 w-80 h-80 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-12 right-1/4 w-80 h-80 bg-blue-200/25 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          {/* Subtle Category Pill with Warm Border */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-xs border border-amber-200 text-slate-800 text-xs shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="font-bold text-slate-900">CA-Led Tax & Personal Finance Platform</span>
            <span className="text-amber-400">|</span>
            <span className="text-amber-900 font-semibold">AY 2025-26</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            The CA-Led Tax Workflow & Personal Finance Platform for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-800 via-indigo-700 to-blue-900">
              India
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-base sm:text-lg text-slate-700 font-normal leading-relaxed max-w-2xl mx-auto">
            <strong className="text-slate-900 font-semibold">"File better. Advise all year."</strong> Transform seasonal, commoditized ITR filing into year-round wealth advisory. Deterministic statutory tax calculations, 3-way reconciliation (Form 16 vs 26AS vs AIS), and Chartered Accountant oversight.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleLaunchApp('/dashboard')}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-600 hover:to-indigo-600 shadow-md shadow-blue-900/15 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-600"
            >
              <span>Get Started — Launch Mission Control</span>
              <ArrowRight className="w-4 h-4 text-amber-200" />
            </button>

            <button
              onClick={() => handleLaunchApp('/tax-reconciliation')}
              className="w-full sm:w-auto px-5 py-3.5 text-sm font-semibold rounded-xl text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Scale className="w-4 h-4 text-amber-700" />
              <span>3-Way Reconciliation Audit</span>
            </button>
          </div>

          {/* 4 Distinct Soft-Tinted Trust Indicators */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left max-w-4xl mx-auto">
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span>Zero LLM Math</span>
              </div>
              <p className="text-[11px] text-blue-800 mt-1">100% deterministic rules engine conforming to Finance Act 2024</p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>DPDP Act Concept</span>
              </div>
              <p className="text-[11px] text-amber-800 mt-1">Digital consent ledger with verified client IP & purpose limitation</p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Mandatory CA Approval</span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-1">Human-in-the-loop sign-off with simulated DSC digest & checklist</p>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-950">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                <span>Government Ready</span>
              </div>
              <p className="text-[11px] text-purple-800 mt-1">Exports CBDT-compliant ITR-1, ITR-2 & ITR-4 JSON schemas</p>
            </div>
          </div>
        </div>

        {/* 4. LIGHT INTERACTIVE HERO PREVIEW CARD (TINTED SURFACES) */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
          <div className="rounded-2xl bg-white border border-slate-300 shadow-lg overflow-hidden">
            {/* Top Window Bar */}
            <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="font-mono text-slate-600 text-[11px] ml-2 font-medium">app.cabharatai.in / mission-control</span>
              </div>
              <div className="text-[11px] text-slate-700 font-semibold hidden sm:flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Sharma & Co. Chartered Accountants (FRN: DEMO012984N)
              </div>
            </div>

            {/* Three Soft-Tinted Cards Inside Preview */}
            <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gradient-to-b from-slate-50/80 to-[#FAF8F5]">
              {/* Card 1: Teal/Mint Tint */}
              <div
                onClick={() => handleLaunchApp('/tax-reconciliation')}
                className="p-4.5 rounded-xl bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/40 border border-teal-200 hover:border-teal-400 hover:shadow-xs transition-all cursor-pointer group space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded border border-teal-300">
                    Engine 1 • Module 3
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-teal-600 group-hover:text-teal-800 transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                  3-Way Cross-Reconciliation Matrix
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Automatically aligns Form 16 Part A/B against TRACES Form 26AS and AIS/TIS. Catches hidden savings interest and flags capital gains.
                </p>
                <div className="p-2 rounded-lg bg-white/90 border border-teal-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-600 text-[11px] font-medium">Audit Detection:</span>
                  <span className="text-teal-800 font-bold text-[11px]">2 Items Reconciled ✓</span>
                </div>
              </div>

              {/* Card 2: Warm Honey/Amber Tint */}
              <div
                onClick={() => handleLaunchApp('/tax-reconciliation')}
                className="p-4.5 rounded-xl bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 border border-amber-200 hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer group space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300">
                    Finance Act 2024
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-700 group-hover:text-amber-900 transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-900 transition-colors">
                  Deterministic Regime Optimizer
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Side-by-side computation under Old Regime vs Section 115BAC New Regime with ₹75,000 standard deduction and 87A rebate.
                </p>
                <div className="p-2 rounded-lg bg-white/90 border border-amber-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-600 text-[11px] font-medium">Active Client:</span>
                  <span className="text-emerald-700 font-bold text-[11px]">New Regime saves ₹28,600</span>
                </div>
              </div>

              {/* Card 3: Lavender/Purple Tint */}
              <div
                onClick={() => handleLaunchApp('/insights-delivery')}
                className="p-4.5 rounded-xl bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/40 border border-purple-200 hover:border-purple-400 hover:shadow-xs transition-all cursor-pointer group space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 bg-purple-100/70 px-2 py-0.5 rounded border border-purple-300">
                    Engine 2 • Wealth Advisory
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-purple-700 group-hover:text-purple-900 transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-900 transition-colors">
                  2-Page Financial Eye-Opener
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The client-facing report delivered with their ITR acknowledgment: derived living expenses, effective tax rate, and idle cash sweep heuristics.
                </p>
                <div className="p-2 rounded-lg bg-white/90 border border-purple-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-600 text-[11px] font-medium">Advisory Tier:</span>
                  <span className="text-purple-800 font-bold text-[11px]">Gold Retainer @ ₹499/mo</span>
                </div>
              </div>
            </div>

            {/* Bottom Bar inside Mockup */}
            <div className="px-5 py-3.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-slate-600 font-medium">6 pre-loaded demonstration taxpayer cases (Salaried, Professional 44ADA, HUF, Investor)</span>
              <button
                onClick={() => handleLaunchApp('/dashboard')}
                className="font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
              >
                Enter Platform Workspace <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. THE TWO ENGINES (RICH SOFT BLUE & WARM AMBER TINTS) */}
      <section id="engines" className="py-16 md:py-24 bg-gradient-to-b from-blue-50/30 via-slate-50/50 to-amber-50/30 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 bg-blue-100/70 px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
              The Dual-Engine Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Two Integrated Engines for Modern CA Practices
            </h2>
            <p className="text-xs sm:text-sm text-slate-700">
              Most tax utilities stop once the ITR JSON is generated. CA Bharat AI turns seasonal filing data into ongoing high-value client advisory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ENGINE 1: AZURE / ICE TINT */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-blue-50/80 via-white to-slate-50 border border-blue-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-700 shadow-2xs">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-100/80 text-blue-900 border border-blue-200 text-[11px] font-bold">
                  Engine 1: Seasonal Compliance
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">Tax Workflow Automation</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Reduces preparation and audit time from 45 minutes to under 5 minutes per taxpayer return during peak filing season.
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <span><strong>Multi-Document Vault:</strong> Dropzones for Form 16 (Part A & B), TRACES 26AS, AIS/TIS, and Broker P&L.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <span><strong>Bounding-Box OCR Citations:</strong> Line numbers and coordinate citations tie directly back to source PDF pages.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <span><strong>3-Way Automated Reconciliation:</strong> Compares employer Form 16 against CBDT TRACES 26AS and AIS/TIS data.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <span><strong>Deterministic Section 115BAC Optimizer:</strong> 100% rule-based slab comparisons with zero probabilistic guessing.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <span><strong>Pre-Filing Checklist & Simulated DSC Sign-Off:</strong> Ensures statutory ICAI compliance prior to JSON export.</span>
                </div>
              </div>

              <div className="pt-3 border-t border-blue-100">
                <button
                  onClick={() => handleLaunchApp('/document-intelligence')}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                >
                  Explore Document Vault & OCR →
                </button>
              </div>
            </div>

            {/* ENGINE 2: WARM HONEY / AMBER TINT */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-orange-50/30 border border-amber-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shadow-2xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-100/80 text-amber-950 border border-amber-300 text-[11px] font-bold">
                  Engine 2: Year-Round Wealth
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">Personal Finance Intelligence</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Delivers actionable wealth heuristics and executive financial snapshots alongside tax return acknowledgments.
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span><strong>2-Page Visual Financial Eye-Opener:</strong> Executive summary of earnings, tax efficiency, and derived living expenses.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span><strong>Living Expenses Formula:</strong> Derived via <code className="bg-amber-100/60 px-1 py-0.5 rounded text-amber-950 font-mono text-[11px]">Gross Inflow − Taxes − Documented Savings</code>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span><strong>Section 80CCD(1B) Tier-1 NPS Advisory:</strong> Identifies missed ₹50k deduction opportunity yielding potential ~₹10.4k relief.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span><strong>Idle Cash Sweep Analysis:</strong> Estimates low-yield savings balance and models potential interest gains in 7% sweep FDs.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span><strong>Quarterly Advance Tax Compliance Check:</strong> Section 234C timing verification protecting clients from interest notices.</span>
                </div>
              </div>

              <div className="pt-3 border-t border-amber-100">
                <button
                  onClick={() => handleLaunchApp('/insights-delivery')}
                  className="text-xs font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
                >
                  Explore Financial Eye-Opener & Insights →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS (4 STEPS WITH TINTED CHIPS) */}
      <section id="how-it-works" className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Simple 4-Step Lifecycle
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              From Client Invite to Year-Round Advisory
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              An intuitive end-to-end workflow designed for busy CA firms and their article assistants.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-xl bg-gradient-to-b from-blue-50/50 to-white border border-blue-200/80 space-y-2.5 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                01
              </div>
              <h3 className="text-sm font-bold text-slate-900">Onboard & Consent</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add taxpayer profile and dispatch a simulated WhatsApp invitation link. Consent logged with client IP and purpose limitation hash under DPDP guidelines.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-b from-indigo-50/50 to-white border border-indigo-200/80 space-y-2.5 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                02
              </div>
              <h3 className="text-sm font-bold text-slate-900">Dropzone Ingestion</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Drop Form 16, TRACES 26AS, AIS/TIS, and P&L files into designated vaults. OCR layout parser maps line items to visual coordinate bounding citations.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-b from-teal-50/50 to-white border border-teal-200/80 space-y-2.5 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                03
              </div>
              <h3 className="text-sm font-bold text-slate-900">Reconcile & Optimize</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Review automated 3-way matrix. Accept or resolve flagged interest or dividend discrepancies, then compare Old vs New tax regime slabs.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-b from-amber-50/50 to-white border border-amber-200/80 space-y-2.5 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                04
              </div>
              <h3 className="text-sm font-bold text-slate-900">Sign-Off & Eye-Opener</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Complete pre-filing checklist, approve with demo DSC digest, export CBDT ITR JSON, and dispatch the 2-Page Eye-Opener report via WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. 3-WAY RECONCILIATION HIGHLIGHT (SOFT TEAL/MINT TINT) */}
      <section id="reconciliation" className="py-16 md:py-24 bg-gradient-to-b from-teal-50/30 via-slate-50/40 to-[#FDFBF7] border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-900 bg-teal-100/70 px-3 py-1 rounded-full border border-teal-300">
                Eliminate Automated Notice Risks
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                3-Way Cross-Audit Matrix: Form 16 vs 26AS vs AIS
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Taxpayers routinely omit savings bank interest or fail to report small capital gains. When the Income Tax Department's portal cross-checks their return against AIS, an automated notice is issued.
              </p>
              <div className="space-y-2.5 text-xs text-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Catches SFT-005 bank interest absent from Form 16</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Flags SFT-017 mutual fund capital gains requiring ITR-2 upgrade</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Verifies employer TDS matches TRACES Form 26AS credits</span>
                </div>
              </div>
              <button
                onClick={() => handleLaunchApp('/tax-reconciliation')}
                className="px-4.5 py-2.5 text-xs font-bold rounded-lg bg-teal-700 hover:bg-teal-600 text-white flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <span>Test 3-Way Reconciliation Interactive Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reconciliation Table Preview Card */}
            <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-teal-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                <span className="font-bold text-slate-900">Reconciliation Matrix Demo (Client: Rahul S. DEMOP1234F)</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">2 Discrepancies Flagged</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600 text-[11px] bg-slate-50/50">
                      <th className="py-2 px-2 font-semibold">Income Head</th>
                      <th className="py-2 px-2 font-semibold">Form 16</th>
                      <th className="py-2 px-2 font-semibold">TRACES 26AS</th>
                      <th className="py-2 px-2 font-semibold">AIS / TIS</th>
                      <th className="py-2 px-2 font-semibold">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-mono text-[11px]">
                    <tr>
                      <td className="py-2.5 px-2 font-sans font-medium text-slate-900">Gross Salary (17(1))</td>
                      <td className="py-2.5 px-2">₹15,00,000</td>
                      <td className="py-2.5 px-2">₹15,00,000</td>
                      <td className="py-2.5 px-2">₹15,00,000</td>
                      <td className="py-2.5 px-2 text-emerald-700 font-semibold">₹0 (Matched)</td>
                    </tr>
                    <tr className="bg-amber-50/60">
                      <td className="py-2.5 px-2 font-sans font-bold text-amber-950">Savings Bank Interest</td>
                      <td className="py-2.5 px-2 text-slate-400">—</td>
                      <td className="py-2.5 px-2 text-slate-400">—</td>
                      <td className="py-2.5 px-2 text-amber-900 font-bold">₹46,000</td>
                      <td className="py-2.5 px-2 text-amber-800 font-bold">+₹46,000 Flagged</td>
                    </tr>
                    <tr className="bg-amber-50/60">
                      <td className="py-2.5 px-2 font-sans font-bold text-amber-950">Mutual Fund Capital Gains</td>
                      <td className="py-2.5 px-2 text-slate-400">—</td>
                      <td className="py-2.5 px-2 text-slate-400">—</td>
                      <td className="py-2.5 px-2 text-amber-900 font-bold">₹58,000</td>
                      <td className="py-2.5 px-2 text-amber-800 font-bold">Triggers ITR-2</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-2 font-sans font-medium text-slate-900">Chapter VI-A (80C/80D)</td>
                      <td className="py-2.5 px-2">₹1,75,000</td>
                      <td className="py-2.5 px-2 text-slate-400">—</td>
                      <td className="py-2.5 px-2">₹1,75,000</td>
                      <td className="py-2.5 px-2 text-emerald-700 font-semibold">₹0 (Matched)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 rounded-lg bg-teal-50/60 border border-teal-200/80 text-[11px] text-teal-950 flex items-center justify-between">
                <span>In the prototype, clicking <strong>"Accept & Add"</strong> adds ₹46,000 to Section 56(2) and recalculates tax.</span>
                <button
                  onClick={() => handleLaunchApp('/tax-reconciliation')}
                  className="px-2.5 py-1 rounded bg-teal-700 hover:bg-teal-600 text-white font-bold text-[10px]"
                >
                  Try in Prototype
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. 2-PAGE FINANCIAL EYE-OPENER (SOFT PURPLE & AMBER TINTS) */}
      <section id="eye-opener" className="py-16 md:py-24 bg-gradient-to-b from-purple-50/30 via-white to-amber-50/20 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900 bg-purple-100/70 px-3 py-1 rounded-full border border-purple-200">
              The Client Delivery Asset
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              The 2-Page Visual Financial Eye-Opener
            </h2>
            <p className="text-xs sm:text-sm text-slate-700">
              Instead of sending a dry, 15-page ITR acknowledgment PDF that clients never read, deliver an executive personal finance dossier that establishes your firm as their trusted financial advisor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Page 1 Summary */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/40 border border-indigo-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-900 uppercase tracking-wider text-[11px]">Dossier Page 1</span>
                <span className="px-2 py-0.5 rounded bg-white text-indigo-900 border border-indigo-200 text-[10px] font-semibold">Annual Snapshot</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Financial Position & Trajectory</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Derives annual earnings, true effective tax rate, savings ratio, and living expenses with visible formulas and zero guesswork.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white border border-indigo-100 shadow-2xs">
                  <div className="text-slate-500 text-[10px] uppercase font-semibold">Annual Earnings</div>
                  <div className="text-base font-bold text-slate-900 mt-1">₹16,08,200</div>
                  <div className="text-[10px] text-slate-500">Gross salary + interest + gains</div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-indigo-100 shadow-2xs">
                  <div className="text-slate-500 text-[10px] uppercase font-semibold">Derived Expenses</div>
                  <div className="text-base font-bold text-blue-700 mt-1">₹10,42,780</div>
                  <div className="text-[10px] text-slate-500">~₹86,898/month run-rate</div>
                </div>
              </div>
            </div>

            {/* Page 2 Summary */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50/60 via-white to-orange-50/40 border border-amber-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-950 uppercase tracking-wider text-[11px]">Dossier Page 2</span>
                <span className="px-2 py-0.5 rounded bg-white text-amber-900 border border-amber-200 text-[10px] font-semibold">Actionable Heuristics</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">3 Critical Wealth Opportunities</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Translates tax schedules into wealth opportunities that justify ongoing retainers and fee-based advisory.
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white border border-amber-100 shadow-2xs flex items-start gap-2">
                  <span className="font-bold text-amber-700">1.</span>
                  <div>
                    <strong className="text-slate-900">Section 80CCD(1B) NPS:</strong>
                    <span className="text-slate-700 ml-1">Up to ₹50,000 additional deduction saving ~₹10,400 in direct tax.</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-amber-100 shadow-2xs flex items-start gap-2">
                  <span className="font-bold text-amber-700">2.</span>
                  <div>
                    <strong className="text-slate-900">Idle Cash Sweep:</strong>
                    <span className="text-slate-700 ml-1">Assumed ~₹15.3L savings balance earning 3% could yield +₹61,333/yr in a 7% sweep FD.</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-amber-100 shadow-2xs flex items-start gap-2">
                  <span className="font-bold text-amber-700">3.</span>
                  <div>
                    <strong className="text-slate-900">Capital Gains Advance Tax:</strong>
                    <span className="text-slate-700 ml-1">Section 234C compliance check ensuring installment deadlines are met.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => handleLaunchApp('/insights-delivery')}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-purple-700 hover:bg-purple-600 text-white inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Preview & Print Sample 2-Page Eye-Opener Report</span>
            </button>
          </div>
        </div>
      </section>

      {/* 9. ADVISORY TIERS & RETAINERS (WARM GOLD, SILVER & PURPLE) */}
      <section id="for-ca-firms" className="py-16 md:py-24 bg-[#FAF7F2] border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
              Transform Your Practice
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Three Advisory Tiers for Your Clients
            </h2>
            <p className="text-xs sm:text-sm text-slate-700">
              Break free from the ₹1,500/return seasonal filing trap. Offer tiered client plans that produce predictable monthly recurring revenue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* SILVER */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-bold">Silver Tier</span>
                <h3 className="text-lg font-bold text-slate-900">Annual Filing + Eye-Opener</h3>
                <div className="text-2xl font-extrabold text-slate-900 font-mono">
                  ₹2,499 <span className="text-xs font-normal text-slate-500">/ return</span>
                </div>
                <p className="text-xs text-slate-600">
                  Ideal for salaried professionals seeking automated 3-way reconciliation and an executive personal financial snapshot.
                </p>
                <div className="space-y-2 pt-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    <span>Complete Form 16 & AIS Ingestion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    <span>3-Way Reconciliation Audit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    <span>2-Page Financial Eye-Opener</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleLaunchApp('/firm-clients')}
                className="w-full py-2 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
              >
                View Silver Clients in Demo
              </button>
            </div>

            {/* GOLD (HERO TIER - WARM HONEY / AMBER) */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-50 via-yellow-50/50 to-white border-2 border-amber-400 shadow-md space-y-4 flex flex-col justify-between relative">
              <div className="space-y-3">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-950 border border-amber-300 text-[11px] font-bold">
                  Gold Tier • Most Popular
                </span>
                <h3 className="text-lg font-bold text-slate-900">Quarterly Advance Tax Advisory</h3>
                <div className="text-2xl font-extrabold text-amber-950 font-mono">
                  ₹499 <span className="text-xs font-normal text-slate-600">/ month retainer</span>
                </div>
                <p className="text-xs text-slate-700">
                  For high-earners, traders, and Section 44ADA professionals needing advance tax calculation and capital gains harvesting.
                </p>
                <div className="space-y-2 pt-2 text-xs text-slate-800 font-medium">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>All Silver Tier Capabilities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Quarterly Section 234C Advance Tax</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Year-End Capital Gains Tax Harvesting</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleLaunchApp('/insights-delivery')}
                className="w-full py-2.5 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 transition-colors shadow-xs"
              >
                Inspect Gold Advisory Demo
              </button>
            </div>

            {/* PLATINUM (ROYAL LAVENDER / INDIGO) */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-purple-50/70 via-indigo-50/30 to-white border border-purple-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="px-2.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200 text-[11px] font-bold">
                  Platinum Tier
                </span>
                <h3 className="text-lg font-bold text-slate-900">SEBI RIA Wealth Advisory</h3>
                <div className="text-2xl font-extrabold text-slate-900 font-mono">
                  ₹1,499 <span className="text-xs font-normal text-slate-500">/ month</span>
                </div>
                <p className="text-xs text-slate-600">
                  For HNIs, family trusts, and business owners requiring comprehensive asset allocation and HUF structuring.
                </p>
                <div className="space-y-2 pt-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                    <span>All Silver & Gold Deliverables</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                    <span>Multi-Entity Family Portfolio Audit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                    <span>HUF Setup & Section 56 Structuring</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleLaunchApp('/firm-clients')}
                className="w-full py-2 text-xs font-bold rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 transition-colors"
              >
                View Platinum Entities in Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 10. INSTITUTIONAL SECURITY & DPDP PILLARS */}
      <section id="security" className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Institutional Trust & DPDP Concepts
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Engineered for Chartered Trust
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Tax data contains sensitive financial records. Our architecture strictly respects compliance and privacy boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-xl bg-blue-50/50 border border-blue-200/80 space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shadow-2xs">
                <Cpu className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Deterministic Arithmetic</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generative AI models never calculate tax numbers. Slabs, rebates, and cess are computed via 100% hardcoded statutory rules.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shadow-2xs">
                <Award className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Mandatory CA Approval</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The platform never automatically files a return. Human-in-the-loop review by an ICAI partner is strictly required prior to JSON creation.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">DPDP Consent Model</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Digital notice and consent lifecycle tracking. Every client authorization records timestamp, purpose limitation, and verified client IP.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-purple-50/50 border border-purple-200/80 space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shadow-2xs">
                <Lock className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Simulated Ephemeral RAM</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Architectural concept for ephemeral RAM processing: documents are decrypted, parsed into structured vectors, and destroyed without persistent disk exposure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. BOTTOM CTA (WARM & WELCOMING TINTS) */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-blue-50 via-indigo-50/60 to-amber-50/80 border-b border-amber-200/60 text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-blue-900 font-bold text-xs uppercase tracking-wider border border-blue-200 shadow-2xs">
            Interactive Prototype Ready
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ready to Explore CA Bharat AI?
          </h2>

          <p className="text-xs sm:text-sm text-slate-700">
            Test the live frontend prototype now. All four modules are pre-configured with fictional Indian taxpayer cases, simulated AI OCR, and Old vs New regime calculations.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => handleLaunchApp('/dashboard')}
              className="w-full sm:w-auto px-6 py-3.5 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-600"
            >
              <span>Get Started — Enter Mission Control</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleLaunchApp('/firm-clients')}
              className="w-full sm:w-auto px-5 py-3.5 text-xs font-semibold rounded-xl text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              View Client Directory (7)
            </button>
          </div>

          <p className="text-[11px] text-slate-600 pt-1">
            No signup required • Runs entirely in your browser with LocalStorage persistence
          </p>
        </div>
      </section>

      {/* 12. CLEAN FOOTER (WARM SLATE/SAND) */}
      <footer className="bg-[#FAF7F2] py-10 px-4 sm:px-6 lg:px-10 text-xs text-slate-600 border-t border-slate-200">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-slate-200">
          <div className="space-y-2 md:col-span-1">
            <Logo size="md" theme="light" />
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Chartered Tax & Wealth Intelligence platform for Indian CA practices.
            </p>
            <div className="text-[11px] text-slate-500 font-mono">
              Fictional Demo Firm: Sharma & Co. CA (FRN: DEMO012984N)
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 text-xs mb-2">Modules</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><button onClick={() => handleLaunchApp('/dashboard')} className="hover:text-blue-700 cursor-pointer">Mission Control Dashboard</button></li>
              <li><button onClick={() => handleLaunchApp('/firm-clients')} className="hover:text-blue-700 cursor-pointer">Module 1: Firm & Client Operations</button></li>
              <li><button onClick={() => handleLaunchApp('/document-intelligence')} className="hover:text-blue-700 cursor-pointer">Module 2: Document Intelligence</button></li>
              <li><button onClick={() => handleLaunchApp('/tax-reconciliation')} className="hover:text-blue-700 cursor-pointer">Module 3: Tax & Reconciliation</button></li>
              <li><button onClick={() => handleLaunchApp('/insights-delivery')} className="hover:text-blue-700 cursor-pointer">Module 4: Insights & Client Delivery</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 text-xs mb-2">Engines</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>Finance Act 2024 Slabs</li>
              <li>Section 115BAC New Regime Optimizer</li>
              <li>3-Way Cross-Reconciliation (AIS vs 26AS)</li>
              <li>2-Page Financial Eye-Opener</li>
              <li>CBDT ITR JSON Schema Generator</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 text-xs mb-2">Compliance</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><button onClick={() => handleLaunchApp('/help')} className="hover:text-blue-700 cursor-pointer">Help & DPDP Guide</button></li>
              <li><button onClick={() => handleLaunchApp('/settings')} className="hover:text-blue-700 cursor-pointer">Firm Settings</button></li>
              <li>Zero LLM Math Mandate</li>
              <li>ICAI Professional Standards</li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <div>
            © 2026 CA Bharat AI. Built for India. Prototype Demonstration.
          </div>
          <div className="text-center sm:text-right">
            Disclaimer: CA Bharat AI is a frontend prototype. All calculations are sample demonstrations requiring CA certification.
          </div>
        </div>
      </footer>
    </div>
  )
}
