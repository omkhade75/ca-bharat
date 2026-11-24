import React, { useState, useMemo } from 'react'
import {
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Briefcase,
  Home,
  TrendingUp,
  FileText,
  ShieldAlert,
  Coins,
  History,
  CheckSquare,
  Building2,
  User,
  Plus,
  Trash2,
  Save,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { useApp } from '../../../context/AppContext'
import { computeRecommendedItr } from '../../../data/statutoryTaxpayerTypes'
import { generateDynamicChecklist } from '../../../data/intakeSchema'

export default function ClientTaxDiscoveryWorkspace({ client, isOpen, onClose }) {
  const { updateClientIntake, addAuditLog } = useApp()
  const [activeTab, setActiveTab] = useState('FIVE_HEADS') // FIVE_HEADS | SPECIAL_DISCLOSURES | PRIOR_YEAR | DEDUCTIONS | DYNAMIC_CHECKLIST
  const [waiveModalItem, setWaiveModalItem] = useState(null)
  const [waiveReason, setWaiveReason] = useState('')

  // Working state for discovery
  const [discovery, setDiscovery] = useState(() => {
    return (
      client?.intakeDiscovery || {
        salary: { hasIncome: 'YES', hasMultipleEmployers: 'NO', hasJobChangeInYear: 'NO', employers: [{ employerName: client?.employer || '', tan: client?.tan || '', grossSalary: 0, tdsDeducted: 0, hasForm16: 'YES' }] },
        houseProperty: { hasIncome: 'NO', properties: [{ propertyType: 'SELF_OCCUPIED', ownershipSharePercentage: 100, annualRentReceived: 0, municipalTaxesPaid: 0, hasHousingLoan: 'NO', housingLoanInterest24b: 0 }] },
        businessProfession: { hasIncome: 'NO', businessName: '', grossTurnoverOrReceipts: 0, netProfitOrLoss: 0, isBooksMaintained: 'NO', presumptiveElection: 'NONE', caPresumptiveValidated: false, hasGstin: 'NO', gstin: '' },
        capitalGains: { hasIncome: 'NO', tradedEquitiesOrMutualFunds: 'NO', soldImmovableProperty: 'NO', soldUnlistedSharesOrOtherAssets: 'NO', summary: { equityStcg111A: 0, equityLtcg112A: 0, propertyLtcg: 0, otherGains: 0 } },
        otherSources: { hasIncome: 'YES', hasSavingsBankInterest: 'YES', estimatedSavingsInterest: 0, hasFdRdInterest: 'NO', estimatedFdInterest: 0, hasDividends: 'NO', estimatedDividends: 0 },
        specialDisclosures: { hasAgriculturalIncome: 'NO', agriculturalIncomeAmount: 0, hasForeignAssetsOrIncome: 'NO', hasCryptoOrVDA: 'NO', hasDirectorship: 'NO', hasUnlistedEquityShares: 'NO', receivedTaxNotice: 'NO' },
        previousYear: { hasPriorYearFiling: 'YES', priorItrForm: 'ITR-1 (Sahaj)', priorAckNumber: '192837465019283', priorAssessmentYear: 'AY 2024-25', priorRegime: 'NEW', priorGrossIncome: 0, priorTotalTaxPaid: 0, priorRefundReceived: 0, hasBroughtForwardLosses: 'NO', losses: { shortTermCapitalLoss: 0, longTermCapitalLoss: 0, businessLoss: 0, unabsorbedDepreciation: 0 } },
        deductions: { claimed80C: 0, proof80CStatus: 'PENDING', claimed80DHealth: 0, proof80DStatus: 'PENDING', claimed80CCD1B_NPS: 0, proofNPSStatus: 'NA', claimed80EEducationLoan: 0, claimed80GDonation: 0, claimed80GGRent: 0 },
        taxCreditsAndBank: { advanceTaxChallans: [], selfAssessmentChallans: [], bankAccounts: [{ accountNumber: '', ifscCode: '', bankName: '', accountType: 'SAVINGS', isPrimaryForRefund: true, isPrevalidated: true }] },
      }
    )
  })

  // Dynamic ITR computation
  const liveRecommendedItr = useMemo(() => {
    return computeRecommendedItr(client?.legalType || 'INDIVIDUAL', client?.occupationProfile, discovery)
  }, [client, discovery])

  // Dynamic checklist
  const liveChecklist = useMemo(() => {
    return generateDynamicChecklist(client, discovery)
  }, [client, discovery])

  if (!isOpen || !client) return null

  // Pill toggle helper for Yes / No / Not Sure
  const TriStatePill = ({ value, onChange, label, helpText }) => {
    return (
      <div className="flex flex-col gap-1.5 py-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800">{label}</span>
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => onChange('YES')}
              className={`px-3 py-1 rounded-md transition-all ${
                value === 'YES' ? 'bg-emerald-600 text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => onChange('NO')}
              className={`px-3 py-1 rounded-md transition-all ${
                value === 'NO' ? 'bg-slate-700 text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              No
            </button>
            <button
              type="button"
              onClick={() => onChange('NOT_SURE')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                value === 'NOT_SURE' ? 'bg-amber-500 text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Not sure
            </button>
          </div>
        </div>
        {helpText && <p className="text-[11px] text-slate-500 leading-relaxed">{helpText}</p>}
      </div>
    )
  }

  const handleSaveDiscovery = () => {
    updateClientIntake(client.id, discovery)
    addAuditLog(
      'INTAKE_SAVED',
      `Saved complete tax discovery for ${client.name} (${client.pan}). Recommended ITR aligned to ${liveRecommendedItr}.`,
      client.name,
      client.pan,
      'Discovery'
    )
    onClose()
  }

  const handleWaiveSubmit = () => {
    if (!waiveModalItem || !waiveReason.trim()) return
    // Mark item as waived in discovery
    setDiscovery((prev) => {
      const updated = { ...prev }
      if (waiveModalItem.category === 'DEDUCTIONS') {
        if (waiveModalItem.id === 'chk-80c-proofs') updated.deductions.proof80CStatus = 'WAIVED'
        if (waiveModalItem.id === 'chk-80d-proofs') updated.deductions.proof80DStatus = 'WAIVED'
      }
      return updated
    })
    setWaiveModalItem(null)
    setWaiveReason('')
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Workspace Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-linear-to-r from-slate-50 via-rose-50/20 to-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-rose-500 to-rose-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {client.legalType === 'INDIVIDUAL' ? <User className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{client.name}</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-200/80 font-semibold text-slate-700">
                  {client.pan}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold border border-rose-200">
                  {client.legalType}
                </span>
                {client.occupationProfile && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                    {client.occupationProfile}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Step 1: Client Intake & Statutory Tax Discovery • Assessment Year {client.activeAY || 'AY 2025-26'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Recommended Return:</span>
              <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[11px] font-mono">
                {liveRecommendedItr}
              </span>
            </div>
            <button
              onClick={handleSaveDiscovery}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Save & Link to Case
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workspace Tab Navigation */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center gap-1 shrink-0 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('FIVE_HEADS')}
            className={`py-3 px-3.5 border-b-2 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'FIVE_HEADS'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            5 Income Heads
          </button>
          <button
            onClick={() => setActiveTab('SPECIAL_DISCLOSURES')}
            className={`py-3 px-3.5 border-b-2 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'SPECIAL_DISCLOSURES'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Special Disclosures
          </button>
          <button
            onClick={() => setActiveTab('PRIOR_YEAR')}
            className={`py-3 px-3.5 border-b-2 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'PRIOR_YEAR'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Previous-Year & Losses
          </button>
          <button
            onClick={() => setActiveTab('DEDUCTIONS')}
            className={`py-3 px-3.5 border-b-2 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'DEDUCTIONS'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            Deductions & Bank
          </button>
          <button
            onClick={() => setActiveTab('DYNAMIC_CHECKLIST')}
            className={`py-3 px-3.5 border-b-2 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'DYNAMIC_CHECKLIST'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Dynamic Checklist ({liveChecklist.length})
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {/* TAB 1: 5 INCOME HEADS QUESTIONNAIRE */}
          {activeTab === 'FIVE_HEADS' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Tax Discovery Protocol:</strong> Select <strong>Yes</strong>, <strong>No</strong>, or <strong>Not sure</strong> for each head of income. Relevant follow-up questions and schedules will appear conditionally.
                </p>
              </div>

              {/* Head 1: Salary */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
                  <h3 className="text-xs font-bold text-slate-900">Income from Salaries & Pensions (Section 15–17)</h3>
                </div>
                <TriStatePill
                  label="Did the client receive salary, allowances, pension, or employer bonus during the year?"
                  value={discovery.salary?.hasIncome}
                  onChange={(v) => setDiscovery({ ...discovery, salary: { ...discovery.salary, hasIncome: v } })}
                />
                {discovery.salary?.hasIncome === 'YES' && (
                  <div className="pl-3 border-l-2 border-blue-200 mt-2 space-y-3 animate-fade-in bg-blue-50/30 p-3 rounded-r-lg">
                    <TriStatePill
                      label="Multiple employers or job change during the financial year?"
                      value={discovery.salary?.hasMultipleEmployers}
                      onChange={(v) => setDiscovery({ ...discovery, salary: { ...discovery.salary, hasMultipleEmployers: v } })}
                      helpText="If Yes, Form 16 from both employers will be required to aggregate income and prevent double basic exemption deductions."
                    />
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Primary Employer Name</label>
                        <input
                          type="text"
                          value={discovery.salary.employers?.[0]?.employerName || ''}
                          onChange={(e) => {
                            const emps = [...(discovery.salary.employers || [{}])]
                            emps[0] = { ...emps[0], employerName: e.target.value }
                            setDiscovery({ ...discovery, salary: { ...discovery.salary, employers: emps } })
                          }}
                          placeholder="e.g. Tata Consultancy Services Ltd"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Employer TAN</label>
                        <input
                          type="text"
                          maxLength={10}
                          value={discovery.salary.employers?.[0]?.tan || ''}
                          onChange={(e) => {
                            const emps = [...(discovery.salary.employers || [{}])]
                            emps[0] = { ...emps[0], tan: e.target.value.toUpperCase() }
                            setDiscovery({ ...discovery, salary: { ...discovery.salary, employers: emps } })
                          }}
                          placeholder="e.g. BLRT01928F"
                          className="w-full uppercase font-mono bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Head 2: House Property */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">2</span>
                  <h3 className="text-xs font-bold text-slate-900">Income from House Property (Section 22–27)</h3>
                </div>
                <TriStatePill
                  label="Does the client own house property (self-occupied, let-out, or commercial)?"
                  value={discovery.houseProperty?.hasIncome}
                  onChange={(v) => setDiscovery({ ...discovery, houseProperty: { ...discovery.houseProperty, hasIncome: v } })}
                />
                {discovery.houseProperty?.hasIncome === 'YES' && (
                  <div className="pl-3 border-l-2 border-purple-200 mt-2 space-y-3 animate-fade-in bg-purple-50/30 p-3 rounded-r-lg">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Property Status</label>
                        <select
                          value={discovery.houseProperty.properties?.[0]?.propertyType || 'SELF_OCCUPIED'}
                          onChange={(e) => {
                            const props = [...(discovery.houseProperty.properties || [{}])]
                            props[0] = { ...props[0], propertyType: e.target.value }
                            setDiscovery({ ...discovery, houseProperty: { ...discovery.houseProperty, properties: props } })
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs cursor-pointer"
                        >
                          <option value="SELF_OCCUPIED">Self-Occupied</option>
                          <option value="LET_OUT">Let Out (Rented)</option>
                          <option value="DEEMED_LET_OUT">Deemed Let Out</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Ownership Share (%)</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={discovery.houseProperty.properties?.[0]?.ownershipSharePercentage || 100}
                          onChange={(e) => {
                            const props = [...(discovery.houseProperty.properties || [{}])]
                            props[0] = { ...props[0], ownershipSharePercentage: Number(e.target.value) }
                            setDiscovery({ ...discovery, houseProperty: { ...discovery.houseProperty, properties: props } })
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Housing Loan Interest u/s 24(b) (₹)</label>
                        <input
                          type="number"
                          value={discovery.houseProperty.properties?.[0]?.housingLoanInterest24b || 0}
                          onChange={(e) => {
                            const props = [...(discovery.houseProperty.properties || [{}])]
                            props[0] = { ...props[0], housingLoanInterest24b: Number(e.target.value), hasHousingLoan: Number(e.target.value) > 0 ? 'YES' : 'NO' }
                            setDiscovery({ ...discovery, houseProperty: { ...discovery.houseProperty, properties: props } })
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Head 3: Business & Profession */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">3</span>
                  <h3 className="text-xs font-bold text-slate-900">Profits & Gains of Business or Profession (Section 28–44D)</h3>
                </div>
                <TriStatePill
                  label="Does the client carry on any independent profession, business, agency, or trade?"
                  value={discovery.businessProfession?.hasIncome}
                  onChange={(v) => setDiscovery({ ...discovery, businessProfession: { ...discovery.businessProfession, hasIncome: v } })}
                />
                {discovery.businessProfession?.hasIncome === 'YES' && (
                  <div className="pl-3 border-l-2 border-amber-200 mt-2 space-y-3 animate-fade-in bg-amber-50/30 p-3 rounded-r-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Trade / Clinic / Firm Name</label>
                        <input
                          type="text"
                          value={discovery.businessProfession.businessName || ''}
                          onChange={(e) => setDiscovery({ ...discovery, businessProfession: { ...discovery.businessProfession, businessName: e.target.value } })}
                          placeholder="e.g. Sen Dental Care"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Gross Annual Turnover / Receipts (₹)</label>
                        <input
                          type="number"
                          value={discovery.businessProfession.grossTurnoverOrReceipts || 0}
                          onChange={(e) => setDiscovery({ ...discovery, businessProfession: { ...discovery.businessProfession, grossTurnoverOrReceipts: Number(e.target.value) } })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-amber-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-800">Presumptive Taxation Applicability (Subject to CA Review)</label>
                        <select
                          value={discovery.businessProfession.presumptiveElection || 'NONE'}
                          onChange={(e) => setDiscovery({ ...discovery, businessProfession: { ...discovery.businessProfession, presumptiveElection: e.target.value } })}
                          className="bg-amber-50 border border-amber-300 text-amber-900 rounded px-2 py-1 text-xs font-semibold cursor-pointer"
                        >
                          <option value="NONE">No Presumptive (Regular Books / Audit)</option>
                          <option value="44ADA">Section 44ADA (Notified Professional @ 50%)</option>
                          <option value="44AD">Section 44AD (Small Business @ 6% / 8%)</option>
                          <option value="44AE">Section 44AE (Goods Carriage Transporter)</option>
                        </select>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        * Note: Section 44AD/44ADA is a tax calculation attribute, NOT a legal taxpayer type. CA validation required.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Head 4: Capital Gains */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">4</span>
                  <h3 className="text-xs font-bold text-slate-900">Capital Gains (Section 45–55)</h3>
                </div>
                <TriStatePill
                  label="Did the client sell equities, mutual funds, land, flat, or other capital assets during the year?"
                  value={discovery.capitalGains?.hasIncome}
                  onChange={(v) => setDiscovery({ ...discovery, capitalGains: { ...discovery.capitalGains, hasIncome: v } })}
                />
                {discovery.capitalGains?.hasIncome === 'YES' && (
                  <div className="pl-3 border-l-2 border-emerald-200 mt-2 space-y-3 animate-fade-in bg-emerald-50/30 p-3 rounded-r-lg">
                    <TriStatePill
                      label="Traded shares, derivatives (F&O), or mutual funds through Demat?"
                      value={discovery.capitalGains?.tradedEquitiesOrMutualFunds}
                      onChange={(v) => setDiscovery({ ...discovery, capitalGains: { ...discovery.capitalGains, tradedEquitiesOrMutualFunds: v } })}
                      helpText="Requires Consolidated Broker Capital Gains Tax P&L Statement (Zerodha, Groww, AngelOne, etc.)."
                    />
                    <TriStatePill
                      label="Sold immovable property (plot, house, commercial space)?"
                      value={discovery.capitalGains?.soldImmovableProperty}
                      onChange={(v) => setDiscovery({ ...discovery, capitalGains: { ...discovery.capitalGains, soldImmovableProperty: v } })}
                      helpText="Requires registered sale deed, purchase deed, and Section 54/54EC exemption proof."
                    />
                  </div>
                )}
              </div>

              {/* Head 5: Other Sources */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-md bg-rose-100 text-rose-800 flex items-center justify-center text-xs font-bold">5</span>
                  <h3 className="text-xs font-bold text-slate-900">Income from Other Sources (Section 56–59)</h3>
                </div>
                <TriStatePill
                  label="Did the client earn interest, dividends, family pension, or miscellaneous income?"
                  value={discovery.otherSources?.hasIncome}
                  onChange={(v) => setDiscovery({ ...discovery, otherSources: { ...discovery.otherSources, hasIncome: v } })}
                />
                {discovery.otherSources?.hasIncome === 'YES' && (
                  <div className="pl-3 border-l-2 border-rose-200 mt-2 space-y-3 animate-fade-in bg-rose-50/30 p-3 rounded-r-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Estimated Savings Bank Interest (₹)</label>
                        <input
                          type="number"
                          value={discovery.otherSources.estimatedSavingsInterest || 0}
                          onChange={(e) => setDiscovery({ ...discovery, otherSources: { ...discovery.otherSources, estimatedSavingsInterest: Number(e.target.value) } })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Estimated Dividend Income (₹)</label>
                        <input
                          type="number"
                          value={discovery.otherSources.estimatedDividends || 0}
                          onChange={(e) => setDiscovery({ ...discovery, otherSources: { ...discovery.otherSources, estimatedDividends: Number(e.target.value) } })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SPECIAL DISCLOSURES */}
          {activeTab === 'SPECIAL_DISCLOSURES' && (
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-900">Mandatory Statutory Disclosures & Compliance Checks</h3>
                <p className="text-[11px] text-slate-500">Statutory reporting questions under CBDT rules and the Black Money Act.</p>
              </div>

              <TriStatePill
                label="1. Agricultural Income during the financial year?"
                value={discovery.specialDisclosures?.hasAgriculturalIncome}
                onChange={(v) => setDiscovery({ ...discovery, specialDisclosures: { ...discovery.specialDisclosures, hasAgriculturalIncome: v } })}
                helpText="If agricultural income exceeds ₹5,000, Schedule EI reporting is mandatory and ITR-1 cannot be filed."
              />
              {discovery.specialDisclosures?.hasAgriculturalIncome === 'YES' && (
                <div className="pl-3 border-l-2 border-emerald-400 bg-emerald-50/30 p-2.5 rounded-r-lg">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Gross Agricultural Income (₹)</label>
                  <input
                    type="number"
                    value={discovery.specialDisclosures.agriculturalIncomeAmount || 0}
                    onChange={(e) => setDiscovery({ ...discovery, specialDisclosures: { ...discovery.specialDisclosures, agriculturalIncomeAmount: Number(e.target.value) } })}
                    className="w-48 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
              )}

              <TriStatePill
                label="2. Foreign Assets or Income from Overseas Sources (Schedule FA)?"
                value={discovery.specialDisclosures?.hasForeignAssetsOrIncome}
                onChange={(v) => setDiscovery({ ...discovery, specialDisclosures: { ...discovery.specialDisclosures, hasForeignAssetsOrIncome: v } })}
                helpText="Mandatory disclosure of overseas bank accounts, foreign ESOPs/RSUs, and financial interests. Attracts Black Money Act penalties if omitted."
              />

              <TriStatePill
                label="3. Virtual Digital Assets / Crypto Transactions (Section 115BBH)?"
                value={discovery.specialDisclosures?.hasCryptoOrVDA}
                onChange={(v) => setDiscovery({ ...discovery, specialDisclosures: { ...discovery.specialDisclosures, hasCryptoOrVDA: v } })}
                helpText="Taxed at flat 30% without deduction of expenses except cost of acquisition. Losses cannot be set off."
              />

              <TriStatePill
                label="4. Directorship in Indian or Foreign Companies?"
                value={discovery.specialDisclosures?.hasDirectorship}
                onChange={(v) => setDiscovery({ ...discovery, specialDisclosures: { ...discovery.specialDisclosures, hasDirectorship: v } })}
                helpText="Requires Director Identification Number (DIN) and company name. Excludes taxpayer from filing ITR-1."
              />

              <TriStatePill
                label="5. Holding of Unlisted Equity Shares?"
                value={discovery.specialDisclosures?.hasUnlistedEquityShares}
                onChange={(v) => setDiscovery({ ...discovery, specialDisclosures: { ...discovery.specialDisclosures, hasUnlistedEquityShares: v } })}
                helpText="Requires company name, PAN, opening/closing balances and purchase cost."
              />

              <TriStatePill
                label="6. Any notices or inquiries received from Income Tax Department?"
                value={discovery.specialDisclosures?.receivedTaxNotice}
                onChange={(v) => setDiscovery({ ...discovery, specialDisclosures: { ...discovery.specialDisclosures, receivedTaxNotice: v } })}
              />
            </div>
          )}

          {/* TAB 3: PREVIOUS YEAR BENCHMARK */}
          {activeTab === 'PRIOR_YEAR' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-slate-900">Previous Assessment Year Benchmark & Rollover</h3>
                  <p className="text-[11px] text-slate-500">Record prior ITR details, regime choice, and brought-forward losses.</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Previous ITR Form Filed</label>
                    <select
                      value={discovery.previousYear?.priorItrForm || 'ITR-1 (Sahaj)'}
                      onChange={(e) => setDiscovery({ ...discovery, previousYear: { ...discovery.previousYear, priorItrForm: e.target.value } })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs cursor-pointer"
                    >
                      <option value="ITR-1 (Sahaj)">ITR-1 (Sahaj)</option>
                      <option value="ITR-2">ITR-2</option>
                      <option value="ITR-3">ITR-3</option>
                      <option value="ITR-4 (Sugam)">ITR-4 (Sugam)</option>
                      <option value="ITR-5">ITR-5</option>
                      <option value="ITR-6">ITR-6</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">15-Digit Acknowledgement No.</label>
                    <input
                      type="text"
                      maxLength={15}
                      value={discovery.previousYear?.priorAckNumber || ''}
                      onChange={(e) => setDiscovery({ ...discovery, previousYear: { ...discovery.previousYear, priorAckNumber: e.target.value } })}
                      placeholder="e.g. 192837465019283"
                      className="w-full font-mono bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Previous Regime Elected</label>
                    <select
                      value={discovery.previousYear?.priorRegime || 'NEW'}
                      onChange={(e) => setDiscovery({ ...discovery, previousYear: { ...discovery.previousYear, priorRegime: e.target.value } })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs cursor-pointer"
                    >
                      <option value="NEW">New Tax Regime (Section 115BAC)</option>
                      <option value="OLD">Old Tax Regime (with 80C/80D/HRA)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Prior Year Gross Total Income (₹)</label>
                    <input
                      type="number"
                      value={discovery.previousYear?.priorGrossIncome || 0}
                      onChange={(e) => setDiscovery({ ...discovery, previousYear: { ...discovery.previousYear, priorGrossIncome: Number(e.target.value) } })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Prior Total Tax Paid (₹)</label>
                    <input
                      type="number"
                      value={discovery.previousYear?.priorTotalTaxPaid || 0}
                      onChange={(e) => setDiscovery({ ...discovery, previousYear: { ...discovery.previousYear, priorTotalTaxPaid: Number(e.target.value) } })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Prior Refund Credited (₹)</label>
                    <input
                      type="number"
                      value={discovery.previousYear?.priorRefundReceived || 0}
                      onChange={(e) => setDiscovery({ ...discovery, previousYear: { ...discovery.previousYear, priorRefundReceived: Number(e.target.value) } })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 mb-2">Brought-Forward Losses & Unabsorbed Depreciation</h4>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 mb-1">Short-Term Capital Loss (₹)</label>
                      <input
                        type="number"
                        value={discovery.previousYear?.losses?.shortTermCapitalLoss || 0}
                        onChange={(e) =>
                          setDiscovery({
                            ...discovery,
                            previousYear: {
                              ...discovery.previousYear,
                              losses: { ...discovery.previousYear.losses, shortTermCapitalLoss: Number(e.target.value) },
                            },
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 mb-1">Long-Term Capital Loss (₹)</label>
                      <input
                        type="number"
                        value={discovery.previousYear?.losses?.longTermCapitalLoss || 0}
                        onChange={(e) =>
                          setDiscovery({
                            ...discovery,
                            previousYear: {
                              ...discovery.previousYear,
                              losses: { ...discovery.previousYear.losses, longTermCapitalLoss: Number(e.target.value) },
                            },
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 mb-1">Brought-Forward Business Loss (₹)</label>
                      <input
                        type="number"
                        value={discovery.previousYear?.losses?.businessLoss || 0}
                        onChange={(e) =>
                          setDiscovery({
                            ...discovery,
                            previousYear: {
                              ...discovery.previousYear,
                              losses: { ...discovery.previousYear.losses, businessLoss: Number(e.target.value) },
                            },
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 mb-1">Unabsorbed Depreciation (₹)</label>
                      <input
                        type="number"
                        value={discovery.previousYear?.losses?.unabsorbedDepreciation || 0}
                        onChange={(e) =>
                          setDiscovery({
                            ...discovery,
                            previousYear: {
                              ...discovery.previousYear,
                              losses: { ...discovery.previousYear.losses, unabsorbedDepreciation: Number(e.target.value) },
                            },
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEDUCTIONS & BANK DETAILS */}
          {activeTab === 'DEDUCTIONS' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-slate-900">Chapter VI-A Deductions & Investment Proof Status</h3>
                  <p className="text-[11px] text-slate-500">Record claimed amounts and supporting proof status. Tax eligibility is evaluated during reconciliation.</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Section 80C Claim (₹) (Max ₹1.5L)</label>
                    <input
                      type="number"
                      value={discovery.deductions?.claimed80C || 0}
                      onChange={(e) => setDiscovery({ ...discovery, deductions: { ...discovery.deductions, claimed80C: Number(e.target.value) } })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">80C Proof Status</label>
                    <select
                      value={discovery.deductions?.proof80CStatus || 'PENDING'}
                      onChange={(e) => setDiscovery({ ...discovery, deductions: { ...discovery.deductions, proof80CStatus: e.target.value } })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs cursor-pointer"
                    >
                      <option value="RECEIVED">Received & Verified</option>
                      <option value="PENDING">Pending from Client</option>
                      <option value="UNDER_REVIEW">Under CA Review</option>
                      <option value="NA">Not Applicable</option>
                      <option value="WAIVED">Waived with Reason</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Section 80D Medical Insurance (₹)</label>
                    <input
                      type="number"
                      value={discovery.deductions?.claimed80DHealth || 0}
                      onChange={(e) => setDiscovery({ ...discovery, deductions: { ...discovery.deductions, claimed80DHealth: Number(e.target.value) } })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Section 80CCD(1B) NPS (₹)</label>
                    <input
                      type="number"
                      value={discovery.deductions?.claimed80CCD1B_NPS || 0}
                      onChange={(e) => setDiscovery({ ...discovery, deductions: { ...discovery.deductions, claimed80CCD1B_NPS: Number(e.target.value) } })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Section 80G Donations (₹)</label>
                    <input
                      type="number"
                      value={discovery.deductions?.claimed80GDonation || 0}
                      onChange={(e) => setDiscovery({ ...discovery, deductions: { ...discovery.deductions, claimed80GDonation: Number(e.target.value) } })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Section 80E Education Loan Interest (₹)</label>
                    <input
                      type="number"
                      value={discovery.deductions?.claimed80EEducationLoan || 0}
                      onChange={(e) => setDiscovery({ ...discovery, deductions: { ...discovery.deductions, claimed80EEducationLoan: Number(e.target.value) } })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Account Verification */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Refund Bank Account Details</h3>
                    <p className="text-[11px] text-slate-500">Income tax refund will be credited directly to this pre-validated account.</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                    Pre-validation Confirmed ✓
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Bank Account Number</label>
                    <input
                      type="text"
                      value={discovery.taxCreditsAndBank?.bankAccounts?.[0]?.accountNumber || '50100294819281'}
                      onChange={(e) => {
                        const accs = [...(discovery.taxCreditsAndBank?.bankAccounts || [{}])]
                        accs[0] = { ...accs[0], accountNumber: e.target.value }
                        setDiscovery({ ...discovery, taxCreditsAndBank: { ...discovery.taxCreditsAndBank, bankAccounts: accs } })
                      }}
                      className="w-full font-mono bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      maxLength={11}
                      value={discovery.taxCreditsAndBank?.bankAccounts?.[0]?.ifscCode || 'HDFC0000060'}
                      onChange={(e) => {
                        const accs = [...(discovery.taxCreditsAndBank?.bankAccounts || [{}])]
                        accs[0] = { ...accs[0], ifscCode: e.target.value.toUpperCase() }
                        setDiscovery({ ...discovery, taxCreditsAndBank: { ...discovery.taxCreditsAndBank, bankAccounts: accs } })
                      }}
                      className="w-full uppercase font-mono bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={discovery.taxCreditsAndBank?.bankAccounts?.[0]?.bankName || 'HDFC Bank Ltd'}
                      onChange={(e) => {
                        const accs = [...(discovery.taxCreditsAndBank?.bankAccounts || [{}])]
                        accs[0] = { ...accs[0], bankName: e.target.value }
                        setDiscovery({ ...discovery, taxCreditsAndBank: { ...discovery.taxCreditsAndBank, bankAccounts: accs } })
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DYNAMIC DOCUMENT CHECKLIST */}
          {activeTab === 'DYNAMIC_CHECKLIST' && (
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Personalized Document Checklist ({liveChecklist.length} Required / Identified Items)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Generated dynamically based on <strong>{client.legalType}</strong> taxpayer category and 5-income-head answers.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Compliance Gauge:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                    {Math.round((liveChecklist.filter((c) => c.status === 'RECEIVED').length / liveChecklist.length) * 100)}% Ready
                  </span>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {liveChecklist.map((item, index) => (
                  <div key={item.id} className="py-3 flex items-start justify-between gap-3 hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-slate-900">{item.name}</h4>
                          {item.mandatory ? (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                              Mandatory
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                              Conditional
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.reason}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-md font-semibold border ${
                          item.status === 'RECEIVED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : item.status === 'REQUIRED' || item.status === 'REQUESTED'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : item.status === 'WAIVED'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {item.status}
                      </span>

                      {item.status !== 'WAIVED' && (
                        <button
                          type="button"
                          onClick={() => setWaiveModalItem(item)}
                          className="text-[11px] px-2 py-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          Waive...
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Last modified: <span className="font-mono text-slate-700">{new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveDiscovery}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Apply Discovery & Update Checklist
            </button>
          </div>
        </div>
      </div>

      {/* Waive Document Modal */}
      {waiveModalItem && (
        <div className="fixed inset-0 z-60 bg-slate-900/40 flex items-center justify-center p-3">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">Waive Document Requirement</h3>
              <button onClick={() => setWaiveModalItem(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              You are waiving <strong>{waiveModalItem.name}</strong> for {client.name}. Please state the statutory justification:
            </p>
            <textarea
              rows={3}
              value={waiveReason}
              onChange={(e) => setWaiveReason(e.target.value)}
              placeholder="e.g. Taxpayer opting for New Tax Regime u/s 115BAC; Chapter VI-A proof not required for assessment."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setWaiveModalItem(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleWaiveSubmit}
                disabled={!waiveReason.trim()}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold"
              >
                Confirm Waiver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
