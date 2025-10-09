<script setup>
import VChart from "vue-echarts"
import {useTurnstileDashboardStore} from "@/store/modules/index.js"
import i18n from "@/i18n/index.js"
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { TooltipComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import * as echarts from 'echarts'
import { onMounted, nextTick } from 'vue'

use([TooltipComponent, GridComponent, BarChart, CanvasRenderer])


const emit = defineEmits(['barClick'])
const dashboardStore = useTurnstileDashboardStore()
const {t} = i18n.global
const chartRef = ref(null)

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
    end_time: hour,
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
    }
  },
  grid: {
    left: '1%',
    top: '10%',
    right: '1%',
    bottom: '15%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: [],
    axisLabel:{
      show:false,
    }
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: t('turnStileDashboard.form.workerCount'),
      type: 'bar',
      barWidth: '70%',
      barMaxWidth: 50,
      data: [],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#1A84FF' },   // yuqoridan
          { offset: 1, color: '#56CCF2' }    // pastga
        ]),
        borderRadius: [5, 5, 0, 0]
      },
      label: {
        show: true,
        position: 'bottom',
        formatter: (params) => `${params.name}`, // "40", "25", "60"
        fontSize: (value, index) => {
          const width = window.innerWidth
          if (width < 640) return 8   // telefon
          if (width < 1024) return 10 // planshet
          return 12                   // desktop
        },
        offset: [0, 10]
      }
    },
   
   
    
  ]
})


watch(()=> dashboardStore.dailyEvents, (newValue)=>{
  if (!newValue || !Array.isArray(newValue)) return
  
  option.value.xAxis.data = newValue.map((v)=>{
    return v.hour
  })

  option.value.series[0].data = newValue.map((v)=>{
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

}, {
  immediate: true
})

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
  <div class="w-full border border-surface-line rounded-lg bg-surface-section relative hover-effect-card h-full">
    <span class="z-1 opacity-40 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/effect-card-2.svg)]" ></span>
    <div class="px-3 pt-2">
      <span class="text-sm text-textColor2 font-semibold">{{$t('turnStileDashboard.form.dailyEvent')}}</span>
    </div>
    <div class="w-full h-[240px] relative z-2">
      <v-chart autoresize class="w-full" :option="option" ref="chartRef" />
    </div>
  </div>
</template>

<style scoped>

</style>