import React from 'react'

/**
 * CA Bharat AI — Simple Light Modern Brand Logo
 * 
 * Aesthetic Philosophy:
 * - Light, Airy & Luminous: Crisp pure-white squircle with delicate rose-blush hairline
 * - The "C" (Left Arc): Warm rose-coral to golden saffron gradient (#F43F5E -> #FB7185 -> #F59E0B)
 * - The "A" (Right Apex): Sovereign royal blue & azure precision (#38BDF8 -> #2563EB)
 * - The Center Spark: Reconciled emerald core (#10B981) uniting Debits, Credits & 3-Way Audit
 * - Simple, human, and memorable at 24px, 38px, and 180px
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
        {/* Light Crisp Background Gradient: Pure White with subtle soft Rose-Blush base */}
        <linearGradient id="cabh-light-card-bg" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FFF1F2" />
        </linearGradient>

        {/* Delicate Light Pink/Rose Hairline Border */}
        <linearGradient id="cabh-light-border" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="40%" stopColor="#FCD34D" />
          <stop offset="75%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#A7F3D0" />
        </linearGradient>

        {/* Warm Rose-Coral to Saffron "C" Gradient */}
        <linearGradient id="cabh-rose-c" x1="12" y1="14" x2="24" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="45%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        {/* Crisp Azure-Indigo "A" Gradient */}
        <linearGradient id="cabh-azure-a" x1="25" y1="13" x2="37" y2="35" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Reconciled Emerald Core Diamond */}
        <linearGradient id="cabh-emerald-diamond" x1="22" y1="21" x2="26" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Soft Drop Shadow for physical elevation */}
        <filter id="cabh-light-shadow" x="0" y="1" width="48" height="48" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" floodColor="#F43F5E" floodOpacity="0.12" />
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#0F172A" floodOpacity="0.06" />
        </filter>
      </defs>

      {/* 1. Luminous Squircle Canvas */}
      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="11"
        fill="url(#cabh-light-card-bg)"
        stroke="url(#cabh-light-border)"
        strokeWidth="1.25"
        filter="url(#cabh-light-shadow)"
      />

      {/* 2. Left Monogram Arc: The "C" (Chartered Accounting & Human Care) */}
      <path
        d="M 22.5 15.5 
           C 16.5 15.5 12.5 19.2 12.5 24 
           C 12.5 28.8 16.5 32.5 22.5 32.5"
        stroke="url(#cabh-rose-c)"
        strokeWidth="3.4"
        strokeLinecap="round"
      />

      {/* 3. Right Monogram Apex: The "A" (AI Intelligence & Ascending Sovereign Growth) */}
      <path
        d="M 25.5 32.5 
           L 31 15.5 
           L 36.5 32.5"
        stroke="url(#cabh-azure-a)"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 4. Precision "A" Crossbar */}
      <path
        d="M 27.5 27.5 L 34.5 27.5"
        stroke="#60A5FA"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* 5. Horizontal Reconciliation Axis (Debits = Credits) */}
      <line
        x1="18"
        y1="24"
        x2="28"
        y2="24"
        stroke="#FB7185"
        strokeWidth="1.2"
        strokeDasharray="1.5 1.5"
        opacity="0.75"
      />

      {/* 6. Central Reconciled Emerald Diamond */}
      <polygon
        points="24,20.8 26.8,24 24,27.2 21.2,24"
        fill="url(#cabh-emerald-diamond)"
        stroke="#FFFFFF"
        strokeWidth="0.8"
      />

      {/* 7. Titanium Center Core Spark */}
      <circle cx="24" cy="24" r="1.1" fill="#FFFFFF" />

      {/* 8. Golden Apex Star Accent */}
      <circle cx="31" cy="12.5" r="1.2" fill="#F59E0B" />
    </svg>
  )
}

export default function Logo({
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  variant = 'full', // 'full' | 'icon' | 'horizontal'
  theme = 'light', // 'light' | 'dark'
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
        {/* Soft, light rose ambient glow */}
        <div className="absolute inset-0 rounded-2xl bg-rose-400/10 blur-sm -z-10 pointer-events-none" />
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
            className={`text-[9.5px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md shadow-2xs ${
              isDark
                ? 'bg-rose-950/70 text-rose-300 border border-rose-800/80'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
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
