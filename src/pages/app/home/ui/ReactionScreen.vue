<template>
  <div class="fixed top-0 left-0 bottom-0 right-0 w-full h-screen overflow-hidden pointer-events-none">
    <span
        v-for="e in emojis"
        :key="e.id"
        class="floating-emoji absolute pointer-events-none z-[999] flex flex-col"
        :style="{
        left: e.x + '%',
        bottom: '-60px',
        fontSize: e.size + 'rem',
        '--duration': e.duration + 's',
        '--wobble': e.wobble + 'px'
      }"
    >
    <span class="text-center">{{e.emoji}}</span>
      <span class="label px-2 py-0.5 bg-dark/60 text-white text-xs rounded-full whitespace-nowrap backdrop-blur-sm">
        {{e.label}}
      </span>
    </span>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {useSocketStore} from "@/store/modules/index.js"

const store = useSocketStore()

const emojis = ref([])

const addEmoji = (data) => {
  const id = Date.now() + Math.random()
  const x = Math.random() * 60 + 20
  const duration = 3 + Math.random() * 2
  const size = 2 + Math.random() * 1.5
  const wobble = Math.random() * 80 - 40
  emojis.value.push({ id,emoji:data.emoji,label:data.shortName, x, duration, size, wobble })

  setTimeout(() => {
    const idx = emojis.value.findIndex(e => e.id === id)
    if (idx > -1) {
      emojis.value.splice(idx, 1)
    }
  }, duration * 1000)
}

onMounted(() => {
  store.registerCallback(addEmoji)
})
</script>

<style scoped>
.floating-emoji {
  animation: floatUp var(--duration) cubic-bezier(0.33, 1, 0.68, 1) forwards;
  filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.5));
}

@keyframes floatUp {
  0% {
    opacity: 0;
    transform: translateY(0) translateX(0) scale(0.3);
  }
  15% {
    opacity: 1;
    transform: translateY(-15vh) translateX(calc(var(--wobble) * 0.4)) scale(1.2);
  }
  40% {
    transform: translateY(-40vh) translateX(calc(var(--wobble) * -0.6)) scale(1);
  }
  70% {
    opacity: 1;
    transform: translateY(-70vh) translateX(calc(var(--wobble) * 0.5)) scale(0.8);
  }
  100% {
    opacity: 0;
    transform: translateY(-100vh) translateX(0) scale(0.3);
  }
}
</style>