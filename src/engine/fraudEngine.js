/**
 * REI Fraud Detection Engine
 * ---------------------------------------------------------------
 * Deterministic, explainable risk model. Each detector returns a
 * weighted contribution plus human-readable evidence, so every score
 * shown in the UI traces back to the rules that produced it.
 *
 * Mirrors a production stack of:
 *   Isolation Forest (volume / frequency anomaly) -> patternDetector
 *   Statistical deviation (meter reconciliation)  -> mismatchDetector
 *   Graph analysis (ownership chains)             -> transferDetector
 *   Exact + fuzzy matching (generation ids)       -> duplicateDetector
 */

export const FRAUD_TYPES = {
  DUPLICATE: 'Duplicate Certificate',
  MISMATCH: 'Generation Data Mismatch',
  PATTERN: 'Unusual Issuance Pattern',
  TRANSFER: 'Suspicious Ownership Transfer',
}

export const FRAUD_CODES = {
  [FRAUD_TYPES.DUPLICATE]: 'DUP',
  [FRAUD_TYPES.MISMATCH]: 'MIS',
  [FRAUD_TYPES.PATTERN]: 'PAT',
  [FRAUD_TYPES.TRANSFER]: 'TRF',
}

export function riskLevel(score) {
  if (score >= 71) return 'HIGH'
  if (score >= 31) return 'MEDIUM'
  return 'LOW'
}

export function riskTone(score) {
  const lvl = riskLevel(score)
  return lvl === 'HIGH' ? 'red' : lvl === 'MEDIUM' ? 'amber' : 'emerald'
}

const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n))
const DAY = 86400000

/* ---------------------------------------------------------------- */
/* Detectors                                                         */
/* ---------------------------------------------------------------- */

function duplicateDetector(cert, ctx) {
  const twins = ctx.byGenerationId[cert.generationId] || []
  const others = twins.filter((c) => c.id !== cert.id)
  if (!others.length) return null
  const weight = others.length > 1 ? 40 : 34
  return {
    type: FRAUD_TYPES.DUPLICATE,
    weight,
    label: 'Duplicate generation record detected',
    detail:
      'Generation record ' +
      cert.generationId +
      ' is claimed by ' +
      twins.length +
      ' certificates (' +
      twins.map((c) => c.id).join(', ') +
      '). Renewable output can only be certified once.',
    evidence: others.map((c) => c.id),
  }
}

function mismatchDetector(cert) {
  const claimed = cert.claimedKWh
  const metered = cert.meteredKWh
  if (!claimed || !metered) return null
  const diff = claimed - metered
  const pct = (diff / claimed) * 100
  if (pct <= 2) return null
  // 2% tolerance band, scaling to full weight at a 35% over-claim
  const weight = clamp(((pct - 2) / 33) * 32, 3, 32)
  return {
    type: FRAUD_TYPES.MISMATCH,
    weight,
    label: 'Claimed generation exceeds metered output by ' + pct.toFixed(1) + '%',
    detail:
      'Claimed ' +
      claimed.toLocaleString() +
      ' kWh against ' +
      metered.toLocaleString() +
      ' kWh of smart-meter telemetry — an unexplained surplus of ' +
      diff.toLocaleString() +
      ' kWh.',
    evidence: [diff.toLocaleString() + ' kWh unaccounted for'],
  }
}

function patternDetector(cert, ctx) {
  const siblings = ctx.byProducer[cert.producerId] || []
  const window = siblings.filter(
    (c) => Math.abs(new Date(c.issuanceDate) - new Date(cert.issuanceDate)) < 2 * DAY
  )
  const baseline = ctx.producerBaseline[cert.producerId] || 1.2
  const ratio = window.length / Math.max(baseline, 0.8)
  if (ratio < 3 && window.length < 4) return null
  const weight = clamp((ratio - 2) * 7, 4, 24)
  return {
    type: FRAUD_TYPES.PATTERN,
    weight,
    label: 'Issuance burst — ' + window.length + ' certificates in a 48h window',
    detail:
      'Producer baseline is ~' +
      baseline.toFixed(1) +
      ' certificates per 48h. This window runs ' +
      ratio.toFixed(1) +
      'x above the learned norm, consistent with batch-fabricated claims.',
    evidence: window.slice(0, 6).map((c) => c.id),
  }
}

