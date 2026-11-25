import React, { useState } from 'react'
import { ShieldCheck, KeyRound, X, AlertTriangle, Lock, LogOut } from 'lucide-react'
import { useApp } from '../../context/AppContext'

/**
 * Backend Session Authentication Modal
 * - Authenticates against FastAPI POST /api/auth/session or validates a pasted Bearer token.
 * - Zero hardcoded credentials, zero fake auth, zero frontend-controlled role selectors.
 */
export default function BackendAuthModal({ isOpen, onClose }) {
  const {
    authSession,
    authError,
    clearAuthError,
    signInBackendSession,
    connectWithBearerToken,
    signOutBackendSession,
  } = useApp()

  const [authTab, setAuthTab] = useState('CREDENTIALS') // CREDENTIALS | TOKEN
  const [username, setUsername] = useState('')
  const [credential, setCredential] = useState('')
  const [rawToken, setRawToken] = useState('')
  const [localError, setLocalError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const activeError = localError || authError

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)
    clearAuthError?.()
    if (!username.trim() || !credential) {
      setLocalError('Please enter both your backend username and credential.')
      return
    }
    setIsSubmitting(true)
    try {
      await signInBackendSession({ username: username.trim(), credential })
      setCredential('')
      onClose?.()
    } catch (err) {
      setLocalError(err?.message || 'Backend authentication failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTokenSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)
    clearAuthError?.()
    if (!rawToken.trim()) {
      setLocalError('Please paste a valid signed Bearer token.')
      return
    }
    setIsSubmitting(true)
    try {
      await connectWithBearerToken(rawToken.trim())
      setRawToken('')
      onClose?.()
    } catch (err) {
      setLocalError(err?.message || 'Token rejected by backend server.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignOut = () => {
    signOutBackendSession()
    setLocalError(null)
    clearAuthError?.()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="backend-auth-modal-title"
    >
      <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-800" />
            <div>
              <h3 id="backend-auth-modal-title" className="text-sm font-bold text-slate-900">
                Backend API Session Authentication
              </h3>
              <p className="text-[11px] text-slate-500">
                Server-verified Bearer authentication & RBAC enforcement
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close authentication modal"
            className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {authSession?.access_token && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="font-bold text-emerald-900">
                  Signed in: {authSession.actor_name}
                </p>
                <p className="text-[11px] text-emerald-800">
                  Server Role: <span className="font-mono font-semibold">{authSession.role}</span>
                  {authSession.is_prototype_auth ? ' • Non-production prototype token' : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white text-slate-700 hover:bg-slate-50 font-semibold inline-flex items-center gap-1 cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}

          {activeError && (
            <div
              role="alert"
              className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-3 flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{activeError}</span>
            </div>
          )}

          <div className="flex border border-slate-200 rounded-lg p-1 bg-slate-50 gap-1">
            <button
              type="button"
              onClick={() => setAuthTab('CREDENTIALS')}
              className={`flex-1 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                authTab === 'CREDENTIALS'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Credentials Sign-In
            </button>
            <button
              type="button"
              onClick={() => setAuthTab('TOKEN')}
              className={`flex-1 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                authTab === 'TOKEN'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Paste Bearer Token
            </button>
          </div>

          {authTab === 'CREDENTIALS' ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-3">
              <div>
                <label htmlFor="auth-username" className="block font-semibold text-slate-700 mb-1">
                  Account Username / Email
                </label>
                <input
                  id="auth-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="user@firm.domain"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
                />
              </div>
              <div>
                <label htmlFor="auth-credential" className="block font-semibold text-slate-700 mb-1">
                  Password / Credential
                </label>
                <input
                  id="auth-credential"
                  type="password"
                  autoComplete="current-password"
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  placeholder="Enter credential"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
                />
              </div>
              <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  Role and client/case permissions are resolved strictly server-side. Prototype credential login is restricted to non-production test environments.
                </span>
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Authenticating...' : 'Authenticate Backend Session'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleTokenSubmit} className="space-y-3">
              <div>
                <label htmlFor="auth-bearer-token" className="block font-semibold text-slate-700 mb-1">
                  Signed Bearer Token
                </label>
                <textarea
                  id="auth-bearer-token"
                  rows={3}
                  value={rawToken}
                  onChange={(e) => setRawToken(e.target.value)}
                  placeholder="Paste externally issued Bearer token..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-start gap-2">
                <KeyRound className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  Token validity and access scopes are verified directly by the FastAPI server on each API request.
                </span>
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Verifying Token...' : 'Verify & Connect Token'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
