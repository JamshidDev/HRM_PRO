// Oylik nazorati — SOF yordamchilar (Vue/Utils/i18n'ga bog'liq EMAS).
// engine.js shu moduldan oladi → engine'ni Web Worker'da ishlatish mumkin
// (worker'da `window`/`document`/Vue yo'q). helpers.js bularni re-export qiladi.

// ECharts canvas shriftida `ʻ ‘ ’` buzilib chiqadi — ularни oddiy apostrofga keltiramiz.
export const normText = (s) =>
  String(s ?? '')
    .replace(/[ʻʼ‘’`´]/g, "'")
    .replace(/ИНПС/g, 'INPS')

// Lavozim matnini moslashtirish: apostrof variantlari (ʻ ‘ ’ ` ´) → ' + kichik harf.
const normLav = (lav) => normText(lav).toLowerCase()

// —— Lavozim guruhlari (maket grpOf) ———————————————————————————————————
export function positionGroup(lav) {
  const l = normLav(lav)
  if (/boshli|o'rinbos|bosh muh|bosh his|rais|direktor|mudir/.test(l)) return 'Rahbarlar'
  if (/kuzatuvchi/.test(l)) return 'Vagon kuzatuvchilar'
  if (/hisobchi|iqtisod|kadrlar|xodimlar bo/.test(l)) return 'Hisob va kadrlar'
  if (/muhandis|muxandis/.test(l)) return 'Muhandislar'
  if (/mutaxassis/.test(l)) return 'Mutaxassislar'
  if (/elektro|mexanik/.test(l)) return 'Elektromontyor/mexanik'
  return 'Boshqa'
}

// —— Lavozim toifasi (maket cat) — 011/012 mukofot mezoni uchun ——————————
export function positionCategory(lav) {
  const l = normLav(lav)
  if (/boshli|o'rinbos|bosh muh|bosh his|rais|direktor|mudir/.test(l)) return 'Rahbar'
  if (/muhandis|muxandis|mutaxassis|iqtisod|hisobchi|kadrlar|inspektor|yo'riqchi|metrolog/.test(l))
    return 'Mutaxassis'
  if (/kuzatuvchi|elektromon|elektromex|farrosh|ishchi|slesar|haydovchi|mashinist|montyor|payvandchi|operator/.test(l))
    return 'Ishchi'
  return 'Aniqlanmagan'
}

// —— JSHSHIR (pin) → yosh + jins. Davr oxiriga (default 2026-08-31) nisbatan.
export function pinAgeSex(pin, refYear = 2026, refMonthIndex = 7, refDay = 31) {
  const j = String(pin || '')
  if (j.length < 7) return { age: null, sex: null }
  const g = +j[0]
  const d = +j.slice(1, 3)
  const m = +j.slice(3, 5)
  const y = +j.slice(5, 7)
  const century = g <= 2 ? 1800 : g <= 4 ? 1900 : 2000
  const birth = new Date(century + y, m - 1, d)
  const ref = new Date(refYear, refMonthIndex, refDay)
  let age = ref.getFullYear() - birth.getFullYear()
  if (ref < new Date(ref.getFullYear(), m - 1, d)) age--
  return { age, sex: g % 2 ? 'Erkak' : 'Ayol' }
}

// Pul formati — SOF (Intl), Utils'siz (worker ichida fmt sifatida ishlatiladi).
export const moneyFmt = (v) =>
  new Intl.NumberFormat('ru-RU').format(Math.round(Number(v) || 0))
