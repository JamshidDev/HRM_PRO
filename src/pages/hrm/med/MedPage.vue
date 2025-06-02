<script setup>
import {useComponentStore, useMedStore, useAccountStore, useMedInspectionStore} from "@/store/modules/index.js"
import Table from "./ui/Table.vue"
import createForm from "./ui/createForm.vue"
import Filter from "./ui/Filter.vue"
import SendInspectionForm from "@/pages/hrm/med/ui/SendInspectionForm.vue"
import {UIDrawer, UIPageContent} from "@/components/index.js"

const store = useMedStore()
const componentStore = useComponentStore()
const accStore = useAccountStore()
const inspectionStore = useMedInspectionStore()


const onAdd = ()=>{
  if(!accStore.checkAction(accStore.pn.hrMedWrite)) return
  store.resetForm()
  componentStore.selectedWorker = null
  store.elementId = null
  store.visibleType = true
  store.visible = true
}

const onSearch = ()=>{
  if(!accStore.checkAction(accStore.pn.hrMedRead)) return
  store.params.page = 1
  store._index()
}

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.hrMedRead)) return
  store._index()
})

onUnmounted(()=>{
  componentStore.clearCache()
})
</script>

<template>
  <UIPageContent>
    <Filter/>
    <Table/>
    <UIDrawer
        :visible="store.visible"
        @update:visible="(v)=>store.visible = v"
        :title="store.visibleType? $t('medPage.createTitle') : $t('medPage.updateTitle')"
    >
      <template #content>
        <createForm/>
      </template>
    </UIDrawer>
    <UIDrawer
        :visible="inspectionStore.visible"
        @update:visible="(v)=>inspectionStore.visible = v"
        :title="inspectionStore.visibleType? $t('medInspection.createTitle') : $t('medInspection.updateTitle')"
    >
      <template #content>
        <SendInspectionForm/>
      </template>
    </UIDrawer>
  </UIPageContent>
</template>

<style scoped>

</style>