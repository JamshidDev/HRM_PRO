import { createI18n } from 'vue-i18n'
import uz from './locales/uz.json'
import en from './locales/en.json'
import ru from './locales/ru.json'
import uz_kr from './locales/uz_kr.json'

const i18n = createI18n({
  legacy: true,
  locale: 'uz',
  fallbackLocale: 'uz',
  messages: {
    en,
    uz,
    ru,
    uz_kr
  }
})

export default i18n
