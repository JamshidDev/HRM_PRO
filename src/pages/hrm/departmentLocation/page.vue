<script setup>
  import { UIPageContent } from '@/components/index.js'
  import { DepartmentTable, LocationTable, Filter, CreateForm } from './ui'
  import ViewModal from './ui/ViewModal.vue'
  import { useDepartmentLocationStore } from '@/store/modules/index.js'

  const store = useDepartmentLocationStore()

  const onTabChange = (tab) => {
    store.activeTab = tab
    if (tab === 'departments') {
      store._index()
    } else {
      store._locationIndex()
    }
  }

  onMounted(() => {
    store._index()
  })
</script>

<template>
  <UIPageContent class="h-full flex flex-col">
    <Filter />
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
    </n-tabs>
    <CreateForm />
    <ViewModal />
  </UIPageContent>
</template>
