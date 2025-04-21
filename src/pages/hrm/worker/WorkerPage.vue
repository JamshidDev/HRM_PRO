<script setup>
import {UIModal, UIPageContent, UIDrawer} from "@/components/index.js"
import contractForm from "@/pages/docFlow/document/contract/contractForm.vue"
import Table from "./ui/Table.vue"
import ExportForm from './ui/ExportForm.vue'
import Filter from "./ui/Filter.vue"
import CheckWorker from "./ui/CheckWorker.vue"
import {useTimesheetDepartmentStore, useWorkerStore, useContractStore, useExportStore} from "@/store/modules/index.js"
import TimesheetAssignForm from '../timesheetDepartment/ui/timesheetDepartmentForm.vue'
import router from "@/router/index.js"
import {AppPaths} from "@/utils/index.js"

const store = useWorkerStore()
const contractStore = useContractStore()
const exportStore = useExportStore()
const timesheetDepartmentStore = useTimesheetDepartmentStore()


const onSuccessEv = (id)=>{
  store.visible = false
  router.push({name:`${AppPaths.Contract.substring(1)}`})
}

onMounted(()=>{
  store._index()
})
</script>

<template>
<UIPageContent>
  <Filter/>
  <Table/>
  <CheckWorker/>
  <UIDrawer
      :title="$t('timesheet.assignUser')"
      :width="450"
      v-model:visible="timesheetDepartmentStore.visible"
  >
    <template #content>
      <TimesheetAssignForm/>
    </template>
  </UIDrawer>
  <UIModal
      :title="store.visibleType? $t('documentPage.createTitle') : $t('documentPage.updateTitle')"
      :width="1200"
      v-model:visible="store.visible"
  >
    <template #default>
      <contractForm :call-back="onSuccessEv" />
    </template>
  </UIModal>
  <UIDrawer
      width="100%"
      placement="bottom"
      :title="$t('content.download')"
      v-model:visible="exportStore.visible"
  >
    <template #content>
      <ExportForm />
    </template>
  </UIDrawer>
</UIPageContent>
</template>
