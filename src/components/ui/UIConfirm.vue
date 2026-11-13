<script setup>
  import AlertCard from '@/components/notify/AlertCard.vue'
  import i18n from '@/i18n/index.js'

  /**
   * Universal tasdiq oynasi — `$Alert` bilan bir xil ko'rinish (3D ikonka, 2 tugma).
   * Holat (v-model:visible) sahifa / store'da bo'lsa shuni ishlating;
   * koddan bir martalik so'rash uchun — `confirmDialog()` / `$Alert.confirm()` (alertDialog.js).
   *
   *   <UIConfirm v-model:visible="store.deleteVisible" type="delete" :message="..." :loading="store.saveLoading"
   *              @confirm="store._delete" />
   *
   * Oyna o'zi yopilmaydi: `confirm` dan keyin `visible = false` ni chaqiruvchi qiladi (amal muvaffaqiyatli bo'lsa).
   * Chap tugma va fon / Esc — `visible = false` + `cancel` / `close`.
   */
  const props = defineProps({
    // 'warning' | 'delete' | 'confirm' | 'success'
    type: { type: String, default: 'warning' },
    title: { type: String, default: '' },
    message: { type: String, default: '' },
    confirmText: { type: String, default: '' },
    cancelText: { type: String, default: '' },
    extraText: { type: String, default: '' },
    // Berilmasa: type="delete" → qizil tugma.
    danger: { type: Boolean, default: undefined },
    loading: { type: Boolean, default: false },
    confirmDisabled: { type: Boolean, default: false }
  })

  const visible = defineModel('visible', { type: Boolean, default: false })
  const emit = defineEmits(['confirm', 'cancel', 'extra', 'close'])

  const { t } = i18n.global
  const shownTitle = computed(() => props.title || t(`alertDialog.confirmTitles.${props.type}`))
  const isDanger = computed(() => props.danger ?? props.type === 'delete')

  // Har ochilishda animatsiya qaytadan boshlanadi.
  const playKey = ref(0)
  watch(visible, (v) => v && playKey.value++)

  const close = () => {
    if (props.loading) return
    visible.value = false
    emit('close')
  }
  const onCancel = () => {
    if (props.loading) return
    visible.value = false
    emit('cancel')
    emit('close')
  }
  const onExtra = () => {
    if (props.loading) return
    emit('extra')
  }
  const onShow = (v) => !v && close()
</script>

<template>
  <n-modal :show="visible" :auto-focus="true" :mask-closable="true" :close-on-esc="true" @update:show="onShow">
    <AlertCard
      :key="playKey"
      :type="type"
      :title="shownTitle"
      :message="message"
      confirm
      :confirm-text="confirmText"
      :cancel-text="cancelText"
      :extra-text="extraText"
      :danger="isDanger"
      :loading="loading"
      :confirm-disabled="confirmDisabled"
      @confirm="emit('confirm')"
      @cancel="onCancel"
      @extra="onExtra"
    >
      <template v-if="$slots.default" #default>
        <slot />
      </template>
    </AlertCard>
  </n-modal>
</template>
