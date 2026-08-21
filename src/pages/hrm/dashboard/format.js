/**
 * Figma v3 dashboard'idagi raqam formatlari.
 *
 * Maketda barcha sonlar bo'sh joy bilan ajratiladi (`3 412`), kasrlar vergul
 * bilan yoziladi (`4,7 %`), o'zgarish esa ishorali (`+12 600`, `−14 500`).
 * Manfiy ishora tipografik minus (U+2212) — maketdagi kabi, oddiy defis emas.
 *
 * `src/pages/accountant/dashboard/format.js` bilan bir xil yondashuv.
 */
import Utils from '@/utils/Utils.js'

const MINUS = '−'

/** Bo'sh qiymatda maketda `—` turadi. */
export const toCount = (value) =>
  value === null || value === undefined
    ? '—'
    : Utils.formatNumberToMoney(value) || String(value)

/** `32.75` → `32,8` — ishora tashlanadi. */
export const toDecimal = (value, digits = 1) =>
  Math.abs(Number(value || 0))
    .toFixed(digits)
    .replace('.', ',')

/** `32.75` → `32,8 %` */
export const toPercent = (value, digits = 1) =>
  value === null || value === undefined ? '—' : `${toDecimal(value, digits)} %`

/** Butun foiz — maketda ba'zi qatorlarda kasrsiz: `87 %` */
export const toRoundPercent = (value) =>
  value === null || value === undefined ? '—' : `${Math.round(Number(value))} %`

const sign = (value) => (value > 0 ? '+' : value < 0 ? MINUS : '')

/** `12600` → `+12 600`, `-14500` → `−14 500` */
export const toSignedCount = (value) => {
  const n = Number(value || 0)
  return `${sign(n)}${Utils.formatNumberToMoney(Math.abs(n)) || '0'}`
}

/** `-0.1` → `−0,1`, `4.7` → `+4,7` */
export const toSignedDecimal = (value, digits = 1) => {
  const n = Number(value || 0)
  return `${sign(n)}${toDecimal(n, digits)}`
}

/**
 * Ulushni foizga o'giradi. Backend `percent` ni o'zi hisoblab beradi, ammo
 * mock'da yoki yig'indi kesimida qo'lda hisoblash kerak bo'lganda ishlatiladi.
 */
export const share = (value, total) => (total ? (Number(value || 0) / total) * 100 : 0)

/** Massivdagi `key` maydonlarining yig'indisi. */
export const sumBy = (list, key) =>
  (list || []).reduce((sum, item) => sum + Number(item?.[key] || 0), 0)
