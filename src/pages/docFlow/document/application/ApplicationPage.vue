<script setup>
import {UIModal, UIOfficeApp, UIPageContent, UIPageFilter} from "@/components/index.js"
import createForm from "./ui/createForm.vue"
import Table from "./ui/Table.vue"
import {useAccountStore, useApplicationStore,} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
const store = useApplicationStore()
const accStore = useAccountStore()
const officeAppRef = ref(null)

const onAdd = ()=>{
  if(!accStore.checkAction(accStore.pn.hrWorkerApplicationsWrite)) return
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

const onSearch = ()=>{
  if(!accStore.checkAction(accStore.pn.hrWorkerApplicationsRead)) return
  store.params.page = 1
  store._index()
}

const openApplication = (id)=>{
  officeAppRef.value.openPdf(id, Utils.documentModels.workerApplication)
}

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.hrWorkerApplicationsRead)) return
  store._index()
})

</script>

<template>
  <UIPageContent>
    <UIPageFilter
        v-model:search="store.params.search"
        :show-filter-button="false"
        @onSearch="onSearch"
        @onAdd="onAdd"/>
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