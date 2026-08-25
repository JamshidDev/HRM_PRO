<script setup>
  import { useArchiveStore, useComponentStore } from '@/store/modules/index.js'
  import { UIPageFilter, UISelect } from '@/components/index.js'
  const store = useArchiveStore()
  const componentStore = useComponentStore()

  const filterEvent = () => {
    store.params.page = 1
    store._index()
  }

  const beforeShow = () => {
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
    if (componentStore.contractTypeList.length === 0) {
      componentStore._enums()
    }
  }

  const onChangeStructure = (v) => {
    store.params.organizations = v
    filterEvent()
  }

  const resetFilter = () => {
    store.resetFilter()
    filterEvent()
  }

  const filterCount = computed(
    () =>
      Number(Boolean(store.params.organizations.length)) +
      Number(Boolean(store.params.contract_type)) +
      Number(Boolean(store.params.date_from)) +
      Number(Boolean(store.params.date_to))
  )
</script>

<template>
  <UIPageFilter
    v-model:search="store.params.search"
    :search-loading="store.loading"
    :show-add-button="false"
    :filter-count="filterCount"
    @onSearch="filterEvent"
    @show="beforeShow"
    @onClear="resetFilter"
  >
    <template #filterContent>
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">
        {{ $t('actionLog.table.structure') }}
      </label>
      <UISelect
        :options="componentStore.structureList"
        :model-v="store.params.organizations"
        @defaultValue="(v) => (store.params.organizations = v)"
        @updateModel="onChangeStructure"
        :loading="componentStore.structureLoading"
        v-model:search="componentStore.structureParams.search"
        @onSearch="componentStore._structures"
        @onSubmit="filterEvent"
      />

      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">
        {{ $t('archive.filter.contractType') }}
      </label>
      <n-select
        v-model:value="store.params.contract_type"
        :options="componentStore.contractTypeList"
        label-field="name"
        value-field="id"
        filterable
        clearable
        :loading="componentStore.enumLoading"
        @update:value="filterEvent"
      />

      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">
        {{ $t('archive.filter.dismissedPeriod') }}
      </label>
      <div class="flex items-center gap-2">
        <n-date-picker
          class="w-full"
          v-model:value="store.params.date_from"
          type="date"
          clearable
          @update:value="filterEvent"
        />
        <n-date-picker
          class="w-full"
          v-model:value="store.params.date_to"
          type="date"
          clearable
          @update:value="filterEvent"
        />
      </div>
    </template>
  </UIPageFilter>
</template>
