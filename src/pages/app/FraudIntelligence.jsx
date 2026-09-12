import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Siren,
  Copy,
  Gauge,
  Activity,
  Shuffle,
  Eye,
  Check,
  X,
  Flag,
  Download,
  Filter,
} from 'lucide-react'
import { useStore } from '../../data/store'
import { FRAUD_TYPES, recommendedAction } from '../../engine/fraudEngine'
import {
  Card,
  SectionHead,
  Stat,
  Table,
  RiskBadge,
  SeverityPill,
  SearchInput,
  Select,
  Modal,
  fmtDateTime,
  useFiltered,
} from '../../components/ui'
import { FraudTypeChart } from '../../components/charts'
import { downloadCSV } from '../../utils/report'

const TYPE_ICONS = {
  [FRAUD_TYPES.DUPLICATE]: Copy,
  [FRAUD_TYPES.MISMATCH]: Gauge,
  [FRAUD_TYPES.PATTERN]: Activity,
  [FRAUD_TYPES.TRANSFER]: Shuffle,
}

const TYPE_TONE = {
  [FRAUD_TYPES.DUPLICATE]: 'border-red-400/25 bg-red-400/8 text-red-300',
  [FRAUD_TYPES.MISMATCH]: 'border-orange-400/25 bg-orange-400/8 text-orange-300',
  [FRAUD_TYPES.PATTERN]: 'border-amber-400/25 bg-amber-400/8 text-amber-300',
  [FRAUD_TYPES.TRANSFER]: 'border-red-400/25 bg-red-400/8 text-red-300',
}

