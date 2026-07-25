<script setup>
  import { MoreVertical24Filled } from '@vicons/fluent'

  defineProps({
    options: { type: Array, required: true }
  })
  defineEmits(['select'])
</script>

<template>
  <n-dropdown trigger="click" :options="options" @select="(key) => $emit('select', key)">
    <n-button tertiary circle size="small" @click.stop>
      <template #icon>
        <n-icon><MoreVertical24Filled /></n-icon>
      </template>
    </n-button>
  </n-dropdown>
</template>
