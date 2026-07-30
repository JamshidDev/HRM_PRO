<script setup>
  import Utils from '@/utils/Utils.js'

  const props = defineProps({
    phone: { type: [String, Number], default: null },
    masked: { type: Boolean, default: false },
    mask: { type: String, default: '## ### ## ##' },
    maskStart: { type: Number, default: 2 },
    maskEnd: { type: Number, default: 2 },
    fallback: { type: String, default: '-' }
  })

  const display = computed(() => {
    if (!props.phone) return props.fallback
    return props.masked
      ? Utils.maskText(props.phone, props.maskStart, props.maskEnd)
      : Utils.formatPhoneWithMask(props.phone, props.mask)
  })
</script>

<template>
  <span>{{ display }}</span>
</template>
