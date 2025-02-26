<script setup>
import {UIModal, UIOfficeApp, UIPageContent, UIPageFilter} from "@/components/index.js"
import createForm from "./ui/createForm.vue"
import Table from "./ui/Table.vue"
import {useApplicationStore,} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
const store = useApplicationStore()
const officeAppRef = ref(null)

const onAdd = ()=>{
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

const onSearch = ()=>{
  store.params.page = 1
  store._index()
}

const openApplication = (id)=>{
  officeAppRef.value.openPdf(id, Utils.documentModels.workerApplication)
}

onMounted(()=>{
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