<script setup>
  import { ArrowCircleDown32Regular, ArrowSync20Filled } from '@vicons/fluent'
  import { UIPageFilter, UISelect, UIYearMonth } from '@/components/index.js'
  import { useAccountStore, useComponentStore, useTaxFiveStore } from '@/store/modules/index.js'

  const store = useTaxFiveStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()

  const filterEvent = () => {
    if (!accStore.checkAction(accStore.pn.economistTaxFiveRead)) return
    store.params.page = 1
    store._index()
  }

  const onChangeStructure = (v) => {
    store.params.organizations = v
    filterEvent()
  }

  const beforeShow = (v) => {
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  }

  const resetFilter = () => {
    store.params.organizations = []
    filterEvent()
  }

  const filterCount = computed(() => {
    return Number(Boolean(store.params.organizations.length))
  })
  const onRefreshEv = () => {
    store.loading = true
    const params = {
      type: 'tax-five-applications',
      year: store.params.year,
      month: store.params.month
    }
    componentStore._refreshPin(params, store._index, () => {
      store.loading = true
    })
  }
</script>

<template>
  <UIPageFilter
    v-model:search="store.params.search"
    :search-loading="store.loading"
    :show-add-button="false"
    @onSearch="filterEvent"
    @show="beforeShow"
    @onClear="resetFilter"
    :filter-count="filterCount"
  >
    <template #filterAction>
      <div class="max-w-[160px]">
        <UIYearMonth
          v-model:year="store.params.year"
          v-model:month="store.params.month"
          :clearable="false"
          @change="filterEvent"
        />
      </div>
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
        @defaultValue="(v) => (store.params.organizations = v)"
        @updateModel="onChangeStructure"
        :checkedVal="store.structureCheck2"
        @updateCheck="(v) => (store.structureCheck2 = v)"
        :loading="componentStore.structureLoading"
        v-model:search="componentStore.structureParams.search"
        @onSearch="componentStore._structures"
        @onSubmit="filterEvent"
      />
    </template>
  </UIPageFilter>
</template>

<style scoped></style>