function transferDetector(cert) {
  const t = cert.transfers || []
  if (t.length < 2) return null
  const spans = []
  for (let i = 1; i < t.length; i++) {
    spans.push((new Date(t[i].date) - new Date(t[i - 1].date)) / DAY)
  }
  const rapid = spans.filter((d) => d < 2).length
  const owners = new Set(t.map((x) => x.to))
  const looped = owners.size < t.length
  if (rapid < 2 && !looped) return null
  const weight = clamp(rapid * 8 + (looped ? 10 : 0), 6, 28)
  return {
    type: FRAUD_TYPES.TRANSFER,
    weight,
    label: t.length + '-hop ownership chain with ' + rapid + ' same-day transfers',
    detail: looped
      ? 'Ownership returns to an earlier holder — a circular chain typical of wash trading used to inflate apparent demand.'
      : 'Certificate changed hands faster than settlement cycles allow, obscuring the beneficial owner.',
    evidence: t.map((x) => x.from + ' -> ' + x.to),
  }
}

function producerHistoryDetector(cert, ctx) {
  const rep = ctx.producerReputation[cert.producerId]
  if (!rep || !rep.priorIncidents) return null
  const weight = clamp(rep.priorIncidents * 3.5, 3, 14)
  return {
    type: 'Producer History',
    weight,
    label: 'Producer has ' + rep.priorIncidents + ' prior confirmed incident(s)',
    detail:
      rep.name +
      ' carries a historical integrity score of ' +
      rep.integrity +
      '/100 across ' +
      rep.total +
      ' certificates on file.',
    evidence: ['Integrity ' + rep.integrity + '/100'],
  }
}

/* ---------------------------------------------------------------- */
/* Scoring                                                           */
/* ---------------------------------------------------------------- */

export function buildContext(certificates, producers) {
  const byGenerationId = {}
  const byProducer = {}
  for (const c of certificates) {
    if (!byGenerationId[c.generationId]) byGenerationId[c.generationId] = []
    byGenerationId[c.generationId].push(c)
    if (!byProducer[c.producerId]) byProducer[c.producerId] = []
    byProducer[c.producerId].push(c)
  }
  const producerBaseline = {}
  const producerReputation = {}
  for (const p of producers) {
    const list = byProducer[p.id] || []
    producerBaseline[p.id] = Math.max(1, list.length / 26)
    producerReputation[p.id] = {
      name: p.name,
      priorIncidents: p.priorIncidents,
      integrity: p.integrity,
      total: list.length,
    }
  }
  return { byGenerationId, byProducer, producerBaseline, producerReputation }
}

/** Score a single certificate -> { score, level, factors, primaryType, confidence } */
export function scoreCertificate(cert, ctx) {
  const factors = [
    duplicateDetector(cert, ctx),
    mismatchDetector(cert, ctx),
    patternDetector(cert, ctx),
    transferDetector(cert, ctx),
    producerHistoryDetector(cert, ctx),
  ].filter(Boolean)

  // Residual from the autoencoder stand-in — small, deterministic
  const residual = cert.anomalyResidual || 0
  const raw = factors.reduce((s, d) => s + d.weight, 0) + residual

  // Independent signals compound: fraud rarely shows a single symptom
  const compound = factors.length >= 3 ? 1.18 : factors.length === 2 ? 1.08 : 1
  const score = Math.round(clamp(raw * compound))

  const fraudTypeList = Object.values(FRAUD_TYPES)
  const primary = factors
    .filter((d) => fraudTypeList.includes(d.type))
    .sort((a, b) => b.weight - a.weight)[0]

  return {
    score,
    level: riskLevel(score),
    factors: factors.sort((a, b) => b.weight - a.weight),
    primaryType: primary ? primary.type : null,
    confidence: Math.min(99, 62 + factors.length * 9 + (score > 70 ? 8 : 0)),
  }
}

/** Score an entire portfolio. */
export function scoreAll(certificates, producers) {
  const ctx = buildContext(certificates, producers)
  return certificates.map((c) => Object.assign({}, c, scoreCertificate(c, ctx)))
}

export function recommendedAction(score, primaryType) {
  if (score >= 85)
    return 'Suspend certificate immediately, freeze the producer pending-issuance queue and initiate a full manual audit.'
  if (score >= 71)
    return (
      'Suspend certificate and initiate a manual audit of the underlying ' +
      (primaryType === FRAUD_TYPES.DUPLICATE ? 'generation record.' : 'meter telemetry.')
    )
  if (score >= 51)
    return 'Request supporting meter exports from the producer before any ownership transfer is permitted.'
  if (score >= 31)
    return 'Queue for secondary verification. Certificate may remain active pending review.'
  return 'No action required. Certificate passes all automated integrity checks.'
}
