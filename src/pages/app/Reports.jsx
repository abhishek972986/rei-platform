import React, { useMemo, useState } from 'react'
import { FileBarChart, Download, FileText, Loader2, CheckCircle2 } from 'lucide-react'
import { useStore } from '../../data/store'
import { STATUS, modelMetrics, networkStats } from '../../data/seed'
import { Card, SectionHead, Stat, Table, Select, fmtDateTime } from '../../components/ui'
import { downloadCSV, downloadAuditPack } from '../../utils/report'

export default function Reports() {
  const { certificates, alerts, producers, stats, scanLog, user, toast } = useStore()
  const [period, setPeriod] = useState('2026 year to date')
  const [building, setBuilding] = useState(null)

  const history = useMemo(
    () => [
      {
        id: 'RPT-2026-014',
        name: 'Quarterly fraud summary — Q3 2026',
        type: 'Fraud analytics',
        generated: '2026-09-01T09:12:00.000Z',
        by: 'National Renewable Energy Regulatory Commission',
      },
      {
        id: 'RPT-2026-011',
        name: 'Producer integrity review — watchlist',
        type: 'Producer audit',
        generated: '2026-08-14T14:38:00.000Z',
        by: 'Veritas Energy Audit Partners',
      },
      {
        id: 'RPT-2026-008',
        name: 'Ledger reconciliation — H1 2026',
        type: 'Blockchain audit',
        generated: '2026-07-02T08:05:00.000Z',
        by: 'GreenCert Issuing Authority',
      },
    ],
    []
  )

  const build = (kind) => {
    setBuilding(kind)
    setTimeout(() => {
      if (kind === 'fraud') {
        downloadAuditPack('Fraud Intelligence Report', [
          {
            heading: 'Summary',
            lines: [
              'Reporting period       : ' + period,
              'Certificates in scope  : ' + stats.total,
              'Open alerts            : ' + alerts.length,
              'Critical severity      : ' + stats.criticalAlerts,
              'High-risk certificates : ' + stats.high,
              'Average risk score     : ' + stats.avgRisk + '/100',
              'Model                  : ' + modelMetrics.modelVersion,
              'Detection accuracy     : ' + modelMetrics.accuracy + '%',
            ],
          },
          {
            heading: 'Alert register',
            lines: alerts.map(
              (a) =>
                a.id.padEnd(9) +
                a.certificateId.padEnd(15) +
                String(a.score).padStart(3) +
                '  ' +
                a.severity.padEnd(9) +
                a.fraudType +
                ' — ' +
                a.producerName
            ),
          },
          {
            heading: 'Producers on watchlist',
            lines: producers
              .filter((p) => p.priorIncidents > 0 || p.integrity < 75)
              .map(
                (p) =>
                  p.id.padEnd(9) +
                  p.name.padEnd(28) +
                  'integrity ' +
                  String(p.integrity).padStart(3) +
                  '  incidents ' +
                  p.priorIncidents
              ),
          },
        ])
      } else if (kind === 'ledger') {
        downloadAuditPack('Blockchain Audit Trail', [
          {
            heading: 'Network',
            lines: [
              'Chain            : ' + networkStats.chain,
              'Consensus        : ' + networkStats.consensus,
              'Peer nodes       : ' + networkStats.peers,
              'Block height     : ' + networkStats.blockHeight.toLocaleString(),
              'Immutable records: ' + networkStats.immutableRecords.toLocaleString(),
            ],
          },
          {
            heading: 'Registered certificates',
            lines: certificates
              .filter((c) => c.txHash)
              .map((c) => c.id.padEnd(15) + 'block #' + String(c.blockNumber).padEnd(10) + c.txHash),
          },
        ])
      } else if (kind === 'compliance') {
        downloadAuditPack('Compliance & Retirement Statement', [
          {
            heading: 'Position',
            lines: [
              'Organisation        : ' + (user ? user.org : '—'),
              'Certificates held   : ' +
                certificates.filter((c) => c.owner === (user && user.buyerOrg)).length,
              'Certificates retired: ' + stats.retired,
              'Energy certified    : ' + stats.totalMWh.toLocaleString() + ' MWh',
            ],
          },
          {
            heading: 'Retired certificates',
            lines: certificates
              .filter((c) => c.status === STATUS.RETIRED)
              .map(
                (c) =>
                  c.id.padEnd(15) +
                  String(c.energyMWh).padStart(7) +
                  ' MWh  ' +
                  c.source.padEnd(11) +
                  'retired by ' +
                  (c.retiredBy || '—')
              ),
          },
        ])
      }
      setBuilding(null)
      toast('Report generated and downloaded.')
    }, 1100)
  }

  const exportCerts = () =>
    downloadCSV(
      'rei-certificate-register-' + new Date().toISOString().slice(0, 10) + '.csv',
      [
        { label: 'Certificate ID', key: 'id' },
        { label: 'Generation ID', key: 'generationId' },
        { label: 'Producer', key: 'producerName' },
        { label: 'Source', key: 'source' },
        { label: 'Energy MWh', key: 'energyMWh' },
        { label: 'Owner', key: 'owner' },
        { label: 'Status', key: 'status' },
        { label: 'Risk', key: 'score' },
        { label: 'Tx', key: 'txHash' },
      ],
      certificates
    )

  const CARDS = [
    {
      key: 'fraud',
      title: 'Fraud intelligence report',
      body: 'Full alert register, severity breakdown, producer watchlist and model performance for the selected period.',
      icon: FileBarChart,
    },
    {
      key: 'ledger',
      title: 'Blockchain audit trail',
      body: 'Every certificate with its block height and transaction hash, for independent re-verification against the network.',
      icon: FileText,
    },
    {
      key: 'compliance',
      title: 'Compliance & retirement statement',
      body: 'Certificates held and retired by your organisation, for inclusion in a sustainability disclosure.',
      icon: CheckCircle2,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="panel-title">Documentation</p>
          <h1 className="mt-1.5 flex items-center gap-2.5 text-2xl font-extrabold text-white lg:text-3xl">
            <FileBarChart className="text-violet-400" size={26} /> Reports & Audit Exports
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Generate audit documentation from live platform data.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={period}
            onChange={setPeriod}
            options={['2026 year to date', 'Q3 2026', 'Q2 2026', 'Q1 2026', 'Last 30 days']}
            className="w-52"
          />
          <button onClick={exportCerts} className="btn-ghost">
            <Download size={15} /> Certificate register (CSV)
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Certificates" value={stats.total} tone="cyan" />
        <Stat label="Alerts in period" value={alerts.length} tone="red" />
        <Stat label="Retired" value={stats.retired} tone="violet" />
        <Stat label="Energy certified" value={stats.totalMWh.toLocaleString() + ' MWh'} tone="emerald" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {CARDS.map((c) => (
          <Card key={c.key} className="flex flex-col">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-violet-400/20 bg-violet-400/10 text-violet-300">
              <c.icon size={20} />
            </span>
            <h3 className="mt-4 text-base font-bold text-white">{c.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{c.body}</p>
            <button onClick={() => build(c.key)} disabled={building === c.key} className="btn-primary mt-4">
              {building === c.key ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Compiling…
                </>
              ) : (
                <>
                  <Download size={15} /> Generate report
                </>
              )}
            </button>
          </Card>
        ))}
      </div>

      <Card>
        <SectionHead title="Detection scan history" subtitle="Fraud engine runs in this session" />
        <Table
          rows={scanLog}
          empty="No scans run yet in this session — start one from the dashboard."
          columns={[
            { key: 'id', label: 'Scan', render: (r) => <span className="font-mono text-xs text-cyan-300">{r.id}</span> },
            { key: 'scope', label: 'Scope', render: (r) => <span className="text-slate-300">{r.scope}</span> },
            { key: 'analysed', label: 'Analysed', render: (r) => <span className="font-mono text-slate-300">{r.analysed}</span> },
            { key: 'flagged', label: 'Flagged', render: (r) => <span className="font-mono text-amber-300">{r.flagged}</span> },
            { key: 'high', label: 'High risk', render: (r) => <span className="font-mono text-red-300">{r.high}</span> },
            {
              key: 'durationMs',
              label: 'Duration',
              render: (r) => <span className="font-mono text-slate-400">{(r.durationMs / 1000).toFixed(1)}s</span>,
            },
            { key: 'at', label: 'Run at', align: 'right', render: (r) => <span className="text-xs text-slate-400">{fmtDateTime(r.at)}</span> },
          ]}
        />
      </Card>

      <Card>
        <SectionHead title="Previously filed reports" subtitle="Archived audit documentation" />
        <Table
          rows={history}
          columns={[
            { key: 'id', label: 'Reference', render: (r) => <span className="font-mono text-xs text-slate-300">{r.id}</span> },
            { key: 'name', label: 'Report', render: (r) => <span className="text-slate-200">{r.name}</span> },
            { key: 'type', label: 'Type', render: (r) => <span className="chip border-white/10 bg-white/5 text-slate-300">{r.type}</span> },
            { key: 'by', label: 'Filed by', render: (r) => <span className="text-slate-400">{r.by}</span> },
            { key: 'generated', label: 'Generated', align: 'right', render: (r) => <span className="text-xs text-slate-400">{fmtDateTime(r.generated)}</span> },
          ]}
        />
      </Card>
    </div>
  )
}
