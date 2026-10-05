<script setup>
  /**
   * «Oylik faollik» — kunlik amallar, tur bo'yicha ustma-ust ustunlar
   * (Figma node 3831:81366).
   *
   * Maket o'lchamlari: 232px balandlik, Y o'qi yozuvlari chapda 36px zonada,
   * nol chizig'i pastdan 24px yuqorida, ustun 12px. Faol (hover qilingan yoki
   * sukut bo'yicha eng faol) kun to'liq rangda, qolganlari 45% shaffoflikda.
   */
  import HeadChartLine from '@/assets/icons/hrmDashboard/activity/head-chart-line.svg?url'
  import AvgLine from '@/assets/icons/hrmDashboard/activity/avg-line.svg?url'
  import { actionTypes, dayMonthWeek, formatCount, isWeekend, totalOf } from './utils.js'

  const props = defineProps({
    daily: { type: Array, default: () => [] },
    year: { type: Number, required: true },
    // 0..11
    month: { type: Number, required: true },
    average: { type: Number, default: 0 }
  })

  // Maket geometriyasi (px)
  const AXIS_LEFT = 36
  const PLOT_TOP = 8
  const PLOT_HEIGHT = 200

  const days = computed(() => props.daily.map((item) => ({ ...item, total: totalOf(item) })))

  // Y o'qi 4 bo'lakka bo'linadi, qadam 200 ga yaxlitlanadi (maketda 0..800).
  const scaleMax = computed(() => {
    const max = Math.max(0, ...days.value.map((d) => d.total))
    return Math.max(800, Math.ceil(max / 200) * 200)
  })
  const ticks = computed(() => [4, 3, 2, 1, 0].map((i) => (scaleMax.value / 4) * i))

  const tickTop = (value) => PLOT_TOP + (1 - value / scaleMax.value) * PLOT_HEIGHT
  const segHeight = (value) => `${(value / scaleMax.value) * PLOT_HEIGHT}px`

  const peakIndex = computed(() => {
    let best = -1
    days.value.forEach((d, idx) => {
      if (best < 0 || d.total > days.value[best].total) best = idx
    })
    return best
  })

  const hoverIndex = ref(null)
  const activeIndex = computed(() => hoverIndex.value ?? peakIndex.value)
  const active = computed(() => days.value[activeIndex.value] || null)

  // Tooltip faol ustunning o'ng tomonida; o'ng chetga yaqin bo'lsa chapga o'tadi.
  const tooltipStyle = computed(() => {
    const n = days.value.length || 1
    const center = `(100% - ${AXIS_LEFT}px) * ${(activeIndex.value + 0.5) / n}`
    const flip = activeIndex.value > n * 0.62
    return flip
      ? { left: `calc(${AXIS_LEFT}px + ${center} - 16px)`, transform: 'translateX(-100%)' }
      : { left: `calc(${AXIS_LEFT}px + ${center} + 16px)` }
  })

  const labelClass = (d, idx) => {
    if (idx === activeIndex.value) return 'font-semibold text-fig-text-primary'
    return isWeekend(props.year, props.month, d.day) ? 'text-fig-neutral-300' : 'text-[#98a2b3]'
  }
</script>

