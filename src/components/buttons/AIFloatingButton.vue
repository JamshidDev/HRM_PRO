<script setup>
  import { useDraggable, useWindowSize } from '@vueuse/core'
  import { Dismiss24Regular } from '@vicons/fluent'
  import AIButtonV2 from './AIButtonV2.vue'
  import { AppPaths } from '@/utils/AppPaths.js'
  import { useAIConversationStore } from '@/store/modules/index.js'

  const STORAGE_KEY = 'aiFloatingButtonPosition'
  const MARGIN = 16
  const DRAG_THRESHOLD = 4

  const route = useRoute()
  const store = useAIConversationStore()
  const el = ref(null)
  const { width: windowWidth, height: windowHeight } = useWindowSize()

  const isVisible = computed(() => route.name !== AppPaths.AIConversation.substring(1))

  let startPosition = { x: 0, y: 0 }
  const dragged = ref(false)

  const clampPosition = () => {
    if (!el.value) return
    const { offsetWidth, offsetHeight } = el.value
    const maxX = Math.max(MARGIN, windowWidth.value - offsetWidth - MARGIN)
    const maxY = Math.max(MARGIN, windowHeight.value - offsetHeight - MARGIN)
    x.value = Math.min(Math.max(x.value, MARGIN), maxX)
    y.value = Math.min(Math.max(y.value, MARGIN), maxY)
  }

  const persistPosition = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ x: x.value, y: y.value }))
  }

  const { x, y, style } = useDraggable(el, {
    initialValue: { x: 0, y: 0 },
    preventDefault: true,
    onStart: () => {
      dragged.value = false
      startPosition = { x: x.value, y: y.value }
    },
    onMove: () => {
      const dx = x.value - startPosition.x
      const dy = y.value - startPosition.y
      if (Math.hypot(dx, dy) > DRAG_THRESHOLD) dragged.value = true
      clampPosition()
    },
    onEnd: () => {
      clampPosition()
      persistPosition()
    }
  })

  const restorePosition = () => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const { x: savedX, y: savedY } = JSON.parse(saved)
      x.value = savedX
      y.value = savedY
    } else {
      x.value = windowWidth.value - el.value.offsetWidth - MARGIN
      y.value = windowHeight.value - el.value.offsetHeight - MARGIN
    }
    clampPosition()
  }

  onMounted(async () => {
    await nextTick()
    restorePosition()
  })

  watch([windowWidth, windowHeight], () => clampPosition())

  const handleClick = () => {
    if (dragged.value) {
      dragged.value = false
      return
    }
    store.visible ? store.closeModal() : store.openModal()
  }
</script>

<template>
  <div
    v-if="isVisible"
    ref="el"
    class="ai-floating-button fixed z-[200] touch-none select-none"
    :style="style"
    @click="handleClick"
  >
    <AIButtonV2 :icon="store.visible ? Dismiss24Regular : undefined" />
  </div>
</template>

<style scoped>
  .ai-floating-button {
    cursor: grab;
  }

  .ai-floating-button:active {
    cursor: grabbing;
  }
</style>
