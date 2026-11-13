<script setup>
  import UIConfirm from './UIConfirm.vue'

  // O'chirish tasdig'i — universal `UIConfirm` ning `delete` ko'rinishi (savat ikonkasi, qizil tugma).
  defineProps({
    warning: { type: String, default: null },
    title: { type: String, default: '' },
    loading: { type: Boolean, default: false }
  })

  const visible = defineModel('visible', { type: Boolean, default: false })

  const emit = defineEmits(['confirm'])
</script>

<template>
  <UIConfirm
    v-model:visible="visible"
    type="delete"
    :title="title"
    :message="warning || $t('content.deleteWarning')"
    :confirm-text="$t('content.delete')"
    :loading="loading"
    @confirm="emit('confirm')"
  />
</template>
