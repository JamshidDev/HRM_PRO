<script setup>
  import VChart from 'vue-echarts'
  import ChartSkeleton from './skeleton/ChartSkeleton.vue'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { use } from 'echarts/core'
  import { LineChart } from 'echarts/charts'
  import { TooltipComponent, GridComponent, MarkLineComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import { onMounted, nextTick } from 'vue'

  use([TooltipComponent, GridComponent, MarkLineComponent, LineChart, CanvasRenderer])

  const store = useTurnstileDashboardStore()

  const tokenColor = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim()

  const emit = defineEmits(['barClick'])
  const dashboardStore = useTurnstileDashboardStore()
  const { t } = i18n.global
  const chartRef = ref(null)

  // Method to get start_time and end_time for a given hour
  const getTimeRange = (hour) => {
    // Parse the hour (e.g., "07:00" -> 7)
    const hourNum = parseInt(hour.split(':')[0])

    // Calculate start_time (previous hour)
    const startHour = hourNum - 1
    const startTime = `${startHour.toString().padStart(2, '0')}:00`

    return {
      start_time: startTime,
      end_time: hour
    }
  }

  const onPointClick = (params) => {
    const timeRange = getTimeRange(params.name)
    emit('barClick', timeRange)
  }

  // Grafik endi skeleton o'rniga kech (yuklanish tugagach) mount bo'ladi — shuning
  // uchun click ulanishini bitta joyga yig'amiz va har mount'dan keyin qayta chaqiramiz.
  const bindChartClick = () => {
    nextTick(() => {
      if (!chartRef.value) return
      // Grafik to'liq chizilishini kutamiz
      setTimeout(() => {
        const chartInstance = chartRef.value?.chart
        if (!chartInstance) return
        chartInstance.off('click')
        chartInstance.on('click', onPointClick)
      }, 100)
    })
  }

  const option = ref({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: { color: tokenColor('--fig-br-secondary') }
      },
      backgroundColor: tokenColor('--surface-section'),
      borderColor: tokenColor('--surface-line'),
      textStyle: {
        color: tokenColor('--fig-text-primary')
      }
    },
    grid: {
      left: '1%',
      top: '8%',
      right: '1%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: [],
      axisLabel: {
        show: true,
        fontSize: 10,
        lineHeight: 15,
        color: tokenColor('--fig-text-secondary'),
        // Maketda x o'qi yorliqlari 0.2px harf oralig'i bilan
        rich: {},
        padding: [0, 0, 0, 0]
      },
      axisTick: { show: false },
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
    series: [
      {
        name: t('turnStileDashboard.form.workerCount'),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        // Chiziqning o'zi bosilganda ham `click` hodisasi chiqishi uchun.
        triggerLineEvent: true,
        data: [],
        lineStyle: {
          width: 2,
          color: tokenColor('--fig-icon-green')
        },
        itemStyle: {
          color: tokenColor('--fig-icon-green')
        },
        // Maketdagi ko'k punktir mos'yor chizig'i
        markLine: {
          silent: true,
          symbol: 'none',
          label: { show: false },
          lineStyle: {
            color: '#1570ef',
            width: 1,
            type: [3, 3]
          },
          data: [{ type: 'average' }]
        }
      }
    ]
  })

  watch(
    () => dashboardStore.dailyEvents,
    (newValue) => {
      if (!newValue || !Array.isArray(newValue)) return

      option.value.xAxis.data = newValue.map((v) => v.hour)
      option.value.series[0].data = newValue.map((v) => v.count)

      bindChartClick()
    },
    {
      immediate: true
    }
  )

  // Skeleton olib tashlangach grafik yangidan mount bo'ladi — click qayta ulanadi.
  watch(
    () => store.dailyAttendanceLoading,
    (loading) => {
      if (!loading) bindChartClick()
    }
  )

  onMounted(bindChartClick)
</script>

<template>
  <div class="w-full h-full relative">
    <ChartSkeleton v-if="store.dailyAttendanceLoading" />
    <v-chart v-else autoresize class="w-full h-full" :option="option" ref="chartRef" />
  </div>
</template>
