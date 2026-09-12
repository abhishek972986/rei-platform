import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Link2, Search, Loader2, ShieldCheck, ShieldAlert, Download, Boxes, Copy } from 'lucide-react'
import { useStore } from '../../data/store'
import { buildLedger, networkStats, STATUS } from '../../data/seed'
import {
  Card,
  SectionHead,
  Stat,
  StatusPill,
  SourceTag,
  RiskBadge,
  Hash,
  fmtDate,
  fmtNum,
} from '../../components/ui'
import Timeline from '../../components/Timeline'
import { downloadReport } from '../../utils/report'

export default function Traceability() {
  const { id } = useParams()
  const nav = useNavigate()
  const { certificates, certById, user, toast } = useStore()
  const [query, setQuery] = useState(id || '')
  const [cert, setCert] = useState(id ? certById(id) : null)
  const [busy, setBusy] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (id) {
      const c = certById(id)
      setCert(c)
      setQuery(id)
      setNotFound(!c)
    }
  }, [id, certById])

  const run = (e) => {
    e && e.preventDefault()
    const q = query.trim().toLowerCase()
    if (!q) return
    setBusy(true)
    setNotFound(false)
    setTimeout(() => {
      const hit = certificates.find(
        (c) =>
          c.id.toLowerCase() === q ||
          (c.txHash || '').toLowerCase() === q ||
          c.generationId.toLowerCase() === q
      )
      setBusy(false)
      if (hit) {
        setCert(hit)
        nav('/app/traceability/' + hit.id, { replace: true })
      } else {
        setCert(null)
        setNotFound(true)
      }
    }, 700)
  }

  const ledger = cert ? buildLedger(cert) : []
  const clean = cert && cert.score < 71 && cert.status !== STATUS.REJECTED

  const copyHash = (h) => {
    navigator.clipboard?.writeText(h)
    toast('Transaction hash copied to clipboard.')
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="panel-title">Distributed ledger</p>
        <h1 className="mt-1.5 flex items-center gap-2.5 text-2xl font-extrabold text-white lg:text-3xl">
          <Link2 className="text-cyan-electric" size={26} /> Certificate Traceability
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Resolve any certificate ID, generation record or transaction hash to its full immutable
          lifecycle.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Block height" value={networkStats.blockHeight.toLocaleString()} icon={Boxes} tone="cyan" />
        <Stat label="Peer nodes" value={networkStats.peers} tone="emerald" />
        <Stat label="Avg block time" value={networkStats.avgBlockTime} tone="violet" />
        <Stat label="Immutable records" value={networkStats.immutableRecords.toLocaleString()} tone="amber" />
      </div>

      <Card>
        <form onSubmit={run} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="REC-2026-001 · GEN-2026-0001 · 0x…"
              className="input h-12 pl-10 font-mono"
            />
          </div>
          <button className="btn-primary h-12 px-6" disabled={busy}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            {busy ? 'Resolving…' : 'Trace certificate'}
          </button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-slate-500">Quick trace:</span>
          {certificates.slice(0, 4).map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setQuery(c.id)
                setCert(c)
                setNotFound(false)
                nav('/app/traceability/' + c.id, { replace: true })
              }}
              className="font-mono text-xs text-cyan-300 hover:underline"
            >
              {c.id}
            </button>
          ))}
        </div>
      </Card>

      {notFound && (
        <Card className="border-red-400/25">
          <div className="flex items-center gap-3">
            <ShieldAlert size={22} className="text-red-400" />
            <div>
              <p className="font-bold text-white">No ledger record found</p>
              <p className="mt-1 text-sm text-slate-400">
                Nothing on rei-energy-channel resolves to “{query}”.
              </p>
            </div>
          </div>
        </Card>
      )}

      {cert && (
        <>
          <Card className={clean ? 'border-emerald/25' : 'border-red-400/30'}>
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <span
                  className={
                    'grid h-14 w-14 place-items-center rounded-2xl ' +
                    (clean ? 'bg-emerald/15 text-emerald-300' : 'bg-red-400/15 text-red-300')
                  }
                >
                  {clean ? <ShieldCheck size={26} /> : <ShieldAlert size={26} />}
                </span>
                <div>
                  <p className="font-mono text-lg font-bold text-white">{cert.id}</p>
                  <p className="mt-0.5 text-sm text-slate-400">
                    {clean
                      ? 'Ledger trail complete and consistent'
                      : 'Ledger trail carries an unresolved fraud signal'}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <RiskBadge score={cert.score} showBar />
                <StatusPill status={cert.status} />
                <button className="btn-ghost" onClick={() => downloadReport(cert, ledger, { issuedBy: user?.org })}>
                  <Download size={15} /> Report
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 border-t border-white/8 pt-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Producer', cert.producerName],
                ['Source', <SourceTag key="s" source={cert.source} />],
                ['Energy', fmtNum(cert.claimedKWh) + ' kWh'],
                ['Generated', fmtDate(cert.generationDate)],
                ['Issued', fmtDate(cert.issuanceDate)],
                ['Current owner', cert.owner],
                ['Generation record', <span key="g" className="font-mono text-xs text-slate-300">{cert.generationId}</span>],
                [
                  'Root transaction',
                  <button
                    key="t"
                    onClick={() => cert.txHash && copyHash(cert.txHash)}
                    className="flex items-center gap-1.5"
                  >
                    <Hash value={cert.txHash} chars={10} />
                    {cert.txHash ? <Copy size={11} className="text-slate-500" /> : null}
                  </button>,
                ],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="panel-title">{k}</p>
                  <p className="mt-1 text-sm text-slate-200">{v}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <SectionHead
                title="REC lifecycle"
                subtitle={ledger.length + ' events · every entry append-only and hash-linked'}
              />
              <Timeline events={ledger} />
            </Card>

            <div className="flex flex-col gap-4">
              <Card>
                <SectionHead title="Ledger integrity" />
                <div className="flex flex-col gap-2.5">
                  {[
                    ['Hash chain', 'Continuous', true],
                    ['Orphaned records', 'None detected', true],
                    ['Retroactive edits', 'None possible', true],
                    ['Duplicate generation ref', cert.factors.some((f) => f.type === 'Duplicate Certificate') ? 'Detected' : 'None', !cert.factors.some((f) => f.type === 'Duplicate Certificate')],
                  ].map(([k, v, ok]) => (
                    <div
                      key={k}
                      className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] p-3"
                    >
                      <span className="text-xs text-slate-400">{k}</span>
                      <span className={'chip ' + (ok ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-red-400/30 bg-red-400/10 text-red-300')}>
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <SectionHead title="Related records" />
                <div className="flex flex-col gap-2">
                  {certificates
                    .filter((c) => c.generationId === cert.generationId && c.id !== cert.id)
                    .map((c) => (
                      <Link
                        key={c.id}
                        to={'/app/traceability/' + c.id}
                        className="flex items-center justify-between rounded-xl border border-red-400/25 bg-red-400/8 p-3 hover:border-red-400/40"
                      >
                        <span className="font-mono text-xs text-red-200">{c.id}</span>
                        <span className="text-[10px] uppercase tracking-wider text-red-300">
                          Same generation record
                        </span>
                      </Link>
                    ))}
                  {certificates
                    .filter((c) => c.producerId === cert.producerId && c.id !== cert.id)
                    .slice(0, 4)
                    .map((c) => (
                      <Link
                        key={c.id}
                        to={'/app/traceability/' + c.id}
                        className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] p-3 hover:border-cyan-electric/30"
                      >
                        <span className="font-mono text-xs text-cyan-300">{c.id}</span>
                        <span className="text-[10px] text-slate-500">Same producer</span>
                      </Link>
                    ))}
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
