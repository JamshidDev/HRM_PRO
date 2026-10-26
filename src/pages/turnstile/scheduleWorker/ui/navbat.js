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
  // per_day — bir smenada bir vaqtda nechta xodim: guruh shuncha marta katta, xodimlar kunma-kun siljiydi.
  const baseCrew = crewSizeFor(pattern)
  const perDay = Math.max(1, Number(shiftType.per_day) || 1)
  const crewSize = baseCrew * perDay
  return { pattern, crewSize: crewSize && pattern.length % crewSize === 0 ? crewSize : baseCrew }
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

// Siklning to'liq kunlari (vaqt, daqiqa bilan); «1 haftalik»da dam kunlari qo'shiladi.
export const cycleDays = (shiftType) => {
  if (!isRotating(shiftType)) return []
  const base = shiftType.days
  return shiftType.type.id === WEEKLY_TYPE ? [...base, ...base.map(() => ({ work_status: false }))] : base
}

// Naqsh qat'iy sanadan sanaladi — keyingi oy grafigi oldingisining davomi bo'ladi.
const ANCHOR = Date.UTC(2026, 0, 1)
export const cycleIndex = (date, phase, n) => {
  const d = Math.round((Date.parse(`${date}T00:00:00Z`) - ANCHOR) / 86400000)
  return (((d + phase) % n) + n) % n
}

// Oy navbati (1..n, oy 1-kuniga nisbatan) ↔ saqlanadigan qat'iy navbat (1..n, ANCHOR'ga nisbatan).
export const toAnchored = (k, monthStart, n) =>
  ((((k - 1 - cycleIndex(monthStart, 0, n)) % n) + n) % n) + 1
export const fromAnchored = (a, monthStart, n) => ((a - 1 + cycleIndex(monthStart, 0, n)) % n) + 1

// Ekipaj ichidagi o'rin fazasi: o'rinlar siklda teng qadam bilan siljiydi.
export const slotPhase = (slot, crewSize, n) => (slot % crewSize) * (n / crewSize)

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
  return bestNavbat(days, pattern)
}

// Aniq moslik topilmasa (grafik qisman o'zgargan) — kunlarning eng ko'pi mos keladigan faza.
const BEST_MATCH_RATIO = 0.6
const bestNavbat = (days, pattern) => {
  const n = pattern.length
  const filled = days.map((d, i) => [d, i]).filter(([d]) => d.id !== null)
  if (filled.length < MIN_WINDOW) return null
  const scores = Array.from({ length: n }, (_, k) =>
    filled.reduce(
      (acc, [d, i]) => acc + (pattern[(k + i) % n] === sig(d.work_status, d.start_time) ? 1 : 0),
      0
    )
  )
  const best = Math.max(...scores)
  if (best / filled.length < BEST_MATCH_RATIO) return null
  if (scores.filter((s) => s === best).length !== 1) return null
  return scores.indexOf(best) + 1
}
