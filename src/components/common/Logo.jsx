import React from 'react'

/**
 * Premium Bespoke Brand Logo for CA Bharat AI
 * 
 * Visual Architecture:
 * - Sovereign Hexagonal Shield: Institutional audit security & DPDP compliance bedrock
 * - The "C" (Left Ribbon): Golden Chartered Accountancy trust, ICAI heritage & statutory vigilance
 * - The "A" (Right Apex): Sovereign ascending apex representing technological intelligence & national growth
 * - The Central Reconciliation Diamond: The emerald node of debits, credits, and 3-way tax alignment
 * - Sovereign Indian Tri-chromatic Resonance: Deep Saffron (#F59E0B), Titanium White (#FFFFFF), Reconciled Emerald (#10B981) on Royal Midnight Navy (#070E22)
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
        {/* Shield Deep Midnight Navy Gradient */}
        <linearGradient id="cabh-shield-bg" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#080E24" />
          <stop offset="50%" stopColor="#0D1838" />
          <stop offset="100%" stopColor="#050917" />
        </linearGradient>

        {/* Shield Subtle Precision Border: Saffron Gold into Deep Royal Blue */}
        <linearGradient id="cabh-border-grad" x1="8" y1="5" x2="40" y2="43" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="30%" stopColor="#D97706" />
          <stop offset="65%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Golden "C" Ribbon Gradient */}
        <linearGradient id="cabh-gold-c" x1="12" y1="14" x2="24" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="35%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* Azure-Indigo "A" Apex Gradient */}
        <linearGradient id="cabh-azure-a" x1="25" y1="13" x2="37" y2="35" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#BAE6FD" />
          <stop offset="30%" stopColor="#38BDF8" />
          <stop offset="70%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>

        {/* Reconciled Emerald Core Diamond */}
        <linearGradient id="cabh-emerald-diamond" x1="22" y1="21" x2="26" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Subtle Ambient Radial Glow */}
        <radialGradient id="cabh-ambient-glow" cx="24" cy="24" r="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.12" />
          <stop offset="60%" stopColor="#2563EB" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#080E24" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 1. Sovereign Hexagonal Shield Bedrock */}
      <path
        d="M 24 4.5 
           C 24.8 4.5 25.6 4.9 26.2 5.3 
           L 39.8 13.8 
           C 40.8 14.4 41.5 15.5 41.5 16.8 
           L 41.5 31.2 
           C 41.5 32.5 40.8 33.6 39.8 34.2 
           L 26.2 42.7 
           C 24.8 43.5 23.2 43.5 21.8 42.7 
           L 8.2 34.2 
           C 7.2 33.6 6.5 32.5 6.5 31.2 
           L 6.5 16.8 
           C 6.5 15.5 7.2 14.4 8.2 13.8 
           L 21.8 5.3 
           C 22.4 4.9 23.2 4.5 24 4.5 Z"
        fill="url(#cabh-shield-bg)"
        stroke="url(#cabh-border-grad)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* 2. Soft Ambient Radial Glow within Shield */}
      <circle cx="24" cy="24" r="16" fill="url(#cabh-ambient-glow)" />

      {/* 3. Subtle Hexagonal Inner Hairline */}
      <path
        d="M 24 8 
           L 37.5 16.5 
           L 37.5 31.5 
           L 24 40 
           L 10.5 31.5 
           L 10.5 16.5 Z"
        stroke="#1E293B"
        strokeWidth="0.8"
        strokeDasharray="2.5 2.5"
        opacity="0.75"
      />

      {/* 4. Left Architectural Wing: The "C" (Golden Chartered Accounting Standard) */}
      <path
        d="M 22.5 15.5 
           C 16.8 15.5 13 19.2 13 24 
           C 13 28.8 16.8 32.5 22.5 32.5"
        stroke="url(#cabh-gold-c)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* 5. Right Architectural Apex: The "A" (Ascending Technological Intelligence) */}
      <path
        d="M 25.5 32.5 
           L 31 15.5 
           L 36.5 32.5"
        stroke="url(#cabh-azure-a)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 6. Precision "A" Crossbar */}
      <path
        d="M 27.5 27.5 L 34.5 27.5"
        stroke="#60A5FA"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* 7. Central Horizon Reconciliation Axis (Balance of Debits & Credits) */}
      <line
        x1="18.5"
        y1="24"
        x2="28"
        y2="24"
        stroke="#FFFFFF"
        strokeWidth="1.4"
        strokeDasharray="1.5 1.5"
        opacity="0.85"
      />

      {/* 8. Central Reconciled Emerald Diamond (Section 143(1) Matched Node) */}
      <polygon
        points="24,20.5 27,24 24,27.5 21,24"
        fill="url(#cabh-emerald-diamond)"
        stroke="#ECFDF5"
        strokeWidth="0.9"
      />

      {/* 9. Titanium White Center Spark */}
      <circle cx="24" cy="24" r="1.1" fill="#FFFFFF" />

      {/* 10. Sovereign Apex Finial (Growth & Prosperity Star) */}
      <circle cx="31" cy="12.5" r="1.2" fill="#FDE047" />
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
      <div className="relative shrink-0 flex items-center justify-center">
        <LogoMark size={px} />
        {/* Crisp subtle halo backdrop */}
        <div className="absolute inset-0 rounded-2xl bg-amber-500/10 blur-sm -z-10 pointer-events-none" />
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`font-extrabold tracking-tight text-base sm:text-lg leading-none ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            CA Bharat
          </span>
          <span
            className={`text-[9.5px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md shadow-xs ${
              isDark
                ? 'bg-slate-800 text-amber-400 border border-slate-700/80'
                : 'bg-amber-50 text-amber-900 border border-amber-200/90'
            }`}
          >
            AI
          </span>
        </div>
        <p
          className={`text-[10px] font-semibold tracking-tight mt-1 truncate ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          Chartered Tax & Wealth Intelligence
        </p>
      </div>
    </div>
  )
}
