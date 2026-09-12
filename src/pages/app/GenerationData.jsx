import React, { useMemo, useState } from 'react'
import { Zap, Upload, Radio, AlertTriangle, CheckCircle2, FileUp, Send } from 'lucide-react'
import { useStore } from '../../data/store'
import { ROLES } from '../../data/seed'
import {
  Card,
  SectionHead,
  Stat,
  Table,
  SearchInput,
  Select,
  Field,
  Modal,
  SourceTag,
  fmtDateTime,
  fmtNum,
  useFiltered,
  Progress,
} from '../../components/ui'
import { GenerationCompareChart } from '../../components/charts'
import { buildGenerationSeries } from '../../data/seed'

function MismatchBadge({ claimed, metered }) {
  const diff = claimed - metered
  const pct = (diff / claimed) * 100
  const tone =
    pct > 10
      ? 'border-red-400/30 bg-red-400/10 text-red-300'
      : pct > 2
      ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
      : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
  const label = pct > 10 ? 'Suspicious mismatch' : pct > 2 ? 'Minor variance' : 'Verified'
  return (
    <span className={'chip ' + tone}>
      {pct > 2 ? <AlertTriangle size={11} /> : <CheckCircle2 size={11} />}
      {label} · {pct.toFixed(1)}%
    </span>
  )
}

