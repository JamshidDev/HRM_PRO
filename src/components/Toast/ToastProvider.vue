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
  // Ekranda turgan toastlar (tur + matn → instance). Bir vaqtda ketgan bir nechta so'rov bir xil xato
  // qaytarsa (masalan, xodim profili: xodim + pasport + xorijiy pasport), bir xil toast 2–3 marta
  // chiqardi — endi xuddi shu matnli toast ko'rinib turganda yangisi (va ovozi) chiqmaydi.
  // `$Alert` ham shunday ishlaydi (alertDialog.js `key`).
  const openToasts = new Map()

  Object.entries(soundByMessageType).forEach(([type, sound]) => {
    const original = message[type].bind(message)
    message[type] = (content, options = {}) => {
      const key = typeof content === 'string' ? `${type}|${content}` : null
      if (key && openToasts.has(key)) return openToasts.get(key)

      if (appStore.soundEnabled) {
        notificationSound.play(sound)
      }
      if (!key) return original(content, options)

      const forget = () => openToasts.delete(key)
      const instance = original(content, {
        ...options,
        onAfterLeave: () => {
          forget()
          options?.onAfterLeave?.()
        }
      })
      openToasts.set(key, instance)
      // Zaxira: onAfterLeave biror sababdan chaqirilmasa ham matn «abadiy bloklanib» qolmasin.
      const duration = options?.duration ?? 3000
      if (duration > 0) setTimeout(() => openToasts.get(key) === instance && forget(), duration + 1500)
      return instance
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
