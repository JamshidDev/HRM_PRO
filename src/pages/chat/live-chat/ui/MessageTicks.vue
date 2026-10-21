<script setup>
  // Xabar holati belgisi: ✓ — yuborildi, ✓✓ — suhbatdosh o'qidi (ikkinchi belgi birinchisining
  // yarmiga kirib turadi, Telegram'dagi kabi). Rang `currentColor` dan olinadi.
  // `draw` — belgi "qalam bilan chizilgandek" paydo bo'ladi (faqat yuborilish payti, tarixda emas).
  defineProps({
    read: { type: Boolean, default: false },
    size: { type: Number, default: 16 },
    draw: { type: Boolean, default: false }
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
    <path :class="draw && 'tick-draw'" pathLength="1" d="M1.5 8.5 L5.5 12.5 L13.5 3.5" />
    <Transition name="tick">
      <path v-if="read" pathLength="1" d="M8.5 12 L9 12.5 L17 3.5" />
    </Transition>
  </svg>
</template>

<style scoped>
  .message-ticks {
    transition: color 0.3s ease;
  }
  /* Belgi chizig'i boshidan oxirigacha "chiziladi" (pathLength=1 — uzunlik doim 1) */
  .tick-draw,
  .tick-enter-active {
    stroke-dasharray: 1;
    animation: tick-draw 0.32s ease-out both;
  }
  .tick-enter-active {
    animation-delay: 0.06s;
  }
  @keyframes tick-draw {
    from {
      stroke-dashoffset: 1;
    }
    to {
      stroke-dashoffset: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .tick-draw,
    .tick-enter-active {
      animation: none;
    }
  }
</style>
