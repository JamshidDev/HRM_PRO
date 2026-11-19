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
// DAS-16733: lug'at kengaytirildi — ilgari ~83% xodim "Boshqa"ga tushar edi.
// Temir yo'l sohasidagi asosiy lavozimlar kiritildi.
export function positionGroup(lav) {
  const l = normLav(lav)
  if (/boshli|o'rinbos|bosh muh|bosh his|rais|direktor|mudir|nachal/.test(l)) return 'Rahbarlar'
  if (/kuzatuvchi/.test(l)) return 'Vagon kuzatuvchilar'
  if (/hisobchi|buxgalter|iqtisod|kadrlar|xodimlar bo|kotib|arxiv|yurist|huquq/.test(l))
    return 'Hisob va kadrlar'
  if (/muhandis|muxandis/.test(l)) return 'Muhandislar'
  if (/mutaxassis|inspektor|metrolog|yo'riqchi|texnik/.test(l)) return 'Mutaxassislar'
  if (/elektromex|elektromon|elektrik|elektro|mexanik|montyor/.test(l)) return 'Elektromontyor/mexanik'
  if (/mashinist|haydovchi|shofyor|kran/.test(l)) return 'Mashinist/haydovchi'
  if (/dispetcher|navbatchi|operator|post|diktor/.test(l)) return 'Navbatchi/dispetcher'
  if (/qorovul|qo'riqchi|soqchi|post qo'riq|storoj/.test(l)) return "Qo'riqlash xizmati"
  if (/slesar|payvandchi|tokar|frezer|ta'mir|remont|montaj|ustaxona/.test(l)) return 'Ta\'mir/slesar'
  if (/yo'l usta|yo'lchi|putevoy|monter puti|balast|rels|shpal/.test(l)) return "Yo'l xo'jaligi"
  if (/farrosh|tozalovchi|hammol|yuk|skladchi|ombor|ekspeditor/.test(l)) return 'Xizmat/ombor'
  if (/qabulxona|operator.*aloqa|telefon|aloqa/.test(l)) return 'Aloqa'
  return 'Boshqa'
}

// —— Lavozim toifasi (maket cat) — 011/012 mukofot mezoni uchun ——————————
export function positionCategory(lav) {
  const l = normLav(lav)
  if (/boshli|o'rinbos|bosh muh|bosh his|rais|direktor|mudir|nachal/.test(l)) return 'Rahbar'
  if (/muhandis|muxandis|mutaxassis|iqtisod|hisobchi|buxgalter|kadrlar|inspektor|yo'riqchi|metrolog|yurist|huquq|texnik|dispetcher/.test(l))
    return 'Mutaxassis'
  if (/kuzatuvchi|elektromon|elektromex|elektrik|farrosh|ishchi|slesar|haydovchi|shofyor|mashinist|montyor|payvandchi|operator|qorovul|qo'riqchi|soqchi|navbatchi|tokar|hammol|yuk|tozalovchi|yo'lchi|yo'l usta/.test(l))
    return 'Ishchi'
  return 'Aniqlanmagan'
}

// —— Tungi smenada ishlaydigan lavozimlar (DAS-16733) —————————————————————
// 023 (tungi ish haqi) shu lavozimlarga QONUNIY — soxta "Past" holat chiqmasligi uchun.
const NIGHT_RE =
  /kuzatuvchi|qorovul|qo'riqchi|soqchi|navbatchi|dispetcher|elektromex|elektromon|elektrik|mashinist|operator|post|smenali|haydovchi|storoj|diktor|pereyezd/
export const isNightPosition = (lav) => NIGHT_RE.test(normLav(lav))

// —— Smenali / jamlangan ish vaqti hisobidagi lavozimlar (DAS-16730, Risk 9) ——
// Bu lavozimlar oy me'yoridan ortiq soat ishlashi NORMAL (sutkalik navbat) — Risk 9
// (ortiqcha ish vaqti) ularga oddiy oy-me'yor qoidasi bilan qo'llanmaydi.
const SHIFT_RE =
  /navbatchi|dispetcher|qorovul|qo'riqchi|soqchi|pereyezd|stansiya|smenali|post|storoj/
export const isShiftPosition = (lav) => SHIFT_RE.test(normLav(lav))

// —— Oy ish-soat me'yori — kalendardan (DAS-16730) ————————————————————————
// Qotirilgan 176/168 o'rniga: 5 kunlik hafta (Dush–Juma) × 8 soat, bayram kunlari
// (ish kuniga to'g'ri kelsa) ayriladi. Shaxsiy tabel me'yori kelgunча — umumiy baza.
export function monthNormHours(year, month, holidays = []) {
  const y = Number(year)
  const m = Number(month)
  if (!y || !m) return 0
  const hol = new Set(holidays)
  const days = new Date(y, m, 0).getDate()
  let wd = 0
  for (let d = 1; d <= days; d++) {
    const dow = new Date(y, m - 1, d).getDay() // 0=yakshanba, 6=shanba
    if (dow === 0 || dow === 6) continue
    const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    if (hol.has(iso)) continue
    wd++
  }
  return wd * 8
}

// O'zbekiston bayram kunlari (ish kuniga to'g'ri kelsa me'yordan chiqadi). Qat'iy sanali
// bayramlar; ko'chuvchi (hayit) kunlar kelgач qo'shiladi. 1-oktyabr — topshiriq talabiga
// ko'ra (O'qituvchi va murabbiylar kuni) me'yordan chiqariladi.
export const UZ_HOLIDAYS = [
  '2026-01-01', '2026-03-08', '2026-03-21', '2026-05-09', '2026-09-01',
  '2026-10-01', '2026-12-08'
]

// Qotirilgan tabel xatosi chegarasi — 250+ soat real emas (DAS-16730).
export const HOURS_ERROR_THRESHOLD = 250

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
