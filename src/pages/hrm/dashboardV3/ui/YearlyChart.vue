<script setup>
import VChart from "vue-echarts"
import {useDashboardStore} from "@/store/modules/index.js"
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"


const store = useDashboardStore()
const {t} = i18n.global
const option = ref({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
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
      name: t('dashboardPage.yearly.incoming'),
      type: 'bar',
      barWidth: '30%',
      data: [],
      itemStyle: {
        color: '#1A84FF',
        borderRadius: [5, 5, 0, 0]
      },
      label: {
        show: true,
        position: 'bottom',
        formatter: (params) => `${params.name}`, // "40", "25", "60"
        fontSize: 12,
        offset: [0, 10]
      }
    },
    {
      name: t('dashboardPage.yearly.outgoing'),
      type: 'bar',
      barWidth: '30%',
      data: [],
      itemStyle: {
        color:  '#dae5f5',
        borderRadius: [5, 5, 0, 0]
      },
    }
  ]
})


watch(()=> store.dashboard.contracts, (newValue, oldValue)=>{

  option.value.xAxis.data = newValue.map((v)=>{
    const key = v.month.split('-')[1]
    return Utils.getMonthNameByKey(key)
  })

  option.value.series[0].data =newValue.map((v)=>({
    value:v.new_contracts,
    name:v.month,
  }))

  option.value.series[1].data =newValue.map((v)=>({
    value:Number(v.ended_contracts),
    name:v.month,
  }))

})

</script>

<template>
  <div class="w-full h-full border border-surface-line p-4 rounded-lg bg-surface-section relative hover-effect-card">
    <span class="z-[1] opacity-40 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/public/effect/effect-card-2.svg)]" ></span>
    <p class="font-semibold text-lg">{{$t('dashboardPage.yearly.title')}}</p>
    <div class="w-full h-[300px] relative z-[2]">
      <v-chart autoresize class="w-full" :option="option" ref="chartRef" />
    </div>
  </div>
</template>

<style scoped>

</style>