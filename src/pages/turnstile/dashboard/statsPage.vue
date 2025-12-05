<script setup>
import {UIPageContent} from "@/components/index.js"
import SimpleCard from "./stats/SimpleCard.vue"
import ScheduleCard from "./stats/ScheduleCard.vue"
import CompareCard from "./stats/CompareCard.vue"
import {useTurnstileDashboardStore} from "@/store/modules/index.js"


const store = useTurnstileDashboardStore()


onMounted(() => {
  store._getStatDashboard()
})
</script>

<template>
  <UIPageContent>
    <n-spin :show="store.statDashboardLoading" class="min-h-[400px]">
      <div class="grid grid-cols-12 gap-4">
        <template v-for="item in 4" :key="item">
          <div class="col-span-3">
            <SimpleCard :index="item" />
          </div>
        </template>
        <template v-for="item in 1" :key="item">
          <div class="col-span-6">
            <ScheduleCard/>
          </div>
        </template>
        <div class="col-span-3">
          <CompareCard/>
        </div>
      </div>
    </n-spin>
  </UIPageContent>
</template>
