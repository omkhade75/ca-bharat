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
  Check,
  AlertCircle,
  HelpCircle,
  UserCheck,
  FolderUp,
  FileSearch,
  CheckSquare,
  FileCode,
  LineChart
} from 'lucide-react'
import Logo from '../../common/Logo'

export default function LandingPage() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLaunchApp = (path = '/dashboard') => {
    navigate(path)
  }

  // 10-Stage Lifecycle Workflow Journey
  const workflowSteps = [
    { num: '01', title: 'Client Onboarding', desc: 'Capture taxpayer master profile & PAN category', icon: UserCheck },
    { num: '02', title: 'Consent Workflow', desc: 'Simulated DPDP notice & digital authorization', icon: ShieldCheck },
    { num: '03', title: 'Document Upload', desc: 'Form 16, TRACES 26AS, AIS/TIS & P&L dropzones', icon: FolderUp },
    { num: '04', title: 'AI Extraction', desc: 'Simulated OCR with coordinate bounding citations', icon: FileSearch },
    { num: '05', title: 'Data Validation', desc: 'Cross-document format & missing schedule checks', icon: CheckSquare },
    { num: '06', title: 'Reconciliation', desc: '3-way audit matrix detecting potential mismatches', icon: Scale },
    { num: '07', title: 'Tax Calculation', desc: 'Sample deterministic Old vs New regime optimizer', icon: Cpu },
    { num: '08', title: 'Human CA Review', desc: 'ICAI-aligned pre-filing checklist & demo sign-off', icon: Award },
    { num: '09', title: 'Filing-Ready Output', desc: 'Sample CBDT-compatible ITR JSON schema export', icon: FileCode },
    { num: '10', title: 'Financial Insights', desc: '2-page Visual Eye-Opener & wealth heuristics', icon: LineChart },
  ]

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 font-sans selection:bg-amber-200 selection:text-amber-950">
      {/* 1. TOP ANNOUNCEMENT TICKER (PROTOTYPE TRANSPARENCY) */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-100/70 border-b border-amber-200/80 text-xs py-2 px-4 text-center text-amber-950 flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white text-amber-900 font-bold text-[11px] border border-amber-300 shadow-2xs">
          Frontend Prototype Demonstration
        </span>
        <span className="hidden sm:inline text-amber-300">•</span>
        <span className="text-amber-950 font-medium">
          CA-Led Tax Workflow Automation & Personal Finance Intelligence • Sample Finance Act 2024 Computations
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
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-700">
            <a href="#engines" className="hover:text-blue-700 transition-colors">The Two Engines</a>
            <a href="#workflow" className="hover:text-blue-700 transition-colors">10-Step Journey</a>
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
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              10-Step Workflow Journey
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

      {/* 3. HERO SECTION (PRODUCT VISION & ALIGNMENT) */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-amber-200/50 bg-gradient-to-b from-amber-50/60 via-[#FDFBF7] to-blue-50/40">
        <div className="absolute top-6 left-1/4 w-80 h-80 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-12 right-1/4 w-80 h-80 bg-blue-200/25 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          {/* Category Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-xs border border-amber-200 text-slate-800 text-xs shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="font-bold text-slate-900">CA-Led Tax Workflow & Personal Finance Platform</span>
            <span className="text-amber-400">|</span>
            <span className="text-amber-900 font-semibold">AY 2025-26 Prototype</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            The CA-Led Tax Workflow & Personal Finance Platform for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-800 via-indigo-700 to-blue-900">
              India
            </span>
          </h1>

          {/* Sub-headline: Product Vision */}
          <p className="text-base sm:text-lg text-slate-700 font-normal leading-relaxed max-w-2xl mx-auto">
            <strong className="text-slate-900 font-semibold">"File better. Advise all year."</strong> Transform seasonal ITR compliance into the natural entry point for continuous personal wealth advisory. Two connected engines powered by AI-assisted document intake, 3-way reconciliation (Form 16 vs 26AS vs AIS), deterministic tax computations, and mandatory Chartered Accountant supervision.
          </p>

          {/* Action Buttons */}
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

          {/* 4 Accurately Labeled Trust Badges */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left max-w-4xl mx-auto">
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span>Deterministic Rules</span>
              </div>
              <p className="text-[11px] text-blue-800 mt-1">Sample rule-based math conforming to Finance Act 2024 principles; zero LLM arithmetic</p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Consent Concept</span>
              </div>
              <p className="text-[11px] text-amber-800 mt-1">Demonstrates DPDP notice lifecycle, purpose limitation & simulated sandbox IP tokens</p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Mandatory CA Approval</span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-1">Human-in-the-loop review aligned with ICAI standards; simulated DSC sign-off gateway</p>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-950">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                <span>Filing Export Demo</span>
              </div>
              <p className="text-[11px] text-purple-800 mt-1">Generates sample filing-ready ITR-1, ITR-2 & ITR-4 JSON schemas (no live government connection)</p>
            </div>
          </div>
        </div>

        {/* 4. LIGHT INTERACTIVE HERO PREVIEW CARD */}
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

            {/* Three Cards Inside Preview */}
            <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gradient-to-b from-slate-50/80 to-[#FAF8F5]">
              {/* Card 1 */}
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
                  Automatically aligns Form 16 Part A/B against TRACES Form 26AS and AIS/TIS. Flags unreported savings interest and capital gains for CA review.
                </p>
                <div className="p-2 rounded-lg bg-white/90 border border-teal-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-600 text-[11px] font-medium">Discrepancy Check:</span>
                  <span className="text-teal-800 font-bold text-[11px]">2 Items Identified for Review ✓</span>
                </div>
              </div>

              {/* Card 2 */}
              <div
                onClick={() => handleLaunchApp('/tax-reconciliation')}
                className="p-4.5 rounded-xl bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 border border-amber-200 hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer group space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300">
                    Sample Calculation
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-700 group-hover:text-amber-900 transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-900 transition-colors">
                  Deterministic Regime Optimizer
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Side-by-side sample computation under Old Regime vs Section 115BAC New Regime with standard deduction & rebate. Requires CA validation.
                </p>
                <div className="p-2 rounded-lg bg-white/90 border border-amber-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-600 text-[11px] font-medium">Sample Outcome:</span>
                  <span className="text-emerald-700 font-bold text-[11px]">New Regime saves ₹28,600</span>
                </div>
              </div>

              {/* Card 3 */}
              <div
                onClick={() => handleLaunchApp('/insights-delivery')}
                className="p-4.5 rounded-xl bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/40 border border-purple-200 hover:border-purple-400 hover:shadow-xs transition-all cursor-pointer group space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 bg-purple-100/70 px-2 py-0.5 rounded border border-purple-300">
                    Engine 2 • Wealth Insights
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-purple-700 group-hover:text-purple-900 transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-900 transition-colors">
                  2-Page Financial Eye-Opener
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The client delivery report accompanying return summaries: derived living expenses, effective tax rate, and idle cash heuristics for CA-led advisory.
                </p>
                <div className="p-2 rounded-lg bg-white/90 border border-purple-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-600 text-[11px] font-medium">Sample Retainer:</span>
                  <span className="text-purple-800 font-bold text-[11px]">Illustrative ₹499/mo Model</span>
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

      {/* 5. THE TWO CONNECTED ENGINES (DETAILED SYSTEMIC EXPLANATION) */}
      <section id="engines" className="py-16 md:py-24 bg-gradient-to-b from-blue-50/30 via-slate-50/50 to-amber-50/30 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 bg-blue-100/70 px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
              The Two Connected Engines
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              From Seasonal ITR Filing to Ongoing Client Advisory
            </h2>
            <p className="text-xs sm:text-sm text-slate-700">
              Tax compliance serves as the natural entry point. CA Bharat AI links tax preparation directly into year-round financial insight with strict human CA supervision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ENGINE 1: ITR PREPARATION & TAX WORKFLOW AUTOMATION */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-blue-50/80 via-white to-slate-50 border border-blue-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-700 shadow-2xs">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-100/80 text-blue-900 border border-blue-200 text-[11px] font-bold">
                  Engine 1: ITR Preparation
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">Tax Workflow Automation</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Streamlines document intake, extraction, cross-validation, 3-way reconciliation, tax calculation, and human CA sign-off.
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <span><strong>Document Intake:</strong> Dropzones for Form 16 (Part A & B), TRACES Form 26AS, AIS/TIS, and Broker Capital Gains P&L.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <span><strong>Simulated OCR Extraction:</strong> Visual coordinate bounding citations link extracted fields back to source document pages for rapid CA inspection.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <span><strong>Cross-Document Validation:</strong> Automated format checks and schedule mismatch alerts identify reporting gaps before filing.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <span><strong>3-Way Reconciliation Matrix:</strong> Cross-checks employer Form 16 against CBDT TRACES 26AS and AIS/TIS to catch unreported income.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <span><strong>Deterministic Tax Engine:</strong> Sample mathematical comparison of Old vs New Regime slabs u/s 115BAC (Finance Act 2024 principles) requiring CA verification.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <span><strong>Mandatory CA Review & Sign-Off:</strong> Pre-filing verification checklist and demonstration DSC hash generation before exporting filing-ready JSON.</span>
                </div>
              </div>

              <div className="pt-3 border-t border-blue-100">
                <button
                  onClick={() => handleLaunchApp('/document-intelligence')}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                >
                  Explore Document Vault & OCR Demo →
                </button>
              </div>
            </div>

            {/* ENGINE 2: PERSONAL FINANCE INSIGHT & ADVISORY */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-orange-50/30 border border-amber-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shadow-2xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-100/80 text-amber-950 border border-amber-300 text-[11px] font-bold">
                  Engine 2: Personal Finance Insight
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">Personal Finance Intelligence</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Derives annual financial snapshots, savings analysis, and health indicators for continuous, professionally authorised advisory.
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span><strong>Annual Financial Snapshot:</strong> Consolidated annual overview of earnings, direct taxes deposited, savings, and net wealth indicators.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span><strong>Income & Savings Analysis:</strong> Transparent living expenses formula: <code className="bg-amber-100/60 px-1 py-0.5 rounded text-amber-950 font-mono text-[11px]">Gross Inflow − Taxes − Documented Savings</code>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span><strong>Section 80CCD(1B) NPS Opportunity:</strong> Illustrative tax-saving planning heuristic subject to applicable tax regime selection and CA review.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span><strong>Idle Cash Sweep Modeling:</strong> Estimates low-yield savings balance and models potential additional interest in 7% auto-sweep deposits.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span><strong>Section 234C Advance Tax Checks:</strong> Compliance timing verification on realized capital gains protecting clients from automated interest notices.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span><strong>CA-Led Advisory Delivery:</strong> All wealth suggestions are illustrative heuristics designed for Chartered Accountant authorization—never autonomous AI decisions.</span>
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

      {/* 6. COMPLETE 10-STAGE WORKFLOW JOURNEY */}
      <section id="workflow" className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              End-to-End CA Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              The Complete 10-Stage Advisory Journey
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              From client intake and simulated consent to filing-ready schema exports and financial insights.
            </p>
          </div>

          {/* 10 Workflow Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {workflowSteps.map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.num}
                  className="p-4 rounded-xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/90 shadow-2xs space-y-2 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center">
                      {step.num}
                    </span>
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">{step.title}</h3>
                  <p className="text-[11px] text-slate-600 leading-snug">{step.desc}</p>
                </div>
              )
            })}
          </div>

          {/* Important Workflow Disclaimer */}
          <div className="mt-8 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-xs text-amber-950 flex items-start gap-2.5 max-w-3xl mx-auto">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Prototype Demonstration Boundary:</strong> This frontend prototype demonstrates the complete workflow sequence and exports sample filing schemas. It does not perform actual government e-filing or establish live connections with the CBDT Income Tax Portal.
            </p>
          </div>
        </div>
      </section>

      {/* 7. 3-WAY RECONCILIATION HIGHLIGHT (DISCREPANCY IDENTIFICATION) */}
      <section id="reconciliation" className="py-16 md:py-24 bg-gradient-to-b from-teal-50/30 via-slate-50/40 to-[#FDFBF7] border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-900 bg-teal-100/70 px-3 py-1 rounded-full border border-teal-300">
                Identify Potential Discrepancies
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                3-Way Cross-Audit Matrix: Form 16 vs 26AS vs AIS
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Taxpayers routinely omit savings bank interest or overlook small mutual fund capital gains. The reconciliation engine cross-references these reporting streams, helping the CA identify potential variances before return submission.
              </p>
              <div className="space-y-2.5 text-xs text-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Identifies SFT-005 bank interest absent from Form 16</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Flags SFT-017 mutual fund capital gains requiring ITR-2 upgrade</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Verifies employer TDS matches TRACES Form 26AS ledger credits</span>
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
                <span>In the prototype, clicking <strong>"Accept & Add"</strong> adds ₹46,000 to Section 56(2) and recalculates sample tax.</span>
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

      {/* 8. 2-PAGE FINANCIAL EYE-OPENER (SAMPLE ADVISORY ASSET) */}
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
                    <span className="text-slate-700 ml-1">Up to ₹50,000 additional deduction saving ~₹10,400 in direct tax (Old Regime).</span>
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

      {/* 9. ADVISORY TIERS & RETAINER CONCEPTS (ACCURATELY QUALIFIED) */}
      <section id="for-ca-firms" className="py-16 md:py-24 bg-[#FAF7F2] border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
              Advisory Tier Concepts
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Three Advisory Tiers for Your Practice
            </h2>
            <p className="text-xs sm:text-sm text-slate-700">
              Sample firm retainer concepts demonstrating how tax compliance links directly to continuous, CA-authorized personal finance advisory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* SILVER: ANNUAL FINANCIAL OVERVIEW */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-bold">Silver Tier</span>
                <h3 className="text-lg font-bold text-slate-900">Annual Financial Overview</h3>
                <div className="text-2xl font-extrabold text-slate-900 font-mono">
                  ₹2,499* <span className="text-xs font-normal text-slate-500">/ return (Illustrative)</span>
                </div>
                <p className="text-xs text-slate-600">
                  Annual compliance engagement delivering filing-ready schema exports and the 2-Page Visual Financial Eye-Opener snapshot.
                </p>
                <div className="space-y-2 pt-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    <span>Complete Form 16 & AIS Ingestion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    <span>3-Way Reconciliation Matrix Audit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    <span>Annual Financial Eye-Opener Snapshot</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    <span>CA Partner Certified Review</span>
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

            {/* GOLD: MONTHLY CASH-FLOW & ADVANCE TAX ADVISORY */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-50 via-yellow-50/50 to-white border-2 border-amber-400 shadow-md space-y-4 flex flex-col justify-between relative">
              <div className="space-y-3">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-950 border border-amber-300 text-[11px] font-bold">
                  Gold Tier • Monthly Advisory
                </span>
                <h3 className="text-lg font-bold text-slate-900">Cash-Flow & Advance Tax</h3>
                <div className="text-2xl font-extrabold text-amber-950 font-mono">
                  ₹499* <span className="text-xs font-normal text-slate-600">/ month retainer (Sample)</span>
                </div>
                <p className="text-xs text-slate-700">
                  Consent-based ongoing engagement providing monthly cash-flow tracking, advance tax timing checks, and quarterly CA reviews.
                </p>
                <div className="space-y-2 pt-2 text-xs text-slate-800 font-medium">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>All Silver Tier Deliverables</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Quarterly Section 234C Advance Tax Runs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Monthly Cash-Flow Health Monitoring</span>
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

            {/* PLATINUM: CONNECTED WEALTH & AUTHORIZED ADVISORY */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-purple-50/70 via-indigo-50/30 to-white border border-purple-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="px-2.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200 text-[11px] font-bold">
                  Platinum Tier • Wealth Advisory
                </span>
                <h3 className="text-lg font-bold text-slate-900">Connected Wealth Guidance</h3>
                <div className="text-2xl font-extrabold text-slate-900 font-mono">
                  ₹1,499* <span className="text-xs font-normal text-slate-500">/ month (Sample)</span>
                </div>
                <p className="text-xs text-slate-600">
                  Comprehensive wealth information tracking and professionally authorized advisory for HNIs, family offices, and business owners.
                </p>
                <div className="space-y-2 pt-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                    <span>All Silver & Gold Deliverables</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                    <span>Multi-Entity Family Portfolio Overview</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                    <span>Professionally Authorized Guidance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                    <span>HUF Structuring & Section 56 Planning</span>
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

          <p className="text-[11px] text-slate-500 text-center mt-4">
            *Note: All pricing figures are sample concepts for prototype evaluation only. Final firm engagement fees are subject to CA firm discretion and product owner confirmation.
          </p>
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

      {/* 11. PROTOTYPE TRANSPARENCY NOTICE SECTION */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-950 uppercase tracking-wide">
              <HelpCircle className="w-4 h-4 text-amber-800" />
              <span>Frontend Prototype Transparency & Disclosure Notice</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-amber-950 leading-relaxed">
              <div>
                <strong>Simulated OCR & Extraction:</strong> Document parsing uses simulated bounding coordinates and pre-loaded test schemas.
              </div>
              <div>
                <strong>Sample Tax Calculations:</strong> Slab comparisons follow Finance Act 2024 principles and require certified CA validation.
              </div>
              <div>
                <strong>Simulated CA Sign-Off:</strong> Approvals generate demonstration SHA-256 digests; they are not certified legal digital signatures (DSC).
              </div>
              <div>
                <strong>Fictional Demo Data:</strong> All taxpayer identities, PANs, and employer entities are fictional demonstration records.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12. BOTTOM CTA */}
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

      {/* 13. CLEAN FOOTER */}
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
              <li>Finance Act 2024 Slabs (Sample)</li>
              <li>Section 115BAC New Regime Optimizer</li>
              <li>3-Way Cross-Reconciliation Matrix</li>
              <li>2-Page Financial Eye-Opener Report</li>
              <li>Sample CBDT ITR JSON Schema Export</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 text-xs mb-2">Compliance & Ethics</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><button onClick={() => handleLaunchApp('/help')} className="hover:text-blue-700 cursor-pointer">Help & DPDP Guide</button></li>
              <li><button onClick={() => handleLaunchApp('/settings')} className="hover:text-blue-700 cursor-pointer">Firm Settings</button></li>
              <li>Zero LLM Math Mandate</li>
              <li>Human CA Approval Requirement</li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <div>
            © 2026 CA Bharat AI. Built for India. Prototype Demonstration.
          </div>
          <div className="text-center sm:text-right">
            Disclaimer: CA Bharat AI is a frontend prototype. All calculations are sample demonstrations requiring CA certification. Does not perform live CBDT portal filing.
          </div>
        </div>
      </footer>
    </div>
  )
}
