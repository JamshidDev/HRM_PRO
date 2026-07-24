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
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: tokenColor('--surface-section'),
      borderColor: tokenColor('--surface-line'),
      textStyle: {
        color: tokenColor('--textColor0')
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
        color: 'rgba(158,158,158,0.9)',
        formatter: (value) => `${value}`.split(':')[0]
      },
      axisTick: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(158,158,158,0.1)', // xira rang
          width: 1
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
          color: 'rgba(158,158,158,0.1)' // xira rang
        }
      }
    },
    series: [
      {
        name: t('turnStileDashboard.form.workerCount'),
        type: 'bar',
        barWidth: '70%',
        barMaxWidth: 20,
        data: [],
        itemStyle: {
          borderRadius: [6, 6, 2, 2]
        }
      }
    ]
  })

  watch(
    () => dashboardStore.dailyEvents,
    (newValue) => {
      if (!newValue || !Array.isArray(newValue)) return

      option.value.xAxis.data = newValue.map((v) => {
        return v.hour
      })

      const primary = tokenColor('--primary-color')
      const max = Math.max(...newValue.map((v) => v.count), 1)
      option.value.series[0].data = newValue.map((v) => {
        return {
          value: v.count,
          itemStyle: {
            color: hexToRgba(primary, Math.max(0.3, v.count / max))
          }
        }
      })

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
  <div class="w-full relative h-full flex flex-col">
    <n-spin :show="store.dailyAttendanceLoading" class="w-full h-[240px] relative z-2 mt-auto">
      <v-chart autoresize class="w-full" :option="option" ref="chartRef" />
    </n-spin>
  </div>
</template>

<style scoped></style>
