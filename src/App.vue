<script setup>
  import ToastProvider from '@/components/Toast/ToastProvider.vue'
  import MediaViewer from '@/components/mediaViewer/MediaViewer.vue'
  import AppLayout from '@/layouts/AppLayout.vue'
  import { UIMainLoading } from '@/components/index.js'
  import SignatureInstance from '@/pages/app/e-imzo/SignatureInstance.vue'
  import { naiveBreakpoints } from '@/assets/theme/theme.js'
  import { useLocaleProvider, useAppInit } from '@/composables/index.js'
  import { useAppStore } from '@/store/modules/index.js'
  const { localeProvider, theme } = useLocaleProvider()
  const appStore = useAppStore()

  useAppInit()
</script>
<template>
  <n-config-provider
    :breakpoints="naiveBreakpoints"
    :theme-overrides="appStore.theme"
    :locale="localeProvider.lang"
    :date-locale="localeProvider.date"
  >
    <n-notification-provider>
      <n-message-provider placement="top-right">
        <n-dialog-provider>
          <AppLayout />
          <ToastProvider />
          <MediaViewer />
          <SignatureInstance />
        </n-dialog-provider>
      </n-message-provider>
    </n-notification-provider>
  </n-config-provider>
  <UIMainLoading />
</template>
