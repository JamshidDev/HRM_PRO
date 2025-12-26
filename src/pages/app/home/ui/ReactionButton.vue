<template>
  <div
    class="inline-flex justify-center gap-x-3 rounded-full px-2 py-1 backdrop-blur-xl bg-surface-section"
    :style="{
      border: '1px solid rgba(251, 146, 60, 0.25)',
      boxShadow: '0 0 40px rgba(251, 146, 60, 0.1), inset 0 1px 0 rgba(255,255,255,0.05)'
    }"
  >
    <div
      v-for="(item, index) in reactions"
      :key="index"
      @click="sendReaction(index)"
      class="group/box relative flex gap-4 items-center justify-center text-[20px] rounded-full transition-all duration-200 hover:scale-110 active:scale-90 bg-transparent cursor-pointer border-none outline-none"
    >
      <div
        class="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style="background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)"
      ></div>

      <span
        @click="emits('onReaction', item.emoji)"
        class="relative scale-100 select-none flex transform transition-all duration-300 group-hover/box:scale-160"
      >
        {{ item.emoji }}
      </span>

      <span
        v-for="r in item.flying"
        :key="r.id"
        class="flying-emoji pointer-events-none text-4xl"
        :style="{
          '--fly-x': r.x + 'px',
          '--rotation': r.rotation + 'deg',
          animationDelay: r.delay + 'ms'
        }"
      >
        {{ item.emoji }}
      </span>
    </div>
  </div>
</template>

<script setup>
  import { reactive } from 'vue'

  const reactions = reactive([
    { emoji: '⚡', flying: [] },
    { emoji: '🔥', flying: [] },
    { emoji: '👍', flying: [] },
    { emoji: '👎', flying: [] },
    { emoji: '👏', flying: [] }
  ])

  const sendReaction = (index) => {
    const id = Date.now() + Math.random()
    const x = Math.random() * 60 - 30
    const delay = Math.random() * 80
    const rotation = Math.random() * 40 - 20

    reactions[index].flying.push({ id, x, delay, rotation })

    setTimeout(() => {
      const idx = reactions[index].flying.findIndex((r) => r.id === id)
      if (idx > -1) {
        reactions[index].flying.splice(idx, 1)
      }
    }, 1200)
  }

  const emits = defineEmits(['onReaction'])
</script>

<style scoped>
  .flying-emoji {
    position: absolute;
    top: 0;
    left: 0;
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
    animation: flyUp 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }

  @keyframes flyUp {
    0% {
      opacity: 1;
      transform: translate(0, -10%) scale(1) rotate(0deg);
    }
    30% {
      opacity: 1;
      transform: translate(calc(-50% + var(--fly-x) * 0.3), calc(-50% - 50px)) scale(1.3)
        rotate(calc(var(--rotation) * 0.5));
    }
    100% {
      opacity: 0;
      transform: translate(calc(-50% + var(--fly-x)), calc(-50% - 140px)) scale(0.3)
        rotate(var(--rotation));
    }
  }
</style>
