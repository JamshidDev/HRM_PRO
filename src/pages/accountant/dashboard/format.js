import Utils from '@/utils/Utils.js'

/**
 * Maketda barcha summalar mln da va bo'sh joy bilan ajratib beriladi:
 * `28152000000` → `28 152`.
 */
export const toMln = (value) =>
  Utils.formatNumberToMoney(Math.round(Number(value || 0) / 1_000_000)) || '0'

/** Maketdagi vergulli foiz: `-3.24` → `-3,2`, `17.4` → `+17,4`. */
export const toPercent = (value) => {
  const sign = value > 0 ? '+' : value < 0 ? '-' : ''
  return `${sign}${Math.abs(Number(value || 0))
    .toFixed(1)
    .replace('.', ',')}`
}
