<script setup>
import {UIModal, UIPageContent} from "@/components/index.js"
import {useAccountStore, useTurnstileDashboardStore} from "@/store/modules/index.js"
import {
  MainCard,
  Filter,
  PreviewList,
  GridBox,
} from "./ui/index.js"
import {MainCardsSkeleton, MiniCardSkeleton} from "@/pages/turnstile/dashboard/ui/skeleton/index.js"


const dashboardStore = useTurnstileDashboardStore()
const accStore = useAccountStore()
import {computed, onMounted} from "vue"
import MiniCard from "@/pages/turnstile/dashboard/ui/MiniCard.vue"

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
  dashboardStore._dashboard()
})
</script>

<template>
<UIPageContent>
  <Filter/>
  <div class="grid grid-cols-12 gap-4 mt-4">
    <MainCardsSkeleton class="col-span-9" v-if="dashboardStore.dashboardMainLoading" :count="4" />
    <MainCard v-else />
    <template v-if="dashboardStore.workerStatsLoading">
      <div v-for="idx in 4" :key="idx"  class="lg:col-span-3 md:col-span-6 col-span-12">
        <MiniCardSkeleton />
      </div>
    </template>
    <template v-else>
      <div v-for="(item, idx) in dashboardStore.workerStatuses" :key="idx" class="lg:col-span-3 md:col-span-6 col-span-12">
        <MiniCard
            @click="onPreview(item.previewType)"
            :type="item.type"
            :badge-text="item.status"
            :count="item.count"
            :description="item.description"
            :icon="item.icon"
        />
      </div>
      <div v-for="(item, idx) in dashboardStore.workerInOut" :key="idx" class="lg:col-span-3 md:col-span-6 col-span-12">
        <MiniCard
            @click="onPreview(item.previewType)"
            :type="item.type"
            :badge-text="item.status"
            :count="item.count"
            :description="item.description"
            :icon="item.icon"
        />
      </div>
    </template>
    <GridBox class="mt-4"/>
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
