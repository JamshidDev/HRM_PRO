import i18n from '@/i18n/index.js'
const { t } = i18n.global

// Task status (1..4) -> UIStatus {id, name}. UIStatus rangni id bo'yicha beradi:
// 1=warning, 2=default, 3=success, 4=error. Shu bois task kodini mos UIStatus id'ga
// xaritalaymiz (rang mos kelishi uchun).
const UI_ID = { 1: 2, 2: 1, 3: 3, 4: 4 } // yaratildi=grey, jarayonda=warning, bajarildi=success, block=error
const NAME_KEY = {
  1: 'task.status.created',
  2: 'task.status.in_progress',
  3: 'task.status.done',
  4: 'task.status.blocked'
}

export const taskStatusName = (code) => (NAME_KEY[code] ? t(NAME_KEY[code]) : '—')

// Faqat label (raqamsiz), rang id orqali.
export const taskStatusObj = (code) => ({
  id: UI_ID[code] ?? 9,
  name: taskStatusName(code)
})
