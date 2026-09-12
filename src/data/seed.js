/**
 * Deterministic demo dataset for the REI platform.
 * A seeded PRNG keeps every reload identical, so screenshots, demos
 * and the fraud engine's output stay reproducible.
 */

/* ---------------- seeded PRNG ---------------- */
function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rnd = mulberry32(20260412)
const rand = (lo, hi) => lo + rnd() * (hi - lo)
const randInt = (lo, hi) => Math.floor(rand(lo, hi + 1))
const pick = (arr) => arr[Math.floor(rnd() * arr.length)]

const hex = (n) => {
  let s = ''
  for (let i = 0; i < n; i++) s += '0123456789abcdef'[Math.floor(rnd() * 16)]
  return s
}
export const txHash = () => '0x' + hex(64)
const addr = () => '0x' + hex(40)

const pad = (n, w) => String(n).padStart(w, '0')
const iso = (d) => new Date(d).toISOString()

/* ---------------- reference data ---------------- */

export const ENERGY_SOURCES = ['Solar', 'Wind', 'Hydro', 'Biomass', 'Geothermal']

export const SOURCE_COLORS = {
  Solar: '#fbbf24',
  Wind: '#22d3ee',
  Hydro: '#3b82f6',
  Biomass: '#10b981',
  Geothermal: '#f97316',
}

export const STATUS = {
  ACTIVE: 'Active',
  INVESTIGATING: 'Under Investigation',
  SUSPICIOUS: 'Suspicious',
  RETIRED: 'Retired',
  PENDING: 'Pending Issuance',
  REJECTED: 'Rejected',
}

export const ROLES = {
  REGULATOR: 'Regulator',
  ISSUER: 'Issuing Authority',
  PRODUCER: 'Energy Producer',
  BUYER: 'Corporate Buyer',
  AUDITOR: 'Auditor',
}

export const ROLE_INFO = {
  [ROLES.REGULATOR]: {
    email: 'regulator@rei.gov',
    org: 'National Renewable Energy Regulatory Commission',
    blurb: 'Full oversight of the national REC ecosystem, fraud analytics and enforcement.',
    color: '#22d3ee',
  },
  [ROLES.ISSUER]: {
    email: 'issuer@greencert.org',
    org: 'GreenCert Issuing Authority',
    blurb: 'Verifies generation telemetry and issues certificates against approved claims.',
    color: '#10b981',
  },
  [ROLES.PRODUCER]: {
    email: 'ops@helios-solar.com',
    org: 'Helios Solar Fields',
    blurb: 'Submits metered generation data and requests REC issuance.',
    color: '#fbbf24',
  },
  [ROLES.BUYER]: {
    email: 'sustainability@northbay.com',
    org: 'Northbay Industries',
    blurb: 'Procures, verifies and retires certificates against corporate climate targets.',
    color: '#a78bfa',
  },
  [ROLES.AUDITOR]: {
    email: 'audit@veritas-energy.org',
    org: 'Veritas Energy Audit Partners',
    blurb: 'Independent investigation, ledger tracing and audit documentation.',
    color: '#f472b6',
  },
}

const ORGS = [
  'Northbay Industries',
  'Cobalt Data Centers',
  'Meridian Airlines',
  'Vertex Manufacturing',
  'Aurora Retail Group',
  'Stratos Logistics',
  'Kingsway Telecom',
  'Pallas Chemicals',
  'Orion Cloud Services',
  'Redwood Foods',
]

/* ---------------- producers ---------------- */

const PRODUCER_SPECS = [
  ['Helios Solar Fields', 'Solar', 'Rajasthan, IN', 240, 96, 0],
  ['Windward Ridge Energy', 'Wind', 'Gujarat, IN', 310, 94, 0],
  ['Cascade Hydro Works', 'Hydro', 'Himachal Pradesh, IN', 180, 97, 0],
  ['Verdant Biomass Co.', 'Biomass', 'Punjab, IN', 90, 91, 1],
  ['Solaris Prime Park', 'Solar', 'Tamil Nadu, IN', 275, 88, 1],
  ['Aeolus Offshore Wind', 'Wind', 'Maharashtra, IN', 420, 95, 0],
  ['Thermal Deep Geo', 'Geothermal', 'Ladakh, IN', 60, 93, 0],
  ['Sunbelt Renewables', 'Solar', 'Karnataka, IN', 195, 62, 4],
  ['Northgale Wind Farms', 'Wind', 'Andhra Pradesh, IN', 230, 71, 3],
  ['Riverstone Hydel', 'Hydro', 'Uttarakhand, IN', 145, 90, 0],
  ['Agri-Green Biopower', 'Biomass', 'Haryana, IN', 75, 84, 1],
  ['Pinnacle Solar Estates', 'Solar', 'Madhya Pradesh, IN', 205, 55, 5],
  ['Zephyr Coastal Power', 'Wind', 'Odisha, IN', 160, 92, 0],
  ['Emerald Valley Hydro', 'Hydro', 'Sikkim, IN', 120, 95, 0],
]

