<script setup>
  /**
   * Figma v3 · Tab 1 "Xodimlar soni trendi — 24 oy" (node 2959:58348).
   *
   * Ikki seriya: joriy davr (yashil, ostida gradient maydon) va o'tgan yilning
   * shu oylari (kulrang punktir). Gorizontal punktir chiziq — maqsadli
   * ko'rsatkich. Oxirgi nuqta yonida qiymat va o'tgan yilga nisbatan o'zgarish.
   *
   * O'q yozuvlari maketda faqat chetlarda turadi — 24 oyning hammasi yozilsa
   * matn bir-biriga qo'shilib ketadi.
   */
  import VChart from 'vue-echarts'
  import { use } from 'echarts/core'
  import { LineChart } from 'echarts/charts'
  import { TooltipComponent, GridComponent, MarkLineComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import HeadMortarboard from '@/assets/icons/hrmDashboard/head-mortarboard.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import FigTrend from '../fig/FigTrend.vue'
  import { useDashboardStore, useAppStore } from '@/store/modules/index.js'
  import { toCount } from '../../format.js'

  use([TooltipComponent, GridComponent, MarkLineComponent, LineChart, CanvasRenderer])

  defineEmits(['detail'])

  const store = useDashboardStore()
  const appStore = useAppStore()

  const tokenColor = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim()

  const card = computed(() => store.overview.headcount_trend || {})
  const series = computed(() => card.value.series || [])
  const isMock = computed(() => store.isMock('overview', 'headcount_trend'))

  /** Legendadagi ikki qator: joriy va o'tgan yil oxirgi qiymatlari. */
  const legend = computed(() => {
    const last = series.value[series.value.length - 1]
    return [
      {
        key: 'currentYear',
        token: '--fig-icon-green',
        year: card.value.to?.split('-')[0],
        value: last?.current
      },
      {
        key: 'prevYear',
        token: '--fig-neutral-300',
        year: card.value.to ? Number(card.value.to.split('-')[0]) - 1 : null,
        value: last?.prev_year
      }
    ]
  })

  const option = computed(() => {
    // `isDark` ga bog'lanamiz — mavzu almashganda grafik ranglari yangilanadi.
    appStore.isDark
    const axis = tokenColor('--fig-text-tertiary')
    const split = tokenColor('--fig-br-disable')
    const green = tokenColor('--fig-icon-green')
    const grey = tokenColor('--fig-neutral-300')
    const months = series.value.map((item) => item.month)
    const lastIdx = months.length - 1

    return {
      grid: { top: 20, left: 8, right: 56, bottom: 4, containLabel: true },
      tooltip: {
        // `body` ga ko'chiriladi: aks holda `.main-content` dagi
        // `overflow-x: hidden` tooltipni kontent chegarasida kesadi.
        appendTo: 'body',
        trigger: 'axis',
        backgroundColor: tokenColor('--surface-section'),
        borderColor: tokenColor('--surface-line'),
        textStyle: { color: tokenColor('--fig-text-primary'), fontSize: 12 }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: months,
        axisLine: { show: false },
        axisTick: { show: false },
        // maketda faqat birinchi va oxirgi oy yozilgan
        axisLabel: {
          color: axis,
          fontSize: 11,
          interval: (index) => index === 0 || index === lastIdx
        }
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLabel: { color: axis, fontSize: 11 },
        splitLine: { lineStyle: { color: split, type: 'dashed' } }
      },
      series: [
        {
          name: 'prev',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: series.value.map((item) => item.prev_year),
          lineStyle: { color: grey, width: 1.5, type: 'dashed' }
        },
        {
          name: 'current',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: false,
          data: series.value.map((item) => item.current),
          itemStyle: { color: green },
          lineStyle: { color: green, width: 2 },
          areaStyle: { color: green, opacity: 0.12 },
          endLabel: {
            show: true,
            color: tokenColor('--fig-text-primary'),
            fontSize: 12,
            fontWeight: 600,
            formatter: ({ value }) => toCount(value)
          },
          markLine: card.value.target
            ? {
                symbol: 'none',
                silent: true,
                label: { show: false },
                lineStyle: { color: split, type: 'dashed', width: 1 },
                data: [{ yAxis: card.value.target }]
              }
            : undefined
        }
      ]
    }
  })
</script>

<template>
  <FigPanel
    tint="indigo"
    :icon="HeadMortarboard"
    :title="$t('dashboardPage.headcount.title')"
    :action-text="$t('content.detail')"
    :mock="isMock"
    :inner="false"
    @action="$emit('detail')"
  >
    <div class="flex flex-col gap-2 px-2 pb-2">
      <div class="flex items-center justify-end px-2">
        <FigTrend :metric="card.last" unit="count" />
      </div>

      <div class="min-h-[200px] flex-1 rounded-xl bg-fig-bg-secondary p-1">
        <v-chart autoresize :option="option" class="h-full min-h-[220px] w-full" />
      </div>

      <div class="flex flex-wrap items-center gap-4 px-2">
        <div v-for="item in legend" :key="item.key" class="flex items-center gap-1.5">
          <span
            class="h-2.5 w-2.5 shrink-0 rounded-[3px]"
            :style="{ backgroundColor: `var(${item.token})` }"
          ></span>
          <p class="text-[12px] leading-4 whitespace-nowrap text-fig-text-secondary">
            {{ item.year }} · {{ toCount(item.value) }}
          </p>
        </div>
      </div>
    </div>
  </FigPanel>
</template>
