<script setup>
  import { useAccountStore, useDeviceEventStore, useEventStore } from '@/store/modules/index.js'
  import { UIPageFilter } from '@/components/index.js'
  import { useAppSetting } from '@utils'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useDeviceEventStore()
  // Access level ro'yxati eventStore'da (ikkala tab bir xil manbadan oladi).
  const eventStore = useEventStore()
  const accStore = useAccountStore()

  const filterEvent = () => {
    if (!accStore.checkPermission(accStore.pn.turnstileHikCentralEventsRead)) return
    store._filterEvent()
  }

  const beforeShow = () => {
    if (eventStore.levelList.length === 0) {
      eventStore._levels()
    }
  }

  const reasonList = computed(() => [
    { id: 1, name: t('deviceEvent.reason.noCode') },
    { id: 2, name: t('deviceEvent.reason.foreignCode') }
  ])

  const resolvedList = computed(() => [
    { id: 'no', name: t('deviceEvent.resolved.no') },
    { id: 'yes', name: t('deviceEvent.resolved.yes') }
  ])

  const filterCount = computed(
    () =>
      Number(Boolean(store.params.access_levels.length)) +
      Number(Boolean(store.params.from)) +
      Number(Boolean(store.params.to)) +
      Number(Boolean(store.params.reason)) +
      // `no` — sukutdagi qiymat, filtr deb sanalmaydi.
      Number(store.params.resolved !== 'no')
  )
</script>

<template>
  <UIPageFilter
    v-model:search="store.params.search"
    :search-loading="store.loading"
    @onSearch="filterEvent"
    @show="beforeShow"
    :filter-count="filterCount"
    @onClear="store.resetFilter"
    :show-add-button="false"
  >
    <template #filterContent>
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{
        $t('turnstile.hcWorkersPage.access_levels')
      }}</label>
      <n-select
        multiple
        clearable
        filterable
        v-model:value="store.params.access_levels"
        :options="eventStore.levelList"
        :loading="eventStore.levelLoading"
        label-field="name"
        value-field="id"
        @update:value="filterEvent"
        :max-tag-count="2"
      />
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{
        $t('deviceEvent.reasonLabel')
      }}</label>
      <n-select
        clearable
        v-model:value="store.params.reason"
        :options="reasonList"
        label-field="name"
        value-field="id"
        @update:value="filterEvent"
      />
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{
        $t('deviceEvent.statusLabel')
      }}</label>
      <n-select
        clearable
        v-model:value="store.params.resolved"
        :options="resolvedList"
        label-field="name"
        value-field="id"
        @update:value="filterEvent"
      />
      <label class="mt-3 text-xs text-gray-500">{{ $t('content.from') }}</label>
      <n-date-picker
        class="mt-1"
        v-model:formatted-value="store.params.from"
        value-format="yyyy-MM-dd"
        @update:formatted-value="filterEvent"
        type="date"
        :actions="null"
        :format="useAppSetting.datePicketFormat"
        clearable
      />
      <label class="mt-3 text-xs text-gray-500">{{ $t('content.to') }}</label>
      <n-date-picker
        class="mt-1"
        v-model:formatted-value="store.params.to"
        value-format="yyyy-MM-dd"
        @update:formatted-value="filterEvent"
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
          :value="eventStore.activeTab"
          @update:value="eventStore._changeView"
          type="segment"
          size="small"
        >
          <n-tab-pane :name="eventStore.tabs[0]" :tab="$t('hcEvent.oldView')" />
          <n-tab-pane :name="eventStore.tabs[1]" :tab="$t('deviceEvent.tab')" />
        </n-tabs>
      </div>
    </template>
  </UIPageFilter>
</template>

<style scoped>
  .tab-wrapper {
    border: 1px solid var(--surface-line);
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
    padding: 0 10px;
    line-height: 28px;
  }
</style>
