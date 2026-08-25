// Backend `{uz, ru, en}` ko'p tilli matnini joriy til bo'yicha tanlaydi.
// Push/socket payload'idagi title va message shu shaklda keladi.

import { useAppSetting } from '@/utils/AppSetting.js'

const FALLBACK_ORDER = ['uz', 'ru', 'en']

export const pickI18nText = (value) => {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value !== 'object') return String(value)

  const lang = localStorage.getItem(useAppSetting.languageKey) || useAppSetting.defaultLanguage
  // uz_kr uchun alohida matn yo'q — o'zbekchaga tushadi.
  const primary = lang === 'uz_kr' ? 'uz' : lang
  if (value[primary]) return value[primary]
  for (const key of FALLBACK_ORDER) {
    if (value[key]) return value[key]
  }
  return ''
}
