import dayjs from 'dayjs'

// Imzolovchilarning harakatlar tarixi (yuborildi → ko'rdi → tasdiqladi/rad etdi).
// Backend hozircha `confirmations[].histories` qaytarmaydi — kelsa o'sha ishlatiladi,
// kelmasa hujjat sanasi va imzolovchi holatidan NAMUNA (mock) tarix yasaladi.
// TODO: API `histories` qaytara boshlagach mock qismini olib tashlash.

export const EVENT = {
  sent: 'sent',
  viewed: 'viewed',
  approved: 'approved',
  rejected: 'rejected',
  resent: 'resent'
}

// status.id: 1 — jarayonda, 2 — ko'rilgan, 3 — tasdiqlangan, 4 — rad etilgan
export const STATUS = { process: 1, read: 2, success: 3, rejected: 4 }

const MOCK_REJECT_COMMENT =
  "3-bandda ko'rsatilgan Mehnat kodeksi moddalari qayta tekshirilsin, asos hujjati to'liq emas."

// Deterministik "tasodif" — har renderda vaqtlar sakrab ketmasligi uchun.
const seeded = (seed) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

const mockCertificate = (idx) => ({
  serial: (7700000 + Math.floor(seeded(idx + 11) * 99999)).toString(16).toUpperCase(),
  valid_to: dayjs().add(1 + (idx % 2), 'year').format('YYYY-MM-DD')
})

const buildMockHistory = (item, idx, baseTime) => {
  const statusId = item.status?.id
  const sentAt = baseTime.add(idx * 7 + 3, 'minute')
  const viewedAt = sentAt.add(20 + Math.floor(seeded(idx) * 90), 'minute')
  const actedAt = viewedAt.add(5 + Math.floor(seeded(idx + 3) * 40), 'minute')

  const events = [{ type: EVENT.sent, date: sentAt }]
  if (statusId === STATUS.process) return events

  events.push({ type: EVENT.viewed, date: viewedAt })

  if (statusId === STATUS.success) {
    // Birinchi imzolovchida "rad etib, qayta tasdiqlagan" ssenariy — tarix ko'rinishini
    // to'liq namoyish qilish uchun.
    if (idx === 0) {
      const rejectedAt = viewedAt.add(8, 'minute')
      events.push({ type: EVENT.rejected, date: rejectedAt, comment: MOCK_REJECT_COMMENT })
      events.push({ type: EVENT.resent, date: rejectedAt.add(2, 'hour') })
      events.push({
        type: EVENT.approved,
        date: rejectedAt.add(2, 'hour').add(25, 'minute'),
        certificate: mockCertificate(idx)
      })
    } else {
      events.push({ type: EVENT.approved, date: actedAt, certificate: mockCertificate(idx) })
    }
  }

  if (statusId === STATUS.rejected) {
    events.push({
      type: EVENT.rejected,
      date: actedAt,
      comment: item.comment || MOCK_REJECT_COMMENT
    })
  }

  return events
}

const normalizeApiHistory = (list) =>
  list.map((v) => ({
    type: v.type,
    date: dayjs(v.date ?? v.created_at),
    comment: v.comment ?? null,
    certificate: v.certificate ?? null
  }))

/**
 * @returns {{ isMock: boolean, bySigner: Array<Array<object>> }}
 */
export const buildApprovalHistory = (confirmations = [], documentCreated) => {
  const parsed = dayjs(documentCreated)
  const baseTime = parsed.isValid() ? parsed.hour(9).minute(12) : dayjs().subtract(1, 'day')
  let isMock = false

  const bySigner = confirmations.map((item, idx) => {
    if (Array.isArray(item.histories)) return normalizeApiHistory(item.histories)
    isMock = true
    return buildMockHistory(item, idx, baseTime)
  })

  return { isMock, bySigner }
}

export const lastActionDate = (events = []) => {
  const acted = [...events]
    .reverse()
    .find((e) => e.type === EVENT.approved || e.type === EVENT.rejected)
  return acted?.date ?? null
}
