import React, { useState, useRef, useEffect } from 'react'
import {
  Search,
  Bell,
  Calendar,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  Menu
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatINR } from '../../utils/formatters'
import { LogoMark } from '../common/Logo'

export default function Topbar({ onToggleMobileMenu = () => {} }) {
  const {
    activeAy,
    setActiveAy,
    globalSearch,
    setGlobalSearch,
    notifications,
    setNotifications,
    resetAllDataToDemo,
    clients,
  } = useApp()

  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [resetFeedback, setResetFeedback] = useState(false)

  const notifRef = useRef(null)
  const userMenuRef = useRef(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleReset = () => {
    if (window.confirm('Reset all demo data (clients, cases, reconciliation items) to default initial state?')) {
      resetAllDataToDemo()
      setResetFeedback(true)
      setTimeout(() => setResetFeedback(false), 2000)
    }
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Left: Mobile Toggle, Brand on Mobile, Global Search & FY Selector */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Mobile menu button */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Icon on Mobile (when sidebar is hidden) */}
        <div className="flex md:hidden items-center gap-2 mr-1">
          <LogoMark size={28} />
          <span className="font-bold text-sm text-slate-900 tracking-tight">CA Bharat</span>
        </div>

        {/* Global Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clients by name, PAN, mobile or case ID..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg pl-9 pr-4 py-2 border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
          />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Assessment Year Selector */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100/80 rounded-lg p-1 border border-slate-200 shrink-0 transition-colors">
          <Calendar className="w-3.5 h-3.5 text-amber-600 ml-1.5" />
          <select
            value={activeAy}
            onChange={(e) => setActiveAy(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-700 pr-2 py-0.5 focus:outline-hidden cursor-pointer"
          >
            <option value="AY 2025-26">AY 2025-26 (FY 24-25)</option>
            <option value="AY 2024-25">AY 2024-25 (FY 23-24)</option>
            <option value="AY 2023-24">AY 2023-24 (FY 22-23)</option>
          </select>
        </div>
      </div>

      {/* Right: Quick Stats, Reset Demo, Notifications, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Prototype Demo Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0B132B]/5 border border-amber-500/30 text-[10.5px] text-slate-800 font-semibold tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span>Prototype Demo • Simulated Data</span>
        </div>

        {/* Illustrative Refunds Stat Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-800 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Sample Refunds:</span>
          <span className="font-bold text-emerald-900 font-mono">
            {formatINR(clients.reduce((acc, c) => acc + (c.refundExpected || 0), 0), { compact: true })}
          </span>
        </div>

        {/* Reset Demo Data Button */}
        <button
          onClick={handleReset}
          title="Reset sample data back to initial state"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
        >
          <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${resetFeedback ? 'animate-spin text-blue-600' : ''}`} />
          <span className="hidden sm:inline">{resetFeedback ? 'Resetting...' : 'Reset Demo'}</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Alerts & Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No new notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 text-xs hover:bg-slate-50 transition-colors ${
                        !notif.read ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {notif.type === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        ) : notif.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{notif.title}</p>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{notif.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{notif.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User / CA Partner Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
          >
            <div className="w-7 h-7 rounded-full bg-[#0B132B] text-amber-400 border border-amber-400/40 flex items-center justify-center text-xs font-bold shadow-xs">
              RS
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">CA Rajesh Sharma</p>
              <p className="text-[10px] text-slate-500 leading-tight">Partner • FCA #DEMO049281</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-900">CA Rajesh Sharma (Demo)</p>
                <p className="text-[11px] text-slate-500">rajesh.demo@example.com</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] bg-amber-50 text-amber-800 border border-amber-200/80 font-medium rounded">
                  FCA #DEMO049281 • Prototype Demo
                </span>
              </div>
              <div className="py-1">
                <div className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 flex items-center justify-between cursor-pointer">
                  <span>Current Firm:</span>
                  <span className="font-semibold text-slate-800">Sharma & Co.</span>
                </div>
                <div className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 flex items-center justify-between cursor-pointer">
                  <span>Active Role:</span>
                  <span className="font-semibold text-emerald-700">CA Partner (Sign-Off)</span>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    handleReset()
                    setShowUserMenu(false)
                  }}
                  className="w-full text-left px-3 py-1.5 text-rose-600 hover:bg-rose-50 font-medium cursor-pointer"
                >
                  Reset Demo Workspace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
