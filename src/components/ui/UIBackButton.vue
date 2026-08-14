<script setup>
  import { ArrowLeft24Regular } from '@vicons/fluent'

  defineProps({
    label: {
      type: String,
      default: ''
    }
  })

  const emits = defineEmits(['click'])
</script>

<template>
  <n-button size="small" class="ui-back-button rounded-lg!" @click="emits('click')">
    <template #icon>
      <n-icon :component="ArrowLeft24Regular" />
    </template>
    <slot>{{ label || $t('content.back') }}</slot>
  </n-button>
</template>

<style lang="scss" scoped>
  .ui-back-button {
    background-color: #eaecf0 !important;
  }

  [data-theme='dark'] {
    .ui-back-button {
      background-color: var(--table-header) !important;
    }
  }
</style>
