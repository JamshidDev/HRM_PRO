// Tarif setkasi ILOVALARI (annex) — backend annex.config.ts bilan bir xil qat'iy tuzilma.
// Har ilovada razryad/guruh qat'iy; ba'zisida bitta koef, ba'zisida (1-ilova) kategoriyalar.

export const GROUPS = [0, 1, 2, 3]

// Yangi (dinamik) setka create formasi uchun standart razryad ro'yxati (satrlar).
export const DEFAULT_RANKS = [
  '1', '2', '3', '4', '4x', '5', '6', '7', '8', '9', '10', '10x',
  '11', '12', '12x', '13', '14', '15', '15x', '16', '17', '18'
]

const FULL_RANKS = [
  '2', '3', '4', '4x', '5', '6', '7', '8', '9', '10', '10x',
  '11', '12', '12x', '13', '14', '15', '15x', '16', '17', '18'
]
// 1-ilova (ishchi-xodimlar) — hujjatda 1..8 (+ Umumiy profil uchun 4x).
const WORKER_RANKS = ['1', '2', '3', '4', '4x', '5', '6', '7', '8']
const DISPATCHER_RANKS = ['10', '10x', '11', '12', '12x', '13']
const SINGLE = [{ key: 1, name: '' }]

export const ANNEXES = [
  {
    code: '1',
    name: '1-ilova — ishchi-xodimlar',
    groups: GROUPS,
    ranks: WORKER_RANKS,
    categories: [
      { key: 1, name: '1-b. Poezd harakati' },
      { key: 2, name: '2-b. Ekspluatatsiya' },
      { key: 3, name: '3-b. Qurilish' },
      { key: 4, name: '4-b. Avtotransport' },
      { key: 5, name: '5-b. Umumiy profil' }
    ]
  },
  { code: '2', name: '2-ilova — rahbar/mutaxassis/texnik', groups: GROUPS, ranks: FULL_RANKS, categories: SINGLE },
  { code: '4', name: '4-ilova — dispetcherlar', groups: GROUPS, ranks: DISPATCHER_RANKS, categories: SINGLE }
]

export const annexByCode = (code) => ANNEXES.find((a) => a.code === code)
