// Almashishdan keyin bir guruhda soatlar kesishishini topadi (bloklamaydi — faqat ogohlantirish uchun).
const DAY = 24 * 60

const minutesOf = (hhmm) => {
  const [h, m] = String(hhmm).slice(0, 5).split(':').map(Number)
  return h * 60 + m
}

const dayIndex = (date) => Math.round(Date.parse(`${date}T00:00:00Z`) / 86400000)

// Ish kuni → [boshlanish, tugash) daqiqada; tugash <= boshlanish bo'lsa ertasiga o'tadi. 00:00–00:00 noaniq — o'tkaziladi.
const intervalOf = (d) => {
  if (!d || d.id === null || !Number(d.work_status) || !d.start_time || !d.end_time) return null
  const s = minutesOf(d.start_time)
  let e = minutesOf(d.end_time)
  if (s === e) return null
  if (e < s) e += DAY
  const base = dayIndex(d.date) * DAY
  return { from: base + s, to: base + e, date: d.date, start: d.start_time, end: d.end_time }
}

const emptyDay = (date) => ({ id: null, date, work_status: false, start_time: null, end_time: null })

// list — schedule-workers javobi; crewMap — { wp: { key, title } }; a/b — almashayotgan lavozimlar; from..to — sanalar.
export const findSwapConflicts = ({ list, crewMap, a, b, from, to }) => {
  const rows = new Map(list.map((v) => [Number(v.worker_position_id), v]))
  const rowA = rows.get(Number(a))
  if (!rowA) return []
  const inRange = (date) => date >= from && date <= to
  const dayOf = (row, date) => row?.days?.find((d) => d.date === date)

  // Almashishdan keyingi kunlar.
  const sim = new Map([...rows].map(([wp, r]) => [wp, r.days]))
  const rowB = rows.get(Number(b))
  // b = -1 — sherik yo'q (bitta kun tahriri): A ning kunlari o'zgartirilgan holicha qoladi.
  if (Number(b) !== -1) {
    sim.set(
      Number(a),
      rowA.days.map((d) => (inRange(d.date) ? (dayOf(rowB, d.date) ?? emptyDay(d.date)) : d))
    )
  }
  if (rowB) {
    sim.set(
      Number(b),
      rowB.days.map((d) => (inRange(d.date) ? (dayOf(rowA, d.date) ?? emptyDay(d.date)) : d))
    )
  }

  // Tekshiriladigan kunlar: oraliq ±1 kun (tungi smena qo'shni kunga o'tadi).
  const lo = dayIndex(from) - 1
  const hi = dayIndex(to) + 1
  const crews = new Set([crewMap[a]?.key, crewMap[b]?.key].filter(Boolean))
  const out = []
  for (const key of crews) {
    const members = Object.entries(crewMap)
      .filter(([, c]) => c.key === key)
      .map(([wp, c]) => ({ wp: Number(wp), title: c.title, name: c.name }))
    const items = []
    for (const m of members) {
      for (const d of sim.get(m.wp) ?? []) {
        const i = dayIndex(d.date)
        if (i < lo || i > hi) continue
        const iv = intervalOf(d)
        if (iv) items.push({ ...iv, name: m.name, title: m.title, wp: m.wp })
      }
    }
    items.sort((x, y) => x.from - y.from)
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length && items[j].from < items[i].to; j++) {
        if (items[j].wp === items[i].wp) continue
        // Faqat almashish o'zgartirgan kunlar (eski kesishmalar ko'rsatilmaydi).
        const changed = (x) => (x.wp === Number(a) || x.wp === Number(b)) && inRange(x.date)
        if (!changed(items[i]) && !changed(items[j])) continue
        out.push({ date: items[j].date, title: items[i].title, first: items[i], second: items[j] })
      }
    }
  }
  return out
}

// Bitta kun o'zgarganda (plan) shu xodim guruhida kesishma bormi.
export const findDayConflicts = ({ list, crewMap, wp, date, plan }) => {
  const row = list.find((v) => Number(v.worker_position_id) === Number(wp))
  if (!row) return []
  const patched = {
    ...row,
    days: row.days.map((d) =>
      d.date === date ? { ...d, id: d.id ?? -1, work_status: plan.work_status ? 1 : 0, start_time: plan.start_time, end_time: plan.end_time } : d
    )
  }
  const others = list.filter((v) => v !== row)
  // Almashish tekshiruvchisidan foydalanamiz: sherik yo'q, faqat shu kun o'zgargan.
  return findSwapConflicts({ list: [patched, ...others], crewMap, a: wp, b: -1, from: date, to: date })
}

// Shu o'zgarish yangi paydo qilgan bo'shliqlar: guruhda smena turining biror smenasida hech kim qolmagan kun.
// before/after — { wp: days[] }; shifts — smena turidagi ish smenalari [{start,end}].
export const findNewGaps = ({ before, after, crewMap, wps, dates, shifts }) => {
  if (!shifts?.length) return []
  const sig = (d) => (d && d.id !== null && Number(d.work_status) ? `${String(d.start_time).slice(0, 5)}-${String(d.end_time).slice(0, 5)}` : null)
  const keys = new Set(wps.map((w) => crewMap[w]?.key).filter(Boolean))
  const out = []
  for (const key of keys) {
    const members = Object.entries(crewMap).filter(([, c]) => c.key === key)
    const title = members[0]?.[1]?.title
    for (const date of dates) {
      const covered = (src) =>
        new Set(members.map(([wp]) => sig((src[wp] ?? []).find((d) => d.date === date))).filter(Boolean))
      const was = covered(before)
      const now = covered(after)
      for (const s of shifts) {
        const k = `${s.start}-${s.end}`
        if (was.has(k) && !now.has(k)) out.push({ date, title, shift: `${s.start}–${s.end}` })
      }
    }
  }
  return out
}