<template>
  <div class="flex h-full flex-col gap-4 rounded-2xl bg-fig-block shadow-card p-4">
    <div class="flex w-full flex-wrap items-center justify-between gap-2">
      <div class="flex min-w-0 flex-1 items-center gap-2.5">
        <span class="flex shrink-0 items-center rounded-full bg-fig-blue-100 p-1.5">
          <img :src="HeadChartLine" alt="" width="20" height="20" class="block" />
        </span>
        <p class="truncate text-[14px] leading-[18px] font-semibold text-fig-text-primary">
          {{ $t('dashboardPage.activity.monthly') }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <div
          v-for="type in actionTypes"
          :key="type.key"
          class="flex items-center gap-1 rounded-xl bg-fig-bg-secondary px-2 py-1.5"
        >
          <span class="size-2 shrink-0 rounded-full" :class="type.color"></span>
          <span class="text-[12px] leading-4 whitespace-nowrap text-fig-text-tertiary">
            {{ $t(type.label) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Tor ekranda 31 ta ustun siqilib ketmasligi uchun gorizontal skroll -->
    <div class="w-full overflow-x-auto">
      <div
        class="activity-chart relative h-[232px] w-full min-w-[560px]"
        @mouseleave="hoverIndex = null"
      >
        <!-- Y o'qi: yozuv + to'r chizig'i -->
        <template v-for="tick in ticks" :key="tick">
          <div
            class="absolute right-0 h-px"
            :class="tick === 0 ? 'bg-[#e4e9f2]' : 'bg-fig-bg-disable'"
            :style="{ left: `${AXIS_LEFT}px`, top: `${tickTop(tick)}px` }"
          ></div>
          <p
            class="absolute w-7 text-right text-[10.5px] leading-[14px] text-[#98a2b3]"
            :style="{ left: 0, top: `${tickTop(tick) - 7}px` }"
          >
            {{ tick }}
          </p>
        </template>

        <!-- Kunlar: har biri teng kenglikdagi ustun, ustun va yozuv markazda -->
        <div class="absolute top-0 right-0 bottom-0 flex" :style="{ left: `${AXIS_LEFT}px` }">
          <div
            v-for="(d, idx) in days"
            :key="d.day"
            class="relative min-w-0 flex-1 cursor-pointer"
            @mouseenter="hoverIndex = idx"
          >
            <div
              class="absolute left-1/2 flex w-3 -translate-x-1/2 flex-col-reverse overflow-hidden rounded-t-[3px] transition-opacity"
              :class="idx === activeIndex ? 'opacity-100' : 'opacity-45'"
              :style="{ bottom: `${232 - PLOT_TOP - PLOT_HEIGHT}px` }"
            >
              <span
                v-for="type in actionTypes"
                :key="type.key"
                class="block w-full shrink-0"
                :class="type.color"
                :style="{ height: segHeight(d[type.key] || 0) }"
              ></span>
            </div>
            <p
              class="absolute left-1/2 top-[216px] -translate-x-1/2 text-[10px] leading-3 whitespace-nowrap"
              :class="labelClass(d, idx)"
            >
              {{ d.day }}
            </p>
          </div>
        </div>

        <!-- O'rtacha chiziq -->
        <template v-if="average">
          <img
            :src="AvgLine"
            alt=""
            class="pointer-events-none absolute right-0 h-px"
            :style="{
              left: `${AXIS_LEFT}px`,
              width: `calc(100% - ${AXIS_LEFT}px)`,
              top: `${tickTop(average) - 1}px`
            }"
          />
          <div
            class="pointer-events-none absolute left-[38px] rounded-md border border-fig-br-disable bg-fig-block px-1.5 py-0.5"
            :style="{ top: `${tickTop(average) - 22}px` }"
          >
            <p
              class="text-[10.5px] leading-[14px] font-medium whitespace-nowrap text-fig-text-tertiary"
            >
              {{ $t('dashboardPage.activity.average', { n: formatCount(average) }) }}
            </p>
          </div>
        </template>

        <!-- Tooltip -->
        <div
          v-if="active"
          class="activity-chart__tooltip pointer-events-none absolute top-5 z-10 flex w-[184px] flex-col gap-2 rounded-[10px] border border-fig-br-disable bg-fig-block p-3"
          :style="tooltipStyle"
        >
          <p class="text-[12px] leading-4 font-semibold whitespace-nowrap text-fig-text-primary">
            {{ dayMonthWeek(year, month, active.day) }}
          </p>
          <div
            v-for="type in actionTypes"
            :key="type.key"
            class="flex w-full items-center justify-between"
          >
            <div class="flex items-center gap-1.5">
              <span class="size-[7px] shrink-0 rounded-full" :class="type.color"></span>
              <span class="text-[12px] leading-4 whitespace-nowrap text-fig-text-tertiary">
                {{ $t(type.label) }}
              </span>
            </div>
            <span
              class="text-[12px] leading-4 font-semibold whitespace-nowrap text-fig-text-primary"
            >
              {{ formatCount(active[type.key]) }}
            </span>
          </div>
          <span class="h-px w-full bg-fig-bg-disable"></span>
          <div
            class="flex w-full items-start justify-between text-[12px] leading-4 whitespace-nowrap"
          >
            <span class="font-medium text-fig-text-secondary">{{
              $t('dashboardPage.activity.total')
            }}</span>
            <span class="font-semibold text-fig-text-primary">
              {{ $t('dashboardPage.activity.totalUnit', { n: formatCount(active.total) }) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .activity-chart__tooltip {
    box-shadow: 0 8px 24px -4px rgba(15, 23, 41, 0.12);
  }
</style>
