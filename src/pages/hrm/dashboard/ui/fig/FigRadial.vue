<script setup>
  /**
   * Figma v3 · Tab 3 "Rag'batlantirish — radial" (node 2959:59898) halqasi.
   *
   * Kulrang asos halqa ustiga rangli yoy chiziladi, markazda foiz va son
   * turadi. SVG `stroke-dasharray` bilan chiziladi — echarts kerak emas,
   * shu sababli kichik o'lchamda ham aniq ko'rinadi.
   */
  import Utils from '@/utils/Utils.js'

  const props = defineProps({
    percent: {
      type: Number,
      default: 0
    },
    count: {
      type: [Number, String],
      default: null
    },
    // `--fig-*` token nomi
    token: {
      type: String,
      default: '--fig-icon-green'
    },
    size: {
      type: Number,
      default: 96
    }
  })

  const RADIUS = 44
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS

  const dash = computed(() => {
    const value = Math.min(Math.max(props.percent || 0, 0), 100)
    return `${(value / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`
  })

  const percentLabel = computed(() => `${Math.round(props.percent || 0)} %`)
  const countLabel = computed(() =>
    props.count === null || props.count === undefined
      ? null
      : Utils.formatNumberToMoney(props.count) || String(props.count)
  )
</script>

<template>
  <div class="relative shrink-0" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg viewBox="0 0 100 100" class="h-full w-full -rotate-90">
      <circle
        cx="50"
        cy="50"
        :r="RADIUS"
        fill="none"
        stroke="var(--fig-br-disable)"
        stroke-width="10"
      />
      <circle
        cx="50"
        cy="50"
        :r="RADIUS"
        fill="none"
        :stroke="`var(${token})`"
        stroke-width="10"
        stroke-linecap="round"
        :stroke-dasharray="dash"
      />
    </svg>
    <div
      class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5"
    >
      <p class="text-[16px] leading-5 font-semibold text-fig-text-primary">{{ percentLabel }}</p>
      <p v-if="countLabel" class="text-[12px] leading-4 text-fig-text-tertiary">{{ countLabel }}</p>
    </div>
  </div>
</template>
