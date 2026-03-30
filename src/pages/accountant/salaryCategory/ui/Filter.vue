<script setup>
  import { UIPageFilter, UISelect, UIYearMonth } from '@/components/index.js'
  import {
    useAccountStore,
    useComponentStore,
    useSalaryCategoryStore
  } from '@/store/modules/index.js'

  const accStore = useAccountStore()
  const store = useSalaryCategoryStore()
  const componentStore = useComponentStore()

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.economistWorkerCategoriesWrite)) return
    store.resetForm()
    store.visibleType = true
    store.visible = true
  }

  const filterEvent = () => {
    if (!accStore.checkAction(accStore.pn.economistWorkerCategoriesRead)) return
    store.params.page = 1
    if (store.activeTab === 1) {
      store._index()
    } else {
      store._byOrganization()
    }
  }

  const onChangeStructure = (v) => {
    store.params.organizations = v
    filterEvent()
  }

  const filterCount = computed(() => {
    return Number(Boolean(store.params.organizations.length))
  })

  const beforeShow = (v) => {
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  }

  const onClear = () => {
    store.params.organizations = []
    filterEvent()
  }
</script>

<template>
  <UIPageFilter
    @onClear="onClear"
    @show="beforeShow"
    :filterCount="filterCount"
    v-model:search="store.params.search"
    @onSearch="filterEvent"
    @onAdd="onAdd"
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
        @updateModel="onChangeStructure"
        @defaultValue="(v) => (store.params.organizations = v)"
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
