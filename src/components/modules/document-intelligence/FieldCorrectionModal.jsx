import React, { useState, useEffect } from 'react'
import { Edit3, X, AlertTriangle, History, CheckCircle2 } from 'lucide-react'

function formatDisplayValue(val) {
  if (val === null || val === undefined || val === '') return '—'
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

function parseInputForSubmission(rawInput, originalValue) {
  const trimmed = rawInput.trim()
  if (typeof originalValue === 'number' && trimmed !== '' && !Number.isNaN(Number(trimmed))) {
    return Number(trimmed)
  }
  return rawInput
}

/**
 * Modal for CA/staff correction of an extracted field while preserving
 * the immutable original extracted value, evidence citation, and audit trail.
 */
export default function FieldCorrectionModal({
  target,
  onClose,
  onSubmit,
  isSubmitting = false,
  serverError = null,
}) {
  const [correctedInput, setCorrectedInput] = useState('')
  const [reasonInput, setReasonInput] = useState('')
  const [validationError, setValidationError] = useState(null)

  useEffect(() => {
    if (target) {
      const initialVal =
        target.correctedValue !== undefined && target.correctedValue !== null
          ? target.correctedValue
          : target.originalValue
      setCorrectedInput(initialVal === undefined || initialVal === null ? '' : String(initialVal))
      setReasonInput(target.existingReason || '')
      setValidationError(null)
    }
  }, [target])

  if (!target) return null

  const activeError = validationError || serverError

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError(null)
    if (correctedInput === '' || correctedInput === null) {
      setValidationError('Please enter a corrected value.')
      return
    }
    if ((reasonInput || '').trim().length < 3) {
      setValidationError('Mandatory CA correction reason must be at least 3 characters.')
      return
    }
    const parsedValue = parseInputForSubmission(correctedInput, target.originalValue)
    await onSubmit({
      correctedValue: parsedValue,
      correctionReason: reasonInput.trim(),
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ca-field-correction-title"
    >
      <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-slate-800" />
            <div>
              <h3 id="ca-field-correction-title" className="text-sm font-bold text-slate-900">
                CA Field Override & Audit Correction
              </h3>
              <p className="text-[11px] text-slate-500">
                {target.docName} • Field: <span className="font-mono">{target.fieldKey}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close correction modal"
            className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {activeError && (
            <div
              role="alert"
              className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-3 flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{activeError}</span>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Immutable Original Extracted Value
              </span>
              <span className="text-[10px] font-mono text-slate-500">Preserved on Record</span>
            </div>
            <p className="text-sm font-mono font-bold text-slate-900" data-testid="immutable-original-value">
              {formatDisplayValue(target.originalValue)}
            </p>
            {target.citation && (
              <p className="text-[11px] text-slate-500 font-mono">
                Citation: {target.citation.document_name || target.docName} • Page{' '}
                {target.citation.page_number ?? 1}
                {Array.isArray(target.citation.bounding_box)
                  ? ` • BBox [${target.citation.bounding_box.join(', ')}]`
                  : ''}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="ca-corrected-value" className="block font-semibold text-slate-700 mb-1">
              Corrected Value ({target.fieldLabel})
            </label>
            <input
              id="ca-corrected-value"
              type="text"
              value={correctedInput}
              onChange={(e) => setCorrectedInput(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="ca-correction-reason" className="block font-semibold text-slate-700 mb-1">
              Mandatory CA Audit Reason *
            </label>
            <textarea
              id="ca-correction-reason"
              rows={3}
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              placeholder="e.g., Reconciled with Form 26AS Part A challan breakdown..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {Array.isArray(target.correctionHistory) && target.correctionHistory.length > 0 && (
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/70 space-y-2 max-h-36 overflow-y-auto">
              <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-500" />
                Prior Correction Audit Trail ({target.correctionHistory.length})
              </p>
              {target.correctionHistory.map((hist, idx) => (
                <div key={idx} className="text-[11px] border-t border-slate-200 pt-1.5 space-y-0.5">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-mono">
                      {formatDisplayValue(hist.previous_value)} →{' '}
                      <strong className="text-slate-900">{formatDisplayValue(hist.new_value)}</strong>
                    </span>
                    <span className="text-[10px] text-slate-400">{hist.corrected_by}</span>
                  </div>
                  <p className="text-slate-600">{hist.reason}</p>
                </div>
              ))}
            </div>
          )}

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
              {isSubmitting ? 'Saving Correction...' : 'Save CA Correction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
