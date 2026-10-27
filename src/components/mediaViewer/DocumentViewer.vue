<script setup>
  import { UIModal } from '@/components/index.js'

  // Universal PDF ko'rish oynasi ($MediaViewer orqali ochiladi). Brauzerning o'z PDF
  // ko'ruvchisi ishlatiladi — kattalashtirish, chop etish va yuklab olish tayyor.
  defineEmits(['close'])

  const props = defineProps({
    src: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: ''
    }
  })

  const visible = ref(true)

  // `navpanes=0` — chapdagi sahifalar paneli yopiq; `view=FitH` — sahifa oyna kengligiga moslanadi.
  // Manzilda o'z `#...` qismi bo'lsa tegilmaydi.
  const frameSrc = computed(() =>
    props.src.includes('#') ? props.src : `${props.src}#navpanes=0&view=FitH`
  )
</script>

<template>
  <UIModal
    v-model:visible="visible"
    :title="title || $t('content.view')"
    width="min(960px, calc(100vw - 32px))"
    height="min(94vh, 1200px)"
    compact
    fullscreen-on-mobile
    @update:visible="$emit('close')"
  >
    <iframe
      :src="frameSrc"
      :title="title || $t('content.view')"
      class="block w-full h-full rounded-lg border border-surface-line bg-surface-ground"
    />
  </UIModal>
</template>
