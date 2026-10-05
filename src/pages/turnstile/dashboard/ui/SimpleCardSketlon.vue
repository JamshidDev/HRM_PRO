<script setup>
  const props = defineProps({
    count: {
      type: Number,
      default: 1
    }
  })

  const attrs = useAttrs()
</script>

<template>
  <div
    v-for="(item, idx) in count"
    :key="idx"
    :class="attrs.class"
    class="flex flex-col gap-3 pt-4 px-1 pb-1 rounded-2xl bg-surface-section relative overflow-hidden"
  >
    <div class="flex items-center gap-1 px-2">
      <n-skeleton width="28px" height="28px" :sharp="false" class="rounded-lg" />
      <n-skeleton width="140px" height="14px" :sharp="false" />
    </div>

    <div class="flex items-center justify-between gap-3 px-2 pb-3 min-h-[40px]">
      <div class="flex items-center gap-2">
        <n-skeleton width="80px" height="24px" :sharp="false" />
        <n-skeleton width="64px" height="12px" :sharp="false" />
      </div>
      <n-skeleton width="68px" height="28px" round />
    </div>
  </div>
</template>
