<script setup>
import {UIModal, UIPageContent} from "@/components/index.js"
import contractForm from "@/pages/docFlow/document/contract/contractForm.vue"
import Table from "./ui/Table.vue"
import Filter from "./ui/Filter.vue"
import CheckWorker from "./ui/CheckWorker.vue"
import {useWorkerStore} from "@/store/modules/index.js"

const store = useWorkerStore()

onMounted(()=>{
  store._index()
})
</script>

<template>
<UIPageContent>
  <Filter/>
  <Table/>
  <CheckWorker/>
  <UIModal
      :title="$t('documentPage.createTitle')"
      :width="1200"
      v-model:visible="store.visible"
  >
    <contractForm/>
  </UIModal>
</UIPageContent>
</template>
