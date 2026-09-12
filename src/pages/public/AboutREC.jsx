import React from 'react'
import { Link } from 'react-router-dom'
import {
  Sun,
  Wind,
  Droplets,
  Leaf,
  AlertTriangle,
  Copy,
  Gauge,
  Shuffle,
  Eye,
  ArrowRight,
} from 'lucide-react'

const FRAUD = [
  {
    icon: Copy,
    title: 'Double issuance',
    body: 'One generation record is submitted to two registries, or re-submitted after a gap, producing two certificates for a single megawatt-hour.',
  },
  {
    icon: Gauge,
    title: 'Inflated generation claims',
    body: 'A producer reports more output than the plant physically produced. Without meter reconciliation, the surplus becomes sellable certificates.',
  },
  {
    icon: Shuffle,
    title: 'Ownership laundering',
    body: 'Rapid transfers through intermediaries break the audit trail, so a buyer cannot tell whether a certificate was already claimed elsewhere.',
  },
  {
    icon: Eye,
    title: 'Retirement blindness',
    body: 'A retired certificate that is not visibly marked can be resold, letting two organisations report the same emissions reduction.',
  },
]

export default function AboutREC() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-14 lg:py-20">
      <p className="label">About Renewable Energy Certificates</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
        One certificate. <span className="text-brand">One megawatt-hour.</span>
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink-2">
        A Renewable Energy Certificate is the tradable proof that one megawatt-hour of electricity
        was generated from a renewable source and delivered to the grid. Electrons are
        indistinguishable once they enter the grid — the certificate is what carries the
        environmental claim.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [Sun, 'Solar', 'Photovoltaic and concentrated solar plants'],
          [Wind, 'Wind', 'Onshore and offshore wind farms'],
          [Droplets, 'Hydro', 'Run-of-river and reservoir hydropower'],
          [Leaf, 'Biomass', 'Agricultural residue and biogas plants'],
        ].map(([I, t, b]) => (
          <div key={t} className="card card-hover p-5">
            <I size={20} className="text-brand" />
            <p className="mt-3 font-semibold text-ink">{t}</p>
            <p className="mt-1 text-sm text-ink-2">{b}</p>
          </div>
        ))}
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-bold text-ink">Why they matter</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            [
              'Corporate climate claims',
              'RECs are how an organisation substantiates a renewable-electricity claim in its sustainability disclosure. The certificate is the audit evidence.',
            ],
            [
              'Revenue for producers',
              'Certificate sales are a second revenue stream alongside the electricity itself, improving the economics of new renewable capacity.',
            ],
            [
              'Regulatory compliance',
              'Renewable purchase obligations and national targets are measured in certificates surrendered, not in promises made.',
            ],
          ].map(([t, b]) => (
            <div key={t} className="card p-5">
              <p className="font-semibold text-ink">{t}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="flex items-center gap-2">
          <AlertTriangle size={20} className="text-amber-500" />
          <h2 className="text-2xl font-bold text-ink">How REC fraud happens</h2>
        </div>
        <p className="mt-3 max-w-3xl text-ink-2">
          Because the certificate travels separately from the electricity, the integrity of the
          whole market rests on record-keeping. Where records are manual or siloed, four patterns
          recur.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {FRAUD.map((f) => (
            <div key={f.title} className="card card-hover flex gap-4 p-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-red-200 bg-red-50 text-red-600 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
                <f.icon size={18} />
              </span>
              <div>
                <p className="font-semibold text-ink">{f.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-bold text-ink">Why traceability is non-negotiable</h2>
        <div className="card mt-5 p-6">
          <p className="leading-relaxed text-ink-2">
            A certificate without a traceable lifecycle is an assertion, not evidence. REI records
            every state change — generation, verification, issuance, each transfer, and retirement —
            as an append-only ledger entry. An auditor can reconstruct the full history of any
            certificate from the meter reading that created it to the organisation that retired it,
            and can prove that no intermediate record was altered.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              ['Append-only', 'Records are added, never edited or deleted.'],
              ['Independently verifiable', 'Any party can confirm a hash without trusting the registry.'],
              ['Time-ordered', 'Every event carries a block height and timestamp.'],
            ].map(([t, b]) => (
              <div key={t} className="rounded-xl border border-line bg-surface-2 p-4">
                <p className="text-sm font-semibold text-brand-ink">{t}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-2">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link to="/how-it-works" className="btn-brand px-5 py-3">
          See how REI works <ArrowRight size={16} />
        </Link>
        <Link to="/verify" className="btn-outline px-5 py-3">
          Verify a certificate
        </Link>
      </div>
    </div>
  )
}
