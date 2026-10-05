<script setup>
  // WorkerAnalyticPanel.vue tuzilishini takrorlaydi: header + 4 metrika + grafik.
  import CardHeaderSkeleton from './CardHeaderSkeleton.vue'
  import MetricCellSkeleton from './MetricCellSkeleton.vue'
</script>

<template>
  <div class="w-full">
    <CardHeaderSkeleton title-width="180px" />

    <div class="flex flex-wrap items-center gap-1 px-2 py-2">
      <MetricCellSkeleton v-for="idx in 4" :key="idx" />
    </div>

    <div class="bg-surface-ground-soft rounded-xl px-3 py-1.5 h-[178px]">
      <!-- Haqiqiy grafik chiziqli — ustunlar emas, bitta maydon. -->
      <n-skeleton width="100%" height="100%" :sharp="false" class="rounded-lg" />
    </div>
  </div>
</template>
