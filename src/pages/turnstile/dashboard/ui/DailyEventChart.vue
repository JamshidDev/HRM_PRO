<script setup>
import VChart from "vue-echarts"
import {useDashboardStore, useEventStore} from "@/store/modules/index.js"
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { TooltipComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import * as echarts from 'echarts'

use([TooltipComponent, GridComponent, BarChart, CanvasRenderer])


const store = useEventStore()
const {t} = i18n.global
const chartRef = ref(null)
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


watch(()=> store.dailyEvents, (newValue)=>{
  if (!newValue || !Array.isArray(newValue)) return
  
  option.value.xAxis.data = newValue.map((v)=>{
    return v.hour
  })

  option.value.series[0].data = newValue.map((v)=>{
    return v.count
  })


}, {
  immediate: true
})


</script>

<template>
  <div class="w-full border border-surface-line rounded-lg bg-surface-section relative hover-effect-card">
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