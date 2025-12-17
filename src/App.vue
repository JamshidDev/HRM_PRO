<script setup>
import ToastProvider from "@/components/Toast/ToastProvider.vue";
import MediaViewer from '@/components/mediaViewer/MediaViewer.vue'

import AppLayout from "@/layouts/AppLayout.vue";
import {UIMainLoading} from "@/components/index.js"
import SignatureInstance from "@/pages/app/e-imzo/SignatureInstance.vue"
import { uzUZ, dateUzUZ, ruRU, dateRuRU, enUS, dateEnUS, }  from 'naive-ui'
import {useAppStore, useSocketStore} from "@/store/modules/index.js"
import {naiveBreakpoints} from "@/assets/theme/theme.js"
import i18n from "./i18n/index.js"
import {useAppSetting} from "@/utils/index.js"

const appStore = useAppStore()
const socketStore = useSocketStore()

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
  }else if(i18n.global.locale==='ru'){
    return {
      lang: ruRU,
      date: dateRuRU,
    }
  }
})

onMounted(()=>{
  const token = localStorage.getItem(useAppSetting.tokenKey) || null
  const userId = localStorage.getItem(useAppSetting.accountUserId) || null
  appStore.initApp()
  socketStore.initSocket(token, userId)
})

onBeforeUnmount(()=>{
  socketStore.disconnect()
})





</script>

<template>
  <n-config-provider
      :breakpoints="naiveBreakpoints"
      :theme-overrides="appStore.theme"
      :locale="localProvider.lang"
      :date-locale="localProvider.date">
    <n-message-provider placement="top-right">
      <n-dialog-provider>
        Test app
        <AppLayout/>
        <ToastProvider/>
        <MediaViewer />
        <SignatureInstance/>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
  <UIMainLoading/>
</template>

