import React, { createContext, useContext, useMemo, useState, useCallback } from 'react'
import {
  certificates as seedCertificates,
  generationRecords as seedGeneration,
  producers as seedProducers,
  STATUS,
  ROLES,
  ROLE_INFO,
  txHash,
} from './seed'
import { scoreAll, riskLevel, FRAUD_CODES } from '../engine/fraudEngine'

const StoreContext = createContext(null)
export const useStore = () => useContext(StoreContext)

const pad = (n, w) => String(n).padStart(w, '0')

/** Severity banding used across the Fraud Intelligence Center. */
export function severityOf(score) {
  if (score >= 85) return 'Critical'
  if (score >= 71) return 'High'
  if (score >= 51) return 'Medium'
  return 'Low'
}

function deriveAlerts(scored) {
  return scored
    .filter((c) => c.score >= 31 && c.primaryType && c.status !== STATUS.PENDING)
    .sort((a, b) => b.score - a.score)
    .map((c, i) => ({
      id: 'ALT-' + pad(i + 1, 3),
      certificateId: c.id,
      producerId: c.producerId,
      producerName: c.producerName,
      fraudType: c.primaryType,
      code: FRAUD_CODES[c.primaryType],
      score: c.score,
      level: riskLevel(c.score),
      severity: severityOf(c.score),
      detectedAt: new Date(new Date(c.issuanceDate).getTime() + 2.2 * 86400000).toISOString(),
      status: c.investigationStatus || (c.score >= 71 ? 'Open' : 'Monitoring'),
      confidence: c.confidence,
      factors: c.factors,
    }))
}

/* ---------- session ---------- */

const SESSION_KEY = 'rei.session'

/** Build the full session object from the durable part ({ role, email }). */
function buildUser(role, email) {
  const info = ROLE_INFO[role]
  if (!info) return null
  return {
    role,
    email: email || info.email,
    org: info.org,
    name: role === ROLES.PRODUCER ? 'A. Nayar' : role === ROLES.AUDITOR ? 'S. Rahman' : 'M. Kapoor',
    color: info.color,
    // Producer accounts are scoped to a single generating company
    producerId: role === ROLES.PRODUCER ? 'PRD-001' : null,
    buyerOrg: role === ROLES.BUYER ? 'Northbay Industries' : null,
  }
}

/** Restore a session so a refresh or a deep link does not bounce to login. */
function readSession() {
  try {
    const raw = globalThis.localStorage && globalThis.localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw)
    return buildUser(saved.role, saved.email)
  } catch {
    return null
  }
}

