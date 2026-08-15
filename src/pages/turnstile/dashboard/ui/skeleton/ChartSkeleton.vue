<script setup>
  // Grafik (DailyEventChart / WorkTimeChart) o'rniga turadigan skeleton.
  // Ustunlar bo'yi foizda beriladi — konteyner balandligi o'zgarsa ham moslashadi.
  const props = defineProps({
    bars: {
      type: Number,
      default: 12
    },
    // Pastdagi x o'qi yorliqlari
    labels: {
      type: Boolean,
      default: true
    }
  })

  const barHeights = computed(() => {
    const base = [42, 68, 55, 86, 60, 92, 48, 74, 58, 88, 50, 66]
    const n = Math.max(1, Math.min(props.bars, 24))
    return Array.from({ length: n }, (_, i) => base[i % base.length])
  })
</script>

<template>
  <div class="w-full h-full flex flex-col gap-2 py-1">
    <div class="flex-1 min-h-0 flex items-end gap-1.5">
      <div
        v-for="(h, idx) in barHeights"
        :key="idx"
        class="flex-1 min-w-0 flex items-end"
        :style="{ height: h + '%' }"
      >
        <n-skeleton width="100%" height="100%" :sharp="false" class="rounded-t-md" />
      </div>
    </div>

    <div v-if="labels" class="flex items-center justify-between gap-2 shrink-0">
      <n-skeleton v-for="idx in 6" :key="idx" width="22px" height="8px" :sharp="false" />
    </div>
  </div>
</template>
