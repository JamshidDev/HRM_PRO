<script setup>
  import { useDraggable, useWindowSize } from '@vueuse/core'
  import { Dismiss24Regular } from '@vicons/fluent'
  import AIButtonV2 from './AIButtonV2.vue'
  import { AppPaths } from '@/utils/AppPaths.js'
  import { useAIConversationStore } from '@/store/modules/index.js'

  const STORAGE_KEY = 'aiFloatingButtonPositionRatio'
  const MARGIN = 16
  const DRAG_THRESHOLD = 4
  const VELOCITY_SAMPLE_WINDOW = 100 // ms, window used to estimate release velocity
  const FLING_THRESHOLD = 500 // px/s, below this a release is treated as a plain drop (no fling)
  const MAX_VELOCITY = 1200 // px/s cap, so a very fast/sparsely-sampled flick can't send it flying off-screen
  const FRICTION_PER_MS = 0.99 // exponential velocity decay per ms - decays fast, short travel distance
  const BOUNCE_DAMPING = 0.4 // velocity kept (reversed) after bouncing off an edge
  const MIN_VELOCITY = 30 // px/s, below this the fling animation stops

  const route = useRoute()
  const store = useAIConversationStore()
  const el = ref(null)
  const { width: windowWidth, height: windowHeight } = useWindowSize()

  const isVisible = computed(() => route.name !== AppPaths.AIConversation.substring(1))

  let startPosition = { x: 0, y: 0 }
  const dragged = ref(false)

  let moveHistory = []
  let velocity = { x: 0, y: 0 }
  let inertiaFrame = null

  // Position is stored as a 0..1 ratio of the draggable bounds so it stays
  // anchored to the same relative spot across window resizes/reloads instead
  // of drifting when the viewport shrinks and never re-expanding.
  const ratio = ref({ x: 1, y: 1 })

  const getBounds = () => {
    const { offsetWidth = 0, offsetHeight = 0 } = el.value || {}
    return {
      maxX: Math.max(MARGIN, windowWidth.value - offsetWidth - MARGIN),
      maxY: Math.max(MARGIN, windowHeight.value - offsetHeight - MARGIN)
    }
  }

  const clampPosition = () => {
    if (!el.value) return
    const { maxX, maxY } = getBounds()
    x.value = Math.min(Math.max(x.value, MARGIN), maxX)
    y.value = Math.min(Math.max(y.value, MARGIN), maxY)
  }

  const applyRatio = () => {
    if (!el.value) return
    const { maxX, maxY } = getBounds()
    x.value = MARGIN + ratio.value.x * (maxX - MARGIN)
    y.value = MARGIN + ratio.value.y * (maxY - MARGIN)
  }

  const updateRatioFromPosition = () => {
    if (!el.value) return
    const { maxX, maxY } = getBounds()
    const rangeX = maxX - MARGIN
    const rangeY = maxY - MARGIN
    ratio.value = {
      x: rangeX > 0 ? Math.min(Math.max((x.value - MARGIN) / rangeX, 0), 1) : 1,
      y: rangeY > 0 ? Math.min(Math.max((y.value - MARGIN) / rangeY, 0), 1) : 1
    }
  }

  const persistPosition = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ratio.value))
  }

  const stopInertia = () => {
    if (inertiaFrame) {
      cancelAnimationFrame(inertiaFrame)
      inertiaFrame = null
    }
  }

  const finalizePosition = () => {
    clampPosition()
    updateRatioFromPosition()
    persistPosition()
  }

  const recordMove = () => {
    const now = performance.now()
    moveHistory.push({ x: x.value, y: y.value, t: now })
    while (moveHistory.length && now - moveHistory[0].t > VELOCITY_SAMPLE_WINDOW) {
      moveHistory.shift()
    }
  }

  const computeReleaseVelocity = () => {
    if (moveHistory.length < 2) return { x: 0, y: 0 }
    const first = moveHistory[0]
    const last = moveHistory[moveHistory.length - 1]
    const dt = last.t - first.t
    if (dt <= 0) return { x: 0, y: 0 }
    const raw = {
      x: ((last.x - first.x) / dt) * 1000,
      y: ((last.y - first.y) / dt) * 1000
    }
    const speed = Math.hypot(raw.x, raw.y)
    if (speed <= MAX_VELOCITY || speed === 0) return raw
    const scale = MAX_VELOCITY / speed
    return { x: raw.x * scale, y: raw.y * scale }
  }

  // Flings the button in the release direction, decelerating over time and
  // bouncing off the viewport edges like a ball until it comes to rest.
  const runInertia = () => {
    let lastTime = performance.now()

    const step = (now) => {
      const dt = Math.min(now - lastTime, 32)
      lastTime = now

      const decay = Math.pow(FRICTION_PER_MS, dt)
      velocity.x *= decay
      velocity.y *= decay

      let nextX = x.value + (velocity.x * dt) / 1000
      let nextY = y.value + (velocity.y * dt) / 1000

      const { maxX, maxY } = getBounds()

      if (nextX < MARGIN) {
        nextX = MARGIN
        velocity.x = Math.abs(velocity.x) * BOUNCE_DAMPING
      } else if (nextX > maxX) {
        nextX = maxX
        velocity.x = -Math.abs(velocity.x) * BOUNCE_DAMPING
      }

      if (nextY < MARGIN) {
        nextY = MARGIN
        velocity.y = Math.abs(velocity.y) * BOUNCE_DAMPING
      } else if (nextY > maxY) {
        nextY = maxY
        velocity.y = -Math.abs(velocity.y) * BOUNCE_DAMPING
      }

      x.value = nextX
      y.value = nextY

      if (Math.hypot(velocity.x, velocity.y) > MIN_VELOCITY) {
        inertiaFrame = requestAnimationFrame(step)
      } else {
        inertiaFrame = null
        finalizePosition()
      }
    }

    inertiaFrame = requestAnimationFrame(step)
  }

  const { x, y, style } = useDraggable(el, {
    initialValue: { x: 0, y: 0 },
    preventDefault: true,
    onStart: () => {
      stopInertia()
      dragged.value = false
      moveHistory = []
      startPosition = { x: x.value, y: y.value }
    },
    onMove: () => {
      const dx = x.value - startPosition.x
      const dy = y.value - startPosition.y
      if (Math.hypot(dx, dy) > DRAG_THRESHOLD) dragged.value = true
      clampPosition()
      recordMove()
    },
    onEnd: () => {
      velocity = computeReleaseVelocity()
      if (Math.hypot(velocity.x, velocity.y) > FLING_THRESHOLD) {
        runInertia()
      } else {
        finalizePosition()
      }
    }
  })

  const restorePosition = () => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const { x: savedX, y: savedY } = JSON.parse(saved)
      ratio.value = {
        x: Math.min(Math.max(savedX, 0), 1),
        y: Math.min(Math.max(savedY, 0), 1)
      }
    } else {
      ratio.value = { x: 1, y: 1 }
    }
    applyRatio()
  }

  onMounted(async () => {
    await nextTick()
    restorePosition()
  })

  watch([windowWidth, windowHeight], () => applyRatio())

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
