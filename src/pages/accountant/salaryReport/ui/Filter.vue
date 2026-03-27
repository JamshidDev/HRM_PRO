<script setup>
  import { UIPageFilter, UISelect, UIYearMonth } from '@/components/index.js'
  import {
    useAccountStore,
    useComponentStore,
    useSalaryReportStore
  } from '@/store/modules/index.js'
  import { ArrowCircleDown48Regular } from '@vicons/fluent'
  import { getOneMonthAgoYearMonth } from '@utils'

  const store = useSalaryReportStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()

  const filterEvent = () => {
    if (!accStore.checkAction(accStore.pn.economistStatementsCode)) return
    if (store.activeTab === 1) {
      store._index()
    } else {
      store._indexOrg()
    }
  }

  const onChangeStructure = (v) => {
    store.params.organizations = v
    filterEvent()
  }

  const filterCount = computed(() => {
    const def = getOneMonthAgoYearMonth()
    return (
      Number(Boolean(store.params.organizations.length)) +
      Number(store.params.year !== def.year || store.params.month !== def.month)
    )
  })

  const onClear = () => {
    const def = getOneMonthAgoYearMonth()
    store.params.organizations = []
    store.params.year = def.year
    store.params.month = def.month
    filterEvent()
  }

  onMounted(() => {
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  })
</script>

<template>
  <UIPageFilter
    @onClear="onClear"
    :filterCount="filterCount"
    v-model:search="store.params.search"
    @onSearch="filterEvent"
    :show-add-button="false"
  >
    <template #filterAction>
      <n-button
        v-fly-upload
        type="success"
        :loading="store.downloadLoading"
        @click="store._downloadExcel()"
      >
        {{ $t('content.download') }}
        <template #icon>
          <ArrowCircleDown48Regular />
        </template>
      </n-button>
      <n-select
        class="w-full! md:w-[200px]!"
        v-model:value="store.activeTab"
        :options="store.tabs"
        label-field="name"
        value-field="id"
      />
    </template>
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
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{ $t('content.year') }} / {{ $t('content.month') }}</label>
      <UIYearMonth
        v-model:year="store.params.year"
        v-model:month="store.params.month"
        :clearable="false"
        @change="filterEvent"
      />
    </template>
  </UIPageFilter>
</template>
