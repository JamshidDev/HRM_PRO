<script setup>
import {useAccDashboardStore} from "@/store/modules/index.js"
import VChart from "vue-echarts"
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart } from 'echarts/charts'
import numeral from 'numeral';

import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import i18n from "@/i18n/index.js"
import {ChevronDoubleUp20Regular, Line32Filled} from "@vicons/fluent"
import Utils from "@/utils/Utils.js"

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


const colors = {
  'total_one':'#1A84FF',
  'total_two':'#E53835',
  'total_three':'#2dcb73',
}

const data = ref([])
const totalSalary = ref('')
const cachesCount = ref('')
const isCorrect = ref(false)

const option = computed(()=>{
  const defaultOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        return `${params.name}: ${params.percent}%`;
      }
    },
    series: [
      {
        name: '',
        type: 'pie',
        radius: '90%',
        selectedMode: 'multiple',
        selectedOffset:1,
        data:[],
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
            return `${params.value} %`;
          },
          color: '#ffffff',
          fontSize: 12
        },
      }
    ]
  }

  if(!store.dashboardData) return defaultOption

  const v = store.dashboardData?.last_month?.statement
  data.value = v.filter((_, index)=>index<3)
  const cacheMoney = v?.[3]?.value
  const totalCount = data.value.reduce((acc, item) => acc + item.value, 0)
  totalSalary.value = Utils.formatToMLN(totalCount)
  cachesCount.value =Utils.formatToMLN(cacheMoney)
  defaultOption.series[0].data = data.value.map(x=>({
    value: Math.round(x.value/totalCount*100) || 0,
    name:t(`accDashboard.chart.${x.key}`),
    itemStyle: { color: colors[x.key] }
  }))
  isCorrect.value = totalSalary.value ===  cachesCount.value
  return defaultOption
})



</script>

<template>

  <div class="flex bg-surface-section p-2 rounded-2xl border border-surface-line">
    <div class="w-[calc(100%-200px)] pl-2 grid grid-cols-12 content-between min-h-[260px]">
      <div class="col-span-12">
        <template v-for="(item, index) in data">
          <div class="leading-[1] mb-2">
            <p v-bind:style="{color:colors[item.key]}" class="text-lg font-black mb-0">{{numeral(item.value).format('0,0.0')}}<small class="text-xs text-textColor3/60 font-normal pl-1 lowercase"> {{ $t('content.sum')}}</small></p>
            <p class="text-xs text-textColor3 line-clamp-2">{{$t(`accDashboard.chart.${item.key}`)}}</p>
          </div>
        </template>
      </div>
      <div class="border col-span-12 p-1 border-dashed rounded-2xl"
           :class="[isCorrect? 'bg-success/5 border-success text-success' : 'bg-danger/5 border-danger text-danger']"
      >
        <div class="leading-[1] flex">
          <p class="text-center font-black text-3xl leading-[1] w-[140px]">{{totalSalary}} <small class="font-normal text-xs text-textColor3/40"> {{ $t('content.mln') }}</small></p>
          <div class="text-xs text-textColor3/40 text-center flex items-center leading-[1] w-[calc(100%-140px)]">
            <n-icon size="14" class="rotate-[-20deg] text-textColor3">
              <Line32Filled/>
            </n-icon>
            <p class="line-clamp-2">{{$t('accDashboard.chart.sum')}}</p></div>
        </div>

        <n-divider class="!my-0" dashed>
          <n-icon size="16" class="text-primary">
            <ChevronDoubleUp20Regular/>
          </n-icon>
        </n-divider>

        <div class="leading-[1] flex">
          <p class="text-center font-black text-3xl leading-[1] w-[140px]">{{cachesCount}} <small class="font-normal text-xs text-textColor3/40"> {{ $t('content.mln')}}</small></p>
          <div class="text-xs text-textColor3/40 text-center flex items-center leading-[1] w-[calc(100%-140px)]">
            <n-icon size="14" class="rotate-[-20deg] text-textColor3">
              <Line32Filled/>
            </n-icon>
            <p class="line-clamp-2">{{$t('accDashboard.chart.total_four')}}</p></div>
        </div>


      </div>
    </div>
    <div class="h-[300px] w-[200px]">
      <v-chart autoresize :option="option" />
    </div>
  </div>
</template>
