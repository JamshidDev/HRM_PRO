<script setup>
import VChart from "vue-echarts"
import {useDashboardStore} from "@/store/modules/index.js"


const store = useDashboardStore()
const vacationOption = ref({
  title: {
    show:false,
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    show:false,
  },
  grid: {
    top: '5%',
    left: '2%',
    right: '2%',
    bottom: '10%',

  },
  xAxis: {
    type: 'value',
    boundaryGap: [0, 0]
  },
  yAxis: {
    type: 'category',
    data: [],
    show:false,
  },
  series: [
    {
      name: '2011',
      type: 'bar',
      data: [
        { value: 300, itemStyle: { color: '#E53835' } }, // Red for Brazil
        { value: 400, itemStyle: { color: '#2dcb73' } }, // Teal for Indonesia
        { value: 800, itemStyle: { color: '#45b7d1' } }, // Light Blue for USA
        { value: 600, itemStyle: { color: '#1A84FF' } }, // Sky Blue for India
        { value: 700, itemStyle: { color: '#f9cb9c' } }, // Light Orange for China
        { value: 500, itemStyle: { color: '#e06666' } }  // Salmon for World
      ],
      itemStyle: {
        borderRadius: 6,
      },
      barWidth: '30px',
      label: {
        show: true,
        position: 'inside',      // Place labels inside the bars
        align: 'center',         // Horizontally center the text
        verticalAlign: 'middle',
        formatter: (params) => `${params.value.toLocaleString()} ta`,
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
      }
    },
  ]
})

const colors = {
  0:'#2dcb73',
  1:'#E53835',
  2:'#1A84FF',
  3:'#dae5f5',
  4:'#000000',
  5:'#c87606',
  6:'#E53835',
  7:'#1A84FF',
}

watch(()=> store.dashboard.vacations, (newValue, oldValue)=>{
  vacationOption.value.series[0].data =newValue.map((v,idx)=>({
    value:v.active_vacations,
    name:v.type,
    itemStyle:{
      color:colors[idx]
    },
  }))
  vacationOption.value.yAxis.data =newValue.map((v)=>v.name)
})

const totalCount = computed(()=>{
  return store.dashboard.vacations.reduce((total, num)=>{
    return total + num.active_vacations
  },0)
})


</script>

<template>
  <div class="w-full h-full border border-surface-line p-4 rounded-lg bg-surface-section relative">
    <span class="z-[1] opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/public/effect/primary-card.svg)]" ></span>
    <span class="z-[1] opacity-30 absolute bottom-0 left-0 w-[160px] h-[200px] rotate-180 bg-no-repeat bg-[url(/public/effect/primary-card.svg)]" ></span>
    <div class="flex items-center gap-2 mb-10">
      <span class="font-semibold text-nowrap">{{$t('dashboardPage.card.vacation')}}</span>
      <hr class="w-full h-[1px] text-surface-line">
      <span class="font-semibold text-nowrap text-lg">{{totalCount}}</span>
    </div>
<!--    <div class="w-full h-[360px] relative z-[2]">-->
<!--      <v-chart :option="vacationOption" />-->
<!--    </div>-->
    <div v-for="(item, idx) in store.dashboard.vacations"  class="w-full flex mb-3 items-center cursor-pointer">
      <div
          class="w-[14px] h-[14px] shadow-sm border-[3px] rounded-full"
          v-bind:style="{borderColor:colors[idx]}"
      ></div>
      <div class="pl-4 font-medium" style="width: calc(100% - 64px)">{{item?.name}}</div>
      <div
          class="font-bold w-[60px] text-end"
      >{{item.active_vacations}}</div>
    </div>


  </div>
</template>

<style scoped>

</style>