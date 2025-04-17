<script setup>
import {UIPageContent} from "@/components/index.js"
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, PieChart } from 'echarts/charts';
import ContractChart from "./ui/ContractChart.vue"
import AgeChart from "./ui/AgeChart.vue"
import EduChart from "./ui/EduChart.vue"
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';

import  {useDashboardStore} from "@/store/modules/index.js"
import InfoCard from "@/pages/hrm/dashboardV3/ui/InfoCard.vue"
import YearlyChart from "@/pages/hrm/dashboardV3/ui/YearlyChart.vue"
import BirthdayCard from "@/pages/hrm/dashboardV3/ui/BirthdayCard.vue"
import VacationChart from "@/pages/hrm/dashboardV3/ui/VacationChart.vue"


const store = useDashboardStore()

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  PieChart,
]);

const  pieOption = {
  tooltip: {
    trigger: 'item'
  },
  legend: {
    top: '5%',
    left: 'center',
    show:false,
  },
  series: [
    {
      name: 'Access From',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '70%'],
      startAngle: 180,
      endAngle: 360,
      itemStyle: {
        borderRadius:6,
      },
      data: [
        { value: 1048, name: 'Faxriy',  itemStyle: { color: '#1A84FF' } },
        { value: 735, name: 'Boshqa',  itemStyle: { color: '#2dcb73' }  },
      ]
    }
  ]
}


const  pieOption2 = {
  tooltip: {
    trigger: 'item'
  },
  legend: {
    top: '5%',
    left: 'center',
    show:false,
  },
  series: [
    {
      name: 'Access From',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '70%'],
      startAngle: 180,
      endAngle: 360,
      itemStyle: {
        borderRadius:6,
      },

      data: [
        { value: 1048, name: 'Hayfsan',  itemStyle: { color: '#1A84FF' } },
        { value: 735, name: 'Boshqa',  itemStyle: { color: '#E53835' }  },
      ]
    }
  ]
}

const vacationOption = {
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
    data: ['Brazil', 'Indonesia', 'USA', 'India', 'China', 'World'],
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
}






onMounted(()=>{
  store._index()
})
</script>

<template>
  <UIPageContent>
    <n-spin :show="store.loading">
      <div class="grid grid-cols-12 gap-4">
        <template v-for="(card, idx) in store.dashboard.mainCard" :key="idx">
          <div class="col-span-3">
            <div class="w-full border border-surface-line p-4 rounded-lg bg-surface-section relative cursor-pointer scale-[1] hover:scale-[1.07] transition-all hover:z-10 hover:shadow-sm duration-200">
              <span class="z-[1] opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/public/effect/primary-card.svg)]" ></span>
              <p class="font-medium text-textColor2">{{$t(card?.total.title)}}</p>
              <h3 class="text-2xl font-semibold mt-2 text-textColor0">{{card?.total?.count}}</h3>
              <div class="w-full flex justify-between mt-4">
                <span class="text-xs text-textColor1">{{$t(card?.data1.title)}} - <span class="text-sm font-semibold">{{card?.data1?.count}}</span></span>
                <span class="text-xs text-textColor1">{{$t(card?.data2.title)}} - <span class="text-sm font-semibold">{{card?.data2?.count}}</span></span>
              </div>
            </div>
          </div>
        </template>
        <div class="col-span-4">
          <AgeChart/>
        </div>
        <div class="col-span-4">
          <EduChart/>
        </div>

        <div class="col-span-4">
          <div class="w-full h-full border border-surface-line p-4 rounded-lg bg-surface-section relative hover-effect-card">
            <span class="z-[1] opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/public/effect/effect-card-1.svg)]" ></span>
            <div class="flex h-auto">
              <div style="width: calc(100% - 280px)">
                <p class="font-bold">Rag'batlantirish</p>
                <p class="mt-2 text-xs">Faxriy temiryo'lchi faxriy unvoni</p>
                <h3 class="font-semibold leading-[1.2]">45 000</h3>

                <p class="mt-2 text-xs">Boshqa mukofatlar</p>
                <h3 class="font-semibold leading-[1.2]">5 000</h3>

              </div>
              <div class="w-[280px] h-[120px] relative z-[2]">
                <v-chart :option="pieOption" />
              </div>
            </div>
            <hr class="w-full h-[1px] text-surface-line mt-2">
            <div class="flex h-auto mt-2">
              <div style="width: calc(100% - 280px)">
                <p class="font-bold">Intizomiy jazo</p>

                <p class="mt-2 text-xs">Hayfsan</p>
                <h3 class="font-semibold leading-[1.2]">45 000</h3>

                <p class="mt-2 text-xs">Boshqa jazolar</p>
                <h3 class="font-semibold leading-[1.2]">5 000</h3>
              </div>
              <div class="w-[280px] h-[120px] relative z-[2]">
                <v-chart :option="pieOption2" />
              </div>
            </div>
          </div>
        </div>


        <div class="col-span-8">
          <YearlyChart/>
        </div>
        <div class="col-span-4">
          <BirthdayCard/>
        </div>


        <div class="col-span-4">
          <VacationChart/>
        </div>
        <div class="col-span-4">
          <ContractChart/>
        </div>
        <div class="col-span-4">
          <InfoCard/>
        </div>
      </div>
    </n-spin>

  </UIPageContent>
</template>

<style lang="scss">

.hover-effect-card{
  cursor: pointer;
  transform: scale(1);
  transition: 0.2s ease;

  &:hover{
    transform: scale(1.04);
    z-index: 10;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  }

}


</style>
