<script setup>
  import { UIPageFilter, UISelect } from '@/components/index.js'
  import { useAccountStore, useComponentStore, useTimesheetStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'

  const store = useTimesheetStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.hrTableWrite)) return
    store.visibleType = true
    store.resetForm()
    store.visible = true
  }

  // Har filter o'zgarishi natijani 1-sahifadan ko'rsatadi (ilgari korxona tanlansa sahifa joyida qolardi).
  const filterEvent = () => {
    if (!accStore.checkAction(accStore.pn.hrTableRead)) return
    store.params.page = 1
    store._index()
  }

  const filterCount = computed(
    () =>
      Number(Boolean(store.params.organizations.length)) +
      Number(Boolean(store.params.year)) +
      Number(Boolean(store.params.month))
  )

  const beforeShow = () => {
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
    store.structureCheck2 = []
    store.params.year = null
    store.params.month = null
    filterEvent()
  }
</script>

<template>
  <UIPageFilter
    :add-permission="accStore.pn.hrTableWrite"
    v-model:search="store.params.search"
    @onSearch="filterEvent"
    @onAdd="onAdd"
    @show="beforeShow"
    @onClear="resetFilter"
    :filter-count="filterCount"
    :search-loading="store.loading"
  >
    <template #filterContent>
      <!-- Tashkilot + davr (yil / oy alohida — faqat yil tanlab ham qidirsa bo'ladi). -->
      <div class="ui-filter-grid grid grid-cols-12 gap-x-5 gap-y-4">
        <div class="col-span-12">
          <label>{{ $t('actionLog.table.structure') }}</label>
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
        </div>
        <div class="col-span-6">
          <label>{{ $t('content.year') }}</label>
          <n-select
            v-model:value="store.params.year"
            :options="Utils.yearList"
            :placeholder="$t('content.all')"
            label-field="name"
            value-field="id"
            clearable
            @update:value="filterEvent"
          />
        </div>
        <div class="col-span-6">
          <label>{{ $t('content.month') }}</label>
          <n-select
            v-model:value="store.params.month"
            :options="Utils.monthList"
            :placeholder="$t('content.all')"
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
