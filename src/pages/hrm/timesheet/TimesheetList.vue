<script setup>
import {UIPageContent, UIPageFilter, UIDrawer, UIDConfirm} from "@/components/index.js"
import Table from "./ui/Table.vue"
import Form from "./ui/Form.vue"
import Timesheet from "./ui/Timesheet.vue"
import Filter from "./ui/Filter.vue"
import ConfirmationForm from './ui/ConfirmationForm.vue'

import {
  useAccountStore,
  useTimesheetConfirmStore,
  useTimesheetStore,
  useTimesheetWorkerStore
} from "@/store/modules";

const store = useTimesheetStore()
const timesheetDepartmentStore = useTimesheetWorkerStore()
const confirmationStore = useTimesheetConfirmStore()
const accStore = useAccountStore()


onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.hrTableWorkersRead)) return
  store.params.page = 1
  store.params.search = null
  store._index()
})


</script>

<template>
  <UIPageContent>
    <Filter/>
    <Table/>
    <UIDrawer
        :width="300"
        :visible="store.visible"
        @update:visible="(v)=>store.visible = v"
        :title="store.visibleType ? $t('timesheetPage.create') : $t('timesheetPage.update')"

    >
      <template #content>
        <Form/>
      </template>
    </UIDrawer>
    <UIDrawer
        :width="400"
        v-model:visible="confirmationStore.visible"
        :title="$t('timesheetPage.verifiers')"
    >
      <template #content>
        <ConfirmationForm/>
      </template>
    </UIDrawer>
    <UIDConfirm v-model:visible="store.warningVisible">
      <template #icon> <span></span></template>
      <div class="text-center pt-4">
        <p class="text-xl text-warning">
          {{$t('timesheetPage.closeWarning.title')}}
        </p>
        <p class="text-sm text-secondary">
          {{$t('timesheetPage.closeWarning.desc')}}
        </p>
      </div>
      <template #action>
        <div class="grid grid-cols-2 gap-2 select-none">
          <n-button
              @click="store.warningVisible=false"
              secondary
              type="error">
            {{$t('content.cancel')}}</n-button>
          <n-button
              :loading="store.saveLoading"
              @click="store._closeTimesheet"
              secondary
              type="primary">
            {{$t('content.finish')}}
          </n-button>
        </div>
      </template>
    </UIDConfirm>
    <n-drawer
        height="100vh"
        v-model:show="timesheetDepartmentStore.visible"
        placement="bottom"
    >
      <Timesheet />
    </n-drawer>

  </UIPageContent>
</template>
