/**
 * Tabel panjarasining rang tizimi.
 *
 * Manba — Figma «HRM Railway» maketi (node 3368:103614). Har bir holat uchun
 * maketda fon va matn rangi juftligi berilgan; ular loyihaning mavjud
 * `--fig-*` tokenlariga xaritalandi (yangi rang kiritilmadi):
 *
 *   I / ish kuni   #f5fdf6 / #008838   --fig-chip-green-bg  / --fig-text-green
 *   T / ta'til     #eff8ff / #1570ef   --fig-bg-brand-surface / --fig-text-brand
 *   B / bayram     #ebf1ff / #4340be   --fig-indigo-100     / --fig-chip-indigo-text
 *   K / kasallik   #fefaf1 / #ab7d00   --fig-chip-amber-bg  / --fig-chip-amber-text
 *   Y / kelmagan   #fff7f5 / #ca1f29   --fig-red-50         / --fig-text-red
 *
 * MUHIM: kalit — backend qaytaradigan `detail.status` HARFI (tabel enum'idagi
 * `key`). Harf ro'yxatda bo'lmasa element neytral ko'rinishda chiziladi, ya'ni
 * yangi holat turi qo'shilsa jadval buzilmaydi — faqat rangsiz chiqadi.
 */
export const TimesheetStatusStyle = {
  I: 'is-work',
  T: 'is-vacation',
  B: 'is-holiday',
  K: 'is-sick',
  Y: 'is-absent'
}

/** Bir katakchada bir nechta yozuv bo'lishi mumkin — rang BIRINCHISI bo'yicha. */
export const statusClassOf = (details) => {
  const key = details?.[0]?.status
  if (!key) return null
  return TimesheetStatusStyle[String(key).toUpperCase()] ?? null
}

/**
 * Legenda — maketdagi olti element, tartibi ham o'sha
 * (`bg-*-fill` tokenlari: nuqtalar to'yingan rangda, katakcha foni esa och).
 */
export const timesheetLegend = [
  { key: 'work', color: 'var(--fig-icon-green)' },
  { key: 'rest', color: 'var(--fig-bg-tertiary)' },
  { key: 'vacation', color: 'var(--fig-bg-brand-fill)' },
  { key: 'sick', color: 'var(--fig-icon-amber)' },
  { key: 'absent', color: 'var(--fig-bg-red-fill)' },
  { key: 'holiday', color: 'var(--fig-icon-indigo)' }
]
