<script setup>
import ToastProvider from "@/components/Toast/ToastProvider.vue";
import MediaViewer from '@/components/mediaViewer/MediaViewer.vue'
import themeOverrides from "./assets/theme/theme.js"
import AppLayout from "@/layouts/AppLayout.vue";
import {UIMainLoading} from "@/components/index.js"
import SignatureInstance from "@/pages/app/e-imzo/SignatureInstance.vue"
import dayjs from "dayjs";
import 'dayjs/locale/uz.js'
import 'dayjs/locale/ru.js'
import i18n from "@/i18n/index.js"
import {useAppSetting} from "@/utils/index.js"
import updateLocale from 'dayjs/plugin/updateLocale'
import { uzUZ, dateUzUZ, ruRU, dateRuRU, enUS, dateEnUS } from 'naive-ui'

dayjs.extend(updateLocale)
dayjs.updateLocale('uz', {
      months: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr',
        'Noyabr', 'Dekabr'],
      monthsShort: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr',
        'Noyabr', 'Dekabr'],
      weekdays: ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'],
      weekdaysShort: ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'],
    }
)

const localProvider = computed(()=>{
  if(i18n.global.locale==='uz'){
    return {
      lang: uzUZ,
      date: dateUzUZ,
    }
  }else if(i18n.global.locale==='en'){
    return {
      lang: enUS,
      date: dateEnUS,
    }
  }else{
    return {
      lang: ruRU,
      date: dateRuRU,
    }
  }
})

watchEffect(()=>{
  dayjs.locale(i18n.global.locale)
})

onMounted(()=>{
  i18n.global.locale = localStorage.getItem(useAppSetting.languageKey) || useAppSetting.defaultLanguage
})
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides" :locale="localProvider.lang" :date-locale="localProvider.date">
    <n-message-provider placement="top-right">
      <n-dialog-provider>
        <AppLayout/>
        <ToastProvider/>
        <MediaViewer />
        <UIMainLoading/>
        <SignatureInstance/>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

