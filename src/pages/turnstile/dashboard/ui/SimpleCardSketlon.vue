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

    <div class="flex items-center justify-between gap-3 px-2">
      <n-skeleton width="96px" height="24px" :sharp="false" />
      <n-skeleton :width="68" round size="small" />
    </div>

    <div class="bg-surface-ground-soft rounded-xl px-3 py-1.5 mt-auto">
      <div class="flex items-center justify-between gap-2">
        <n-skeleton width="130px" height="12px" :sharp="false" />
        <n-skeleton width="70px" height="12px" :sharp="false" />
      </div>
    </div>
  </div>
</template>
