import React from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  LabelList,
  RadialBarChart,
  RadialBar,
} from 'recharts'

/* ------------------------------------------------------------------
 * Chart tokens — validated against the dark navy surface (#0a1020)
 * with scripts/validate_palette.js. Categorical slots are assigned in
 * fixed order and never cycled; status colors are reserved for risk
 * state and always ship with a text label, never color alone.
 * ---------------------------------------------------------------- */
export const SERIES = {
  s1: '#3987e5', // blue
  s2: '#d95926', // orange
  s3: '#199e70', // aqua
  s4: '#c98500', // yellow
  s5: '#d55181', // magenta
}

export const STATUS_COLORS = {
  good: '#0ca30c',
  warning: '#fab219',
  serious: '#ec835a',
  critical: '#d03b3b',
}

/** Energy source → fixed categorical hue. Rendered in this order everywhere. */
export const SOURCE_ORDER = ['Hydro', 'Geothermal', 'Biomass', 'Solar', 'Wind']
export const SOURCE_COLOR = {
  Hydro: SERIES.s1,
  Geothermal: SERIES.s2,
  Biomass: SERIES.s3,
  Solar: SERIES.s4,
  Wind: SERIES.s5,
}

const INK = '#94a3b8'
const GRID = 'rgba(255,255,255,0.06)'
const axis = { stroke: 'transparent', tick: { fill: INK, fontSize: 11 }, tickLine: false }

function TipBox({ title, rows }) {
  return (
    <div className="rounded-xl border border-white/12 bg-navy-880/95 px-3 py-2.5 shadow-glass backdrop-blur-xl">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </p>
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          {r.color ? (
            <span className="h-2 w-2 rounded-sm" style={{ background: r.color }} />
          ) : null}
          <span className="text-slate-300">{r.label}</span>
          <span className="ml-auto font-mono font-semibold text-white">{r.value}</span>
        </div>
      ))}
    </div>
  )
}

const makeTip = (unit = '') =>
  function Tip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null
    return (
      <TipBox
        title={label}
        rows={payload.map((p) => ({
          color: p.color || p.fill,
          label: p.name,
          value: Number(p.value).toLocaleString() + unit,
        }))}
      />
    )
  }

const legendStyle = { fontSize: 11, color: INK, paddingBottom: 8 }

/* ------------------------------------------------------------------ */
/* Fraud trend — certificates issued vs flagged, over time             */
/* ------------------------------------------------------------------ */
export function FraudTrendChart({ data, height = 260 }) {
  const Tip = makeTip()
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="gIssued" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SERIES.s1} stopOpacity={0.38} />
            <stop offset="100%" stopColor={SERIES.s1} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gFlagged" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SERIES.s2} stopOpacity={0.38} />
            <stop offset="100%" stopColor={SERIES.s2} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="month" {...axis} />
        <YAxis {...axis} width={42} />
        <Tooltip content={<Tip />} cursor={{ stroke: 'rgba(255,255,255,.18)', strokeWidth: 1 }} />
        <Legend wrapperStyle={legendStyle} iconType="plainline" iconSize={14} />
        <Area
          type="monotone"
          dataKey="issued"
          name="Certificates issued"
          stroke={SERIES.s1}
          strokeWidth={2}
          fill="url(#gIssued)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: '#0a1020' }}
        />
        <Area
          type="monotone"
          dataKey="flagged"
          name="Flagged by AI"
          stroke={SERIES.s2}
          strokeWidth={2}
          fill="url(#gFlagged)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: '#0a1020' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

