<script setup>
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
import {useDashboardStore} from "@/store/modules/index.js"

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

defineEmits(["detail"])

const  ageOption = ref({
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
  0:'#1A84FF',
  1:'#0F1114',
  2:'#E53835',
}


watch(()=> store.dashboard.ageCard, (newValue)=>{
  ageOption.value.series[0].data =newValue.map((v,idx)=>({
    value:v.count,
    name:t(v.title),
    itemStyle:{
      color:colors[idx]
    },
    selected: true
  }))
  ageOption.value.series[0].name = t('dashboardPage.age.title')
}, {
  immediate: true,
})

</script>

<template>
  <div class="w-full h-full border border-surface-line p-4 rounded-lg bg-surface-section relative hover-effect-card">
    <span class="z-0 opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/effect-card-1.svg)]" ></span>
    <div class="flex justify-between items-center mb-4">
      <p class="font-semibold text-textColor2">{{$t('dashboardPage.age.title')}}</p>
      <p @click="$emit('detail')" class="text-primary border-b border-dashed border-primary z-[1] cursor-pointer transition-all hover:border-primary/80 hover:text-primary/80">{{$t("content.view")}}</p>
<!--      <n-button @click="$emit('detail')" type="primary" tertiary circle>-->
<!--        <template #icon>-->
<!--          <Eye24Regular/>-->
<!--        </template>-->
<!--      </n-button>-->
    </div>
    <div class="grid grid-cols-12">
      <div class="col-span-12 sm:col-span-6">
        <div class="text-textColor3"><span class="shadow-sm w-[30px] h-[18px] bg-primary inline-block rounded-sm mt-[80px] font-semibold mr-4"></span> {{$t('dashboardPage.age.age31')}}</div>
        <div class="text-textColor3"><span class="shadow-sm w-[30px] h-[18px] bg-dark inline-block rounded-sm font-semibold mt-2 mr-4"></span> {{$t('dashboardPage.age.age32_45')}}</div>
        <div class="text-textColor3"><span class="shadow-sm w-[30px] h-[18px] bg-[#E53835] inline-block rounded-sm font-semibold mt-2 mr-4" ></span> {{$t('dashboardPage.age.age46')}}</div>
      </div>

      <div class="col-span-12 sm:col-span-6 h-[250px] relative">
        <v-chart autoresize :option="ageOption" />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>