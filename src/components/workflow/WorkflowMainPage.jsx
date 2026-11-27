import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UserPlus,
  Users,
  ArrowRight,
  CheckCircle2,
  Search,
  FileCheck2,
  Scale,
  ShieldCheck,
  ChevronRight,
  Building,
  User,
  X,
  Sparkles,
  Upload,
} from 'lucide-react'
import { AppContext } from '../../context/AppContext'
import { LogoMark } from '../common/Logo'
import Modal from '../common/Modal'

export default function WorkflowMainPage() {
  const navigate = useNavigate()
  const appContext = useContext(AppContext)
  const defaultClients = [
    { id: 'client-arun-01', name: 'Arun Kumar Verma', pan: 'ABCPA1092F', category: 'Individual - Salaried', assignedCa: 'CA Rajesh Sharma' },
    { id: 'client-radhika-02', name: 'Dr. Radhika Sharma', pan: 'ABCPR5491M', category: 'Individual - Medical Professional (Sec 44ADA)', assignedCa: 'CA Rajesh Sharma' },
    { id: 'client-huf-03', name: 'Sharma & Sons HUF', pan: 'AAHCS1290K', category: 'Hindu Undivided Family (HUF)', assignedCa: 'CA Neha Verma' },
    { id: 'client-priya-04', name: 'Priya Patel', pan: 'ABCPP9012L', category: 'Individual - Salaried', assignedCa: 'CA Rajesh Sharma' },
  ]
  const clients = appContext?.clients?.length ? appContext.clients : defaultClients
  const activeClient = appContext?.activeClient || null
  const setActiveClientId = appContext?.setActiveClientId || (() => {})

  const [showCustomersModal, setShowCustomersModal] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')

  // 8 Statutory Workflow Stages requested by leadership
  const workflowStages = [
    { number: '01', title: 'Client Onboarding', route: '/firm-clients?action=add' },
    { number: '02', title: 'Taxpayer & Income Details', route: '/firm-clients' },
    { number: '03', title: 'Document Collection', route: '/document-intelligence' },
    { number: '04', title: 'Document Extraction & Validation', route: '/document-intelligence' },
    { number: '05', title: 'Reconciliation', route: '/tax-reconciliation' },
    { number: '06', title: 'ITR Selection & Tax Computation', route: '/tax-reconciliation' },
    { number: '07', title: 'CA Review & Approval', route: '/tax-reconciliation' },
    { number: '08', title: 'ITR Filing Preparation', route: '/tax-reconciliation' },
  ]

  const filteredClients = clients.filter(
    (c) =>
      c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.pan?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.category?.toLowerCase().includes(customerSearch.toLowerCase())
  )

  const handleSelectCustomer = (clientId) => {
    setActiveClientId(clientId)
    setShowCustomersModal(false)
    navigate('/tax-reconciliation')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-200 flex flex-col justify-between antialiased">
      {/* Top Bar: Minimal Logo & Product Name */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xs sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark size={36} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">CA Bharat</span>
                <span className="text-teal-700 font-bold text-lg">AI</span>
                <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 text-[10px] font-mono font-semibold border border-teal-200">
                  AY 2025-26
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeClient && (
              <span className="text-xs text-slate-500 hidden sm:inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Active: <strong>{activeClient.name}</strong> ({activeClient.pan})</span>
              </span>
            )}
            <button
              onClick={() => navigate('/tax-reconciliation')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Tax Reconciliation
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area: Centered, Focused, Zero Distractions */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center space-y-12">
        {/* Brand Hero & Workflow Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="flex justify-center mb-2">
            <LogoMark size={56} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            CA Bharat <span className="text-teal-700">AI</span>
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            Income Tax Compliance & Chartered Audit Platform • AY 2025-26
          </p>
        </div>

        {/* Visual Workflow Pipeline: 8 Statutory Stages */}
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              End-to-End Compliance & Filing Workflow
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              8 Statutory Stages
            </span>
          </div>

          {/* Stepper Grid / Flow */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 w-full">
            {workflowStages.map((stage, idx) => {
              const isLast = idx === workflowStages.length - 1
              return (
                <div
                  key={stage.number}
                  onClick={() => navigate(stage.route)}
                  title={`Stage ${stage.number}: ${stage.title} (Click to open)`}
                  className="bg-white border border-slate-200 hover:border-slate-400 rounded-lg p-3 shadow-2xs transition-all flex flex-col justify-between group cursor-pointer hover:shadow-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-teal-700 transition-colors">
                      {stage.number}
                    </span>
                    {!isLast && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-slate-950 leading-snug">
                    {stage.title}
                  </h4>
                </div>
              )
            })}
          </div>
        </div>

        {/* The Two Primary Choices: Add New Customer | Existing Customers */}
        <div className="w-full max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Action 1: Add New Customer */}
          <button
            type="button"
            data-testid="btn-add-new-customer"
            onClick={() => navigate('/firm-clients?action=add')}
            className="p-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs border border-slate-800 transition-all flex flex-col justify-between group cursor-pointer text-left active:scale-[0.99]"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-lg bg-teal-500/15 border border-teal-500/25 text-teal-400 flex items-center justify-center shrink-0 group-hover:bg-teal-500 group-hover:text-slate-950 transition-colors">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                  Add New Customer
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Onboard a new assessee, classify legal entity, validate PAN, and start statutory discovery.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-teal-400">
              <span>Start Onboarding</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Action 2: Existing Customers */}
          <button
            type="button"
            data-testid="btn-existing-customers"
            onClick={() => setShowCustomersModal(true)}
            className="p-6 rounded-xl bg-white hover:bg-slate-50 text-slate-900 shadow-2xs border border-slate-300 hover:border-slate-400 transition-all flex flex-col justify-between group cursor-pointer text-left active:scale-[0.99]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-mono font-bold border border-slate-200">
                  {clients.length || 4} Assessees
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  Existing Customers
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Select a registered taxpayer to continue 3-way reconciliation, tax computation, or filing preparation.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700">
              <span>Browse Customers</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </main>

      {/* MODAL: Existing Customers Selector */}
      <Modal
        isOpen={showCustomersModal}
        onClose={() => setShowCustomersModal(false)}
        title="Select Existing Customer"
        subtitle="Choose an assessee to open their tax case and continue the compliance workflow"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              placeholder="Search by taxpayer name, PAN (e.g. ABCPA1092F), or entity type..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-blue-500"
              autoFocus
            />
          </div>

          {/* Customer List */}
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto border border-slate-200 rounded-lg">
            {filteredClients.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                No taxpayers match your search criteria.
              </div>
            ) : (
              filteredClients.map((client) => {
                const isCurrentActive = client.id === activeClient?.id
                return (
                  <div
                    key={client.id}
                    className={`p-3.5 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors ${
                      isCurrentActive ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 truncate">{client.name}</span>
                        <span className="font-mono text-[11px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                          {client.pan}
                        </span>
                        {isCurrentActive && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.2 rounded">
                            Active Case
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {client.category || 'Resident Taxpayer'} • Assigned: {client.assignedCa || 'CA Rajesh Sharma'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveClientId(client.id)
                          setShowCustomersModal(false)
                          navigate('/document-intelligence')
                        }}
                        title={`Upload documents for ${client.name}`}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-xs flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>Upload Docs</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectCustomer(client.id)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                      >
                        <span>Open Tax Case</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Directory Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-slate-500">
            <span>Showing {filteredClients.length} of {clients.length} assessees</span>
            <button
              type="button"
              onClick={() => {
                setShowCustomersModal(false)
                navigate('/firm-clients')
              }}
              className="text-xs font-semibold text-slate-700 hover:text-slate-950 underline cursor-pointer"
            >
              Open Full Customer Directory →
            </button>
          </div>
        </div>
      </Modal>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <span>CA Bharat AI</span>
            <span>•</span>
            <span>Statutory AY 2025-26 Compliance Platform</span>
          </div>
          <div>
            Finance Act 2024 • Rule 12 Deterministic Engine • Chartered Audit Standards
          </div>
        </div>
      </footer>
    </div>
  )
}
