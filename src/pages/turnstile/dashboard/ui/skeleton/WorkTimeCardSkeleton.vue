<script setup>
  // WorkTimeCard.vue tuzilishini takrorlaydi: header + 2 metrika + pastda grafik.
  import CardHeaderSkeleton from './CardHeaderSkeleton.vue'
  import MetricCellSkeleton from './MetricCellSkeleton.vue'
</script>

<template>
  <div class="flex-1 min-h-0 flex flex-col">
    <CardHeaderSkeleton title-width="180px" />

    <div class="flex flex-wrap items-center gap-1 px-2 pb-2">
      <MetricCellSkeleton v-for="idx in 2" :key="idx" />
    </div>

    <div class="bg-surface-ground-soft rounded-xl px-3 py-1.5 mt-auto h-[178px]">
      <!-- Haqiqiy grafik: oxirgi 3 kun, har kunda 2 ustun (erta ketgan / kech kelgan). -->
      <div class="h-full flex items-end justify-around pb-5">
        <div v-for="idx in 3" :key="idx" class="flex items-end gap-1 h-[80%]">
          <n-skeleton width="10px" height="100%" :sharp="false" />
          <n-skeleton width="10px" height="60%" :sharp="false" />
        </div>
      </div>
    </div>
  </div>
</template>
