import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Users,
  UserPlus,
  ShieldCheck,
  Search,
  Building,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Edit2,
  Copy,
  Check,
  Trash2,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Info,
  Upload,
} from 'lucide-react'
import { useApp } from '../../../context/AppContext'
import { formatDate } from '../../../utils/formatters'
import { WORKFLOW_STATUS_META } from '../../../utils/workflowHelper'
import Badge from '../../common/Badge'
import Modal from '../../common/Modal'
import {
  ENTITY_GROUPS,
  STATUTORY_TAXPAYER_CATEGORIES,
  LEGAL_TAXPAYER_ENTITIES,
  INDIVIDUAL_OCCUPATION_PROFILES,
  RESIDENTIAL_STATUS_OPTIONS,
  REQUESTED_SERVICES,
  computeRecommendedItr,
  getCategoryDetails,
  getRecommendedItr,
  getExpectedPan4thChar,
  validatePanStructure,
} from '../../../data/statutoryTaxpayerTypes'
import ClientTaxDiscoveryWorkspace from './ClientTaxDiscoveryWorkspace'

export default function FirmClientsModule() {
  const {
    clients,
    activeClient,
    setActiveClientId,
    addClient,
    deleteClient,
    clearAllClients,
    seedStatutoryTaxpayers,
    updateClient,
    grantConsent,
    getWorkflowStageForClient,
    team,
    consents,
    firmDetails,
  } = useApp()

  const [activeTab, setActiveTab] = useState('CLIENTS') // 'CLIENTS', 'TEAM', 'CONSENT'
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [tierFilter, setTierFilter] = useState('ALL')
  
  // Modals state
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [isEditClientOpen, setIsEditClientOpen] = useState(false)
  const [isClientDetailsOpen, setIsClientDetailsOpen] = useState(false)
  const [isTaxDiscoveryOpen, setIsTaxDiscoveryOpen] = useState(false)
  const [selectedClientForView, setSelectedClientForView] = useState(null)
  const [selectedClientForDiscovery, setSelectedClientForDiscovery] = useState(null)
  const [isAddTeamMemberOpen, setIsAddTeamMemberOpen] = useState(false)
  const [copiedConsentId, setCopiedConsentId] = useState(null)
  const [onboardError, setOnboardError] = useState(null)
  const [isOnboardingSubmit, setIsOnboardingSubmit] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('action') === 'add' || searchParams.get('action') === 'new') {
      setIsAddClientOpen(true)
      searchParams.delete('action')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    pan: '',
    email: '',
    phone: '',
    category: 'Individual - Salaried',
    employer: '',
    tier: 'Gold',
    address: '',
    status: 'Action Required',
  })

  // New client form state (Compliant with Step 1 Discovery Requirements)
  const [formData, setFormData] = useState({
    name: '',
    pan: '',
    legalType: 'INDIVIDUAL',
    occupationProfile: 'SALARIED',
    residentialStatus: 'RESIDENT',
    dobOrDoi: '',
    isExistingClient: false,
    requestedService: 'REGULAR_ITR',
    assignedPartner: 'CA Rajesh Sharma (Partner)',
    assignedStaff: 'Ananya Joshi (Senior Associate)',
    email: '',
    phone: '',
    tier: 'Gold',
    employer: '',
    tan: '',
    // HUF conditional fields
    kartaName: '',
    kartaPan: '',
    hufDeedDate: '',
    // Entity conditional fields
    entityRegNo: '',
    registeredOffice: '',
    responsiblePersonName: '',
    responsiblePersonPan: '',
    responsiblePersonDesignation: 'Managing Partner',
    address: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
  })

  // Real-time PAN format & duplicate PAN validation
  const panUpperInput = String(formData.pan || '').trim().toUpperCase()
  const isValidPanFormat = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panUpperInput)
  const duplicateClient = Boolean(panUpperInput && panUpperInput.length === 10)
    ? clients.find((c) => c.pan?.toUpperCase() === panUpperInput)
    : null
  const isDuplicatePan = Boolean(duplicateClient)

  // Filter clients
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.pan || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone || '').includes(searchQuery)
    const matchesCategory =
      categoryFilter === 'ALL' || (c.category || '').toLowerCase().includes(categoryFilter.toLowerCase())
    const matchesTier = tierFilter === 'ALL' || c.tier === tierFilter
    return matchesSearch && matchesCategory && matchesTier
  })

  const handleCreateClient = async (e) => {
    e.preventDefault()
    setOnboardError(null)
    if (!formData.name.trim() || !panUpperInput) {
      setOnboardError('Please provide both Taxpayer Full Legal Name and 10-character PAN.')
      return
    }
    if (!isValidPanFormat) {
      setOnboardError(
        `Invalid PAN "${panUpperInput}". Indian PAN must be 10 characters: 5 letters + 4 digits + 1 letter (e.g. ABCPA1092F).`
      )
      return
    }
    if (isDuplicatePan) {
      setOnboardError(`Client with PAN ${panUpperInput} is already registered as "${duplicateClient?.name}". Duplicate intake prevented.`)
      return
    }
    setIsOnboardingSubmit(true)
    try {
      const newlyCreated = await addClient({ ...formData, pan: panUpperInput, name: formData.name.trim() })
      setIsAddClientOpen(false)
      setOnboardError(null)
      setFormData({
        name: '',
        pan: '',
        legalType: 'INDIVIDUAL',
        occupationProfile: 'SALARIED',
        residentialStatus: 'RESIDENT',
        dobOrDoi: '',
        isExistingClient: false,
        requestedService: 'REGULAR_ITR',
        assignedPartner: 'CA Rajesh Sharma (Partner)',
        assignedStaff: 'Ananya Joshi (Senior Associate)',
        email: '',
        phone: '',
        tier: 'Gold',
        employer: '',
        tan: '',
        kartaName: '',
        kartaPan: '',
        hufDeedDate: '',
        entityRegNo: '',
        registeredOffice: '',
        responsiblePersonName: '',
        responsiblePersonPan: '',
        responsiblePersonDesignation: 'Managing Partner',
        address: '',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
      })
      setSelectedClientForView(newlyCreated)
      // Prompt CA to proceed directly into Step 2 Tax Discovery
      setSelectedClientForDiscovery(newlyCreated)
      setIsTaxDiscoveryOpen(true)
    } catch (err) {
      setOnboardError(err?.message || 'Unable to onboard taxpayer with backend API.')
    } finally {
      setIsOnboardingSubmit(false)
    }
  }

  const openClientDrawer = (client) => {
    setSelectedClientForView(client)
    setIsClientDetailsOpen(true)
  }

  const openEditModal = (client) => {
    setEditFormData({
      id: client.id,
      name: client.name,
      pan: client.pan,
      email: client.email,
      phone: client.phone,
      category: client.category,
      employer: client.employer,
      tier: client.tier,
      address: client.address,
      status: client.status,
    })
    setIsEditClientOpen(true)
  }

  const handleUpdateClient = async (e) => {
    e.preventDefault()
    const cleanPan = String(editFormData.pan || '').trim().toUpperCase()
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
      alert(`Invalid PAN "${cleanPan}". Indian PAN must be 10 characters: 5 letters, 4 digits, 1 letter (e.g. ABCPA1092F).`)
      return
    }
    const updatedPayload = { ...editFormData, pan: cleanPan }
    await updateClient(editFormData.id, updatedPayload)
    setIsEditClientOpen(false)
    if (selectedClientForView && selectedClientForView.id === editFormData.id) {
      setSelectedClientForView({ ...selectedClientForView, ...updatedPayload })
    }
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedConsentId(id)
    setTimeout(() => setCopiedConsentId(null), 2000)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Module 1
            </span>
            <h1 className="text-xl font-bold text-slate-900">Firm & Client Operations</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Taxpayer directory, PAN master records, team RBAC, and consent workflow demonstration
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === 'CLIENTS' && (
            <>
              <button
                onClick={() => setIsAddClientOpen(true)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Taxpayer Profile</span>
              </button>
              <button
                onClick={() => seedStatutoryTaxpayers()}
                title="Load 7 realistic statutory entities (Individual, HUF, Firm, LLP, Company, Trust)"
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Seed Statutory Entities (7)</span>
              </button>
              {clients.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to remove ALL taxpayer profiles and clear the directory?')) {
                      clearAllClients()
                    }
                  }}
                  title="Remove all present clients from directory"
                  className="px-3 py-2 text-xs font-medium rounded-lg text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Remove All Clients</span>
                </button>
              )}
            </>
          )}
          {activeTab === 'TEAM' && (
            <button
              onClick={() => setIsAddTeamMemberOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite Staff</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('CLIENTS')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'CLIENTS'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Taxpayer Directory ({clients.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('TEAM')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'TEAM'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Firm Team & RBAC ({team.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('CONSENT')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'CONSENT'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Consent Workflow Demonstration ({consents.length})</span>
        </button>
      </div>

      {/* TAB 1: CLIENTS DIRECTORY */}
      {activeTab === 'CLIENTS' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by client name, PAN, mobile or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-600"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">All Statutory Categories (15 Types)</option>
                <optgroup label="Individuals (Sec 2(31)(i))">
                  <option value="Salaried">Salaried Individuals (ITR-1/2)</option>
                  <option value="Professional">Professionals Sec 44ADA (ITR-4)</option>
                  <option value="Business">Small Business Sec 44AD (ITR-4)</option>
                  <option value="Capital Market">Capital Market Investors (ITR-2/3)</option>
                  <option value="Senior">Senior Citizens (Age 60+)</option>
                  <option value="Non-Resident">NRIs & Foreign Assets (ITR-2)</option>
                </optgroup>
                <optgroup label="Hindu Undivided Family (Sec 2(31)(ii))">
                  <option value="HUF">Hindu Undivided Family (HUF - ITR-2)</option>
                </optgroup>
                <optgroup label="Partnership & LLPs (Sec 2(31)(iv))">
                  <option value="Partnership">Partnership Firms (Sec 184 - ITR-5)</option>
                  <option value="LLP">Limited Liability Partnerships (ITR-5)</option>
                </optgroup>
                <optgroup label="Companies (Sec 2(31)(iii))">
                  <option value="Domestic Company">Domestic Companies (Pvt/Public Ltd - ITR-6)</option>
                  <option value="Foreign Company">Foreign Companies (ITR-6)</option>
                </optgroup>
                <optgroup label="Trusts & Non-Profits (Sec 11/12)">
                  <option value="Trust">Charitable Trusts & Sec 8 (ITR-7)</option>
                </optgroup>
                <optgroup label="Other Bodies (Sec 2(31)(v)-(vii))">
                  <option value="Association of Persons">AOP / BOI (ITR-5)</option>
                  <option value="Co-operative">Co-operative Societies (ITR-5)</option>
                  <option value="Artificial Juridical">Local Authorities / AJP (ITR-5)</option>
                </optgroup>
              </select>

              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">All Tiers (Silver, Gold, Platinum)</option>
                <option value="Silver">Silver (ITR + Eye-Opener)</option>
                <option value="Gold">Gold (Quarterly Advisory)</option>
                <option value="Platinum">Platinum (SEBI RIA Wealth)</option>
              </select>
            </div>
          </div>

          {/* Taxpayers Grid/Table */}
          {/* Pending Consent Action Banner for Testing */}
          {clients.filter((c) => c.consentStatus === 'Pending' || c.consentStatus === 'Pending Renewal').length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-xs">
              <h4 className="text-xs font-bold text-amber-900 mb-2">
                Clients Awaiting DPDP Digital Consent Authorization
              </h4>
              <div className="space-y-2">
                {clients
                  .filter((c) => c.consentStatus === 'Pending' || c.consentStatus === 'Pending Renewal')
                  .map((pendingClient) => (
                    <div
                      key={pendingClient.id}
                      className="bg-white p-3 rounded-lg border border-amber-200/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{pendingClient.name}</span>
                        <span className="text-slate-500 font-mono ml-2">({pendingClient.pan})</span>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          Status: {pendingClient.consentStatus} • Requires digital authorization before document processing.
                        </p>
                      </div>
                      <button
                        onClick={() => grantConsent(pendingClient.id)}
                        className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shrink-0 shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Simulate OTP Authorization</span>
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {clients.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Firm Taxpayer Directory is Empty</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
                All previous demonstration clients have been removed. Onboard a taxpayer profile under any category of the Indian Income-tax Act, 1961 (Individual, HUF, Firm, LLP, Company, Trust), or seed sample statutory profiles to test the platform.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <button
                  onClick={() => setIsAddClientOpen(true)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Onboard Taxpayer Profile</span>
                </button>
                <button
                  onClick={() => seedStatutoryTaxpayers()}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Seed Statutory Demo Profiles (7 Entities)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Client Name & PAN</th>
                      <th className="py-3 px-3">Tax Category</th>
                      <th className="py-3 px-3">Advisory Tier</th>
                      <th className="py-3 px-3">Workflow Status</th>
                      <th className="py-3 px-3">Consent</th>
                      <th className="py-3 px-3">Docs Vault</th>
                      <th className="py-3 px-3">Assigned Staff</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredClients.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-500">
                          <p className="font-semibold text-slate-700">No matching taxpayers found</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Try resetting the category filter or search query.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredClients.map((client) => {
                        const isSelected = client.id === activeClient?.id
                        return (
                          <tr
                            key={client.id}
                            className={`hover:bg-slate-50 transition-colors ${
                              isSelected ? 'bg-teal-50/30' : ''
                            }`}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={client.avatar}
                                  alt=""
                                  className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                                />
                                <div>
                                  <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                                    {client.name}
                                    {isSelected && (
                                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 font-bold">
                                        ACTIVE CONTEXT
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-[11px] text-slate-500 font-mono">
                                    PAN: <span className="font-semibold text-slate-700">{client.pan}</span>
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-slate-700">{client.category}</span>
                                <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono font-semibold border border-slate-200">
                                  {client.itrType || getRecommendedItr(client.category)}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 truncate max-w-xs">{client.employer || 'Self'}</p>
                            </td>

                            <td className="py-3 px-3">
                              <span
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                  client.tier === 'Platinum'
                                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                    : client.tier === 'Gold'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {client.tier}
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              {(() => {
                                const stage = getWorkflowStageForClient ? getWorkflowStageForClient(client) : client.status
                                const meta = WORKFLOW_STATUS_META[stage]
                                if (meta) {
                                  return (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${meta.colorClasses}`}>
                                      {meta.label}
                                    </span>
                                  )
                                }
                                return (
                                  <Badge variant="default" size="xs">
                                    {client.status}
                                  </Badge>
                                )
                              })()}
                            </td>

                            <td className="py-3 px-3">
                              {client.consentStatus === 'Active' ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Consent Active (Demo)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                                  <Clock className="w-3.5 h-3.5" />
                                  Pending Renewal
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-800">{client.docsUploaded}</span>
                                <span className="text-slate-400">/ {client.docsRequired}</span>
                                {client.docsUploaded >= client.docsRequired ? (
                                  <CheckCircle2 className="w-3 h-3 text-teal-600" />
                                ) : null}
                                <Link
                                  to="/document-intelligence"
                                  onClick={() => setActiveClientId(client.id)}
                                  title={`Upload documents for ${client.name}`}
                                  className="ml-1 inline-flex items-center gap-0.5 text-[10px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  <Upload className="w-2.5 h-2.5" />
                                  <span>Upload</span>
                                </Link>
                              </div>
                            </td>

                            <td className="py-3 px-3 text-slate-600">
                              {client.assignedTo?.split(' (')[0]}
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  to="/document-intelligence"
                                  onClick={() => setActiveClientId(client.id)}
                                  title={`Step 03 & 04: Upload & Process Tax Documents for ${client.name}`}
                                  className="px-2.5 py-1 text-[11px] font-semibold rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                >
                                  <Upload className="w-3 h-3 text-blue-600" />
                                  <span>Upload Docs</span>
                                </Link>
                                <button
                                  onClick={() => {
                                    setSelectedClientForDiscovery(client)
                                    setIsTaxDiscoveryOpen(true)
                                  }}
                                  title="Step 1: Open Tax Discovery & 5-Income Heads Intake"
                                  className="px-2.5 py-1 text-[11px] font-semibold rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                >
                                  <Sparkles className="w-3 h-3 text-rose-600" />
                                  <span>Discovery</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveClientId(client.id)
                                  }}
                                  title="Make this client active across all modules"
                                  className="px-2 py-1 text-[11px] font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                >
                                  Select
                                </button>
                                <button
                                  onClick={() => openEditModal(client)}
                                  title="Edit Taxpayer Information"
                                  className="px-2 py-1 text-[11px] font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <Edit2 className="w-3 h-3 text-slate-500" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => openClientDrawer(client)}
                                  className="px-2 py-1 text-[11px] font-semibold rounded bg-teal-50 hover:bg-teal-100 text-teal-700 transition-colors cursor-pointer"
                                >
                                  Profile
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Remove taxpayer "${client.name}" (${client.pan}) from firm directory?`)) {
                                      deleteClient(client.id)
                                    }
                                  }}
                                  title="Delete taxpayer profile"
                                  className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FIRM TEAM & RBAC */}
      {activeTab === 'TEAM' && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{firmDetails.firmName}</h3>
              <p className="text-xs text-slate-500">
                ICAI Firm Registration: {firmDetails.registrationNo} • Head Office: {firmDetails.headOffice}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded bg-teal-100 text-teal-800 font-semibold border border-teal-200">
                Single-Firm Demo — Role & Permission Model
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {team.map((member) => (
              <div key={member.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      {member.role}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {member.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={member.avatar}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{member.name}</h4>
                      <p className="text-xs text-slate-500 font-mono">{member.membershipNo}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{member.phone}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Authorized Permissions
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {member.permissions.map((perm, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200 font-medium">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Assigned Cases:</span>
                  <span className="font-bold text-slate-800">{member.assignedCases} clients</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DPDP CONSENT VAULT */}
      {activeTab === 'CONSENT' && (
        <div className="space-y-4">
          <div className="bg-teal-50/80 border border-teal-200 p-4 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-teal-900">
                  Consent Workflow Demonstration (DPDP Concept)
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-teal-200/60 text-teal-900">
                  PROTOTYPE SIMULATION
                </span>
              </div>
              <p className="text-teal-800 mt-0.5 leading-relaxed">
                Illustrates compliant consent lifecycle management. Every record simulates an immutable consent entry containing the client's verified IP address, timestamp, and purpose limitation hash. (Disclaimer: Simulated demonstration only; not a legally certified digital signature).
              </p>
            </div>
          </div>

          {/* Pending Consent Action Banner for Testing */}
          {clients.filter((c) => c.consentStatus === 'Pending' || c.consentStatus === 'Pending Renewal').length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-xs">
              <h4 className="text-xs font-bold text-amber-900 mb-2">
                Clients Awaiting DPDP Digital Consent Authorization
              </h4>
              <div className="space-y-2">
                {clients
                  .filter((c) => c.consentStatus === 'Pending' || c.consentStatus === 'Pending Renewal')
                  .map((pendingClient) => (
                    <div
                      key={pendingClient.id}
                      className="bg-white p-3 rounded-lg border border-amber-200/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{pendingClient.name}</span>
                        <span className="text-slate-500 font-mono ml-2">({pendingClient.pan})</span>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          Status: {pendingClient.consentStatus} • Requires digital authorization before document processing.
                        </p>
                      </div>
                      <button
                        onClick={() => grantConsent(pendingClient.id)}
                        className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shrink-0 shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Simulate OTP Authorization</span>
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900">Cryptographic Consent Master Log</h3>
              <span className="text-xs text-slate-500">{consents.length} logged authorization proofs</span>
            </div>

            <div className="divide-y divide-slate-100">
              {consents.map((consent) => (
                <div key={consent.id} className="p-4 text-xs hover:bg-slate-50/60 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{consent.clientName}</span>
                      <span className="font-mono text-slate-500 text-xs">({consent.pan})</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                        {consent.assessmentYear}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={consent.status === 'ACTIVE' ? 'success' : 'warning'} size="xs">
                        {consent.status}
                      </Badge>
                      <span className="text-[11px] text-slate-400">
                        Granted: {formatDate(consent.timestamp, true)}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-700 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-2.5 text-[11px] leading-relaxed italic">
                    "{consent.legalDeclaration}"
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-500">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Client Verified IP:</span>
                      <span className="font-mono text-slate-700">{consent.ipAddress}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Valid Through:</span>
                      <span className="text-slate-700">{formatDate(consent.validUntil)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Cryptographic SHA-256 Hash:</span>
                      <div className="flex items-center gap-1 font-mono text-slate-700">
                        <span className="truncate">{consent.sessionIdHash.slice(0, 20)}...</span>
                        <button
                          onClick={() => copyToClipboard(consent.sessionIdHash, consent.id)}
                          className="text-teal-600 hover:text-teal-700 p-0.5 cursor-pointer"
                          title="Copy Full Hash"
                        >
                          {copiedConsentId === consent.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD TAXPAYER PROFILE */}
      <Modal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
        title="Onboard New Indian Taxpayer"
        subtitle="Step 1: Statutory entity classification, occupation profile, and case initiation"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
          {/* Validation / Backend Error Banner */}
          {onboardError && (
            <div role="alert" className="bg-rose-50 border border-rose-300 rounded-xl p-3 text-rose-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-rose-800 font-medium leading-relaxed">{onboardError}</div>
            </div>
          )}

          {/* Real-Time Duplicate PAN Alert Banner */}
          {isDuplicatePan && (
            <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 text-rose-900 flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs">Duplicate Client Warning</p>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  Taxpayer with PAN <strong>{formData.pan}</strong> is already onboarded as "<strong>{duplicateClient?.name}</strong>" in the active firm directory. Please use existing case or modify PAN.
                </p>
              </div>
            </div>
          )}

          {/* Section 1: Basic Identifiers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Taxpayer Full Legal Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh K. Narayanan"
                value={formData.name}
                onChange={(e) => {
                  setOnboardError(null)
                  setFormData({ ...formData, name: e.target.value })
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Permanent Account Number (PAN) *</label>
              <input
                type="text"
                required
                maxLength={10}
                placeholder="e.g. ABCPK9918F"
                value={formData.pan}
                onChange={(e) => {
                  setOnboardError(null)
                  setFormData({ ...formData, pan: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })
                }}
                className={`w-full uppercase font-mono bg-slate-50 border rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 ${
                  isDuplicatePan || (panUpperInput.length > 0 && !isValidPanFormat)
                    ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
                    : 'border-slate-200 focus:ring-rose-500'
                }`}
              />
              {panUpperInput.length > 0 && !isValidPanFormat && (
                <p className="text-[10px] text-rose-600 mt-1 font-medium">
                  Format: 5 letters, 4 digits, 1 letter (e.g. ABCPA1092F)
                </p>
              )}
            </div>
          </div>

          {/* Section 2: Statutory Taxpayer Identification (Separated from Occupation Profile!) */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Legal Taxpayer Entity (Section 2(31)) *
                </label>
                <select
                  value={formData.legalType}
                  onChange={(e) => setFormData({ ...formData, legalType: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
                >
                  {LEGAL_TAXPAYER_ENTITIES.map((ent) => (
                    <option key={ent.id} value={ent.id}>
                      {ent.label} ({ent.statutorySection})
                    </option>
                  ))}
                </select>
                <p className="text-[10.5px] text-slate-500 mt-1">
                  Expected PAN 4th Character: <strong className="font-mono text-slate-700 font-bold">'{getExpectedPan4thChar(formData.legalType)}'</strong>
                </p>
              </div>

              {/* Conditional Employment/Occupation Profile for Individuals */}
              {formData.legalType === 'INDIVIDUAL' ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-800">
                      Occupation / Income Profile *
                    </label>
                    <span className="text-[10px] text-teal-700 font-semibold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      Rule 12 Auto-Engine
                    </span>
                  </div>
                  <select
                    value={formData.occupationProfile}
                    onChange={(e) => setFormData({ ...formData, occupationProfile: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
                  >
                    {INDIVIDUAL_OCCUPATION_PROFILES.map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.label} — {prof.defaultRecommendedItr}
                      </option>
                    ))}
                  </select>
                  <div className="mt-1.5 p-2 rounded-lg bg-teal-50/70 border border-teal-200/60 text-[11px] text-teal-900 flex items-start gap-1.5 leading-snug">
                    <Info className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Don't know which ITR form applies?</strong> Select <em>"Multiple Income Streams / Don't Know"</em>. CA Bharat AI will automatically analyze the client's salary, business, stocks, rentals, and directorships in Stage 6 to decide the exact legal ITR form under CBDT Rule 12.
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Registration / CIN / Order Number
                  </label>
                  <input
                    type="text"
                    placeholder={formData.legalType === 'COMPANY' ? 'e.g. U72200KA2015PTC082910' : 'e.g. MH-MUM-2012-009182'}
                    value={formData.entityRegNo}
                    onChange={(e) => setFormData({ ...formData, entityRegNo: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono"
                  />
                  <p className="text-[10.5px] text-slate-500 mt-1">
                    Official incorporation / registration number
                  </p>
                </div>
              )}
            </div>

            {/* Conditional Sub-panel: Individual Details */}
            {formData.legalType === 'INDIVIDUAL' && (
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Residential Status</label>
                  <select
                    value={formData.residentialStatus}
                    onChange={(e) => setFormData({ ...formData, residentialStatus: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs cursor-pointer"
                  >
                    {RESIDENTIAL_STATUS_OPTIONS.map((res) => (
                      <option key={res.id} value={res.id}>{res.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dobOrDoi}
                    onChange={(e) => setFormData({ ...formData, dobOrDoi: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employer / Trade TAN</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="e.g. BLRT01928F"
                    value={formData.tan}
                    onChange={(e) => setFormData({ ...formData, tan: e.target.value.toUpperCase() })}
                    className="w-full uppercase font-mono bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Conditional Sub-panel: HUF Details */}
            {formData.legalType === 'HUF' && (
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Karta Full Legal Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Harish Chandra Singhania"
                    value={formData.kartaName}
                    onChange={(e) => setFormData({ ...formData, kartaName: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Karta Individual PAN *</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="e.g. AAAPH9921D"
                    value={formData.kartaPan}
                    onChange={(e) => setFormData({ ...formData, kartaPan: e.target.value.toUpperCase() })}
                    className="w-full uppercase font-mono bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">HUF Deed Date</label>
                  <input
                    type="date"
                    value={formData.hufDeedDate}
                    onChange={(e) => setFormData({ ...formData, hufDeedDate: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Conditional Sub-panel: Firm / LLP / Company / Trust Details */}
            {(formData.legalType === 'PARTNERSHIP_FIRM' || formData.legalType === 'LLP' || formData.legalType === 'COMPANY' || formData.legalType === 'TRUST') && (
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Responsible Person / Authorised Rep *</label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Khade (Director / Partner)"
                    value={formData.responsiblePersonName}
                    onChange={(e) => setFormData({ ...formData, responsiblePersonName: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Responsible Person PAN</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="e.g. ABCPK1234D"
                    value={formData.responsiblePersonPan}
                    onChange={(e) => setFormData({ ...formData, responsiblePersonPan: e.target.value.toUpperCase() })}
                    className="w-full uppercase font-mono bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Registered Office Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Suite 401, Nariman Point, Mumbai"
                    value={formData.registeredOffice}
                    onChange={(e) => setFormData({ ...formData, registeredOffice: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Contact & Service Assignment */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="client@domain.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mobile Number (WhatsApp)</label>
              <input
                type="tel"
                placeholder="+91 98200 12345"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Client Engagement Type</label>
              <select
                value={formData.isExistingClient ? 'EXISTING' : 'NEW'}
                onChange={(e) => setFormData({ ...formData, isExistingClient: e.target.value === 'EXISTING' })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs cursor-pointer font-medium"
              >
                <option value="NEW">New Taxpayer Client</option>
                <option value="EXISTING">Existing / Retaining Client</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Requested Service</label>
              <select
                value={formData.requestedService}
                onChange={(e) => setFormData({ ...formData, requestedService: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs cursor-pointer"
              >
                {REQUESTED_SERVICES.map((srv) => (
                  <option key={srv.id} value={srv.id}>{srv.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned CA Partner</label>
              <select
                value={formData.assignedPartner}
                onChange={(e) => setFormData({ ...formData, assignedPartner: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs cursor-pointer"
              >
                <option value="CA Rajesh Sharma (Partner)">CA Rajesh Sharma (FCA #049281)</option>
                <option value="CA Ananya Joshi (Partner)">CA Ananya Joshi (ACA #098124)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Staff In-Charge</label>
              <select
                value={formData.assignedStaff}
                onChange={(e) => setFormData({ ...formData, assignedStaff: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs cursor-pointer"
              >
                <option value="Ananya Joshi (Senior Associate)">Ananya Joshi (Senior Associate)</option>
                <option value="Vikram Joshi (Semi-Qualified)">Vikram Joshi (Semi-Qualified)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-500">
              * Onboarding automatically provisions DPDP Act 2023 digital consent log and links case to AY 2025-26.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddClientOpen(false)}
                className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isDuplicatePan || isOnboardingSubmit}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold shadow-xs transition-all active:scale-98 cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isOnboardingSubmit ? 'Saving Taxpayer...' : 'Onboard & Open Discovery'}</span>
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT TAXPAYER PROFILE */}
      <Modal
        isOpen={isEditClientOpen}
        onClose={() => setIsEditClientOpen(false)}
        title={`Edit Taxpayer Profile: ${editFormData.name}`}
        subtitle={`Fictional Demo Entity • PAN: ${editFormData.pan}`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleUpdateClient} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">PAN (Fictional Demo Identifier) *</label>
              <input
                type="text"
                required
                maxLength={10}
                value={editFormData.pan}
                onChange={(e) => setEditFormData({ ...editFormData, pan: e.target.value.toUpperCase() })}
                className="w-full uppercase font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Taxpayer Category (Sec 2(31))</label>
              <select
                value={editFormData.category}
                onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden cursor-pointer"
              >
                {ENTITY_GROUPS.map((group) => {
                  const groupCategories = STATUTORY_TAXPAYER_CATEGORIES.filter((c) => c.groupId === group.id)
                  return (
                    <optgroup key={group.id} label={group.label}>
                      {groupCategories.map((c) => (
                        <option key={c.id} value={c.category}>
                          {c.category} • {c.recommendedItr}
                        </option>
                      ))}
                    </optgroup>
                  )
                })}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Advisory Tier</label>
              <select
                value={editFormData.tier}
                onChange={(e) => setEditFormData({ ...editFormData, tier: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>
            </div>
          </div>

          {/* Statutory Entity Guidance */}
          {(() => {
            const cat = getCategoryDetails(editFormData.category)
            return (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] space-y-1">
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span>Statutory Authority: {cat.statutorySection}</span>
                  <span className="px-2 py-0.5 rounded font-mono font-bold bg-blue-100 text-blue-800 text-[10px]">
                    Recommended: {cat.recommendedItr}
                  </span>
                </div>
                <p className="text-slate-500 text-[10.5px]">
                  {cat.governingRules}
                </p>
              </div>
            )
          })()}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Employer / Business Name</label>
            <input
              type="text"
              value={editFormData.employer || ''}
              onChange={(e) => setEditFormData({ ...editFormData, employer: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditClientOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CLIENT DETAILS DRAWER */}
      {selectedClientForView && (
        <Modal
          isOpen={isClientDetailsOpen}
          onClose={() => setIsClientDetailsOpen(false)}
          title={`Taxpayer Master Record: ${selectedClientForView.name}`}
          subtitle={`PAN: ${selectedClientForView.pan} • Active AY: ${selectedClientForView.activeAY}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <img
                src={selectedClientForView.avatar}
                alt=""
                className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900">{selectedClientForView.name}</h4>
                <p className="text-slate-500 font-mono text-[11px]">{selectedClientForView.pan} • Aadhaar (Last 4): {selectedClientForView.aadhaarLast4}</p>
                <p className="text-slate-600 text-[11px] mt-0.5">{selectedClientForView.category}</p>
              </div>
              <Badge variant={selectedClientForView.tier === 'Platinum' ? 'purple' : 'teal'}>
                {selectedClientForView.tier} Tier
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Contact Details</span>
                <p className="text-slate-800 font-medium mt-1">{selectedClientForView.email}</p>
                <p className="text-slate-600">{selectedClientForView.phone}</p>
                <p className="text-slate-500 text-[11px] mt-1">{selectedClientForView.address}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Employer & Case Context</span>
                <p className="text-slate-800 font-medium mt-1">{selectedClientForView.employer}</p>
                <p className="text-slate-600">Assigned: {selectedClientForView.assignedTo}</p>
                <p className="text-slate-500 text-[11px] mt-1">Target Form: {selectedClientForView.itrType}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-2">
                Assessment Year History
              </span>
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg border border-teal-200 bg-teal-50/50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-teal-900">AY 2025-26 (Active Case)</span>
                    <p className="text-[11px] text-teal-700">Form: {selectedClientForView.itrType} • Status: {selectedClientForView.status}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedClientForDiscovery(selectedClientForView)
                        setIsClientDetailsOpen(false)
                        setIsTaxDiscoveryOpen(true)
                      }}
                      className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] cursor-pointer active:scale-98 transition-all flex items-center gap-1 shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Tax Discovery</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveClientId(selectedClientForView.id)
                        setIsClientDetailsOpen(false)
                      }}
                      className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] cursor-pointer active:scale-98 transition-all"
                    >
                      Open Workspace
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-slate-500">
                  <div>
                    <span className="font-semibold text-slate-800">AY 2024-25 (Prior Year)</span>
                    <p className="text-[11px]">ITR-1 Filed & Verified • Refund ₹18,400 Credited</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Archived ✓
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsClientDetailsOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: ADD TEAM MEMBER */}
      <Modal
        isOpen={isAddTeamMemberOpen}
        onClose={() => setIsAddTeamMemberOpen(false)}
        title="Invite CA Firm Staff Member"
        subtitle="Provision role-based access for Chartered Accountants, Senior Associates, or Clerks"
        maxWidth="max-w-md"
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Staff Member Name</label>
            <input
              type="text"
              placeholder="e.g. Vikram Joshi"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Firm Email</label>
            <input
              type="email"
              placeholder="vikram@sharmaca.in"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Role & Authority</label>
            <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden cursor-pointer">
              <option value="Senior Associate">Senior Associate (ACA)</option>
              <option value="Tax Clerk / Junior">Tax Clerk / Junior (Semi-Qualified)</option>
              <option value="CA Partner">CA Partner (FCA Sign-off)</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsAddTeamMemberOpen(false)}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                alert('Staff invitation email dispatched with multi-factor token.')
                setIsAddTeamMemberOpen(false)
              }}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer active:scale-98 transition-all"
            >
              Send Invite
            </button>
          </div>
        </div>
      </Modal>

      {/* STEP 1: CLIENT TAX DISCOVERY & INTAKE WORKSPACE */}
      {selectedClientForDiscovery && (
        <ClientTaxDiscoveryWorkspace
          client={selectedClientForDiscovery}
          isOpen={isTaxDiscoveryOpen}
          onClose={() => {
            setIsTaxDiscoveryOpen(false)
            setSelectedClientForDiscovery(null)
          }}
        />
      )}
    </div>
  )
}
