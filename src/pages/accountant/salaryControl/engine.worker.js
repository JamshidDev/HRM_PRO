// Web Worker — og'ir engine derivatsiyasini (buildPeople/computeFindings/computeRisks,
// minglab xodim ustida) ASOSIY THREAD'dan tashqarida bajaradi → UI qotmaydi.
// engine.js faqat engine-helpers.js (sof) ga bog'liq — worker'da Vue/document kerak emas.
import { buildPeople, computeFindings, computeRisks } from './engine.js'
import { moneyFmt } from './engine-helpers.js'

self.onmessage = (e) => {
  const { id, emps, empsAudit, kpi, year, month } = e.data || {}
  try {
    const list = emps || []
    // GIBRID: people (pul) KUMULYATIV emps'dan; findings/risks (audit) OYLIK empsAudit'dan.
    const audit = empsAudit || list
    const people = buildPeople(list)
    const findings = computeFindings(audit, { fmt: moneyFmt })
    const risks = computeRisks(audit, kpi || {}, { year, month, fmt: moneyFmt })
    self.postMessage({ id, ok: true, people, findings, risks })
  } catch (err) {
    self.postMessage({ id, ok: false, error: String((err && err.message) || err) })
  }
}
