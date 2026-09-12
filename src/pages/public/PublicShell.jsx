import React, { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Leaf, Menu, X, ArrowRight, Linkedin, Twitter, Youtube, Mail, MapPin } from 'lucide-react'
import { ThemeToggle } from '../../components/theme'

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/technology', label: 'Features' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/#use-cases', label: 'Use Cases', hash: true },
  { to: '/#contact', label: 'Contact', hash: true },
]

export function Brand({ size = 'md' }) {
  const dim = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'
  return (
    <span className="flex items-center gap-2.5">
      <span className={'icon-badge shrink-0 rounded-xl bg-brand-soft text-brand ' + dim}>
        <Leaf size={size === 'sm' ? 16 : 18} strokeWidth={2.4} />
      </span>
      <span className="text-[17px] font-extrabold tracking-tight text-ink">
        REC<span className="text-brand">Guard</span>
      </span>
    </span>
  )
}

function HashLink({ to, label, onClick }) {
  const { pathname } = useLocation()
  const [path, hash] = to.split('#')
  const go = (e) => {
    onClick && onClick()
    if (pathname === (path || '/')) {
      e.preventDefault()
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
    }
  }
  return (
    <Link to={to} onClick={go} className="nav-link">
      {label}
    </Link>
  )
}

export default function PublicShell() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-3.5">
          <Link to="/" aria-label="RECGuard home">
            <Brand />
          </Link>

          <nav className="ml-auto hidden items-center gap-0.5 lg:flex">
            {LINKS.map((l) =>
              l.hash ? (
                <HashLink key={l.label} to={l.to} label={l.label} />
              ) : (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    'nav-link ' + (isActive ? 'nav-link-active' : '')
                  }
                >
                  {({ isActive }) => (
                    <>
                      {l.label}
                      {isActive && (
                        <span className="absolute inset-x-3 -bottom-[3px] h-[2px] rounded-full bg-brand" />
                      )}
                    </>
                  )}
                </NavLink>
              )
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-3">
            <Link to="/login" className="btn-brand hidden !px-5 !py-2.5 sm:inline-flex">
              Get Started
            </Link>
            <ThemeToggle />
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle navigation"
              className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-2 lg:hidden"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-line bg-surface px-5 py-3 lg:hidden">
            <div className="flex flex-col gap-1">
              {LINKS.map((l) =>
                l.hash ? (
                  <HashLink key={l.label} to={l.to} label={l.label} onClick={() => setOpen(false)} />
                ) : (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      'nav-link ' + (isActive ? 'nav-link-active' : '')
                    }
                  >
                    {l.label}
                  </NavLink>
                )
              )}
              <Link to="/login" onClick={() => setOpen(false)} className="btn-brand mt-2">
                Get Started <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer id="contact" className="border-t border-line bg-surface-2">
        <div className="mx-auto max-w-7xl px-5 py-10">
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <Brand />
              <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-ink-2">
                AI-powered fraud detection and blockchain traceability for Renewable Energy
                Certificates — securing every megawatt from generation to retirement.
              </p>
              <div className="mt-4 flex flex-col gap-1.5 text-[13px] text-ink-2">
                <span className="flex items-center gap-2">
                  <Mail size={14} className="text-brand" /> contact@recguard.io
                </span>
                <span className="flex items-center gap-2">
                  <MapPin size={14} className="text-brand" /> Renewable Energy Registry, India
                </span>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink">Platform</p>
              <div className="mt-3.5 flex flex-col gap-2 text-[13px] text-ink-2">
                <Link to="/" className="hover:text-brand-ink">Home</Link>
                <Link to="/about" className="hover:text-brand-ink">About</Link>
                <Link to="/technology" className="hover:text-brand-ink">Features</Link>
                <Link to="/how-it-works" className="hover:text-brand-ink">How It Works</Link>
                <Link to="/verify" className="hover:text-brand-ink">Verify a Certificate</Link>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink">Compliance</p>
              <div className="mt-3.5 flex flex-col gap-2 text-[13px] text-ink-2">
                <span>ISO 14064 aligned</span>
                <span>I-REC / GO compatible</span>
                <span>AES-256 encryption at rest</span>
                <span>Hyperledger Fabric ledger</span>
              </div>
            </div>
          </div>

          <div className="mt-9 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
            <p className="text-xs text-ink-3">
              © 2026 RECGuard · Renewable Energy Intelligence · Demonstration environment with
              synthetic data
            </p>
            <div className="flex gap-2">
              {[Linkedin, Twitter, Youtube].map((I, i) => (
                <span
                  key={i}
                  className="icon-badge h-8 w-8 rounded-lg border border-line bg-surface text-ink-2 transition hover:text-brand-ink"
                >
                  <I size={14} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
