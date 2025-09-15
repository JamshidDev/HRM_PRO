<script setup>
import {UIModal, UIPageContent} from "@/components/index.js"
import {useAccountStore, useSyncLogStore} from "@/store/modules/index.js"
import Filter from "./ui/Filter.vue"
import Table from "./ui/Table.vue"
import PreviewList from './ui/PreviewList.vue'

const store = useSyncLogStore()
const accStore = useAccountStore()

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.turnstileHikCentralSyncRead)) return
  store._index()
})
</script>

<template>
<UIPageContent>
  <Filter/>
  <Table/>
  <UIModal
      :width="1200"
      :visible="store.visible"
      @update:visible="(v)=>store.visible = v"
      :title="$t('syncLog.createTitle')"
  >
    <PreviewList/>
  </UIModal>
</UIPageContent>
</template>
