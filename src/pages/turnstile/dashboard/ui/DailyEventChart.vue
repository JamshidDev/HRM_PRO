<script setup>
  import VChart from 'vue-echarts'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { use, graphic } from 'echarts/core'
  import { LineChart } from 'echarts/charts'
  import { TooltipComponent, GridComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import { onMounted, nextTick } from 'vue'

  use([TooltipComponent, GridComponent, LineChart, CanvasRenderer])

  const store = useTurnstileDashboardStore()

  const tokenColor = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim()

  const hexToRgba = (hex, alpha) => {
    const v = hex.replace('#', '')
    const r = parseInt(v.substring(0, 2), 16)
    const g = parseInt(v.substring(2, 4), 16)
    const b = parseInt(v.substring(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

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

  const successColor = tokenColor('--success-color')

  const option = ref({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: { color: 'rgba(158,158,158,0.35)' }
      },
      backgroundColor: tokenColor('--surface-section'),
      borderColor: tokenColor('--surface-line'),
      textStyle: {
        color: tokenColor('--textColor0')
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
        color: 'rgba(158,158,158,0.9)'
      },
      axisTick: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(158,158,158,0.1)',
          width: 1
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          color: 'rgba(158,158,158,0.12)'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 10,
        color: 'rgba(158,158,158,0.9)'
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          color: 'rgba(158,158,158,0.12)'
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
          width: 3,
          color: successColor
        },
        itemStyle: {
          color: successColor
        },
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: hexToRgba(successColor, 0.22) },
            { offset: 1, color: hexToRgba(successColor, 0) }
          ])
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

      // Add click listener after data is updated
      nextTick(() => {
        if (chartRef.value) {
          setTimeout(() => {
            const chartInstance = chartRef.value.chart
            if (chartInstance) {
              chartInstance.off('click') // Remove existing listener
              chartInstance.on('click', onPointClick) // Add new listener
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
            chartInstance.on('click', onPointClick)
          }
        }, 100)
      }
    })
  })
</script>

<template>
  <div class="w-full relative">
    <n-spin :show="store.dailyAttendanceLoading" class="w-full h-[260px] relative z-2">
      <v-chart autoresize class="w-full" :option="option" ref="chartRef" />
    </n-spin>
  </div>
</template>

<style scoped></style>
