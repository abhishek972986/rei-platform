import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  BarChart3,
  Siren,
  ScrollText,
  Zap,
  Link2,
  SearchCheck,
  Factory,
  FileBarChart,
  Settings,
  Menu,
  X,
  Bell,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Globe,
} from 'lucide-react'
import { useStore } from '../data/store'
import { ROLES } from '../data/seed'
import { Toasts } from './ui'

const NAV = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true, roles: 'all' },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3, roles: [ROLES.REGULATOR, ROLES.ISSUER, ROLES.AUDITOR] },
  {
    to: '/app/fraud',
    label: 'Fraud Intelligence',
    icon: Siren,
    roles: [ROLES.REGULATOR, ROLES.ISSUER, ROLES.AUDITOR],
    badge: 'alerts',
  },
  { to: '/app/certificates', label: 'REC Certificates', icon: ScrollText, roles: 'all' },
  {
    to: '/app/generation',
    label: 'Generation Data',
    icon: Zap,
    roles: [ROLES.REGULATOR, ROLES.ISSUER, ROLES.PRODUCER, ROLES.AUDITOR],
  },
  { to: '/app/traceability', label: 'Blockchain Traceability', icon: Link2, roles: 'all' },
  {
    to: '/app/investigations',
    label: 'Investigations',
    icon: SearchCheck,
    roles: [ROLES.REGULATOR, ROLES.ISSUER, ROLES.AUDITOR],
  },
  {
    to: '/app/producers',
    label: 'Producers',
    icon: Factory,
    roles: [ROLES.REGULATOR, ROLES.ISSUER, ROLES.AUDITOR],
  },
  { to: '/app/reports', label: 'Reports', icon: FileBarChart, roles: 'all' },
  { to: '/app/settings', label: 'Settings', icon: Settings, roles: 'all' },
]

function Brand({ compact }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald to-cyan-electric shadow-glow-emerald">
        <Zap size={18} className="text-navy-950" strokeWidth={2.6} />
      </div>
      {!compact && (
        <div className="leading-none">
          <p className="text-[13px] font-extrabold tracking-tight text-white">
            RENEWABLE ENERGY
          </p>
          <p className="text-[13px] font-extrabold tracking-[0.22em] text-gradient">
            INTELLIGENCE
          </p>
        </div>
      )}
    </div>
  )
}

function NavItems({ onNavigate }) {
  const { user, alerts } = useStore()
  const items = NAV.filter((n) => n.roles === 'all' || n.roles.includes(user?.role))
  return (
    <nav className="flex flex-col gap-1">
      {items.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          end={n.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ' +
            (isActive
              ? 'bg-gradient-to-r from-cyan-electric/15 to-transparent text-white'
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-100')
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-cyan-electric shadow-glow" />
              )}
              <n.icon size={17} className={isActive ? 'text-cyan-electric' : ''} />
              <span className="flex-1 truncate">{n.label}</span>
              {n.badge === 'alerts' && alerts.length > 0 && (
                <span className="rounded-full bg-red-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-red-300">
                  {alerts.length}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function Crumbs() {
  const { pathname } = useLocation()
  const parts = pathname.split('/').filter(Boolean).slice(1)
  const label = parts.length ? parts.map((p) => p.replace(/-/g, ' ')) : ['dashboard']
  return (
    <div className="hidden items-center gap-1.5 text-xs text-slate-500 md:flex">
      <span>REI</span>
      {label.map((l, i) => (
        <React.Fragment key={i}>
          <ChevronRight size={12} />
          <span className={i === label.length - 1 ? 'capitalize text-slate-300' : 'capitalize'}>{l}</span>
        </React.Fragment>
      ))}
    </div>
  )
}

export default function Layout() {
  const { user, logout, alerts, toasts } = useStore()
  const [open, setOpen] = useState(false)
  const [bell, setBell] = useState(false)
  const nav = useNavigate()

  const signOut = () => {
    logout()
    nav('/')
  }

  return (
    <div className="dark app-shell flex min-h-screen">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-white/8 bg-navy-900/80 backdrop-blur-xl lg:flex">
        <div className="px-5 py-5">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <p className="mb-2 px-3 panel-title">Platform</p>
          <NavItems />
        </div>
        <div className="border-t border-white/8 p-3">
          <div className="glass flex items-center gap-3 p-3">
            <div
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-xs font-bold text-navy-950"
              style={{ background: user?.color || '#22d3ee' }}
            >
              {user?.role?.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{user?.role}</p>
              <p className="truncate text-[11px] text-slate-400">{user?.org}</p>
            </div>
            <button
              onClick={signOut}
              title="Sign out"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-red-300"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar — mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[272px] flex-col border-r border-white/10 bg-navy-900 animate-fade-up">
            <div className="flex items-center justify-between px-5 py-5">
              <Brand />
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3">
              <NavItems onNavigate={() => setOpen(false)} />
            </div>
            <div className="border-t border-white/8 p-3">
              <button onClick={signOut} className="btn-ghost w-full">
                <LogOut size={15} /> Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-[264px]">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/8 bg-navy-950/80 px-4 py-3 backdrop-blur-xl lg:px-7">
          <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-300 hover:bg-white/10 lg:hidden">
            <Menu size={18} />
          </button>
          <div className="lg:hidden">
            <Brand compact />
          </div>
          <Crumbs />
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-full border border-emerald/25 bg-emerald/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-300 md:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-400" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Ledger synced
            </span>
            <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-slate-300 xl:flex">
              <Globe size={12} className="text-cyan-electric" /> rei-energy-channel
            </span>
            <div className="relative">
              <button
                onClick={() => setBell((b) => !b)}
                className="relative rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
              >
                <Bell size={16} />
                {alerts.length > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 font-mono text-[9px] font-bold text-white">
                    {alerts.length}
                  </span>
                )}
              </button>
              {bell && (
                <div className="glass absolute right-0 top-11 z-50 w-[320px] p-3 animate-fade-up">
                  <p className="mb-2 panel-title">Live fraud alerts</p>
                  <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto">
                    {alerts.slice(0, 6).map((a) => (
                      <NavLink
                        key={a.id}
                        to={'/app/investigations/' + a.certificateId}
                        onClick={() => setBell(false)}
                        className="rounded-lg border border-white/8 bg-white/[0.03] p-2.5 hover:border-cyan-electric/30"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs text-cyan-300">{a.certificateId}</span>
                          <span className="font-mono text-xs font-bold text-red-300">{a.score}</span>
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-slate-400">{a.fraudType}</p>
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 py-1.5 pl-2.5 pr-3 sm:flex">
              <ShieldCheck size={15} style={{ color: user?.color }} />
              <div className="leading-tight">
                <p className="text-[11px] font-semibold text-white">{user?.name}</p>
                <p className="text-[10px] text-slate-400">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 lg:px-7 lg:py-8">
          <Outlet />
        </main>

        <footer className="border-t border-white/8 px-4 py-4 text-center text-[11px] text-slate-600 lg:px-7">
          Renewable Energy Intelligence · AI fraud detection & blockchain traceability · Demonstration
          environment with synthetic data
        </footer>
      </div>

      <Toasts toasts={toasts} />
    </div>
  )
}
