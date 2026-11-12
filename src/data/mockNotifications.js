// Notifications Mock Data (Fictional Demonstration Alerts)

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-001',
    title: 'Discrepancy Detected: Rahul S. (Demo Taxpayer)',
    message: 'AIS reported ₹46,000 savings interest not declared in Form 16. Action required in 3-way reconciliation.',
    timestamp: '10 minutes ago',
    read: false,
    type: 'warning',
    link: '/tax-reconciliation',
  },
  {
    id: 'notif-002',
    title: 'Simulated Sign-Off: Vikram M. (Demo Taxpayer)',
    message: 'CA Rajesh Sharma completed simulated review on ITR-1 filing pack. Demonstration action complete.',
    timestamp: '1 hour ago',
    read: false,
    type: 'success',
    link: '/insights-delivery',
  },
  {
    id: 'notif-003',
    title: 'Consent Renewal Pending: Sneha K. (Demo Taxpayer)',
    message: 'Consent demonstration for AY 2024-25 expired. Client sent simulated re-authorization link via WhatsApp.',
    timestamp: '3 hours ago',
    read: true,
    type: 'info',
    link: '/firm-clients',
  },
  {
    id: 'notif-004',
    title: 'Simulated Extraction Completed: Priya V. (Demo Taxpayer)',
    message: 'Simulated extraction completed. Presumptive tax schedules generated for Section 44ADA review.',
    timestamp: '5 hours ago',
    read: true,
    type: 'info',
    link: '/document-intelligence',
  },
]
