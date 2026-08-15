<script setup>
  // MonthlyCard.vue tuzilishini takrorlaydi: header + dekor maydoni + pastdagi blok.
  import CardHeaderSkeleton from './CardHeaderSkeleton.vue'
</script>

<template>
  <div class="flex-1 min-h-0 flex flex-col">
    <CardHeaderSkeleton />

    <div class="flex-1 min-h-[160px] p-2 flex items-center justify-center">
      <n-skeleton circle width="132px" height="132px" />
    </div>

    <div
      class="bg-surface-ground-soft rounded-xl px-3 py-1.5 min-h-[78px] flex flex-col justify-center gap-2"
    >
      <div class="flex items-center gap-2 pl-1">
        <n-skeleton width="120px" height="12px" :sharp="false" />
        <n-skeleton width="56px" height="20px" :sharp="false" />
      </div>
      <div class="flex items-center justify-between gap-2 pl-1">
        <n-skeleton width="96px" height="12px" :sharp="false" />
        <n-skeleton width="52px" height="16px" round />
      </div>
    </div>
  </div>
</template>
