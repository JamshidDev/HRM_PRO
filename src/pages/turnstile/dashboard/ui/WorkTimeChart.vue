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
        color: 'rgba(158,158,158,0.9)'
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
        name: t('turnStileDashboard.cards.lateCome'),
        type: 'bar',
        barWidth: '30%',
        barMaxWidth: 12,
        barGap: '30%',
        data: [],
        itemStyle: {
          color: tokenColor('--danger-color'),
          borderRadius: [4, 4, 2, 2]
        }
      },
      {
        name: t('turnStileDashboard.cards.earlyGo'),
        type: 'bar',
        barWidth: '30%',
        barMaxWidth: 12,
        data: [],
        itemStyle: {
          color: tokenColor('--warning-color'),
          borderRadius: [4, 4, 2, 2]
        }
      }
    ]
  })

  watch(
    () => store.workTime,
    (newValue) => {
      if (!newValue) return

      option.value.xAxis.data = newValue.late_and_early.late.map((v) => {
        return v.date.slice(-5)
      })

      option.value.series[0].data = newValue.late_and_early.late.map((v) => {
        return v.count
      })

      option.value.series[1].data = newValue.late_and_early.early.map((v) => {
        return v.count
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
  <div class="w-full relative h-full">
    <div class="w-full h-[240px] relative z-2">
      <v-chart autoresize class="w-full" :option="option" ref="chartRef" />
    </div>
  </div>
</template>

<style scoped></style>
