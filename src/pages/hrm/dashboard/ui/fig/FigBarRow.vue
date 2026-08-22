<script setup>
  /**
   * Figma v3 gorizontal bar qatori — ikki kartada ishlatiladi:
   *
   *   "Yosh va jins bo'yicha tuzilma" (node 2959:58420) — bar chapda, ostidan
   *   nom/son/foiz/trend ketadi; bar ikki rangli (erkak + ayol).
   *
   *   "Ochiq vakansiyalar — lavozimlar" (node 2966:69137) — nom chapda, keyin
   *   bar; bar bir rangli.
   *
   * Tartibni `labelFirst` boshqaradi. Bar eni eng katta qiymatga nisbatan
   * hisoblanadi (`maxValue`), foiz esa alohida beriladi — u umumiy songa
   * nisbatan bo'lgani uchun bar eni bilan mos kelmasligi mumkin.
   */
  import FigTrend from './FigTrend.vue'
  import { toCount, toRoundPercent } from '../../format.js'

  const props = defineProps({
    label: String,
    // [{ value, token }] — bir yoki bir nechta rangli bo'lak
    segments: {
      type: Array,
      default: () => []
    },
    // Bar enini normallashtirish uchun eng katta qator qiymati
    maxValue: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: null
    },
    percent: {
      type: Number,
      default: null
    },
    metric: {
      type: Object,
      default: null
    },
    trendUnit: {
      type: String,
      default: 'count'
    },
    labelFirst: Boolean,
    labelWidth: {
      type: Number,
      default: 150
    }
  })

  const total = computed(() =>
    props.segments.reduce((sum, item) => sum + Number(item.value || 0), 0)
  )

  /** Butun barning konteynerdagi ulushi. Nol qatorda ham ingichka chiziq qoladi. */
  const barWidth = computed(() =>
    props.maxValue ? Math.max((total.value / props.maxValue) * 100, 2) : 0
  )

  /** Bo'laklarning bar ichidagi ulushi. */
  const parts = computed(() =>
    props.segments.map((item) => ({
      token: item.token,
      width: total.value ? (Number(item.value || 0) / total.value) * 100 : 0
    }))
  )
</script>

<template>
  <div class="flex items-center gap-2 py-1.5">
    <p
      v-if="labelFirst"
      class="shrink-0 truncate text-[12px] leading-4 text-fig-text-secondary"
      :style="{ width: `${labelWidth}px` }"
    >
      {{ label }}
    </p>

    <div class="flex h-4 min-w-px flex-1 items-center">
      <span class="flex h-full overflow-hidden rounded-full" :style="{ width: `${barWidth}%` }">
        <span
          v-for="(part, idx) in parts"
          :key="idx"
          class="h-full"
          :style="{ width: `${part.width}%`, backgroundColor: `var(${part.token})` }"
        ></span>
      </span>
    </div>

    <p
      v-if="!labelFirst"
      class="shrink-0 truncate text-[12px] leading-4 text-fig-text-secondary"
      :style="{ width: `${labelWidth}px` }"
    >
      {{ label }}
    </p>

    <p
      class="w-[56px] shrink-0 text-right text-[12px] leading-4 font-semibold text-fig-text-primary"
    >
      {{ toCount(count) }}
    </p>
    <p class="w-[38px] shrink-0 text-right text-[12px] leading-4 text-fig-text-tertiary">
      {{ toRoundPercent(percent) }}
    </p>

    <div class="w-[118px] shrink-0">
      <FigTrend :metric="metric" :unit="trendUnit" :label-key="null" />
    </div>
  </div>
</template>
