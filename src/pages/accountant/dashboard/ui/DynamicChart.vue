<script setup>
  import VChart from 'vue-echarts'
  import { use } from 'echarts/core'
  import { LineChart } from 'echarts/charts'
  import { TooltipComponent, GridComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import HeadChart from '@/assets/icons/accDashboard/head-chart-user-square.svg'
  import PanelHeader from './PanelHeader.vue'
  import { useAccDashboardStore, useAppStore } from '@/store/modules/index.js'
  import { toMln } from '../format.js'
  import i18n from '@/i18n/index.js'
  import Utils from '@/utils/Utils.js'
  import { AppPaths } from '@/utils/index.js'

  use([TooltipComponent, GridComponent, LineChart, CanvasRenderer])

  const store = useAccDashboardStore()
  const appStore = useAppStore()
  const router = useRouter()
  const { t } = i18n.global

  const tokenColor = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim()

  const goDetails = () => {
    router.push(Utils.routeAccountantPathMaker(AppPaths.MonthReport))
  }

  const option = computed(() => {
    // `isDark` ga bog'lanamiz — mavzu almashganda grafik ranglari ham yangilanadi.
    appStore.isDark
    const axis = tokenColor('--fig-text-tertiary')
    const split = tokenColor('--fig-br-disable')

    return {
      grid: { top: 16, left: 8, right: 12, bottom: 4, containLabel: true },
      tooltip: {
        // `body` ga ko'chiriladi: aks holda `.main-content` dagi
        // `overflow-x: hidden` tooltipni kontent chegarasida kesadi.
        appendTo: 'body',
        trigger: 'axis',
        backgroundColor: tokenColor('--surface-section'),
        borderColor: tokenColor('--surface-line'),
        textStyle: { color: tokenColor('--fig-text-primary'), fontSize: 12 },
        valueFormatter: (value) =>
          `${Utils.formatNumberToMoney(Math.round(value)) || '0'} ${t('content.mln')}`
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: store.trendMonths,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: axis, fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: axis,
          fontSize: 11,
          formatter: (value) => Utils.formatNumberToMoney(value) || '0'
        },
        splitLine: { lineStyle: { color: split, type: 'dashed' } }
      },
      series: store.trendSeries.map((item) => {
        const color = tokenColor(item.color)
        return {
          name: t(`accDashboard.trend.${item.key}`),
          type: 'line',
          smooth: true,
          showSymbol: false,
          // Maketda o'q qiymatlari mln da — seriya ham mln ga keltiriladi.
          data: item.data.map((v) => Math.round(Number(v || 0) / 1_000_000)),
          lineStyle: { width: 2.5, color },
          itemStyle: { color },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: `${color}33` },
                { offset: 1, color: `${color}00` }
              ]
            }
          }
        }
      })
    }
  })
</script>

<template>
  <div class="flex h-full flex-col rounded-2xl bg-fig-block px-1 pb-1">
    <PanelHeader
      plain
      tint="indigo"
      :icon="HeadChart"
      :title="$t('accDashboard.panel.dynamics')"
      :action-text="$t('accDashboard.panel.details')"
      @action="goDetails"
    />

    <!-- uchta ko'rsatkich legendasi: nuqta + nom + tanlangan oydagi qiymat -->
    <div class="flex flex-wrap gap-1 px-2 pb-2">
      <div
        v-for="item in store.trendTotals"
        :key="item.key"
        class="flex min-w-[160px] flex-1 flex-col justify-center gap-1 px-3"
      >
        <div class="flex items-center gap-2.5">
          <span
            class="h-2.5 w-2.5 shrink-0 rounded-full"
            :style="{ backgroundColor: `var(${item.color})` }"
          ></span>
          <p class="min-w-0 flex-1 truncate text-[14px] leading-5 text-fig-text-muted">
            {{ $t(`accDashboard.trend.${item.key}`) }}
          </p>
        </div>
        <p class="whitespace-nowrap">
          <span class="text-[20px] leading-6 font-semibold text-fig-text-primary">
            {{ toMln(item.value) }}
          </span>
          <span class="text-[14px] leading-5 text-fig-text-secondary">
            {{ $t('content.mln') }} {{ $t('content.sum') }}
          </span>
        </p>
      </div>
    </div>

    <div class="min-h-[200px] flex-1 rounded-xl bg-fig-bg-secondary p-1">
      <v-chart autoresize :option="option" class="h-full min-h-[192px] w-full" />
    </div>
  </div>
</template>
