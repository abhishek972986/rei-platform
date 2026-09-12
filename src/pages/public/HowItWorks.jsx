import React from 'react'
import { Link } from 'react-router-dom'
import {
  Sun,
  Radio,
  Lock,
  BrainCircuit,
  ScanSearch,
  Gauge,
  Link2,
  FileCheck2,
  Siren,
  SearchCheck,
  Gavel,
  ArrowRight,
} from 'lucide-react'

const STEPS = [
  {
    icon: Sun,
    title: 'Renewable energy generation',
    body: 'A registered producer generates electricity from solar, wind, hydro, biomass or geothermal capacity and delivers it to the grid.',
    meta: 'Producer',
  },
  {
    icon: Radio,
    title: 'Generation data collection',
    body: 'Smart meters, IoT gateways and energy management systems stream interval readings directly into the platform — no manual re-keying.',
    meta: 'Smart meters · IoT · SCADA',
  },
  {
    icon: Lock,
    title: 'Secure data storage',
    body: 'Readings are validated for completeness, encrypted with AES-256 and written to access-controlled cloud storage with full audit logging.',
    meta: 'Encrypted at rest and in transit',
  },
  {
    icon: BrainCircuit,
    title: 'AI & ML analysis',
    body: 'The engine compares the claim against the producer’s historical generation profile, issuance frequency, transaction history and peer plants of similar capacity.',
    meta: 'Isolation Forest · Random Forest · Autoencoder',
  },
  {
    icon: ScanSearch,
    title: 'Anomaly detection',
    body: 'Four detectors run in parallel: duplicate generation records, claim-versus-meter mismatch, abnormal issuance bursts and suspicious ownership chains.',
    meta: '4 detector families',
  },
  {
    icon: Gauge,
    title: 'Fraud risk scoring',
    body: 'Weighted detector output produces a 0–100 risk score with the contributing evidence attached, banded into low, medium and high risk.',
    meta: 'Explainable score',
  },
  {
    icon: Link2,
    title: 'Blockchain registration',
    body: 'Certificate ID, generation ID, producer ID, timestamp and ownership are committed to the distributed ledger as an immutable audit record.',
    meta: 'Hyperledger Fabric',
  },
  {
    icon: FileCheck2,
    title: 'REC issuance',
    body: 'Claims that clear validation are issued as certificates in verified state and become transferable to corporate buyers.',
    meta: 'Status: Verified',
  },
  {
    icon: Siren,
    title: 'Fraud alert',
    body: 'Claims that trip the high-risk band are held, moved under investigation, and an alert is raised to the regulator and issuing authority.',
    meta: 'Status: Under investigation',
  },
  {
    icon: SearchCheck,
    title: 'Investigation',
    body: 'Auditors trace the certificate history, re-examine meter telemetry, review transfers and read the model’s evidence in the investigation workspace.',
    meta: 'Auditor workspace',
  },
  {
    icon: Gavel,
    title: 'Final decision',
    body: 'The case closes as approved, rejected, suspended or a false positive. Every decision is written back to the ledger and feeds the next model retrain.',
    meta: 'Ledger-recorded outcome',
  },
]

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-14 lg:py-20">
      <p className="panel-title">How it works</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        Eleven steps from <span className="text-gradient">electron to evidence</span>
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-400">
        Every certificate in the system follows the same pipeline. Nothing is issued on trust alone,
        and nothing leaves the pipeline without a ledger entry behind it.
      </p>

      <div className="relative mt-14">
        <div className="absolute bottom-0 left-[19px] top-0 w-px bg-gradient-to-b from-emerald/50 via-cyan-electric/30 to-transparent sm:left-[23px]" />
        <div className="flex flex-col gap-5">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative flex gap-5">
              <div className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-cyan-electric/25 bg-navy-880 text-cyan-300 sm:h-12 sm:w-12">
                <s.icon size={19} />
              </div>
              <div className="glass glass-hover flex-1 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs text-slate-500">
                    STEP {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-base font-bold text-white">{s.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.body}</p>
                <span className="chip mt-3 border-white/10 bg-white/5 text-slate-300">{s.meta}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass mt-14 p-6">
        <h2 className="text-lg font-bold text-white">Outcomes</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {[
            ['Approved', 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'],
            ['Rejected', 'border-red-400/30 bg-red-400/10 text-red-300'],
            ['Suspended', 'border-amber-400/30 bg-amber-400/10 text-amber-300'],
            ['False positive', 'border-slate-400/25 bg-slate-400/10 text-slate-300'],
          ].map(([t, c]) => (
            <div key={t} className={'rounded-xl border p-4 text-center text-sm font-semibold ' + c}>
              {t}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/login" className="btn-primary px-5 py-3">
          Run the workflow yourself <ArrowRight size={16} />
        </Link>
        <Link to="/technology" className="btn-ghost px-5 py-3">
          Technology stack
        </Link>
      </div>
    </div>
  )
}
