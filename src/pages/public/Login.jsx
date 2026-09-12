import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Zap,
  ShieldCheck,
  Landmark,
  Stamp,
  Factory,
  Building2,
  SearchCheck,
  Loader2,
  ArrowRight,
  Lock,
  Fingerprint,
} from 'lucide-react'
import { useStore } from '../../data/store'
import { ROLES, ROLE_INFO } from '../../data/seed'

const ROLE_CARDS = [
  { role: ROLES.REGULATOR, icon: Landmark },
  { role: ROLES.ISSUER, icon: Stamp },
  { role: ROLES.PRODUCER, icon: Factory },
  { role: ROLES.BUYER, icon: Building2 },
  { role: ROLES.AUDITOR, icon: SearchCheck },
]

export default function Login() {
  const { login } = useStore()
  const nav = useNavigate()
  const [role, setRole] = useState(ROLES.REGULATOR)
  const [email, setEmail] = useState(ROLE_INFO[ROLES.REGULATOR].email)
  const [password, setPassword] = useState('demo1234')
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')

  const pickRole = (r) => {
    setRole(r)
    setEmail(ROLE_INFO[r].email)
    setError('')
  }

  const submit = (e) => {
    e.preventDefault()
    if (!email.trim() || password.length < 4) {
      setError('Enter an email address and a password of at least 4 characters.')
      return
    }
    setError('')
    setBusy(true)
    setTimeout(() => {
      login(role, email.trim())
      nav('/app')
    }, 850)
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* left — brand panel */}
      <div className="relative hidden overflow-hidden border-r border-white/8 bg-navy-900/50 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 grid-noise opacity-40" />
        <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-emerald/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-10 h-72 w-72 rounded-full bg-cyan-electric/12 blur-3xl" />

        <Link to="/" className="relative flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald to-cyan-electric shadow-glow-emerald">
            <Zap size={20} className="text-navy-950" strokeWidth={2.6} />
          </div>
          <div className="leading-none">
            <p className="text-[13px] font-extrabold tracking-tight text-white">RENEWABLE ENERGY</p>
            <p className="text-[13px] font-extrabold tracking-[0.22em] text-gradient">INTELLIGENCE</p>
          </div>
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-extrabold leading-tight text-white">
            Trust every megawatt.
            <br />
            <span className="text-gradient">Verify every certificate.</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Sign in to the intelligence platform. Your role determines the modules you can reach, the
            actions you can take and the records you can see.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {[
              [ShieldCheck, 'Role-scoped access control'],
              [Lock, 'AES-256 encrypted session data'],
              [Fingerprint, 'Every action written to the audit ledger'],
            ].map(([I, t]) => (
              <div key={t} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-emerald-400">
                  <I size={15} />
                </span>
                {t}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-600">
          Demonstration environment · synthetic data · no live registry is contacted
        </p>
      </div>

      {/* right — form */}
      <div className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald to-cyan-electric">
              <Zap size={18} className="text-navy-950" strokeWidth={2.6} />
            </div>
            <p className="text-sm font-extrabold tracking-[0.18em] text-white">REI PLATFORM</p>
          </Link>

          <div className="mb-6 flex gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={
                  'flex-1 rounded-lg px-3 py-2 text-sm font-semibold capitalize transition ' +
                  (mode === m ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200')
                }
              >
                {m === 'login' ? 'Sign in' : 'Register'}
              </button>
            ))}
          </div>

          <h1 className="text-2xl font-bold text-white">
            {mode === 'login' ? 'Access your dashboard' : 'Create a platform account'}
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            {mode === 'login'
              ? 'Select your role to enter the matching workspace.'
              : 'Registration is reviewed by the regulator before activation.'}
          </p>

          <form onSubmit={submit} className="mt-7 flex flex-col gap-4">
            <div>
              <p className="panel-title mb-2">Role-based login</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ROLE_CARDS.map((r) => {
                  const active = role === r.role
                  return (
                    <button
                      type="button"
                      key={r.role}
                      onClick={() => pickRole(r.role)}
                      className={
                        'flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition ' +
                        (active
                          ? 'border-cyan-electric/50 bg-cyan-electric/10 shadow-glow'
                          : 'border-white/10 bg-white/[0.03] hover:border-white/20')
                      }
                    >
                      <r.icon
                        size={17}
                        style={{ color: active ? ROLE_INFO[r.role].color : '#94a3b8' }}
                      />
                      <span
                        className={
                          'text-[11px] font-semibold leading-tight ' +
                          (active ? 'text-white' : 'text-slate-400')
                        }
                      >
                        {r.role}
                      </span>
                    </button>
                  )
                })}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                {ROLE_INFO[role].blurb}
              </p>
            </div>

            {mode === 'register' && (
              <label className="block">
                <span className="panel-title">Organisation</span>
                <input className="input mt-1.5" defaultValue={ROLE_INFO[role].org} />
              </label>
            )}

            <label className="block">
              <span className="panel-title">Email address</span>
              <input
                type="email"
                className="input mt-1.5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@organisation.org"
              />
            </label>

            <label className="block">
              <span className="panel-title">Password</span>
              <input
                type="password"
                className="input mt-1.5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>

            {error ? (
              <p className="rounded-lg border border-red-400/25 bg-red-400/10 px-3 py-2 text-xs text-red-300">
                {error}
              </p>
            ) : null}

            <button className="btn-primary h-12" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Authenticating…
                </>
              ) : (
                <>
                  {mode === 'login' ? 'Sign in as ' + role : 'Create account'}{' '}
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-500">
              Demo credentials are pre-filled. Any password of 4+ characters works.
            </p>
          </form>

          <p className="mt-8 text-center text-xs text-slate-500">
            <Link to="/" className="hover:text-cyan-electric">
              ← Back to the public site
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
