<script setup>
  /**
   * Figma v3 · Tab 2 "Shtat va fakt — bo'linma kesimida" (node 2959:59116).
   *
   * Har bir bo'linma uchun: yuqorida nom, `fakt / reja`, bajarilish foizi va
   * trend; ostida to'liq kenglikdagi trek — rangli bar fakt, qora vertikal
   * chiziq esa shtat rejasini belgilaydi.
   *
   * Bar rangi bajarilish darajasiga qarab tanlanadi (maketdagi kabi: 97 % —
   * yashil, 93 % — ko'k, 80 % — amber, 66 % — qizil).
   */
  import FigTrend from './FigTrend.vue'
  import { toCount, toRoundPercent } from '../../format.js'

  const props = defineProps({
    label: String,
    actual: {
      type: Number,
      default: 0
    },
    plan: {
      type: Number,
      default: 0
    },
    percent: {
      type: Number,
      default: null
    },
    metric: {
      type: Object,
      default: null
    },
    // Trekni normallashtirish uchun barcha qatorlardagi eng katta qiymat
    maxValue: {
      type: Number,
      default: 0
    }
  })

  const ratio = (value) => (props.maxValue ? (Number(value || 0) / props.maxValue) * 100 : 0)

  const token = computed(() => {
    const percent = Number(props.percent ?? 0)
    if (percent >= 95) return '--fig-icon-green'
    if (percent >= 90) return '--fig-icon-brand'
    if (percent >= 75) return '--fig-icon-amber'
    return '--fig-icon-red'
  })

  const percentClass = computed(() =>
    Number(props.percent ?? 0) >= 90 ? 'text-fig-text-green' : 'text-fig-text-red'
  )
</script>

<template>
  <div class="flex flex-col gap-1.5 py-2">
    <div class="flex items-center gap-2">
      <p class="min-w-0 flex-1 truncate text-[12px] leading-4 text-fig-text-secondary">
        {{ label }}
      </p>
      <p class="shrink-0 text-[12px] leading-4 font-semibold whitespace-nowrap text-fig-text-primary">
        {{ toCount(actual) }} / {{ toCount(plan) }}
      </p>
      <p
        class="w-[46px] shrink-0 text-right text-[12px] leading-4 font-semibold"
        :class="percentClass"
      >
        {{ toRoundPercent(percent) }}
      </p>
      <div class="w-[92px] shrink-0">
        <FigTrend :metric="metric" unit="pp" :label-key="null" />
      </div>
    </div>

    <div class="relative h-2.5 w-full rounded-full bg-fig-bg-tertiary">
      <span
        class="absolute top-0 left-0 h-full rounded-full"
        :style="{ width: `${ratio(actual)}%`, backgroundColor: `var(${token})` }"
      ></span>
      <!-- shtat reja belgisi: maketda barni kesib o'tuvchi to'q vertikal chiziq -->
      <span
        class="absolute -top-1 h-[18px] w-[2px] rounded-full bg-fig-text-primary"
        :style="{ left: `calc(${ratio(plan)}% - 1px)` }"
      ></span>
    </div>
  </div>
</template>
