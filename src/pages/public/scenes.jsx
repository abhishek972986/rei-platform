import React from 'react'

/**
 * Vector scenes used across the landing page. Everything is inline SVG so the
 * page renders identically offline, scales crisply and stays theme-aware.
 */

function Turbine({ x, y, scale = 1, dur = 9, tone = '#ffffff' }) {
  return (
    <g transform={'translate(' + x + ',' + y + ') scale(' + scale + ')'}>
      <rect x="-2" y="0" width="4" height="86" rx="2" fill={tone} opacity="0.92" />
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 0 0"
          to="360 0 0"
          dur={dur + 's'}
          repeatCount="indefinite"
        />
        {[0, 120, 240].map((a) => (
          <rect
            key={a}
            x="-2.4"
            y="-46"
            width="4.8"
            height="46"
            rx="2.4"
            fill={tone}
            transform={'rotate(' + a + ')'}
          />
        ))}
      </g>
      <circle cx="0" cy="0" r="4" fill={tone} />
    </g>
  )
}

function SolarArray({ x, y, rows = 2, cols = 4, scale = 1 }) {
  return (
    <g transform={'translate(' + x + ',' + y + ') scale(' + scale + ')'}>
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => (
          <g key={r + '-' + c} transform={'translate(' + c * 34 + ',' + r * 26 + ')'}>
            <path d="M0 18 L8 0 L38 0 L30 18 Z" fill="url(#panelGrad)" />
            <path d="M0 18 L8 0 L38 0 L30 18 Z" fill="none" stroke="#0b3a2c" strokeOpacity=".35" />
            <line x1="10" y1="0" x2="2" y2="18" stroke="#dbeafe" strokeOpacity=".55" />
            <line x1="20" y1="0" x2="12" y2="18" stroke="#dbeafe" strokeOpacity=".55" />
            <line x1="30" y1="0" x2="22" y2="18" stroke="#dbeafe" strokeOpacity=".55" />
            <rect x="14" y="18" width="3" height="9" fill="#475569" />
          </g>
        ))
      )}
    </g>
  )
}

