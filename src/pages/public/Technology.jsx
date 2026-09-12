import React from 'react'
import { Link } from 'react-router-dom'
import { BrainCircuit, Link2, Lock, Cloud, Database, Server, Layout, ArrowRight } from 'lucide-react'
import { modelMetrics, networkStats } from '../../data/seed'

const PILLARS = [
  {
    icon: BrainCircuit,
    title: 'AI & Machine Learning',
    tagline: 'Detects unusual patterns and suspicious activities.',
    points: [
      'Isolation Forest for volume and frequency anomalies',
      'Random Forest classifier over producer behaviour features',
      'Autoencoder reconstruction error on meter telemetry',
      'Statistical z-score bands for meter deviation',
    ],
  },
  {
    icon: Link2,
    title: 'Blockchain / DLT',
    tagline: 'Creates immutable and transparent certificate records.',
    points: [
      'Hyperledger Fabric permissioned network',
      'RAFT ordering service across five orderers',
      'Chaincode for issuance, transfer and retirement',
      'Every state change carries a block height and hash',
    ],
  },
  {
    icon: Lock,
    title: 'Data Encryption',
    tagline: 'Protects sensitive generation and ownership information.',
    points: [
      'AES-256 at rest, TLS 1.3 in transit',
      'Key custody separated from the application tier',
      'Field-level encryption on ownership records',
      'Signed meter payloads from registered devices',
    ],
  },
  {
    icon: Cloud,
    title: 'Secure Cloud Storage',
    tagline: 'Provides secure and scalable data management.',
    points: [
      'Streaming ingest from smart meters and IoT gateways',
      'Immutable object storage for raw telemetry',
      'Role-scoped access with full audit logging',
      'Regional replication for continuity',
    ],
  },
]

const STACK = [
  { icon: Layout, layer: 'Frontend', tech: 'React · Vite · Tailwind CSS · Recharts', note: 'Role-aware enterprise dashboard' },
  { icon: Server, layer: 'Backend', tech: 'Node.js · Express (or Python · FastAPI)', note: 'REST API, auth, business rules' },
  { icon: BrainCircuit, layer: 'AI/ML engine', tech: 'Python · scikit-learn · TensorFlow · pandas · NumPy', note: 'Scoring service and retraining pipeline' },
  { icon: Database, layer: 'Database', tech: 'PostgreSQL', note: 'Users, producers, generation, certificates, alerts' },
  { icon: Link2, layer: 'Blockchain', tech: 'Hyperledger Fabric (Ethereum / Polygon compatible)', note: 'Immutable registry and audit trail' },
  { icon: Cloud, layer: 'Cloud', tech: 'AWS · Azure · Google Cloud', note: 'Storage, streaming ingest, key management' },
]

export default function Technology() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14 lg:py-20">
      <p className="panel-title">Technology</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        Built on <span className="text-gradient">four layers of trust</span>
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-400">
        Intelligence catches what humans miss. The ledger makes sure nobody can rewrite what was
        caught.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {PILLARS.map((p) => (
          <div key={p.title} className="glass glass-hover p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-electric/20 bg-cyan-electric/10 text-cyan-300">
                <p.icon size={20} />
              </span>
              <div>
                <h3 className="font-bold text-white">{p.title}</h3>
                <p className="text-xs text-slate-400">{p.tagline}</p>
              </div>
            </div>
            <ul className="mt-4 flex flex-col gap-2">
              {p.points.map((pt) => (
                <li key={pt} className="flex gap-2.5 text-sm text-slate-400">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-bold text-white">Reference architecture</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {STACK.map((s) => (
            <div key={s.layer} className="glass p-5">
              <div className="flex items-center gap-2.5">
                <s.icon size={17} className="text-emerald-400" />
                <p className="panel-title !tracking-[0.14em]">{s.layer}</p>
              </div>
              <p className="mt-2.5 text-sm font-semibold text-white">{s.tech}</p>
              <p className="mt-1 text-xs text-slate-400">{s.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-4 lg:grid-cols-2">
        <div className="glass p-6">
          <h3 className="font-bold text-white">Model ensemble</h3>
          <p className="mt-1 text-xs text-slate-400">
            {modelMetrics.modelVersion} · trained on{' '}
            {modelMetrics.samplesTrained.toLocaleString()} certificate records
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {modelMetrics.ensemble.map((m) => (
              <div key={m.name} className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{m.name}</p>
                  <span className="font-mono text-xs text-cyan-300">{m.accuracy}%</span>
                </div>
                <p className="mt-0.5 text-xs text-slate-400">{m.task}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-cyan-electric/70" style={{ width: m.weight * 2.6 + '%' }} />
                </div>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
                  Ensemble weight {m.weight}%
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-6">
          <h3 className="font-bold text-white">Ledger network</h3>
          <p className="mt-1 text-xs text-slate-400">{networkStats.chain}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
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
          <div className="mt-4 rounded-xl border border-emerald/20 bg-emerald/8 p-4">
            <p className="text-sm font-semibold text-emerald-300">ERC-721 compatible</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Certificates map one-to-one onto non-fungible tokens, so the registry can settle on a
              permissioned Fabric channel or a public EVM chain without changing the data model.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-12">
        <Link to="/login" className="btn-primary px-5 py-3">
          Access the platform <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
