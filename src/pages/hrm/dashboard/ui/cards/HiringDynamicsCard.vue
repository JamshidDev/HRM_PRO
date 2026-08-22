<script setup>
  /**
   * Figma v3 · Tab 2 "Ishga qabul va ishdan bo'shatish" — oylik dinamika.
   *
   * Maketdagi grafik konteyneri (`bg-secondary`, 12px radius) va o'q uslublari
   * bilan bir xil: uzuq chiziqli setka, `--fig-text-tertiary` o'q yozuvlari,
   * mavzu almashganda ranglar tokenlardan qayta o'qiladi.
   */
  import VChart from 'vue-echarts'
  import { use } from 'echarts/core'
  import { BarChart } from 'echarts/charts'
  import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import HeadMortarboard from '@/assets/icons/hrmDashboard/head-mortarboard.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import { useDashboardStore, useAppStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import Utils from '@/utils/Utils.js'

  use([TooltipComponent, GridComponent, LegendComponent, BarChart, CanvasRenderer])

  defineEmits(['detail'])

  const store = useDashboardStore()
  const appStore = useAppStore()
  const { t } = i18n.global

  const tokenColor = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim()

  /** Kontraktga kirmagan legacy maydon: oylik yangi/tugagan shartnomalar. */
  const contracts = computed(() => store.legacy.contracts || [])

  const months = computed(() =>
    contracts.value.map((item) => Utils.getMonthNameByKey(item.month.split('-')[1]))
  )

  const series = computed(() => [
    {
      key: 'incoming',
      token: '--fig-icon-green',
      value: contracts.value.reduce((sum, item) => sum + Number(item.new_contracts || 0), 0),
      data: contracts.value.map((item) => Number(item.new_contracts || 0))
    },
    {
      key: 'outgoing',
      token: '--fig-icon-red',
      value: contracts.value.reduce((sum, item) => sum + Number(item.ended_contracts || 0), 0),
      data: contracts.value.map((item) => Number(item.ended_contracts || 0))
    }
  ])

  const option = computed(() => {
    // `isDark` ga bog'lanamiz — mavzu almashganda grafik ranglari yangilanadi.
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
        axisPointer: { type: 'shadow' },
        backgroundColor: tokenColor('--surface-section'),
        borderColor: tokenColor('--surface-line'),
        textStyle: { color: tokenColor('--fig-text-primary'), fontSize: 12 }
      },
      xAxis: {
        type: 'category',
        data: months.value,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: axis, fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: axis, fontSize: 11 },
        splitLine: { lineStyle: { color: split, type: 'dashed' } }
      },
      series: series.value.map((item) => ({
        name: t(`dashboardPage.yearly.${item.key}`),
        type: 'bar',
        barMaxWidth: 18,
        data: item.data,
        itemStyle: { color: tokenColor(item.token), borderRadius: [6, 6, 0, 0] }
      }))
    }
  })
</script>

<template>
  <FigPanel
    tint="indigo"
    :icon="HeadMortarboard"
    :title="$t('dashboardPage.yearly.title')"
    :action-text="$t('content.detail')"
    :inner="false"
    @action="$emit('detail')"
  >
    <!-- ikkita ko'rsatkich legendasi: nuqta + nom + yillik jami -->
    <div class="flex flex-wrap gap-1 px-2 pb-2">
      <div
        v-for="item in series"
        :key="item.key"
        class="flex min-w-[160px] flex-1 flex-col justify-center gap-1 px-3"
      >
        <div class="flex items-center gap-2.5">
          <span
            class="h-2.5 w-2.5 shrink-0 rounded-full"
            :style="{ backgroundColor: `var(${item.token})` }"
          ></span>
          <p class="min-w-0 flex-1 truncate text-[14px] leading-5 text-fig-text-muted">
            {{ $t(`dashboardPage.yearly.${item.key}`) }}
          </p>
        </div>
        <p class="text-[20px] leading-6 font-semibold whitespace-nowrap text-fig-text-primary">
          {{ Utils.formatNumberToMoney(item.value) || 0 }}
        </p>
      </div>
    </div>

    <div class="min-h-[200px] flex-1 rounded-xl bg-fig-bg-secondary p-1">
      <v-chart autoresize :option="option" class="h-full min-h-[240px] w-full" />
    </div>
  </FigPanel>
</template>
