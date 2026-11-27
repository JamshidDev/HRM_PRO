<script setup>
  import { UIPageFilter, UISelect } from '@/components/index.js'
  import {
    useAccountStore,
    useComponentStore,
    useOrganizationLeaderStore
  } from '@/store/modules/index.js'

  const store = useOrganizationLeaderStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.hrLeadersWrite)) return
    store.resetForm()
    store.visibleType = true
    store.visible = true
  }

  const onSearch = () => {
    if (!accStore.checkAction(accStore.pn.hrLeadersRead)) return
    store.params.page = 1
    store._index()
  }

  // Filter o'zgarsa — 1-sahifadan (aks holda 3-sahifada turib filtrlasak bo'sh ro'yxat chiqadi)
  const filterEvent = () => {
    store.params.page = 1
    store._index()
  }

  // Filterda faqat tashkilot bor
  const filterCount = computed(() => Number(Boolean(store.params.organizations.length)))

  const beforeShow = () => {
    // Tashkilot qidiruvi umumiy (componentStore) — qo'shish oynasida yozilgan matn filtrga
    // o'tib qolmasin: qidiruv bo'lsa tozalab, to'liq daraxtni qayta yuklaymiz
    if (componentStore.structureParams.search) {
      componentStore.structureParams.search = null
      componentStore._structures()
    } else if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  }

  // BACKEND: filtr to'liq ishlashi uchun `GET /v1/hr/leaders` `organizations` ichki tashkilotlar va
  // guruhlarni o'zi qamrab olishi kerak — talablar: docs/api/organization-leaders.md, 3-bo'lim
  const onChangeStructure = (v) => {
    store.params.organizations = v
    filterEvent()
  }

  const resetFilter = () => {
    store.params.organizations = []
    filterEvent()
  }
</script>

<template>
  <UIPageFilter
    :add-permission="accStore.pn.hrLeadersWrite"
    v-model:search="store.params.search"
    @onSearch="onSearch"
    @show="beforeShow"
    @onClear="resetFilter"
    :filter-count="filterCount"
    :search-loading="store.loading"
    @onAdd="onAdd"
  >
    <template #filterContent>
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{
        $t('content.organization')
      }}</label>
      <UISelect
        :options="componentStore.structureList"
        :modelV="store.params.organizations"
        @defaultValue="(v) => (store.params.organizations = v)"
        @updateModel="onChangeStructure"
        :checkedVal="store.structureCheck2"
        @updateCheck="(v) => (store.structureCheck2 = v)"
        v-model:search="componentStore.structureParams.search"
        @onSearch="componentStore._structures"
        :loading="componentStore.structureLoading"
        @onSubmit="filterEvent"
      />
    </template>
  </UIPageFilter>
</template>
