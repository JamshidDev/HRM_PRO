<script setup>
import { UIPageContent, UIPageFilter, UIDrawer} from "@/components/index.js"
import Table from "./ui/Table.vue"
import Form from "./ui/Form.vue"
import Timesheet from "./ui/Timesheet.vue"
import ConfirmationForm from './ui/ConfirmationForm.vue'

import {
  useTimesheetConfirmStore,
  useTimesheetStore,
  useTimesheetWorkerStore
} from "@/store/modules";

const store = useTimesheetStore()
const timesheetDepartmentStore = useTimesheetWorkerStore()
const confirmationStore = useTimesheetConfirmStore()


const onSearch = ()=>{
  store.params.page = 1
  store._index()
}

onMounted(()=>{
  store.params.page = 1
  store.params.search = null
  store._index()
})

const onAdd = ()=>{
  store.visibleType = true
  store.resetForm()
  store.visible = true
}

</script>

<template>
  <UIPageContent>
    <UIPageFilter
        v-model:search="store.params.search"
        @onSearch="onSearch"
        :show-filter-button="false"
        @on-add="onAdd"
    />
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
    <n-drawer
        height="100vh"
        v-model:show="timesheetDepartmentStore.visible"
        placement="bottom"
    >
      <Timesheet />
    </n-drawer>

  </UIPageContent>
</template>
