import React, { useState } from 'react'
import { Settings as SettingsIcon, ShieldCheck, Bell, Sliders, KeyRound, Cpu } from 'lucide-react'
import { useStore } from '../../data/store'
import { ROLES, modelMetrics, networkStats } from '../../data/seed'
import { Card, SectionHead, Field, Select, Progress, Hash, fmtDateTime } from '../../components/ui'

function Toggle({ label, hint, defaultOn = true }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <button
      onClick={() => setOn((v) => !v)}
      className="flex w-full items-start justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.03] p-4 text-left transition hover:border-white/15"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">{label}</p>
        {hint ? <p className="mt-1 text-xs leading-relaxed text-slate-400">{hint}</p> : null}
      </div>
      <span
        className={
          'mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ' +
          (on ? 'bg-emerald/70' : 'bg-white/12')
        }
      >
        <span
          className={
            'h-5 w-5 rounded-full bg-white shadow transition-transform ' +
            (on ? 'translate-x-5' : 'translate-x-0')
          }
        />
      </span>
    </button>
  )
}

export default function SettingsPage() {
  const { user, toast } = useStore()
  const [threshold, setThreshold] = useState(71)
  const [tolerance, setTolerance] = useState(2)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="panel-title">Configuration</p>
        <h1 className="mt-1.5 flex items-center gap-2.5 text-2xl font-extrabold text-white lg:text-3xl">
          <SettingsIcon className="text-slate-300" size={26} /> Settings
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Account, detection thresholds, notifications and network configuration.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionHead title="Account" icon={ShieldCheck} />
          <div className="flex flex-col gap-4">
            <Field label="Organisation">
              <input className="input" defaultValue={user?.org} readOnly />
            </Field>
            <Field label="Email address">
              <input className="input" defaultValue={user?.email} />
            </Field>
            <Field label="Role" hint="Role changes are approved by the regulator.">
              <Select value={user?.role || ROLES.REGULATOR} onChange={() => {}} options={Object.values(ROLES)} />
            </Field>
            <button className="btn-primary" onClick={() => toast('Account settings saved.')}>
              Save changes
            </button>
          </div>
        </Card>

        <Card>
          <SectionHead title="Detection thresholds" icon={Sliders} />
          <div className="flex flex-col gap-5">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="panel-title">High-risk threshold</span>
                <span className="font-mono text-sm font-bold text-white">{threshold}</span>
              </div>
              <input
                type="range"
                min="40"
                max="95"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-emerald-400"
              />
              <p className="mt-1.5 text-xs text-slate-400">
                Certificates scoring at or above {threshold} are held and routed to investigation.
              </p>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="panel-title">Meter variance tolerance</span>
                <span className="font-mono text-sm font-bold text-white">{tolerance}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-full accent-emerald-400"
              />
              <p className="mt-1.5 text-xs text-slate-400">
                Claims exceeding metered output by more than {tolerance}% trip the mismatch detector.
              </p>
            </div>
            <button className="btn-primary" onClick={() => toast('Detection thresholds updated.')}>
              Apply thresholds
            </button>
          </div>
        </Card>

        <Card>
          <SectionHead title="Notifications" icon={Bell} />
          <div className="flex flex-col gap-3">
            <Toggle label="Critical fraud alerts" hint="Immediate notification when a certificate scores 85 or above." />
            <Toggle label="Duplicate detection" hint="Alert when a generation record is claimed more than once." />
            <Toggle label="Ownership transfer anomalies" hint="Alert on rapid or circular transfer chains." defaultOn={false} />
            <Toggle label="Weekly digest" hint="Summary of alerts, decisions and retirements every Monday." />
          </div>
        </Card>

        <Card>
          <SectionHead title="Security" icon={KeyRound} />
          <div className="flex flex-col gap-3">
            <Toggle label="Two-factor authentication" hint="Required for regulator and issuing authority accounts." />
            <Toggle label="Session audit logging" hint="Every action written to the immutable audit ledger." />
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
              <p className="panel-title">API key</p>
              <p className="mt-1.5">
                <Hash value="0x7f3a9c1e42b8d05647af9e2c1b8d3f5a90e47c26" chars={14} />
              </p>
              <button className="btn-ghost mt-3 !py-2 text-xs" onClick={() => toast('A new API key has been issued.')}>
                Rotate key
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <SectionHead title="AI model" icon={Cpu} subtitle={modelMetrics.modelVersion} />
          <div className="flex flex-col gap-3">
            <Progress label="Accuracy" value={modelMetrics.accuracy} tone="emerald" />
            <Progress label="Precision" value={modelMetrics.precision} tone="cyan" />
            <Progress label="Recall" value={modelMetrics.recall} tone="violet" />
            <div className="mt-1 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
                <p className="panel-title">Last trained</p>
                <p className="mt-1 text-xs text-slate-200">{fmtDateTime(modelMetrics.lastTrained)}</p>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
                <p className="panel-title">Training samples</p>
                <p className="mt-1 font-mono text-xs text-slate-200">
                  {modelMetrics.samplesTrained.toLocaleString()}
                </p>
              </div>
            </div>
            <button className="btn-ghost" onClick={() => toast('Retraining job queued on the ML cluster.')}>
              Queue retraining job
            </button>
          </div>
        </Card>

        <Card>
          <SectionHead title="Blockchain network" />
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Channel', networkStats.chain.split(' · ')[1] || networkStats.chain],
              ['Consensus', networkStats.consensus],
              ['Peers', networkStats.peers],
              ['Block height', networkStats.blockHeight.toLocaleString()],
              ['Avg block time', networkStats.avgBlockTime],
              ['Contracts', networkStats.contractsDeployed],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
                <p className="panel-title">{k}</p>
                <p className="mt-1 font-mono text-xs font-semibold text-white">{v}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            This is a demonstration environment. No transaction is broadcast to a live network and
            all certificate data is synthetic.
          </p>
        </Card>
      </div>
    </div>
  )
}
