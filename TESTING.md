# Test & Verification Procedure

How to verify the REI platform actually works — and how to prove to a reviewer that the fraud
engine is really computing, not replaying a script.

Every expected value below was computed from the engine, so if your screen disagrees with this
document, something is genuinely broken.

```bash
cd rei-platform
npm install
npm run dev        # http://localhost:5173
```

> **Before each test run, hard-refresh (Ctrl+Shift+R).** State lives in memory, so a refresh
> resets everything to the seed. That is also how you undo a test.

---

## Level 0 — Automated checks (2 min)

| Command | Pass condition |
|---|---|
| `npm run build` | Completes, no errors. Warning about chunk >500 kB is expected and harmless. |
| Open `/` and press **F12 → Console** | No red errors. Navigate between 3–4 pages; still none. |

The console check matters: a React crash shows up there before it shows up visually.

---

## Level 1 — Public site (5 min)

| # | Action | Expected |
|---|---|---|
| 1.1 | Load `/` | Hero reads "Secure. Transparent. / Fraud-Free RECs." Turbine blades are rotating. |
| 1.2 | Look at the chip under the hero art | "**22** fraud alerts detected live" — this number is computed, not typed |
| 1.3 | Click the sun/moon icon (top right) | Whole site flips light ↔ dark. Reload the page — **your choice persists** |
| 1.4 | Click every nav item | Home, About, Features, How It Works all load. Use Cases / Contact scroll down the page |
| 1.5 | Resize the window to ~390px wide | Nav collapses to a hamburger, cards stack to one column, no horizontal scrollbar |
| 1.6 | Go to `/verify`, enter `REC-2026-002`, click Verify | Green shield, "Authentic", risk dial shows **3 / LOW RISK** |
| 1.7 | Same page, enter `REC-2026-048` | Red shield, "Flagged — not cleared for trade", dial shows **100 / HIGH RISK** |
| 1.8 | Enter `REC-9999-999` | "No ledger record found" |
| 1.9 | On a found certificate, click **Download verification report** | A `.txt` file downloads containing the risk factors and ledger trail |

**1.6 vs 1.7 is the money shot** — same page, same code path, two opposite verdicts driven by data.

---

## Level 2 — Authentication & roles (5 min)

| # | Action | Expected |
|---|---|---|
| 2.1 | Go to `/app` while signed out | Redirected to `/login` |
| 2.2 | Log in as **Regulator** (any password 4+ chars) | Lands on dashboard, "Welcome back, M. Kapoor" |
| 2.3 | Count the sidebar items | **10** modules |
| 2.4 | Sign out, log in as **Energy Producer** | Sidebar now shows **6** items — Analytics, Fraud Intelligence, Investigations and Producers are gone |
| 2.5 | While still Producer, type `/app/fraud` in the address bar | **Blocked** — you are bounced out, not shown the page |
| 2.6 | Log in as **Corporate Buyer** | Sidebar shows **5** items |
| 2.7 | Refresh the page while logged in | Still logged in, same role |

2.5 is the one worth showing — the gate is on the route, not just hidden menu items.

---

## Level 3 — Prove the AI engine is real (10 min) ⭐

**This is the most important section.** Anyone can hardcode a table of alerts. These tests prove
the scores are computed live from the data.

### 3.1 — The duplicate ring

Go to **REC Certificates** and open `REC-2026-041`, then `REC-2026-042`, then `REC-2026-043`.

Expected: all three cite generation record **GEN-2026-0041**, and each one lists *the other two by
ID* as evidence. Scores: **87, 90, 87**.

There are four duplicate groups in the data:

| Generation record | Certificates claiming it |
|---|---|
| GEN-2026-0041 | REC-2026-041, 042, 043 (a triple) |
| GEN-2026-0042 | REC-2026-044, 045 |
| GEN-2026-0043 | REC-2026-046, 047 |
| GEN-2026-0044 | REC-2026-048, 049 |

### 3.2 — The compound case

Open **Investigations → REC-2026-048**.

Expected: score **100/100**, and **5 separate factors** listed — duplicate, mismatch, issuance
burst, ownership chain, and producer history. Each one has its own evidence line and point
weighting. The score is the sum, with a ×1.18 multiplier because 3+ independent signals fired.

Point out that the weights add up. That's what "explainable" means.

### 3.3 — The mismatch maths

Go to **Generation Data** and find `REC-2026-050` / its generation record.

Expected: claimed **68,420 kWh**, metered **38,999 kWh**, a **43.0%** gap, flagged as a suspicious
mismatch. Check the subtraction yourself — 68,420 − 38,999 = 29,421 kWh unaccounted for.

### 3.4 — Make the score change in front of them ⭐⭐

This is the decisive test. You are going to *cause* fraud detection.

1. Note the current alert count on the dashboard: **22**
2. Open `REC-2026-061` — it is **score 24, LOW risk, no alert, 0 transfers**
3. Click **Transfer** and send it to any buyer. Repeat until you have done it **3 times**
   (transfers seconds apart is exactly the pattern the detector looks for)
4. Return to the certificate

Expected, verified against the engine:

| Transfers made | Score | Result |
|---|---|---|
| 0 | 24 | LOW, no alert |
| 2 | ~35 | crosses into MEDIUM |
| **3** | **45** | **MEDIUM — alert appears** |
| 4 | 54 | alert, higher severity |

A **Suspicious Ownership Transfer** factor now appears citing the exact hops you just made, the
certificate shows up in **Fraud Intelligence**, and the dashboard alert count goes **22 → 23**.

