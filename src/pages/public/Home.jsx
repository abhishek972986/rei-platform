import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  Link2,
  Lock,
  Cloud,
  Sun,
  Wind,
  Droplets,
  Leaf,
  Activity,
  ScanSearch,
  FileCheck2,
  TrendingUp,
} from 'lucide-react'
import HeroVisual from './HeroVisual'
import { useStore } from '../../data/store'

function Pill({ children }) {
  return (
    <span className="chip border-cyan-electric/25 bg-cyan-electric/8 text-cyan-200">{children}</span>
  )
}

const FEATURES = [
  {
    icon: BrainCircuit,
    title: 'AI & Machine Learning',
    body: 'An ensemble of Isolation Forest, Random Forest and autoencoder models learns each producer’s normal behaviour and surfaces what deviates from it.',
    tone: 'from-cyan-500/20',
  },
  {
    icon: Link2,
    title: 'Blockchain / DLT',
    body: 'Every issuance, transfer and retirement is written to an immutable Hyperledger ledger — no record can be edited or quietly removed after the fact.',
    tone: 'from-emerald-500/20',
  },
  {
    icon: Lock,
    title: 'Data Encryption',
    body: 'Meter telemetry and ownership records are encrypted with AES-256 in transit and at rest, with key custody separated from the application tier.',
    tone: 'from-violet-500/20',
  },
  {
    icon: Cloud,
    title: 'Secure Cloud Storage',
    body: 'Generation data streams from smart meters and IoT gateways into a scalable, access-controlled cloud store with full audit logging.',
    tone: 'from-amber-500/20',
  },
]

const FRAUD_CARDS = [
  {
    tag: 'Duplicate Certificate',
    color: 'text-red-300 border-red-400/25 bg-red-400/8',
    body: 'The same generation record certified more than once — one megawatt-hour sold twice.',
  },
  {
    tag: 'Generation Mismatch',
    color: 'text-orange-300 border-orange-400/25 bg-orange-400/8',
    body: 'Claimed output exceeds what the smart meters actually recorded at the plant.',
  },
  {
    tag: 'Unusual Issuance Pattern',
    color: 'text-amber-300 border-amber-400/25 bg-amber-400/8',
    body: 'Sudden spikes and abnormal issuance frequency that break a producer’s learned baseline.',
  },
  {
    tag: 'Suspicious Transfer',
    color: 'text-red-300 border-red-400/25 bg-red-400/8',
    body: 'Rapid or circular ownership chains designed to obscure who really holds the certificate.',
  },
]

const FLOW = [
  { icon: Sun, label: 'Energy Generated' },
  { icon: Activity, label: 'Data Collected' },
  { icon: BrainCircuit, label: 'AI Validation' },
  { icon: ScanSearch, label: 'Fraud Detection' },
  { icon: Link2, label: 'Ledger Registration' },
  { icon: FileCheck2, label: 'REC Issued' },
  { icon: TrendingUp, label: 'Ownership Tracked' },
  { icon: ShieldCheck, label: 'Retired' },
]

export default function Home() {
  const { stats } = useStore()
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-noise opacity-40" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div className="animate-fade-up">
            <Pill>
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-cyan-400" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
              </span>
              AI fraud engine online · {stats.alerts} live alerts
            </Pill>

            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Renewable Energy
              <br />
              <span className="text-gradient">Intelligence</span>
            </h1>

            <p className="mt-5 text-xl font-semibold text-slate-200 sm:text-2xl">
              Trust Every Megawatt. Verify Every Certificate.
            </p>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-400">
              AI-powered fraud detection and blockchain-based traceability for a secure and
              transparent Renewable Energy Certificate ecosystem — from the moment electricity is
              generated to the moment the certificate is retired.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login" className="btn-primary px-5 py-3">
                Explore Intelligence Platform <ArrowRight size={16} />
              </Link>
              <Link to="/verify" className="btn-ghost px-5 py-3">
                <ShieldCheck size={16} /> Verify a Certificate
              </Link>
            </div>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              {[
                ['Certificates secured', (125840).toLocaleString()],
                ['Detection accuracy', '96.8%'],
                ['Ledger records', '412,899'],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="font-mono text-xl font-bold text-white sm:text-2xl">{v}</p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-wider text-slate-500">{k}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-fade-up [animation-delay:120ms]">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* SOURCES STRIP */}
      <section className="border-y border-white/8 bg-navy-900/40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-5 py-6">
          <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
            Certifying generation from
          </span>
          {[
            [Sun, 'Solar'],
            [Wind, 'Wind'],
            [Droplets, 'Hydro'],
            [Leaf, 'Biomass'],
            [Activity, 'Geothermal'],
          ].map(([I, label]) => (
            <span key={label} className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <I size={16} className="text-emerald-400" /> {label}
            </span>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:py-20">
        <div className="max-w-2xl">
          <p className="panel-title">The problem</p>
          <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            A certificate is only as good as the generation behind it.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            REC issuance still runs across disconnected spreadsheets, registries and manual
            attestations. That disconnect is where fraud lives — and a fraudulent certificate
            launders a real emissions claim.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FRAUD_CARDS.map((c) => (
            <div key={c.tag} className="glass glass-hover p-5">
              <span className={'chip ' + c.color}>{c.tag}</span>
              <p className="mt-3.5 text-sm leading-relaxed text-slate-400">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="border-y border-white/8 bg-navy-900/30">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:py-20">
          <div className="text-center">
            <p className="panel-title">How it works</p>
            <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
              Generation to retirement, fully traced
            </h2>
          </div>
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FLOW.map((s, i) => (
              <div key={s.label} className="glass relative p-5">
                <span className="absolute right-4 top-4 font-mono text-xs text-slate-600">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-electric/20 bg-cyan-electric/10 text-cyan-300">
                  <s.icon size={18} />
                </div>
                <p className="mt-3 text-sm font-semibold text-white">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/how-it-works" className="btn-ghost">
              See the full workflow <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* TECHNOLOGY */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:py-20">
        <div className="text-center">
          <p className="panel-title">Technology</p>
          <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            Four layers of verifiable trust
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass glass-hover relative overflow-hidden p-6">
              <div
                className={
                  'pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-gradient-to-br to-transparent blur-2xl ' +
                  f.tone
                }
              />
              <div className="relative flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-cyan-300">
                  <f.icon size={20} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="glass relative overflow-hidden p-10 text-center lg:p-14">
          <div className="pointer-events-none absolute inset-0 grid-noise opacity-30" />
          <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-emerald/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-cyan-electric/15 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Step inside the intelligence platform
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-400">
              Sign in as a regulator, issuing authority, producer, corporate buyer or auditor and
              work a live fraud caseload end to end.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link to="/login" className="btn-primary px-5 py-3">
                Access Dashboard <ArrowRight size={16} />
              </Link>
              <Link to="/about" className="btn-ghost px-5 py-3">
                Learn about RECs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
