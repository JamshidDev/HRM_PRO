<script setup>
  import { darkTheme } from 'naive-ui'
  import ToastProvider from '@/components/Toast/ToastProvider.vue'
  import MediaViewer from '@/components/mediaViewer/MediaViewer.vue'
  import AppLayout from '@/layouts/AppLayout.vue'
  import { UIMainLoading } from '@/components/index.js'
  import SignatureInstance from '@/pages/app/e-imzo/SignatureInstance.vue'
  import AIConversationModal from '@/pages/app/ai/AIConversationModal.vue'
  import SalaryUnlockModal from '@/pages/accountant/salary1c/ui/SalaryUnlockModal.vue'
  import { naiveBreakpoints } from '@/assets/theme/theme.js'
  import { useLocaleProvider, useAppInit } from '@/composables/index.js'
  import { useAppStore } from '@/store/modules/index.js'
  const { localeProvider } = useLocaleProvider()
  const appStore = useAppStore()
  useAppInit()
</script>
<template>
  <n-config-provider
    :breakpoints="naiveBreakpoints"
    :theme="appStore.isDark ? darkTheme : null"
    :theme-overrides="appStore.theme"
    :locale="localeProvider.lang"
    :date-locale="localeProvider.date"
  >
    <n-notification-provider>
      <n-message-provider placement="top-right" :container-style="{ zIndex: 10000 }">
        <n-dialog-provider>
          <AppLayout />
          <ToastProvider />
          <MediaViewer />
          <SignatureInstance />
          <AIConversationModal />
          <SalaryUnlockModal />
        </n-dialog-provider>
      </n-message-provider>
    </n-notification-provider>
  </n-config-provider>
  <UIMainLoading />
</template>
