<script setup>
  import { Search48Filled } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  defineProps({
    placeholder: { type: String, default: null },
    size: { type: String, default: 'medium' },
    clearable: { type: Boolean, default: true },
    loading: { type: Boolean, default: false }
  })

  const value = defineModel('value', { type: String, default: '' })
</script>

<template>
  <n-input
    v-model:value="value"
    :clearable="clearable"
    :size="size"
    :loading="loading"
    :placeholder="placeholder || t('content.search')"
  >
    <template #prefix>
      <n-icon :component="Search48Filled" />
    </template>
  </n-input>
</template>
