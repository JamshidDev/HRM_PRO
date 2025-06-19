<script setup>
import {useAccDashboardStore} from "@/store/modules/index.js"
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
import { watch } from "vue"

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  PieChart,
]);


const store = useAccDashboardStore()

const {t} = i18n.global

const  option = ref({
      title: {
        text: 'Referer of a Website',
        subtext: 'Fake Data',
        left: 'center',
        show:false,
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        show: false,
      },
      series: [
        {
          name: 'Access From',
          type: 'pie',
          radius: '90%',
          selectedMode: 'multiple',
          selectedOffset:1,
          data:[100, 150, 200],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          itemStyle: {
            borderRadius:12,
            borderColor: '#ffffff',
            borderWidth: 1
          },
          label: {
            show: true,
            position: 'inside',
            formatter: (params) => {
              return `${params.value}`;
            },
            color: '#ffffff',
            fontSize: 12
          },
        }
      ]
    }
)

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



const totalCount = computed(()=>{
  return store.dashboard.contractTypes.reduce((total, num)=>{
    return total + num.active_contracts
  },0)
})



</script>

<template>
  <v-chart autoresize :option="option" />
</template>