export default function GenerationData() {
  const { generation, producers, certificates, user, submitGeneration, requestIssuance } = useStore()
  const [q, setQ] = useState('')
  const [src, setSrc] = useState('All')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    producerId: user?.producerId || 'PRD-001',
    meterId: 'MTR-001-A',
    claimedKWh: '48000',
    meteredKWh: '47200',
    date: new Date().toISOString().slice(0, 10),
    dataSource: 'Smart Meter Telemetry',
  })

  const scoped = useMemo(() => {
    if (user?.role === ROLES.PRODUCER)
      return generation.filter((g) => g.producerId === user.producerId)
    return generation
  }, [generation, user])

  const searched = useFiltered(scoped, q, ['id', 'producerName', 'meterId'])
  const rows = useMemo(
    () => searched.filter((g) => src === 'All' || g.source === src),
    [searched, src]
  )

  const totals = useMemo(() => {
    const claimed = scoped.reduce((s, g) => s + g.claimedKWh, 0)
    const metered = scoped.reduce((s, g) => s + g.meteredKWh, 0)
    const mismatched = scoped.filter((g) => (g.claimedKWh - g.meteredKWh) / g.claimedKWh > 0.02)
    return {
      claimed,
      metered,
      diff: claimed - metered,
      pct: Math.round(((claimed - metered) / (claimed || 1)) * 1000) / 10,
      mismatched: mismatched.length,
    }
  }, [scoped])

  const genSeries = useMemo(() => buildGenerationSeries(certificates), [certificates])

  const submit = (e) => {
    e.preventDefault()
    const rec = submitGeneration(form)
    setOpen(false)
    setTimeout(() => requestIssuance(rec), 600)
  }

  const canSubmit = user?.role === ROLES.PRODUCER || user?.role === ROLES.REGULATOR

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="panel-title">Telemetry</p>
          <h1 className="mt-1.5 flex items-center gap-2.5 text-2xl font-extrabold text-white lg:text-3xl">
            <Zap className="text-amber-400" size={26} /> Generation Data Validation
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Claimed generation reconciled against smart-meter and IoT telemetry.
          </p>
        </div>
        {canSubmit && (
          <button onClick={() => setOpen(true)} className="btn-primary">
            <Upload size={15} /> Submit generation data
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Expected generation" value={fmtNum(totals.claimed) + ' kWh'} icon={Zap} tone="cyan" />
        <Stat label="Actual metered" value={fmtNum(totals.metered) + ' kWh'} icon={Radio} tone="emerald" />
        <Stat
          label="Difference"
          value={fmtNum(totals.diff) + ' kWh'}
          sub={totals.pct + '% of claimed output'}
          tone={totals.pct > 5 ? 'red' : 'amber'}
        />
        <Stat
          label="Records with mismatch"
          value={totals.mismatched}
          sub={'of ' + scoped.length + ' submissions'}
          icon={AlertTriangle}
          tone="red"
        />
      </div>

      <Card>
        <SectionHead
          title="Claimed versus verified generation"
          subtitle="Monthly aggregate in megawatt-hours"
        />
        <GenerationCompareChart data={genSeries} height={280} />
      </Card>

      <Card>
        <SectionHead
          title="Generation records"
          subtitle={rows.length + ' meter submissions'}
          right={
            <div className="flex flex-wrap gap-2">
              <SearchInput value={q} onChange={setQ} placeholder="Record, producer, meter…" className="w-full sm:w-56" />
              <Select
                value={src}
                onChange={setSrc}
                options={['All', 'Solar', 'Wind', 'Hydro', 'Biomass', 'Geothermal']}
                className="w-full sm:w-36"
              />
            </div>
          }
        />
        <Table
          rows={rows.slice(0, 60)}
          columns={[
            {
              key: 'id',
              label: 'Record',
              render: (r) => (
                <div>
                  <p className="font-mono text-xs text-cyan-300">{r.id}</p>
                  <p className="font-mono text-[10px] text-slate-500">{r.meterId}</p>
                </div>
              ),
            },
            {
              key: 'producerName',
              label: 'Producer',
              render: (r) => <span className="text-slate-300">{r.producerName}</span>,
            },
            { key: 'source', label: 'Source', render: (r) => <SourceTag source={r.source} /> },
            {
              key: 'claimedKWh',
              label: 'Claimed',
              render: (r) => <span className="font-mono text-slate-200">{fmtNum(r.claimedKWh)} kWh</span>,
            },
            {
              key: 'meteredKWh',
              label: 'Metered',
              render: (r) => <span className="font-mono text-slate-200">{fmtNum(r.meteredKWh)} kWh</span>,
            },
            {
              key: 'diff',
              label: 'Difference',
              render: (r) => (
                <span className="font-mono text-slate-400">
                  {fmtNum(r.claimedKWh - r.meteredKWh)} kWh
                </span>
              ),
            },
            {
              key: 'status',
              label: 'Validation',
              render: (r) => <MismatchBadge claimed={r.claimedKWh} metered={r.meteredKWh} />,
            },
            {
              key: 'timestamp',
              label: 'Submitted',
              align: 'right',
              render: (r) => <span className="text-xs text-slate-400">{fmtDateTime(r.timestamp)}</span>,
            },
          ]}
        />
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <SectionHead title="Data sources" subtitle="Ingest channels in use" />
          <div className="flex flex-col gap-3">
            {['Smart Meter Telemetry', 'IoT Gateway', 'SCADA Export', 'EMS Feed'].map((s) => {
              const n = scoped.filter((g) => g.dataSource === s).length
              const pct = Math.round((n / (scoped.length || 1)) * 100)
              return <Progress key={s} label={s} value={pct} tone="cyan" />
            })}
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <SectionHead title="Encryption & storage" subtitle="How this data is protected" />
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['AES-256 at rest', 'Every meter payload is encrypted before it reaches cloud storage.'],
              ['TLS 1.3 in transit', 'Gateways authenticate with device certificates on every push.'],
              ['Signed payloads', 'Readings carry a device signature so origin can be proven later.'],
              ['Immutable raw copy', 'The unmodified reading is retained for audit reconstruction.'],
            ].map(([t, b]) => (
              <div key={t} className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm font-semibold text-emerald-300">{t}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{b}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Submit generation data"
        subtitle="The reading is encrypted, validated and an issuance request is raised automatically."
        footer={
          <>
            <button className="btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={submit}>
              <Send size={15} /> Submit & request issuance
            </button>
          </>
        }
      >
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Producer">
            <Select
              value={form.producerId}
              onChange={(v) => setForm({ ...form, producerId: v })}
              options={producers.map((p) => ({ value: p.id, label: p.name + ' (' + p.source + ')' }))}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Meter ID">
              <input className="input font-mono" value={form.meterId} onChange={(e) => setForm({ ...form, meterId: e.target.value })} />
            </Field>
            <Field label="Generation date">
              <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Claimed generation (kWh)">
              <input
                type="number"
                className="input font-mono"
                value={form.claimedKWh}
                onChange={(e) => setForm({ ...form, claimedKWh: e.target.value })}
              />
            </Field>
            <Field label="Metered generation (kWh)" hint="A gap above 2% triggers the mismatch detector.">
              <input
                type="number"
                className="input font-mono"
                value={form.meteredKWh}
                onChange={(e) => setForm({ ...form, meteredKWh: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Data source">
            <Select
              value={form.dataSource}
              onChange={(v) => setForm({ ...form, dataSource: v })}
              options={['Smart Meter Telemetry', 'IoT Gateway', 'SCADA Export', 'EMS Feed']}
            />
          </Field>
          <div className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.03] p-3.5 text-xs text-slate-400">
            <FileUp size={15} className="shrink-0 text-cyan-400" />
            Attach the signed meter export (.csv) — optional in this demonstration environment.
          </div>
        </form>
      </Modal>
    </div>
  )
}