function Cube({ x, y, s = 18, delay = 0 }) {
  return (
    <g transform={'translate(' + x + ',' + y + ')'} opacity="0.95">
      <animate
        attributeName="opacity"
        values="0.95;0.45;0.95"
        dur="3.2s"
        begin={delay + 's'}
        repeatCount="indefinite"
      />
      <path d={`M0 ${-s} L${s} ${-s / 2} L0 0 L${-s} ${-s / 2} Z`} fill="#7dd3fc" fillOpacity="0.9" />
      <path d={`M${-s} ${-s / 2} L0 0 L0 ${s} L${-s} ${s / 2} Z`} fill="#38bdf8" fillOpacity="0.75" />
      <path d={`M${s} ${-s / 2} L${s} ${s / 2} L0 ${s} L0 0 Z`} fill="#0ea5e9" fillOpacity="0.8" />
      <path
        d={`M0 ${-s} L${s} ${-s / 2} L${s} ${s / 2} L0 ${s} L${-s} ${s / 2} L${-s} ${-s / 2} Z`}
        fill="none"
        stroke="#e0f2fe"
        strokeOpacity="0.7"
      />
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export function HeroScene() {
  return (
    <svg
      viewBox="0 0 640 520"
      className="h-full w-full"
      role="img"
      aria-label="Wind turbines and solar panels feeding a verified renewable energy certificate on a blockchain network"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfe9ff" />
          <stop offset="55%" stopColor="#dff3f0" />
          <stop offset="100%" stopColor="#eafaf0" />
        </linearGradient>
        <linearGradient id="hillFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#86c98f" />
          <stop offset="100%" stopColor="#5faf76" />
        </linearGradient>
        <linearGradient id="hillMid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#63b877" />
          <stop offset="100%" stopColor="#3d9a5e" />
        </linearGradient>
        <linearGradient id="hillNear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4aa768" />
          <stop offset="100%" stopColor="#2f8552" />
        </linearGradient>
        <linearGradient id="panelGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f1f7f4" />
        </linearGradient>
        <clipPath id="blobClip">
          <path d="M340 14 C470 -10 620 60 628 190 C636 320 600 404 508 462 C416 520 268 522 168 470 C68 418 8 322 22 216 C36 110 130 44 218 24 C258 15 300 21 340 14 Z" />
        </clipPath>
        <filter id="cardShadow" x="-30%" y="-30%" width="170%" height="170%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#0b3a2c" floodOpacity="0.22" />
        </filter>
      </defs>

      <g clipPath="url(#blobClip)">
        <rect x="0" y="0" width="640" height="520" fill="url(#sky)" />

        {/* sun glow */}
        <circle cx="150" cy="96" r="54" fill="#fff7d6" opacity="0.75" />
        <circle cx="150" cy="96" r="28" fill="#ffe9a3" />

        {/* rolling hills */}
        <path d="M0 300 C90 262 170 292 250 278 C340 262 400 226 500 240 C570 250 610 268 640 258 L640 520 L0 520 Z" fill="url(#hillFar)" />
        <path d="M0 352 C110 318 200 350 300 336 C400 322 470 292 560 306 C600 312 622 322 640 316 L640 520 L0 520 Z" fill="url(#hillMid)" />
        <path d="M0 418 C120 386 210 414 320 402 C430 390 520 360 640 376 L640 520 L0 520 Z" fill="url(#hillNear)" />

        {/* field texture */}
        {Array.from({ length: 14 }).map((_, i) => (
          <path
            key={i}
            d={`M${-40 + i * 52} 520 C${10 + i * 52} 470 ${30 + i * 52} 448 ${70 + i * 52} 430`}
            stroke="#ffffff"
            strokeOpacity="0.08"
            strokeWidth="10"
            fill="none"
          />
        ))}

        {/* turbines */}
        <Turbine x={200} y={196} scale={0.95} dur={11} />
        <Turbine x={300} y={168} scale={1.18} dur={8} />
        <Turbine x={404} y={204} scale={0.8} dur={13} />

        {/* tree canopy top-right */}
        <g opacity="0.96">
          <circle cx="566" cy="36" r="52" fill="#357a4e" />
          <circle cx="624" cy="78" r="46" fill="#2c6b44" />
          <circle cx="614" cy="18" r="38" fill="#3d8757" />
          <circle cx="520" cy="8" r="34" fill="#2f6b45" />
          <circle cx="584" cy="104" r="30" fill="#31724a" />
        </g>

        {/* solar array */}
        <SolarArray x={54} y={352} rows={2} cols={4} scale={1.05} />

        {/* blockchain mesh */}
        <g transform="translate(472,318)">
          <circle cx="30" cy="60" r="96" fill="#38bdf8" opacity="0.16" />
          <g stroke="#e0f2fe" strokeOpacity="0.85" strokeWidth="1.8" strokeDasharray="5 6">
            <line x1="0" y1="0" x2="74" y2="34" />
            <line x1="0" y1="0" x2="-8" y2="78" />
            <line x1="74" y1="34" x2="70" y2="114" />
            <line x1="-8" y1="78" x2="70" y2="114" />
            <line x1="0" y1="0" x2="70" y2="114" />
          </g>
          {[
            [0, 0, 1],
            [74, 34, 2],
            [-8, 78, 3],
            [70, 114, 1.5],
          ].map(([cx, cy, d], i) => (
            <Cube key={i} x={cx} y={cy} s={23} delay={d} />
          ))}
        </g>

        {/* certificate card */}
        <g transform="translate(246,196) rotate(-3)" filter="url(#cardShadow)">
          <rect x="0" y="0" width="196" height="228" rx="16" fill="url(#cardGrad)" />
          <circle cx="34" cy="36" r="16" fill="#dcfce7" />
          <path
            d="M34 28 C28 32 27 42 34 46 C41 42 40 32 34 28 Z"
            fill="#16a34a"
          />
          <text x="20" y="86" fontSize="13" fontWeight="700" fill="#0c1b14" fontFamily="Inter, sans-serif">
            Renewable Energy
          </text>
          <text x="20" y="104" fontSize="13" fontWeight="700" fill="#0c1b14" fontFamily="Inter, sans-serif">
            Certificate
          </text>
          {[128, 146, 164].map((y, i) => (
            <rect key={y} x="20" y={y} width={i === 2 ? 92 : 140} height="7" rx="3.5" fill="#dbe7e1" />
          ))}
          <rect x="20" y="188" width="60" height="7" rx="3.5" fill="#dbe7e1" />
          <circle cx="160" cy="192" r="22" fill="#16a34a" />
          <path
            d="M150 192 l7 7 l13 -14"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Use-case thumbnails                                                 */
/* ------------------------------------------------------------------ */

export function UseCaseScene({ kind }) {
  const common = { viewBox: '0 0 320 170', className: 'h-full w-full', preserveAspectRatio: 'xMidYMid slice' }

  if (kind === 'wind')
    return (
      <svg {...common} role="img" aria-label="Wind farm across green fields">
        <defs>
          <linearGradient id="uw-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cfeaff" />
            <stop offset="100%" stopColor="#e9f7ee" />
          </linearGradient>
        </defs>
        <rect width="320" height="170" fill="url(#uw-sky)" />
        <path d="M0 104 C70 88 120 104 180 96 C240 88 280 78 320 88 L320 170 L0 170 Z" fill="#5faf76" />
        <path d="M0 130 C80 116 140 132 210 124 C260 118 290 112 320 118 L320 170 L0 170 Z" fill="#3d9a5e" />
        <Turbine x={72} y={54} scale={0.62} dur={10} />
        <Turbine x={158} y={40} scale={0.78} dur={8} />
        <Turbine x={248} y={58} scale={0.55} dur={12} />
      </svg>
    )

  if (kind === 'plant')
    return (
      <svg {...common} role="img" aria-label="Certificate issuing facility">
        <defs>
          <linearGradient id="up-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dbeafe" />
            <stop offset="100%" stopColor="#eef7f1" />
          </linearGradient>
        </defs>
        <rect width="320" height="170" fill="url(#up-sky)" />
        <path d="M0 120 C90 108 150 120 220 112 C270 106 296 102 320 108 L320 170 L0 170 Z" fill="#4aa768" />
        <g fill="#94a3b8">
          <rect x="48" y="66" width="34" height="62" rx="3" />
          <rect x="88" y="48" width="26" height="80" rx="3" fill="#cbd5e1" />
          <rect x="120" y="78" width="42" height="50" rx="3" />
          <rect x="170" y="58" width="22" height="70" rx="3" fill="#cbd5e1" />
          <rect x="198" y="86" width="52" height="42" rx="3" />
        </g>
        <g fill="#e2e8f0" opacity="0.9">
          <circle cx="101" cy="40" r="12" />
          <circle cx="116" cy="30" r="9" />
          <circle cx="181" cy="50" r="10" />
        </g>
        <SolarArray x={244} y={100} rows={1} cols={2} scale={0.62} />
      </svg>
    )

  if (kind === 'corporate')
    return (
      <svg {...common} role="img" aria-label="Corporate office buildings">
        <defs>
          <linearGradient id="uc-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cfe6ff" />
            <stop offset="100%" stopColor="#eaf4ff" />
          </linearGradient>
          <linearGradient id="uc-glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7cb7e8" />
            <stop offset="100%" stopColor="#3f7fb8" />
          </linearGradient>
        </defs>
        <rect width="320" height="170" fill="url(#uc-sky)" />
        <rect x="28" y="52" width="78" height="118" rx="4" fill="url(#uc-glass)" />
        <rect x="118" y="26" width="92" height="144" rx="4" fill="#5a97cd" />
        <rect x="222" y="64" width="70" height="106" rx="4" fill="url(#uc-glass)" />
        {Array.from({ length: 7 }).map((_, r) =>
          Array.from({ length: 4 }).map((_, c) => (
            <rect
              key={r + '-' + c}
              x={128 + c * 20}
              y={40 + r * 18}
              width="13"
              height="10"
              rx="1.5"
              fill="#e0f2fe"
              opacity={(r * 4 + c) % 3 === 0 ? 0.9 : 0.45}
            />
          ))
        )}
        <path d="M0 156 L320 156 L320 170 L0 170 Z" fill="#4aa768" />
      </svg>
    )

  return (
    <svg {...common} role="img" aria-label="Auditors reviewing records">
      <defs>
        <linearGradient id="ua-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8f1ee" />
          <stop offset="100%" stopColor="#d7e7e0" />
        </linearGradient>
      </defs>
      <rect width="320" height="170" fill="url(#ua-bg)" />
      <rect x="0" y="118" width="320" height="52" fill="#b9cfc6" />
      <rect x="42" y="110" width="236" height="12" rx="4" fill="#8fae a2" />
      <rect x="42" y="110" width="236" height="12" rx="4" fill="#8faea2" />
      {[
        [78, '#16a34a'],
        [138, '#0ea5e9'],
        [198, '#16a34a'],
        [252, '#64748b'],
      ].map(([x, c], i) => (
        <g key={i}>
          <circle cx={x} cy={72} r="15" fill={c} opacity="0.85" />
          <path d={`M${x - 22} 110 C${x - 22} 86 ${x + 22} 86 ${x + 22} 110 Z`} fill={c} opacity="0.7" />
        </g>
      ))}
      <rect x="96" y="92" width="46" height="30" rx="3" fill="#ffffff" opacity="0.92" />
      <rect x="104" y="100" width="30" height="3" rx="1.5" fill="#cbd5e1" />
      <rect x="104" y="108" width="22" height="3" rx="1.5" fill="#cbd5e1" />
      <rect x="178" y="96" width="52" height="26" rx="3" fill="#ffffff" opacity="0.92" />
      <rect x="186" y="104" width="34" height="3" rx="1.5" fill="#cbd5e1" />
      <rect x="186" y="112" width="24" height="3" rx="1.5" fill="#cbd5e1" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* CTA banner backdrop                                                 */
/* ------------------------------------------------------------------ */

export function CtaScene() {
  return (
    <svg
      viewBox="0 0 520 300"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
    >
      <defs>
        <linearGradient id="cta-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f5741" />
          <stop offset="100%" stopColor="#0b3a2c" />
        </linearGradient>
      </defs>
      <rect width="520" height="300" fill="url(#cta-sky)" />
      <circle cx="410" cy="72" r="44" fill="#22c55e" opacity="0.18" />
      <path d="M0 196 C90 176 160 196 250 186 C340 176 430 158 520 172 L520 300 L0 300 Z" fill="#0d4a37" />
      <path d="M0 238 C110 222 190 240 300 230 C390 222 460 212 520 220 L520 300 L0 300 Z" fill="#0a3528" />
      <Turbine x={132} y={88} scale={0.95} dur={11} tone="#d7f5e6" />
      <Turbine x={262} y={62} scale={1.2} dur={8.5} tone="#eafff5" />
      <Turbine x={392} y={100} scale={0.8} dur={13} tone="#cdeedd" />
      <SolarArray x={330} y={246} rows={1} cols={4} scale={0.72} />
    </svg>
  )
}
