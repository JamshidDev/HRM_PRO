// Engine derivatsiyasini Web Worker'da bajaruvchi klient.
// Worker yaratib bo'lmasa yoki yiqilsa — SINXRON fallback (asosiy thread, qotishi mumkin,
// lekin natija doimo chiqadi). Shunday qilib worker ishlamaydigan muhitda ham buzilmaydi.
import { buildPeople, computeFindings, computeRisks } from './engine.js'
import { moneyFmt } from './engine-helpers.js'

let worker = null
let seq = 0
let broken = false
const pending = new Map()

function ensureWorker() {
  if (broken) return null
  if (worker) return worker
  try {
    worker = new Worker(new URL('./engine.worker.js', import.meta.url), { type: 'module' })
    worker.onmessage = (e) => {
      const { id, ok, people, findings, risks, error } = e.data || {}
      const r = pending.get(id)
      if (!r) return
      pending.delete(id)
      if (ok) r.resolve({ people, findings, risks })
      else r.reject(new Error(error || 'worker error'))
    }
    worker.onerror = (ev) => {
      console.error('[sc-worker] onerror:', ev?.message || ev?.filename || ev)
      broken = true
      for (const [, r] of pending) r.reject(new Error('worker failed'))
      pending.clear()
      try {
        worker.terminate()
      } catch {
        /* noop */
      }
      worker = null
    }
  } catch (e) {
    console.error('[sc-worker] construct failed:', e?.message || e)
    broken = true
    return null
  }
  return worker
}

function computeSync(payload) {
  const list = payload.emps || []
  // GIBRID: people (pul) KUMULYATIV emps'dan; findings/risks (audit) OYLIK empsAudit'dan.
  const audit = payload.empsAudit || list
  return {
    people: buildPeople(list),
    findings: computeFindings(audit, { fmt: moneyFmt }),
    risks: computeRisks(audit, payload.kpi || {}, {
      year: payload.year,
      month: payload.month,
      fmt: moneyFmt
    })
  }
}

// { emps, kpi, year, month } → Promise<{ people, findings, risks }>
// Diagnostika: oxirgi hisob qayerda bo'lganini belgilaymiz (worker | sync).
function mark(mode) {
  try {
    if (typeof window !== 'undefined') window.__scEngineMode = mode
  } catch {
    /* noop */
  }
}

// Katta `emps` arrayni bitta postMessage'da klonlash asosiy thread'ni ~1s qotiradi.
// Shuning uchun BO'LAK-BO'LAK (chunk) yuboramiz va har bo'lak orasida event-loop'ga
// yield beramiz → bitta uzun blok o'rniga qisqa bo'laklar, UI javob berib turadi.
const CHUNK = 400

function yieldToLoop() {
  return new Promise((r) => setTimeout(r, 0))
}

async function sendChunked(w, id, payload) {
  const emps = payload.emps || []
  const auditRaw = payload.empsAudit || emps
  const auditSame = auditRaw === emps // oddiy rejimda audit === emps → ikki marta yubormaymiz
  w.postMessage({
    id,
    type: 'init',
    auditSame,
    kpi: payload.kpi || {},
    year: payload.year,
    month: payload.month
  })
  for (let i = 0; i < emps.length; i += CHUNK) {
    w.postMessage({ id, type: 'emps', chunk: emps.slice(i, i + CHUNK) })
    if (i + CHUNK < emps.length) await yieldToLoop()
  }
  if (!auditSame) {
    for (let i = 0; i < auditRaw.length; i += CHUNK) {
      w.postMessage({ id, type: 'audit', chunk: auditRaw.slice(i, i + CHUNK) })
      if (i + CHUNK < auditRaw.length) await yieldToLoop()
    }
  }
  w.postMessage({ id, type: 'done' })
}

export function computeDashboard(payload) {
  const w = ensureWorker()
  if (!w) {
    mark('sync')
    return Promise.resolve(computeSync(payload))
  }
  const id = ++seq
  const p = new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
  })
  // Bo'laklarni ketma-ket yuboramiz; yuborishda xato bo'lsa — shu id'ni rad etamiz.
  sendChunked(w, id, payload).catch((err) => {
    const r = pending.get(id)
    if (r) {
      pending.delete(id)
      r.reject(err instanceof Error ? err : new Error('postMessage failed'))
    }
  })
  return p
    .then((r) => {
      mark('worker')
      return r
    })
    .catch((e) => {
      console.error('[sc-worker] fallback->sync:', e?.message || e)
      mark('sync')
      return computeSync(payload)
    })
}
