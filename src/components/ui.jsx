import React, { useEffect, useMemo, useState } from 'react'
import { X, ChevronDown, Search, Inbox } from 'lucide-react'
import { riskLevel } from '../engine/fraudEngine'
import { STATUS } from '../data/seed'

/* ---------------------------------------------------------------- */
/* Primitives                                                        */
/* ---------------------------------------------------------------- */

export function Card({ className = '', children, ...rest }) {
  return (
    <div className={'glass p-5 ' + className} {...rest}>
      {children}
    </div>
  )
}

export function SectionHead({ title, subtitle, right, icon: Icon }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          {Icon ? <Icon size={18} className="text-cyan-electric" /> : null}
          {title}
        </h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
      </div>
      {right}
    </div>
  )
}

export function Stat({ label, value, sub, icon: Icon, tone = 'cyan', trend, className = '' }) {
  const tones = {
    cyan: 'from-cyan-500/20 to-transparent text-cyan-300 border-cyan-400/20',
    emerald: 'from-emerald-500/20 to-transparent text-emerald-300 border-emerald-400/20',
    amber: 'from-amber-500/20 to-transparent text-amber-300 border-amber-400/20',
    red: 'from-red-500/20 to-transparent text-red-300 border-red-400/20',
    violet: 'from-violet-500/20 to-transparent text-violet-300 border-violet-400/20',
  }
  return (
    <div className={'glass glass-hover group relative overflow-hidden p-5 ' + className}>
      <div
        className={
          'pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-gradient-to-br blur-2xl opacity-60 ' +
          tones[tone]
        }
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="panel-title">{label}</p>
          <p className="mt-2 font-mono text-2xl font-bold tracking-tight text-white lg:text-[28px]">
            {value}
          </p>
          {sub ? <p className="mt-1.5 text-xs text-slate-400">{sub}</p> : null}
        </div>
        {Icon ? (
          <span className={'rounded-xl border bg-gradient-to-br p-2.5 ' + tones[tone]}>
            <Icon size={18} />
          </span>
        ) : null}
      </div>
      {trend != null ? (
        <p
          className={
            'relative mt-3 text-xs font-semibold ' +
            (trend >= 0 ? 'text-emerald-400' : 'text-red-400')
          }
        >
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% vs last quarter
        </p>
      ) : null}
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Risk + status indicators                                          */
/* ---------------------------------------------------------------- */

const RISK_STYLES = {
  LOW: { chip: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300', bar: 'bg-emerald-400', dot: '🟢' },
  MEDIUM: { chip: 'border-amber-400/30 bg-amber-400/10 text-amber-300', bar: 'bg-amber-400', dot: '🟡' },
  HIGH: { chip: 'border-red-400/30 bg-red-400/10 text-red-300', bar: 'bg-red-400', dot: '🔴' },
}

export function RiskBadge({ score, showBar = false, size = 'md' }) {
  const level = riskLevel(score)
  const s = RISK_STYLES[level]
  if (showBar) {
    return (
      <div className="min-w-[108px]">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className={'chip ' + s.chip}>{level}</span>
          <span className="font-mono text-sm font-bold text-white">{score}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className={'h-full rounded-full transition-all duration-700 ' + s.bar}
            style={{ width: score + '%' }}
          />
        </div>
      </div>
    )
  }
  return (
    <span className={'chip ' + s.chip + (size === 'sm' ? ' !px-2 !py-0.5 !text-[10px]' : '')}>
      <span className="font-mono font-bold">{score}</span>
      <span className="opacity-70">{level}</span>
    </span>
  )
}

export function RiskDial({ score, size = 148 }) {
  const level = riskLevel(score)
  const color = level === 'HIGH' ? '#f87171' : level === 'MEDIUM' ? '#fbbf24' : '#34d399'
  const r = size / 2 - 12
  const c = 2 * Math.PI * r
  const [shown, setShown] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setShown(score), 80)
    return () => clearTimeout(t)
  }, [score])
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,.08)" strokeWidth="10" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c - (c * shown) / 100}
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.22,1,.36,1)', filter: 'drop-shadow(0 0 8px ' + color + '66)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-3xl font-extrabold text-white">{score}</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color }}>
          {level} RISK
        </span>
      </div>
    </div>
  )
}

const STATUS_STYLES = {
  [STATUS.ACTIVE]: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  [STATUS.INVESTIGATING]: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  [STATUS.SUSPICIOUS]: 'border-red-400/30 bg-red-400/10 text-red-300',
  [STATUS.RETIRED]: 'border-slate-400/25 bg-slate-400/10 text-slate-300',
  [STATUS.PENDING]: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300',
  [STATUS.REJECTED]: 'border-red-500/40 bg-red-500/15 text-red-200',
}
const STATUS_DOTS = {
  [STATUS.ACTIVE]: 'bg-emerald-400',
  [STATUS.INVESTIGATING]: 'bg-amber-400',
  [STATUS.SUSPICIOUS]: 'bg-red-400',
  [STATUS.RETIRED]: 'bg-slate-400',
  [STATUS.PENDING]: 'bg-cyan-400',
  [STATUS.REJECTED]: 'bg-red-500',
}

