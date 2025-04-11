<script setup>
import i18n from "@/i18n/index.js"
import VChart from "vue-echarts";
import { use } from 'echarts/core'
import {
  PieChart
} from 'echarts/charts'
import {
  LegendComponent,
  TooltipComponent,
  TitleComponent,
    GridComponent
} from 'echarts/components'
import {
  CanvasRenderer
} from 'echarts/renderers'
import {useExamDashboardService} from "@/store/modules/index.js";

use([
  LegendComponent,
  TooltipComponent,
  TitleComponent,
  PieChart,
  GridComponent,
  CanvasRenderer
])

const store = useExamDashboardService()
const t = i18n.global.t

const option = ref({
  title: {
    text: t('examPage.dashboard.title'),
    left: 'center',
    top: 10
  },
  legend: {
    top: '90%',
    textStyle: {
      fontWeight: 'bold'
    }
  },
  tooltip: {
    trigger: 'item'
  },
  series: [
    {
      type: 'pie',
      radius: ['10%', '70%'],
      center: ['50%', '50%'],
      roseType: 'area',
      itemStyle: {
        borderRadius: 8
      },
      data: [],
      label: {
        show: true,
        position: 'inside',
        formatter: (params) => {
          return params.data.realData;
        },
        color: '#ffffff',
        fontSize: 12
      },
      tooltip: {
        formatter(params){
          return params.data.realData
        }
      }
    }
  ]
})

const colors = [
  '#E53835',
  '#859322',
  '#ecb28d',
  '#0ded6f',
]


watch(store, (v)=>{
  const newData = [...v.examStats]
  let unique = Array.from(new Set(newData.sort((a,b)=>Number(a.count)-Number(b.count)).map(i=>Number(i.count))))
  option.value.series[0].data = v.examStats.map((i, idx)=>({
    value: 1+unique.findIndex(k=>k===Number(i.count)),
    name: i.label,
    realData: i.count,
    itemStyle:{
      color:colors[idx]
    },
  }))
}, {
  immediate: true
})

onMounted(()=>{
  store._worker_statistics()
})

</script>
<template>
  <div class="bg-surface-section h-full w-full rounded-md flex flex-col py-2">
    <div class="grow">
      <v-chart :option="option" autoresize :loading="store.loading" />
    </div>
  </div>
</template>