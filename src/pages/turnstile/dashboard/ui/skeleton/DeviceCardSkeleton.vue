<script setup>
  // DeviceCard.vue tuzilishini takrorlaydi: header + umumiy son + progress + 2 qator.
  import CardHeaderSkeleton from './CardHeaderSkeleton.vue'
  import DetailsLineSkeleton from './DetailsLineSkeleton.vue'
</script>

<template>
  <div class="flex-1 min-h-0 flex flex-col">
    <CardHeaderSkeleton />

    <div class="flex-1 flex flex-col justify-center gap-2.5 p-2">
      <div class="h-14 flex flex-col items-center justify-center gap-1.5">
        <n-skeleton width="88px" height="24px" :sharp="false" />
        <n-skeleton width="120px" height="10px" :sharp="false" />
      </div>

      <div class="py-3">
        <n-skeleton width="100%" height="56px" :sharp="false" class="rounded-2xl" />
      </div>
    </div>

    <div class="bg-surface-ground-soft rounded-xl p-3 flex items-start gap-1">
      <DetailsLineSkeleton v-for="idx in 2" :key="idx" class="flex-1" />
    </div>
  </div>
</template>
