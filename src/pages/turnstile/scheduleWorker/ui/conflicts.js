// Almashish/kun tahriridan keyin guruhda bo'sh qolgan smenalarni topadi (bloklamaydi — faqat ogohlantirish).
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
