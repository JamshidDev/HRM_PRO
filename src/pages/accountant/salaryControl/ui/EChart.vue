<script setup>
  // Oylik nazorati grafiklari uchun yagona echarts wrapper. Bo'lim komponentlari
  // faqat `option` uzatadi (tema ranglari helpers orqali). autoresize yoqilgan.
  import { ref, onMounted, onBeforeUnmount } from 'vue'
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
  import { enqueueRender } from '../chart-render-queue.js'

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
  // Grafik elementi bosilganda (drill-down uchun) echarts click hodisasini uzatamiz.
  const emit = defineEmits(['chartClick'])

  // LAZY RENDER: grafik viewport'ga yaqinlashgandagina (IntersectionObserver) chiziladi.
  // Bir tabda 6+ grafik bir vaqtda init bo'lib asosiy thread'ni ~500ms bloklardi;
  // endi tab avval bo'yaladi (karta + joy), grafiklar bosqichma-bosqich to'ladi —
  // UI qotmaydi. Ko'rinmaydigan (pastdagi) grafiklar skroll'da chiziladi.
  const root = ref(null)
  const render = ref(false)
  let io = null
  onMounted(() => {
    if (typeof IntersectionObserver === 'undefined') {
      render.value = true
      return
    }
    io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          if (io) {
            io.disconnect()
            io = null
          }
          // Navbatga qo'yamiz — grafiklar bir vaqtda emas, frame'ma-frame render bo'ladi.
          enqueueRender(() => {
            render.value = true
          })
        }
      },
      { rootMargin: '250px' }
    )
    io.observe(root.value)
  })
  onBeforeUnmount(() => {
    if (io) io.disconnect()
  })
</script>

<template>
  <!-- Placeholder div (balandlik saqlanadi) — grafik ko'rinishga kirganda mount bo'ladi.
       autoresize: vue-echarts ResizeObserver + unmount'da dispose; notMerge: eski seriyalar qolmasin. -->
  <div ref="root" :style="{ height, width: '100%' }">
    <VChart
      v-if="render"
      :option="option"
      :update-options="{ notMerge: true }"
      autoresize
      :style="{ height, width: '100%' }"
      @click="(e) => emit('chartClick', e)"
    />
  </div>
</template>
