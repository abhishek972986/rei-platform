import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  X,
  Ban,
  Flag,
  Download,
  Link2,
  AlertTriangle,
  MessageSquarePlus,
  Gauge,
  Copy,
  Activity,
  Shuffle,
  History,
} from 'lucide-react'
import { useStore } from '../../data/store'
import { buildLedger, STATUS } from '../../data/seed'
import { recommendedAction, FRAUD_TYPES } from '../../engine/fraudEngine'
import {
  Card,
  SectionHead,
  RiskDial,
  StatusPill,
  SourceTag,
  RiskBadge,
  Hash,
  Progress,
  fmtDate,
  fmtDateTime,
  fmtNum,
} from '../../components/ui'
import Timeline from '../../components/Timeline'
import { downloadReport } from '../../utils/report'

const FACTOR_ICONS = {
  [FRAUD_TYPES.DUPLICATE]: Copy,
  [FRAUD_TYPES.MISMATCH]: Gauge,
  [FRAUD_TYPES.PATTERN]: Activity,
  [FRAUD_TYPES.TRANSFER]: Shuffle,
  'Producer History': History,
}

export default function InvestigationDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { certById, certificates, producerById, applyDecision, addNote, user, alerts } = useStore()
  const cert = certById(id)
  const [note, setNote] = useState('')

  if (!cert)
    return (
      <Card>
        <p className="text-slate-400">No investigation record for {id}.</p>
        <Link to="/app/investigations" className="btn-ghost mt-4">
          <ArrowLeft size={15} /> Back to investigations
        </Link>
      </Card>
    )

  const ledger = buildLedger(cert)
  const producer = producerById(cert.producerId)
  const alert = alerts.find((a) => a.certificateId === cert.id)
  const variance = cert.claimedKWh - cert.meteredKWh
  const variancePct = ((variance / cert.claimedKWh) * 100).toFixed(1)
  const duplicates = certificates.filter(
    (c) => c.generationId === cert.generationId && c.id !== cert.id
  )
  const producerCerts = certificates.filter((c) => c.producerId === cert.producerId)

  const decide = (d) => {
    applyDecision(cert.id, d)
  }

  const saveNote = () => {
    if (!note.trim()) return
    addNote(cert.id, note.trim())
    setNote('')
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button onClick={() => nav(-1)} className="mb-3 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
            <ArrowLeft size={14} /> Back to case queue
          </button>
          <p className="panel-title">Investigation workspace</p>
          <h1 className="mt-1.5 text-2xl font-extrabold text-white lg:text-3xl">
            {alert ? alert.id : 'CASE'} · <span className="font-mono text-cyan-300">{cert.id}</span>
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusPill status={cert.status} />
            <SourceTag source={cert.source} />
            {cert.primaryType ? (
              <span className="chip border-red-400/25 bg-red-400/8 text-red-300">
                <AlertTriangle size={11} /> {cert.primaryType}
              </span>
            ) : null}
            {cert.decision ? (
              <span className="chip border-cyan-electric/25 bg-cyan-electric/8 text-cyan-200">
                Decision: {cert.decision} · {cert.decidedBy}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={'/app/certificates/' + cert.id} className="btn-ghost">
            Certificate record
          </Link>
          <Link to={'/app/traceability/' + cert.id} className="btn-ghost">
            <Link2 size={15} /> Ledger trail
          </Link>
          <button className="btn-ghost" onClick={() => downloadReport(cert, ledger, { issuedBy: user?.org })}>
            <Download size={15} /> Evidence pack
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {/* evidence column */}
        <div className="flex flex-col gap-4 xl:col-span-2">
          <Card>
            <SectionHead title="Certificate information" />
            <div className="grid gap-x-6 gap-y-4 sm:grid-cols-3">
              {[
                ['Certificate ID', <span key="a" className="font-mono text-cyan-300">{cert.id}</span>],
                ['Generation record', <span key="b" className="font-mono text-slate-200">{cert.generationId}</span>],
                ['Producer', cert.producerName],
                ['Energy claimed', fmtNum(cert.claimedKWh) + ' kWh'],
                ['Energy metered', fmtNum(cert.meteredKWh) + ' kWh'],
                ['Generation date', fmtDate(cert.generationDate)],
                ['Issuance date', fmtDate(cert.issuanceDate)],
                ['Current owner', cert.owner],
                ['Blockchain tx', <Hash key="c" value={cert.txHash} chars={10} />],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="panel-title">{k}</p>
                  <p className="mt-1 text-sm text-slate-200">{v}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionHead
              title="Detected anomalies"
              subtitle={cert.factors.length + ' signals contributed to this score'}
            />
            {cert.factors.length ? (
              <div className="flex flex-col gap-3">
                {cert.factors.map((f, i) => {
                  const Icon = FACTOR_ICONS[f.type] || AlertTriangle
                  return (
                    <div key={i} className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex items-start gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-red-400/25 bg-red-400/10 text-red-300">
                          <Icon size={16} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-bold text-white">{f.label}</p>
                            <span className="chip border-cyan-electric/25 bg-cyan-electric/8 text-cyan-200">
                              +{f.weight.toFixed(1)} pts
                            </span>
                          </div>
                          <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{f.detail}</p>
                          {f.evidence && f.evidence.length ? (
                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                              {f.evidence.map((e, j) => (
                                <span
                                  key={j}
                                  className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-300"
                                >
                                  {e}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="rounded-xl border border-emerald/25 bg-emerald/8 p-4 text-sm text-emerald-200">
                No anomalies detected — this certificate passed every automated integrity check.
              </p>
            )}
          </Card>

          <Card>
            <SectionHead title="Generation reconciliation" subtitle="Claimed output against meter telemetry" />
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                ['Expected', fmtNum(cert.claimedKWh) + ' kWh', 'text-white'],
                ['Actual', fmtNum(cert.meteredKWh) + ' kWh', 'text-white'],
                ['Difference', fmtNum(variance) + ' kWh', variance > 0 ? 'text-amber-300' : 'text-emerald-300'],
                ['Mismatch', variancePct + '%', Number(variancePct) > 5 ? 'text-red-300' : 'text-emerald-300'],
              ].map(([k, v, c]) => (
                <div key={k} className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
                  <p className="panel-title">{k}</p>
                  <p className={'mt-1 font-mono text-base font-bold ' + c}>{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Progress
                label="Share of claim confirmed by meters"
                value={Math.round((cert.meteredKWh / cert.claimedKWh) * 100)}
                tone={Number(variancePct) > 10 ? 'red' : Number(variancePct) > 2 ? 'amber' : 'emerald'}
              />
            </div>
          </Card>

          {duplicates.length > 0 && (
            <Card className="border-red-400/25">
              <SectionHead
                title="Duplicate certificates"
                subtitle={'Generation record ' + cert.generationId + ' is claimed more than once'}
              />
              <div className="flex flex-col gap-2">
                {[cert, ...duplicates].map((c) => (
                  <Link
                    key={c.id}
                    to={'/app/investigations/' + c.id}
                    className={
                      'flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5 ' +
                      (c.id === cert.id
                        ? 'border-cyan-electric/40 bg-cyan-electric/8'
                        : 'border-red-400/25 bg-red-400/8 hover:border-red-400/40')
                    }
                  >
                    <div>
                      <p className="font-mono text-xs font-semibold text-white">
                        {c.id} {c.id === cert.id ? '(this case)' : ''}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Issued {fmtDate(c.issuanceDate)} · owner {c.owner}
                      </p>
                    </div>
                    <RiskBadge score={c.score} />
                  </Link>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <SectionHead title="Ledger trail" subtitle={ledger.length + ' immutable events'} icon={Link2} />
            <Timeline events={ledger} compact />
          </Card>
        </div>

        {/* verdict column */}
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col items-center">
            <SectionHead title="AI risk score" />
            <RiskDial score={cert.score} size={168} />
            <p className="mt-4 text-center text-xs text-slate-400">
              Model confidence {cert.confidence}% · {cert.factors.length} contributing signal
              {cert.factors.length === 1 ? '' : 's'}
            </p>
            <div className="mt-5 w-full rounded-xl border border-amber-400/25 bg-amber-400/8 p-4">
              <p className="panel-title !text-amber-300">Recommended action</p>
              <p className="mt-1.5 text-sm leading-relaxed text-amber-100">
                {recommendedAction(cert.score, cert.primaryType)}
              </p>
            </div>
          </Card>

          <Card>
            <SectionHead title="Decision" subtitle="Written to the ledger and fed back into training" />
            <div className="grid gap-2">
              <button className="btn-ok" onClick={() => decide('approve')}>
                <Check size={15} /> Approve certificate
              </button>
              <button className="btn-danger" onClick={() => decide('reject')}>
                <X size={15} /> Reject certificate
              </button>
              <button className="btn-warn" onClick={() => decide('suspend')}>
                <Ban size={15} /> Suspend certificate
              </button>
              <button className="btn-ghost" onClick={() => decide('falsePositive')}>
                <Flag size={15} /> Mark false positive
              </button>
            </div>
            {cert.decision && (
              <p className="mt-3 rounded-xl border border-white/8 bg-white/[0.03] p-3 text-xs text-slate-300">
                Current ruling: <span className="font-semibold text-white">{cert.decision}</span> by{' '}
                {cert.decidedBy} on {fmtDateTime(cert.decidedAt)}
              </p>
            )}
          </Card>

          <Card>
            <SectionHead title="Producer profile" subtitle={producer ? producer.id : ''} />
            {producer && (
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{producer.name}</p>
                  <p className="text-xs text-slate-400">
                    {producer.source} · {producer.location} · {producer.capacityMW} MW
                  </p>
                </div>
                <Progress
                  label="Integrity score"
                  value={producer.integrity}
                  tone={producer.integrity >= 85 ? 'emerald' : producer.integrity >= 65 ? 'amber' : 'red'}
                />
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    ['Certificates', producerCerts.length],
                    ['High risk', producerCerts.filter((c) => c.score >= 71).length],
                    ['Prior incidents', producer.priorIncidents],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-xl border border-white/8 bg-white/[0.03] p-2.5">
                      <p className="font-mono text-base font-bold text-white">{v}</p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">{k}</p>
                    </div>
                  ))}
                </div>
                <Link to="/app/producers" className="btn-ghost !py-2 text-xs">
                  View all producers
                </Link>
              </div>
            )}
          </Card>

          <Card>
            <SectionHead title="Case notes" subtitle={(cert.notes || []).length + ' entries'} />
            <div className="flex flex-col gap-2">
              {(cert.notes || []).map((n, i) => (
                <div key={i} className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                  <p className="text-xs text-slate-200">{n.text}</p>
                  <p className="mt-1.5 text-[10px] text-slate-500">
                    {n.by} · {fmtDateTime(n.at)}
                  </p>
                </div>
              ))}
              {!(cert.notes || []).length && (
                <p className="py-3 text-center text-xs text-slate-500">No notes recorded yet.</p>
              )}
            </div>
            <div className="mt-3">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Record what you checked and what you found…"
                className="input resize-none"
              />
              <button onClick={saveNote} className="btn-primary mt-2 w-full">
                <MessageSquarePlus size={15} /> Add note
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
