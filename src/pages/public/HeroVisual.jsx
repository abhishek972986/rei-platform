import React from 'react'
import { ShieldCheck, Link2 } from 'lucide-react'

/**
 * Composed hero scene: a renewable generation site feeding a blockchain
 * mesh, with the AI risk verdict floating over it. Pure inline SVG so it
 * stays crisp, themed and dependency-free.
 */
export default function HeroVisual() {
  const nodes = [
    [40, 168],
    [104, 120],
    [104, 212],
    [176, 90],
    [176, 168],
    [176, 244],
    [248, 122],
    [248, 208],
    [312, 168],
  ]
  const links = [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 4],
    [2, 5],
    [3, 6],
    [4, 6],
    [4, 7],
    [5, 7],
    [6, 8],
    [7, 8],
  ]

  return (
    <div className="relative">
      <div className="glass relative overflow-hidden p-5">
        <div className="pointer-events-none absolute inset-0 grid-noise opacity-40" />

        <svg viewBox="0 0 360 300" className="relative w-full" role="img" aria-label="Renewable generation feeding a blockchain verification mesh">
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3987e5" />
              <stop offset="100%" stopColor="#1c5cab" />
            </linearGradient>
            <radialGradient id="sun">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#c98500" />
            </radialGradient>
            <filter id="soft">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          <rect x="0" y="0" width="360" height="300" fill="url(#sky)" />

          {/* --- sun --- */}
          <circle cx="300" cy="52" r="26" fill="url(#sun)" filter="url(#soft)" opacity="0.55" />
          <circle cx="300" cy="52" r="15" fill="url(#sun)" />

          {/* --- wind turbine --- */}
          <g transform="translate(64,34)">
            <rect x="-2.5" y="24" width="5" height="86" rx="2.5" fill="#475569" />
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 0 24"
                to="360 0 24"
                dur="9s"
                repeatCount="indefinite"
              />
              {[0, 120, 240].map((a) => (
                <rect
                  key={a}
                  x="-2"
                  y="-24"
                  width="4"
                  height="48"
                  rx="2"
                  fill="#cbd5e1"
                  transform={'rotate(' + a + ' 0 24)'}
                />
              ))}
            </g>
            <circle cx="0" cy="24" r="4" fill="#e2e8f0" />
          </g>

          {/* --- solar array --- */}
          <g transform="translate(150,60)">
            {[0, 1, 2].map((r) =>
              [0, 1, 2, 3].map((c) => (
                <rect
                  key={r + '-' + c}
                  x={c * 17}
                  y={r * 12}
                  width="15"
                  height="10"
                  rx="1.5"
                  fill="url(#panel)"
                  stroke="#0a1020"
                  strokeWidth="1"
                />
              ))
            )}
            <rect x="30" y="36" width="4" height="16" fill="#475569" />
          </g>

          {/* --- ground line --- */}
          <line x1="16" y1="122" x2="344" y2="122" stroke="rgba(255,255,255,.1)" strokeWidth="1" />

          {/* --- blockchain mesh --- */}
          <g transform="translate(0,20)">
            {links.map(([a, b], i) => (
              <line
                key={i}
                x1={nodes[a][0]}
                y1={nodes[a][1]}
                x2={nodes[b][0]}
                y2={nodes[b][1]}
                stroke="#22d3ee"
                strokeOpacity="0.35"
                strokeWidth="1.2"
                strokeDasharray="4 6"
                className="animate-dash"
              />
            ))}
            {nodes.map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="11" fill="#0a1020" stroke="#22d3ee" strokeOpacity="0.5" strokeWidth="1.2" />
                <circle cx={x} cy={y} r="4" fill={i % 3 === 0 ? '#10b981' : '#22d3ee'}>
                  <animate
                    attributeName="opacity"
                    values="1;0.35;1"
                    dur={2.4 + (i % 4) * 0.6 + 's'}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            ))}
          </g>
        </svg>

        {/* floating verdict card */}
        <div className="glass absolute bottom-5 left-5 right-5 flex items-center gap-3 border-emerald/25 bg-navy-880/85 p-3.5 animate-float">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald/15 text-emerald-300">
            <ShieldCheck size={19} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-xs text-cyan-300">REC-2026-018 · 4.2 MWh Wind</p>
            <p className="text-[11px] text-slate-400">AI verdict — 98.2% confidence</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-lg font-extrabold leading-none text-emerald-300">07</p>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">
              Low risk
            </p>
          </div>
        </div>
      </div>

      {/* side chips */}
      <div className="glass absolute -left-3 top-8 hidden items-center gap-2 px-3 py-2 animate-float [animation-delay:1.5s] xl:flex">
        <Link2 size={14} className="text-cyan-electric" />
        <span className="font-mono text-[11px] text-slate-300">block #4,938,217</span>
      </div>
      <div className="glass absolute -right-3 bottom-28 hidden items-center gap-2 px-3 py-2 animate-float [animation-delay:.8s] xl:flex">
        <span className="h-2 w-2 rounded-full bg-red-400" />
        <span className="text-[11px] font-semibold text-slate-300">3 duplicates blocked</span>
      </div>
    </div>
  )
}
