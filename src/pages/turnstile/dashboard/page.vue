<script setup>
import {NoDataPicture, UIModal, UIPageContent} from "@/components/index.js"
import {useAccountStore, useEventStore} from "@/store/modules/index.js"
import {
  MainCard,
  Filter,
  PreviewList,
  GridBox,
} from "./ui/index.js"
import MainCardsSkeleton from "@/pages/turnstile/dashboard/ui/MainCardsSkeleton.vue"


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
  <MainCardsSkeleton v-if="store.dashboardMainLoading" :count="4" />
  <MainCard v-else />

  <GridBox/>
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
