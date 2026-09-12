/** Client-side export helpers: audit reports and CSV extracts. */

function download(filename, content, mime) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

const line = (label, value) => label.padEnd(26, ' ') + ': ' + value

export function downloadReport(cert, ledger, meta = {}) {
  const rows = [
    '='.repeat(72),
    'RENEWABLE ENERGY INTELLIGENCE — CERTIFICATE VERIFICATION REPORT',
    '='.repeat(72),
    '',
    line('Report generated', new Date().toUTCString()),
    line('Issued by', meta.issuedBy || 'REI Verification Service'),
    line('Report reference', 'VR-' + cert.id.replace(/\D/g, '') + '-' + Date.now().toString().slice(-5)),
    '',
    '-'.repeat(72),
    'CERTIFICATE',
    '-'.repeat(72),
    line('Certificate ID', cert.id),
    line('Generation record', cert.generationId),
    line('Producer', cert.producerName + ' (' + cert.producerId + ')'),
    line('Energy source', cert.source),
    line('Location', cert.location || '—'),
    line('Energy claimed', cert.claimedKWh.toLocaleString() + ' kWh'),
    line('Energy metered', cert.meteredKWh.toLocaleString() + ' kWh'),
    line('Variance', (cert.claimedKWh - cert.meteredKWh).toLocaleString() + ' kWh'),
    line('Generation date', new Date(cert.generationDate).toUTCString()),
    line('Issuance date', new Date(cert.issuanceDate).toUTCString()),
    line('Vintage', cert.vintage),
    line('Current owner', cert.owner),
    line('Status', cert.status),
    line('Blockchain tx', cert.txHash || 'not yet registered'),
    line('Block number', cert.blockNumber ? '#' + cert.blockNumber : '—'),
    '',
    '-'.repeat(72),
    'AI RISK ASSESSMENT',
    '-'.repeat(72),
    line('Risk score', cert.score + ' / 100'),
    line('Risk level', cert.level),
    line('Model confidence', cert.confidence + '%'),
    line('Primary fraud type', cert.primaryType || 'None detected'),
    '',
    'Contributing factors:',
    ...(cert.factors && cert.factors.length
      ? cert.factors.map(
          (f, i) =>
            '  ' + (i + 1) + '. [' + f.weight.toFixed(1) + ' pts] ' + f.label + '\n     ' + f.detail
        )
      : ['  None — certificate passed all automated integrity checks.']),
    '',
    '-'.repeat(72),
    'BLOCKCHAIN LEDGER TRAIL',
    '-'.repeat(72),
    ...(ledger || []).map(
      (e) =>
        new Date(e.date).toISOString().slice(0, 19).replace('T', ' ') +
        '  ' +
        e.label.padEnd(24, ' ') +
        '  block #' +
        e.block +
        '\n' +
        '                     ' +
        e.org +
        '\n' +
        '                     tx ' +
        e.txHash
    ),
    '',
    ...(cert.transfers && cert.transfers.length
      ? [
          '-'.repeat(72),
          'OWNERSHIP CHAIN',
          '-'.repeat(72),
          ...cert.transfers.map(
            (t, i) =>
              '  ' +
              (i + 1) +
              '. ' +
              new Date(t.date).toISOString().slice(0, 10) +
              '  ' +
              t.from +
              ' -> ' +
              t.to +
              '  ($' +
              t.priceUSD +
              '/MWh)'
          ),
          '',
        ]
      : []),
    '='.repeat(72),
    'This report is generated from an immutable distributed ledger. Any party',
    'may independently re-verify the transaction hashes above against the',
    'rei-energy-channel network.',
    '',
    'DEMONSTRATION ENVIRONMENT — all data in this report is synthetic.',
    '='.repeat(72),
  ]
  download(cert.id + '-verification-report.txt', rows.join('\n'), 'text/plain;charset=utf-8')
}

export function downloadCSV(filename, columns, rows) {
  const esc = (v) => {
    const s = v == null ? '' : String(v)
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
  }
  const head = columns.map((c) => esc(c.label)).join(',')
  const body = rows
    .map((r) => columns.map((c) => esc(typeof c.get === 'function' ? c.get(r) : r[c.key])).join(','))
    .join('\n')
  download(filename, head + '\n' + body, 'text/csv;charset=utf-8')
}

export function downloadAuditPack(title, sections) {
  const out = [
    '='.repeat(72),
    'RENEWABLE ENERGY INTELLIGENCE — ' + title.toUpperCase(),
    '='.repeat(72),
    line('Generated', new Date().toUTCString()),
    '',
  ]
  sections.forEach((s) => {
    out.push('-'.repeat(72), s.heading.toUpperCase(), '-'.repeat(72))
    s.lines.forEach((l) => out.push(l))
    out.push('')
  })
  out.push('DEMONSTRATION ENVIRONMENT — all data is synthetic.', '='.repeat(72))
  download(
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + new Date().toISOString().slice(0, 10) + '.txt',
    out.join('\n'),
    'text/plain;charset=utf-8'
  )
}
