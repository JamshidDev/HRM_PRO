<script setup>
  // Oylik nazorati grafiklari uchun yagona echarts wrapper. Bo'lim komponentlari
  // faqat `option` uzatadi (tema ranglari helpers orqali). autoresize yoqilgan.
  import VChart from 'vue-echarts'
  import { use } from 'echarts/core'
  import { BarChart, LineChart, ScatterChart, CustomChart } from 'echarts/charts'
  import {
    TooltipComponent,
    GridComponent,
    LegendComponent,
    MarkLineComponent,
    MarkAreaComponent
  } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'

  use([
    BarChart,
    LineChart,
    ScatterChart,
    CustomChart,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    MarkLineComponent,
    MarkAreaComponent,
    CanvasRenderer
  ])

  defineProps({
    option: { type: Object, required: true },
    height: { type: String, default: '340px' }
  })
</script>

<template>
  <VChart :option="option" autoresize :style="{ height, width: '100%' }" />
</template>
