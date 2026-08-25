<script setup>
  import { useMessage } from 'naive-ui'
  import GlobalNotification from '@/components/notify/GlobalNotification.vue'
  import PushDetailModal from '@/components/notify/PushDetailModal.vue'
  import { useAppStore } from '@stores'
  import { useNotificationSound } from '@/composables/useNotificationSound.js'

  const message = useMessage()
  const appStore = useAppStore()
  const notificationSound = useNotificationSound()

  const soundByMessageType = {
    success: 'success',
    error: 'error',
    warning: 'notice',
    info: 'notice'
  }
  Object.entries(soundByMessageType).forEach(([type, sound]) => {
    const original = message[type].bind(message)
    message[type] = (...args) => {
      if (appStore.soundEnabled) {
        notificationSound.play(sound)
      }
      return original(...args)
    }
  })

  window.$Toast = message
</script>

<template>
  <span></span>
  <GlobalNotification />
  <PushDetailModal />
</template>
