import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ShieldCheck,
  Eye,
  Leaf,
  Hexagon,
  Zap,
  BrainCircuit,
  Boxes,
  Lock,
  Users,
  Check,
  Landmark,
  Stamp,
  Building2,
  SearchCheck,
  Gauge,
  BadgeCheck,
} from 'lucide-react'
import { HeroScene, UseCaseScene, CtaScene } from './scenes'
import { useStore } from '../../data/store'

/* ------------------------------------------------------------------ */

const LIFECYCLE = ['Generation', 'Issuance', 'Transfer', 'Retirement']

const CHALLENGES = [
  {
    icon: Hexagon,
    tint: 'bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-300',
    title: 'Duplicate & Fraudulent RECs',
    body: 'Manual systems can allow the same certificate to be issued, sold, or claimed more than once.',
  },
  {
    icon: Zap,
    tint: 'bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-300',
    title: 'Mismatch in Energy Data',
    body: 'The amount of RECs issued may not accurately match the actual renewable electricity generated.',
  },
  {
    icon: Eye,
    tint: 'bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-300',
    title: 'Lack of Transparency & Traceability',
    body: "Tracking a REC's complete journey — from generation to sale and retirement — can be difficult, making audits and fraud detection challenging.",
  },
]

const SOLUTIONS = [
  {
    icon: BrainCircuit,
    title: 'AI/ML Anomaly Detection',
    body: 'Detects duplicate RECs, suspicious transactions, and generation mismatches.',
  },
  {
    icon: Boxes,
    title: 'Blockchain REC Tracking',
    body: 'Provides transparent, immutable tracking from issuance to retirement.',
  },
  {
    icon: Lock,
    title: 'Secure Data Verification',
    body: 'Verifies generation claims and protects data with encryption and access control.',
  },
  {
    icon: Users,
    title: 'Multi-Stakeholder Access',
    body: 'For regulators, producers, buyers, and auditors.',
  },
]

const STATS = [
  { icon: Leaf, value: '100%', label: 'Transparency' },
  { icon: ShieldCheck, value: 'Real-time', label: 'Fraud Detection' },
  { icon: Zap, value: 'Accurate', label: 'REC Verification' },
  { icon: Users, value: 'Multiple', label: 'Stakeholders' },
]

const USE_CASES = [
  {
    kind: 'wind',
    icon: Landmark,
    title: 'Regulatory Bodies',
    body: 'Monitor, investigate and ensure compliance.',
  },
  {
    kind: 'plant',
    icon: Stamp,
    title: 'Certificate Issuing Bodies',
    body: 'Validate data, issue RECs and manage lifecycle.',
  },
  {
    kind: 'corporate',
    icon: Building2,
    title: 'Corporate Buyers',
    body: 'Purchase RECs, verify authenticity and claim usage.',
  },
  {
    kind: 'audit',
    icon: SearchCheck,
    title: 'Auditors',
    body: 'Trace records, review transactions and generate reports.',
  },
]

/* ------------------------------------------------------------------ */

