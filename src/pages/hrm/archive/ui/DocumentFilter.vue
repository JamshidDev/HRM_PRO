<script setup>
  import { useArchiveDocumentStore, useComponentStore } from '@/store/modules/index.js'
  import { UIPageFilter, UISelect } from '@/components/index.js'
  import { Search16Regular } from '@vicons/fluent'

  const store = useArchiveDocumentStore()
  const componentStore = useComponentStore()

  const filterEvent = () => store._filterEvent()

  // Yozish to'xtagach 500ms — har harfga so'rov ketmasin.
  let searchTimer = null
  const onSearchInput = () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(filterEvent, 500)
  }
  onBeforeUnmount(() => clearTimeout(searchTimer))

  // Tur faqat joriy tab ro'yxatiga ta'sir qiladi — badge sonlari o'zgarmaydi.
  const typeEvent = () => {
    store.params.page = 1
    store._index()
  }

  // Uzun tur nomlari qatorga o'raladi (kesilmaydi).
  const renderTypeLabel = (option) =>
    h('div', { class: 'whitespace-normal leading-snug py-1' }, option.name)

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
    :show-search-input="false"
    :show-add-button="false"
    :filter-count="filterCount"
    filter-placement="bottom-end"
    :popover-style="{
      width: '640px',
      maxWidth: 'calc(100vw - 32px)',
      padding: '0',
      borderRadius: '20px'
    }"
    @show="beforeShow"
    @onClear="resetFilter"
  >
    <template #filterBefore>
      <n-input
        v-model:value="store.params.search"
        class="ui-page-search w-full md:w-[460px]!"
        clearable
        :placeholder="$t('archive.documents.searchPh')"
        @input="onSearchInput"
        @keyup.enter="filterEvent"
        @clear="filterEvent"
      >
        <template #prefix>
          <n-icon size="16" class="text-textColor3"><Search16Regular /></n-icon>
        </template>
        <template #suffix>
          <n-spin v-if="store.loading" :size="14" />
        </template>
      </n-input>
    </template>

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
            :render-label="renderTypeLabel"
            :consistent-menu-width="false"
            :menu-props="{ style: { width: '420px', maxWidth: 'calc(100vw - 32px)' } }"
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
