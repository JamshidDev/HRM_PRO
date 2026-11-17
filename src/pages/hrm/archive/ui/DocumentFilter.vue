<script setup>
  import { useArchiveDocumentStore, useComponentStore } from '@/store/modules/index.js'
  import { UIPageFilter, UISelect } from '@/components/index.js'

  const store = useArchiveDocumentStore()
  const componentStore = useComponentStore()

  const filterEvent = () => store._filterEvent()

  // Tur faqat joriy tab ro'yxatiga ta'sir qiladi — badge sonlari o'zgarmaydi.
  const typeEvent = () => {
    store.params.page = 1
    store._index()
  }

  const beforeShow = () => {
    if (componentStore.structureList.length === 0) componentStore._structures()
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
      Number(Boolean(store.params.type)) +
      Number(Boolean(store.params.number)) +
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
    filter-placement="bottom-end"
    :popover-style="{
      width: '560px',
      maxWidth: 'calc(100vw - 32px)',
      padding: '0',
      borderRadius: '20px'
    }"
    @onSearch="filterEvent"
    @show="beforeShow"
    @onClear="resetFilter"
  >
    <template #filterContent>
      <div class="ui-filter-grid grid grid-cols-12 gap-x-5 gap-y-4">
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('actionLog.table.structure') }}</label>
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
        </div>
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('archive.documents.type') }}</label>
          <n-select
            v-model:value="store.params.type"
            :options="store.typeOptions"
            label-field="name"
            value-field="id"
            filterable
            clearable
            @update:value="typeEvent"
          />
        </div>
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('archive.documents.number') }}</label>
          <n-input
            v-model:value="store.params.number"
            clearable
            :placeholder="$t('archive.documents.numberPh')"
            @keyup.enter="filterEvent"
            @clear="filterEvent"
          />
        </div>
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('archive.documents.period') }}</label>
          <div class="flex gap-2">
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
        </div>
      </div>
    </template>
  </UIPageFilter>
</template>
