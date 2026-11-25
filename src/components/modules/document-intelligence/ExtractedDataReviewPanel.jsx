import React from 'react'
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Edit3,
  ShieldCheck,
  RefreshCw,
  FileWarning,
  Lock,
} from 'lucide-react'
import { formatINR } from '../../../utils/formatters'

const MONETARY_KEY_RE =
  /(salary|tds|tax|interest|dividend|deduction|allowance|gross|income|receipts|rent|amount|paid|payable|80c|80d|80ccd|17_1|16_ia|exempt|perquisite)/i

function formatFieldLabel(key) {
  return String(key)
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (ch) => ch.toUpperCase())
}

function formatFieldValue(key, value) {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') {
    if (MONETARY_KEY_RE.test(key)) {
      return formatINR(value)
    }
    return String(value)
  }
  if (Array.isArray(value) || typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

function findMatchingCitation(fieldKey, citations = []) {
  if (!Array.isArray(citations) || citations.length === 0) return null
  const normalized = fieldKey.toLowerCase().replace(/[^a-z0-9]/g, '')
  return (
    citations.find((c) => {
      const cName = String(c.field_name || c.field || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
      return cName === normalized || cName.includes(normalized) || normalized.includes(cName)
    }) || null
  )
}

function getReviewBadgeStyle(status) {
  switch (status) {
    case 'VERIFIED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'CORRECTED':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'REJECTED':
      return 'bg-rose-50 text-rose-700 border-rose-200'
    case 'WAIVED':
      return 'bg-amber-50 text-amber-800 border-amber-200'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

export default function ExtractedDataReviewPanel({
  documents = [],
  authSession = null,
  isExtracting = false,
  extractionError = null,
  onExtractAll,
  onExtractSingle,
  onOpenCorrection,
  onVerifyField,
  onInspectCitation,
  onOpenAuthModal,
}) {
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            Extracted Schedules, Evidence Citations & CA Field Review
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Values parsed deterministically from Form 16, Form 26AS & AIS/TIS PDFs. Original extracted values and bounding-box citations remain immutable after CA corrections.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!authSession?.access_token && (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" /> Sign In for Live Extraction
            </button>
          )}
          <button
            type="button"
            onClick={onExtractAll}
            disabled={isExtracting}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isExtracting ? 'animate-spin' : ''}`} />
            {isExtracting ? 'Extracting...' : 'Run Backend Extraction'}
          </button>
        </div>
      </div>

      {extractionError && (
        <div
          role="alert"
          className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{extractionError}</span>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500">
          No documents uploaded for this taxpayer case yet. Upload Form 16, Form 26AS, or AIS/TIS PDFs in the Document Vault tab to run backend extraction.
        </div>
      ) : (
        documents.map((doc) => {
          const extracted = doc.extractedData || {}
          const correctedMap = doc.correctedFields || {}
          const citations = doc.citations || doc.boundingCitations || []

          // Separate scalar extracted fields from nested array schedules
          const scalarEntries = Object.entries(extracted).filter(
            ([, val]) => !Array.isArray(val) && (typeof val !== 'object' || val === null)
          )
          const arrayEntries = Object.entries(extracted).filter(
            ([, val]) => Array.isArray(val) && val.length > 0
          )

          // Include any citations that don't correspond to an already shown scalar key
          const scalarKeySet = new Set(
            scalarEntries.map(([k]) => k.toLowerCase().replace(/[^a-z0-9]/g, ''))
          )
          const extraCitations = citations.filter((c) => {
            const norm = String(c.field_name || c.field || '')
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '')
            return norm && !scalarKeySet.has(norm)
          })

          return (
            <div
              key={doc.id}
              data-testid={`extracted-doc-card-${doc.id}`}
              className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs"
            >
              {/* Document Meta & Dual Status Header */}
              <div className="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-bold text-slate-900">
                      {doc.name || doc.filename}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200/70 text-slate-700">
                      {doc.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {doc.pageCount || 1} pg • {doc.assessmentYear || 'AY 2025-26'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[10px]">
                    <span
                      className={`px-2 py-0.5 rounded border font-semibold ${
                        doc.processingStatus === 'PARSED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : doc.processingStatus === 'PARSING_FAILED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      Processing: {doc.processingStatus || 'UPLOADED'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded border font-semibold ${getReviewBadgeStyle(
                        doc.caReviewStatus
                      )}`}
                    >
                      CA Review: {doc.caReviewStatus || 'PENDING_REVIEW'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded border font-mono ${
                        doc.extractionSupported
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {doc.extractionSupported
                        ? `Engine: ${doc.extractionEngine || 'DETERMINISTIC_PDF'}`
                        : `Unsupported (${doc.extractionEngine || 'UNSUPPORTED_TYPE'})`}
                    </span>
                    {typeof doc.evidenceScore === 'number' && (
                      <span
                        title={`Methodology: ${doc.evidenceMethodology || 'COORDINATE_LOCALIZATION_RATIO'} — measures coordinate localization ratio, not statistical accuracy`}
                        className="px-2 py-0.5 rounded border bg-slate-100 text-slate-800 border-slate-200 font-mono font-semibold"
                      >
                        Evidence Score: {doc.evidenceScore.toFixed(2)} (Coordinate Ratio)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {doc.extractionSupported && (
                    <button
                      type="button"
                      onClick={() => onExtractSingle(doc.id)}
                      disabled={isExtracting}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className="w-3 h-3" />
                      {doc.processingStatus === 'PARSED' ? 'Re-Extract' : 'Extract PDF'}
                    </button>
                  )}
                </div>
              </div>

              {/* Body */}
              {!doc.extractionSupported ? (
                <div className="p-4 bg-amber-50/60 flex items-start gap-2.5 text-xs text-amber-900">
                  <FileWarning className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">
                      Automated extraction unavailable for category &ldquo;{doc.category}&rdquo;
                    </p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Automated deterministic PDF parsing supports Form 16, Form 26AS, and AIS/TIS PDFs only. No fabricated extracted fields are generated; retain this file in private vault for manual CA review.
                    </p>
                  </div>
                </div>
              ) : scalarEntries.length === 0 && arrayEntries.length === 0 ? (
                <div className="p-5 text-xs text-slate-500 flex items-center justify-between">
                  <span>
                    Document status is <strong className="text-slate-700">{doc.processingStatus}</strong>. Run extraction to parse structured tax fields and bounding-box citations.
                  </span>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {scalarEntries.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                            <th className="py-2.5 px-3">Extracted Field</th>
                            <th className="py-2.5 px-2.5">Original Value</th>
                            <th className="py-2.5 px-2.5">CA Corrected / Effective</th>
                            <th className="py-2.5 px-2.5">Source Citation & Evidence</th>
                            <th className="py-2.5 px-3 text-right">CA Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {scalarEntries.map(([fieldKey, rawVal]) => {
                            const correction = correctedMap[fieldKey] || null
                            const citation =
                              correction?.original_citation ||
                              findMatchingCitation(fieldKey, citations)
                            const originalVal = correction ? correction.original_value : rawVal
                            const isCorrected = Boolean(correction?.is_corrected)
                            const fieldReviewStatus = correction?.review_status || 'UNVERIFIED'

                            return (
                              <tr key={fieldKey} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-2.5 px-3 align-top">
                                  <p className="font-semibold text-slate-900">
                                    {formatFieldLabel(fieldKey)}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] font-mono text-slate-400">
                                      {fieldKey}
                                    </span>
                                    <span
                                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${getReviewBadgeStyle(
                                        fieldReviewStatus
                                      )}`}
                                    >
                                      {fieldReviewStatus}
                                    </span>
                                  </div>
                                </td>

                                <td className="py-2.5 px-2.5 align-top font-mono text-slate-800 font-semibold">
                                  {formatFieldValue(fieldKey, originalVal)}
                                  {isCorrected && (
                                    <span className="block text-[10px] font-sans font-normal text-slate-400">
                                      Original (immutable)
                                    </span>
                                  )}
                                </td>

                                <td className="py-2.5 px-3 align-top">
                                  {isCorrected ? (
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-mono font-bold text-blue-800">
                                          {formatFieldValue(fieldKey, correction.corrected_value)}
                                        </span>
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                          CA CORRECTED
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-slate-600">
                                        By {correction.corrected_by} • {correction.correction_reason}
                                      </p>
                                      {correction.corrected_at && (
                                        <p className="text-[10px] text-slate-400 font-mono">
                                          {new Date(correction.corrected_at).toLocaleString()}
                                          {correction.correction_history?.length > 1
                                            ? ` (${correction.correction_history.length} edits)`
                                            : ''}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-slate-400">
                                      Same as extracted
                                    </span>
                                  )}
                                </td>

                                <td className="py-2.5 px-3 align-top">
                                  {citation ? (
                                    <div className="space-y-1">
                                      <div className="text-[11px] text-slate-600">
                                        <span>{citation.document_name || doc.name}</span> •{' '}
                                        <strong>Page {citation.page_number ?? 1}</strong>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        {Array.isArray(citation.bounding_box) && (
                                          <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                                            BBox [{citation.bounding_box.join(', ')}]
                                          </span>
                                        )}
                                        <span className="text-[10px] font-mono text-slate-600">
                                          {citation.evidence_status || 'UNVERIFIED'}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            onInspectCitation(doc, citation, correction)
                                          }
                                          className="text-[10px] text-blue-700 hover:text-blue-900 font-semibold inline-flex items-center gap-0.5 cursor-pointer"
                                        >
                                          <Eye className="w-3 h-3" /> Inspect
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-slate-400">
                                      No coordinate citation
                                    </span>
                                  )}
                                </td>

                                <td className="py-2.5 px-3 align-top text-right">
                                  <div className="inline-flex flex-wrap justify-end items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onOpenCorrection({
                                          docId: doc.id,
                                          docName: doc.name || doc.filename,
                                          fieldKey,
                                          fieldLabel: formatFieldLabel(fieldKey),
                                          originalValue: originalVal,
                                          correctedValue: isCorrected
                                            ? correction.corrected_value
                                            : originalVal,
                                          existingReason: '',
                                          citation,
                                          correctionHistory: correction?.correction_history || [],
                                        })
                                      }
                                      className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <Edit3 className="w-3 h-3" /> Correct
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onVerifyField(doc.id, fieldKey)}
                                      disabled={fieldReviewStatus === 'VERIFIED'}
                                      className={`px-2 py-1 rounded border text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer ${
                                        fieldReviewStatus === 'VERIFIED'
                                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 cursor-default'
                                          : 'bg-white border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                                      }`}
                                    >
                                      <ShieldCheck className="w-3 h-3" />
                                      {fieldReviewStatus === 'VERIFIED' ? 'Verified' : 'Verify'}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {extraCitations.length > 0 && (
                    <div className="p-3 bg-slate-50/50 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Additional Source Citations ({extraCitations.length})
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {extraCitations.map((cit, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 truncate">
                                {formatFieldLabel(cit.field_name || cit.field)}
                              </p>
                              <p className="text-[10px] font-mono text-slate-500">
                                Page {cit.page_number ?? 1} •{' '}
                                {Array.isArray(cit.bounding_box)
                                  ? `[${cit.bounding_box.join(', ')}]`
                                  : 'Text match'}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => onInspectCitation(doc, cit, null)}
                              className="px-2 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 text-[10px] font-semibold cursor-pointer shrink-0"
                            >
                              <Eye className="w-3 h-3 inline mr-1" />
                              Inspect
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {arrayEntries.map(([arrKey, items]) => (
                    <div key={arrKey} className="p-4 bg-slate-50/40 space-y-2">
                      <p className="text-[11px] font-bold text-slate-700">
                        {formatFieldLabel(arrKey)} ({items.length})
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {items.map((row, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] space-y-0.5"
                          >
                            {typeof row === 'object' && row !== null ? (
                              Object.entries(row).map(([k, v]) => (
                                <div key={k} className="flex justify-between gap-2">
                                  <span className="text-slate-500">{formatFieldLabel(k)}:</span>
                                  <span className="font-mono font-semibold text-slate-900">
                                    {formatFieldValue(k, v)}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="font-mono">{String(row)}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
