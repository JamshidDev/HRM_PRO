<script setup>
import {UIModal, UIPageContent} from "@/components/index.js"
import {useAccountStore, useTurnstileDashboardStore} from "@/store/modules/index.js"
import {
  Filter,
  PreviewList,
  WorkTimeCard,
  InfoGraph,
  RowChart,
  DeviceCard,
  MonthlyCard,
} from "./ui/index.js"


const dashboardStore = useTurnstileDashboardStore()
const accStore = useAccountStore()
import {computed, onMounted} from "vue"
import SimpleCard from "@/pages/turnstile/dashboard/ui/SimpleCard.vue"
import SimpleCardSketlon from "@/pages/turnstile/dashboard/ui/SimpleCardSketlon.vue"
import {DailyEventChartSkeleton} from "@/pages/turnstile/dashboard/ui/skeleton/index.js"
import DailyEventChart from "@/pages/turnstile/dashboard/ui/DailyEventChart.vue"

const typeTitle = computed(()=>{
  let key = null

  const cardType = dashboardStore.previewParams.type

  if(cardType === 'device_status' && dashboardStore.isOnlineDevice !== null){
    key = dashboardStore.isOnlineDevice ? 'device_status_online' : 'device_status_offline'
  }else{
    key = dashboardStore.yesterday ? dashboardStore.cardTypes[cardType]?.uiKey : dashboardStore.cardTypes[cardType]?.key
  }
  
  
  
  return dashboardStore.cardTypes[key].name
})

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.turnstileDashboard)) return
  dashboardStore.dashboardParams.date = new Date().getTime()
  dashboardStore._dashboard()
})
</script>

<template>
<UIPageContent>
  <Filter/>
  <div class="grid grid-cols-12 gap-4 mt-4">
    <SimpleCardSketlon v-if="dashboardStore.mainChartLoading" :count="2" class="col-span-3"  />
    <template v-else v-for="(item, idx) in  dashboardStore.mainCards" :key="idx">
      <SimpleCard
          class="col-span-3"
          :type="item.type"
          :title="item.title"
          :badge-text="item.badgeText"
          :count="item.count"
          :icon="item.icon"
          :list="item.list"
          :list-more="item.listMore"
      />
    </template>




<!--    Vacation card-->
<!--    <SimpleCardSketlon v-if="dashboardStore.dailyAttendanceLoading" :count="1" class="col-span-3"  />-->
<!--    <template v-else v-for="(item, idx) in  dashboardStore.onVacationWorkers" :key="idx">-->
<!--      <SimpleCard-->
<!--          class="col-span-3"-->
<!--          :type="item.type"-->
<!--          :title="item.title"-->
<!--          :badge-text="item.badgeText"-->
<!--          :count="item.count"-->
<!--          :icon="item.icon"-->
<!--          :list="item.list"-->
<!--          :list-more="item.listMore"-->
<!--          :sketlon-count="1"-->
<!--      />-->
<!--    </template>-->


    <SimpleCardSketlon v-if="dashboardStore.workerStatsLoading" :count="2" class="col-span-3"  />
    <template v-else v-for="(item, idx) in  dashboardStore.currentWorkers" :key="idx">
      <SimpleCard
          class="col-span-3"
          :type="item.type"
          :title="item.title"
          :badge-text="item.badgeText"
          :count="item.count"
          :icon="item.icon"
          :list="item.list"
          :list-more="item.listMore"
          :sketlon-count="1"
      />
    </template>
<!--    <SimpleCardSketlon v-if="dashboardStore.dashboardMainLoading" :count="5" class="col-span-3"  />-->
<!--    <template v-else v-for="(item, idx) in  dashboardStore.mainCards" :key="idx">-->
<!--      <SimpleCard-->
<!--          class="col-span-3"-->
<!--          :type="item.type"-->
<!--          :title="item.title"-->
<!--          :badge-text="item.badgeText"-->
<!--          :count="item.count"-->
<!--          :icon="item.icon"-->
<!--          :list="item.list"-->
<!--          :list-more="item.listMore"-->
<!--          :sketlon-count="1"-->
<!--      />-->
<!--    </template>-->
    <div class="xl:col-span-8 lg:col-span-12 col-span-12 p-2 grid grid-cols-12 border border-surface-line rounded-xl bg-surface-section">
      <div class="xl:col-span-5 lg:col-span-5 col-span-12">
          <RowChart/>
      </div>
      <div class="xl:col-span-7 lg:col-span-7 col-span-12 overflow-hidden">
        <DailyEventChart/>
      </div>

      <!-- @click="onPreview('daily_attendance')" -->
    </div>
    <InfoGraph class="xl:col-span-4 lg:col-span-6 md:col-span-6 col-span-12" />


    <DeviceCard class="xl:col-span-4 lg:col-span-6 md:col-span-6 col-span-12"  />

    <WorkTimeCard class="xl:col-span-8 col-span-12" />
    <MonthlyCard class="col-span-6" />
  </div>




  <UIModal
      v-model:visible="dashboardStore.previewVisible"
      :width="1400"
  >
    <template #header-title>
      <h1 class="text-lg font-medium flex items-center gap-4">
        {{$t('hcEvent.preview')}}
        <span class="bg-primary/10 text-primary py-1 px-2 rounded-2xl text-sm">#{{$t(typeTitle)}}</span>
      </h1>
    </template>
    <PreviewList/>
  </UIModal>
</UIPageContent>
</template>
