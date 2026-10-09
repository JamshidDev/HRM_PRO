// Aylanma smenada xodim navbatini kunlaridan aniqlash (naqsh siljishi bo'yicha).
const SHIFT_TYPE = 1

const sig = (isWork, start) => (isWork ? `W${(start || '').slice(0, 5)}` : '-')

export const isRotating = (shiftType) => shiftType?.type?.id === SHIFT_TYPE

export const patternOf = (shiftType) =>
  Array.isArray(shiftType?.days) ? shiftType.days.map((d) => sig(d.work_status, d.start_time)) : []

// days: API kunlari ({ id, work_status, start_time }); qaytaradi 1..n yoki null (aniqlanmasa).
export const navbatOf = (days, pattern) => {
  const n = pattern.length
  if (!n || !days?.length) return null
  for (let i0 = 0; i0 + n <= days.length; i0++) {
    const win = days.slice(i0, i0 + n)
    if (win.some((d) => d.id === null)) continue
    const seq = win.map((d) => sig(d.work_status, d.start_time))
    const hits = []
    for (let k = 0; k < n; k++) {
      if (seq.every((s, j) => pattern[(k + j) % n] === s)) hits.push(k)
    }
    if (hits.length !== 1) return null
    return ((((hits[0] - i0) % n) + n) % n) + 1
  }
  return null
}

// Navbatlar bo'yicha sonlar va bo'sh o'rinlar (eng ko'p to'lgan navbatga nisbatan).
export const navbatSummary = (list, pattern) => {
  const n = pattern.length
  const counts = Array.from({ length: n }, () => 0)
  let unknown = 0
  for (const w of list) {
    const k = navbatOf(w.days, pattern)
    if (k) counts[k - 1]++
    else unknown++
  }
  const max = Math.max(0, ...counts)
  const empty = counts.reduce((s, c) => s + (max - c), 0)
  return { counts, unknown, empty }
}

// Bo'lim × navbat: har bo'limda to'liq ekipajlar (eng kam navbat) va yetishmayotgan o'rinlar.
export const departmentCrews = (list, pattern) => {
  const n = pattern.length
  const map = new Map()
  for (const w of list) {
    const k = navbatOf(w.days, pattern)
    if (!k) continue
    const key = w.department_name || '—'
    if (!map.has(key)) map.set(key, Array.from({ length: n }, () => 0))
    map.get(key)[k - 1]++
  }
  return [...map.entries()]
    .map(([name, counts]) => {
      const max = Math.max(...counts)
      return {
        name,
        counts,
        full: Math.min(...counts),
        missing: counts.reduce((s, c) => s + (max - c), 0)
      }
    })
    .sort((a, b) => b.missing - a.missing || a.name.localeCompare(b.name))
}