You just created a fraud pattern and the engine caught it. No script could do that.

> **Pick the right certificate.** The detector needs at least 2 hops, and the score has to clear 31
> to raise an alert — so a certificate with a very low baseline won't trip it in 3 clicks.
> `REC-2026-002` (baseline 3) still only reaches **27 after 4 transfers** — no alert. Good
> candidates, all of which alert within 3 transfers: **REC-2026-061** (24), **REC-2026-026** (23),
> **REC-2026-008** (21).

### 3.5 — Counts reconcile

On the dashboard, check these against the Certificates page filters:

| Metric | Expected |
|---|---|
| Certificates | 77 (71 issued + 6 pending) |
| Low / Medium / High risk | 55 / 15 / 7 |
| Alerts | 22 |
| Producers | 14 |
| Retired | 5 |
| Pending issuance | 6 |

Filter the certificate table by High risk — you should count exactly **7** rows.

---

## Level 4 — Full lifecycle workflow (10 min)

Run this end to end. Each step should visibly change the next screen.

| # | Step | Where | Expected |
|---|---|---|---|
| 4.1 | Submit generation data | Generation Data → Submit | New `GEN-2026-xxxx` appears at the top of the table |
| 4.2 | Request issuance from it | Same page | New certificate created with status **Pending Issuance**, no tx hash yet |
| 4.3 | Find it in the register | REC Certificates, filter Pending | It is there. Pending count went 6 → 7 |
| 4.4 | Issue it | Certificate detail → Issue | Status → **Active**, a tx hash and block number now exist |
| 4.5 | Run the AI scan | Dashboard → Run fraud detection | Scan log entry appears with records analysed / flagged / high counts |
| 4.6 | Open an alert | Fraud Intelligence → any Critical row | Investigation workspace opens with factors, evidence and a recommended action |
| 4.7 | Add a note | Investigation workspace | Note appears with your org and a timestamp |
| 4.8 | Rule on it — **Suspend** | Investigation workspace | Status → Suspicious, decision recorded, alert status changes |
| 4.9 | Try **Mark false positive** on another | Fraud Intelligence | Status → Active, marked False Positive, drops out of the open queue |
| 4.10 | Transfer a certificate | Certificate detail → Transfer | Owner changes, a new hop appears in the ownership chain |
| 4.11 | Check the ledger trail | Blockchain Traceability → paste the cert ID | The transfer you just made appears as a new timeline event |
| 4.12 | Retire a certificate | Certificate detail → Retire | Status → Retired, **Transfer and Retire buttons disable** |
| 4.13 | Try to transfer the retired one | Same page | Not possible — correctly locked |

**Deliberately try to break it:** submit generation data with 0 kWh, or a metered value higher than
claimed, or an empty form. It should refuse or handle it, not crash.

---

## Level 5 — Traceability & exports (5 min)

| # | Action | Expected |
|---|---|---|
| 5.1 | Traceability → enter `REC-2026-048` | Full lifecycle: generated → verified → issued → 4 transfers → flagged by AI → investigation |
| 5.2 | Enter a **generation ID** (`GEN-2026-0041`) instead | Resolves — and shows it is claimed by 3 certificates |
| 5.3 | Copy a tx hash from any certificate, paste it in | Resolves to the same certificate |
| 5.4 | Certificates → **Export CSV** | CSV downloads; open it — row count matches the filtered table, not the whole set |
| 5.5 | Apply a filter first, then export | The CSV respects the filter |
| 5.6 | Reports → download all three | Fraud intelligence report, blockchain audit trail, compliance statement — each a real file with live numbers |

---

## Level 6 — Presentation readiness (5 min)

| # | Check | Expected |
|---|---|---|
| 6.1 | Dark/light toggle on every public page | No unreadable text in either theme |
| 6.2 | Dashboard in both themes | Stays dark in both — this is intentional |
| 6.3 | Every chart | Hover shows a tooltip; legends and axis labels present |
| 6.4 | Resize to tablet (~768px) and phone (~390px) | Sidebar becomes a drawer, tables scroll horizontally inside their container, page never scrolls sideways |
| 6.5 | Zoom to 150% | Layout holds |
| 6.6 | Click every sidebar item as Regulator | All 10 load with no console errors |

---

## Known limitations — these are *not* bugs

Do not waste time testing these; be ready to answer honestly if asked.

| Behaviour | Why |
|---|---|
| Refresh wipes your changes | State is in memory. Only your login role persists. |
| Tx hashes don't verify on Etherscan | No chain is connected — hashes are generated, `'0x' + 64 random hex`. Nothing is truly immutable. |
| "Run fraud detection" finishes suspiciously fast | Scores are always current, so the scan reports real counts but doesn't recompute. |
| Any password works | No real authentication. |
| Settings sliders don't change any score | **This is a genuine gap** — thresholds are constants in `fraudEngine.js`. |
| Model accuracy is always 96.8% | Hardcoded. No model was trained; the engine is a rule system, not ML. |

---

## One-minute demo script

If you only get 60 seconds in front of a panel:

1. `/verify` → `REC-2026-002` → **clean, low risk**
2. `/verify` → `REC-2026-048` → **score 100, flagged**
3. Log in as Regulator → **Fraud Intelligence** → open the top alert → show the 5 factors with evidence
4. **Transfer `REC-2026-061` three times** → score climbs 24 → 45, a new alert appears, dashboard count goes 22 → 23

Step 4 is the one they will remember.
