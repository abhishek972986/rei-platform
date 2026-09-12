import React, { useMemo } from 'react'
import { BarChart3, TrendingUp, Cpu, AlertTriangle } from 'lucide-react'
import { useStore } from '../../data/store'
import { buildFraudTrend, buildGenerationSeries, modelMetrics } from '../../data/seed'
import { FRAUD_TYPES } from '../../engine/fraudEngine'
import { Card, SectionHead, Stat, Progress, RiskBadge, Table } from '../../components/ui'
import {
  FraudTrendChart,
  RiskDistributionChart,
  FraudTypeChart,
  GenerationCompareChart,
  ProducerRiskChart,
  SourceMixChart,
  AccuracyGauge,
} from '../../components/charts'

export default function Analytics() {
  const { certificates, alerts, producers, stats } = useStore()

  const trend = useMemo(() => buildFraudTrend(certificates), [certificates])
  const genSeries = useMemo(() => buildGenerationSeries(certificates), [certificates])

  const byType = useMemo(() => {
    const counts = {}
    Object.values(FRAUD_TYPES).forEach((t) => (counts[t] = 0))
    alerts.forEach((a) => (counts[a.fraudType] = (counts[a.fraudType] || 0) + 1))
    return Object.entries(counts)
      .map(([type, count]) => ({
        type: type.replace(' Certificate', '').replace(' Data', ''),
        count,
      }))
      .sort((a, b) => b.count - a.count)
  }, [alerts])

  const producerRisk = useMemo(() => {
    return producers
      .map((p) => {
        const list = certificates.filter((c) => c.producerId === p.id)
        const avg = list.length ? Math.round(list.reduce((s, c) => s + c.score, 0) / list.length) : 0
        return {
          id: p.id,
          name: p.name,
          risk: avg,
          certificates: list.length,
          flagged: list.filter((c) => c.score >= 71).length,
          integrity: p.integrity,
          source: p.source,
        }
      })
      .sort((a, b) => b.risk - a.risk)
  }, [producers, certificates])

  const sourceMix = useMemo(() => {
    const map = {}
    certificates.forEach((c) => {
      map[c.source] = (map[c.source] || 0) + c.energyMWh
    })
    return Object.entries(map).map(([source, mwh]) => ({ source, mwh: Math.round(mwh) }))
  }, [certificates])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="panel-title">Intelligence</p>
        <h1 className="mt-1.5 flex items-center gap-2.5 text-2xl font-extrabold text-white lg:text-3xl">
          <BarChart3 className="text-cyan-electric" size={26} /> AI Analytics Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Model output across the full portfolio — trends, risk concentration and producer behaviour.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Average risk score" value={stats.avgRisk + '/100'} icon={TrendingUp} tone="cyan" />
        <Stat label="Detection accuracy" value={modelMetrics.accuracy + '%'} icon={Cpu} tone="emerald" />
        <Stat label="False positive rate" value={modelMetrics.falsePositiveRate + '%'} tone="amber" />
        <Stat
          label="Portfolio variance"
          value={stats.variancePct + '%'}
          sub="Claimed vs metered"
          icon={AlertTriangle}
          tone={stats.variancePct > 5 ? 'red' : 'emerald'}
        />
      </div>

      <Card>
        <SectionHead
          title="Fraud trend"
          subtitle="Certificates issued against those flagged by the AI engine, month by month"
        />
        <FraudTrendChart data={trend} height={300} />
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <SectionHead title="Risk distribution" subtitle="Certificates by risk band" />
          <RiskDistributionChart low={stats.low} medium={stats.medium} high={stats.high} height={250} />
        </Card>
        <Card>
          <SectionHead title="Fraud type analysis" subtitle="Alerts grouped by detector family" />
          <FraudTypeChart data={byType} height={250} />
        </Card>
      </div>

      <Card>
        <SectionHead
          title="Claimed versus verified generation"
          subtitle="Aggregate megawatt-hours per month — the gap is what the meter did not confirm"
        />
        <GenerationCompareChart data={genSeries} height={290} />
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <SectionHead title="Producer risk ranking" subtitle="Average certificate risk score by producer" />
          <ProducerRiskChart data={producerRisk.slice(0, 10)} height={330} />
        </Card>
        <div className="flex flex-col gap-4">
          <Card>
            <SectionHead title="Certified energy by source" />
            <SourceMixChart data={sourceMix} height={210} />
          </Card>
          <Card>
            <SectionHead title="Model metrics" subtitle={modelMetrics.modelVersion} />
            <AccuracyGauge value={modelMetrics.recall} label="Recall" height={150} />
            <div className="mt-4 flex flex-col gap-3">
              <Progress label="Precision" value={modelMetrics.precision} tone="cyan" />
              <Progress label="F1 score" value={modelMetrics.f1} tone="emerald" />
              <Progress label="Accuracy" value={modelMetrics.accuracy} tone="violet" />
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <SectionHead
          title="Producer risk table"
          subtitle="Ranked by average risk across all certificates on file"
        />
        <Table
          rows={producerRisk}
          columns={[
            {
              key: 'name',
              label: 'Producer',
              render: (r) => (
                <div>
                  <p className="text-slate-200">{r.name}</p>
                  <p className="font-mono text-[10px] text-slate-500">{r.id} · {r.source}</p>
                </div>
              ),
            },
            { key: 'certificates', label: 'Certificates', render: (r) => <span className="font-mono text-slate-300">{r.certificates}</span> },
            {
              key: 'flagged',
              label: 'High risk',
              render: (r) => (
                <span className={'font-mono ' + (r.flagged ? 'text-red-300' : 'text-slate-400')}>
                  {r.flagged}
                </span>
              ),
            },
            {
              key: 'integrity',
              label: 'Integrity score',
              render: (r) => (
                <div className="w-32">
                  <Progress value={r.integrity} tone={r.integrity >= 85 ? 'emerald' : r.integrity >= 65 ? 'amber' : 'red'} />
                </div>
              ),
            },
            { key: 'risk', label: 'Avg risk', align: 'right', render: (r) => <RiskBadge score={r.risk} /> },
          ]}
        />
      </Card>

      <Card>
        <SectionHead title="Model ensemble" subtitle={'Last trained ' + new Date(modelMetrics.lastTrained).toDateString()} />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {modelMetrics.ensemble.map((m) => (
            <div key={m.name} className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-sm font-bold text-white">{m.name}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{m.task}</p>
              <div className="mt-3">
                <Progress label="Accuracy" value={m.accuracy} tone="cyan" />
              </div>
              <p className="mt-2 text-[10px] uppercase tracking-wider text-slate-500">
                Ensemble weight {m.weight}%
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
