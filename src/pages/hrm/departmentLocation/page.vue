<script setup>
  import { UIPageContent } from '@/components/index.js'
  import { DepartmentTable, LocationTable, Filter, CreateForm } from './ui'
  import ViewModal from './ui/ViewModal.vue'
  import WorkerTable from './ui/WorkerTable.vue'
  import StatsCards from './ui/StatsCards.vue'
  import WorkerLocationsModal from './ui/WorkerLocationsModal.vue'
  import { useDepartmentLocationStore } from '@/store/modules/index.js'

  const store = useDepartmentLocationStore()

  const loaders = {
    departments: () => store._index(),
    locations: () => store._locationIndex(),
    workers: () => store._workerIndex()
  }

  const onTabChange = (tab) => {
    store.activeTab = tab
    loaders[tab]?.()
    store._stats()
  }

  onMounted(() => {
    store._index()
    store._stats()
  })
</script>

<template>
  <UIPageContent class="h-full flex flex-col">
    <StatsCards />
    <Filter @change-tab="onTabChange" />
    <n-tabs
      type="segment"
      :value="store.activeTab"
      @update:value="onTabChange"
      class="hidden-tab-header flex-1 flex flex-col"
      pane-wrapper-class="flex-1 flex flex-col"
      animated
    >
      <n-tab-pane
        name="departments"
        :tab="$t('departmentLocationPage.tabs.departments')"
        class="!pt-0 flex-1 flex flex-col"
      >
        <DepartmentTable />
      </n-tab-pane>
      <n-tab-pane
        name="locations"
        :tab="$t('departmentLocationPage.tabs.locations')"
        class="!pt-0 flex-1 flex flex-col"
      >
        <LocationTable />
      </n-tab-pane>
      <n-tab-pane name="workers" :tab="$t('departmentLocationPage.tabs.workers')" class="!pt-0 flex-1 flex flex-col">
        <WorkerTable />
      </n-tab-pane>
    </n-tabs>
    <CreateForm />
    <ViewModal />
    <WorkerLocationsModal />
  </UIPageContent>
</template>
