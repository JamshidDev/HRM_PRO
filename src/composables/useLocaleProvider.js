
import { computed } from 'vue'
import { uzUZ, dateUzUZ, ruRU, dateRuRU, enUS, dateEnUS } from 'naive-ui'
import i18n from '@/i18n'
import {useAppStore} from "@/store/modules/index.js"

const locales = {
    uz: { lang: uzUZ, date: dateUzUZ },
    en: { lang: enUS, date: dateEnUS },
    ru: { lang: ruRU, date: dateRuRU },
}

export const useLocaleProvider = () => {
    const appStore = useAppStore()

    const theme = appStore.theme
    const localeProvider = computed(() => locales[i18n.global.locale] || locales.uz)

    return {
        theme,
        localeProvider,
    }
}