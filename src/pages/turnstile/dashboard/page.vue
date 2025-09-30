<script setup>
import {NoDataPicture, UIModal, UIPageContent} from "@/components/index.js"
import {useAccountStore, useEventStore} from "@/store/modules/index.js"
import {
  MainCard,
  Filter,
  PreviewList,
  GridBox,
} from "./ui/index.js"


const store = useEventStore()
const accStore = useAccountStore()
import {computed, onMounted} from "vue"

const typeTitle = computed(()=>{
  return store.typeList.filter((v)=>v.id === store.previewParams.type)?.[0]?.name
})

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.admin)) return
  store._dashboard()


})
</script>

<template>
<UIPageContent>
  <Filter/>
  <n-spin :show="store.dashboardLoading" class="min-h-[400px]">
    <template v-if="store.dashboardObj">
      <MainCard/>
      <GridBox/>
    </template>
    <NoDataPicture v-if="!store.dashboardObj && !store.dashboardLoading" />
  </n-spin>

  <UIModal
      v-model:visible="store.previewVisible"
      :width="1400"
  >
    <template #header-title>
      <h1 class="text-lg font-medium flex items-center gap-4">
        {{$t('hcEvent.preview')}}
        <span class="bg-primary/10 text-primary py-1 px-2 rounded-2xl text-sm">#{{typeTitle}}</span>
      </h1>
    </template>
    <PreviewList/>
  </UIModal>
</UIPageContent>
</template>