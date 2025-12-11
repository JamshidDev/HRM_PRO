<script setup>
// Skeleton for DailyEventChart card
// Props allow controlling chart area height and number of bars
const props = defineProps({
  height: {
    type: Number,
    default: 240,
  },
  bars: {
    type: Number,
    default: 12,
  },
  // Fixed width per bar in pixels
  barWidth: {
    type: Number,
    default:40,
  },
})

// Generate a pleasant sequence of bar heights (percentages)
const barHeights = computed(() => {
  const base = [35, 60, 80, 50, 90, 70, 55, 85, 45, 75, 45, 38]
  const n = Math.max(1, Math.min(props.bars, 24))
  return Array.from({ length: n }, (_, i) => base[i % base.length])
})
</script>

<template>
  <div class="w-full relative hover-effect-card">
    <!-- Decorative background effect to match real card -->
    <span class="z-1 opacity-40 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/effect-card-2.svg)]"></span>

    <!-- Header skeleton (title) -->
    <div class="px-3 pt-2">
      <n-skeleton width="180px" height="20px" :sharp="false" class="rounded-md" />
    </div>

    <!-- Chart area skeleton: faux bars -->
    <div class="w-full relative z-2 px-3 pb-3">
      <div class="w-full flex items-end gap-2 justify-center" :style="{ height: height + 'px' }">
        <div
          v-for="(h, idx) in barHeights"
          :key="idx"
          class="flex items-end mx-2"
          :style="{ width: barWidth + 'px' }"
        >
          <n-skeleton :height="Math.round(height * (h / 100))" :sharp="false" class="w-full rounded-md" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional scoped styles (if needed) */
</style>
