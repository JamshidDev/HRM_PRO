<script setup>
import {UIModal, UIPageContent} from "@/components/index.js"
import Filter from "./ui/Filter.vue"
import Table from "./ui/Table.vue"
import DashboardCards from "./ui/DashboardCards.vue"
import PreviewList from "./ui/PreviewList.vue"
import {useAccountStore, useEventStore} from "@/store/modules/index.js"

const store = useEventStore()
const accStore = useAccountStore()

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
      :title="$t('hcEvent.preview')">
    <PreviewList/>
  </UIModal>
</UIPageContent>
</template>
