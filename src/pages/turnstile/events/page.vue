<script setup>
import {UIModal, UIPageContent} from "@/components/index.js"
import Filter from "./ui/Filter.vue"
import Table from "./ui/Table.vue"
import DashboardCards from "./ui/DashboardCards.vue"
import PreviewList from "./ui/PreviewList.vue"
import {useAccountStore, useEventStore} from "@/store/modules/index.js"

const store = useEventStore()
const accStore = useAccountStore()

const typeTitle = computed(()=>{
  return store.typeList.filter((v)=>v.id === store.previewParams.type)?.[0]?.name
})

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.turnstileHikCentralEvents)) return
  store._index()
  store._dashboard()
})
</script>

<template>
<UIPageContent>
  <Filter/>
  <DashboardCards/>
  <Table/>
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
