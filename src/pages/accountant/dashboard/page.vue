<script setup>
import {UIPageContent} from "@/components/index.js"
import Filter from "./ui/Filter.vue"
import PremiumCard from "./ui/PremiumCard.vue"
import StatementChart from "./ui/StatementChart.vue"
import CircleChart from "./ui/CircleChart.vue"
import {useAccDashboardStore} from "@/store/modules/index.js"

const store = useAccDashboardStore()

const template = [
  {
    name:"Soliq hisoboti 4-ilova",
    type:'card_one',
  },
  {
    name:"Soliq hisoboti 5-ilova",
    type:'card_two',
  },
  {
    name:"Oylik hisobot",
    type:'card_three',
  },
]

onMounted(()=>{
  store._dashboard()
})
</script>

<template>
<UIPageContent>
  <Filter/>
  <div class="grid grid-cols-12 mt-4 gap-2">
    <template v-for="(item, idx) in 3" :key="idx">
      <div class="col-span-4">
        <PremiumCard :index="idx+1" />
      </div>
    </template>
<!--    <template v-for="(item, idx) in 3" :key="idx">-->
<!--      <div class="col-span-4">-->
<!--        <PremiumCard :multiple="true"/>-->
<!--      </div>-->
<!--    </template>-->

    <template v-for="(item, idx) in template" :key="idx">
      <div class="col-span-4 bg-surface-section pt-4 rounded-lg border border-surface-line">
        <h1 class="px-4 font-semibold uppercase">{{item.name}}</h1>
        <div class="h-[320px]">
          <StatementChart
              :chart-type="item.type"
          />
        </div>
      </div>
    </template>
    <div class="col-span-6 bg-surface-section pt-4 rounded-lg border border-surface-line">
      <div class="h-[320px]">
        <CircleChart/>
      </div>
    </div>


  </div>
</UIPageContent>
</template>