<template>
  <div ref="chartRef" :style="{ width: width, height: height }"></div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import * as echarts from 'echarts'

  const props = defineProps({
    // [{ value, name, color }] — color CSS token nomi (--fig-icon-green va h.k.)
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
      textStyle: { color: tokenColor('--fig-text-primary') }
    },
    series: [
      // orqa fon halqasi — segmentlar shu yo'lak ichida joylashadi
      {
        type: 'pie',
        radius: ['44%', '94%'],
        silent: true,
        animation: false,
        label: { show: false },
        labelLine: { show: false },
        emphasis: { disabled: true },
        tooltip: { show: false },
        data: [{ value: 1, itemStyle: { color: tokenColor('--fig-br-disable') } }]
      },
      {
        type: 'pie',
        radius: ['52%', '86%'],
        avoidLabelOverlap: false,
        padAngle: 4,
        itemStyle: {
          borderRadius: 8
        },
        // Maketdagi oq "pill" yorliqlar: fon oq, radius to'liq, matn segment rangida
        label: {
          show: true,
          position: 'inside',
          formatter: ({ percent }) => `${percent.toFixed(0)}%`,
          fontSize: 10,
          lineHeight: 12,
          fontWeight: 500,
          backgroundColor: '#ffffff',
          borderRadius: 9999,
          padding: [2, 6]
        },
        labelLine: { show: false },
        data: props.data.map((v) => ({
          value: v.value,
          name: v.name,
          itemStyle: { color: tokenColor(v.color) },
          label: { color: tokenColor(v.color) }
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
