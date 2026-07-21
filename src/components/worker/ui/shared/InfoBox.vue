<script setup>
  defineProps({
    label: {
      type: String,
      default: ''
    },
    value: {
      type: [String, Number],
      default: null
    }
  })
</script>

<template>
  <div class="bg-surface-ground border border-surface-line rounded-3xl px-4 py-3 flex flex-col gap-1 min-w-0">
    <span class="text-xs text-textColor3">{{ label }}</span>
    <span class="font-semibold text-textColor0 break-words">
      <slot name="value">{{ value ?? '—' }}</slot>
    </span>
  </div>
</template>
