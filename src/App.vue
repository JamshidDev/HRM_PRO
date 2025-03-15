<script setup>
import ToastProvider from "@/components/Toast/ToastProvider.vue";
import MediaViewer from '@/components/mediaViewer/MediaViewer.vue'
import {customTheme} from "./assets/theme/theme.js"
import AppLayout from "@/layouts/AppLayout.vue";
import {UIMainLoading} from "@/components/index.js"
import SignatureInstance from "@/pages/app/e-imzo/SignatureInstance.vue"
import i18n from "@/i18n/index.js"
import {useAppSetting} from "@/utils/index.js"


const theme = ref(null)


onMounted(()=>{
      i18n.global.locale = localStorage.getItem(useAppSetting.languageKey) || useAppSetting.defaultLanguage
      setTimeout(()=>{
        const html = document.documentElement;
        html.setAttribute('data-theme', 'dark');
        theme.value = customTheme()
      }, 3000)
})




</script>

<template>
  <n-config-provider :theme-overrides="theme">
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

