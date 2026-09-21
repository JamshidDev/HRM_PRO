<script setup>
  import { UIPageFilter, UISelect } from '@/components/index.js'
  import { useSickLeaveStore, useAccountStore, useComponentStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useSickLeaveStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()

  const canWrite = computed(() => accStore.checkPermission(accStore.pn.hrSickLeaveWrite))

  // Holatlar jadvaldagi chiplar bilan bir xil nomlanadi.
  const statusOptions = computed(() => [
    { id: 1, name: t('sickLeave.status.open') },
    { id: 2, name: t('sickLeave.status.closed') },
    { id: 3, name: t('sickLeave.status.unexcused') }
  ])

  const filterCount = computed(
    () =>
      Number(Boolean(store.params.status)) +
      Number(Boolean(store.params.organizations.length)) +
      Number(Boolean(store.params.from_date)) +
      Number(Boolean(store.params.to_date))
  )

  const beforeShow = () => {
    if (componentStore.structureList.length === 0) componentStore._structures()
  }

  const onSearch = () => {
    store.params.page = 1
    store._index()
  }

  const onAdd = () => {
    store._resetPayload()
    store.visible = true
  }

  const filterEvent = () => {
    store.params.page = 1
    store._index()
  }

  const onChangeStructure = (v) => {
    store.params.organizations = v
    filterEvent()
  }

  const resetFilter = () => {
    store.params.status = null
    store.params.organizations = []
    store.params.from_date = null
    store.params.to_date = null
    store.structureCheck = []
    filterEvent()
  }
</script>

<template>
  <UIPageFilter
    v-model:search="store.params.search"
    :search-loading="store.loading"
    :show-add-button="canWrite"
    :filter-count="filterCount"
    @show="beforeShow"
    @onSearch="onSearch"
    @onAdd="onAdd"
    @onClear="resetFilter"
  >
    <template #filterContent>
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">
        {{ $t('sickLeave.filter.organization') }}
      </label>
      <UISelect
        :options="componentStore.structureList"
        :model-v="store.params.organizations"
        :checked-val="store.structureCheck"
        :loading="componentStore.structureLoading"
        @defaultValue="(v) => (store.params.organizations = v)"
        @updateModel="onChangeStructure"
        @updateCheck="(v) => (store.structureCheck = v)"
        @onSubmit="filterEvent"
      />

      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">
        {{ $t('sickLeave.filter.status') }}
      </label>
      <n-select
        v-model:value="store.params.status"
        :options="statusOptions"
        :placeholder="$t('sickLeave.filter.statusPlaceholder')"
        label-field="name"
        value-field="id"
        clearable
        @update:value="filterEvent"
      />

      <!-- Sanalar yonma-yon: «dan» va «gacha» bitta qatorda. -->
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="mt-3 block text-xs text-gray-500 mb-1 font-medium">
            {{ $t('sickLeave.filter.fromDate') }}
          </label>
          <n-date-picker
            class="w-full"
            v-model:formatted-value="store.params.from_date"
            value-format="yyyy-MM-dd"
            format="dd.MM.yyyy"
            type="date"
            clearable
            @update:formatted-value="filterEvent"
          />
        </div>
        <div>
          <label class="mt-3 block text-xs text-gray-500 mb-1 font-medium">
            {{ $t('sickLeave.filter.toDate') }}
          </label>
          <n-date-picker
            class="w-full"
            v-model:formatted-value="store.params.to_date"
            value-format="yyyy-MM-dd"
            format="dd.MM.yyyy"
            type="date"
            clearable
            @update:formatted-value="filterEvent"
          />
        </div>
      </div>
    </template>
  </UIPageFilter>
</template>

<style scoped></style>