export function StatusPill({ status }) {
  return (
    <span className={'chip ' + (STATUS_STYLES[status] || STATUS_STYLES[STATUS.ACTIVE])}>
      <span className={'h-1.5 w-1.5 rounded-full ' + (STATUS_DOTS[status] || 'bg-slate-400')} />
      {status}
    </span>
  )
}

const SEV_STYLES = {
  Critical: 'border-red-500/40 bg-red-500/15 text-red-300',
  High: 'border-orange-400/35 bg-orange-400/12 text-orange-300',
  Medium: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  Low: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
}
export function SeverityPill({ severity }) {
  return <span className={'chip ' + (SEV_STYLES[severity] || SEV_STYLES.Low)}>{severity}</span>
}

export function SourceTag({ source }) {
  const map = {
    Solar: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
    Wind: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300',
    Hydro: 'border-blue-400/30 bg-blue-400/10 text-blue-300',
    Biomass: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
    Geothermal: 'border-orange-400/30 bg-orange-400/10 text-orange-300',
  }
  return <span className={'chip ' + (map[source] || map.Solar)}>{source}</span>
}

export function Hash({ value, chars = 8, className = '' }) {
  if (!value) return <span className="font-mono text-xs text-slate-500">—</span>
  return (
    <span
      title={value}
      className={'font-mono text-xs text-cyan-300/80 ' + className}
    >
      {value.slice(0, chars + 2)}…{value.slice(-4)}
    </span>
  )
}

/* ---------------------------------------------------------------- */
/* Inputs                                                            */
/* ---------------------------------------------------------------- */

export function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={'relative ' + className}>
      <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
      <input
        className="input pl-9"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export function Select({ value, onChange, options, className = '' }) {
  return (
    <div className={'relative ' + className}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input appearance-none pr-9"
      >
        {options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o} className="bg-navy-900">
            {o.label ?? o}
          </option>
        ))}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
    </div>
  )
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="panel-title">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint ? <span className="mt-1 block text-[11px] text-slate-500">{hint}</span> : null}
    </label>
  )
}

/* ---------------------------------------------------------------- */
/* Table                                                             */
/* ---------------------------------------------------------------- */

export function Table({ columns, rows, onRowClick, empty = 'No records match the current filters.' }) {
  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <Inbox size={28} className="text-slate-600" />
        <p className="text-sm text-slate-500">{empty}</p>
      </div>
    )
  }
  return (
    <div className="-mx-5 overflow-x-auto px-5">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/10">
            {columns.map((c) => (
              <th
                key={c.key}
                className={
                  'whitespace-nowrap px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 ' +
                  (c.align === 'right' ? 'text-right' : '')
                }
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id || i}
              className={'table-row ' + (onRowClick ? 'cursor-pointer' : '')}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={
                    'whitespace-nowrap px-3 py-3 align-middle ' +
                    (c.align === 'right' ? 'text-right' : '')
                  }
                >
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Overlays                                                          */
/* ---------------------------------------------------------------- */

export function Modal({ open, onClose, title, subtitle, children, footer, wide }) {
  useEffect(() => {
    const fn = (e) => e.key === 'Escape' && onClose()
    if (open) window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div
        className={
          'glass max-h-[92vh] w-full overflow-y-auto rounded-b-none p-6 animate-fade-up sm:rounded-2xl ' +
          (wide ? 'max-w-3xl' : 'max-w-lg')
        }
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white">
            <X size={18} />
          </button>
        </div>
        {children}
        {footer ? <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  )
}

export function Toasts({ toasts }) {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-[min(92vw,360px)] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={
            'glass animate-fade-up px-4 py-3 text-sm font-medium shadow-glow ' +
            (t.tone === 'danger'
              ? 'border-red-400/30 text-red-200'
              : 'border-emerald-400/30 text-emerald-100')
          }
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Misc                                                              */
/* ---------------------------------------------------------------- */

export function Progress({ value, tone = 'cyan', label }) {
  const tones = {
    cyan: 'bg-cyan-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    red: 'bg-red-400',
    violet: 'bg-violet-400',
  }
  return (
    <div>
      {label ? (
        <div className="mb-1 flex justify-between text-xs text-slate-400">
          <span>{label}</span>
          <span className="font-mono text-slate-300">{value}%</span>
        </div>
      ) : null}
      <div className="h-2 overflow-hidden rounded-full bg-white/8">
        <div
          className={'h-full rounded-full transition-all duration-1000 ' + tones[tone]}
          style={{ width: Math.min(100, value) + '%' }}
        />
      </div>
    </div>
  )
}

export function useFiltered(items, query, fields) {
  return useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter((it) => fields.some((f) => String(it[f] ?? '').toLowerCase().includes(q)))
  }, [items, query, fields])
}

export const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

export const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

export const fmtNum = (n) => (n == null ? '—' : Number(n).toLocaleString())
