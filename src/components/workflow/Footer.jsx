import React from 'react'
import {
  ShieldCheck,
  Building,
  Lock,
  FileCheck,
  ExternalLink,
  ChevronUp,
} from 'lucide-react'

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Top Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center font-mono">
                CA
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">
                CA Bharat AI
              </span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                End-to-End Workflow Baseline
              </span>
            </div>

            <p className="text-slate-400 leading-relaxed max-w-md text-xs">
              The CA-led Indian tax workflow automation and continuous personal wealth advisory platform. Built on the core principle: <strong className="text-slate-200">AI + Approved Tax Rules + Human CA Approval</strong>.
            </p>

            <div className="pt-2 flex items-center gap-3 text-slate-400 font-mono text-[11px]">
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">Sharma & Co. Chartered Accountants</span>
              <span>FRN: DEMO012984N</span>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
              Workflow Architecture
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <a href="#overview" className="hover:text-amber-400 transition-colors">
                  Overview & Operating Principle
                </a>
              </li>
              <li>
                <a href="#workflow-stages" className="hover:text-amber-400 transition-colors">
                  The 7 Stages (Steps 01 – 33)
                </a>
              </li>
              <li>
                <a href="#simulator" className="hover:text-amber-400 transition-colors">
                  Interactive Stage Simulator
                </a>
              </li>
              <li>
                <a href="#modules" className="hover:text-amber-400 transition-colors">
                  The 12 Developer Modules
                </a>
              </li>
              <li>
                <a href="#controls" className="hover:text-amber-400 transition-colors">
                  8 Platform Governance Controls
                </a>
              </li>
              <li>
                <a href="#roadmap" className="hover:text-amber-400 transition-colors">
                  Roadmap (MVP to Agentic AI)
                </a>
              </li>
            </ul>
          </div>

          {/* Statutory Disclaimers */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
              Compliance & Retention
            </h4>
            <div className="space-y-2 text-[11px] text-slate-400 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <p>
                <strong className="text-slate-300">DPDP Act 2023:</strong> Purpose-limited client consent, encrypted in-memory processing, zero unencrypted disk leakage.
              </p>
              <p>
                <strong className="text-slate-300">IT Act Section 149:</strong> 8-year statutory case retention and immutable append-only audit trail.
              </p>
              <p>
                <strong className="text-slate-300">ICAI Standards:</strong> Human CA approval is mandatory prior to any filing or client report delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} CA Bharat AI Platform. All rights reserved. For demonstration and workflow visualization purposes.
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <span>Back to top</span>
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  )
}
