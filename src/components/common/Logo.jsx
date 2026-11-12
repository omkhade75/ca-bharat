import React from 'react'

/**
 * Premium Bespoke Brand Logo for CA Bharat AI
 * Symbolizes:
 * - Outer Shield: Statutory Audit Trust, Legal Protection & DPDP Security
 * - Dual Pillars: Accounting Balance, Double-Entry Precision & Integrity
 * - Ascending Apex & Diamond: AI Intelligence, Growth & Sovereign Indian Wealth (Bharat)
 */
export function LogoMark({ size = 38, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <defs>
        {/* Shield Outer Gradient */}
        <linearGradient id="cabh-shield-bg" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B132B" />
          <stop offset="50%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#070D1E" />
        </linearGradient>

        {/* Shield Border Gradient: Royal Azure to Rich Amber Gold */}
        <linearGradient id="cabh-shield-border" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="35%" stopColor="#2563EB" />
          <stop offset="70%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Golden Left Pillar Gradient (Statutory Chartered Trust) */}
        <linearGradient id="cabh-gold-pillar" x1="14" y1="14" x2="19" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="30%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* Azure Right Pillar Gradient (AI & Algorithm Accuracy) */}
        <linearGradient id="cabh-azure-pillar" x1="29" y1="14" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#BAE6FD" />
          <stop offset="30%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Central Apex Glow */}
        <radialGradient id="cabh-apex-glow" cx="24" cy="13" r="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>

        {/* Emerald Core Balance Node */}
        <linearGradient id="cabh-emerald-node" x1="22" y1="22" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Drop shadow for 3D depth */}
        <filter id="cabh-glow" x="2" y="2" width="44" height="44" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0284C7" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Outer Protective Shield Contour */}
      <path
        d="M 24 5 L 39 10.5 C 39.8 10.8 40.5 11.6 40.5 12.5 C 40.5 24.5 33.5 35 24.5 42.5 C 24.2 42.7 23.8 42.7 23.5 42.5 C 14.5 35 7.5 24.5 7.5 12.5 C 7.5 11.6 8.2 10.8 9 10.5 L 24 5 Z"
        fill="url(#cabh-shield-bg)"
        stroke="url(#cabh-shield-border)"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />

      {/* Inner Subtle Geometric Micro-Grid Accent */}
      <path
        d="M 12 14.5 L 24 9.5 L 36 14.5"
        stroke="#334155"
        strokeWidth="0.8"
        strokeDasharray="2 2"
        opacity="0.6"
      />

      {/* Central Radiance Glow behind Apex */}
      <circle cx="24" cy="13" r="6" fill="url(#cabh-apex-glow)" opacity="0.45" />

      {/* Ascending Sovereign Apex Chevron (Growth & Bharat Direction) */}
      <path
        d="M 24 8.5 L 29 13.5 L 26.5 14.2 L 24 11.5 L 21.5 14.2 L 19 13.5 L 24 8.5 Z"
        fill="#FDE047"
      />

      {/* Left Pillar: The "C" & Golden Standard of Accounting Integrity */}
      <path
        d="M 15 17.5 C 15 16.1 16.1 15 17.5 15 L 18.5 15 C 19.9 15 21 16.1 21 17.5 L 21 30.5 C 21 31.9 19.9 33 18.5 33 L 17.5 33 C 16.1 33 15 31.9 15 30.5 Z"
        fill="url(#cabh-gold-pillar)"
      />

      {/* Right Pillar: The "A" & Azure Pillar of Algorithmic Precision */}
      <path
        d="M 27 17.5 C 27 16.1 28.1 15 29.5 15 L 30.5 15 C 31.9 15 33 16.1 33 17.5 L 33 30.5 C 33 31.9 31.9 33 30.5 33 L 29.5 33 C 28.1 33 27 31.9 27 30.5 Z"
        fill="url(#cabh-azure-pillar)"
      />

      {/* Interlocking Arch Bridge (Balance of Debits & Credits / Cross-Reconciliation) */}
      <path
        d="M 18.5 23 L 29.5 23"
        stroke="#F8FAFC"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Diagonal Architecture Struts (Forming dynamic 'C' & 'A' balance) */}
      <path
        d="M 19 19 L 29 27"
        stroke="#38BDF8"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Central Diamond Node (The Emerald Intelligence Anchor / Financial Reconciled Core) */}
      <polygon
        points="24,20.5 27,24 24,27.5 21,24"
        fill="url(#cabh-emerald-node)"
        stroke="#ECFDF5"
        strokeWidth="1"
      />

      {/* Central AI Micro-Spark */}
      <circle cx="24" cy="24" r="1.2" fill="#FFFFFF" />
    </svg>
  )
}

export default function Logo({
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  variant = 'full', // 'full' | 'icon' | 'horizontal'
  theme = 'dark', // 'dark' | 'light'
  className = '',
}) {
  const pixelSizes = {
    sm: 30,
    md: 38,
    lg: 48,
    xl: 60,
  }

  const px = pixelSizes[size] || 38

  if (variant === 'icon') {
    return <LogoMark size={px} className={className} />
  }

  const isDark = theme === 'dark'

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className="relative shrink-0">
        <LogoMark size={px} />
        {/* Subtle dynamic glow ring around logo mark */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-amber-500/20 via-blue-500/20 to-teal-500/10 blur-sm -z-10 pointer-events-none" />
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`font-extrabold tracking-tight text-base leading-none ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            CA Bharat
          </span>
          <span
            className={`text-[10px] uppercase font-extrabold tracking-widest px-1.5 py-0.5 rounded shadow-xs ${
              isDark
                ? 'bg-gradient-to-r from-amber-500/20 via-teal-500/20 to-blue-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            AI
          </span>
        </div>
        <p
          className={`text-[10.5px] font-medium tracking-tight mt-1 truncate ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          Chartered Tax & Wealth Intelligence
        </p>
      </div>
    </div>
  )
}
