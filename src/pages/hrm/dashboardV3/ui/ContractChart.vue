<script setup>
import  {useDashboardStore} from "@/store/modules/index.js"
import VChart from "vue-echarts"
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart } from 'echarts/charts'


import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import i18n from "@/i18n/index.js"

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  PieChart,
]);


const store = useDashboardStore()
const {t} = i18n.global


const contractOption = ref({
  legend: {
    top: 'bottom',
    show: false,
  },
  tooltip: {
    trigger: 'item', // Trigger tooltip on each item (segment)
    formatter:(params)=>`${params.name} - ${store.dashboard.contractTypes?.[params.dataIndex]?.active_contracts}`, // Customize the tooltip content
  },
  series: [
    {
      name: '',
      type: 'pie',
      radius:['10%', '70%'],
      center: ['50%', '50%'],
      roseType: 'radius',
      itemStyle: {
        borderRadius: 8
      },
      data: [],
      label: {
        show: true,
        position: 'inside',
        formatter:(params)=>`${store.dashboard.contractTypes?.[params.dataIndex]?.active_contracts}`,
        color: '#ffffff',
        fontSize: 12,
        align: 'center',
        verticalAlign: 'middle'
      },
    },
    {
      name: '',
      type: 'pie',
      radius:['10%', '70%'],
      center: ['50%', '50%'],
      roseType: 'radius',
      itemStyle: {
        borderRadius: 8
      },
      data: [],
      smooth: true,
      label: {
        show: true,
        position: 'outside',
        formatter:(params)=>`${params.name} - ${store.dashboard.contractTypes?.[params.dataIndex]?.active_contracts}`,
        color: '#333',
        fontSize: 12
      },
      labelLine: {
        show: true,
        length: 30,
        smooth: true,
      },
    }
  ]
})

const colors = {
  0:'#2dcb73',
  1:'#E53835',
  2:'#1A84FF',
  3:'#8815bd',
  4:'#000000',
}


const sortAndReIndex = (data, startIndex = 10, step = 2)=>{
  data.sort((a, b) => a.active_contracts - b.active_contracts);
  let currentIndex = startIndex;
  let previousValue = null;

  data.forEach((item, idx) => {
    if (idx === 0 || item.active_contracts !== previousValue) {
      item.index = currentIndex
      if (idx !== 0){
        item.index = currentIndex += step;
      }
    } else {
      item.index = data[idx - 1].index;
    }
    previousValue = item.active_contracts;
  });
  return data;
}

watch(()=> store.dashboard.contractTypes, (newValue, oldValue)=>{
  contractOption.value.series[0].data =sortAndReIndex(newValue).map((v,idx)=>({
    value:v.index,
    name:v.type,
    itemStyle:{
      color:colors[idx]
    },
  }))
  contractOption.value.series[1].data =sortAndReIndex(newValue).map((v,idx)=>({
    value:v.index,
    name:v.type,
    itemStyle:{
      color:colors[idx]
    },
  }))
  contractOption.value.series[0].name = t('dashboardPage.contract.title')
})

const totalCount = computed(()=>{
 return store.dashboard.contractTypes.reduce((total, num)=>{
   return total + num.active_contracts
 },0)
})
</script>

<template>
  <div class="w-full h-full border border-surface-line p-4 rounded-lg bg-surface-section relative">
    <span class="z-[1] opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/public/effect/primary-card.svg)]" ></span>
    <div class="flex items-center gap-2">
      <span class="font-semibold text-nowrap text-textColor2">{{$t('dashboardPage.contract.title')}}</span>
      <hr class="w-full h-[1px] text-surface-line">
      <span class="font-semibold text-nowrap text-textColor2">{{totalCount}}</span>
    </div>
    <div class="w-full h-[300px] relative z-[2] mb-4">
      <v-chart :option="contractOption" />
    </div>

  </div>
</template>

<style scoped>

</style>