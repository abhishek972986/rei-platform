import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchCheck, ArrowRight, Gavel, Clock, CheckCircle2, Flag } from 'lucide-react'
import { useStore } from '../../data/store'
import {
  Card,
  SectionHead,
  Stat,
  Table,
  RiskBadge,
  StatusPill,
  SeverityPill,
  SearchInput,
  Select,
  fmtDateTime,
  useFiltered,
} from '../../components/ui'

export default function Investigations() {
  const { alerts, certById } = useStore()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [state, setState] = useState('All')

  const cases = useMemo(
    () =>
      alerts.map((a) => {
        const c = certById(a.certificateId)
        return {
          ...a,
          certStatus: c ? c.status : '—',
          decision: c ? c.decision : null,
          caseState: c && c.decision ? 'Closed' : a.score >= 71 ? 'Open' : 'Monitoring',
          owner: c && c.decidedBy ? c.decidedBy : 'Unassigned',
          notes: (c && c.notes) || [],
        }
      }),
    [alerts, certById]
  )

  const searched = useFiltered(cases, q, ['id', 'certificateId', 'producerName', 'fraudType'])
  const rows = useMemo(
    () => searched.filter((c) => state === 'All' || c.caseState === state),
    [searched, state]
  )

  const counts = {
    open: cases.filter((c) => c.caseState === 'Open').length,
    monitoring: cases.filter((c) => c.caseState === 'Monitoring').length,
    closed: cases.filter((c) => c.caseState === 'Closed').length,
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="panel-title">Casework</p>
        <h1 className="mt-1.5 flex items-center gap-2.5 text-2xl font-extrabold text-white lg:text-3xl">
          <SearchCheck className="text-amber-400" size={26} /> Investigations
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Every flagged certificate becomes a case. Open one to see the evidence and rule on it.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total cases" value={cases.length} icon={SearchCheck} tone="cyan" />
        <Stat label="Open" value={counts.open} icon={Clock} tone="red" />
        <Stat label="Monitoring" value={counts.monitoring} icon={Flag} tone="amber" />
        <Stat label="Closed" value={counts.closed} icon={CheckCircle2} tone="emerald" />
      </div>

      <Card>
        <SectionHead
          title="Case queue"
          subtitle={rows.length + ' cases'}
          icon={Gavel}
          right={
            <div className="flex flex-wrap gap-2">
              <SearchInput value={q} onChange={setQ} placeholder="Case, certificate, producer…" className="w-full sm:w-60" />
              <Select
                value={state}
                onChange={setState}
                options={['All', 'Open', 'Monitoring', 'Closed']}
                className="w-full sm:w-36"
              />
            </div>
          }
        />
        <Table
          onRowClick={(r) => nav('/app/investigations/' + r.certificateId)}
          rows={rows}
          columns={[
            { key: 'id', label: 'Case', render: (r) => <span className="font-mono text-xs text-slate-300">{r.id}</span> },
            {
              key: 'certificateId',
              label: 'Certificate',
              render: (r) => <span className="font-mono text-xs text-cyan-300">{r.certificateId}</span>,
            },
            { key: 'producerName', label: 'Producer', render: (r) => <span className="text-slate-300">{r.producerName}</span> },
            { key: 'fraudType', label: 'Fraud type', render: (r) => <span className="text-slate-300">{r.fraudType}</span> },
            { key: 'score', label: 'Risk', render: (r) => <RiskBadge score={r.score} showBar /> },
            { key: 'severity', label: 'Severity', render: (r) => <SeverityPill severity={r.severity} /> },
            { key: 'certStatus', label: 'Certificate state', render: (r) => <StatusPill status={r.certStatus} /> },
            {
              key: 'caseState',
              label: 'Case',
              render: (r) => (
                <span
                  className={
                    'chip ' +
                    (r.caseState === 'Open'
                      ? 'border-red-400/30 bg-red-400/10 text-red-300'
                      : r.caseState === 'Closed'
                      ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                      : 'border-amber-400/30 bg-amber-400/10 text-amber-300')
                  }
                >
                  {r.caseState}
                  {r.decision ? ' · ' + r.decision : ''}
                </span>
              ),
            },
            {
              key: 'detectedAt',
              label: 'Detected',
              render: (r) => <span className="text-xs text-slate-400">{fmtDateTime(r.detectedAt)}</span>,
            },
            {
              key: 'go',
              label: '',
              align: 'right',
              render: () => <ArrowRight size={15} className="ml-auto text-slate-500" />,
            },
          ]}
        />
      </Card>
    </div>
  )
}