export default function Home() {
  const { stats } = useStore()

  return (
    <div className="overflow-hidden">
      {/* ---------------- HERO ---------------- */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-soft/70 via-bg to-bg dark:from-brand-soft/30" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-4 lg:pb-24 lg:pt-16">
          {/* copy */}
          <div className="animate-fade-up">
            <span className="pill">Renewable Energy Intelligence</span>

            <h1 className="h-display mt-5 text-[2.6rem] leading-[1.06] sm:text-5xl lg:text-[3.4rem]">
              Secure. Transparent.
              <br />
              <span className="text-brand">Fraud-Free RECs.</span>
            </h1>

            <p className="lead mt-5 max-w-md text-base leading-relaxed">
              AI-powered blockchain system for tracking and verifying Renewable Energy Certificates
              (RECs) with complete transparency and trust.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login" className="btn-brand">
                Get Started <ArrowRight size={16} />
              </Link>
              <Link to="/about" className="btn-outline">
                Learn More
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3">
              {[
                [ShieldCheck, 'Prevent Fraud'],
                [Eye, 'Ensure Transparency'],
                [Leaf, 'Support Green Energy'],
              ].map(([I, label]) => (
                <span key={label} className="flex items-center gap-2 text-xs font-medium text-ink-2">
                  <I size={15} className="text-brand" /> {label}
                </span>
              ))}
            </div>
          </div>

          {/* art */}
          <div className="relative animate-fade-up [animation-delay:120ms] lg:-mr-6 xl:-mr-14">
            <div className="relative aspect-[7/6] w-full">
              <HeroScene />
            </div>

            {/* lifecycle card */}
            <div className="absolute right-3 top-6 w-[170px] rounded-2xl border border-white/15 bg-forest/90 p-3 shadow-2xl backdrop-blur-md sm:w-[196px] sm:p-4 lg:right-8 xl:right-20">
              <div className="mb-2 h-[3px] w-10 rounded-full bg-emerald-glow/80" />
              <div className="flex flex-col gap-2.5 sm:gap-3">
                {LIFECYCLE.map((s) => (
                  <div key={s} className="flex items-center gap-2.5">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-400 sm:h-6 sm:w-6">
                      <Check size={12} className="text-forest" strokeWidth={3.4} />
                    </span>
                    <span className="text-xs font-semibold text-white sm:text-sm">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* live signal chip */}
            <div className="absolute bottom-6 left-0 hidden items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 shadow-lg sm:flex lg:left-4">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-brand" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
              </span>
              <span className="text-[11px] font-semibold text-ink">
                {stats.alerts} fraud alerts detected live
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- WHY IT MATTERS ---------------- */}
      <section id="about" className="border-t border-line bg-bg">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:py-20">
          <p className="eyebrow">Why it matters</p>
          <h2 className="h-display mt-2.5 text-3xl sm:text-[2.1rem]">The Unseen Challenges</h2>
          <p className="lead mt-3 max-w-xl text-[15px] leading-relaxed">
            Despite the growing use of RECs, manual processes and fragmented systems create risks
            that can't be seen — but can be costly.
          </p>

          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {CHALLENGES.map((c) => (
              <div key={c.title} className="card card-hover p-6">
                <span className={'icon-badge h-11 w-11 rounded-full ' + c.tint}>
                  <c.icon size={19} />
                </span>
                <h3 className="mt-5 text-base font-bold text-ink">{c.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-2">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- OUR SOLUTION ---------------- */}
      <section id="features" className="bg-gradient-to-b from-brand-soft/60 to-bg dark:from-brand-soft/25">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-2 lg:items-center lg:py-20">
          <div>
            <p className="eyebrow">Our solution</p>
            <h2 className="h-display mt-2.5 text-3xl leading-tight sm:text-[2.1rem]">
              AI-Powered Blockchain System
              <br />
              <span className="text-brand">for REC Fraud Detection &amp; Tracking</span>
            </h2>
            <p className="lead mt-5 max-w-md text-[15px] leading-relaxed">
              We combine the power of AI, real-time data, and blockchain to ensure every Renewable
              Energy Certificate is verified, traceable and secure — from generation to retirement.
            </p>
            <Link to="/how-it-works" className="btn-brand mt-7">
              Explore How It Works <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {SOLUTIONS.map((s) => (
              <div key={s.title} className="card card-hover p-5">
                <span className="icon-badge h-10 w-10 rounded-full bg-brand-soft text-brand-ink">
                  <s.icon size={18} />
                </span>
                <h3 className="mt-4 text-[13.5px] font-bold leading-snug text-ink">{s.title}</h3>
                <p className="mt-2 text-[12.5px] leading-relaxed text-ink-2">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- STATS STRIP ---------------- */}
      <section className="bg-bg">
        <div className="mx-auto max-w-7xl px-5 pb-4">
          <div className="card grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4 lg:p-7">
            {STATS.map((s) => (
              <div key={s.label} className="flex items-center gap-3.5">
                <span className="icon-badge h-11 w-11 shrink-0 rounded-full bg-brand-soft text-brand-ink">
                  <s.icon size={19} />
                </span>
                <div>
                  <p className="text-lg font-extrabold leading-tight text-ink">{s.value}</p>
                  <p className="text-[13px] text-ink-2">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- USE CASES ---------------- */}
      <section id="use-cases" className="bg-bg">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:py-20">
          <p className="eyebrow">Key use cases</p>
          <h2 className="h-display mt-2.5 text-3xl sm:text-[2.1rem]">
            Where It Makes the Biggest Impact
          </h2>
          <p className="lead mt-3 text-[15px]">
            Built for a cleaner, safer and more trustworthy renewable energy ecosystem.
          </p>

          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map((u) => (
              <div key={u.title} className="card card-hover overflow-hidden">
                <div className="h-[112px] w-full overflow-hidden">
                  <UseCaseScene kind={u.kind} />
                </div>
                <div className="p-5">
                  <span className="icon-badge h-9 w-9 rounded-full bg-brand-soft text-brand-ink">
                    <u.icon size={16} />
                  </span>
                  <h3 className="mt-3.5 text-sm font-bold text-ink">{u.title}</h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-2">{u.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- TRUST BAND ---------------- */}
      <section className="bg-bg">
        <div className="mx-auto max-w-7xl px-5 pb-16">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              [Gauge, 'Every certificate scored 0–100', 'An explainable risk score, with the evidence behind it attached to each verdict.'],
              [BadgeCheck, 'Verified against real meter data', 'Claimed generation is reconciled against smart-meter telemetry before issuance.'],
              [Boxes, 'Written to an immutable ledger', 'Issuance, transfer and retirement are append-only — nothing can be quietly rewritten.'],
            ].map(([I, t, b]) => (
              <div key={t} className="flex gap-4">
                <span className="icon-badge h-10 w-10 shrink-0 rounded-xl bg-brand-soft text-brand-ink">
                  <I size={18} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-ink">{t}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">{b}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CTA BANNER ---------------- */}
      <section className="bg-bg">
        <div className="mx-auto max-w-7xl px-5 pb-16 lg:pb-20">
          <div className="relative overflow-hidden rounded-3xl bg-forest">
            <div className="absolute inset-y-0 right-0 w-full opacity-70 sm:w-[62%] sm:opacity-100">
              <CtaScene />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/90 to-transparent sm:via-forest/75" />

            <div className="relative flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between lg:p-12">
              <div className="max-w-xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                  Join the clean energy revolution
                </p>
                <h2 className="mt-3 text-2xl font-extrabold leading-snug text-white sm:text-[1.9rem]">
                  Build a Transparent &amp;
                  <br />
                  Fraud-Free REC Ecosystem
                </h2>
                <p className="mt-3 text-sm text-emerald-100/85">
                  Together for a greener, safer and more sustainable tomorrow.
                </p>
              </div>
              <Link to="/login" className="btn-light shrink-0">
                Get Started <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