export function StoreProvider({ children }) {
  const [user, setUser] = useState(readSession)
  const [rawCerts, setRawCerts] = useState(seedCertificates)
  const [generation, setGeneration] = useState(seedGeneration)
  const [producers] = useState(seedProducers)
  const [overrides, setOverrides] = useState({}) // certId -> { status, decision, investigationStatus, notes }
  const [scanLog, setScanLog] = useState([])
  const [toasts, setToasts] = useState([])

  /* ---------- derived: scored certificates ---------- */
  const certificates = useMemo(() => {
    const scored = scoreAll(rawCerts, producers)
    return scored.map((c) => {
      const o = overrides[c.id]
      let status = c.status
      // Certificates that the engine flags hard move into investigation unless
      // a human has already ruled on them.
      if (!o && status === STATUS.ACTIVE && c.score >= 85) status = STATUS.SUSPICIOUS
      else if (!o && status === STATUS.ACTIVE && c.score >= 71) status = STATUS.INVESTIGATING
      return Object.assign({}, c, { status }, o || {})
    })
  }, [rawCerts, producers, overrides])

  const alerts = useMemo(() => deriveAlerts(certificates), [certificates])

  const certById = useCallback(
    (id) => certificates.find((c) => c.id === id) || null,
    [certificates]
  )
  const alertById = useCallback((id) => alerts.find((a) => a.id === id) || null, [alerts])
  const producerById = useCallback(
    (id) => producers.find((p) => p.id === id) || null,
    [producers]
  )

  /* ---------- stats ---------- */
  const stats = useMemo(() => {
    const issued = certificates.filter((c) => c.status !== STATUS.PENDING)
    const active = certificates.filter((c) => c.status === STATUS.ACTIVE)
    const retired = certificates.filter((c) => c.status === STATUS.RETIRED)
    const suspicious = certificates.filter(
      (c) => c.status === STATUS.SUSPICIOUS || c.status === STATUS.INVESTIGATING
    )
    const high = certificates.filter((c) => c.score >= 71)
    const medium = certificates.filter((c) => c.score >= 31 && c.score < 71)
    const low = certificates.filter((c) => c.score < 31)
    const totalMWh = issued.reduce((s, c) => s + c.energyMWh, 0)
    const claimed = issued.reduce((s, c) => s + c.claimedKWh, 0)
    const metered = issued.reduce((s, c) => s + c.meteredKWh, 0)
    return {
      total: issued.length,
      totalDisplay: 125840 + issued.length,
      active: active.length,
      retired: retired.length,
      suspicious: suspicious.length,
      pending: certificates.filter((c) => c.status === STATUS.PENDING).length,
      alerts: alerts.length,
      criticalAlerts: alerts.filter((a) => a.severity === 'Critical').length,
      high: high.length,
      medium: medium.length,
      low: low.length,
      totalMWh: Math.round(totalMWh),
      avgRisk: Math.round(issued.reduce((s, c) => s + c.score, 0) / (issued.length || 1)),
      claimedKWh: claimed,
      meteredKWh: metered,
      variancePct: Math.round(((claimed - metered) / (claimed || 1)) * 1000) / 10,
      producers: producers.length,
    }
  }, [certificates, alerts, producers])

  /* ---------- actions ---------- */

  const toast = useCallback((message, tone = 'ok') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200)
  }, [])

  const login = useCallback((role, email) => {
    const next = buildUser(role, email)
    setUser(next)
    try {
      globalThis.localStorage &&
        globalThis.localStorage.setItem(SESSION_KEY, JSON.stringify({ role, email: next.email }))
    } catch {
      /* storage unavailable — session stays in memory only */
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    try {
      globalThis.localStorage && globalThis.localStorage.removeItem(SESSION_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const applyDecision = useCallback(
    (certId, decision) => {
      const map = {
        approve: { status: STATUS.ACTIVE, investigationStatus: 'Resolved', decision: 'Approved' },
        reject: { status: STATUS.REJECTED, investigationStatus: 'Resolved', decision: 'Rejected' },
        suspend: {
          status: STATUS.SUSPICIOUS,
          investigationStatus: 'Suspended',
          decision: 'Suspended',
        },
        falsePositive: {
          status: STATUS.ACTIVE,
          investigationStatus: 'False Positive',
          decision: 'False Positive',
        },
        investigate: {
          status: STATUS.INVESTIGATING,
          investigationStatus: 'Under Review',
          decision: null,
        },
      }
      const patch = map[decision]
      if (!patch) return
      setOverrides((o) => ({
        ...o,
        [certId]: Object.assign({}, o[certId], patch, {
          decidedAt: new Date().toISOString(),
          decidedBy: user ? user.org : 'REI Operator',
        }),
      }))
      const labels = {
        approve: 'approved',
        reject: 'rejected',
        suspend: 'suspended',
        falsePositive: 'marked as a false positive',
        investigate: 'moved to investigation',
      }
      toast(certId + ' ' + labels[decision] + '.', decision === 'reject' ? 'danger' : 'ok')
    },
    [user, toast]
  )

  const transferCertificate = useCallback(
    (certId, toOrg) => {
      setRawCerts((list) =>
        list.map((c) => {
          if (c.id !== certId) return c
          const transfers = [
            ...(c.transfers || []),
            {
              id: 'TXN-' + certId.slice(-3) + '-' + ((c.transfers || []).length + 1),
              certificateId: certId,
              from: c.transfers && c.transfers.length ? c.transfers[c.transfers.length - 1].to : c.owner,
              to: toOrg,
              date: new Date().toISOString(),
              txHash: txHash(),
              priceUSD: Math.round(Math.random() * 500 + 210) / 100,
            },
          ]
          return Object.assign({}, c, { transfers, owner: toOrg })
        })
      )
      toast('Ownership of ' + certId + ' transferred to ' + toOrg + ' and written to the ledger.')
    },
    [toast]
  )

  const retireCertificate = useCallback(
    (certId, byOrg) => {
      setOverrides((o) => ({
        ...o,
        [certId]: Object.assign({}, o[certId], {
          status: STATUS.RETIRED,
          retiredAt: new Date().toISOString(),
          retiredBy: byOrg || (user ? user.org : 'REI Operator'),
        }),
      }))
      toast(certId + ' retired — permanently removed from circulation.')
    },
    [user, toast]
  )

  const submitGeneration = useCallback(
    (payload) => {
      const producer = producers.find((p) => p.id === payload.producerId) || producers[0]
      const id = 'GEN-2026-' + pad(seedGeneration.length + 1 + Math.floor(Math.random() * 900), 4)
      const rec = {
        id,
        producerId: producer.id,
        producerName: producer.name,
        source: producer.source,
        meterId: payload.meterId || producer.meterIds[0],
        claimedKWh: Number(payload.claimedKWh),
        meteredKWh: Number(payload.meteredKWh),
        timestamp: payload.date ? new Date(payload.date).toISOString() : new Date().toISOString(),
        interval: 'Daily aggregate',
        dataSource: payload.dataSource || 'Smart Meter Telemetry',
        encrypted: true,
        submittedByUser: true,
      }
      setGeneration((g) => [rec, ...g])
      toast('Generation record ' + id + ' encrypted and stored.')
      return rec
    },
    [producers, toast]
  )

  const requestIssuance = useCallback(
    (genRecord) => {
      const producer = producers.find((p) => p.id === genRecord.producerId) || producers[0]
      const seq = rawCerts.length + 1
      const cert = {
        id: 'REC-2026-' + pad(seq, 3),
        generationId: genRecord.id,
        producerId: producer.id,
        producerName: producer.name,
        source: producer.source,
        location: producer.location,
        claimedKWh: genRecord.claimedKWh,
        meteredKWh: genRecord.meteredKWh,
        energyMWh: Math.round(genRecord.claimedKWh / 100) / 10,
        generationDate: genRecord.timestamp,
        issuanceDate: new Date().toISOString(),
        vintage: 'Q' + (Math.floor(new Date(genRecord.timestamp).getMonth() / 3) + 1) + ' 2026',
        owner: producer.name,
        status: STATUS.PENDING,
        txHash: null,
        blockNumber: null,
        anomalyResidual: 2,
        transfers: [],
        retiredAt: null,
        retiredBy: null,
        decision: null,
        notes: [],
        createdByUser: true,
      }
      setRawCerts((list) => [...list, cert])
      toast('Issuance request ' + cert.id + ' submitted for verification.')
      return cert
    },
    [producers, rawCerts.length, toast]
  )

  const issueCertificate = useCallback(
    (certId) => {
      setRawCerts((list) =>
        list.map((c) =>
          c.id === certId
            ? Object.assign({}, c, {
                status: STATUS.ACTIVE,
                txHash: txHash(),
                blockNumber: 4938217 + Math.floor(Math.random() * 400),
                issuanceDate: new Date().toISOString(),
              })
            : c
        )
      )
      toast(certId + ' issued and registered on the blockchain ledger.')
    },
    [toast]
  )

  const runScan = useCallback(
    (scope) => {
      const entry = {
        id: 'SCAN-' + Date.now().toString().slice(-6),
        at: new Date().toISOString(),
        scope: scope || 'Full portfolio',
        analysed: certificates.length,
        flagged: certificates.filter((c) => c.score >= 31).length,
        high: certificates.filter((c) => c.score >= 71).length,
        durationMs: 900 + Math.floor(Math.random() * 700),
        by: user ? user.org : 'REI Operator',
      }
      setScanLog((l) => [entry, ...l].slice(0, 12))
      return entry
    },
    [certificates, user]
  )

  const addNote = useCallback(
    (certId, text) => {
      setOverrides((o) => {
        const prev = o[certId] || {}
        const notes = [
          ...(prev.notes || []),
          {
            text,
            at: new Date().toISOString(),
            by: user ? user.org : 'REI Operator',
            role: user ? user.role : 'Operator',
          },
        ]
        return { ...o, [certId]: Object.assign({}, prev, { notes }) }
      })
      toast('Investigation note recorded.')
    },
    [user, toast]
  )

  const value = {
    user,
    login,
    logout,
    certificates,
    generation,
    producers,
    alerts,
    stats,
    scanLog,
    toasts,
    certById,
    alertById,
    producerById,
    applyDecision,
    transferCertificate,
    retireCertificate,
    submitGeneration,
    requestIssuance,
    issueCertificate,
    runScan,
    addNote,
    toast,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
