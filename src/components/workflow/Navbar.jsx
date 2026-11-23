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
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-xs group-hover:border-amber-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6">
              <path
                d="M 24 5 L 39 10.5 C 39.8 10.8 40.5 11.6 40.5 12.5 C 40.5 24.5 33.5 35 24.5 42.5 C 24.2 42.7 23.8 42.7 23.5 42.5 C 14.5 35 7.5 24.5 7.5 12.5 C 7.5 11.6 8.2 10.8 9 10.5 L 24 5 Z"
                fill="#0B132B"
                stroke="#F59E0B"
                strokeWidth="2"
              />
              <path
                d="M 15 17.5 C 15 16.1 16.1 15 17.5 15 L 18.5 15 C 19.9 15 21 16.1 21 17.5 L 21 30.5 C 21 31.9 19.9 33 18.5 33 L 17.5 33 C 16.1 33 15 31.9 15 30.5 Z"
                fill="#F59E0B"
              />
              <path
                d="M 27 17.5 C 27 16.1 28.1 15 29.5 15 L 30.5 15 C 31.9 15 33 16.1 33 17.5 L 33 30.5 C 33 31.9 31.9 33 30.5 33 L 29.5 33 C 28.1 33 27 31.9 27 30.5 Z"
                fill="#38BDF8"
              />
              <path d="M 18.5 23 L 29.5 23" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
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
