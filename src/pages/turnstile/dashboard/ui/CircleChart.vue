<template>
  <div ref="chartRef" :style="{ width: width, height: height }"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  percent: {
    type:[String, Number],
    default: 0
  },
  type: {
    type: String,
    default: 'primary',
    validator: (val) => ['primary', 'danger', 'dark', 'success', 'warning'].includes(val)
  },
  bgColor: {
    type: String,
    default: '#f5f5f5'
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

const typeColors = {
  primary: '#1D88FE',
  danger: '#ef4444',
  dark: '#1f2937',
  success: '#10b981',
  warning: '#f59e0b'
}

const activeColor = computed(() => typeColors[props.type])

const chartRef = ref(null)
let chart = null

const getOption = () => ({
  series: [{
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
        color: [[1, props.bgColor]]
      }
    },
    axisTick: { show: false },
    splitLine: { show: false },
    axisLabel: { show: false },
    pointer: { show: false },
    detail: {
      fontSize: 12,
      fontWeight: 'bold',
      formatter: `${props.percent}%`,
      offsetCenter: [0, 0],
      color: activeColor.value
    },
    data: [{ value: props.percent }]
  }]
})

onMounted(() => {
  chart = echarts.init(chartRef.value)
  chart.setOption(getOption())
})

watch(() => [props.percent, props.type, props.bgColor], () => {
  chart?.setOption(getOption())
})

onUnmounted(() => {
  chart?.dispose()
})
</script>