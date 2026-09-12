import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ScrollText,
  ShieldCheck,
  Siren,
  Archive,
  Zap,
  Gauge,
  ArrowRight,
  Play,
  Loader2,
  Activity,
  TrendingUp,
  Building2,
} from 'lucide-react'
import { useStore } from '../../data/store'
import { STATUS, ROLES, buildFraudTrend, modelMetrics, networkStats } from '../../data/seed'
import {
  Stat,
  Card,
  SectionHead,
  Table,
  RiskBadge,
  StatusPill,
  SourceTag,
  Hash,
  fmtDate,
  fmtNum,
  Modal,
} from '../../components/ui'
import {
  FraudTrendChart,
  RiskDistributionChart,
  SourceMixChart,
  AccuracyGauge,
} from '../../components/charts'

function ScanPanel() {
  const { runScan, certificates, toast } = useStore()
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [stage, setStage] = useState('')

  const stages = [
    'Loading generation telemetry…',
    'Reconciling claimed vs metered output…',
    'Running Isolation Forest over issuance frequency…',
    'Scanning ownership graph for circular transfers…',
    'Scoring certificates and writing verdicts…',
  ]

  const start = () => {
    setBusy(true)
    setResult(null)
    stages.forEach((s, i) => setTimeout(() => setStage(s), i * 320))
    setTimeout(() => {
      const r = runScan('Full portfolio')
      setResult(r)
      setBusy(false)
      setStage('')
      toast('Scan complete — ' + r.high + ' high-risk certificates require action.', r.high ? 'danger' : 'ok')
    }, stages.length * 320 + 400)
  }

  return (
    <Card className="flex flex-col">
      <SectionHead
        title="AI Fraud Detection Engine"
        subtitle={modelMetrics.modelVersion}
        icon={Activity}
      />
      <div className="flex flex-1 flex-col justify-between gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
            <p className="panel-title">Records in scope</p>
            <p className="mt-1 font-mono text-lg font-bold text-white">{certificates.length}</p>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
            <p className="panel-title">Detector families</p>
            <p className="mt-1 font-mono text-lg font-bold text-white">4</p>
          </div>
        </div>

        {busy ? (
          <div className="rounded-xl border border-cyan-electric/25 bg-cyan-electric/8 p-4">
            <div className="flex items-center gap-2.5 text-sm text-cyan-200">
              <Loader2 size={15} className="animate-spin" />
              {stage || 'Initialising…'}
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/3 animate-shimmer rounded-full bg-gradient-to-r from-transparent via-cyan-electric to-transparent bg-[length:500px_100%]" />
            </div>
          </div>
        ) : result ? (
          <div className="rounded-xl border border-emerald/25 bg-emerald/8 p-4">
            <p className="text-sm font-semibold text-emerald-200">
              Scan {result.id} finished in {(result.durationMs / 1000).toFixed(1)}s
            </p>
            <p className="mt-1 text-xs text-slate-300">
              {result.analysed} analysed · {result.flagged} flagged · {result.high} high risk
            </p>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-slate-400">
            Re-run the ensemble across every certificate on file. Detector output feeds the risk
            score, the alert queue and the investigation workspace.
          </p>
        )}

        <button onClick={start} disabled={busy} className="btn-primary">
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
          {busy ? 'Scanning…' : 'Run fraud detection'}
        </button>
      </div>
    </Card>
  )
}

