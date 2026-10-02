// Oylik nazorati dashboard — umumiy yordamchi funksiyalar (bo'lim komponentlari
// shulardan foydalanadi). Maketdagi (oylik_nazorat_dashboard_5.html) sof
// funksiyalarning idiomatik ko'chirmasi.

import Utils from '@/utils/Utils.js'

// —— Formatlash ——————————————————————————————————————————————————————
// To'liq son (so'm) — mavjud Utils bilan.
export const money = (v) => Utils.formatNumberToMoney(Math.round(Number(v) || 0))
// Mln so'mda, 1 kasr xona (grafik o'qlari/tooltip uchun).
export const mln = (v) => (Number(v) || 0) / 1e6
export const mlnText = (v) => {
  const m = mln(v)
  return (Math.abs(m) >= 100 ? Math.round(m) : m.toFixed(1)) + ' mln'
}

// —— Lavozim guruhlari (maket grpOf) ———————————————————————————————————
export function positionGroup(lav) {
  const l = (lav || '').toLowerCase()
  if (/boshli|boshlig|bosh muh|bosh his|o‘rinbos|o'rinbos/.test(l)) return 'Rahbarlar'
  if (/kuzatuvchi/.test(l)) return 'Vagon kuzatuvchilar'
  if (/hisobchi|iqtisod|xodimlar bo/.test(l)) return 'Hisob va kadrlar'
  if (/muhandis|muxandis/.test(l)) return 'Muhandislar'
  if (/mutaxassis/.test(l)) return 'Mutaxassislar'
  if (/elektro|mexanik/.test(l)) return 'Elektromontyor/mexanik'
  return 'Boshqa'
}

// —— Lavozim toifasi (maket cat) — 011/012 mukofot mezoni uchun ——————————
export function positionCategory(lav) {
  const l = (lav || '').toLowerCase()
  if (/boshli|boshlig|o‘rinbos|o'rinbos|bosh muh|bosh his/.test(l)) return 'Rahbar'
  if (/muhandis|muxandis|mutaxassis|iqtisod|hisobchi|yo‘riqchi|yo'riqchi|metrolog/.test(l))
    return 'Mutaxassis'
  if (/kuzatuvchi|elektromon|elektromex|farrosh|ishchi|slesar|haydovchi|mashinist/.test(l))
    return 'Ishchi'
  return 'Aniqlanmagan'
}

// —— JSHSHIR (pin) → yosh + jins (maket age). Sanaga nisbatan (davr oxiri) ——
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

// —— Xavf darajasi → fig rang tokeni ————————————————————————————————————
export const SEV_TOKENS = {
  Yuqori: '--fig-icon-red',
  'O‘rta': '--fig-icon-orange',
  Past: '--fig-icon-amber'
}

// —— echarts uchun tema ranglarini o'qish (dark/light avtomatik) ————————
// appStore.isDark ni computed ichida chaqirib, reaktivlik trigger qiling.
export function tokenColor(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

// Grafiklar uchun umumiy palitra (fig tokenlaridan).
export function chartPalette() {
  return [
    tokenColor('--fig-icon-brand') || '#2e90fa',
    tokenColor('--fig-icon-orange') || '#e8641c',
    tokenColor('--fig-icon-green') || '#159c5b',
    tokenColor('--fig-icon-indigo') || '#7f7af0',
    tokenColor('--fig-icon-amber') || '#b88a00',
    tokenColor('--fig-icon-red') || '#e5383b'
  ]
}

// echarts asosiy o'q/grid ranglari (tema bo'yicha).
export function chartTheme() {
  return {
    text: tokenColor('--fig-text-tertiary') || '#98a2b3',
    textStrong: tokenColor('--fig-text-primary') || '#101828',
    line: tokenColor('--fig-br-disable') || tokenColor('--fig-br-primary') || '#344054',
    tooltipBg: tokenColor('--fig-block-bg') || '#1d2939'
  }
}
