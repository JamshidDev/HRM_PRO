// Web Worker — og'ir engine derivatsiyasini (buildPeople/computeFindings/computeRisks,
// minglab xodim ustida) ASOSIY THREAD'dan tashqarida bajaradi → UI qotmaydi.
// engine.js faqat engine-helpers.js (sof) ga bog'liq — worker'da Vue/document kerak emas.
import { buildPeople, computeFindings, computeRisks } from './engine.js'
import { moneyFmt } from './engine-helpers.js'

self.onmessage = (e) => {
  const { id, emps, kpi, year, month } = e.data || {}
  try {
    const list = emps || []
    const people = buildPeople(list)
    const findings = computeFindings(list, { fmt: moneyFmt })
    const risks = computeRisks(list, kpi || {}, { year, month, fmt: moneyFmt })
    self.postMessage({ id, ok: true, people, findings, risks })
  } catch (err) {
    self.postMessage({ id, ok: false, error: String((err && err.message) || err) })
  }
}
