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
  store.params.month = new Date().getMonth()
  store._index()
})
</script>

<template>
<UIPageContent>
  <Filter/>
  <div class="grid grid-cols-12 mt-4 gap-2">
    <div
        v-for="(data, index) in store.cards"
        class="col-span-3"
    >
      <PremiumCard
          :data="data"
      />
    </div>


    <template v-for="(item, idx) in template" :key="idx">
      <div class="col-span-4 bg-surface-section pt-4 rounded-lg border border-surface-line">
        <h1 class="px-4 font-semibold uppercase text-textColor0">{{$t(`accDashboard.chart.${item.name}`)}} <small class="text-textColor3 font-normal lowercase">({{$t('content.mln')}} {{$t('content.sum')}})</small></h1>
        <div class="h-[200px]">
          <StatementChart
              :chart-type="item.type"
          />
        </div>
      </div>
    </template>
    <div class="xl:col-span-4 col-span-6">
      <CircleChart/>
    </div>
    <div class="col-span-4">
      <SemiCircleChart/>
    </div>
    <div class="col-span-4">
      <Circle2Chart/>
    </div>
  </div>
</UIPageContent>
</template>