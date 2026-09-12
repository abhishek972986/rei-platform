import React, { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Zap, Menu, X, ArrowRight, Github, Linkedin, Mail } from 'lucide-react'

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About REC' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/technology', label: 'Technology' },
  { to: '/verify', label: 'Verify' },
]

export default function PublicShell() {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-navy-950/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-3.5">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald to-cyan-electric shadow-glow-emerald">
              <Zap size={18} className="text-navy-950" strokeWidth={2.6} />
            </div>
            <div className="leading-none">
              <p className="text-[12px] font-extrabold tracking-tight text-white">RENEWABLE ENERGY</p>
              <p className="text-[12px] font-extrabold tracking-[0.22em] text-gradient">INTELLIGENCE</p>
            </div>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  'rounded-lg px-3.5 py-2 text-sm font-medium transition ' +
                  (isActive ? 'bg-white/8 text-white' : 'text-slate-400 hover:text-white')
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link to="/login" className="btn-primary hidden sm:inline-flex">
              Access Dashboard <ArrowRight size={15} />
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-200 md:hidden"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {open && (
          <div className="border-t border-white/8 bg-navy-900/95 px-5 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    'rounded-lg px-3 py-2.5 text-sm font-medium ' +
                    (isActive ? 'bg-white/8 text-white' : 'text-slate-300')
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <Link to="/login" onClick={() => setOpen(false)} className="btn-primary mt-2">
                Access Dashboard
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-white/8 bg-navy-900/50">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald to-cyan-electric">
                <Zap size={18} className="text-navy-950" strokeWidth={2.6} />
              </div>
              <p className="text-sm font-extrabold tracking-[0.18em] text-white">
                REI<span className="text-gradient"> PLATFORM</span>
              </p>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
              Renewable Energy Intelligence secures the Renewable Energy Certificate ecosystem with
              AI-driven fraud detection, immutable blockchain traceability and encrypted generation
              telemetry.
            </p>
            <div className="mt-5 flex gap-2">
              {[Github, Linkedin, Mail].map((I, i) => (
                <span
                  key={i}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-400"
                >
                  <I size={15} />
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="panel-title">Platform</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-400">
              {LINKS.map((l) => (
                <Link key={l.to} to={l.to} className="hover:text-cyan-electric">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="panel-title">Compliance</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-400">
              <span>ISO 14064 aligned</span>
              <span>I-REC / GO compatible</span>
              <span>AES-256 encryption at rest</span>
              <span>Hyperledger Fabric ledger</span>
            </div>
          </div>
        </div>
        <div className="border-t border-white/8 px-5 py-5 text-center text-xs text-slate-600">
          © 2026 Renewable Energy Intelligence · Demonstration environment · All data shown is
          synthetic
        </div>
      </footer>
    </div>
  )
}