export default function FraudIntelligence() {
  const { alerts, applyDecision, certById } = useStore()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [type, setType] = useState('All')
  const [sev, setSev] = useState('All')
  const [detail, setDetail] = useState(null)

  const byType = useMemo(() => {
    const counts = {}
    Object.values(FRAUD_TYPES).forEach((t) => (counts[t] = 0))
    alerts.forEach((a) => (counts[a.fraudType] = (counts[a.fraudType] || 0) + 1))
    return Object.entries(counts)
      .map(([type, count]) => ({ type: type.replace(' Certificate', '').replace(' Data', ''), count, full: type }))
      .sort((a, b) => b.count - a.count)
  }, [alerts])

  const searched = useFiltered(alerts, q, ['id', 'certificateId', 'fraudType', 'producerName'])
  const rows = useMemo(
    () =>
      searched.filter(
        (a) => (type === 'All' || a.fraudType === type) && (sev === 'All' || a.severity === sev)
      ),
    [searched, type, sev]
  )

  const counts = {
    critical: alerts.filter((a) => a.severity === 'Critical').length,
    high: alerts.filter((a) => a.severity === 'High').length,
    medium: alerts.filter((a) => a.severity === 'Medium').length,
  }

  const act = (certId, decision) => {
    applyDecision(certId, decision)
    setDetail(null)
  }

  const exportCsv = () =>
    downloadCSV(
      'rei-fraud-alerts-' + new Date().toISOString().slice(0, 10) + '.csv',
      [
        { label: 'Alert ID', key: 'id' },
        { label: 'Certificate', key: 'certificateId' },
        { label: 'Producer', key: 'producerName' },
        { label: 'Fraud Type', key: 'fraudType' },
        { label: 'Risk Score', key: 'score' },
        { label: 'Severity', key: 'severity' },
        { label: 'Status', key: 'status' },
        { label: 'Detected', get: (r) => new Date(r.detectedAt).toISOString() },
      ],
      rows
    )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="panel-title">Fraud detection</p>
          <h1 className="mt-1.5 flex items-center gap-2.5 text-2xl font-extrabold text-white lg:text-3xl">
            <Siren className="text-red-400" size={26} /> Fraud Intelligence Center
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Every suspicious activity surfaced by the AI engine, ranked by risk score.
          </p>
        </div>
        <button onClick={exportCsv} className="btn-ghost">
          <Download size={15} /> Export alerts
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open alerts" value={alerts.length} icon={Siren} tone="red" />
        <Stat label="Critical severity" value={counts.critical} sub="Score 85+" tone="red" />
        <Stat label="High severity" value={counts.high} sub="Score 71–84" tone="amber" />
        <Stat label="Medium severity" value={counts.medium} sub="Score 51–70" tone="cyan" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <SectionHead title="Fraud type analysis" subtitle="Open alerts grouped by detector" />
          <FraudTypeChart data={byType} />
        </Card>
        <Card>
          <SectionHead title="Detector families" />
          <div className="flex flex-col gap-2.5">
            {Object.values(FRAUD_TYPES).map((t) => {
              const Icon = TYPE_ICONS[t]
              const n = alerts.filter((a) => a.fraudType === t).length
              return (
                <button
                  key={t}
                  onClick={() => setType(type === t ? 'All' : t)}
                  className={
                    'flex items-center gap-3 rounded-xl border p-3.5 text-left transition ' +
                    (type === t ? TYPE_TONE[t] : 'border-white/8 bg-white/[0.03] hover:border-white/20')
                  }
                >
                  <span className={'grid h-9 w-9 shrink-0 place-items-center rounded-lg border ' + TYPE_TONE[t]}>
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{t}</p>
                    <p className="text-[11px] text-slate-400">{n} open alert{n === 1 ? '' : 's'}</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-white">{n}</span>
                </button>
              )
            })}
          </div>
        </Card>
      </div>

      <Card>
        <SectionHead
          title="Alert queue"
          subtitle={rows.length + ' of ' + alerts.length + ' alerts'}
          icon={Filter}
          right={
            <div className="flex flex-wrap gap-2">
              <SearchInput value={q} onChange={setQ} placeholder="Alert, certificate, producer…" className="w-full sm:w-60" />
              <Select
                value={type}
                onChange={setType}
                options={['All', ...Object.values(FRAUD_TYPES)]}
                className="w-full sm:w-48"
              />
              <Select
                value={sev}
                onChange={setSev}
                options={['All', 'Critical', 'High', 'Medium', 'Low']}
                className="w-full sm:w-32"
              />
            </div>
          }
        />
        <Table
          rows={rows}
          empty="No alerts match these filters — the portfolio is clean for this selection."
          columns={[
            { key: 'id', label: 'Alert ID', render: (r) => <span className="font-mono text-xs text-slate-300">{r.id}</span> },
            {
              key: 'certificateId',
              label: 'Certificate',
              render: (r) => <span className="font-mono text-xs text-cyan-300">{r.certificateId}</span>,
            },
            {
              key: 'producerName',
              label: 'Producer',
              render: (r) => <span className="text-slate-300">{r.producerName}</span>,
            },
            {
              key: 'fraudType',
              label: 'Fraud type',
              render: (r) => {
                const Icon = TYPE_ICONS[r.fraudType]
                return (
                  <span className="flex items-center gap-2 text-slate-300">
                    <Icon size={14} className="text-slate-400" /> {r.fraudType}
                  </span>
                )
              },
            },
            { key: 'score', label: 'Risk score', render: (r) => <RiskBadge score={r.score} showBar /> },
            { key: 'severity', label: 'Severity', render: (r) => <SeverityPill severity={r.severity} /> },
            {
              key: 'detectedAt',
              label: 'Detected',
              render: (r) => <span className="text-xs text-slate-400">{fmtDateTime(r.detectedAt)}</span>,
            },
            {
              key: 'actions',
              label: 'Actions',
              align: 'right',
              render: (r) => (
                <div className="flex justify-end gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDetail(r)
                    }}
                    className="btn-ghost !px-2.5 !py-1.5"
                    title="View details"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      nav('/app/investigations/' + r.certificateId)
                    }}
                    className="btn-ghost !px-2.5 !py-1.5 text-xs"
                  >
                    Investigate
                  </button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        wide
        title={detail ? detail.id + ' · ' + detail.certificateId : ''}
        subtitle={detail ? detail.fraudType + ' · detected ' + fmtDateTime(detail.detectedAt) : ''}
        footer={
          detail && (
            <>
              <button className="btn-ok" onClick={() => act(detail.certificateId, 'approve')}>
                <Check size={15} /> Approve
              </button>
              <button className="btn-warn" onClick={() => act(detail.certificateId, 'suspend')}>
                Suspend
              </button>
              <button className="btn-danger" onClick={() => act(detail.certificateId, 'reject')}>
                <X size={15} /> Reject
              </button>
              <button className="btn-ghost" onClick={() => act(detail.certificateId, 'falsePositive')}>
                <Flag size={15} /> False positive
              </button>
              <button className="btn-primary" onClick={() => nav('/app/investigations/' + detail.certificateId)}>
                Open workspace
              </button>
            </>
          )
        }
      >
        {detail && (
          <div className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
                <p className="panel-title">Risk score</p>
                <p className="mt-1 font-mono text-2xl font-bold text-white">{detail.score}</p>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
                <p className="panel-title">Model confidence</p>
                <p className="mt-1 font-mono text-2xl font-bold text-white">{detail.confidence}%</p>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
                <p className="panel-title">Severity</p>
                <p className="mt-2">
                  <SeverityPill severity={detail.severity} />
                </p>
              </div>
            </div>

            <div>
              <p className="panel-title mb-2">Detected anomalies</p>
              <div className="flex flex-col gap-2">
                {detail.factors.map((f, i) => (
                  <div key={i} className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-white">{f.label}</p>
                      <span className="chip shrink-0 border-cyan-electric/25 bg-cyan-electric/8 text-cyan-200">
                        +{f.weight.toFixed(1)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{f.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-amber-400/25 bg-amber-400/8 p-4">
              <p className="panel-title !text-amber-300">Recommended action</p>
              <p className="mt-1.5 text-sm text-amber-100">
                {recommendedAction(detail.score, detail.fraudType)}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
