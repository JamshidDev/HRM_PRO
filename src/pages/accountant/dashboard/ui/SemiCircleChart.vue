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
  'total_one':'#1A84FF',
  'reported_salary_income':'#E53835',
}

const option = computed(()=>{
  const defaultOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        return `${params.name}: ${data.value[params.dataIndex].real}`;
      }
    },
    series: [
      {
        name: '',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '70%'],
        startAngle: 180,
        endAngle: 360,
        label: {
          formatter: (params) => {
            return `${Utils.formatToMLN(data.value[params.dataIndex].real,1)} ${t('content.mln')}`;
          },
        },
        data: []
      }
    ]
  }

  if(!store.dashboardData) return defaultOption
  const v = store.dashboardData.last_month
  const value1 = v.statement[0].value
  const value2 = v.tax_four[0].value
  data.value = [
    {
      key:v.statement[0].key,
      value:value1>value2? 200 : 100,
      real:value1,
      name: t(`accDashboard.chart.${v.statement[0].key}`),
      itemStyle:{
        color:colors[v.statement[0].key]
      }
    },
    {
      key:v.tax_four[0].key,
      value:value2>value1? 200 : 100,
      real:value2,
      name: t(`accDashboard.chart.${v.tax_four[0].key}`),
      itemStyle:{
        color:colors[v.tax_four[0].key]
      }
    }
  ]

  defaultOption.series[0].data = data.value
  isCorrect.value = data.value[0].real === data.value[1].real
  return defaultOption
})
</script>

<template>
  <div class="flex bg-surface-section p-2 rounded-lg border border-surface-line h-full">
    <div class="h-[200px] w-[200px]">
      <v-chart autoresize :option="option" />
    </div>
    <div class="w-[calc(100%-200px)] pl-2 grid grid-cols-12 content-between min-h-[320px]">
      <div class="col-span-12">
        <template v-for="(item, index) in data">
          <div class="leading-[1] mb-2">
            <p v-bind:style="{color:colors[item.key]}" class="text-lg font-black mb-0">{{numeral(item.real).format('0,0.0')}}<small class="text-xs text-textColor3/60 font-normal pl-1 lowercase"> {{ $t('content.sum')}}</small></p>
            <small class="text-xs text-textColor3">{{$t(`accDashboard.chart.${item.key}`)}}</small>
          </div>
        </template>
      </div>

      <div class="border p-4 border-dashed rounded-2xl mt-4 col-span-12"
           :class="[isCorrect? 'bg-success/5 border-success text-success' : 'bg-danger/5 border-danger text-danger']"
      >
        <div class="leading-[1] flex">
          <p class="text-center font-black text-3xl leading-[1] w-[140px]">
            {{Utils.formatToMLN(data?.[0]?.value)}}
            <small class="font-normal text-xs text-textColor3/40"> {{ $t('content.mln') }}</small></p>
          <small class="text-xs text-textColor3/40 text-center flex items-center leading-[1] w-[calc(100%-140px)]">
            <n-icon size="24" class="rotate-[-20deg] text-textColor3">
              <Line32Filled/>
            </n-icon>
            {{$t('accDashboard.chart.sum')}}</small>
        </div>

        <n-divider class="!my-2" dashed>
          <n-icon size="20" class="text-primary">
            <ChevronDoubleUp20Regular/>
          </n-icon>
        </n-divider>

        <div class="leading-[1] flex">
          <p class="text-center font-black text-3xl leading-[1] w-[140px]">
            {{Utils.formatToMLN(data?.[1]?.value)}}
            <small class="font-normal text-xs text-textColor3/40"> {{ $t('content.mln')}}</small></p>
          <small class="text-xs text-textColor3/40 text-center flex items-center leading-[1] w-[calc(100%-140px)]">
            <n-icon size="24" class="rotate-[-20deg] text-textColor3">
              <Line32Filled/>
            </n-icon>
            {{$t('accDashboard.chart.total_four')}}</small>
        </div>


      </div>
    </div>

  </div>

</template>
