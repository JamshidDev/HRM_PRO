<script setup>
  // Xabar holati belgisi: ✓ — yuborildi, ✓✓ — suhbatdosh o'qidi (ikkinchi belgi birinchisining
  // yarmiga kirib turadi, Telegram'dagi kabi). Rang `currentColor` dan olinadi.
  defineProps({
    read: { type: Boolean, default: false },
    size: { type: Number, default: 16 }
  })
</script>

<template>
  <svg
    class="message-ticks shrink-0"
    :width="Math.round(size * 1.375)"
    :height="size"
    viewBox="0 0 22 16"
    fill="none"
    stroke="currentColor"
    stroke-width="1.9"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M1.5 8.5 L5.5 12.5 L13.5 3.5" />
    <Transition name="tick">
      <path v-if="read" d="M8.5 12 L9 12.5 L17 3.5" />
    </Transition>
  </svg>
</template>

<style scoped>
  .tick-enter-active {
    transition: opacity 0.25s ease, transform 0.25s ease;
  }
  .tick-enter-from {
    opacity: 0;
    transform: translateX(-3px);
  }
</style>