export const producers = PRODUCER_SPECS.map((s, i) => ({
  id: 'PRD-' + pad(i + 1, 3),
  name: s[0],
  source: s[1],
  location: s[2],
  capacityMW: s[3],
  integrity: s[4],
  priorIncidents: s[5],
  walletAddress: addr(),
  registeredOn: iso(new Date(2023, randInt(0, 11), randInt(1, 27))),
  meterIds: ['MTR-' + pad(i + 1, 3) + '-A', 'MTR-' + pad(i + 1, 3) + '-B'],
  certified: true,
}))

const producerById = Object.fromEntries(producers.map((p) => [p.id, p]))

/* ---------------- generation records ---------------- */

const START = new Date(2026, 0, 6).getTime()
const DAY = 86400000

export const generationRecords = []
export const certificates = []

function makeGeneration(producer, dayOffset, claimedKWh, meteredKWh) {
  const id = 'GEN-2026-' + pad(generationRecords.length + 1, 4)
  const rec = {
    id,
    producerId: producer.id,
    producerName: producer.name,
    source: producer.source,
    meterId: pick(producer.meterIds),
    claimedKWh: Math.round(claimedKWh),
    meteredKWh: Math.round(meteredKWh),
    timestamp: iso(START + dayOffset * DAY + randInt(0, 20) * 3600000),
    interval: 'Daily aggregate',
    dataSource: pick(['Smart Meter Telemetry', 'IoT Gateway', 'SCADA Export', 'EMS Feed']),
    encrypted: true,
  }
  generationRecords.push(rec)
  return rec
}

function buildTransfers(cert, hops, rapid, loop) {
  const chain = []
  let from = cert.producerName
  let day = new Date(cert.issuanceDate).getTime()
  const parties = []
  for (let i = 0; i < hops; i++) parties.push(pick(ORGS))
  if (loop && hops > 2) parties[hops - 1] = parties[0]
  for (let i = 0; i < hops; i++) {
    day += (rapid ? rand(0.1, 0.9) : rand(4, 26)) * DAY
    const to = parties[i]
    chain.push({
      id: 'TXN-' + pad(certificates.length + 1, 3) + '-' + (i + 1),
      certificateId: cert.id,
      from,
      to,
      date: iso(day),
      txHash: txHash(),
      priceUSD: Math.round(rand(2.1, 7.8) * 100) / 100,
    })
    from = to
  }
  return chain
}

let certSeq = 0
function makeCertificate(opts) {
  certSeq++
  const producer = opts.producer
  const gen = opts.generation
  const issuance = new Date(new Date(gen.timestamp).getTime() + rand(1, 6) * DAY)
  const cert = {
    id: 'REC-2026-' + pad(certSeq, 3),
    generationId: gen.id,
    producerId: producer.id,
    producerName: producer.name,
    source: producer.source,
    location: producer.location,
    claimedKWh: gen.claimedKWh,
    meteredKWh: gen.meteredKWh,
    energyMWh: Math.round(gen.claimedKWh / 100) / 10,
    generationDate: gen.timestamp,
    issuanceDate: iso(issuance),
    vintage: 'Q' + (Math.floor(new Date(gen.timestamp).getMonth() / 3) + 1) + ' 2026',
    owner: producer.name,
    status: STATUS.ACTIVE,
    txHash: txHash(),
    blockNumber: 4821004 + certSeq * randInt(3, 19),
    anomalyResidual: opts.residual != null ? opts.residual : Math.round(rand(0, 9)),
    transfers: [],
    retiredAt: null,
    retiredBy: null,
    decision: null,
    notes: [],
  }
  const hops = opts.hops != null ? opts.hops : randInt(0, 2)
  if (hops > 0) {
    cert.transfers = buildTransfers(cert, hops, !!opts.rapidTransfers, !!opts.loopTransfers)
    cert.owner = cert.transfers[cert.transfers.length - 1].to
  }
  certificates.push(cert)
  return cert
}

/* --- 1. Clean, legitimate certificates (the bulk) --- */
for (let i = 0; i < 40; i++) {
  const producer = producers[i % producers.length]
  const base = producer.capacityMW * rand(2.4, 5.2) * 100
  const metered = base * rand(0.985, 1.0)
  const gen = makeGeneration(producer, randInt(0, 200), base, metered)
  makeCertificate({ producer, generation: gen, residual: Math.round(rand(0, 7)) })
}

/* --- 2. Duplicate certificates: same generation record certified twice --- */
/* meterRatio < 1 compounds the duplicate with a generation mismatch, which is
   how the worst real cases present — one fabricated reading, sold twice. */
