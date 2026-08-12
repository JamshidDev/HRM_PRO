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
    class="border border-surface-line p-4 rounded-2xl bg-surface-section/75 relative overflow-hidden"
  >
    <div class="flex items-start gap-3">
      <n-skeleton width="32px" height="32px" :sharp="false" class="rounded-[10px]" />
      <div class="pt-1">
        <n-skeleton width="120px" height="14px" :sharp="false" />
      </div>
      <span class="ml-auto flex items-center">
        <n-skeleton :width="88" round size="medium" />
      </span>
    </div>

    <div class="mt-4">
      <n-skeleton width="110px" height="30px" :sharp="false" />
    </div>

    <div class="border-t border-surface-line mt-4 pt-3">
      <n-skeleton width="150px" height="12px" :sharp="false" />
    </div>
  </div>
</template>
