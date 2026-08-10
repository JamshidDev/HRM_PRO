<script setup>
  import { useHolidayGreetingStore, useAccountStore } from '@/store/modules/index.js'
  import { UIModal, UIPageContent, UIPageFilter } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import createForm from './ui/createForm.vue'

  const store = useHolidayGreetingStore()
  const accStore = useAccountStore()

  // Ilgari butun bo'lim qo'pol `admin` slug'i bilan qo'riqlanardi. Backend
  // `holiday-greetings-read/-write/-delete` oilasini enforce qiladi va rol
  // formasida alohida guruh sifatida beriladi.
  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.holidayGreetingsWrite)) return
    store.onCreate()
  }

  const onSearch = () => {
    if (!accStore.canView(accStore.pn.holidayGreetings)) return
    store.params.page = 1
    store._index()
  }

  onMounted(() => {
    if (!accStore.canView(accStore.pn.holidayGreetings)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <UIPageFilter
      :add-permission="accStore.pn.holidayGreetingsWrite"
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
