// Web Worker — og'ir engine derivatsiyasini (buildPeople/computeFindings/computeRisks,
// minglab xodim ustida) ASOSIY THREAD'dan tashqarida bajaradi → UI qotmaydi.
// engine.js faqat engine-helpers.js (sof) ga bog'liq — worker'da Vue/document kerak emas.
//
// MA'LUMOT BO'LAKLAB (chunk) keladi: asosiy thread katta `emps` arrayni bitta postMessage'da
// klonlab qotib qolmasligi uchun klient uni bo'lak-bo'lak yuboradi. Worker bu yerda to'playdi,
// 'done' signalida bir marta derivatsiya qiladi.
import { buildPeople, computeFindings, computeRisks } from './engine.js'
import { moneyFmt } from './engine-helpers.js'

const buffers = new Map() // id -> { emps, audit, auditSame, kpi, year, month }

function pushAll(dst, chunk) {
  // spread (push(...chunk)) katta bo'lakda stack overflow berishi mumkin — oddiy sikl.
  for (let i = 0; i < chunk.length; i++) dst.push(chunk[i])
}

self.onmessage = (e) => {
  const m = e.data || {}
  const { id, type } = m
  try {
    if (type === 'init') {
      buffers.set(id, {
        emps: [],
        audit: [],
        auditSame: !!m.auditSame,
        kpi: m.kpi || {},
        year: m.year,
        month: m.month
      })
      return
    }
    const buf = buffers.get(id)
    if (!buf) return
    if (type === 'emps') {
      pushAll(buf.emps, m.chunk || [])
      return
    }
    if (type === 'audit') {
      pushAll(buf.audit, m.chunk || [])
      return
    }
    if (type === 'done') {
      buffers.delete(id)
      // GIBRID: people (pul) KUMULYATIV emps'dan; findings/risks (audit) OYLIK audit'dan.
      const list = buf.emps
      const audit = buf.auditSame ? list : buf.audit
      const people = buildPeople(list)
      const findings = computeFindings(audit, { fmt: moneyFmt })
      const risks = computeRisks(audit, buf.kpi, { year: buf.year, month: buf.month, fmt: moneyFmt })
      self.postMessage({ id, ok: true, people, findings, risks })
      return
    }
  } catch (err) {
    buffers.delete(id)
    self.postMessage({ id, ok: false, error: String((err && err.message) || err) })
  }
}
