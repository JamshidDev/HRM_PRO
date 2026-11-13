import { createI18n } from 'vue-i18n'
import uz from './locales/uz.json'
import en from './locales/en.json'
import ru from './locales/ru.json'
import uz_kr from './locales/uz_kr.json'
// Takomillashtirilayotgan lotin alifbosi (loyiha) — `node scripts/translit-uz-to-new.mjs` yasaydi
import uz_new from './locales/uz_new.json'
// Qoraqalpoq tili (lotin), beta — kaa.json'da hali yo'q yangi matnlar o'zbekchaga tushadi (fallbackLocale)
import kaa from './locales/kaa.json'

const i18n = createI18n({
  legacy: true,
  locale: 'uz',
  fallbackLocale: 'uz',
  // kaa'ga keyin qo'shilmagan kalitlar o'zbekchaga tushadi — har biri uchun konsolga ogohlantirish yozilmasin
  silentFallbackWarn: true,
  messages: {
    en,
    uz,
    ru,
    uz_kr,
    uz_new,
    kaa
  }
})

export default i18n
