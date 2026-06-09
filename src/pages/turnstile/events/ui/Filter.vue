<script setup>
  import { useAccountStore, useComponentStore, useEventStore, useEventV2Store } from '@/store/modules/index.js'
  import { ArrowSync24Filled, ArrowCircleDown32Regular } from '@vicons/fluent'
  import { UIPageFilter, UISelect, SuperSelect } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAppSetting } from '@utils'

  const { t } = i18n.global
  const store = useEventStore()
  const storeV2 = useEventV2Store()
  const accStore = useAccountStore()

  const onOpenDownloadModal = () => {
    if (!storeV2.download.payload.from) {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)
      storeV2.download.payload.from = today.getTime()
      storeV2.download.payload.to = tomorrow.getTime()
    }
    storeV2.download.visible = true
  }

  const filterEvent = () => {
    if (!accStore.checkAction(accStore.pn.turnstileHikCentralEventsRead)) return
    store.params.page = 1
    store._index()
  }

  const componentStore = useComponentStore()

  const onChangeStructure = (v) => {
    store.params.organizations = v
    store.department.params.organizations = v.map((x) => x.id)
    store.params.departments = []
    store.department.list = []
    filterEvent()
    if (v.length === 0) return
    store.department.params.page = 1
    store.department.params.search = null
    departmentAction.fetch()
  }

  const departmentAction = {
    fetch: () => store._department(),
    onSearch: () => {
      store.department.params.page = 1
      store._department()
    },
    onScroll: () => {
      store.department.params.page++
      store._department(true)
    }
  }

  const onChangeDate = () => {
    console.log('eve')
    filterEvent()
  }

  const beforeShow = (v) => {
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
    if (store.levelList.length === 0) {
      store._levels()
    }
  }

  const resetFilter = () => {
    store.params.organizations = []
    store.params.departments = []
    store.department.list = []
    store.params.access_levels = []
    store.params.direction = null
    store.params.date = null
    filterEvent()
  }

  const filterCount = computed(
    () =>
      Number(Boolean(store.params.organizations.length)) +
      Number(Boolean(store.params.departments.length)) +
      Number(Boolean(store.params.access_levels.length)) +
      Number(Boolean(store.params.date)) +
      Number(Boolean(store.params.direction))
  )

  const directionList = [
    {
      name: t('turnstile.workDurationPage.enter'),
      id: 1
    },
    {
      name: t('turnstile.workDurationPage.exit'),
      id: 0
    }
  ]

  const checkLastClick = () => {
    const TIMEOUT = 60 // minute
    const now = Date.now()
    const lastClickTime = localStorage.getItem('lastClickTime')

    if (lastClickTime) {
      const diffMs = now - parseInt(lastClickTime, 10)
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      if (diffMs < TIMEOUT * 60 * 1000) {
        $Toast.warning(t('content.lastClickTime', { n: TIMEOUT - diffMinutes }))
        return false
      }
    }
    return true
  }

  const onSync = () => {
    if (!checkLastClick()) return
    store.syncPayload.from_date = null
    store.syncPayload.to_date = null
    store.syncPayload.access_level_ids = []
    store.visible = true
  }
</script>

<template>
  <UIPageFilter
    v-model:search="store.params.search"
    :search-loading="store.loading"
    @onSearch="filterEvent"
    @show="beforeShow"
    :filter-count="filterCount"
    @onClear="resetFilter"
    :show-add-button="false"
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
      <label class="mt-3 text-xs text-gray-500 mb-1">{{
        $t('workerPage.filter.department')
      }}</label>
      <div class="w-full max-w-[400px] overflow-hidden">
        <SuperSelect
          :disabled="store.params.organizations.length === 0"
          v-model:value="store.params.departments"
          v-model:search="store.department.params.search"
          :options="store.department.list"
          :per-page="store.department.params.per_page"
          :total-count="store.department.totalItems"
          @update:value="filterEvent"
          @onScrollEv="departmentAction.onScroll"
          @onSearch="departmentAction.onSearch"
          :loading="store.department.loading"
          multiple
          clearable
        />
      </div>
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{
        $t('turnstile.hcWorkersPage.access_levels')
      }}</label>
      <n-select
        multiple
        clearable
        filterable
        v-model:value="store.params.access_levels"
        :options="store.levelList"
        :loading="store.levelLoading"
        label-field="name"
        value-field="id"
        @update:value="filterEvent"
        :max-tag-count="2"
      />
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{
        $t('hcEvent.form.direction')
      }}</label>
      <n-select
        clearable
        v-model:value="store.params.direction"
        :options="directionList"
        label-field="name"
        value-field="id"
        @update:value="filterEvent"
      />
      <label class="mt-3 text-xs text-gray-500">{{ $t('content.date') }}</label>
      <n-date-picker
        class="mt-1"
        v-model:value="store.params.date"
        @update:value="onChangeDate"
        type="date"
        :actions="null"
        :format="useAppSetting.datePicketFormat"
        clearable
      />
    </template>
    <template #filterSearch>
      <div class="tab-wrapper ml-2">
        <n-tabs
          class="tab-switcher"
          :value="store.activeTab"
          @update:value="store._changeView"
          type="segment"
          size="small"
        >
          <n-tab-pane :name="store.tabs[0]" :tab="$t('hcEvent.oldView')" />
          <n-tab-pane :name="store.tabs[1]" :tab="$t('hcEvent.newView')" />
        </n-tabs>
      </div>
    </template>
    <template #filterAction>
      <n-button :loading="store.jobLoading" @click="onSync" type="primary">
        {{ $t('turnstile.accessLevelPage.sync') }}
        <template #icon>
          <ArrowSync24Filled />
        </template>
      </n-button>
      <n-button @click="onOpenDownloadModal" :loading="storeV2.download.loading" type="success">
        <template #icon>
          <ArrowCircleDown32Regular />
        </template>
        {{ $t('content.download') }}
      </n-button>
    </template>
  </UIPageFilter>
</template>

<style scoped>
.tab-wrapper {
  border: 1px solid var(--border-color, #e0e0e6);
  border-radius: 6px;
  padding: 1px;
  height: 34px;
  display: flex;
  align-items: center;
}

.tab-switcher {
  width: 200px;
  height: 100%;
}

.tab-switcher :deep(.n-tabs-pane-wrapper) {
  display: none;
}

.tab-switcher :deep(.n-tabs-nav) {
  height: 100%;
}

.tab-switcher :deep(.n-tabs-rail) {
  height: 100%;
}

.tab-switcher :deep(.n-tabs-tab) {
  height: 28px;
  padding: 0 12px;
  line-height: 28px;
}
</style>
