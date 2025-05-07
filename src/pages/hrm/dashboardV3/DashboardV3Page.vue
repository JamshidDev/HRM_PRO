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
import i18n from "@/i18n/index.js"
const {t} = i18n.global

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
      name: t('dashboardPage.rewardCard.reward.title'),
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '70%'],
      startAngle: 180,
      endAngle: 360,
      itemStyle: {
        borderRadius:6,
      },
      data: [
        { value: 1048, name: t('dashboardPage.rewardCard.reward.shortTypeOne'),  itemStyle: { color: '#1A84FF' } },
        { value: 735, name: t('dashboardPage.rewardCard.reward.shortTypeTwo'),  itemStyle: { color: '#2dcb73' }  },
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
      name: t('dashboardPage.rewardCard.punishment.title'),
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '70%'],
      startAngle: 180,
      endAngle: 360,
      itemStyle: {
        borderRadius:6,
      },

      data: [
        { value: 1048, name: t('dashboardPage.rewardCard.punishment.shortTypeOne'),   itemStyle: { color: '#1A84FF' } },
        { value: 735, name: t('dashboardPage.rewardCard.punishment.shortTypeOne'),  itemStyle: { color: '#E53835' }  },
      ]
    }
  ]
}







onMounted(()=>{
  store._index()
})
</script>

<template>
  <UIPageContent>
    <n-spin :show="store.loading">
      <div class="grid grid-cols-12 gap-1 md:gap-2 lg:gap-3">
        <template v-for="(card, idx) in store.dashboard.mainCard" :key="idx">
          <div class="col-span-12 md:col-span-6 lg:col-span-6 xl:col-span-3">
            <div class="w-full border border-surface-line p-4 rounded-lg bg-surface-section relative cursor-pointer">
              <span class="z-1 opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]" ></span>
              <p class="font-medium text-textColor2">{{$t(card?.total.title)}}</p>
              <h3 class="text-2xl font-semibold mt-2 text-textColor0">{{card?.total?.count}}</h3>
              <div class="w-full flex justify-between mt-4">
                <span class="text-xs text-textColor0">{{$t(card?.data1.title)}} - <span class="text-sm font-semibold">{{card?.data1?.count}}</span></span>
                <span class="text-xs text-textColor2">{{$t(card?.data2.title)}} - <span class="text-sm font-semibold">{{card?.data2?.count}}</span></span>
              </div>
            </div>
          </div>
        </template>
        <div class="col-span-12 md:col-span-6 lg:col-span-6 xl:col-span-4">
          <AgeChart/>
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-6 xl:col-span-4">
          <EduChart/>
        </div>

        <div class="col-span-12 md:col-span-12 lg:col-span-6 xl:col-span-4">
          <div class="w-full h-full border border-surface-line p-4 rounded-lg bg-surface-section relative hover-effect-card">
            <span class="z-1 opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/effect-card-1.svg)]" ></span>
            <div class="flex h-auto">
              <div class="text-textColor2" style="width: calc(100% - 280px)">
                <p class="font-bold text-textColor0">{{$t('dashboardPage.rewardCard.reward.title')}}</p>
                <p class="mt-2 text-xs">{{$t('dashboardPage.rewardCard.reward.typeOne')}}</p>
                <h3 class="font-semibold leading-[1.2]">0</h3>

                <p class="mt-2 text-xs">{{$t('dashboardPage.rewardCard.reward.typeTwo')}}</p>
                <h3 class="font-semibold leading-[1.2]">0</h3>

              </div>
              <div class="w-[280px] h-[120px] relative z-2">
                <v-chart :option="pieOption" />
              </div>
            </div>
            <hr class="w-full h-[1px] text-surface-line mt-2">
            <div class="flex h-auto mt-2">
              <div class="text-textColor2" style="width: calc(100% - 280px)">
                <p class="font-bold text-textColor0">{{$t('dashboardPage.rewardCard.punishment.title')}}</p>

                <p class="mt-2 text-xs">{{$t('dashboardPage.rewardCard.punishment.typeOne')}}</p>
                <h3 class="font-semibold leading-[1.2]">0</h3>

                <p class="mt-2 text-xs">{{$t('dashboardPage.rewardCard.punishment.typeTwo')}}</p>
                <h3 class="font-semibold leading-[1.2]">0</h3>
              </div>
              <div class="w-[280px] h-[120px] relative z-2">
                <v-chart :option="pieOption2" />
              </div>
            </div>
          </div>
        </div>


        <div class="col-span-12 md:col-span-12 lg:col-span-6 xl:col-span-8">
          <YearlyChart/>
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-6 xl:col-span-4">
          <BirthdayCard/>
        </div>


        <div class="col-span-12 md:col-span-6 lg:col-span-6 xl:col-span-4">
          <VacationChart/>
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-6 xl:col-span-4">
          <ContractChart/>
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-6 xl:col-span-4">
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
    transform: scale(1.01);
    z-index: 10;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  }

}


</style>
