import dayjs from 'dayjs'

// Imzolovchilarning harakatlar tarixi (yuborildi → ko'rdi → tasdiqladi/rad etdi).
// Manba — FAQAT backend: `confirmations[].histories` (`document.service.ts`
// `buildConfirmationHistory`). Ilgari bu yerda backend qaytarmaganda NAMUNA (mock)
// tarix yasalardi — u har hujjatda mavjud bo'lmagan «rad etish» va o'ylab topilgan
// sertifikat raqamini ko'rsatardi, shuning uchun olib tashlandi.

export const EVENT = {
  sent: 'sent',
  viewed: 'viewed',
  approved: 'approved',
  rejected: 'rejected',
  resent: 'resent'
}

// status.id: 1 — jarayonda, 2 — ko'rilgan, 3 — tasdiqlangan, 4 — rad etilgan
export const STATUS = { process: 1, read: 2, success: 3, rejected: 4 }

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
export const buildApprovalHistory = (confirmations = []) => {
  // Backend tarix bermasa — bo'sh qoldiramiz (soxta ma'lumot ko'rsatilmaydi).
  const bySigner = confirmations.map((item) =>
    Array.isArray(item.histories) ? normalizeApiHistory(item.histories) : []
  )
  return { isMock: false, bySigner }
}

export const lastActionDate = (events = []) => {
  const acted = [...events]
    .reverse()
    .find((e) => e.type === EVENT.approved || e.type === EVENT.rejected)
  return acted?.date ?? null
}
