<script setup>
  import { UIPageFilter, UISelect } from '@/components/index.js'
  import { useAccountStore, useComponentStore, usePensionStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { ArrowCircleDown32Regular, ArrowSync20Filled } from '@vicons/fluent'

  const store = usePensionStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()

  const filterEvent = () => {
    if (!accStore.checkAction(accStore.pn.economistPensionPaymentsRead)) return
    store.params.page = 1
    store._index()
  }

  const onChangeStructure = (v) => {
    store.params.organizations = v
    filterEvent()
  }

  const filterCount = computed(() => {
    return (
      Number(Boolean(store.params.organizations.length)) +
      Number(Boolean(store.params.year)) +
      Number(Boolean(store.params.month))
    )
  })

  const beforeShow = (v) => {
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  }

  const onClear = () => {
    store.resetParams()
    filterEvent()
  }

  const onRefreshEv = () => {
    store.loading = true
    const params = {
      type: 'pension-payments',
      year: store.params.year,
      month: store.params.month
    }
    componentStore._refreshPin(params, store._index, () => {
      store.loading = false
    })
  }
</script>

<template>
  <UIPageFilter
    :show-add-button="false"
    @onClear="onClear"
    @show="beforeShow"
    :filterCount="filterCount"
    v-model:search="store.params.search"
    @onSearch="filterEvent"
  >
    <template #filterAction>
      <n-tooltip :delay="1500" placement="bottom" trigger="hover">
        <template #trigger>
          <n-button @click="onRefreshEv" :loading="store.loading" type="primary">
            {{ $t('content.refresh') }}
            <template #icon>
              <ArrowSync20Filled />
            </template>
          </n-button>
        </template>
        <span>{{ $t('monthReport.refreshDescription') }}</span>
      </n-tooltip>
      <n-button @click="store._download()" :loading="store.downloadLoading" type="success">
        <template #icon>
          <ArrowCircleDown32Regular />
        </template>
        {{ $t('content.template') }}
      </n-button>
    </template>
    <template #filterContent>
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{
        $t('actionLog.table.structure')
      }}</label>
      <UISelect
        :options="componentStore.structureList"
        :modelV="store.params.organizations"
        @updateModel="onChangeStructure"
        @defaultValue="(v) => (store.params.organizations = v)"
        :checkedVal="store.structureCheck2"
        @updateCheck="(v) => (store.structureCheck2 = v)"
        :loading="componentStore.structureLoading"
        v-model:search="componentStore.structureParams.search"
        @onSearch="componentStore._structures"
        @onSubmit="filterEvent"
      />
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{ $t('content.year') }}</label>
      <n-select
        class="w-full"
        v-model:value="store.params.year"
        :options="Utils.yearList"
        label-field="name"
        value-field="id"
        @update:value="filterEvent"
      />
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{ $t('content.month') }}</label>
      <n-select
        class="w-full"
        v-model:value="store.params.month"
        :options="Utils.monthList"
        label-field="name"
        value-field="id"
        @update:value="filterEvent"
      />
    </template>
  </UIPageFilter>
</template>