export default function Dashboard() {
  const { stats, certificates, alerts, user } = useStore()
  const nav = useNavigate()
  const [ledgerOpen, setLedgerOpen] = useState(false)

  const trend = useMemo(() => buildFraudTrend(certificates), [certificates])
  const sourceMix = useMemo(() => {
    const map = {}
    certificates.forEach((c) => {
      map[c.source] = (map[c.source] || 0) + c.energyMWh
    })
    return Object.entries(map).map(([source, mwh]) => ({ source, mwh: Math.round(mwh) }))
  }, [certificates])

  const scoped = useMemo(() => {
    if (user?.role === ROLES.PRODUCER) return certificates.filter((c) => c.producerId === user.producerId)
    if (user?.role === ROLES.BUYER) return certificates.filter((c) => c.owner === user.buyerOrg)
    return certificates
  }, [certificates, user])

  const recentAlerts = alerts.slice(0, 6)

  const greeting =
    user?.role === ROLES.PRODUCER
      ? 'Your generation claims and certificate status'
      : user?.role === ROLES.BUYER
      ? 'Your certificate portfolio and retirement position'
      : user?.role === ROLES.AUDITOR
      ? 'Open cases, ledger trails and audit evidence'
      : 'National REC ecosystem overview'

  return (
    <div className="flex flex-col gap-6">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="panel-title">{user?.org}</p>
          <h1 className="mt-1.5 text-2xl font-extrabold text-white lg:text-3xl">
            Welcome back, {user?.name}
          </h1>
          <p className="mt-1 text-sm text-slate-400">{greeting}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/app/fraud" className="btn-ghost">
            <Siren size={15} /> Fraud Center
          </Link>
          <Link to="/app/certificates" className="btn-primary">
            <ScrollText size={15} /> Certificates
          </Link>
        </div>
      </div>

      {/* stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Total RECs"
          value={fmtNum(stats.totalDisplay)}
          sub={stats.total + ' in this working set'}
          icon={ScrollText}
          tone="cyan"
          trend={8.4}
        />
        <Stat
          label="Suspicious Activities"
          value={stats.suspicious}
          sub={stats.criticalAlerts + ' critical severity'}
          icon={Siren}
          tone="red"
          trend={-12.1}
        />
        <Stat
          label="High-Risk Certificates"
          value={stats.high}
          sub="Score 71–100"
          icon={Gauge}
          tone="amber"
        />
        <Stat
          label="Fraud Detection Accuracy"
          value={modelMetrics.accuracy + '%'}
          sub={'FPR ' + modelMetrics.falsePositiveRate + '%'}
          icon={ShieldCheck}
          tone="emerald"
          trend={1.2}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Active Certificates" value={stats.active} icon={ShieldCheck} tone="emerald" />
        <Stat label="Certificates Retired" value={stats.retired} icon={Archive} tone="violet" />
        <Stat
          label="Renewable Energy Certified"
          value={fmtNum(stats.totalMWh) + ' MWh'}
          icon={Zap}
          tone="cyan"
        />
        <Stat
          label="Registered Producers"
          value={stats.producers}
          sub={stats.pending + ' issuance requests pending'}
          icon={Building2}
          tone="amber"
        />
      </div>

      {/* charts */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <SectionHead
            title="Fraud detection trend"
            subtitle="Certificates issued against those flagged by the AI engine, 2026"
            icon={TrendingUp}
          />
          <FraudTrendChart data={trend} />
        </Card>
        <ScanPanel />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <SectionHead title="Risk distribution" subtitle="All scored certificates" />
          <RiskDistributionChart low={stats.low} medium={stats.medium} high={stats.high} />
          <div className="mt-2 grid grid-cols-3 gap-2 border-t border-white/8 pt-4 text-center">
            {[
              ['Low', stats.low, 'text-emerald-300'],
              ['Medium', stats.medium, 'text-amber-300'],
              ['High', stats.high, 'text-red-300'],
            ].map(([l, v, c]) => (
              <div key={l}>
                <p className={'font-mono text-lg font-bold ' + c}>{v}</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">{l} risk</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHead title="Certified energy by source" subtitle="Megawatt-hours certified" />
          <SourceMixChart data={sourceMix} />
        </Card>

        <Card>
          <SectionHead title="Model performance" subtitle={modelMetrics.modelVersion} />
          <AccuracyGauge value={modelMetrics.accuracy} label="Accuracy" />
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/8 pt-4 text-center">
            {[
              ['Precision', modelMetrics.precision],
              ['Recall', modelMetrics.recall],
              ['F1', modelMetrics.f1],
            ].map(([l, v]) => (
              <div key={l}>
                <p className="font-mono text-base font-bold text-white">{v}%</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">{l}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* alerts + ledger */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <SectionHead
            title="Latest fraud alerts"
            subtitle="Highest-scoring open cases"
            icon={Siren}
            right={
              <Link to="/app/fraud" className="btn-ghost !py-2 text-xs">
                View all {alerts.length} <ArrowRight size={14} />
              </Link>
            }
          />
          <Table
            onRowClick={(r) => nav('/app/investigations/' + r.certificateId)}
            columns={[
              { key: 'id', label: 'Alert', render: (r) => <span className="font-mono text-xs text-slate-300">{r.id}</span> },
              {
                key: 'certificateId',
                label: 'Certificate',
                render: (r) => <span className="font-mono text-xs text-cyan-300">{r.certificateId}</span>,
              },
              { key: 'fraudType', label: 'Fraud type', render: (r) => <span className="text-slate-300">{r.fraudType}</span> },
              { key: 'score', label: 'Risk', render: (r) => <RiskBadge score={r.score} size="sm" /> },
              {
                key: 'severity',
                label: 'Status',
                align: 'right',
                render: (r) => (
                  <span
                    className={
                      'chip ' +
                      (r.severity === 'Critical'
                        ? 'border-red-500/40 bg-red-500/15 text-red-300'
                        : r.severity === 'High'
                        ? 'border-orange-400/35 bg-orange-400/12 text-orange-300'
                        : 'border-amber-400/30 bg-amber-400/10 text-amber-300')
                    }
                  >
                    {r.severity}
                  </span>
                ),
              },
            ]}
            rows={recentAlerts}
          />
        </Card>

        <Card>
          <SectionHead
            title="Ledger activity"
            subtitle={networkStats.chain}
            right={
              <button onClick={() => setLedgerOpen(true)} className="btn-ghost !py-2 text-xs">
                Network
              </button>
            }
          />
          <div className="flex flex-col gap-2">
            {scoped
              .filter((c) => c.txHash)
              .slice(-7)
              .reverse()
              .map((c) => (
                <Link
                  key={c.id}
                  to={'/app/traceability/' + c.id}
                  className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3 transition hover:border-cyan-electric/30"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cyan-electric/10 text-cyan-300">
                    <Zap size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs text-white">{c.id}</p>
                    <Hash value={c.txHash} chars={8} />
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">
                    #{c.blockNumber?.toLocaleString()}
                  </span>
                </Link>
              ))}
          </div>
        </Card>
      </div>

      {/* portfolio table */}
      <Card>
        <SectionHead
          title={user?.role === ROLES.BUYER ? 'Your certificate portfolio' : 'Recent certificates'}
          subtitle={scoped.length + ' records in scope for your role'}
          right={
            <Link to="/app/certificates" className="btn-ghost !py-2 text-xs">
              Manage <ArrowRight size={14} />
            </Link>
          }
        />
        <Table
          onRowClick={(r) => nav('/app/certificates/' + r.id)}
          columns={[
            {
              key: 'id',
              label: 'Certificate',
              render: (r) => <span className="font-mono text-xs text-cyan-300">{r.id}</span>,
            },
            { key: 'producerName', label: 'Producer', render: (r) => <span className="text-slate-300">{r.producerName}</span> },
            { key: 'source', label: 'Source', render: (r) => <SourceTag source={r.source} /> },
            {
              key: 'energyMWh',
              label: 'Energy',
              render: (r) => <span className="font-mono text-slate-300">{r.energyMWh} MWh</span>,
            },
            { key: 'issuanceDate', label: 'Issued', render: (r) => <span className="text-slate-400">{fmtDate(r.issuanceDate)}</span> },
            { key: 'owner', label: 'Owner', render: (r) => <span className="text-slate-300">{r.owner}</span> },
            { key: 'score', label: 'Risk', render: (r) => <RiskBadge score={r.score} size="sm" /> },
            { key: 'status', label: 'Status', align: 'right', render: (r) => <StatusPill status={r.status} /> },
          ]}
          rows={scoped.slice(0, 8)}
          empty="No certificates are currently assigned to your organisation."
        />
      </Card>

      <Modal
        open={ledgerOpen}
        onClose={() => setLedgerOpen(false)}
        title="Blockchain network status"
        subtitle={networkStats.chain}
      >
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Consensus', networkStats.consensus],
            ['Peer nodes', networkStats.peers],
            ['Block height', networkStats.blockHeight.toLocaleString()],
            ['Avg block time', networkStats.avgBlockTime],
            ['Smart contracts', networkStats.contractsDeployed],
            ['Immutable records', networkStats.immutableRecords.toLocaleString()],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
              <p className="panel-title">{k}</p>
              <p className="mt-1 font-mono text-sm font-semibold text-white">{v}</p>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
