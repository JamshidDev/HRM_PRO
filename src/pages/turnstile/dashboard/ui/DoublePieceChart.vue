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

  const getOption = () => ({
    graphic: {
      elements: [
        {
          type: 'text',
          style: {
            text: props.icon,
            fontSize: 30
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
        radius: ['50%', '90%'],
        padAngle: 8,
        itemStyle: { borderRadius: 12 },
        label: {
          show: true,
          position: 'inside',
          formatter: '{d}%',
          fontSize: 10,
          fontWeight: 'bold',
          color: '#fff'
        },
        data: [
          { value: props.online, name: 'Online', itemStyle: { color: '#228EFD' } },
          { value: props.offline, name: 'Offline', itemStyle: { color: '#BCD8F7' } }
        ]
      }
    ]
  })

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
