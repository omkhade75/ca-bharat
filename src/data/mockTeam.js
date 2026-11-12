// Firm & User Role Management Data (Fictional Demonstration Team)

export const INITIAL_TEAM = [
  {
    id: 'user-001',
    name: 'CA Rajesh Sharma (Demo Partner)',
    role: 'CA Partner',
    email: 'rajesh.demo@example.com',
    phone: '+91 90000 00010',
    membershipNo: 'FCA #DEMO049281',
    status: 'Active',
    assignedCases: 3,
    permissions: ['Full Access', 'Sign-Off Authority', 'ITR JSON Export', 'Team Admin'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-002',
    name: 'Ananya Joshi (Demo Associate)',
    role: 'Senior Associate',
    email: 'ananya.demo@example.com',
    phone: '+91 90000 00020',
    membershipNo: 'ACA #DEMO098124',
    status: 'Active',
    assignedCases: 2,
    permissions: ['Document Review', 'Reconciliation Edit', 'Client Comms', 'Draft Submissions'],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-003',
    name: 'Rohan Mehta (Demo Clerk)',
    role: 'Tax Clerk / Junior',
    email: 'rohan.demo@example.com',
    phone: '+91 90000 00030',
    membershipNo: 'Semi-Qualified (Demo)',
    status: 'Active',
    assignedCases: 1,
    permissions: ['Document Upload', 'OCR Verification', 'Data Entry', 'Client Follow-ups'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
]

export const FIRM_DETAILS = {
  firmName: 'Sharma & Co. Chartered Accountants',
  registrationNo: 'DEMO012984N',
  foundedYear: '2008',
  headOffice: 'Suite 408, Demo Financial Centre, Nariman Point, Mumbai - 400001',
  branchOffices: ['Bengaluru', 'New Delhi', 'Pune'],
  partnerInCharge: 'CA Rajesh Sharma, FCA (Demo)',
  supportContact: 'support.demo@example.com',
  activeClientsCount: 6,
  subscriptionTier: 'Prototype Demo Suite',
}
