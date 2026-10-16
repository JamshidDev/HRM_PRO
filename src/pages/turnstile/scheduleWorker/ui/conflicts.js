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
  sim.set(
    Number(a),
    rowA.days.map((d) => (inRange(d.date) ? (dayOf(rowB, d.date) ?? emptyDay(d.date)) : d))
  )
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
