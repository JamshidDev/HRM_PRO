<script setup>
  // InfoGraph.vue tuzilishini takrorlaydi: header + donut + 4 ta detal qatori.
  import CardHeaderSkeleton from './CardHeaderSkeleton.vue'
  import DetailsLineSkeleton from './DetailsLineSkeleton.vue'
</script>

<template>
  <div class="w-full">
    <CardHeaderSkeleton title-width="200px" subtitle-width="280px" />

    <div class="flex flex-wrap items-center gap-4">
      <div class="p-2 shrink-0 mx-auto">
        <n-skeleton circle width="228px" height="228px" />
      </div>

      <div class="flex-1 min-w-[220px] bg-surface-ground-soft rounded-xl px-3 py-1.5">
        <template v-for="idx in 4" :key="idx">
          <DetailsLineSkeleton />
          <div v-if="idx < 3" class="h-px w-full bg-fig-br-disable"></div>
        </template>
      </div>
    </div>
  </div>
</template>
