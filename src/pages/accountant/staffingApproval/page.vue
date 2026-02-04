<script setup>
import { useStaffingApprovalStore} from "@stores"
import {UIOfficeApp, UIPageContent} from "@components"
import { Filter, CreateModal, Table} from "./ui"
import Utils from "@utils/Utils.js"

const store = useStaffingApprovalStore()
const officeAppRef = ref(null)

const openCommand = (id) => {
  officeAppRef.value.openPdf(id, Utils.documentModels.staffingApprove)
}

onMounted(() => {
  store._index()
})
</script>

<template>
  <UIPageContent>
    <Filter/>
    <CreateModal/>
    <Table @openOffice="openCommand" />
    <UIOfficeApp ref="officeAppRef" />
  </UIPageContent>
</template>
