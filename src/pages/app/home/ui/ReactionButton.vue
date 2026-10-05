<template>
  <div
    class="reaction-bar inline-flex items-center gap-1 rounded-full px-1.5 py-1 bg-surface-section"
    role="group"
  >
    <button
      v-for="item in reactions"
      :key="item.emoji"
      type="button"
      class="reaction-bar__item"
      :class="{ 'reaction-bar__item--pop': popped === item.emoji }"
      @click="onClick(item.emoji, $event)"
      @animationend="popped = null"
    >
      {{ item.emoji }}
    </button>
  </div>
</template>

<script setup>
  import { spawnBurst } from '../reactionFx.js'

  const emits = defineEmits(['onReaction'])

  const reactions = [
    { emoji: '⚡' },
    { emoji: '🔥' },
    { emoji: '👍' },
    { emoji: '👎' },
    { emoji: '👏' }
  ]

  // Tugmani ketma-ket bosib socket'ni to'ldirib yubormaslik uchun — har bir
  // emoji uchun qisqa oraliq. Effekt baribir har bosishda chiqadi.
  const SEND_INTERVAL = 250
  const lastSent = new Map()

  const popped = ref(null)

  const onClick = (emoji, e) => {
    spawnBurst(emoji, e.currentTarget.getBoundingClientRect())
    popped.value = null
    requestAnimationFrame(() => (popped.value = emoji))

    const now = Date.now()
    if (now - (lastSent.get(emoji) ?? 0) < SEND_INTERVAL) return
    lastSent.set(emoji, now)
    emits('onReaction', emoji)
  }
</script>

<style scoped>
  .reaction-bar {
    border: 1px solid rgba(251, 146, 60, 0.25);
    box-shadow:
      0 8px 24px rgba(15, 23, 42, 0.12),
      0 0 40px rgba(251, 146, 60, 0.1);
    backdrop-filter: blur(16px);
  }

  .reaction-bar__item {
    display: flex;
    width: 32px;
    height: 32px;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 9999px;
    font-size: 20px;
    line-height: 1;
    background: transparent;
    cursor: pointer;
    user-select: none;
    outline: none;
    transition:
      transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
      background-color 0.2s ease;
  }

  .reaction-bar__item:hover {
    transform: translateY(-4px) scale(1.35);
    background: rgba(251, 146, 60, 0.12);
  }

  .reaction-bar__item:active {
    transform: scale(0.9);
  }

  .reaction-bar__item:focus-visible {
    box-shadow: 0 0 0 2px var(--primary-color);
  }

  .reaction-bar__item--pop {
    animation: reaction-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes reaction-pop {
    0% {
      transform: scale(0.85);
    }
    50% {
      transform: translateY(-4px) scale(1.5);
    }
    100% {
      transform: translateY(-4px) scale(1.35);
    }
  }
</style>
