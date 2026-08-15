<script setup>
  // FaceCard.vue tuzilishini takrorlaydi: header + umumiy son + 2 ta kanal bloki.
  import CardHeaderSkeleton from './CardHeaderSkeleton.vue'
</script>

<template>
  <div class="flex-1 min-h-0 flex flex-col">
    <CardHeaderSkeleton />

    <div class="flex-1 flex flex-col justify-center gap-2">
      <div class="h-[65px] py-2 flex flex-col items-center justify-center gap-1.5">
        <n-skeleton width="88px" height="24px" :sharp="false" />
        <n-skeleton width="140px" height="12px" :sharp="false" />
      </div>

      <div
        v-for="idx in 2"
        :key="idx"
        class="bg-surface-ground-soft rounded-xl px-4 py-1.5 flex flex-1 items-center gap-2"
      >
        <n-skeleton width="20px" height="20px" :sharp="false" class="shrink-0 rounded-md" />
        <div class="flex-1 min-w-0 flex flex-col gap-1 justify-center">
          <n-skeleton width="60%" height="12px" :sharp="false" />
          <n-skeleton width="72px" height="20px" :sharp="false" />
        </div>
      </div>
    </div>
  </div>
</template>
