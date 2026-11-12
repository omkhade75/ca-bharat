import React, { useState } from 'react'
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
  Check
} from 'lucide-react'
import { useApp } from '../../../context/AppContext'
import { formatDate } from '../../../utils/formatters'
import { WORKFLOW_STATUS_META } from '../../../utils/workflowHelper'
import Badge from '../../common/Badge'
import Modal from '../../common/Modal'

export default function FirmClientsModule() {
  const {
    clients,
    activeClient,
    setActiveClientId,
    addClient,
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
  const [selectedClientForView, setSelectedClientForView] = useState(null)
  const [isAddTeamMemberOpen, setIsAddTeamMemberOpen] = useState(false)
  const [copiedConsentId, setCopiedConsentId] = useState(null)

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

  // New client form state
  const [formData, setFormData] = useState({
    name: '',
    pan: '',
    aadhaarLast4: '',
    email: '',
    phone: '',
    category: 'Individual - Salaried',
    employer: '',
    tier: 'Gold',
    address: '',
    city: 'Mumbai',
    state: 'Maharashtra',
  })

  // Filter clients
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.pan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
    const matchesCategory =
      categoryFilter === 'ALL' || c.category.toLowerCase().includes(categoryFilter.toLowerCase())
    const matchesTier = tierFilter === 'ALL' || c.tier === tierFilter
    return matchesSearch && matchesCategory && matchesTier
  })

  const handleCreateClient = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.pan) {
      alert('Please provide client name and PAN.')
      return
    }
    const newId = addClient(formData)
    setIsAddClientOpen(false)
    setFormData({
      name: '',
      pan: '',
      aadhaarLast4: '',
      email: '',
      phone: '',
      category: 'Individual - Salaried',
      employer: '',
      tier: 'Gold',
      address: '',
      city: 'Mumbai',
      state: 'Maharashtra',
    })
    setSelectedClientForView(clients.find((c) => c.id === newId) || null)
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

  const handleUpdateClient = (e) => {
    e.preventDefault()
    updateClient(editFormData.id, editFormData)
    setIsEditClientOpen(false)
    if (selectedClientForView && selectedClientForView.id === editFormData.id) {
      setSelectedClientForView({ ...selectedClientForView, ...editFormData })
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

        <div className="flex items-center gap-2">
          {activeTab === 'CLIENTS' && (
            <button
              onClick={() => setIsAddClientOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Taxpayer Profile</span>
            </button>
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
                <option value="ALL">All Taxpayer Categories</option>
                <option value="Salaried">Salaried Individuals</option>
                <option value="Professional">Professionals (Sec 44ADA)</option>
                <option value="HUF">HUF</option>
                <option value="Investor">Investors / Traders</option>
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
                  {filteredClients.map((client) => {
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
                          <span className="font-medium text-slate-700">{client.category}</span>
                          <p className="text-[10px] text-slate-400 truncate max-w-xs">{client.employer || 'Private practice'}</p>
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
                          </div>
                        </td>

                        <td className="py-3 px-3 text-slate-600">
                          {client.assignedTo?.split(' (')[0]}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
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
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
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
        title="Onboard New Indian Taxpayer (Demo)"
        subtitle="Create taxpayer profile, assign Assessment Year, and initiate consent demonstration intake"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Taxpayer Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh K. Narayanan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-600"
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
                onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                className="w-full uppercase font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="client@domain.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mobile Number (for WhatsApp Alerts)</label>
              <input
                type="tel"
                placeholder="+91 98200 12345"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Taxpayer Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="Individual - Salaried">Individual - Salaried</option>
                <option value="Individual - Professional (Sec 44ADA)">Individual - Professional (Sec 44ADA)</option>
                <option value="Individual - Trader & Investor">Individual - Trader & Investor</option>
                <option value="HUF (Hindu Undivided Family)">HUF (Hindu Undivided Family)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Client Advisory Tier</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="Silver">Silver (Annual Filing + Eye-Opener)</option>
                <option value="Gold">Gold (Quarterly Advance Tax @ ₹499/mo)</option>
                <option value="Platinum">Platinum (SEBI RIA Wealth Advisory)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Employer / Business Name & TAN</label>
            <input
              type="text"
              placeholder="e.g. Wipro Limited (TAN: BLRW01298A)"
              value={formData.employer}
              onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-600">
            <span className="font-semibold text-slate-800">Consent Link Demo:</span> Upon creating this profile, an automated demonstration invitation link with a mock consent token will be prepared for the client.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddClientOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              Onboard & Generate Case
            </button>
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
              <label className="block font-semibold text-slate-700 mb-1">Taxpayer Category</label>
              <select
                value={editFormData.category}
                onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="Individual - Salaried">Individual - Salaried</option>
                <option value="Individual - Professional (Sec 44ADA)">Individual - Professional (Sec 44ADA)</option>
                <option value="Individual - Trader & Investor">Individual - Trader & Investor</option>
                <option value="HUF (Hindu Undivided Family)">HUF (Hindu Undivided Family)</option>
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
    </div>
  )
}
