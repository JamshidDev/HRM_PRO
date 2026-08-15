<script setup>
  // WorkerAnalyticPanel.vue tuzilishini takrorlaydi: header + 4 metrika + grafik.
  import CardHeaderSkeleton from './CardHeaderSkeleton.vue'
  import MetricCellSkeleton from './MetricCellSkeleton.vue'
  import ChartSkeleton from './ChartSkeleton.vue'
</script>

<template>
  <div class="w-full">
    <CardHeaderSkeleton title-width="180px" subtitle-width="260px" />

    <div class="flex flex-wrap items-center gap-1 px-2 py-2">
      <MetricCellSkeleton v-for="idx in 4" :key="idx" />
    </div>

    <div class="bg-surface-ground-soft rounded-xl px-3 py-1.5 h-[178px]">
      <ChartSkeleton :bars="14" />
    </div>
  </div>
</template>
