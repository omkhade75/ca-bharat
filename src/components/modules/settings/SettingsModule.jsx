import React, { useState } from 'react'
import {
  Shield,
  Building,
  RotateCcw,
  CheckCircle2,
  Database,
  Save,
  AlertTriangle
} from 'lucide-react'
import { useApp } from '../../../context/AppContext'

export default function SettingsModule() {
  const { firmDetails, resetAllDataToDemo, activeAy, setActiveAy } = useApp()
  const [savedSuccess, setSavedSuccess] = useState(false)

  // Local form state
  const [firmName, setFirmName] = useState(firmDetails.firmName)
  const [registrationNo, setRegistrationNo] = useState(firmDetails.registrationNo)
  const [partnerInCharge, setPartnerInCharge] = useState(firmDetails.partnerInCharge)
  const [headOffice, setHeadOffice] = useState(firmDetails.headOffice)
  const [supportContact, setSupportContact] = useState(firmDetails.supportContact)

  const handleSaveFirm = (e) => {
    e.preventDefault()
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  const handleResetData = () => {
    if (window.confirm('Reset all demo state (clients, documents, reconciliation items, approvals) to factory defaults?')) {
      resetAllDataToDemo()
      alert('Workspace reset to initial demo state!')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Module Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Admin & Governance
            </span>
            <h1 className="text-xl font-bold text-slate-900">Firm Settings & Consent Configuration</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ICAI firm registration profile, demonstration consent policies, and local database state management
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved Successfully</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Firm Details & Security Policies */}
        <div className="lg:col-span-2 space-y-6">
          {/* Firm Identity Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4 border-b pb-3">
              <Building className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">ICAI Firm Master Information</h3>
            </div>

            <form onSubmit={handleSaveFirm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chartered Accountancy Firm Name</label>
                  <input
                    type="text"
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Firm Registration Number (FRN)</label>
                  <input
                    type="text"
                    value={registrationNo}
                    onChange={(e) => setRegistrationNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Senior Partner in Charge</label>
                  <input
                    type="text"
                    value={partnerInCharge}
                    onChange={(e) => setPartnerInCharge(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Firm Support & Notification Email</label>
                  <input
                    type="email"
                    value={supportContact}
                    onChange={(e) => setSupportContact(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Registered Head Office Address</label>
                <input
                  type="text"
                  value={headOffice}
                  onChange={(e) => setHeadOffice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Firm Profile</span>
                </button>
              </div>
            </form>
          </div>

          {/* Consent Workflow Demonstration & Security Framework */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <Shield className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Consent Workflow Demonstration (DPDP Concept) & Prototype Framework
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800">In-Memory Sandbox Concept (Simulated)</span>
                  <p className="text-slate-500 text-[11px]">
                    Production architecture design: password-protected PDFs are decrypted in ephemeral RAM and discarded. (Prototype simulation).
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                  DESIGN CONCEPT
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800">Deterministic Mathematical Isolation</span>
                  <p className="text-slate-500 text-[11px]">
                    Tax calculations execute on deterministic rule-based algorithms rather than probabilistic LLMs.
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                  DESIGN CONCEPT
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800">Mandatory CA Sign-Off Gate</span>
                  <p className="text-slate-500 text-[11px]">
                    System workflow requires licensed CA review prior to generating sample filing outputs.
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                  DESIGN CONCEPT
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Data Management & Reset */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <Database className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">Prototype Storage Management</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This interactive prototype persists all changes (new clients, document uploads, accepted discrepancies, and CA approvals) in your browser's <b>LocalStorage</b>.
            </p>

            <div className="bg-amber-50 p-3.5 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Reset to Factory Demo State</span>
              </span>
              <p className="text-[11px] text-amber-800 leading-normal">
                Want to run the complete demo flow from scratch with Rahul Sharma's 2 unaccepted discrepancies?
              </p>
            </div>

            <button
              onClick={handleResetData}
              className="w-full py-2.5 px-4 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset All Demo State</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-400">
              Active Assessment Cycle
            </h4>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Global Active AY</label>
              <select
                value={activeAy}
                onChange={(e) => setActiveAy(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="AY 2025-26">AY 2025-26 (FY 2024-25)</option>
                <option value="AY 2024-25">AY 2024-25 (FY 2023-24)</option>
                <option value="AY 2023-24">AY 2023-24 (FY 2022-23)</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Switching the assessment cycle updates all client return deadlines, tax rate slabs, and filing forms across the app.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
