<script setup>
  import { BuildingMultiple24Filled } from '@vicons/fluent'
  import { UIPageFilter, UISelect } from '@/components/index.js'
  import {
    useAccountStore,
    useMedInspectionStore,
    useComponentStore,
    useMedStore
  } from '@/store/modules/index.js'

  const store = useMedStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()
  const inspectionStore = useMedInspectionStore()

  const onSearch = () => {
    if (!accStore.checkAction(accStore.pn.hrTableRead)) return
    store.params.page = 1
    store._index()
  }

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.hrMedWrite)) return
    store.resetForm()
    componentStore.selectedWorker = null
    store.elementId = null
    store.visibleType = true
    store.visible = true
  }

  const filterEvent = () => {
    store._index()
  }

  const filterCount = computed(() =>
    Number(Boolean(store.params.organizations.length) + Number(Boolean(store.params.status)))
  )

  const beforeShow = () => {
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }

    if (componentStore.medStatus.length === 0) {
      componentStore._enums()
    }
  }

  const onChangeStructure = (v) => {
    store.params.organizations = v
    filterEvent()
  }

  const resetFilter = () => {
    store.params.organizations = []
    store.params.status = null
    filterEvent()
  }

  const openInspectionEv = () => {
    inspectionStore.resetForm()
    componentStore._structures()
    inspectionStore.visible = true
  }
</script>

<template>
  <UIPageFilter
    v-model:search="store.params.search"
    @onSearch="onSearch"
    @show="beforeShow"
    @onClear="resetFilter"
    :filter-count="filterCount"
    :search-loading="store.loading"
    @onAdd="onAdd"
    filter-placement="bottom-end"
    :popover-style="{ width: '560px', maxWidth: 'calc(100vw - 32px)', padding: '0', borderRadius: '20px' }"
  >
    <template #filterAction>
      <n-button @click="openInspectionEv" secondary type="error">
        {{ $t('medInspection.name') }}
        <template #icon>
          <BuildingMultiple24Filled />
        </template>
      </n-button>
    </template>
    <template #filterContent>
      <div class="ui-filter-grid grid grid-cols-12 gap-x-5 gap-y-4">
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('actionLog.table.structure') }}</label>
          <UISelect
            :options="componentStore.structureList"
            :model-v="store.params.organizations"
            @defaultValue="(v) => (store.params.organizations = v)"
            @updateModel="onChangeStructure"
            :checked-val="store.structureCheck2"
            @updateCheck="(v) => (store.structureCheck2 = v)"
            :loading="componentStore.structureLoading"
            @onSubmit="filterEvent"
            v-model:search="componentStore.structureParams.search"
            @onSearch="componentStore._structures"
          />
        </div>
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('medPage.form.status') }}</label>
          <n-select
            v-model:value="store.params.status"
            :options="componentStore.medStatus"
            :loading="componentStore.enumExamLoading"
            @update:value="filterEvent"
            label-field="name"
            value-field="id"
            clearable
          />
        </div>
      </div>
    </template>
  </UIPageFilter>
</template>
