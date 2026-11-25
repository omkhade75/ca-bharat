// CA Bharat AI — Platform Controls Across the Entire Workflow
// Directly corresponds to the "Controls Across the Entire Workflow" table on Page 9 of the official specification

export const PLATFORM_CONTROLS = [
  {
    id: 'security-privacy',
    title: 'Security & Privacy',
    whatItMeans: 'Protect client financial information; process it only for recorded, permitted purposes.',
    architectureScope:
      'Ephemeral in-memory sandbox decryption, AES-256 encrypted storage, strict purpose-limited consent tokens under the DPDP Act, and zero unauthorized data scraping.',
    stagesGoverned: 'Stage 1, 2, 3, 5, 6, 7',
    iconName: 'Lock',
    riskMitigated: 'Unauthorized financial disclosure, data leaks, and regulatory non-compliance with data privacy laws.',
    status: 'Active Across Platform',
  },
  {
    id: 'role-based-access',
    title: 'Role-Based Access (RBAC)',
    whatItMeans: 'Allow users to see and change only information they are authorised to handle.',
    architectureScope:
      'Hierarchical permissions separating Managing Partners (full sign-off & JSON export), Senior Associates (review, correction, client comms), and Junior Staff (upload & data verification).',
    stagesGoverned: 'Stage 1, 2, 4, 5, 6, 7',
    iconName: 'UserCheck',
    riskMitigated: 'Accidental modification of audited figures, unauthorized filing, or staff exceeding professional scope.',
    status: 'Active Across Platform',
  },
  {
    id: 'firm-data-isolation',
    title: 'Firm Data Isolation',
    whatItMeans: "Keep one CA firm's data separate from every other firm.",
    architectureScope:
      'Strict logical data partition keys, isolated tenant schemas, distinct encryption seeds, and zero cross-firm data bleeding in multi-tenant environments.',
    stagesGoverned: 'Stage 1, 3, 7',
    iconName: 'Layers',
    riskMitigated: 'Cross-tenant information contamination or unauthorized access between competing accounting practices.',
    status: 'Active Across Platform',
  },
  {
    id: 'traceability',
    title: 'Traceability',
    whatItMeans: 'Preserve source documents and record important changes, corrections and approvals.',
    architectureScope:
      'Every extracted figure preserves pixel coordinate citations to the source PDF; every manual adjustment logs who changed it, when, and why; every approval creates an immutable audit stamp.',
    stagesGoverned: 'Stage 1, 2, 3, 4, 5, 6, 7',
    iconName: 'History',
    riskMitigated: 'Unexplained number changes, audit trail failure during income tax scrutiny, and lack of internal accountability.',
    status: 'Active Across Platform',
  },
  {
    id: 'ai-reliability',
    title: 'AI Reliability',
    whatItMeans: 'Validate structured AI outputs; retain source references and relevant model/version details.',
    architectureScope:
      'Coordinate localization evidence scoring, cross-field mathematical validation, audit trail logging, and strict prohibition of LLM-generated tax mathematics.',
    stagesGoverned: 'Stage 2, 3, 4, 6',
    iconName: 'Cpu',
    riskMitigated: 'OCR hallucinations, incorrect decimal placement, corrupted schedule extraction, and untested model drift.',
    status: 'Active Across Platform',
  },
  {
    id: 'human-approval',
    title: 'Human CA Approval',
    whatItMeans: 'Require authorised CA review before publishing final tax outputs and filing.',
    architectureScope:
      'Mandatory human-in-the-loop review gateway: the system cannot generate filing-ready JSON packages or client-ready reports until an authorized CA signs off via Digital Signature or verified PIN.',
    stagesGoverned: 'Stage 2, 3, 4, 5, 6',
    iconName: 'Award',
    riskMitigated: 'Autonomous filing errors, violation of ICAI professional standards, and statutory penalties for incorrect reporting.',
    status: 'Mandatory Gateway',
  },
  {
    id: 'manual-fallback',
    title: 'Manual Fallback',
    whatItMeans: 'Allow staff to continue through an approved manual process when AI services are unavailable.',
    architectureScope:
      'Direct manual data entry fields, spreadsheet import options, and manual override capabilities for every schedule if OCR services or network APIs experience downtime.',
    stagesGoverned: 'Stage 2, 3, 7',
    iconName: 'RefreshCw',
    riskMitigated: 'Filing season bottlenecks, dependency on external AI uptime, and work stoppages during peak deadline weeks.',
    status: 'Always Available',
  },
  {
    id: 'version-control-monitoring',
    title: 'Version Control & Monitoring',
    whatItMeans: 'Record applicable tax-rule versions and monitor errors, failures and security events.',
    architectureScope:
      'Every tax computation explicitly records the exact statutory ruleset version applied (e.g. Finance Act 2024 v2.1); automated error telemetry alerts the firm to failed jobs or system anomalies.',
    stagesGoverned: 'Stage 1, 3, 4, 7',
    iconName: 'Activity',
    riskMitigated: 'Applying outdated tax slab rates or obsolete exemptions, and silent computational failures.',
    status: 'Active Across Platform',
  },
]
