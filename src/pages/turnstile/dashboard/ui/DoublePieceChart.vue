<template>
  <div ref="chartRef" :style="{ width: width, height: height }"></div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import * as echarts from 'echarts'

  const props = defineProps({
    online: { type: [Number, String], default: 0 },
    offline: { type: [Number, String], default: 0 },
    icon: { type: String, default: '📡' },
    width: { type: String, default: '100%' },
    height: { type: String, default: '200px' }
  })

  const chartRef = ref(null)
  let chart = null

  const tokenColor = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim()

  const hexToRgba = (hex, alpha) => {
    const v = hex.replace('#', '')
    const r = parseInt(v.substring(0, 2), 16)
    const g = parseInt(v.substring(2, 4), 16)
    const b = parseInt(v.substring(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const getOption = () => {
    const primary = tokenColor('--primary-color')
    return {
      graphic: {
        elements: [
          {
            type: 'text',
            style: {
              text: `${Number(props.online).toFixed(1)}%`,
              fontSize: 20,
              fontWeight: 'bold',
              fontFamily: 'Space Grotesk, sans-serif',
              fill: tokenColor('--textColor0'),
              textAlign: 'center'
            },
            left: 'center',
            top: 'center'
          }
        ]
      },
      series: [
        {
          name: 'Qurilmalar',
          type: 'pie',
          radius: ['58%', '90%'],
          itemStyle: { borderRadius: 4 },
          label: {
            show: false
          },
          data: [
            { value: props.online, name: 'Online', itemStyle: { color: primary } },
            {
              value: props.offline,
              name: 'Offline',
              itemStyle: { color: hexToRgba(primary, 0.25) }
            }
          ]
        }
      ]
    }
  }

  onMounted(() => {
    chart = echarts.init(chartRef.value)
    chart.setOption(getOption())
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    chart?.dispose()
  })

  const handleResize = () => chart?.resize()

  watch(
    () => [props.online, props.offline, props.icon],
    () => {
      chart?.setOption(getOption())
    }
  )

  watch(
    () => [props.width, props.height],
    () => {
      chart?.resize()
    }
  )
</script>