const dupPairs = [
  [producers[7], 3, 0.83],
  [producers[11], 2, 0.86],
  [producers[8], 2, 0.99],
]
dupPairs.forEach(([producer, copies, meterRatio]) => {
  const base = producer.capacityMW * rand(3, 4.6) * 100
  const gen = makeGeneration(producer, randInt(10, 180), base, base * meterRatio)
  for (let i = 0; i < copies; i++) {
    makeCertificate({ producer, generation: gen, residual: Math.round(rand(4, 12)) })
  }
})

/* --- 2b. The compound case: duplicate + mismatch + rapid circular transfers --- */
const worst = producers[11]
const worstClaim = worst.capacityMW * 4.8 * 100
const worstGen = makeGeneration(worst, 118, worstClaim, worstClaim * 0.76)
for (let i = 0; i < 2; i++) {
  makeCertificate({
    producer: worst,
    generation: worstGen,
    hops: 4,
    rapidTransfers: true,
    loopTransfers: true,
    residual: 9,
  })
}

/* --- 3. Generation mismatch: claimed far above metered --- */
const mismatchSpecs = [
  [producers[11], 0.57],
  [producers[7], 0.63],
  [producers[8], 0.65],
  [producers[4], 0.88],
  [producers[10], 0.83],
  [producers[3], 0.93],
]
mismatchSpecs.forEach(([producer, ratio]) => {
  const claimed = producer.capacityMW * rand(3.2, 5) * 100
  const gen = makeGeneration(producer, randInt(20, 195), claimed, claimed * ratio)
  makeCertificate({ producer, generation: gen, residual: Math.round(rand(3, 10)) })
})

/* --- 4. Unusual issuance pattern: burst of certificates in one window --- */
const burstProducer = producers[11]
const burstDay = 142
for (let i = 0; i < 7; i++) {
  const claimed = burstProducer.capacityMW * rand(3.8, 5.4) * 100
  const gen = makeGeneration(
    burstProducer,
    burstDay + rand(0, 1.4),
    claimed,
    claimed * rand(0.86, 0.99)
  )
  makeCertificate({ producer: burstProducer, generation: gen, residual: Math.round(rand(2, 9)) })
}
const burst2 = producers[8]
for (let i = 0; i < 5; i++) {
  const claimed = burst2.capacityMW * rand(3.4, 4.8) * 100
  const gen = makeGeneration(burst2, 88 + rand(0, 1.6), claimed, claimed * rand(0.9, 1))
  makeCertificate({ producer: burst2, generation: gen, residual: Math.round(rand(2, 8)) })
}

/* --- 5. Suspicious ownership transfers: rapid / circular chains --- */
const transferSpecs = [
  [producers[7], 5, true, true],
  [producers[12], 4, true, false],
  [producers[1], 4, true, true],
  [producers[9], 3, true, false],
]
transferSpecs.forEach(([producer, hops, rapid, loop]) => {
  const claimed = producer.capacityMW * rand(2.8, 4.4) * 100
  const gen = makeGeneration(producer, randInt(30, 160), claimed, claimed * rand(0.95, 1))
  makeCertificate({
    producer,
    generation: gen,
    hops,
    rapidTransfers: rapid,
    loopTransfers: loop,
    residual: Math.round(rand(2, 9)),
  })
})

/* --- 6. Retired certificates (buyer compliance) --- */
certificates.slice(0, 9).forEach((c, i) => {
  if (i % 2 === 0) {
    c.status = STATUS.RETIRED
    c.retiredAt = iso(new Date(c.issuanceDate).getTime() + rand(20, 120) * DAY)
    c.retiredBy = c.owner
  }
})

/* --- 7. Pending issuance requests --- */
for (let i = 0; i < 6; i++) {
  const producer = producers[randInt(0, producers.length - 1)]
  const claimed = producer.capacityMW * rand(2.6, 4.6) * 100
  const gen = makeGeneration(producer, 200 + i, claimed, claimed * rand(0.9, 1))
  const c = makeCertificate({ producer, generation: gen, hops: 0 })
  c.status = STATUS.PENDING
  c.txHash = null
  c.blockNumber = null
}

/* ---------------- blockchain ledger ---------------- */

const ORG_BY_EVENT = {
  'Energy Generated': (c) => c.producerName,
  'Generation Verified': () => 'GreenCert Issuing Authority',
  'REC Issued': () => 'GreenCert Issuing Authority',
  'Ownership Transferred': (c, e) => e.to,
  'Ownership Verified': () => 'National REC Registry',
  'REC Retired': (c) => c.retiredBy || c.owner,
  'Flagged by AI Engine': () => 'REI Fraud Detection Engine',
  'Investigation Opened': () => 'Veritas Energy Audit Partners',
}

