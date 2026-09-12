import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
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
import { Brand } from './PublicShell'

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
      <div className="relative hidden overflow-hidden border-r border-line bg-surface-2 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 grid-noise opacity-40" />
        <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-brand-soft blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-10 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />

        <Link to="/" className="relative flex items-center gap-3">
          <Brand />
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-extrabold leading-tight text-ink">
            Trust every megawatt.
            <br />
            <span className="text-brand">Verify every certificate.</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-2">
            Sign in to the intelligence platform. Your role determines the modules you can reach, the
            actions you can take and the records you can see.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {[
              [ShieldCheck, 'Role-scoped access control'],
              [Lock, 'AES-256 encrypted session data'],
              [Fingerprint, 'Every action written to the audit ledger'],
            ].map(([I, t]) => (
              <div key={t} className="flex items-center gap-3 text-sm text-ink-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-surface-2 text-brand">
                  <I size={15} />
                </span>
                {t}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-ink-3">
          Demonstration environment · synthetic data · no live registry is contacted
        </p>
      </div>

      {/* right — form */}
      <div className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <Brand />
          </Link>

          <div className="mb-6 flex gap-1 rounded-xl border border-line bg-surface-2 p-1">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={
                  'flex-1 rounded-lg px-3 py-2 text-sm font-semibold capitalize transition ' +
                  (mode === m ? 'bg-surface text-ink shadow-sm' : 'text-ink-2 hover:text-ink')
                }
              >
                {m === 'login' ? 'Sign in' : 'Register'}
              </button>
            ))}
          </div>

          <h1 className="text-2xl font-bold text-ink">
            {mode === 'login' ? 'Access your dashboard' : 'Create a platform account'}
          </h1>
          <p className="mt-1.5 text-sm text-ink-2">
            {mode === 'login'
              ? 'Select your role to enter the matching workspace.'
              : 'Registration is reviewed by the regulator before activation.'}
          </p>

          <form onSubmit={submit} className="mt-7 flex flex-col gap-4">
            <div>
              <p className="label mb-2">Role-based login</p>
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
                          ? 'border-brand/50 bg-brand-soft shadow-[0_8px_20px_-10px_rgb(var(--c-brand)/0.7)]'
                          : 'border-line bg-surface-2 hover:border-brand/30')
                      }
                    >
                      <r.icon
                        size={17}
                        style={{ color: active ? ROLE_INFO[r.role].color : '#94a3b8' }}
                      />
                      <span
                        className={
                          'text-[11px] font-semibold leading-tight ' +
                          (active ? 'text-ink' : 'text-ink-2')
                        }
                      >
                        {r.role}
                      </span>
                    </button>
                  )
                })}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink-3">
                {ROLE_INFO[role].blurb}
              </p>
            </div>

            {mode === 'register' && (
              <label className="block">
                <span className="label">Organisation</span>
                <input className="field mt-1.5" defaultValue={ROLE_INFO[role].org} />
              </label>
            )}

            <label className="block">
              <span className="label">Email address</span>
              <input
                type="email"
                className="field mt-1.5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@organisation.org"
              />
            </label>

            <label className="block">
              <span className="label">Password</span>
              <input
                type="password"
                className="field mt-1.5"
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

            <button className="btn-brand h-12" disabled={busy}>
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

            <p className="text-center text-xs text-ink-3">
              Demo credentials are pre-filled. Any password of 4+ characters works.
            </p>
          </form>

          <p className="mt-8 text-center text-xs text-ink-3">
            <Link to="/" className="hover:text-brand">
              ← Back to the public site
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
