<script setup>
  import { UIPageFilter, UISelect } from '@/components/index.js'
  import { useAccountStore, useComponentStore, useVacancyStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  const { t } = i18n.global

  const store = useVacancyStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()

  const onSearch = () => {
    if (!accStore.checkAction(accStore.pn.hrPublicVacancyRead)) return
    store.params.page = 1
    store._index()
  }

  const filterEvent = () => {
    store._index()
  }

  // Vakansiya holati (jadvaldagi «Holati» switch'i bilan bir xil).
  const statusOptions = computed(() => [
    { id: 1, name: t('content.active') },
    { id: 0, name: t('content.noActive') }
  ])

  const onChangeStatus = () => {
    store.params.page = 1
    filterEvent()
  }

  const filterCount = computed(
    () =>
      Number(Boolean(store.params.organizations.length)) +
      Number(Boolean(store.params.vacation_type)) +
      Number(store.params.status !== null)
  )

  const beforeShow = (v) => {
    if (v && componentStore.vacationTypes.length === 0) {
      componentStore._enums()
    }
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  }

  const onChangeStructure = (v) => {
    store.params.organizations = v
    filterEvent()
  }

  const resetFilter = () => {
    store.params.organizations = []
    store.params.vacation_type = null
    store.params.status = null
    filterEvent()
  }

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.hrPublicVacancyWrite)) return
    store.resetForm()
    store.visibleType = true
    store.visible = true
  }
</script>

<template>
  <UIPageFilter
    :add-permission="accStore.pn.hrPublicVacancyWrite"
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
        $t('actionLog.table.structure')
      }}</label>
      <UISelect
        :options="componentStore.structureList"
        :modelV="store.params.organizations"
        @defaultValue="(v) => (store.params.organizations = v)"
        @updateModel="onChangeStructure"
        :checkedVal="store.structureCheck2"
        @updateCheck="(v) => (store.structureCheck2 = v)"
        :loading="componentStore.structureLoading"
        v-model:search="componentStore.structureParams.search"
        @onSearch="componentStore._structures"
        @onSubmit="filterEvent"
      />
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{ $t('content.status') }}</label>
      <n-select
        v-model:value="store.params.status"
        :options="statusOptions"
        label-field="name"
        value-field="id"
        :placeholder="$t('content.all')"
        clearable
        @update:value="onChangeStatus"
      />
    </template>
  </UIPageFilter>
</template>
