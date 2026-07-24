<template>
  <div ref="chartRef" :style="{ width: width, height: height }"></div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
  import * as echarts from 'echarts'

  const props = defineProps({
    percent: {
      type: [String, Number],
      default: 0
    },
    type: {
      type: String,
      default: 'primary',
      validator: (val) =>
        ['primary', 'danger', 'dark', 'success', 'warning', 'secondary'].includes(val)
    },
    bgColor: {
      type: String,
      default: null
    },
    width: {
      type: String,
      default: '60px'
    },
    height: {
      type: String,
      default: '60px'
    }
  })

  const tokenColor = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim()

  const hexToRgba = (hex, alpha) => {
    const v = hex.replace('#', '')
    const r = parseInt(v.substring(0, 2), 16)
    const g = parseInt(v.substring(2, 4), 16)
    const b = parseInt(v.substring(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const activeColor = computed(() => tokenColor(`--${props.type}-color`))

  const trackColor = computed(() => props.bgColor || hexToRgba(activeColor.value, 0.15))

  const chartRef = ref(null)
  let chart = null

  const getOption = () => ({
    series: [
      {
        type: 'gauge',
        startAngle: 90,
        endAngle: -270,
        radius: '100%',
        progress: {
          show: true,
          width: 8,
          roundCap: true
        },
        itemStyle: {
          color: activeColor.value
        },
        axisLine: {
          lineStyle: {
            width: 8,
            color: [[1, trackColor.value]]
          }
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        detail: {
          fontSize: 12,
          fontWeight: 'bold',
          fontFamily: 'Space Grotesk, sans-serif',
          formatter: `${props.percent}%`,
          offsetCenter: [0, 0],
          color: activeColor.value
        },
        data: [{ value: props.percent }]
      }
    ]
  })

  onMounted(() => {
    chart = echarts.init(chartRef.value)
    chart.setOption(getOption())
  })

  watch(
    () => [props.percent, props.type, props.bgColor],
    () => {
      chart?.setOption(getOption())
    }
  )

  onUnmounted(() => {
    chart?.dispose()
  })
</script>
