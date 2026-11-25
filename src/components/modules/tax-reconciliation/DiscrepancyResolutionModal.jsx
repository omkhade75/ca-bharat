import React, { useState, useEffect } from 'react'
import { Scale, X, AlertTriangle, CheckCircle2, FileText, History } from 'lucide-react'
import { formatINR } from '../../../utils/formatters'

const RESOLUTION_ACTIONS = [
  { value: 'CLAIM_PORTAL_SAFE', label: 'Claim Portal-Safe 26AS / AIS Value' },
  { value: 'ADD_TO_OTHER_SOURCES', label: 'Include AIS Item in Income Schedule' },
  { value: 'ACCEPT_CLIENT_DOCUMENT', label: 'Accept Client Certificate Value' },
  { value: 'DRAFT_DEDUCTOR_RECTIFICATION', label: 'Flag for Deductor Form 26Q Rectification' },
  { value: 'NO_ACTION', label: 'Confirm Match / No Adjustment' },
]

/**
 * Interactive CA modal to inspect cross-document mismatches, citations, original vs CA-corrected
 * extracted figures, and record a persisted reconciliation resolution with mandatory audit notes.
 */
export default function DiscrepancyResolutionModal({
  row,
  onClose,
  onSubmit,
  isSubmitting = false,
  serverError = null,
}) {
  const [action, setAction] = useState('CLAIM_PORTAL_SAFE')
  const [resolvedValue, setResolvedValue] = useState('0')
  const [caNotes, setCaNotes] = useState('')
  const [localError, setLocalError] = useState(null)

  useEffect(() => {
    if (row) {
      setAction(row.recommendedAction || 'CLAIM_PORTAL_SAFE')
      const baseVal =
        row.resolvedValue !== undefined && row.resolvedValue !== null
          ? row.resolvedValue
          : row.form26AS ?? row.aisTis ?? row.form16 ?? 0
      setResolvedValue(String(baseVal))
      setCaNotes(row.caNotes || '')
      setLocalError(null)
    }
  }, [row])

  if (!row) return null

  const activeError = localError || serverError
  const origVals = row.originalExtractedValues || {}
  const citations = row.sourceCitations || []
  const corrections = row.caCorrectionsApplied || []

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)
    if ((caNotes || '').trim().length < 3) {
      setLocalError('Mandatory CA audit notes must be at least 3 characters.')
      return
    }
    const numericVal = Number(resolvedValue)
    if (Number.isNaN(numericVal)) {
      setLocalError('Resolved value must be a valid number.')
      return
    }
    await onSubmit({
      action,
      caNotes: caNotes.trim(),
      resolvedValue: numericVal,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recon-resolve-modal-title"
    >
      <div className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-slate-800" />
            <div>
              <h3 id="recon-resolve-modal-title" className="text-sm font-bold text-slate-900">
                Review & Resolve Reconciliation Item
              </h3>
              <p className="text-[11px] text-slate-500">
                {row.item} • {row.category}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close resolution modal"
            className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto">
          {activeError && (
            <div
              role="alert"
              className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-3 flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{activeError}</span>
            </div>
          )}

          {/* Side-by-Side Amounts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Form 16 / 16A</span>
              <span className="font-mono font-bold text-slate-900">
                {row.form16 !== null && row.form16 !== undefined ? formatINR(row.form16) : '—'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">TRACES 26AS</span>
              <span className="font-mono font-bold text-slate-900">
                {row.form26AS !== null && row.form26AS !== undefined ? formatINR(row.form26AS) : '—'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">AIS / TIS</span>
              <span className="font-mono font-bold text-slate-900">
                {row.aisTis !== null && row.aisTis !== undefined ? formatINR(row.aisTis) : '—'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-rose-600 block">Variance</span>
              <span className="font-mono font-bold text-rose-700">{formatINR(row.variance || 0)}</span>
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 space-y-1">
            <p className="font-bold text-amber-900">{row.statutoryRule}</p>
            <p className="text-amber-800 leading-relaxed">{row.noticeRisk}</p>
          </div>

          {/* Original Extracted Values + CA Corrections History */}
          {(Object.keys(origVals).length > 0 || corrections.length > 0) && (
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60 space-y-2">
              <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-500" />
                Immutable Original Values & CA Overrides Preserved
              </p>
              <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-700">
                <span>F16 Orig: {origVals.form_16_original !== null && origVals.form_16_original !== undefined ? formatINR(origVals.form_16_original) : '—'}</span>
                <span>26AS Orig: {origVals.form_26as_original !== null && origVals.form_26as_original !== undefined ? formatINR(origVals.form_26as_original) : '—'}</span>
                <span>AIS Orig: {origVals.ais_original !== null && origVals.ais_original !== undefined ? formatINR(origVals.ais_original) : '—'}</span>
              </div>
              {corrections.map((c, idx) => (
                <div key={idx} className="text-[11px] bg-blue-50 border border-blue-200 rounded p-2 text-blue-900">
                  <strong>CA Override ({c.field_key}):</strong>{' '}
                  <span className="font-mono">{String(c.original_value)} → {String(c.corrected_value)}</span>{' '}
                  • By {c.corrected_by} ({c.correction_reason})
                </div>
              ))}
            </div>
          )}

          {/* Source Citations */}
          {citations.length > 0 && (
            <div className="border border-slate-200 rounded-lg p-3 space-y-1.5">
              <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Source PDF Citations ({citations.length})
              </p>
              <div className="space-y-1 max-h-28 overflow-y-auto">
                {citations.map((c, idx) => (
                  <div key={idx} className="text-[11px] bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-800 truncate">
                      {c.document_name} (Page {c.page_number}) — {c.field_name}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 shrink-0">
                      [{Array.isArray(c.bounding_box) ? c.bounding_box.join(', ') : ''}]
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="recon-action-select" className="block font-semibold text-slate-700 mb-1">
                CA Resolution Decision
              </label>
              <select
                id="recon-action-select"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {RESOLUTION_ACTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="recon-resolved-val" className="block font-semibold text-slate-700 mb-1">
                Final Reconciled Value (₹)
              </label>
              <input
                id="recon-resolved-val"
                type="number"
                step="any"
                value={resolvedValue}
                onChange={(e) => setResolvedValue(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label htmlFor="recon-ca-notes" className="block font-semibold text-slate-700 mb-1">
              Mandatory CA Audit Notes *
            </label>
            <textarea
              id="recon-ca-notes"
              rows={3}
              value={caNotes}
              onChange={(e) => setCaNotes(e.target.value)}
              placeholder="Document reconciliation justification for Sec 143(1)(a) audit file..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isSubmitting ? 'Saving Resolution...' : 'Confirm & Record Resolution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
