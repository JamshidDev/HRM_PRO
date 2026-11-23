<script setup>
  import VChart from 'vue-echarts'
  import { useTurnstileDashboardStore, useAppStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { use, graphic } from 'echarts/core'
  import { BarChart } from 'echarts/charts'
  import { TooltipComponent, GridComponent, MarkLineComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import { PALETTE } from './palette.js'
  import { Utils } from '@/utils/index.js'

  use([TooltipComponent, GridComponent, MarkLineComponent, BarChart, CanvasRenderer])

  const store = useTurnstileDashboardStore()
  const appStore = useAppStore()

  const tokenColor = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim()

  const dashboardStore = useTurnstileDashboardStore()
  const { t } = i18n.global

  // Har daqiqada yangilanadigan soat — «Hozir» chizig'i vaqt o'tishi bilan siljiydi.
  const clock = ref(Date.now())
  let clockTimer = null
  onMounted(() => (clockTimer = setInterval(() => (clock.value = Date.now()), 60 * 1000)))
  onBeforeUnmount(() => clearInterval(clockTimer))

  // «Hozir» — hozirgi vaqt tushgan oraliq yorlig'i (oraliq boshi bo'yicha: 2 soatlikda 11:40 → «10:00»).
  const nowHour = computed(() => {
    const now = new Date(clock.value)
    const picked = new Date(dashboardStore.dashboardParams.date || clock.value)
    if (picked.toDateString() !== now.toDateString()) return null
    const list = Array.isArray(dashboardStore.dailyEvents) ? dashboardStore.dailyEvents : []
    const nowMin = now.getHours() * 60 + now.getMinutes()
    const started = list.filter((v) => toMinutes(v.hour) <= nowMin)
    return started.length ? started[started.length - 1].hour : null
  })

  // Oraliq: yorliq = oraliq BOSHI (backend 2 soatlik: 00:00 … 22:00 kunni to'liq qoplaydi).
  // `hour` — 2 soatlik oraliq boshi (00:00 = 00:00–01:59).
  const toMinutes = (hour) => {
    const [h, m] = String(hour).split(':').map(Number)
    return (h || 0) * 60 + (m || 0)
  }
  const bucketEnd = (hour, list) => {
    const step = list.length > 1 ? toMinutes(list[1].hour) - toMinutes(list[0].hour) : 60
    const sum = toMinutes(hour) + step
    if (sum === 24 * 60) return '24:00'
    const end = sum % (24 * 60)
    return `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`
  }

  const alpha = (hex, a) => (/^#[0-9a-f]{6}$/i.test(hex) ? `${hex}${a}` : hex)
  const option = computed(() => {
    appStore.isDark
    const axis = tokenColor('--fig-text-tertiary')
    const split = tokenColor('--fig-br-disable')
    const main = tokenColor(PALETTE.main)
    const events = Array.isArray(dashboardStore.dailyEvents) ? dashboardStore.dailyEvents : []
    const peak = Math.max(0, ...events.map((v) => v.count || 0))
    const fill = (top, bottom) =>
      new graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: top },
        { offset: 1, color: bottom }
      ])

    return {
      tooltip: {
        // `body` ga ko'chiriladi: aks holda `.main-content` dagi
        // `overflow-x: hidden` tooltipni kontent chegarasida kesadi.
        appendTo: 'body',
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        // «08:00 – 10:00» va «9 620 xodim» — oraliq aniq ko'rinsin.
        formatter: (params) => {
          const p = Array.isArray(params) ? params[0] : params
          const next = bucketEnd(p.name, events)
          const count = Utils.formatNumberToMoney(p.value) || 0
          return `${p.name} – ${next}<br/>${p.marker}<b>${count}</b> ${t('turnStileDashboard.hourly.people')}`
        },
        backgroundColor: tokenColor('--surface-section'),
        borderColor: tokenColor('--surface-line'),
        textStyle: { color: tokenColor('--fig-text-primary'), fontSize: 12 }
      },
      // O'ngda 20px — oxirgi «23:00» yorlig'i chetda kesilmasin.
      grid: { top: 22, left: 4, right: 20, bottom: 0, containLabel: true },
      xAxis: {
        type: 'category',
        data: events.map((v) => v.hour),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: axis, fontSize: 11, margin: 12 }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: axis, fontSize: 11 },
        splitLine: { lineStyle: { color: split, type: 'dashed' } }
      },
      series: [
        {
          name: t('turnStileDashboard.form.workerCount'),
          type: 'bar',
          barMaxWidth: 22,
          barCategoryGap: '30%',
          data: events.map((v) => ({
            value: v.count,
            itemStyle: {
              borderRadius: [6, 6, 2, 2],
              color:
                peak && v.count === peak
                  ? fill(main, alpha(main, '99'))
                  : fill(alpha(main, '73'), alpha(main, '26'))
            }
          })),
          emphasis: { itemStyle: { color: main } },
          // O'rtacha qiymat — uzuq chiziq; bugun bo'lsa joriy soatda «Hozir» chizig'i.
          markLine: {
            silent: true,
            symbol: 'none',
            label: { show: false },
            lineStyle: { color: axis, width: 1, type: 'dashed' },
            data: [
              { type: 'average' },
              ...(nowHour.value
                ? [
                    {
                      xAxis: nowHour.value,
                      lineStyle: { color: tokenColor('--fig-text-primary'), width: 1.5, type: 'solid' },
                      label: {
                        show: true,
                        position: 'end',
                        formatter: t('turnStileDashboard.live.now'),
                        color: tokenColor('--fig-block-bg'),
                        backgroundColor: tokenColor('--fig-text-primary'),
                        borderRadius: 6,
                        padding: [2, 6],
                        fontSize: 10,
                        fontWeight: 600
                      }
                    }
                  ]
                : [])
            ]
          }
        }
      ]
    }
  })

</script>

<template>
  <div class="w-full h-full relative">
    <n-skeleton
      v-if="store.dailyAttendanceLoading"
      width="100%"
      height="100%"
      :sharp="false"
      class="rounded-lg"
    />
    <v-chart v-else autoresize class="w-full h-full" :option="option" />
  </div>
</template>
