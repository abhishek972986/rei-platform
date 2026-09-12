import React from 'react'
import {
  Zap,
  BadgeCheck,
  FileCheck2,
  ArrowLeftRight,
  ShieldCheck,
  Archive,
  Siren,
  SearchCheck,
} from 'lucide-react'
import { Hash, fmtDateTime } from './ui'

const ICONS = {
  'Energy Generated': Zap,
  'Generation Verified': BadgeCheck,
  'REC Issued': FileCheck2,
  'Ownership Transferred': ArrowLeftRight,
  'Ownership Verified': ShieldCheck,
  'REC Retired': Archive,
  'Flagged by AI Engine': Siren,
  'Investigation Opened': SearchCheck,
}

const TONES = {
  Alert: 'border-red-400/35 bg-red-400/10 text-red-300',
  Open: 'border-amber-400/35 bg-amber-400/10 text-amber-300',
  Confirmed: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
}

export default function Timeline({ events, compact = false }) {
  if (!events || !events.length)
    return <p className="py-8 text-center text-sm text-slate-500">No ledger events recorded.</p>

  return (
    <div className="relative">
      <div className="absolute bottom-4 left-[17px] top-4 w-px bg-gradient-to-b from-emerald/40 via-cyan-electric/25 to-transparent" />
      <div className="flex flex-col gap-3">
        {events.map((e, i) => {
          const Icon = ICONS[e.label] || Zap
          const tone = TONES[e.status] || TONES.Confirmed
          return (
            <div key={i} className="relative flex gap-4">
              <span
                className={
                  'relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-xl border bg-navy-880 ' +
                  tone
                }
              >
                <Icon size={16} />
              </span>
              <div className="glass flex-1 border-white/8 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-white">{e.label}</p>
                  <span className={'chip ' + tone}>{e.status}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{fmtDateTime(e.date)}</p>
                {e.meta ? <p className="mt-2 text-sm text-slate-300">{e.meta}</p> : null}
                {!compact && (
                  <div className="mt-3 grid gap-2 border-t border-white/8 pt-3 text-xs sm:grid-cols-3">
                    <div>
                      <p className="panel-title">Organisation</p>
                      <p className="mt-0.5 truncate text-slate-300">{e.org}</p>
                    </div>
                    <div>
                      <p className="panel-title">Transaction</p>
                      <p className="mt-0.5">
                        <Hash value={e.txHash} chars={10} />
                      </p>
                    </div>
                    <div>
                      <p className="panel-title">Block</p>
                      <p className="mt-0.5 font-mono text-slate-300">
                        #{e.block.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
