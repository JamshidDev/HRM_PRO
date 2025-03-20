<script setup>
import {UIModal, UIPageContent, UIDrawer} from "@/components/index.js"
import contractForm from "@/pages/docFlow/document/contract/contractForm.vue"
import Table from "./ui/Table.vue"
import Filter from "./ui/Filter.vue"
import CheckWorker from "./ui/CheckWorker.vue"
import {useTimesheetDepartmentStore, useWorkerStore} from "@/store/modules/index.js"
import TimesheetAssignForm from '../timesheetDepartment/ui/timesheetDepartmentForm.vue'

const store = useWorkerStore()
const timesheetDepartmentStore = useTimesheetDepartmentStore()

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
  <UIDrawer
      :title="$t('timesheet.assignUser')"
      :width="450"
      v-model:visible="timesheetDepartmentStore.visible"
  >
    <template #content>
      <TimesheetAssignForm/>
    </template>
  </UIDrawer>
</UIPageContent>
</template>
