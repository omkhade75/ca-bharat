// Notifications Mock Data (Statutory Demonstration Alerts)

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-001',
    title: '3-Way Reconciliation Matched: Arun Kumar Verma',
    message: 'Form 16 TDS and TRACES 26AS reconciled with zero variance. Ready for CA sign-off under Section 115BAC.',
    timestamp: '10 minutes ago',
    read: false,
    type: 'success',
    link: '/tax-reconciliation',
  },
  {
    id: 'notif-002',
    title: 'Section 44ADA Schedule Verified: Dr. Radhika Sen',
    message: 'Presumptive professional receipts of ₹28.5L verified. 50% deemed profit computed for ITR-4 filing.',
    timestamp: '1 hour ago',
    read: false,
    type: 'info',
    link: '/tax-reconciliation',
  },
  {
    id: 'notif-003',
    title: 'HUF Deed & Consent Active: Singhania HUF',
    message: 'HUF digital consent token active for AY 2025-26. Karta verification completed for ITR-2.',
    timestamp: '3 hours ago',
    read: true,
    type: 'info',
    link: '/firm-clients',
  },
  {
    id: 'notif-004',
    title: 'Corporate Intake Staged: TechNova Systems Pvt Ltd',
    message: 'Audited financial statements and MCA disclosures staged for Section 115BAA corporate tax computation.',
    timestamp: '5 hours ago',
    read: true,
    type: 'info',
    link: '/document-intelligence',
  },
]
