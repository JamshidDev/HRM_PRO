<script setup>
import { useConfStaffingApprovalStore} from "@stores"
import {UIOfficeApp, UIPageContent} from "@components"
import { Table } from "./ui"
import Utils from "@utils/Utils.js"


const store = useConfStaffingApprovalStore()
const officeAppRef = ref(null)


const openCommand = (id) => {
  officeAppRef.value.openPdf(id, Utils.documentModels.staffingApprove)
}

onMounted(()=> {
  store._index()
})
</script>

<template>
<UIPageContent>
  <Table @openOffice="openCommand" />
  <UIOfficeApp ref="officeAppRef" />
</UIPageContent>
</template>
