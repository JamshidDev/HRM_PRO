<script setup>
  import VChart from 'vue-echarts'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { use } from 'echarts/core'
  import { BarChart } from 'echarts/charts'
  import { TooltipComponent, GridComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import { onMounted, nextTick } from 'vue'

  use([TooltipComponent, GridComponent, BarChart, CanvasRenderer])

  const emit = defineEmits(['barClick'])
  const store = useTurnstileDashboardStore()
  const { t } = i18n.global
  const chartRef = ref(null)

  const tokenColor = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim()

  // Method to get start_time and end_time for a given hour
  const getTimeRange = (hour) => {
    // Parse the hour (e.g., "07:00" -> 7)
    const hourNum = parseInt(hour.split(':')[0])

    // Calculate start_time (previous hour)
    const startHour = hourNum - 1
    const startTime = `${startHour.toString().padStart(2, '0')}:00`

    // Calculate end_time (next hour)
    const endHour = hourNum + 1
    const endTime = `${endHour.toString().padStart(2, '0')}:00`

    return {
      start_time: startTime,
      end_time: hour
    }
  }

  // Bar click handler
  const onBarClick = (params) => {
    const timeRange = getTimeRange(params.name)
    emit('barClick', timeRange)
  }

  const option = ref({
    tooltip: {
      // `body` ga ko'chiriladi: aks holda `.main-content` dagi
      // `overflow-x: hidden` tooltipni kontent chegarasida kesadi.
      appendTo: 'body',
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: tokenColor('--surface-section'),
      borderColor: tokenColor('--surface-line'),
      textStyle: {
        color: tokenColor('--fig-text-primary')
      }
    },
    grid: {
      left: '1%',
      top: '10%',
      right: '1%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: [],
      axisLabel: {
        show: true,
        fontSize: 10,
        lineHeight: 15,
        color: tokenColor('--fig-text-secondary')
      },
      axisTick: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: tokenColor('--fig-br-disable'),
          width: 1
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: [3, 3],
          color: tokenColor('--fig-br-secondary')
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 10,
        color: tokenColor('--fig-text-primary')
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: [3, 3],
          color: tokenColor('--fig-br-secondary')
        }
      }
    },
    // Maketda har bir sana ustida chapda yashil (erta ketgan), o'ngda
    // to'q sariq (kech kelgan) ustun turadi — seriya tartibi shunga mos.
    series: [
      {
        name: t('turnStileDashboard.cards.earlyGo'),
        type: 'bar',
        barWidth: '30%',
        barMaxWidth: 10,
        barGap: '30%',
        data: [],
        itemStyle: {
          color: tokenColor('--fig-green-400'),
          borderRadius: [3, 3, 0, 0]
        }
      },
      {
        name: t('turnStileDashboard.cards.lateCome'),
        type: 'bar',
        barWidth: '30%',
        barMaxWidth: 10,
        data: [],
        itemStyle: {
          color: tokenColor('--fig-orange-300'),
          borderRadius: [3, 3, 0, 0]
        }
      }
    ]
  })

  watch(
    () => store.workTime,
    (newValue) => {
      if (!newValue) return

      // Backend sanalarni teskari tartibda (yangidan eskiga) qaytaradi va ikki
      // massivdagi sanalar to'plami har doim ham bir xil bo'lmaydi. Shuning uchun
      // sanalarni birlashtirib o'sish bo'yicha saralaymiz — eng oxirgi kun o'ngda.
      const early = newValue.late_and_early?.early || []
      const late = newValue.late_and_early?.late || []

      const countByDate = (list) =>
        list.reduce((acc, v) => {
          acc[v.date] = v.count
          return acc
        }, {})
      const earlyMap = countByDate(early)
      const lateMap = countByDate(late)

      const dates = [...new Set([...Object.keys(earlyMap), ...Object.keys(lateMap)])].sort()

      option.value.xAxis.data = dates.map((d) => d.slice(-5))
      option.value.series[0].data = dates.map((d) => earlyMap[d] ?? 0)
      option.value.series[1].data = dates.map((d) => lateMap[d] ?? 0)

      // Add click listener after data is updated
      nextTick(() => {
        if (chartRef.value) {
          setTimeout(() => {
            const chartInstance = chartRef.value.chart
            if (chartInstance) {
              chartInstance.off('click') // Remove existing listener
              chartInstance.on('click', onBarClick) // Add new listener
            }
          }, 100)
        }
      })
    },
    {
      immediate: true
    }
  )

  // Add click event listener when chart is ready
  onMounted(() => {
    nextTick(() => {
      if (chartRef.value) {
        // Wait a bit more for chart to be fully rendered
        setTimeout(() => {
          const chartInstance = chartRef.value.chart
          if (chartInstance) {
            chartInstance.on('click', onBarClick)
          }
        }, 100)
      }
    })
  })
</script>

<template>
  <div class="w-full h-full relative">
    <div class="w-full h-full relative z-2">
      <v-chart autoresize class="w-full h-full" :option="option" ref="chartRef" />
    </div>
  </div>
</template>

<style scoped></style>