/* ------------------------------------------------------------------ */
/* Risk distribution — ordinal, status-colored, always text-labelled   */
/* ------------------------------------------------------------------ */
export function RiskDistributionChart({ low, medium, high, height = 230 }) {
  const data = [
    { level: 'Low (0–30)', count: low, fill: STATUS_COLORS.good },
    { level: 'Medium (31–70)', count: medium, fill: STATUS_COLORS.warning },
    { level: 'High (71–100)', count: high, fill: STATUS_COLORS.critical },
  ]
  const Tip = makeTip(' certificates')
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 44, left: 4, bottom: 0 }}>
        <CartesianGrid stroke={GRID} horizontal={false} />
        <XAxis type="number" {...axis} hide />
        <YAxis type="category" dataKey="level" {...axis} width={112} />
        <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,.04)' }} />
        <Bar dataKey="count" name="Certificates" radius={[0, 4, 4, 0]} barSize={26}>
          {data.map((d) => (
            <Cell key={d.level} fill={d.fill} />
          ))}
          <LabelList
            dataKey="count"
            position="right"
            style={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 700 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ------------------------------------------------------------------ */
/* Fraud type breakdown — single hue, identity carried by the axis     */
/* ------------------------------------------------------------------ */
export function FraudTypeChart({ data, height = 240 }) {
  const Tip = makeTip(' alerts')
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 42, left: 4, bottom: 0 }}>
        <CartesianGrid stroke={GRID} horizontal={false} />
        <XAxis type="number" {...axis} hide />
        <YAxis type="category" dataKey="type" {...axis} width={132} />
        <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,.04)' }} />
        <Bar dataKey="count" name="Alerts" fill={SERIES.s1} radius={[0, 4, 4, 0]} barSize={22}>
          <LabelList
            dataKey="count"
            position="right"
            style={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 700 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ------------------------------------------------------------------ */
/* Energy source mix — fixed categorical order, direct labels          */
/* ------------------------------------------------------------------ */
export function SourceMixChart({ data, height = 240 }) {
  const ordered = SOURCE_ORDER.map((s) => data.find((d) => d.source === s)).filter(Boolean)
  const Tip = makeTip(' MWh')
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={ordered} margin={{ top: 20, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="source" {...axis} />
        <YAxis {...axis} width={48} />
        <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,.04)' }} />
        <Bar dataKey="mwh" name="Certified energy" radius={[4, 4, 0, 0]} barSize={38}>
          {ordered.map((d) => (
            <Cell key={d.source} fill={SOURCE_COLOR[d.source]} />
          ))}
          <LabelList
            dataKey="mwh"
            position="top"
            style={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 600 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ------------------------------------------------------------------ */
/* Claimed vs metered generation — same unit, one axis                 */
/* ------------------------------------------------------------------ */
export function GenerationCompareChart({ data, height = 260 }) {
  const Tip = makeTip(' MWh')
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }} barGap={2}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="month" {...axis} />
        <YAxis {...axis} width={52} />
        <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,.04)' }} />
        <Legend wrapperStyle={legendStyle} iconType="square" iconSize={9} />
        <Bar dataKey="claimed" name="Claimed by producers" fill={SERIES.s1} radius={[3, 3, 0, 0]} />
        <Bar dataKey="metered" name="Verified by meters" fill={SERIES.s2} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ------------------------------------------------------------------ */
/* Producer risk ranking — sequential single hue by magnitude          */
/* ------------------------------------------------------------------ */
const SEQ = ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf']
export function ProducerRiskChart({ data, height = 300 }) {
  const max = Math.max(...data.map((d) => d.risk), 1)
  const Tip = makeTip('/100 avg risk')
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 44, left: 4, bottom: 0 }}>
        <CartesianGrid stroke={GRID} horizontal={false} />
        <XAxis type="number" domain={[0, 100]} {...axis} hide />
        <YAxis type="category" dataKey="name" {...axis} width={148} />
        <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,.04)' }} />
        <Bar dataKey="risk" name="Average risk" radius={[0, 4, 4, 0]} barSize={16}>
          {data.map((d, i) => (
            <Cell key={i} fill={SEQ[Math.min(4, Math.floor((d.risk / max) * 4.999))]} />
          ))}
          <LabelList
            dataKey="risk"
            position="right"
            style={{ fill: '#e2e8f0', fontSize: 11, fontWeight: 700 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ------------------------------------------------------------------ */
/* Detection confidence gauge                                          */
/* ------------------------------------------------------------------ */
export function AccuracyGauge({ value, label, color = SERIES.s3, height = 170 }) {
  const data = [{ name: label, value, fill: color }]
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="72%"
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar background={{ fill: 'rgba(255,255,255,.07)' }} dataKey="value" cornerRadius={8} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-2xl font-extrabold text-white">{value}%</span>
        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          {label}
        </span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Compact sparkline for stat tiles                                    */
/* ------------------------------------------------------------------ */
export function Sparkline({ data, dataKey = 'value', color = SERIES.s1, height = 48 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
