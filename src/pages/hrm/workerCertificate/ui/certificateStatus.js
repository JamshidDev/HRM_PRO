import dayjs from 'dayjs'
import i18n from '@/i18n/index.js'

const { t } = i18n.global

// Amal qilish muddati — uzaytirilgan sana bo'lsa HAQIQIY muddat o'sha.
export const validUntil = (c) => c?.extended_date || c?.expiry_date || null

// Muddat bugundan oldin tugagan bo'lsa — o'tgan (bugun hali amal qiladi).
export const isExpired = (c) => {
  const d = validUntil(c)
  return !!d && dayjs(d).isBefore(dayjs(), 'day')
}

/**
 * Guvohnomaning BITTA holati — jadval, «Ko'rish» kartalari va Lavozim guvohnomalarida bir xil chip.
 * Muhimlik tartibi: qaytarib olingan → muddati o'tgan → tasdiqlangan / tasdiqlanmagan.
 * `status.id` — UIStatus belgisi (17 / 18 — guvohnomaning o'z belgilari), `tone` — chip rangi va karta gradienti.
 */
export const certificateStatus = (c) => {
  if (!c) {
    return { status: { id: 8, name: t('workerCertificatePage.table.noCertificate') }, tone: 'neutral' }
  }
  if (c.returned) {
    return { status: { id: 18, name: t('workerCertificatePage.table.returned') }, tone: 'amber' }
  }
  if (isExpired(c)) {
    return { status: { id: 7, name: t('workerCertificatePage.table.expired') }, tone: 'red' }
  }
  if (c.verify) {
    return { status: { id: 3, name: t('workerCertificatePage.table.verify') }, tone: 'green' }
  }
  return { status: { id: 17, name: t('workerCertificatePage.modal.notVerified') }, tone: 'brand' }
}
