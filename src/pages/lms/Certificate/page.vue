<script setup>
import {useLmsCertificateStore} from "@stores"
import {UIOfficeApp, UIPageContent} from "@components"
import Table from "./ui/Table.vue"
import Filter from "./ui/Filter.vue"
import {Utils} from "@utils"


const store = useLmsCertificateStore()
const officeAppRef = ref(null)

const openOffice = (id) => {
  officeAppRef.value.openPdf(id, Utils.documentModels.lmsCertificate)
}

onMounted(()=>{
  store._index()
})
</script>

<template>
  <UIPageContent>
    <Filter/>
   <Table @openOffice="openOffice"/>
    <UIOfficeApp ref="officeAppRef" />
  </UIPageContent>
</template>
