<script setup>
  import { useHolidayGreetingStore, useAccountStore } from '@/store/modules/index.js'
  import { UIModal, UIPageContent, UIPageFilter } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import createForm from './ui/createForm.vue'

  const store = useHolidayGreetingStore()
  const accStore = useAccountStore()

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.admin)) return
    store.onCreate()
  }

  const onSearch = () => {
    if (!accStore.checkAction(accStore.pn.admin)) return
    store.params.page = 1
    store._index()
  }

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.admin)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <UIPageFilter
      v-model:search="store.params.search"
      @on-search="onSearch"
      :search-loading="store.loading"
      @on-add="onAdd"
      :show-filter-button="false"
    />
    <Table />
    <UIModal
      v-model:visible="store.visible"
      width="720"
      height="85vh"
      :title="
        store.visibleType
          ? $t('holidayGreetingPage.createTitle')
          : $t('holidayGreetingPage.updateTitle')
      "
    >
      <template #default>
        <createForm />
      </template>
    </UIModal>
  </UIPageContent>
</template>
