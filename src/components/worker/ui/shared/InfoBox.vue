<script setup>
  defineProps({
    label: {
      type: String,
      default: ''
    },
    value: {
      type: [String, Number],
      default: null
    },
    icon: {
      type: Object,
      default: null
    }
  })
</script>

<template>
  <div class="bg-surface-ground border border-surface-line rounded-3xl px-4 py-3 flex flex-col gap-1 min-w-0">
    <div class="flex items-center gap-2">
      <span v-if="icon" class="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
        <n-icon size="16" class="text-primary">
          <component :is="icon" />
        </n-icon>
      </span>
      <span class="text-xs text-textColor3">{{ label }}</span>
    </div>
    <span class="font-semibold text-textColor0 break-words">
      <slot name="value">{{ value ?? '—' }}</slot>
    </span>
  </div>
</template>
