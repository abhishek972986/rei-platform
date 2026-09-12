import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, ShieldAlert, Search, Loader2, Download, ArrowRight } from 'lucide-react'
import { useStore } from '../../data/store'
import { buildLedger, STATUS } from '../../data/seed'
import { RiskDial, StatusPill, SourceTag, Hash, fmtDate, fmtNum } from '../../components/ui'
import Timeline from '../../components/Timeline'
import { downloadReport } from '../../utils/report'

export default function VerifyPublic() {
  const { certificates } = useStore()
  const [query, setQuery] = useState('REC-2026-001')
  const [state, setState] = useState('idle') // idle | scanning | found | missing
  const [cert, setCert] = useState(null)

  const run = (e) => {
    e.preventDefault()
    const q = query.trim().toLowerCase()
    setState('scanning')
    setCert(null)
    setTimeout(() => {
      const hit = certificates.find(
        (c) => c.id.toLowerCase() === q || (c.txHash || '').toLowerCase() === q
      )
      if (hit) {
        setCert(hit)
        setState('found')
      } else {
        setState('missing')
      }
    }, 900)
  }

  const genuine = cert && cert.status !== STATUS.REJECTED && cert.score < 71

  return (
    <div className="mx-auto max-w-4xl px-5 py-14 lg:py-20">
      <p className="label">Public verification</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
        Verify a <span className="text-brand">certificate</span>
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-2">
        Enter a certificate ID or blockchain transaction hash. Anyone can check authenticity,
        current owner, risk verdict and retirement status — no account required.
      </p>

      <form onSubmit={run} className="card mt-8 flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="REC-2026-001 or 0x…"
            className="field h-12 pl-10 font-mono"
          />
        </div>
        <button className="btn-brand h-12 px-6" disabled={state === 'scanning'}>
          {state === 'scanning' ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Checking ledger…
            </>
          ) : (
            <>
              <ShieldCheck size={16} /> Verify
            </>
          )}
        </button>
      </form>

      <p className="mt-3 text-xs text-ink-3">
        Try <button className="font-mono text-brand-ink" onClick={() => setQuery('REC-2026-001')}>REC-2026-001</button>
        {' · '}
        <button className="font-mono text-brand-ink" onClick={() => setQuery('REC-2026-041')}>REC-2026-041</button>
        {' · '}
        <button className="font-mono text-brand-ink" onClick={() => setQuery('REC-2026-052')}>REC-2026-052</button>
      </p>

      {state === 'missing' && (
        <div className="card mt-6 border-red-300/60 dark:border-red-400/25 p-6">
          <div className="flex items-center gap-3">
            <ShieldAlert size={22} className="text-red-500" />
            <div>
              <p className="font-bold text-ink">No ledger record found</p>
              <p className="mt-1 text-sm text-ink-2">
                Nothing on the REI ledger matches “{query}”. A certificate that cannot be resolved
                here has not been issued by a registered authority on this network.
              </p>
            </div>
          </div>
        </div>
      )}

      {state === 'found' && cert && (
        <div className="mt-6 flex flex-col gap-4 animate-fade-up">
          <div
            className={
              'card p-6 ' + (genuine ? 'border-brand/30' : 'border-red-300/60 dark:border-red-400/30')
            }
          >
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <span
                  className={
                    'grid h-14 w-14 place-items-center rounded-2xl ' +
                    (genuine
                      ? 'bg-brand-soft text-brand-ink'
                      : 'bg-red-50 text-red-600 dark:bg-red-400/15 dark:text-red-300')
                  }
                >
                  {genuine ? <ShieldCheck size={26} /> : <ShieldAlert size={26} />}
                </span>
                <div>
                  <p className="font-mono text-lg font-bold text-ink">{cert.id}</p>
                  <p className="mt-1 text-sm text-ink-2">
                    {genuine
                      ? 'Authentic — registered on the REI ledger'
                      : 'Flagged — this certificate is not cleared for trade'}
                  </p>
                </div>
              </div>
              <RiskDial score={cert.score} size={120} />
            </div>

            <div className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Producer', cert.producerName],
                ['Energy source', <SourceTag key="s" source={cert.source} />],
                ['Energy certified', fmtNum(cert.claimedKWh) + ' kWh'],
                ['Generation date', fmtDate(cert.generationDate)],
                ['Current owner', cert.owner],
                ['Status', <StatusPill key="st" status={cert.status} />],
                ['Vintage', cert.vintage],
                ['Ledger tx', <Hash key="h" value={cert.txHash} chars={10} />],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="label">{k}</p>
                  <p className="mt-1 text-sm text-ink">{v}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button className="btn-outline" onClick={() => downloadReport(cert, buildLedger(cert))}>
                <Download size={15} /> Download verification report
              </button>
              <Link to="/login" className="btn-brand">
                Open in platform <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="mb-4 text-base font-bold text-ink">Certificate lifecycle</h2>
            <Timeline events={buildLedger(cert)} />
          </div>
        </div>
      )}
    </div>
  )
}
