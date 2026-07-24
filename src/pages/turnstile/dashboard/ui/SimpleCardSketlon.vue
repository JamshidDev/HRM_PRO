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
    class="border border-surface-line hover-effect-card p-4 rounded-2xl bg-surface-section/75 relative overflow-hidden"
  >
    <div class="flex justify-between items-start">
      <n-skeleton width="40px" height="40px" :sharp="false" class="rounded-xl" />
    </div>

    <div class="z-10 text-right flex items-end justify-between mt-3">
      <div>
        <n-skeleton width="80px" height="30px" :sharp="false" />
        <div class="!mt-2">
          <n-skeleton width="120px" height="14px" :sharp="false" />
        </div>
      </div>
      <span class="flex items-center">
        <n-skeleton :width="132" round size="medium" />
      </span>
    </div>
  </div>
</template>
