<script setup>
  import { useMessage } from 'naive-ui'
  import GlobalNotification from '@/components/notify/GlobalNotification.vue'
  import { useAppStore } from '@stores'
  import { useNotificationSound } from '@/composables/useNotificationSound.js'

  const message = useMessage()
  const appStore = useAppStore()
  const notificationSound = useNotificationSound()

  const originalSuccess = message.success.bind(message)
  message.success = (...args) => {
    if (appStore.soundEnabled) {
      notificationSound.play()
    }
    return originalSuccess(...args)
  }

  window.$Toast = message
</script>

<template>
  <span></span>
  <GlobalNotification />
</template>
