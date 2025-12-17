<script setup>
import ToastProvider from "@/components/Toast/ToastProvider.vue";
import MediaViewer from '@/components/mediaViewer/MediaViewer.vue'
import AppLayout from "@/layouts/AppLayout.vue";
import {UIMainLoading} from "@/components/index.js"
import SignatureInstance from "@/pages/app/e-imzo/SignatureInstance.vue"
import {naiveBreakpoints} from "@/assets/theme/theme.js"
import {useLocaleProvider, useAppInit} from "@/composables/index.js"

const {localeProvider, theme} = useLocaleProvider()
useAppInit()

</script>
<template>
  <n-config-provider
      :breakpoints="naiveBreakpoints"
      :theme-overrides="theme"
      :locale="localeProvider.lang"
      :date-locale="localeProvider.date">
    <n-message-provider placement="top-right">
      <n-dialog-provider>
        <AppLayout/>
        <ToastProvider/>
        <MediaViewer />
        <SignatureInstance/>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
  <UIMainLoading/>
</template>

