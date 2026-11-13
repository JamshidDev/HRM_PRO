<script setup>
  import { useMessage } from 'naive-ui'
  import GlobalNotification from '@/components/notify/GlobalNotification.vue'
  import PushDetailModal from '@/components/notify/PushDetailModal.vue'
  import AlertDialog from '@/components/notify/AlertDialog.vue'
  import {
    showAlert,
    alertValidation,
    alertWarning,
    alertError,
    confirmDialog,
    confirmDelete
  } from '@/components/notify/alertDialog.js'
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
  // Global: $Alert(opts), $Alert.validation(msg), $Alert.warning(msg), $Alert.error(e, fallback),
  // $Alert.confirm(opts) / $Alert.delete(opts) — universal tasdiq (Promise<boolean>).
  window.$Alert = Object.assign(showAlert, {
    validation: alertValidation,
    warning: alertWarning,
    error: alertError,
    confirm: confirmDialog,
    delete: confirmDelete
  })
</script>

<template>
  <span></span>
  <GlobalNotification />
  <PushDetailModal />
  <AlertDialog />
</template>
