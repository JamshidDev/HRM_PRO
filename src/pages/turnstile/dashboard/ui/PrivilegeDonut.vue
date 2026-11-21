<template>
  <div ref="chartRef" :style="{ width: width, height: height }"></div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import * as echarts from 'echarts'
  import i18n from '@/i18n/index.js'
  import { useAppStore } from '@/store/modules/index.js'

  const appStore = useAppStore()

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

  // HRM dashboard donutlari kabi: qalin halqa, bo'laklar orasida karta rangidagi
  // chegara, yorliqsiz; hover'da bo'lak kattalashmaydi — qolganlari xiralashadi.
  const getOption = () => ({
    tooltip: {
      appendTo: 'body',
      trigger: 'item',
      backgroundColor: tokenColor('--surface-section'),
      borderColor: tokenColor('--surface-line'),
      textStyle: { color: tokenColor('--fig-text-primary'), fontSize: 12 }
    },
    series: [
      {
        type: 'pie',
        radius: ['62%', '100%'],
        emphasis: { scale: false, focus: 'self' },
        blur: { itemStyle: { opacity: 0.35 } },
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        itemStyle: {
          borderRadius: 6,
          borderColor: tokenColor('--fig-block-bg'),
          borderWidth: 3
        },
        data: props.data.map((v) => ({
          value: v.value,
          name: i18n.global.t(v.name),
          itemStyle: { color: tokenColor(v.color) }
        }))
      }
    ]
  })

  // Mavzu almashganda ranglar tokenlardan qayta o'qiladi.
  watch(
    () => appStore.isDark,
    () => nextTick(() => chart?.setOption(getOption(), true))
  )

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
