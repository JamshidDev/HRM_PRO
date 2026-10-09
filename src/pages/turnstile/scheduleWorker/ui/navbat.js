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
