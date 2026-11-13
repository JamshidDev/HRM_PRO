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
  return {
    people: buildPeople(list),
    findings: computeFindings(list, { fmt: moneyFmt }),
    risks: computeRisks(list, payload.kpi || {}, {
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

export function computeDashboard(payload) {
  const w = ensureWorker()
  if (!w) {
    mark('sync')
    return Promise.resolve(computeSync(payload))
  }
  return new Promise((resolve, reject) => {
    const id = ++seq
    pending.set(id, { resolve, reject })
    try {
      w.postMessage({ id, ...payload })
    } catch {
      pending.delete(id)
      reject(new Error('postMessage failed'))
    }
  })
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
