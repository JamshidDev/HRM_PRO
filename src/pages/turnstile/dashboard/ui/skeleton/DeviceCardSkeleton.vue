<script setup>
  // DeviceCard.vue tuzilishini takrorlaydi: header + jami son va ulush + taqsimot bar + 2 qator.
  import CardHeaderSkeleton from './CardHeaderSkeleton.vue'
</script>

<template>
  <div class="flex-1 min-h-0 flex flex-col">
    <CardHeaderSkeleton />

    <div class="flex-1 flex flex-col justify-center gap-3 px-3 py-3">
      <div class="flex items-end justify-between gap-2">
        <div class="flex flex-col gap-1.5">
          <n-skeleton width="100px" height="12px" :sharp="false" />
          <n-skeleton width="88px" height="30px" :sharp="false" />
        </div>
        <n-skeleton width="80px" height="20px" round class="mb-1" />
      </div>
      <n-skeleton width="100%" height="10px" round />
    </div>

    <div class="bg-surface-ground-soft rounded-xl p-1.5 flex flex-col">
      <div v-for="idx in 2" :key="idx" class="flex items-center gap-2.5 px-2 py-2">
        <n-skeleton circle width="10px" height="10px" class="shrink-0" />
        <n-skeleton width="40%" height="14px" :sharp="false" />
        <span class="flex-1"></span>
        <n-skeleton width="56px" height="16px" :sharp="false" />
      </div>
    </div>
  </div>
</template>
