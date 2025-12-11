<template>
  <VChart :option="option" autoresize class="chart-container" />
</template>

<script setup>
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { graphic } from 'echarts/core'
import {useTurnstileDashboardStore} from "@/store/modules/index.js"

use([BarChart, GridComponent, CanvasRenderer])

const store = useTurnstileDashboardStore()

const option = ref({
  grid: {
    left: 0,
    right: 0,
    top: 30,
    bottom: 0,
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: [],
    axisLine: {
      lineStyle: {
        color: 'rgba(200, 200, 200, 0.3)'
      }
    },
    axisTick: {
      lineStyle: {
        color: 'rgba(200, 200, 200, 0.3)'
      }
    },
    axisLabel: {
      color: '#999'
    }
  },
  yAxis: {
    type: 'value',
    splitLine: {
      lineStyle: {
        color: 'rgba(200, 200, 200, 0.2)',
        type: 'dashed'
      }
    },
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    }
  },
  series: [
    {
      data: [],
      type: 'bar',
      barWidth: 20,
      showBackground: true,
      backgroundStyle: {
        color: 'rgba(180, 180, 180, 0.2)',
        borderRadius: [5, 5, 0, 0]
      },
      itemStyle: {
        color: new graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#1A84FF' },
          { offset: 1, color: '#56CCF2' }
        ]),
        borderRadius: [5, 5, 0, 0]
      },
      label: {
        show: true,
        color:'#ffffff',
        fontWeight: 'bold',
        fontSize: 14,
        rotate: 90,
        verticalAlign: 'middle',
        align: 'center',
      }
    }
  ]
})


watchEffect(()=>{
  if(store.monthlyList?.length>0){
    option.value.xAxis.data = store.monthlyList.map((v)=>{
      return `${v.year}-${v.month.toString().padStart(2, "0")}`
    })

    option.value.series[0].data = store.monthlyList.map((v)=>{
      return v.workers_without_schedule
    })

  }
})


</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 220px;
}
</style>