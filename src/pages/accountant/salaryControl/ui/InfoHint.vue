<script setup>
  // Kichik (i) belgisi — ustiga kelganda izoh (tooltip) ko'rsatadi.
  // Maqsad: har bir ko'rsatkich/grafik "bu nima?" degan savolni oldini oladi.
  import { Info16Regular } from '@vicons/fluent'

  defineProps({
    text: { type: String, required: true },
    size: { type: Number, default: 15 }
  })
</script>

<template>
  <n-tooltip trigger="hover" placement="top" :style="{ maxWidth: '320px' }">
    <template #trigger>
      <n-icon
        :size="size"
        class="info-hint"
        tabindex="0"
        role="button"
        aria-label="Izoh"
      >
        <Info16Regular />
      </n-icon>
    </template>
    <span class="text-xs leading-relaxed">{{ text }}</span>
  </n-tooltip>
</template>

<style scoped>
  .info-hint {
    color: var(--fig-text-tertiary);
    cursor: help;
    flex: none;
    vertical-align: middle;
    transition: color 0.15s ease;
  }
  .info-hint:hover,
  .info-hint:focus-visible {
    color: var(--fig-icon-brand);
    outline: none;
  }
</style>
