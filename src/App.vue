<script setup>
import ToastProvider from "@/components/Toast/ToastProvider.vue";
import MediaViewer from '@/components/mediaViewer/MediaViewer.vue'
import AppLayout from "@/layouts/AppLayout.vue";
import {UIMainLoading} from "@/components/index.js"
import SignatureInstance from "@/pages/app/e-imzo/SignatureInstance.vue"
import i18n from "@/i18n/index.js"
import { uzUZ, dateUzUZ, ruRU, dateRuRU, enUS, dateEnUS } from 'naive-ui'
import {useAppStore} from "@/store/modules/index.js"

const appStore = useAppStore()

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
  appStore.initApp()
})

</script>

<template>
  <n-config-provider :theme-overrides="appStore.theme" :locale="localProvider.lang" :date-locale="localProvider.date">
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

