import React, { useState } from 'react'
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Building,
  Key,
  Copy,
  Check,
  ArrowRight,
  Calculator,
  Download,
  Eye,
  ExternalLink,
  Lock,
  RefreshCw,
  Search,
  Sparkles,
  Info,
  Layers,
  Send,
  MessageCircle,
  FileCheck,
  TrendingUp,
} from 'lucide-react'
import { STATUTORY_TAXPAYER_CATEGORIES } from '../../data/statutoryTaxpayerTypes'

export default function StepInteractiveSimulation({ step, clientPersona = 'rahul' }) {
  const [copied, setCopied] = useState(false)
  const [selectedHuf, setSelectedHuf] = useState(false)
  const [selectedCategoryKey, setSelectedCategoryKey] = useState('IND_SALARIED')
  const [selectedRegime, setSelectedRegime] = useState('new')
  const [discrepancyResolved, setDiscrepancyResolved] = useState(false)
  const [caApproved, setCaApproved] = useState(false)
  const [challanPaid, setChallanPaid] = useState(false)
  const [activeItrTab, setActiveItrTab] = useState('ITR-2')

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Render specific live preview based on step's interactiveDemoType
  switch (step.interactiveDemoType) {
    case 'firm_setup':
      return (
        <div className="space-y-4 text-xs">
          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-sm text-slate-100">Sharma & Co. Chartered Accountants</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-mono border border-emerald-500/30">
                FRN: DEMO012984N
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Tenant Partition Key</p>
                <p className="font-mono text-slate-200 mt-0.5">firm_sharma_nariman_pt_01</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Data Isolation Boundary</p>
                <p className="text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Single-Firm Encrypted Tenant
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800/80">
              <p className="text-[11px] text-slate-400 mb-2 font-medium">Assigned Team Roles & Permissions (RBAC):</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/50">
                  <span className="text-slate-200 font-medium">CA Rajesh Sharma (Partner • FCA #049281)</span>
                  <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Full Sign-Off Authority</span>
                </div>
                <div className="flex items-center justify-between bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/50">
                  <span className="text-slate-200 font-medium">Ananya Joshi (Senior Associate • ACA #098124)</span>
                  <span className="text-blue-400 text-[10px] bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">Reconciliation & Review</span>
                </div>
                <div className="flex items-center justify-between bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/50">
                  <span className="text-slate-200 font-medium">Rohan Mehta (Tax Clerk / Junior)</span>
                  <span className="text-amber-400 text-[10px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Document Intake Only</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )

    case 'client_onboard':
      return (
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900 text-sm">Taxpayer Master Profile Verification</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-medium border border-emerald-200">
              Deduplication Check: Passed ✓
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Full Legal Name</span>
              <span className="font-semibold text-slate-900">Arun Kumar Verma</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Permanent Account Number (PAN)</span>
              <span className="font-mono font-bold text-amber-700">ABCPA1092F</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Date of Birth / Inc</span>
              <span className="text-slate-800">14 August 1986</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Verified Contact</span>
              <span className="text-slate-800">+91 98201 11001 • arun.verma@example.com</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            PAN check confirmed validity with zero duplicate master profiles detected in firm directory.
          </p>
        </div>
      )

    case 'case_create':
      return (
        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <p className="font-semibold text-slate-900 text-sm">Tax-Year Case: AY 2025-26 (FY 2024-25)</p>
              <p className="text-[11px] text-slate-500">Case Reference: <span className="font-mono font-bold text-blue-700">CASE-2025-001</span></p>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-semibold text-[11px] border border-blue-200">
              Active Assessment Year
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 block uppercase">Assigned CA</span>
              <span className="font-medium text-slate-800">CA Rajesh Sharma</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 block uppercase">Assigned Associate</span>
              <span className="font-medium text-slate-800">Ananya Joshi</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 block uppercase">Statutory Deadline</span>
              <span className="font-medium text-amber-800 font-mono">31 July 2025</span>
            </div>
          </div>
        </div>
      )

    case 'consent_dpdp':
      return (
        <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span className="font-semibold text-slate-900">DPDP Act 2023 Digital Consent Authorization</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">
              ACTIVE ✓
            </span>
          </div>
          <p className="text-slate-700 text-[11px] leading-relaxed bg-white p-2.5 rounded-lg border border-amber-200/60 italic">
            "I hereby grant explicit digital consent to Sharma & Co. Chartered Accountants to collect, decrypt, extract, and reconcile my tax documents solely for the purpose of preparing and filing Income Tax Return for Assessment Year 2025-26 and providing continuous personal finance advisory."
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-slate-500 text-[10px] block">Verified Client IP & Location:</span>
              <span className="font-mono text-slate-800 font-medium">192.168.1.101 (Bengaluru, KA)</span>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-slate-500 text-[10px] block">Validity Expiration:</span>
              <span className="font-mono text-slate-800 font-medium">31 Mar 2027 (24-Month Scope)</span>
            </div>
          </div>
          <div className="bg-slate-900 text-slate-200 p-2 rounded-lg font-mono text-[10px] flex items-center justify-between">
            <span className="truncate pr-2">SHA-256: demo-hash-e3b0c44298fc1c149afbf4c8996fb92427ae41e464...</span>
            <button
              onClick={() => copyToClipboard('demo-hash-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 shrink-0 font-sans"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )

    case 'taxpayer_type': {
      const activeTaxCategory = STATUTORY_TAXPAYER_CATEGORIES.find((c) => c.id === selectedCategoryKey) || STATUTORY_TAXPAYER_CATEGORIES[0]
      return (
        <div className="space-y-3.5 text-xs">
          <div className="flex items-center justify-between">
            <p className="text-slate-600 text-[11px] font-medium">
              Select statutory entity classification under Section 2(31) of the Income-tax Act, 1961:
            </p>
            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              15 Statutory Types Active
            </span>
          </div>

          {/* Grid of entities */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
            {STATUTORY_TAXPAYER_CATEGORIES.map((item) => {
              const isSelected = item.id === activeTaxCategory.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedCategoryKey(item.id)
                    setSelectedHuf(item.groupId === 'HUF')
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-1 ring-blue-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      {item.groupName}
                    </span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                      {item.recommendedItr}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-900 truncate text-[11px]">{item.category}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">PAN 4th: '{item.pan4thChar}'</div>
                </button>
              )
            })}
          </div>

          {/* Active Entity Statutory Rule Summary */}
          <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="font-bold text-white text-xs">{activeTaxCategory.category}</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                {activeTaxCategory.statutorySection}
              </span>
            </div>

            <p className="text-slate-300 text-[11px] leading-relaxed">
              {activeTaxCategory.governingRules}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[10px] border-t border-slate-800 text-slate-400">
              <div>
                <span className="block text-slate-500">Applicable Forms:</span>
                <span className="text-slate-200 font-medium">{activeTaxCategory.applicableItr.join(', ')}</span>
              </div>
              <div>
                <span className="block text-slate-500">PAN 4th Character:</span>
                <span className="text-amber-300 font-mono font-bold">'{activeTaxCategory.pan4thChar}' ({activeTaxCategory.groupName})</span>
              </div>
              <div>
                <span className="block text-slate-500">Tax Regimes:</span>
                <span className="text-slate-200 font-medium truncate">{activeTaxCategory.taxRegimeOptions[0]}</span>
              </div>
            </div>

            <div className="pt-1 text-[10.5px] text-slate-400">
              <span className="text-slate-500 font-medium">Mandatory Document Intake: </span>
              <span className="text-slate-300">{activeTaxCategory.requiredDocs.join(' • ')}</span>
            </div>
          </div>
        </div>
      )
    }

    case 'prev_itr':
      return (
        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-semibold text-slate-900">Historical Comparison: AY 2024-25 vs AY 2025-26</span>
            <span className="text-slate-500 text-[11px]">Verified Carry-Forwards</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
              <span className="text-slate-700 font-medium">Brought-Forward Long Term Capital Loss (AY 23-24)</span>
              <span className="font-mono text-emerald-700 font-bold">₹42,500 (Eligible for set-off)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
              <span className="text-slate-700 font-medium">Previous Year Chosen Regime</span>
              <span className="font-mono text-slate-800">Old Regime (80C + 80D claimed)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
              <span className="text-slate-700 font-medium">Verified Property Details</span>
              <span className="text-slate-800">1 Self-Occupied (Home Loan Interest: ₹2,00,000)</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 italic">
            *Verification mandate: Prior year information is utilized for continuity, but every figure is independently verified against AY 2025-26 documents.
          </p>
        </div>
      )

    case 'income_sources':
      return (
        <div className="space-y-2 text-xs">
          <p className="text-slate-600 text-[11px] mb-2">Comprehensive 5-Heads of Income Discovery:</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { head: 'Income from Salary', status: 'Active (₹24,50,000)', doc: 'Form 16 Part A/B' },
              { head: 'Income from House Property', status: 'Loss: -₹2,00,000', doc: 'Sec 24(b) Loan Cert' },
              { head: 'Profits & Gains from Business/Prof.', status: 'Not Applicable', doc: 'N/A' },
              { head: 'Capital Gains (STCG & LTCG)', status: 'Active (₹1,45,000)', doc: 'Broker Tax P&L / AIS' },
              { head: 'Income from Other Sources', status: 'Active (₹84,200)', doc: 'AIS Savings & Dividend' },
              { head: 'Special: Agricultural / Foreign', status: 'Declared: ₹0', doc: 'Schedule FA / EI' },
            ].map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <div className="font-semibold text-slate-900">{item.head}</div>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className={item.status.includes('Active') || item.status.includes('Loss') ? 'text-blue-700 font-medium' : 'text-slate-400'}>
                    {item.status}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{item.doc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )

    case 'checklist':
      return (
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="font-semibold text-slate-900">Personalized Client Document Intake Checklist</span>
            <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Generated for Salaried + Capital Gains</span>
          </div>
          <div className="space-y-1.5">
            {[
              { doc: 'Form 16 (Part A & B from Employer)', mandatory: true, status: 'Uploaded' },
              { doc: 'TRACES Form 26AS Tax Credit Statement', mandatory: true, status: 'Uploaded' },
              { doc: 'Annual Information Statement (AIS / TIS)', mandatory: true, status: 'Uploaded' },
              { doc: 'Zerodha / CAMS Capital Gains Realized P&L', mandatory: true, status: 'Uploaded' },
              { doc: 'SBI / HDFC Savings Interest Certificates', mandatory: false, status: 'Awaiting' },
              { doc: 'Housing Loan Interest Certificate u/s 24(b)', mandatory: false, status: 'Uploaded' },
            ].map((chk, i) => (
              <div key={i} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200">
                <span className="font-medium text-slate-800">
                  {chk.doc} {chk.mandatory && <span className="text-amber-600 font-bold">*</span>}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                  chk.status === 'Uploaded' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {chk.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )

    case 'doc_upload':
      return (
        <div className="grid grid-cols-2 gap-3 text-xs">
          {[
            { name: 'ArunV_Form16_PartAB.pdf', type: 'Form 16', size: '1.4 MB', status: 'Encrypted in RAM', conf: '99.4%' },
            { name: 'TRACES_Form26AS_AY2526.pdf', type: 'Form 26AS', size: '820 KB', status: 'Encrypted in RAM', conf: '99.6%' },
            { name: 'AIS_TIS_Summary_AY2526.pdf', type: 'AIS / TIS', size: '2.1 MB', status: 'Encrypted in RAM', conf: '98.9%' },
            { name: 'HDFC_Bank_Statement.pdf', type: 'Bank Statement', size: '340 KB', status: 'Structured Ingest', conf: '100%' },
          ].map((file, i) => (
            <div key={i} className="bg-white border border-slate-200 p-3 rounded-lg space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 truncate pr-2">{file.name}</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">{file.conf}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{file.type} • {file.size}</span>
                <span className="flex items-center gap-1 text-slate-700 font-medium">
                  <Lock className="w-3 h-3 text-emerald-600" /> {file.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )

    case 'ocr_extract':
      return (
        <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-400" /> AI OCR Coordinate Evidence Citations
            </span>
            <span className="text-[11px] font-mono text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30">
              Pixel Bounding Boxes
            </span>
          </div>
          <div className="space-y-2">
            {[
              { field: 'Gross Salary u/s 17(1)', value: '₹24,50,000', source: 'Form 16 Part B', page: 'Page 2', bbox: '[x:142, y:380, w:180, h:24]', conf: '99.4%' },
              { field: 'Tax Deducted u/s 192 (Salary TDS)', value: '₹3,42,000', source: 'Form 16 Part A', page: 'Page 1', bbox: '[x:410, y:512, w:120, h:20]', conf: '99.8%' },
              { field: 'Savings Bank Interest SFT-005', value: '₹46,000', source: 'AIS Statement', page: 'Page 4', bbox: '[x:85, y:690, w:210, h:22]', conf: '98.7%' },
              { field: 'Dividend Credits u/s 194', value: '₹4,200', source: 'TRACES 26AS Part B', page: 'Page 1', bbox: '[x:320, y:210, w:110, h:18]', conf: '99.5%' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                <div>
                  <span className="text-slate-300 font-medium">{item.field}: </span>
                  <span className="font-mono font-bold text-amber-400">{item.value}</span>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Source: {item.source} ({item.page}) • Citation: <span className="font-mono text-blue-300">{item.bbox}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                  {item.conf}
                </span>
              </div>
            ))}
          </div>
        </div>
      )

    case 'validation':
      return (
        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-semibold text-slate-900">Automated Intake Sanity & PAN Integrity</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">ALL PASSED ✓</span>
          </div>
          <div className="space-y-2">
            {[
              { check: 'Taxpayer PAN Match Across All Files', result: 'Extracted PAN "DEMOP1234F" matches client master', pass: true },
              { check: 'Assessment Year Verification', result: 'AY 2025-26 confirmed across Form 16, 26AS & AIS', pass: true },
              { check: 'TDS Deduction vs Deposit Balance', result: 'Deducted ₹3,42,000 matches deposited ₹3,42,000 in TRACES', pass: true },
              { check: 'Mathematical Consistency Check', result: 'Gross Salary − Exemptions = Taxable Salary verified', pass: true },
            ].map((chk, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                <div>
                  <div className="font-medium text-slate-800">{chk.check}</div>
                  <div className="text-[10px] text-slate-500">{chk.result}</div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )

    case 'followup':
      return (
        <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-amber-700" /> Automated Gap Detection & Client Nudge
            </span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
              1 Gap Detected
            </span>
          </div>
          <p className="text-slate-700 text-[11px]">
            AI detected interest income in AIS (₹46,000) from HDFC Bank, but savings interest certificate was not uploaded.
          </p>
          <div className="bg-white p-3 rounded-lg border border-amber-200 space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Drafted Client WhatsApp Communication:</span>
            <p className="text-slate-800 text-[11px] italic bg-slate-50 p-2 rounded border border-slate-100">
              "Dear Arun, our automated review of your AY 2025-26 tax records identified ₹18,500 in savings interest reported in your AIS from HDFC Bank. Please confirm this figure so we can proceed with 3-way reconciliation."
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button className="px-3 py-1 bg-emerald-600 text-white rounded font-medium text-[11px] hover:bg-emerald-700 flex items-center gap-1">
                <Send className="w-3 h-3" /> Send via Firm WhatsApp
              </button>
            </div>
          </div>
        </div>
      )

    case 'reconciliation':
      return (
        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="font-semibold text-slate-900 text-sm">3-Way Cross-Reconciliation Matrix</span>
              <p className="text-[10px] text-slate-500">Form 16 Part A/B vs TRACES 26AS vs Income Tax AIS/TIS</p>
            </div>
            <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
              discrepancyResolved ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'
            }`}>
              {discrepancyResolved ? 'All Items Reconciled ✓' : '2 Differences Identified'}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-slate-200 rounded">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-2">Schedule</th>
                  <th className="p-2">Form 16</th>
                  <th className="p-2">Form 26AS</th>
                  <th className="p-2">AIS / TIS</th>
                  <th className="p-2">Variance</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                <tr>
                  <td className="p-2 font-medium text-slate-800">Salary (Sec 17)</td>
                  <td className="p-2 font-mono">₹24,50,000</td>
                  <td className="p-2 font-mono">₹24,50,000</td>
                  <td className="p-2 font-mono">₹24,50,000</td>
                  <td className="p-2 text-emerald-600 font-bold">₹0 (Matched)</td>
                  <td className="p-2"><span className="text-emerald-700 font-semibold">Matched ✓</span></td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-slate-800">Salary TDS (Sec 192)</td>
                  <td className="p-2 font-mono">₹3,42,000</td>
                  <td className="p-2 font-mono">₹3,42,000</td>
                  <td className="p-2 font-mono">₹3,42,000</td>
                  <td className="p-2 text-emerald-600 font-bold">₹0 (Matched)</td>
                  <td className="p-2"><span className="text-emerald-700 font-semibold">Matched ✓</span></td>
                </tr>
                <tr className={discrepancyResolved ? 'bg-emerald-50/50' : 'bg-rose-50/60'}>
                  <td className="p-2 font-medium text-slate-800">Savings Interest (SFT-005)</td>
                  <td className="p-2 text-slate-400 italic">Not in F16</td>
                  <td className="p-2 text-slate-400 italic">Not in 26AS</td>
                  <td className="p-2 font-mono font-bold text-slate-900">₹46,000</td>
                  <td className="p-2 text-rose-700 font-bold font-mono">+₹46,000</td>
                  <td className="p-2">
                    {discrepancyResolved ? (
                      <span className="text-emerald-700 font-bold">Accepted in OS ✓</span>
                    ) : (
                      <button
                        onClick={() => setDiscrepancyResolved(true)}
                        className="px-2 py-0.5 bg-rose-600 text-white rounded hover:bg-rose-700 text-[10px] font-medium"
                      >
                        Include in Return
                      </button>
                    )}
                  </td>
                </tr>
                <tr className={discrepancyResolved ? 'bg-emerald-50/50' : 'bg-amber-50/60'}>
                  <td className="p-2 font-medium text-slate-800">Dividend Income (Sec 194)</td>
                  <td className="p-2 text-slate-400 italic">Not in F16</td>
                  <td className="p-2 font-mono">₹4,200</td>
                  <td className="p-2 font-mono font-bold text-slate-900">₹4,200</td>
                  <td className="p-2 text-amber-700 font-bold font-mono">+₹4,200</td>
                  <td className="p-2">
                    {discrepancyResolved ? (
                      <span className="text-emerald-700 font-bold">Included u/s 56(2) ✓</span>
                    ) : (
                      <button
                        onClick={() => setDiscrepancyResolved(true)}
                        className="px-2 py-0.5 bg-amber-600 text-white rounded hover:bg-amber-700 text-[10px] font-medium"
                      >
                        Accept TDS & Income
                      </button>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-slate-500 italic">
            *Official principle: A difference is an actionable review item for the CA, not an automatic error.
          </p>
        </div>
      )

    case 'ca_correction':
      return (
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="font-semibold text-slate-900">CA Professional Disposition & Override Audit</span>
            <span className="text-slate-500 text-[11px]">Logged under FCA #049281</span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">Item: Unreported HDFC Savings Interest (+₹46,000)</span>
              <span className="text-emerald-700 text-[10px] bg-emerald-100 px-2 py-0.5 rounded font-bold">Resolved by CA</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              <span className="font-semibold text-slate-800">Decision:</span> Included under Schedule OS (Income from Other Sources). Under Section 80TTA, eligible deduction of ₹10,000 applied. Net taxable interest: ₹36,000.
            </p>
            <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>Auditor: CA Rajesh Sharma • FCA #049281</span>
              <span>Timestamp: 12 Jun 2025, 16:45:12 IST</span>
            </div>
          </div>
        </div>
      )

    case 'itr_select':
      return (
        <div className="space-y-3 text-xs">
          <p className="text-slate-600 text-[11px]">Dynamic ITR form eligibility evaluated based on taxpayer income criteria:</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { form: 'ITR-1', name: 'Sahaj', eligible: false, reason: 'Ineligible: Has Capital Gains > ₹0' },
              { form: 'ITR-2', name: 'Capital Gains & Salaried', eligible: true, reason: 'Eligible: Salary + HP + Capital Gains' },
              { form: 'ITR-3', name: 'Business / Profession', eligible: false, reason: 'Not Applicable: No business P&L' },
              { form: 'ITR-4', name: 'Sugam (Sec 44AD/ADA)', eligible: false, reason: 'Not Applicable: Not presumptive' },
            ].map((f) => (
              <button
                key={f.form}
                onClick={() => setActiveItrTab(f.form)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  f.form === activeItrTab
                    ? 'border-indigo-500 bg-indigo-50/80 ring-1 ring-indigo-400'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{f.form}</span>
                  {f.eligible ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">Eligible ✓</span>
                  ) : (
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Ineligible</span>
                  )}
                </div>
                <div className="text-[10px] text-slate-600 mt-1 font-medium">{f.name}</div>
                <div className="text-[9px] text-slate-400 mt-1">{f.reason}</div>
              </button>
            ))}
          </div>
          <div className="bg-indigo-50 p-2.5 rounded-lg border border-indigo-200 text-indigo-900 text-[11px]">
            <span className="font-bold">Form Selection Rule:</span> Selected <span className="font-mono font-bold">ITR-1 (Sahaj)</span> for Arun Kumar Verma based on resident salaried income (TCS) and single bank interest schedule without business turnover.
          </div>
        </div>
      )

    case 'regime_compare':
      return (
        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="font-semibold text-slate-900 text-sm">Deterministic Regime Optimizer (Finance Act 2024)</span>
              <p className="text-[10px] text-slate-500">Section 115BAC New Regime vs Old Tax Regime</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-300">
              New Regime Saves ₹28,600 ✓
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-lg border transition-all ${selectedRegime === 'old' ? 'border-amber-400 bg-amber-50/50' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900">Old Tax Regime</span>
                <span className="text-[10px] text-slate-500">With Deductions</span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between"><span>Gross Total Income:</span><span className="font-mono">₹24,50,000</span></div>
                <div className="flex justify-between"><span>Standard Deduction:</span><span className="font-mono">-₹50,000</span></div>
                <div className="flex justify-between"><span>Sec 80C + 80D + 24(b):</span><span className="font-mono">-₹3,75,000</span></div>
                <div className="flex justify-between font-semibold border-t border-slate-200 pt-1">
                  <span>Net Taxable Income:</span><span className="font-mono">₹20,25,000</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1">
                  <span>Total Tax Payable:</span><span className="font-mono text-rose-700">₹4,40,700</span>
                </div>
              </div>
            </div>

            <div className={`p-3 rounded-lg border transition-all ${selectedRegime === 'new' ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-400' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-emerald-900 flex items-center gap-1">
                  New Tax Regime u/s 115BAC <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.5 rounded">OPTIMAL</span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between"><span>Gross Total Income:</span><span className="font-mono">₹24,50,000</span></div>
                <div className="flex justify-between"><span>Standard Deduction (FA 2024):</span><span className="font-mono text-emerald-700">-₹75,000</span></div>
                <div className="flex justify-between text-slate-400 italic"><span>Chapter VI-A Deductions:</span><span>N/A</span></div>
                <div className="flex justify-between font-semibold border-t border-emerald-200 pt-1">
                  <span>Net Taxable Income:</span><span className="font-mono">₹23,75,000</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1">
                  <span>Total Tax Payable:</span><span className="font-mono text-emerald-700">₹4,12,100</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 flex items-center gap-1">
            <Calculator className="w-3.5 h-3.5 text-blue-600" />
            Deterministic calculation conforms to Finance Act 2024 slabs (0-3L Nil, 3-7L 5%, 7-10L 10%, 10-12L 15%, 12-15L 20%, &gt;15L 30%). Zero LLM arithmetic.
          </p>
        </div>
      )

    case 'tax_calc':
    case 'tax_payable':
      return (
        <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-semibold text-slate-100 text-sm">Final Tax Settlement Ledger</span>
            <span className="text-[10px] font-mono text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
              Rule: FA-2024-v2.1
            </span>
          </div>
          <div className="space-y-2 font-mono text-[11px]">
            <div className="flex justify-between text-slate-300">
              <span>Gross Tax Liability (u/s 115BAC):</span>
              <span>₹3,96,250</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Health & Education Cess (4%):</span>
              <span>₹15,850</span>
            </div>
            <div className="flex justify-between font-bold text-white border-t border-slate-800 pt-1.5">
              <span>Total Final Tax Liability:</span>
              <span className="text-amber-400">₹4,12,100</span>
            </div>
            <div className="flex justify-between text-slate-300 pt-1">
              <span>Prepaid TDS (Form 16 + 26AS):</span>
              <span className="text-emerald-400">-₹4,30,500</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-emerald-300 border-t border-slate-700 pt-2">
              <span>Net Direct Refund Due:</span>
              <span className="bg-emerald-500/20 px-2.5 py-0.5 rounded border border-emerald-500/30">
                ₹18,400 (Refund)
              </span>
            </div>
          </div>
        </div>
      )

    case 'ca_approval':
      return (
        <div className="bg-emerald-50/60 border border-emerald-300 p-4 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
            <span className="font-semibold text-emerald-950 text-sm flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-700" /> Illustrative CA Review Checklist & Approval Gateway
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold text-[10px]">
              {caApproved ? 'CA APPROVED ✓' : 'Awaiting CA Sign-Off'}
            </span>
          </div>
          <div className="space-y-1.5">
            {[
              { label: 'PAN Master & Entity Classification Verified', status: 'Passed ✓' },
              { label: 'All Statutory Documents Uploaded (4/4 in Vault)', status: 'Passed ✓' },
              { label: '3-Way Reconciliation Differences Addressed & Disposed', status: 'Passed ✓' },
              { label: 'Deterministic Regime Comparison Verified with Client', status: 'Passed ✓' },
            ].map((chk, i) => (
              <div key={i} className="flex items-center justify-between bg-white px-3 py-1.5 rounded border border-emerald-200/80">
                <span className="text-slate-800 font-medium">{chk.label}</span>
                <span className="text-emerald-700 font-bold text-[10px]">{chk.status}</span>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between">
            <span className="text-[11px] text-slate-600">
              Signatory: <strong className="text-slate-900">CA Rajesh Sharma (FCA #049281)</strong>
            </span>
            <button
              onClick={() => setCaApproved(!caApproved)}
              className={`px-4 py-1.5 rounded-lg font-bold text-xs shadow-xs transition-all ${
                caApproved
                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {caApproved ? 'Revoke Approval (Demo)' : 'Approve & Release for Filing (DSC Simulated)'}
            </button>
          </div>
        </div>
      )

    case 'engine2_explain':
    case 'annual_snapshot':
      return (
        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="font-semibold text-slate-900 text-sm">Engine 2: 2-Page Financial Eye-Opener Report</span>
              <p className="text-[10px] text-slate-500">Transforming compliance into ongoing wealth advisory</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-semibold text-[10px] border border-teal-200">
              Client Delivery Ready
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase block">Total Annual Earnings</span>
              <span className="font-bold text-slate-900 font-mono text-sm">₹24,50,000</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase block">Effective Tax Rate</span>
              <span className="font-bold text-blue-700 font-mono text-sm">16.8%</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase block">Derived Living Expenses</span>
              <span className="font-bold text-amber-700 font-mono text-sm">₹15,80,000</span>
            </div>
          </div>
          <div className="bg-teal-50/70 p-3 rounded-lg border border-teal-200 text-teal-950 space-y-1.5 text-[11px]">
            <span className="font-bold flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-teal-700" /> CA Wealth Advisory Observation:
            </span>
            <p>
              "AIS reports ₹46,000 in low-yield savings interest (~₹15.3 Lakhs idle balance @ 3% p.a.). Activating an automated bank 2-in-1 auto-sweep FD at 7.0% could generate ~₹61,000 in additional pre-tax interest annually."
            </p>
          </div>
        </div>
      )

    case 'audit_trail':
      return (
        <div className="bg-slate-900 text-slate-200 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-semibold text-white font-sans flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-rose-400" /> Immutable Regulatory Audit Trail
            </span>
            <span className="text-[10px] text-slate-400">Append-Only Ledger</span>
          </div>
          <div className="space-y-1.5 text-[10px]">
            <div className="flex justify-between border-b border-slate-800/60 pb-1 text-slate-400">
              <span>[2025-06-12 16:45:12] CA_Rajesh_FCA</span>
              <span className="text-emerald-400">DISCREPANCY_OVERRIDE (HDFC Interest Accepted)</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/60 pb-1 text-slate-400">
              <span>[2025-06-12 16:50:33] CA_Rajesh_FCA</span>
              <span className="text-amber-400">REGIME_OPTIMIZED (Section 115BAC Selected)</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/60 pb-1 text-slate-400">
              <span>[2025-06-12 17:02:18] CA_Rajesh_FCA</span>
              <span className="text-emerald-300">CA_APPROVAL_ISSUED (#DEMO049281)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>[2025-06-12 17:05:40] SYSTEM_DISPATCH</span>
              <span className="text-blue-300">REPORT_DELIVERED (Client IP 192.168.1.101)</span>
            </div>
          </div>
        </div>
      )

    default:
      return (
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-xs">
          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-600" /> Standard Step Execution Simulation
          </div>
          <p className="text-slate-600 text-[11px]">
            Step {step.number}: {step.title} is governed by {step.moduleName}. All operations are subject to role-based permissions and logged to the central audit trail.
          </p>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200 text-[11px]">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Primary Input</span>
              <span className="text-slate-800 font-medium">{step.inputs?.[0] || 'Verified records'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Primary Output</span>
              <span className="text-slate-800 font-medium">{step.outputs?.[0] || 'Audited status'}</span>
            </div>
          </div>
        </div>
      )
  }
}
