// CA Bharat AI — Product Roadmap Beyond the Initial MVP
// Directly corresponds to the "Product roadmap beyond the initial MVP" on Page 9 of the official specification

export const PRODUCT_ROADMAP = [
  {
    phase: 'Phase 1',
    name: 'MVP (Current Scope)',
    tagline: 'End-to-End Tax Compliance & Human-in-the-Loop Verification',
    badge: 'Current Scope',
    badgeVariant: 'emerald',
    scope: [
      'Firm setup, user management, and single-firm role-based access control',
      'Client onboarding, PAN master deduplication, and DPDP digital consent management',
      'Document Vault intake with in-memory decryption concept and file versioning',
      'AI OCR extraction with coordinate bounding-box citations for Form 16, 26AS, and AIS',
      'Data sanity validation and automated client follow-up notifications',
      '3-Way cross-reconciliation engine (Form 16 vs 26AS vs AIS) and CA discrepancy disposition',
      'Deterministic ITR selection (ITR-1 through ITR-7) and dual-regime optimizer (Section 115BAC)',
      'Illustrative CA Review Checklist and simulated CA sign-off gateway',
      'Approved tax reporting, 1-page financial snapshot, and 2-page Financial Eye-Opener report',
      'Immutable, append-only audit trail and 8-year statutory document retention architecture',
    ],
    boundaries: 'No autonomous filing without CA approval; zero LLM arithmetic; strictly verified source data.',
  },
  {
    phase: 'Phase 2',
    name: 'Monthly Insights',
    tagline: 'Continuous Advisory & Consent-Based Cash Flow Analytics',
    badge: 'Next Milestone',
    badgeVariant: 'azure',
    scope: [
      'Consent-based Account Aggregator (AA) integrations with licensed NBFC-AA entities',
      'Monthly income, spending, and savings trend analytics',
      'Quarterly advance tax estimation alerts (15 Jun, 15 Sep, 15 Dec, 15 Mar) u/s 208',
      'Year-round capital gains harvesting and equity LTCG threshold (₹1.25L) tracking',
      'Gold tier monthly cash-flow advisory reports delivered under human CA supervision',
    ],
    boundaries: 'Requires separate explicit client consent under DPDP; subject to RBI Account Aggregator guidelines; no automated investment trading.',
  },
  {
    phase: 'Phase 3',
    name: 'Partner Ecosystem',
    tagline: 'Professional Advisory Network & Integrated Financial Services',
    badge: 'Planned',
    badgeVariant: 'amber',
    scope: [
      'Partner-supported financial data feeds from mutual fund RTAs, brokers, and banking APIs',
      'Professional wealth advisory workbench for SEBI-registered Investment Advisors (RIA)',
      'Direct integration with licensed digital signature token providers (e-Mudhra, Capricorn)',
      'Co-branded client mobile app for instant document scanning and approval notifications',
      'Platinum tier wealth information and professionally authorized guidance tools',
    ],
    boundaries: 'Strict professional boundaries between CA tax practice (ICAI regulations) and investment advisory; requires bilateral data sharing agreements.',
  },
  {
    phase: 'Phase 4',
    name: 'Bounded Agentic AI',
    tagline: 'Autonomous Triage with Strict Human Governance',
    badge: 'Future Vision',
    badgeVariant: 'purple',
    scope: [
      'Autonomous completeness checking agents that identify missing schedules from client statements',
      'Intelligent intake triage that categorizes multi-page mixed PDFs without manual tagging',
      'Draft preparation agents that assemble preliminary working papers for junior staff review',
      'Automated reconciliation suggestion heuristics with natural-language variance explanations',
    ],
    boundaries: 'Strictly READ-ONLY by default; zero autonomous filing or submission; mandatory human CA sign-off required for every consequential action.',
  },
]
