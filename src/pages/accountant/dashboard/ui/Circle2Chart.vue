<script setup>


import {useAccDashboardStore} from "@/store/modules/index.js"
import VChart from "vue-echarts"
import i18n from "@/i18n/index.js"
import {ChevronDoubleUp20Regular, Line32Filled} from "@vicons/fluent"
import numeral from "numeral"
import Utils from "@/utils/Utils.js"

const store = useAccDashboardStore()
const {t} = i18n.global

const data = ref([])
const isCorrect = ref(false)

const colors = {
  'sum':'#1A84FF',
  'total_two':'#E53835',
}

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
        tooltip: {
          trigger: 'item',
          show: false,
        },
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
            return `${Utils.formatToMLN(data.value[params.dataIndex].real,1)} mln`;
          },
          color: '#ffffff',
          fontSize: 12
        },
      }
    ]
  }

  if(!store.dashboardData) return defaultOption
  const v = store.dashboardData.last_month

  const value1 = v.tax_five[0].value + v.statement[1].value
  const value2 = v.statement[0].value

  data.value = [
    {
      key:'sum',
      value:value1>value2? 200:100,
      real:value1,
      name: t(`accDashboard.chart.${v.statement[0].key}`),
      itemStyle:{
        color:colors['sum']
      }
    },
    {
      key:'total_two',
      value:value2>value1? 200:100,
      real:value2,
      name: t(`accDashboard.chart.${v.tax_five[0].key}`),
      itemStyle:{
        color:colors['total_two']
      }
    }
  ]
  isCorrect.value = value1 === value2
  defaultOption.series[0].data = data.value

  return defaultOption
})




</script>

<template>
  <div class="flex bg-surface-section p-2 rounded-2xl border border-surface-line h-full">
    <div class="h-[200px] w-[200px]">
      <v-chart autoresize :option="option" />
    </div>
    <div class="w-[calc(100%-200px)] pl-2 grid grid-cols-12 content-between min-h-[260px]">
      <div class="col-span-12">
        <template v-for="(item, index) in data">
          <div class="leading-[1] mb-2">
            <p v-bind:style="{color:colors[item.key]}" class="text-lg font-black mb-0">{{numeral(item.real).format('0,0.0')}}<small class="text-xs text-textColor3/60 font-normal pl-1 lowercase"> {{ $t('content.sum')}}</small></p>
            <p class="text-xs text-textColor3 line-clamp-2">{{$t(`accDashboard.chart.${item.key}`)}}</p>
          </div>
        </template>
      </div>

      <div class="border p-1 border-dashed rounded-2xl mt-4 col-span-12"
           :class="[isCorrect? 'bg-success/5 border-success text-success' : 'bg-danger/5 border-danger text-danger']"
      >
        <div class="leading-[1] flex">
          <p class="text-center font-black text-3xl leading-[1] w-[140px]">
            {{Utils.formatToMLN(data?.[0]?.real,1)}}
            <small class="font-normal text-xs text-textColor3/40"> {{ $t('content.mln') }}</small></p>
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
          <p class="text-center font-black  text-3xl leading-[1] w-[140px]">
            {{Utils.formatToMLN(data?.[1]?.real,1)}}
            <small class="font-normal text-xs text-textColor3/40"> {{ $t('content.mln')}}</small></p>
          <div class="text-xs text-textColor3/40 text-center flex items-center leading-[1] w-[calc(100%-140px)]">
            <n-icon size="14" class="rotate-[-20deg] text-textColor3">
              <Line32Filled/>
            </n-icon>
            <span class="line-clamp-2">{{$t('accDashboard.chart.total_two')}}</span></div>
        </div>


      </div>
    </div>

  </div>

</template>
