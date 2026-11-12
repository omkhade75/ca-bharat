import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FileCheck2,
  Scale,
  Sparkles,
  Settings,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  Building2,
  X,
  Globe
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Logo from '../common/Logo'

export default function Sidebar({ isMobileOpen = false, onCloseMobile = () => {} }) {
  const { clients, activeClient, setActiveClientId, firmDetails } = useApp()

  const navItems = [
    {
      to: '/dashboard',
      label: 'Mission Control',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/firm-clients',
      label: 'Firm & Clients',
      icon: Users,
      badge: `${clients.length}`,
      badgeVariant: 'neutral',
    },
    {
      to: '/document-intelligence',
      label: 'Document Vault',
      icon: FileCheck2,
      badge: 'AI OCR',
      badgeVariant: 'azure',
    },
    {
      to: '/tax-reconciliation',
      label: 'Tax & Reconciliation',
      icon: Scale,
      badge: activeClient?.discrepancyCount > 0 ? `${activeClient.discrepancyCount} Flagged` : null,
      badgeVariant: 'warning',
    },
    {
      to: '/insights-delivery',
      label: 'Insights & Advisory',
      icon: Sparkles,
      badge: 'Engine 2',
      badgeVariant: 'gold',
    },
  ]

  const secondaryNavItems = [
    {
      to: '/settings',
      label: 'Firm Settings',
      icon: Settings,
    },
    {
      to: '/help',
      label: 'Help & Compliance',
      icon: HelpCircle,
    },
    {
      to: '/',
      label: 'Public Landing Page',
      icon: Globe,
    },
  ]

  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      onCloseMobile()
    }
  }

  const sidebarContent = (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <Logo size="md" theme="dark" />

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Operating Motto */}
        <div className="mt-3 px-2.5 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700/60 text-[10.5px] text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="italic font-medium text-slate-300 truncate">"File better. Advise all year."</span>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            PROTOTYPE
          </span>
        </div>
      </div>

      {/* Active Client Selector Dropdown */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-950/40">
        <label className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase block mb-1">
          Active Taxpayer Context
        </label>
        <div className="relative">
          <select
            value={activeClient?.id || ''}
            onChange={(e) => setActiveClientId(e.target.value)}
            className="w-full bg-slate-800 text-slate-100 text-xs rounded-lg px-2.5 py-2 border border-slate-700 hover:border-slate-600 focus:outline-hidden focus:ring-1 focus:ring-amber-500 transition-colors appearance-none cursor-pointer pr-7 font-medium truncate"
          >
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} ({client.pan}) — {client.activeAY}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
        </div>
        {activeClient && (
          <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-400">
            <span className="truncate">{activeClient.category.split(' - ')[0]}</span>
            <span className={`font-semibold ${activeClient.discrepancyCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {activeClient.discrepancyCount > 0 ? `${activeClient.discrepancyCount} Mismatch` : 'Reconciled ✓'}
            </span>
          </div>
        )}
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
          Core Workflows
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-sm shadow-blue-500/20 font-semibold border-l-2 border-amber-400'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    item.badgeVariant === 'warning'
                      ? 'bg-rose-400/20 text-rose-300 border border-rose-400/30'
                      : item.badgeVariant === 'gold'
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                      : item.badgeVariant === 'azure'
                      ? 'bg-sky-400/20 text-sky-300 border border-sky-400/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          )
        })}

        <div className="pt-4 px-2 py-1 text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
          Administration
        </div>
        {secondaryNavItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-semibold border-l-2 border-amber-400'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Firm Profile Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-100 truncate">{firmDetails.firmName}</p>
            <p className="text-[11px] text-slate-400 truncate">FRN: {firmDetails.registrationNo}</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
