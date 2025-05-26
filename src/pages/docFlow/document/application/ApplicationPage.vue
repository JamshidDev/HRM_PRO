<script setup>
import {UIModal, UIOfficeApp, UIPageContent, UIPageFilter} from "@/components/index.js"
import createForm from "./ui/createForm.vue"
import Table from "./ui/Table.vue"
import Filter from "./ui/Filter.vue"
import {useAccountStore, useApplicationStore, useComponentStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
const store = useApplicationStore()
const componentStore = useComponentStore()
const accStore = useAccountStore()
const officeAppRef = ref(null)


const openApplication = (id)=>{
  officeAppRef.value.openPdf(id, Utils.documentModels.workerApplication)
}

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.hrWorkerApplicationsRead)) return
  store._index()
})

onUnmounted(()=>{
  componentStore.clearCache()
})

</script>

<template>
  <UIPageContent>
    <Filter/>
    <UIModal
        :width="600"
        :visible="store.visible"
        @update:visible="(v)=>store.visible = v"
        :title="store.visibleType? $t('applicationPage.createTitle') : $t('applicationPage.updateTitle')"
    >
      <template #default>
        <createForm/>
      </template>
    </UIModal>
    <Table @openOffice="openApplication" />
    <UIOfficeApp ref="officeAppRef"/>
  </UIPageContent>

</template>