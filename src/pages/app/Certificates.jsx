import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScrollText, Download, Plus, ArrowLeftRight, Archive, Check } from 'lucide-react'
import { useStore } from '../../data/store'
import { STATUS, ROLES, ENERGY_SOURCES } from '../../data/seed'
import {
  Card,
  SectionHead,
  Stat,
  Table,
  RiskBadge,
  StatusPill,
  SourceTag,
  SearchInput,
  Select,
  Modal,
  Field,
  fmtDate,
  fmtNum,
  useFiltered,
} from '../../components/ui'
import { downloadCSV } from '../../utils/report'

const BUYERS = [
  'Northbay Industries',
  'Cobalt Data Centers',
  'Meridian Airlines',
  'Vertex Manufacturing',
  'Aurora Retail Group',
  'Stratos Logistics',
  'Kingsway Telecom',
  'Orion Cloud Services',
]

export default function Certificates() {
  const { certificates, user, transferCertificate, retireCertificate, issueCertificate, stats } =
    useStore()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('All')
  const [source, setSource] = useState('All')
  const [risk, setRisk] = useState('All')
  const [transferFor, setTransferFor] = useState(null)
  const [target, setTarget] = useState(BUYERS[0])

  const scoped = useMemo(() => {
    if (user?.role === ROLES.PRODUCER)
      return certificates.filter((c) => c.producerId === user.producerId)
    if (user?.role === ROLES.BUYER)
      return certificates.filter((c) => c.owner === user.buyerOrg || c.retiredBy === user.buyerOrg)
    return certificates
  }, [certificates, user])

  const searched = useFiltered(scoped, q, ['id', 'producerName', 'owner', 'generationId', 'txHash'])

  const rows = useMemo(
    () =>
      searched.filter(
        (c) =>
          (status === 'All' || c.status === status) &&
          (source === 'All' || c.source === source) &&
          (risk === 'All' || c.level === risk)
      ),
    [searched, status, source, risk]
  )

  const canTransfer = user?.role === ROLES.BUYER || user?.role === ROLES.PRODUCER || user?.role === ROLES.REGULATOR
  const canIssue = user?.role === ROLES.ISSUER || user?.role === ROLES.REGULATOR

  const exportCsv = () =>
    downloadCSV(
      'rei-certificates-' + new Date().toISOString().slice(0, 10) + '.csv',
      [
        { label: 'Certificate ID', key: 'id' },
        { label: 'Generation ID', key: 'generationId' },
        { label: 'Producer', key: 'producerName' },
        { label: 'Source', key: 'source' },
        { label: 'Claimed kWh', key: 'claimedKWh' },
        { label: 'Metered kWh', key: 'meteredKWh' },
        { label: 'Energy MWh', key: 'energyMWh' },
        { label: 'Generated', get: (r) => new Date(r.generationDate).toISOString().slice(0, 10) },
        { label: 'Issued', get: (r) => new Date(r.issuanceDate).toISOString().slice(0, 10) },
        { label: 'Owner', key: 'owner' },
        { label: 'Status', key: 'status' },
        { label: 'Risk Score', key: 'score' },
        { label: 'Risk Level', key: 'level' },
        { label: 'Blockchain Tx', key: 'txHash' },
      ],
      rows
    )

  const doTransfer = () => {
    transferCertificate(transferFor.id, target)
    setTransferFor(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="panel-title">Certificate management</p>
          <h1 className="mt-1.5 flex items-center gap-2.5 text-2xl font-extrabold text-white lg:text-3xl">
            <ScrollText className="text-cyan-electric" size={26} /> REC Certificates
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {scoped.length} certificates in scope · every record backed by a ledger entry
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportCsv} className="btn-ghost">
            <Download size={15} /> Export CSV
          </button>
          {user?.role === ROLES.PRODUCER && (
            <button onClick={() => nav('/app/generation')} className="btn-primary">
              <Plus size={15} /> Request issuance
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Total" value={scoped.length} tone="cyan" />
        <Stat
          label="Active"
          value={scoped.filter((c) => c.status === STATUS.ACTIVE).length}
          tone="emerald"
        />
        <Stat
          label="Under investigation"
          value={scoped.filter((c) => c.status === STATUS.INVESTIGATING).length}
          tone="amber"
        />
        <Stat
          label="Suspicious"
          value={scoped.filter((c) => c.status === STATUS.SUSPICIOUS).length}
          tone="red"
        />
        <Stat
          label="Retired"
          value={scoped.filter((c) => c.status === STATUS.RETIRED).length}
          tone="violet"
        />
      </div>

      <Card>
        <SectionHead
          title="Certificate register"
          subtitle={rows.length + ' records shown'}
          right={
            <div className="flex flex-wrap gap-2">
              <SearchInput value={q} onChange={setQ} placeholder="ID, producer, owner, hash…" className="w-full sm:w-60" />
              <Select value={status} onChange={setStatus} options={['All', ...Object.values(STATUS)]} className="w-full sm:w-44" />
              <Select value={source} onChange={setSource} options={['All', ...ENERGY_SOURCES]} className="w-full sm:w-36" />
              <Select value={risk} onChange={setRisk} options={['All', 'LOW', 'MEDIUM', 'HIGH']} className="w-full sm:w-32" />
            </div>
          }
        />
        <Table
          onRowClick={(r) => nav('/app/certificates/' + r.id)}
          rows={rows}
          columns={[
            {
              key: 'id',
              label: 'Certificate',
              render: (r) => (
                <div>
                  <p className="font-mono text-xs font-semibold text-cyan-300">{r.id}</p>
                  <p className="font-mono text-[10px] text-slate-500">{r.generationId}</p>
                </div>
              ),
            },
            {
              key: 'producerName',
              label: 'Producer',
              render: (r) => (
                <div>
                  <p className="text-slate-200">{r.producerName}</p>
                  <p className="text-[11px] text-slate-500">{r.location}</p>
                </div>
              ),
            },
            { key: 'source', label: 'Source', render: (r) => <SourceTag source={r.source} /> },
            {
              key: 'energyMWh',
              label: 'Energy',
              render: (r) => (
                <div>
                  <p className="font-mono text-slate-200">{r.energyMWh} MWh</p>
                  <p className="font-mono text-[10px] text-slate-500">{fmtNum(r.claimedKWh)} kWh</p>
                </div>
              ),
            },
            {
              key: 'issuanceDate',
              label: 'Issued',
              render: (r) => <span className="text-xs text-slate-400">{fmtDate(r.issuanceDate)}</span>,
            },
            { key: 'owner', label: 'Current owner', render: (r) => <span className="text-slate-300">{r.owner}</span> },
            { key: 'score', label: 'Risk', render: (r) => <RiskBadge score={r.score} showBar /> },
            { key: 'status', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
            {
              key: 'actions',
              label: '',
              align: 'right',
              render: (r) => (
                <div className="flex justify-end gap-1.5">
                  {canIssue && r.status === STATUS.PENDING && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        issueCertificate(r.id)
                      }}
                      className="btn-ok !px-2.5 !py-1.5 text-xs"
                      title="Issue certificate"
                    >
                      <Check size={13} /> Issue
                    </button>
                  )}
                  {canTransfer && r.status === STATUS.ACTIVE && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setTransferFor(r)
                      }}
                      className="btn-ghost !px-2.5 !py-1.5"
                      title="Transfer ownership"
                    >
                      <ArrowLeftRight size={13} />
                    </button>
                  )}
                  {r.status === STATUS.ACTIVE && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        retireCertificate(r.id, user?.buyerOrg || r.owner)
                      }}
                      className="btn-ghost !px-2.5 !py-1.5"
                      title="Retire certificate"
                    >
                      <Archive size={13} />
                    </button>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={!!transferFor}
        onClose={() => setTransferFor(null)}
        title="Transfer certificate ownership"
        subtitle={transferFor ? transferFor.id + ' · ' + transferFor.energyMWh + ' MWh ' + transferFor.source : ''}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setTransferFor(null)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={doTransfer}>
              <ArrowLeftRight size={15} /> Confirm transfer
            </button>
          </>
        }
      >
        {transferFor && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
              <p className="panel-title">Current owner</p>
              <p className="mt-1 text-sm font-semibold text-white">{transferFor.owner}</p>
            </div>
            <Field label="Transfer to" hint="The transfer is written to the ledger immediately and cannot be reversed.">
              <Select value={target} onChange={setTarget} options={BUYERS} />
            </Field>
            {transferFor.score >= 31 && (
              <p className="rounded-xl border border-amber-400/25 bg-amber-400/8 p-3.5 text-xs text-amber-200">
                This certificate carries a risk score of {transferFor.score}. Transferring it while
                a review is open will be recorded against your organisation.
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
