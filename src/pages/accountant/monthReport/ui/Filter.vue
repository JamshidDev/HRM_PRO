<script setup>
import {useAccountStore, useComponentStore, useMonthReportStore} from '@/store/modules/index.js'
import {UIPageFilter, UISelect, UIYearMonth} from '@/components/index.js'
import UIHelper from '@/utils/UIHelper.js'
import {ArrowCircleDown32Regular, ArrowSync20Filled} from '@vicons/fluent'
import { useDebounce } from "@utils"

const store = useMonthReportStore()
const accStore = useAccountStore()


const filterEvent = () => {
  if (!accStore.checkAction(accStore.pn.economistStatementsRead)) return
  store.params.page = 1
  store._index()
}

const componentStore = useComponentStore()

const onChangeStructure = (v) => {
  store.params.organizations = v
  filterEvent()
}

const beforeShow = (v) => {
  if (componentStore.structureList.length === 0) {
    componentStore._structures()
  }

  if (store.codeList.length === 0) {
    store._enum()
  }
}

const resetFilter = () => {
  store.params.organizations = []
  store.params.code = null
  store.params.sex = null
  filterEvent()
}

const filterCount = computed(() => {
  return (
    Number(Boolean(store.params.organizations.length)) +
    Number(Boolean(store.params.code))
  )
})

const onRefreshEv = () => {
  store.loading = true
  const params = {
    type: 'statements',
    year: store.params.year,
    month: store.params.month
  }
  componentStore._refreshPin(params, store._index, () => (store.loading = false))
}
const onExportPanel = () => {
  store.activeTab = 1
  store.exportParams.positions = []
  store.exportParams.organizations = []
  store.exportParams.codes = []
  store.exportParams.byOrganization = true
  store.exportVisible = true
}

const onChangeInput = useDebounce(filterEvent, 600)


</script>

<template>
  <UIPageFilter
    v-model:search="store.params.search"
    :search-loading="store.loading"
    @onSearch="filterEvent"
    :show-add-button="false"
    @show="beforeShow"
    :filter-count="filterCount"
    @onClear="resetFilter"
  >
    <template #filterContent>
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{
        $t('actionLog.table.structure')
      }}</label>
      <UISelect
        :options="componentStore.structureList"
        :model-v="store.params.organizations"
        @defaultValue="(v) => (store.params.organizations = v)"
        @updateModel="onChangeStructure"
        :checked-val="store.structureCheck2"
        @updateCheck="(v) => (store.structureCheck2 = v)"
        :loading="componentStore.structureLoading"
        v-model:search="componentStore.structureParams.search"
        @onSearch="componentStore._structures"
        @onSubmit="filterEvent"
      />
      <label class="text-xs mt-3 text-gray-500 mb-1 font-medium">{{
        $t('monthReport.form.code')
      }}</label>
      <n-select
        class="w-full"
        clearable
        v-model:value="store.params.code"
        :options="store.codeList"
        label-field="name"
        value-field="id"
        :render-label="UIHelper.selectRender.label"
        :render-tag="UIHelper.selectRender.value"
        @update:value="filterEvent"
      />
      <label class="text-xs mt-3 text-gray-500 mb-1 font-medium">{{ $t('workerPage.filter.sex') }}</label>
      <n-select
        class="w-full"
        clearable
        v-model:value="store.params.sex"
        :options="componentStore.genderList"
        label-field="name"
        value-field="id"
        @update:value="filterEvent"
      />
      <label class="text-xs mt-3 text-gray-500 mb-1 font-medium">{{ $t('monthReport.form.start_hours') }}</label>
      <n-input-number
        @update:value="onChangeInput" :min="1" :nax="100" v-model:value="store.params.start_hours"
        clearable
      />
      <label class="text-xs mt-3 text-gray-500 mb-1 font-medium">{{ $t('monthReport.form.end_hours') }}</label>
      <n-input-number @update:value="onChangeInput" :min="1" :nax="100" v-model:value="store.params.end_hours" clearable />
    </template>
    <template #filterAction>
      <div class="max-w-[160px]">
        <UIYearMonth
          v-model:year="store.params.year"
          v-model:month="store.params.month"
          :clearable="false"
          @change="filterEvent"
        />
      </div>
      <n-button @click="onExportPanel" type="error">
        <template #icon>
          <ArrowSync20Filled />
        </template>
        {{ $t('content.export') }}
      </n-button>
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
  </UIPageFilter>
</template>

<style scoped></style>
