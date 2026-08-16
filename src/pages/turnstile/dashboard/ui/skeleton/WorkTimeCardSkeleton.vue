<script setup>
  // WorkTimeCard.vue tuzilishini takrorlaydi: header + 2 metrika + pastda grafik.
  import CardHeaderSkeleton from './CardHeaderSkeleton.vue'
  import MetricCellSkeleton from './MetricCellSkeleton.vue'
  import ChartSkeleton from './ChartSkeleton.vue'
</script>

<template>
  <div class="flex-1 min-h-0 flex flex-col">
    <CardHeaderSkeleton title-width="180px" subtitle-width="240px" />

    <div class="flex flex-wrap items-center gap-1 px-2 pb-2">
      <MetricCellSkeleton v-for="idx in 2" :key="idx" />
    </div>

    <div class="bg-surface-ground-soft rounded-xl px-3 py-1.5 mt-auto h-[178px]">
      <ChartSkeleton :bars="12" />
    </div>
  </div>
</template>
