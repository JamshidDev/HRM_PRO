<script setup>
import { UIPageContent, UIPageFilter, UIDrawer} from "@/components/index.js"
import Table from "./ui/Table.vue"
import Form from "./ui/Form.vue"
import TimeSheet from "./ui/TimeSheet.vue"
import {useTimeSheetStore, useTimesheetWorkerStore} from "@/store/modules";

const store = useTimeSheetStore()
const workerStore = useTimesheetWorkerStore()

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
        :title="store.visibleType ? $t('timeSheetPage.create') : $t('timeSheetPage.update')"

    >
      <template #content>
        <Form/>
      </template>
    </UIDrawer>
    <n-drawer
        height="100vh"
        v-model:show="workerStore.visible"
        placement="bottom"
    >
      <TimeSheet />
    </n-drawer>
  </UIPageContent>
</template>
