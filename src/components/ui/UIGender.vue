<script setup>
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const props = defineProps({
    sex: { type: Boolean, default: null },
    fallback: { type: String, default: '-' }
  })

  const display = computed(() => {
    if (props.sex === null || props.sex === undefined) return props.fallback
    return props.sex ? t('enum.man') : t('enum.woman')
  })
</script>

<template>
  <span>{{ display }}</span>
</template>