export function buildLedger(cert) {
  if (!cert) return []
  const events = []
  let block = cert.blockNumber || 4900000
  const push = (label, date, extra) =>
    events.push(
      Object.assign(
        {
          label,
          date,
          txHash: txHash(),
          block: (block += randInt(2, 14)),
          org: ORG_BY_EVENT[label] ? ORG_BY_EVENT[label](cert, extra || {}) : 'REI Network',
          status: 'Confirmed',
        },
        extra || {}
      )
    )

  push('Energy Generated', cert.generationDate, {
    meta: cert.claimedKWh.toLocaleString() + ' kWh claimed · meter ' + cert.generationId,
  })
  push('Generation Verified', iso(new Date(cert.generationDate).getTime() + 0.4 * DAY), {
    meta:
      cert.meteredKWh.toLocaleString() +
      ' kWh confirmed by telemetry (' +
      ((cert.meteredKWh / cert.claimedKWh) * 100).toFixed(1) +
      '% of claim)',
  })
  if (cert.status !== STATUS.PENDING) {
    push('REC Issued', cert.issuanceDate, {
      meta: cert.energyMWh + ' MWh certificate minted to ' + cert.producerName,
    })
  }
  ;(cert.transfers || []).forEach((t) => {
    push('Ownership Transferred', t.date, {
      meta: t.from + ' → ' + t.to + ' · $' + t.priceUSD + '/MWh',
      to: t.to,
    })
  })
  if (cert.score >= 71) {
    push(
      'Flagged by AI Engine',
      iso(new Date(cert.issuanceDate).getTime() + 2.2 * DAY),
      { meta: 'Risk score ' + cert.score + '/100 · ' + (cert.primaryType || 'Anomaly'), status: 'Alert' }
    )
  }
  if (cert.status === STATUS.INVESTIGATING) {
    push('Investigation Opened', iso(new Date(cert.issuanceDate).getTime() + 3 * DAY), {
      meta: 'Manual audit initiated',
      status: 'Open',
    })
  }
  if (cert.status === STATUS.RETIRED) {
    push('REC Retired', cert.retiredAt, {
      meta: 'Retired against corporate climate disclosure — permanently removed from circulation',
    })
  }
  return events.sort((a, b) => new Date(a.date) - new Date(b.date))
}

/* ---------------- aggregated time series ---------------- */

export function buildFraudTrend(certs) {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const buckets = months.slice(0, 9).map((m) => ({
    month: m,
    issued: 0,
    flagged: 0,
    confirmed: 0,
    avgRisk: 0,
    _riskSum: 0,
  }))
  certs.forEach((c) => {
    const idx = new Date(c.issuanceDate).getMonth()
    if (idx > 8) return
    const b = buckets[idx]
    b.issued++
    b._riskSum += c.score
    if (c.score >= 31) b.flagged++
    if (c.score >= 71) b.confirmed++
  })
  buckets.forEach((b) => {
    b.avgRisk = b.issued ? Math.round(b._riskSum / b.issued) : 0
    delete b._riskSum
  })
  return buckets
}

export function buildGenerationSeries(certs) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
  return months.map((m, i) => {
    const inMonth = certs.filter((c) => new Date(c.generationDate).getMonth() === i)
    const claimed = inMonth.reduce((s, c) => s + c.claimedKWh, 0)
    const metered = inMonth.reduce((s, c) => s + c.meteredKWh, 0)
    return {
      month: m,
      claimed: Math.round(claimed / 1000),
      metered: Math.round(metered / 1000),
      variance: Math.round(((claimed - metered) / (claimed || 1)) * 1000) / 10,
    }
  })
}

export const modelMetrics = {
  accuracy: 96.8,
  precision: 94.2,
  recall: 91.7,
  f1: 92.9,
  falsePositiveRate: 3.1,
  modelVersion: 'REI-AnomalyNet v4.2.1',
  lastTrained: '2026-08-28T04:12:00.000Z',
  samplesTrained: 1284500,
  ensemble: [
    { name: 'Isolation Forest', task: 'Volume & frequency anomaly', weight: 32, accuracy: 94.1 },
    { name: 'Random Forest', task: 'Producer behaviour classification', weight: 28, accuracy: 95.6 },
    { name: 'Autoencoder', task: 'Telemetry reconstruction error', weight: 24, accuracy: 93.4 },
    { name: 'Statistical Z-Score', task: 'Meter deviation bands', weight: 16, accuracy: 97.2 },
  ],
}

export const networkStats = {
  chain: 'Hyperledger Fabric · rei-energy-channel',
  consensus: 'RAFT (5 orderers)',
  peers: 18,
  blockHeight: 4938217,
  avgBlockTime: '2.1s',
  contractsDeployed: 7,
  immutableRecords: 412899,
}
