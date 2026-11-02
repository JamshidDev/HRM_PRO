<script setup>
  /**
   * Figma v3 · Tab 2 "Ishga qabul va ishdan bo'shatish" — oylik dinamika.
   *
   * Maketdagi grafik konteyneri (`bg-secondary`, 12px radius) va o'q uslublari
   * bilan bir xil: uzuq chiziqli setka, `--fig-text-tertiary` o'q yozuvlari,
   * mavzu almashganda ranglar tokenlardan qayta o'qiladi.
   */
  import VChart from 'vue-echarts'
  import { use, graphic } from 'echarts/core'
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

  /** Ustun to'ldirmasi — tepasi to'q, pasti shaffofroq. `#rrggbb` kutiladi. */
  const barFill = (color) =>
    new graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color },
      { offset: 1, color: /^#[0-9a-f]{6}$/i.test(color) ? `${color}40` : color }
    ])

  /** Kontraktga kirmagan legacy maydon: oylik yangi/tugagan shartnomalar. */
  const contracts = computed(() => store.legacy.contracts || [])

  const months = computed(() =>
    contracts.value.map((item) => Utils.getMonthNameByKey(item.month.split('-')[1]))
  )

  // FXSH (o'rindoshlik) asosiy ustun ustida och qatlam — asosiy qiymat oylik hisobot bilan bir xil.
  const SERIES = [
    { key: 'incoming', field: 'new_contracts', stack: 'in', token: '--fig-bg-brand-fill' },
    { key: 'incomingFxsh', field: 'new_fxsh', stack: 'in', token: '--fig-bg-brand-fill', light: true },
    { key: 'outgoing', field: 'ended_contracts', stack: 'out', token: '--fig-icon-red' },
    { key: 'outgoingFxsh', field: 'ended_fxsh', stack: 'out', token: '--fig-icon-red', light: true }
  ]
  const series = computed(() =>
    SERIES.map((s) => ({
      ...s,
      value: contracts.value.reduce((sum, item) => sum + Number(item[s.field] || 0), 0),
      data: contracts.value.map((item) => Number(item[s.field] || 0))
    }))
  )
  // Ustki qatlam bo'lmagan oyda asosiy ustun tepasi yumaloq qoladi.
  const topValue = (s, index) => {
    if (s.light) return 0
    const fxsh = series.value.find((x) => x.stack === s.stack && x.light)
    return fxsh?.data[index] || 0
  }

  // Kursor ostidagi ustun (series index). Ustun ustida — tooltipda faqat uning qatori;
  // oyning bo'sh joyida (ustunlar orasida) — ikkalasi ham.
  let hoveredSeries = null

  const tooltipRow = (p) =>
    `<div style="display:flex;align-items:center;gap:8px;line-height:20px">${p.marker}` +
    `<span style="flex:1">${p.seriesName}</span>` +
    `<b style="margin-left:16px">${Utils.formatNumberToMoney(p.value) || 0}</b></div>`

  const tooltipHtml = (params) => {
    const list = Array.isArray(params) ? params : [params]
    const own = list.filter((p) => p.seriesIndex === hoveredSeries)
    const rows = hoveredSeries === null || !own.length ? list : own
    return `<div style="margin-bottom:2px">${list[0]?.axisValueLabel ?? ''}</div>${rows.map(tooltipRow).join('')}`
  }

  // ECharts tooltip matnini ustunning `mouseover` hodisasidan oldin tuzadi va o'sha oy
  // ichida qayta tuzmaydi. Shuning uchun oxirgi tooltipning `callback`i saqlanadi va
  // ustun almashganda matn joyida yangilanadi (grafikka hech qanday amal yuborilmaydi).
  let lastTip = null
  const tooltipFormatter = (params, ticket, callback) => {
    lastTip = { params, ticket, callback }
    return tooltipHtml(params)
  }
  const setHovered = (index) => {
    if (hoveredSeries === index) return
    hoveredSeries = index
    if (lastTip) lastTip.callback(lastTip.ticket, tooltipHtml(lastTip.params))
  }
  const onBarOver = (e) => {
    if (e.componentType === 'series') setHovered(e.seriesIndex)
  }
  const onBarOut = () => setHovered(null)

  const option = computed(() => {
    // `isDark` ga bog'lanamiz — mavzu almashganda grafik ranglari yangilanadi.
    appStore.isDark
    const axis = tokenColor('--fig-text-tertiary')
    const split = tokenColor('--fig-br-disable')

    return {
      grid: { top: 12, left: 4, right: 8, bottom: 0, containLabel: true },
      tooltip: {
        // `body` ga ko'chiriladi: aks holda `.main-content` dagi
        // `overflow-x: hidden` tooltipni kontent chegarasida kesadi.
        appendTo: 'body',
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: tooltipFormatter,
        backgroundColor: tokenColor('--surface-section'),
        borderColor: tokenColor('--surface-line'),
        textStyle: { color: tokenColor('--fig-text-primary'), fontSize: 12 }
      },
      xAxis: {
        type: 'category',
        data: months.value,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: axis, fontSize: 11, margin: 12 }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: axis, fontSize: 11 },
        splitLine: { lineStyle: { color: split, type: 'dashed' } }
      },
      series: series.value.map((item) => {
        const base = tokenColor(item.token)
        const color = item.light && /^#[0-9a-f]{6}$/i.test(base) ? `${base}66` : base
        return {
          name: t(`dashboardPage.yearly.${item.key}`),
          type: 'bar',
          stack: item.stack,
          barMaxWidth: 22,
          // Juftlik zich, oylar orasi keng — ustunlar oy bo'yicha guruhlanib ko'rinadi.
          barGap: '15%',
          barCategoryGap: '42%',
          data: item.data.map((value, index) => ({
            value,
            itemStyle: { borderRadius: topValue(item, index) ? 0 : [8, 8, 0, 0] }
          })),
          itemStyle: { color: item.light ? color : barFill(color) },
          emphasis: { focus: 'series', itemStyle: { color } }
        }
      })
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
    <!-- ikkita ko'rsatkich legendasi: bitta qatorda nuqta + nom + yillik jami -->
    <div class="flex flex-wrap gap-x-6 gap-y-1 px-2 pb-2">
      <div v-for="item in series" :key="item.key" class="flex items-center gap-2 px-3">
        <span
          class="h-2.5 w-2.5 shrink-0 rounded-full"
          :class="item.light && 'opacity-40'"
          :style="{ backgroundColor: `var(${item.token})` }"
        ></span>
        <p class="text-[14px] leading-5 whitespace-nowrap text-fig-text-muted">
          {{ $t(`dashboardPage.yearly.${item.key}`) }}
        </p>
        <p class="text-[18px] leading-6 font-bold whitespace-nowrap text-fig-text-primary">
          {{ Utils.formatNumberToMoney(item.value) || 0 }}
        </p>
      </div>
    </div>

    <div
      class="mx-2 mb-2 min-h-[200px] flex-1 rounded-xl p-2"
    >
      <v-chart
        autoresize
        :option="option"
        class="h-full min-h-[240px] w-full"
        @mouseover="onBarOver"
        @mouseout="onBarOut"
      />
    </div>
  </FigPanel>
</template>
