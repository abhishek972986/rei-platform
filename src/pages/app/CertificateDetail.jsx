import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Download,
  ArrowLeftRight,
  Archive,
  SearchCheck,
  Link2,
  AlertTriangle,
  Check,
} from 'lucide-react'
import { useStore } from '../../data/store'
import { buildLedger, STATUS, ROLES } from '../../data/seed'
import { recommendedAction } from '../../engine/fraudEngine'
import {
  Card,
  SectionHead,
  StatusPill,
  SourceTag,
  RiskDial,
  Hash,
  Modal,
  Field,
  Select,
  fmtDate,
  fmtDateTime,
  fmtNum,
} from '../../components/ui'
import Timeline from '../../components/Timeline'
import { downloadReport } from '../../utils/report'

const BUYERS = [
  'Northbay Industries',
  'Cobalt Data Centers',
  'Meridian Airlines',
  'Vertex Manufacturing',
  'Aurora Retail Group',
  'Stratos Logistics',
]

export default function CertificateDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { certById, user, transferCertificate, retireCertificate, issueCertificate } = useStore()
  const cert = certById(id)
  const [transferOpen, setTransferOpen] = useState(false)
  const [target, setTarget] = useState(BUYERS[0])

  if (!cert)
    return (
      <Card>
        <p className="text-slate-400">Certificate {id} was not found.</p>
        <Link to="/app/certificates" className="btn-ghost mt-4">
          <ArrowLeft size={15} /> Back to certificates
        </Link>
      </Card>
    )

  const ledger = buildLedger(cert)
  const variance = cert.claimedKWh - cert.meteredKWh
  const variancePct = ((variance / cert.claimedKWh) * 100).toFixed(1)
  const canIssue = user?.role === ROLES.ISSUER || user?.role === ROLES.REGULATOR

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button onClick={() => nav(-1)} className="mb-3 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
            <ArrowLeft size={14} /> Back
          </button>
          <p className="panel-title">Certificate record</p>
          <h1 className="mt-1.5 font-mono text-2xl font-extrabold text-white lg:text-3xl">{cert.id}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusPill status={cert.status} />
            <SourceTag source={cert.source} />
            <span className="chip border-white/10 bg-white/5 text-slate-300">{cert.vintage}</span>
            {cert.decision ? (
              <span className="chip border-cyan-electric/25 bg-cyan-electric/8 text-cyan-200">
                Decision: {cert.decision}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={() => downloadReport(cert, ledger, { issuedBy: user?.org })}>
            <Download size={15} /> Report
          </button>
          <Link to={'/app/traceability/' + cert.id} className="btn-ghost">
            <Link2 size={15} /> Trace
          </Link>
          {cert.score >= 31 && (
            <Link to={'/app/investigations/' + cert.id} className="btn-warn">
              <SearchCheck size={15} /> Investigate
            </Link>
          )}
          {canIssue && cert.status === STATUS.PENDING && (
            <button className="btn-primary" onClick={() => issueCertificate(cert.id)}>
              <Check size={15} /> Issue certificate
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <SectionHead title="Certificate information" />
          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['Certificate ID', <span key="a" className="font-mono text-cyan-300">{cert.id}</span>],
              ['Generation record', <span key="b" className="font-mono text-slate-200">{cert.generationId}</span>],
              ['Energy producer', cert.producerName],
              ['Producer ID', <span key="c" className="font-mono text-slate-300">{cert.producerId}</span>],
              ['Energy source', <SourceTag key="d" source={cert.source} />],
              ['Location', cert.location],
              ['Energy generated', fmtNum(cert.claimedKWh) + ' kWh (' + cert.energyMWh + ' MWh)'],
              ['Metered output', fmtNum(cert.meteredKWh) + ' kWh'],
              ['Generation date', fmtDate(cert.generationDate)],
              ['Issuance date', cert.status === STATUS.PENDING ? 'Not yet issued' : fmtDate(cert.issuanceDate)],
              ['Current owner', cert.owner],
              ['Certificate status', <StatusPill key="e" status={cert.status} />],
              ['Blockchain tx', <Hash key="f" value={cert.txHash} chars={12} />],
              ['Block number', cert.blockNumber ? '#' + cert.blockNumber.toLocaleString() : '—'],
              ['Retired', cert.retiredAt ? fmtDate(cert.retiredAt) + ' by ' + cert.retiredBy : '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="panel-title">{k}</p>
                <p className="mt-1 text-sm text-slate-200">{v}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-white/8 pt-5">
            <p className="panel-title mb-3">Generation reconciliation</p>
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                ['Claimed', fmtNum(cert.claimedKWh) + ' kWh', 'text-white'],
                ['Metered', fmtNum(cert.meteredKWh) + ' kWh', 'text-white'],
                ['Difference', fmtNum(variance) + ' kWh', variance > 0 ? 'text-amber-300' : 'text-emerald-300'],
                ['Mismatch', variancePct + '%', Number(variancePct) > 5 ? 'text-red-300' : 'text-emerald-300'],
              ].map(([k, v, c]) => (
                <div key={k} className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
                  <p className="panel-title">{k}</p>
                  <p className={'mt-1 font-mono text-base font-bold ' + c}>{v}</p>
                </div>
              ))}
            </div>
            {Number(variancePct) > 5 && (
              <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-red-400/25 bg-red-400/8 p-3.5">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-400" />
                <p className="text-xs leading-relaxed text-red-200">
                  Suspicious mismatch — claimed generation exceeds verified meter telemetry by{' '}
                  {variancePct}%. Tolerance for this plant class is 2%.
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card className="flex flex-col items-center">
          <SectionHead title="AI risk assessment" />
          <RiskDial score={cert.score} />
          <p className="mt-4 text-center text-xs text-slate-400">
            Model confidence {cert.confidence}% · {cert.factors.length} contributing factor
            {cert.factors.length === 1 ? '' : 's'}
          </p>
          <div className="mt-5 w-full border-t border-white/8 pt-4">
            <p className="panel-title mb-2">Detected anomalies</p>
            {cert.factors.length ? (
              <div className="flex flex-col gap-2">
                {cert.factors.map((f, i) => (
                  <div key={i} className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-white">{f.label}</p>
                      <span className="shrink-0 font-mono text-[10px] text-cyan-300">
                        +{f.weight.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-emerald/25 bg-emerald/8 p-3 text-xs text-emerald-200">
                No anomalies detected. This certificate passed all automated integrity checks.
              </p>
            )}
          </div>
          <div className="mt-4 w-full rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
            <p className="panel-title">Recommended action</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              {recommendedAction(cert.score, cert.primaryType)}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <SectionHead title="Blockchain lifecycle" subtitle={ledger.length + ' immutable ledger events'} icon={Link2} />
          <Timeline events={ledger} />
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <SectionHead title="Ownership chain" subtitle={(cert.transfers?.length || 0) + ' transfers'} />
            {cert.transfers && cert.transfers.length ? (
              <div className="flex flex-col gap-2">
                {cert.transfers.map((t, i) => (
                  <div key={t.id} className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-slate-500">
                        HOP {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">{fmtDateTime(t.date)}</span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-300">
                      <span className="text-slate-400">{t.from}</span>
                      <ArrowLeftRight size={11} className="mx-1.5 inline text-cyan-400" />
                      <span className="font-semibold text-white">{t.to}</span>
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <Hash value={t.txHash} chars={8} />
                      <span className="font-mono text-[10px] text-emerald-300">${t.priceUSD}/MWh</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">
                Still held by the original producer — no transfers recorded.
              </p>
            )}
          </Card>

          <Card>
            <SectionHead title="Actions" />
            <div className="flex flex-col gap-2">
              <button
                className="btn-ghost w-full"
                disabled={cert.status !== STATUS.ACTIVE}
                onClick={() => setTransferOpen(true)}
              >
                <ArrowLeftRight size={15} /> Transfer ownership
              </button>
              <button
                className="btn-ghost w-full"
                disabled={cert.status !== STATUS.ACTIVE}
                onClick={() => retireCertificate(cert.id, user?.buyerOrg || cert.owner)}
              >
                <Archive size={15} /> Retire certificate
              </button>
              <button
                className="btn-ghost w-full"
                onClick={() => downloadReport(cert, ledger, { issuedBy: user?.org })}
              >
                <Download size={15} /> Download verification report
              </button>
            </div>
            {cert.status !== STATUS.ACTIVE && (
              <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                Transfer and retirement are locked while the certificate is{' '}
                {cert.status.toLowerCase()}.
              </p>
            )}
          </Card>
        </div>
      </div>

      <Modal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        title="Transfer certificate ownership"
        subtitle={cert.id + ' · ' + cert.energyMWh + ' MWh ' + cert.source}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setTransferOpen(false)}>
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                transferCertificate(cert.id, target)
                setTransferOpen(false)
              }}
            >
              Confirm transfer
            </button>
          </>
        }
      >
        <Field label="Transfer to" hint="Written to the ledger immediately; the hop appears in the ownership chain.">
          <Select value={target} onChange={setTarget} options={BUYERS} />
        </Field>
      </Modal>
    </div>
  )
}
