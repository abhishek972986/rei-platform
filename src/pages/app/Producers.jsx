import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Factory, MapPin, Gauge, ShieldAlert, Download } from 'lucide-react'
import { useStore } from '../../data/store'
import { ENERGY_SOURCES } from '../../data/seed'
import {
  Card,
  SectionHead,
  Stat,
  Table,
  RiskBadge,
  SourceTag,
  SearchInput,
  Select,
  Progress,
  Modal,
  Hash,
  fmtDate,
  fmtNum,
  useFiltered,
} from '../../components/ui'
import { downloadCSV } from '../../utils/report'

export default function Producers() {
  const { producers, certificates } = useStore()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [src, setSrc] = useState('All')
  const [detail, setDetail] = useState(null)

  const enriched = useMemo(
    () =>
      producers
        .map((p) => {
          const list = certificates.filter((c) => c.producerId === p.id)
          const avg = list.length
            ? Math.round(list.reduce((s, c) => s + c.score, 0) / list.length)
            : 0
          const claimed = list.reduce((s, c) => s + c.claimedKWh, 0)
          const metered = list.reduce((s, c) => s + c.meteredKWh, 0)
          return {
            ...p,
            certificates: list.length,
            flagged: list.filter((c) => c.score >= 71).length,
            avgRisk: avg,
            energyMWh: Math.round(list.reduce((s, c) => s + c.energyMWh, 0)),
            variancePct: claimed ? Math.round(((claimed - metered) / claimed) * 1000) / 10 : 0,
            certs: list,
          }
        })
        .sort((a, b) => b.avgRisk - a.avgRisk),
    [producers, certificates]
  )

  const searched = useFiltered(enriched, q, ['id', 'name', 'location', 'source'])
  const rows = useMemo(
    () => searched.filter((p) => src === 'All' || p.source === src),
    [searched, src]
  )

  const watchlist = enriched.filter((p) => p.avgRisk >= 50 || p.priorIncidents > 0)

  const exportCsv = () =>
    downloadCSV(
      'rei-producers-' + new Date().toISOString().slice(0, 10) + '.csv',
      [
        { label: 'Producer ID', key: 'id' },
        { label: 'Organisation', key: 'name' },
        { label: 'Energy Source', key: 'source' },
        { label: 'Location', key: 'location' },
        { label: 'Capacity MW', key: 'capacityMW' },
        { label: 'Certificates', key: 'certificates' },
        { label: 'High Risk', key: 'flagged' },
        { label: 'Avg Risk', key: 'avgRisk' },
        { label: 'Integrity', key: 'integrity' },
        { label: 'Prior Incidents', key: 'priorIncidents' },
      ],
      rows
    )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="panel-title">Registry</p>
          <h1 className="mt-1.5 flex items-center gap-2.5 text-2xl font-extrabold text-white lg:text-3xl">
            <Factory className="text-emerald-400" size={26} /> Renewable Energy Producers
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {producers.length} registered producers · ranked by behavioural risk
          </p>
        </div>
        <button onClick={exportCsv} className="btn-ghost">
          <Download size={15} /> Export registry
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Registered producers" value={producers.length} icon={Factory} tone="emerald" />
        <Stat
          label="Total capacity"
          value={fmtNum(producers.reduce((s, p) => s + p.capacityMW, 0)) + ' MW'}
          icon={Gauge}
          tone="cyan"
        />
        <Stat label="On watchlist" value={watchlist.length} icon={ShieldAlert} tone="red" />
        <Stat
          label="Prior incidents"
          value={producers.reduce((s, p) => s + p.priorIncidents, 0)}
          tone="amber"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {enriched.slice(0, 6).map((p) => (
          <Card key={p.id} className="glass-hover cursor-pointer" onClick={() => setDetail(p)}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{p.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                  <MapPin size={11} /> {p.location}
                </p>
              </div>
              <SourceTag source={p.source} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                ['Certificates', p.certificates],
                ['High risk', p.flagged],
                ['Capacity', p.capacityMW + ' MW'],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-white/8 bg-white/[0.03] p-2.5">
                  <p className="font-mono text-sm font-bold text-white">{v}</p>
                  <p className="text-[9px] uppercase tracking-wider text-slate-500">{k}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex-1">
                <Progress
                  label="Integrity"
                  value={p.integrity}
                  tone={p.integrity >= 85 ? 'emerald' : p.integrity >= 65 ? 'amber' : 'red'}
                />
              </div>
              <RiskBadge score={p.avgRisk} />
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <SectionHead
          title="Producer registry"
          subtitle={rows.length + ' producers'}
          right={
            <div className="flex flex-wrap gap-2">
              <SearchInput value={q} onChange={setQ} placeholder="Name, location, ID…" className="w-full sm:w-56" />
              <Select value={src} onChange={setSrc} options={['All', ...ENERGY_SOURCES]} className="w-full sm:w-36" />
            </div>
          }
        />
        <Table
          onRowClick={(r) => setDetail(r)}
          rows={rows}
          columns={[
            {
              key: 'name',
              label: 'Producer',
              render: (r) => (
                <div>
                  <p className="text-slate-200">{r.name}</p>
                  <p className="font-mono text-[10px] text-slate-500">{r.id}</p>
                </div>
              ),
            },
            { key: 'source', label: 'Source', render: (r) => <SourceTag source={r.source} /> },
            { key: 'location', label: 'Location', render: (r) => <span className="text-slate-400">{r.location}</span> },
            {
              key: 'capacityMW',
              label: 'Capacity',
              render: (r) => <span className="font-mono text-slate-300">{r.capacityMW} MW</span>,
            },
            { key: 'certificates', label: 'Certificates', render: (r) => <span className="font-mono text-slate-300">{r.certificates}</span> },
            {
              key: 'flagged',
              label: 'High risk',
              render: (r) => (
                <span className={'font-mono ' + (r.flagged ? 'text-red-300' : 'text-slate-400')}>{r.flagged}</span>
              ),
            },
            {
              key: 'variancePct',
              label: 'Claim variance',
              render: (r) => (
                <span className={'font-mono ' + (r.variancePct > 5 ? 'text-red-300' : 'text-slate-300')}>
                  {r.variancePct}%
                </span>
              ),
            },
            {
              key: 'integrity',
              label: 'Integrity',
              render: (r) => (
                <div className="w-28">
                  <Progress value={r.integrity} tone={r.integrity >= 85 ? 'emerald' : r.integrity >= 65 ? 'amber' : 'red'} />
                </div>
              ),
            },
            { key: 'avgRisk', label: 'Avg risk', align: 'right', render: (r) => <RiskBadge score={r.avgRisk} /> },
          ]}
        />
      </Card>

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        wide
        title={detail ? detail.name : ''}
        subtitle={detail ? detail.id + ' · ' + detail.source + ' · ' + detail.location : ''}
      >
        {detail && (
          <div className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                ['Capacity', detail.capacityMW + ' MW'],
                ['Certificates', detail.certificates],
                ['Energy certified', fmtNum(detail.energyMWh) + ' MWh'],
                ['Prior incidents', detail.priorIncidents],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
                  <p className="panel-title">{k}</p>
                  <p className="mt-1 font-mono text-base font-bold text-white">{v}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                <p className="panel-title">Registered</p>
                <p className="mt-1 text-sm text-slate-200">{fmtDate(detail.registeredOn)}</p>
                <p className="panel-title mt-3">Wallet address</p>
                <p className="mt-1">
                  <Hash value={detail.walletAddress} chars={12} />
                </p>
                <p className="panel-title mt-3">Registered meters</p>
                <p className="mt-1 font-mono text-xs text-slate-300">{detail.meterIds.join(' · ')}</p>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                <Progress
                  label="Integrity score"
                  value={detail.integrity}
                  tone={detail.integrity >= 85 ? 'emerald' : detail.integrity >= 65 ? 'amber' : 'red'}
                />
                <div className="mt-3">
                  <Progress
                    label="Claim variance"
                    value={Math.min(100, Math.abs(detail.variancePct) * 5)}
                    tone={detail.variancePct > 5 ? 'red' : 'emerald'}
                  />
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-400">
                  {detail.priorIncidents
                    ? 'This producer has ' +
                      detail.priorIncidents +
                      ' confirmed prior incident(s); the engine applies a history penalty to every new claim.'
                    : 'No confirmed incidents on record. Claims are scored on current behaviour alone.'}
                </p>
              </div>
            </div>

            <div>
              <p className="panel-title mb-2">Certificates on file</p>
              <div className="max-h-64 overflow-y-auto">
                <Table
                  onRowClick={(r) => {
                    setDetail(null)
                    nav('/app/certificates/' + r.id)
                  }}
                  rows={detail.certs.slice(0, 20)}
                  columns={[
                    { key: 'id', label: 'Certificate', render: (r) => <span className="font-mono text-xs text-cyan-300">{r.id}</span> },
                    { key: 'energyMWh', label: 'Energy', render: (r) => <span className="font-mono text-slate-300">{r.energyMWh} MWh</span> },
                    { key: 'issuanceDate', label: 'Issued', render: (r) => <span className="text-xs text-slate-400">{fmtDate(r.issuanceDate)}</span> },
                    { key: 'score', label: 'Risk', align: 'right', render: (r) => <RiskBadge score={r.score} size="sm" /> },
                  ]}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
