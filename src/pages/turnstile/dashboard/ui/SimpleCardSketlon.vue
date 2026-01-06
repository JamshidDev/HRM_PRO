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
    class="border border-surface-line hover-effect-card px-4 py-2 rounded-xl bg-surface-section relative"
  >
    <div class="flex justify-between items-start">
      <n-skeleton width="40px" height="40px" :sharp="false" class="rounded-lg" />
      <n-skeleton width="60px" height="24px" :sharp="false" class="rounded-lg" />
    </div>

    <div class="z-10 text-right flex items-center justify-between mt-2">
      <div>
        <n-skeleton width="80px" height="28px" :sharp="false" />
        <div class="!mt-2">
          <n-skeleton width="120px" height="16px" :sharp="false" />
        </div>
      </div>
      <span class="flex items-center">
        <n-skeleton :width="132" round size="medium" />
      </span>
    </div>

    <span
      class="z-1 opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]"
    ></span>
  </div>
</template>
