import React from 'react'
import {
  Layers,
  Search,
  Sparkles,
  ShieldCheck,
  Building,
  ExternalLink,
  Command,
} from 'lucide-react'
import { LogoMark } from '../common/Logo'

export default function Navbar({
  onOpenSearch,
  onOpenSimulator,
  displayMode = 'simple',
  onToggleDisplayMode,
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <a href="#overview" className="flex items-center gap-3 group shrink-0">
          <LogoMark size={38} className="group-hover:scale-105 transition-transform" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                CA Bharat
              </span>
              <span className="text-amber-700 font-extrabold text-base sm:text-lg">AI</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono text-[9px] font-bold border border-slate-200">
                PROTOTYPE
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium tracking-tight -mt-0.5">
              Chartered Tax & Wealth Intelligence
            </p>
          </div>
        </a>

        {/* View Mode Switcher: Simple vs Technical */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => onToggleDisplayMode && onToggleDisplayMode('simple')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              displayMode === 'simple'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Simple Overview</span>
            <span className="sm:hidden">Simple</span>
          </button>
          <button
            onClick={() => onToggleDisplayMode && onToggleDisplayMode('technical')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              displayMode === 'technical'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Full 33-Step Spec</span>
            <span className="sm:hidden">33-Step</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 text-xs font-medium border border-slate-200 transition-all shadow-2xs cursor-pointer"
            title="Search workflow steps, modules, controls (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-white text-slate-500 text-[10px] font-mono font-semibold border border-slate-200">
              Ctrl K
            </kbd>
          </button>

          {/* App Workspace Link */}
          <a
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 transition-all"
            title="Open CA Workspace Application"
          >
            <Building className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline">CA Workspace</span>
          </a>

          {/* Launch Simulator CTA */}
          <button
            onClick={onOpenSimulator}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all hover:shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Try Simulator</span>
          </button>
        </div>
      </div>
    </header>
  )
}
