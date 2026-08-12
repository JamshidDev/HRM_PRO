<template>
  <div ref="chartRef" :style="{ width: width, height: height }"></div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import * as echarts from 'echarts'

  const props = defineProps({
    // [{ value, name, color }] — color CSS token nomi (--success-color va h.k.)
    data: { type: Array, default: () => [] },
    width: { type: String, default: '100%' },
    height: { type: String, default: '220px' }
  })

  const chartRef = ref(null)
  let chart = null

  const tokenColor = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim()

  const getOption = () => ({
    tooltip: {
      trigger: 'item',
      backgroundColor: tokenColor('--surface-section'),
      borderColor: tokenColor('--surface-line'),
      textStyle: { color: tokenColor('--textColor0') }
    },
    series: [
      // orqa fon halqasi — segmentlar shu yo'lak ichida joylashadi
      {
        type: 'pie',
        radius: ['46%', '92%'],
        silent: true,
        animation: false,
        label: { show: false },
        labelLine: { show: false },
        emphasis: { disabled: true },
        tooltip: { show: false },
        data: [{ value: 1, itemStyle: { color: tokenColor('--surface-line') } }]
      },
      {
        type: 'pie',
        radius: ['54%', '84%'],
        avoidLabelOverlap: false,
        padAngle: 5,
        itemStyle: {
          borderRadius: 8
        },
        label: {
          show: true,
          position: 'inside',
          formatter: ({ percent }) => `${percent.toFixed(0)}%`,
          fontSize: 11,
          fontWeight: 'bold',
          color: '#fff'
        },
        labelLine: { show: false },
        data: props.data.map((v) => ({
          value: v.value,
          name: v.name,
          itemStyle: { color: tokenColor(v.color) }
        }))
      }
    ]
  })

  const handleResize = () => chart?.resize()

  onMounted(() => {
    chart = echarts.init(chartRef.value)
    chart.setOption(getOption())
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    chart?.dispose()
  })

  watch(
    () => props.data,
    () => {
      chart?.setOption(getOption(), true)
    },
    { deep: true }
  )
</script>
