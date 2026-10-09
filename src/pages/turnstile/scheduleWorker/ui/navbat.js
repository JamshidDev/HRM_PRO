// Aylanma smenada xodim navbatini kunlaridan aniqlash (naqsh siljishi bo'yicha).
const SHIFT_TYPE = 1
// «1 haftalik»: naqshdagi ish kunlaridan keyin xuddi shuncha dam kunlari.
const WEEKLY_TYPE = 4
// Qisqa oraliqdan ham navbat aniqlanadi (oy o'rtasida kelgan/ketgan xodim).
const MIN_WINDOW = 3

const sig = (isWork, start) => (isWork ? `W${(start || '').slice(0, 5)}` : '-')

export const isRotating = (shiftType) =>
  [SHIFT_TYPE, WEEKLY_TYPE].includes(shiftType?.type?.id) && Array.isArray(shiftType?.days)

// Aylanma sikl: pattern (kunlar imzosi) va ekipaj soni (bitta postni nechi kishi ushlaydi).
export const cycleOf = (shiftType) => {
  if (!isRotating(shiftType)) return { pattern: [], crewSize: 0 }
  const base = shiftType.days.map((d) => sig(d.work_status, d.start_time))
  const pattern =
    shiftType.type.id === WEEKLY_TYPE ? [...base, ...base.map(() => '-')] : base
  return { pattern, crewSize: crewSizeFor(pattern) }
}

// Har bir smena vaqti har kuni bitta odam bilan qoplanishi uchun kerakli xodimlar soni.
const crewSizeFor = (pattern) => {
  const n = pattern.length
  const counts = {}
  for (const p of pattern) if (p !== '-') counts[p] = (counts[p] ?? 0) + 1
  const size = Math.max(0, ...Object.values(counts).map((c) => Math.ceil(n / c)))
  // Sikl ekipajga teng bo'linmasa — har faza alohida navbat.
  return size && n % size === 0 ? size : n
}

export const patternOf = (shiftType) => cycleOf(shiftType).pattern

// Smena turi necha kishilik (kunlik/maxsus turlarda — null).
export const crewSizeOf = (shiftType) => cycleOf(shiftType).crewSize || null

// days: API kunlari ({ id, work_status, start_time }); qaytaradi siklda faza 1..n yoki null.
export const navbatOf = (days, pattern) => {
  const n = pattern.length
  if (!n || !days?.length) return null
  let i0 = 0
  while (i0 < days.length) {
    if (days[i0].id === null) {
      i0++
      continue
    }
    let len = 0
    while (i0 + len < days.length && days[i0 + len].id !== null && len < n) len++
    if (len >= Math.min(n, MIN_WINDOW)) {
      const seq = days.slice(i0, i0 + len).map((d) => sig(d.work_status, d.start_time))
      const hits = []
      for (let k = 0; k < n; k++) {
        if (seq.every((s, j) => pattern[(k + j) % n] === s)) hits.push(k)
      }
      if (hits.length === 1) return ((((hits[0] - i0) % n) + n) % n) + 1
    }
    i0 += Math.max(len, 1)
  }
  return null
}
