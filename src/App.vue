<script setup>
import ToastProvider from "@/components/Toast/ToastProvider.vue";
import themeOverrides from "./assets/theme/theme.js"
import AppLayout from "@/layouts/AppLayout.vue";
import {UIMainLoading} from "@/components/index.js"
import SignatureInstance from "@/pages/app/e-imzo/SignatureInstance.vue"
import i18n from "@/i18n/index.js"
import {useAppSetting} from "@/utils/index.js"



onMounted(()=>{
      i18n.global.locale = localStorage.getItem(useAppSetting.languageKey) || useAppSetting.defaultLanguage
})
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider placement="top-right">
      <n-dialog-provider>
        <AppLayout/>
        <ToastProvider/>
        <UIMainLoading/>
        <SignatureInstance/>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

