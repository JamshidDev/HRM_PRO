<script setup>
import {UIPageContent} from "@/components/index.js"
import Filter from "./ui/Filter.vue"
import PremiumCard from "./ui/PremiumCard.vue"
import StatementChart from "./ui/StatementChart.vue"
import CircleChart from "./ui/CircleChart.vue"
import SemiCircleChart from "./ui/SemiCircleChart.vue"
import Circle2Chart from "./ui/Circle2Chart.vue"
import {useAccDashboardStore} from "@/store/modules/index.js"

const store = useAccDashboardStore()

const template = [
  {
    name:"tax_four",
    type:'card_one',
  },
  {
    name:"tax_five",
    type:'card_two',
  },
  {
    name:"statements",
    type:'card_three',
  },
]

onMounted(()=>{
  store.params.year = new Date().getFullYear()
  store.params.month = new Date().getMonth()+1
  store._index()
})
</script>

<template>
<UIPageContent>
  <Filter/>
  <div class="grid grid-cols-12 mt-4 gap-2">
    <div
        v-for="(data, index) in store.cards"
        class="lg:col-span-3 md:col-span-6 col-span-12"
    >
      <PremiumCard
          :index="index+1"
          :data="data"
      />
    </div>


    <template v-for="(item, idx) in template" :key="idx">
      <div class="lg:col-span-4 mg:col-span-6 col-span-12 bg-surface-section pt-4 rounded-2xl border border-surface-line">
        <h1 class="px-4 font-semibold uppercase text-textColor0 line-clamp-1">{{$t(`accDashboard.chart.${item.name}`)}} <small class="text-textColor3 font-normal lowercase">({{$t('content.mln')}} {{$t('content.sum')}})</small></h1>
        <div class="h-[200px]">
          <StatementChart
              :chart-type="item.type"
          />
        </div>
      </div>
    </template>


    <div class="2xl:col-span-4 lg:col-span-6  col-span-12">
      <CircleChart/>
    </div>
    <div class="2xl:col-span-4 lg:col-span-6  col-span-12">
      <SemiCircleChart/>
    </div>
    <div class="2xl:col-span-4 lg:col-span-6  col-span-12">
      <Circle2Chart/>
    </div>
  </div>
</UIPageContent>
</template>