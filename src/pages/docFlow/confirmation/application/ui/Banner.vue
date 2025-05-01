<script setup>
import {useConfApplicationStore,} from "@/store/modules/index.js"
import stars from "@/assets/images/svg/stars.svg";
import VChart from "vue-echarts"
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'


import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import {BarChart, PieChart} from "echarts/charts"

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  PieChart,
]);

const store = useConfApplicationStore()
const onAdd = ()=>{
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

const sortAndReIndex = (data, startIndex = 10, step = 2)=>{
  data.sort((a, b) => a.count - b.count);
  let currentIndex = startIndex;
  let previousValue = null;

  data.forEach((item, idx) => {
    if (idx === 0 || item.count !== previousValue) {
      item.index = currentIndex
      if (idx !== 0){
        item.index = currentIndex += step;
      }
    } else {
      item.index = data[idx - 1].index;
    }
    previousValue = item.count;
  });
  return data;
}

const contractOption = ref({
  legend: {
    top: 'bottom',
    show: false,
  },
  tooltip: {
    trigger: 'item', // Trigger tooltip on each item (segment)
    formatter:(params)=>`${params.name} - ${store?.statisticData?.[params.dataIndex]?.applications}`, // Customize the tooltip content
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
        formatter:(params)=>`${store.statisticData?.[params.dataIndex]?.applications}`,
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
        formatter:(params)=>`${params.name} - ${store.statisticData?.[params.dataIndex]?.applications}`,
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

watch(()=> store.statisticData, (newValue)=>{
  const data = newValue.map((v)=>({
    name:v.name,
    id:v.id,
    count:v.applications,
  }))
  contractOption.value.series[0].data =sortAndReIndex(data).map((v,idx)=>({
    value:v.index,
    name:v.name,
    itemStyle:{
      color:colors[idx]
    },
  }))

  contractOption.value.series[1].data =sortAndReIndex(data).map((v,idx)=>({
    value:v.index,
    name:v.name,
    itemStyle:{
      color:colors[idx]
    },
  }))
  // contractOption.value.series[1].data =sortAndReIndex(newValue).map((v,idx)=>({
  //   value:v.index,
  //   name:v.type,
  //   itemStyle:{
  //     color:colors[idx]
  //   },
  // }))
  // contractOption.value.series[0].name = t('dashboardPage.contract.title')
})




onMounted(()=>{
  store._statistic()
})

</script>

<template>

  <div class="grid grid-cols-12 gap-4">
    <div class="col-span-12 md:col-span-8 min-h-[180px] welcome rounded-lg">
      <img alt="stars" class="stars first" :src="stars" />
      <img alt="stars" class="stars middle" :src="stars" />
      <img alt="stars" class="stars last" :src="stars" />
      <div class="text">
        <h1 class="text-white mb-4">{{ $t('solveExamPage.welcomeTitle') }}</h1>
        <n-button @click="onAdd" size="large" class="!bg-white !font-bold">{{$t('applicationPage.addApp')}}</n-button>
      </div>
    </div>
    <div class="col-span-12 md:col-span-4">
      <div class="w-full border border-surface-line bg-surface-section p-2 rounded-lg">
        <v-chart class="h-[200px]" autoresize :option="contractOption" />
      </div>
    </div>

  </div>
</template>

<style lang="scss" scoped>
@media (max-width: 850px) {
  .welcome{
    background-image: none;
  }
}
.welcome {
  background-color: #156eea;
  background-repeat: no-repeat;
  background-image: url("@/assets/images/svg/attestation.svg");
  background-position: center right;
  background-size: auto 100%;
  position: relative;
  padding: 0;
  overflow: hidden;
}

.stars {
  mix-blend-mode: color-dodge;
  user-select: none;
  pointer-events: none;
  position: absolute;
  height: 100%;

  &.first {
    left: 0;
  }

  &.middle {
    right: 25%;
    bottom: -30%;
  }

  &.last {
    right: 0;
  }
}

.text {
  max-width: 600px;
  padding: 40px 30px;

  h1 {
    font-size: 2rem;
    font-weight: 600;
  }

  p {
    font-size: 1rem;
    font-weight: 500;
  }
}
</style>
