<script setup>
import {UIModal, UIOfficeApp, UIPageContent, UIPageFilter} from "@/components/index.js"
import createForm from "./ui/createForm.vue"
import Table from "./ui/Table.vue"
import {useConfApplicationStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import Banner from "./ui/Banner.vue"
const store = useConfApplicationStore()

const officeAppRef = ref(null)
const onAdd = ()=>{
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

const onSearch = ()=>{

}

const openOffice = (v)=>{
  officeAppRef.value.openPdf(v.documentId, Utils.documentModels.workerApplication, v.signatureId)
}

onMounted(()=>{
  store._index()
})

</script>

<template>
  <UIPageContent>
    <Banner/>
    <UIPageFilter
        class="mt-4"
        v-model:search="store.params.search"
        :show-filter-button="false"
        :show-add-button="false"
        @onSearch="onSearch"
        @onAdd="onAdd"/>
    <UIModal
        :width="600"
        :visible="store.visible"
        @update:visible="(v)=>store.visible = v"
        :title="store.visibleType? $t('applicationPage.createWorkerApplication') : $t('applicationPage.updateWorkerApplication')"
    >
      <template #default>
        <createForm/>
      </template>
    </UIModal>
    <Table @openOffice="openOffice" />
    <UIOfficeApp ref="officeAppRef"/>
  </UIPageContent>

</template>