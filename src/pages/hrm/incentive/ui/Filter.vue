<script setup>
  import { UIPageFilter, UISelect } from '@/components/index.js'
  import {
    useAccountStore,
    useComponentStore,
    useIncentiveStore
  } from '@/store/modules/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import Utils from '@utils/Utils.js'
  import { ArrowCircleDown32Regular } from '@vicons/fluent'

  const store = useIncentiveStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()

  const onSearch = () => {
    if (!accStore.checkAction(accStore.pn.hrIncentivesRead)) return
    store.params.page = 1
    store._index()
  }

  const filterEvent = () => {
    store._index()
  }

  const filterCount = computed(
    () =>
      Number(Boolean(store.params.organizations.length)) +
      Number(Boolean(store.params.created)) +
      Number(Boolean(store.params.year)) +
      Number(Boolean(store.params.month))
  )

  const beforeShow = (v) => {
    if (v && componentStore.confirmationStatusList.length === 0) {
      componentStore._enumsAdmin()
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
    store.params.confirmation = null
    store.params.created = null
    store.params.year = null
    store.params.month = null
    filterEvent()
  }
</script>

<template>
  <UIPageFilter
    v-model:search="store.params.search"
    @onSearch="onSearch"
    @show="beforeShow"
    @onClear="resetFilter"
    :filter-count="filterCount"
    :search-loading="store.loading"
    :show-add-button="false"
    filter-placement="bottom-end"
    :popover-style="{ width: '560px', maxWidth: 'calc(100vw - 32px)', padding: '0', borderRadius: '20px' }"
  >
    <template #filterAction>
      <n-button v-fly-upload @click="store._download()" :loading="store.loading" type="success">
        <template #icon>
          <ArrowCircleDown32Regular />
        </template>
        {{ $t('content.download') }}
      </n-button>
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
            :checked-val="store.structureCheck2"
            @updateCheck="(v) => (store.structureCheck2 = v)"
            :loading="componentStore.structureLoading"
            @onSubmit="filterEvent"
            v-model:search="componentStore.structureParams.search"
            @onSearch="componentStore._structures"
          />
        </div>
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('content.created') }}</label>
          <n-date-picker
            v-model:value="store.params.created"
            type="date"
            :format="useAppSetting.datePicketFormat"
            @update:value="filterEvent"
            clearable
          />
        </div>
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('content.year') }}</label>
          <n-select
            v-model:value="store.params.year"
            :options="Utils.yearList"
            label-field="name"
            value-field="id"
            clearable
            @update:value="filterEvent"
          />
        </div>
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('content.month') }}</label>
          <n-select
            v-model:value="store.params.month"
            :options="Utils.monthList"
            label-field="name"
            value-field="id"
            clearable
            @update:value="filterEvent"
          />
        </div>
      </div>
    </template>
  </UIPageFilter>
</template>
