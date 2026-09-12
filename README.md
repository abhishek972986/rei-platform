# Renewable Energy Intelligence (REI)

**REC Fraud Detection & Intelligence System** — AI-powered fraud detection and blockchain-based
traceability for Renewable Energy Certificates.

> Trust Every Megawatt. Verify Every Certificate.

A fully interactive, high-fidelity prototype: a public marketing site, role-based authentication,
and a nine-module enterprise dashboard driven by a real (deterministic, explainable) fraud-scoring
engine running over a synthetic but realistic dataset.

---

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # production bundle into dist/
npm run preview  # serve the production build
```

Requires Node 18+. No backend, database or network access is needed — everything runs in the
browser against the in-memory dataset.

### Signing in

Pick any of the five roles on the login screen; the email is pre-filled and **any password of 4+
characters works**.

| Role | Sees |
|---|---|
| **Regulator** | Everything — full ecosystem oversight, analytics, enforcement |
| **Issuing Authority** | Verification queue, issuance, fraud alerts, producers |
| **Energy Producer** | Own generation data, own certificates, issuance requests |
| **Corporate Buyer** | Own portfolio, verification, transfer, retirement |
| **Auditor** | Investigations, ledger tracing, audit exports |

The session persists across reloads, so deep links into `/app/...` survive a refresh.

---

## What's in it

### Public site
- **Home** — hero, live alert count, animated generation-to-ledger visual, fraud primer, workflow, technology
- **About REC** — what certificates are, why they matter, how fraud happens, why traceability is non-negotiable
- **How It Works** — the eleven-step pipeline from generation to final decision
- **Technology** — the four trust layers, reference architecture, model ensemble, ledger network
- **Verify** — public certificate lookup by ID or transaction hash, no account required

### Platform (`/app`)
| Module | What it does |
|---|---|
| **Dashboard** | Role-aware KPIs, fraud trend, risk distribution, source mix, model performance, live ledger feed, and a runnable fraud scan |
| **Analytics** | Fraud trend, risk bands, detector breakdown, claimed-vs-metered generation, producer risk ranking, model ensemble metrics |
| **Fraud Intelligence** | The alert queue — filter by detector and severity, inspect the evidence, approve / suspend / reject / mark false positive |
| **REC Certificates** | Full register with filters, transfer, retirement, issuance, CSV export, and a detail page per certificate |
| **Generation Data** | Claimed vs metered reconciliation, mismatch flags, and a submission form that raises a real issuance request |
| **Blockchain Traceability** | Resolve any certificate, generation record or tx hash to its full immutable lifecycle timeline |
| **Investigations** | Case queue plus a full investigation workspace: evidence, duplicates, producer profile, notes, and a ruling |
| **Producers** | Registry ranked by behavioural risk, integrity scores, claim variance, per-producer certificate history |
| **Reports** | Fraud intelligence report, blockchain audit trail and compliance statement — all downloadable |
| **Settings** | Detection thresholds, notifications, security, model status, network configuration |

---

## The fraud engine

`src/engine/fraudEngine.js` is a deterministic, explainable scorer — every number the UI shows can
be traced to the rule that produced it. Five detectors, each returning a weight plus
human-readable evidence:

| Detector | Stands in for | Fires when |
|---|---|---|
| `duplicateDetector` | Exact + fuzzy matching | One generation record is claimed by more than one certificate |
| `mismatchDetector` | Statistical z-score bands | Claimed output exceeds metered output beyond a 2% tolerance |
| `patternDetector` | Isolation Forest | Issuance in a 48h window runs well above the producer's learned baseline |
| `transferDetector` | Ownership-graph analysis | Rapid same-day hops, or a chain that loops back to an earlier holder |
| `producerHistoryDetector` | Random Forest behaviour model | The producer carries confirmed prior incidents |

Independent signals **compound** (×1.08 for two, ×1.18 for three or more) — real fraud rarely shows
a single symptom. The result is banded:

| Band | Score | Meaning |
|---|---|---|
| 🟢 LOW | 0–30 | Certificate appears legitimate |
| 🟡 MEDIUM | 31–70 | Requires additional verification |
| 🔴 HIGH | 71–100 | Strong possibility of fraud |

Alerts are **derived**, not hardcoded: change the data and the alert queue, severity counts, charts
and dashboards all move with it.

---

## The dataset

`src/data/seed.js` builds everything from a seeded PRNG, so every reload — and every screenshot —
is identical.

- **77 certificates**, 72 generation records, 14 producers across 5 energy sources
- **55 low risk · 15 medium · 7 high**, with 22 alerts spanning all four severity bands
- Deliberately injected fraud: duplicate issuance, generation mismatch (down to 57% of claim),
  issuance bursts, rapid and circular ownership chains, and one compound case that trips
  every detector at once
- Certificate states: active, under investigation, suspicious, retired, pending issuance, rejected
- Full blockchain ledger trail per certificate, built from its actual history

Worth opening first: **REC-2026-048** (the compound case) and **REC-2026-041** (duplicate ring).

---

## Charts

Chart colour is not decorative. The categorical palette in `src/components/charts.jsx` was
validated against the dark navy surface for colour-vision separation, lightness band, chroma floor
and contrast before being used. Energy sources render in a fixed hue order and never cycle; risk
bands use reserved status colours that always ship with a text label, because red/green is
inseparable for a large share of viewers.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 · Vite 5 · Tailwind CSS 3 |
| Charts | Recharts |
| Icons | lucide-react |
| Routing | React Router 6, with route-level role gates |
| State | React Context (`src/data/store.jsx`) |

### Where a real backend would attach

The prototype is deliberately structured so each layer maps onto the production architecture:

- `src/data/store.jsx` — every mutation (`issueCertificate`, `transferCertificate`,
  `retireCertificate`, `applyDecision`) is a single function; each becomes one API call
- `src/engine/fraudEngine.js` — a pure scoring function; becomes a Python scoring service
  (scikit-learn / TensorFlow) called per certificate
- `src/data/seed.js` — the shape of the PostgreSQL schema: users, producers, generation records,
  certificates, alerts, ownership transactions
- `buildLedger()` — the read model over a Hyperledger Fabric / EVM chaincode event stream

---

## Project layout

```
src/
  App.jsx                  routes + auth and role gates
  data/
    seed.js                deterministic dataset, ledger builder, aggregations
    store.jsx              app state, session, all actions
  engine/
    fraudEngine.js         detectors, scoring, recommendations
  components/
    Layout.jsx             sidebar, topbar, alert bell, mobile drawer
    ui.jsx                 stat tiles, tables, risk badges, dials, modals, toasts
    charts.jsx             validated palette + all chart forms
    Timeline.jsx           blockchain lifecycle timeline
  pages/
    public/                home, about, how it works, technology, verify, login
    app/                   the nine dashboard modules + detail pages
  utils/report.js          CSV and audit-report generation
```

---

## Note

This is a demonstration environment. All producers, certificates, meter readings, transaction
hashes and block numbers are **synthetic** — no live registry or blockchain network is contacted,
and nothing here should be presented as a real certificate record.
