<script setup>
import {UIModal, UIPageContent, UIDrawer} from "@/components/index.js"
import contractForm from "@/pages/docFlow/document/contract/contractForm.vue"
import Table from "./ui/Table.vue"
import ExportForm from './ui/ExportForm.vue'
import Filter from "./ui/Filter.vue"
import CheckWorker from "./ui/CheckWorker.vue"
import UserRolePage from "./ui/UserRolePage.vue"
import {
  useTimesheetDepartmentStore,
  useWorkerStore,
  useExportStore,
  useAccountStore
} from "@/store/modules/index.js"
import TimesheetAssignForm from '../timesheetDepartment/ui/timesheetDepartmentForm.vue'
import router from "@/router/index.js"
import {AppPaths} from "@/utils/index.js"

const store = useWorkerStore()
const accStore = useAccountStore()
const exportStore = useExportStore()
const timesheetDepartmentStore = useTimesheetDepartmentStore()


const onSuccessEv = (id)=>{
  store.visible = false
  router.push({name:`${AppPaths.Contract.substring(1)}`})
}

const submitExportResume = (v)=>{
  exportStore.resumePayload.passport = v
  exportStore._export_resume(store._params())
}

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.hrWorkersRead)) return
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
  <UIModal
      :title="$t('exportPage.addPassport')"
      :width="500"
      v-model:visible="exportStore.resumeModalVisible"
  >

    <template #default>
      <n-divider class="my-2! mb-3" />

      <n-spin :show="exportStore.exportResumeLoading">
        <n-space justify="end" >
          <n-button
              secondary
              size="large"
              @click="submitExportResume(false)"
              type="error"
          >{{ $t('content.no') }}
          </n-button>
          <n-button
              size="large"
              secondary
              @click="submitExportResume(true)"
              type="primary"
          >{{ $t('content.yes') }}
          </n-button>
        </n-space>
      </n-spin>
    </template>
  </UIModal>
  <UIDrawer
      width="100%"
      placement="bottom"
      :title="$t('content.export')"
      v-model:visible="exportStore.visible"
  >
    <template #content>
      <ExportForm />
    </template>
  </UIDrawer>
  <UIModal
      :title="$t('workerRole.name')"
      :width="1200"
      v-model:visible="store.userRoleVisible"
  >

    <template #default>
     <UserRolePage/>
    </template>
  </UIModal>
</UIPageContent>
</template>
