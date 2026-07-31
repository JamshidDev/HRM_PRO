<script setup>
  import { useAccountStore, useComponentStore, useHcServerStore } from '@/store/modules/index.js'
  import { UIPageFilter, UISelect } from '@/components/index.js'
  import { ArrowSync16Filled } from '@vicons/fluent'
  const store = useHcServerStore()
  const accStore = useAccountStore()

  const filterEvent = () => {
    if (!accStore.checkAction(accStore.pn.turnstileHikCentralJobRead)) return
    store.params.page = 1
    store._index()
  }

  const componentStore = useComponentStore()

  const onChangeStructure = (v) => {
    store.params.organizations = v
    filterEvent()
  }

  const beforeShow = () => {
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  }

  const resetFilter = () => {
    store.params.organizations = []
    filterEvent()
  }

  const filterCount = computed(() => Number(Boolean(store.params.organizations.length)))

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.turnstileHikCentralJobWrite)) return
    store.resetForm()
    store.visibleType = true
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
    @onAdd="onAdd"
  >
    <template #filterContent>
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
      </div>
    </template>
    <template #filterAction>
      <n-button type="error" :loading="store.loading" @click="store._index()">
        <template #icon>
          <ArrowSync16Filled />
        </template>
      </n-button>
    </template>
  </UIPageFilter>
</template>
