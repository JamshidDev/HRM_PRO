<script setup>
  import { UIPageFilter, UISelect } from '@/components/index.js'
  import {
    useAccountStore,
    useComponentStore,
    useConfirmationStore
  } from '@/store/modules/index.js'
  import { useAppSetting } from '@/utils/index.js'

  const store = useConfirmationStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.hrConfirmationsWrite)) return
    componentStore.selectedWorker = null
    store.resetForm()
    store.elementId = null
    store.visibleType = true
    store.visible = true
  }

  const onSearch = () => {
    if (!accStore.checkAction(accStore.pn.hrConfirmationsRead)) return
    store.params.page = 1
    store._index()
  }

  const filterEvent = () => {
    store._index()
  }

  const filterCount = computed(
    () =>
      Number(Boolean(store.params.organizations.length)) +
      Number(Boolean(store.params.confirmation)) +
      Number(Boolean(store.params.created))
  )

  const beforeShow = (v) => {
    if (v && componentStore.confirmationStatusList.length === 0) {
      componentStore._enumsAdmin()
    }
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
    store.params.confirmation = null
    store.params.created = null
    filterEvent()
  }
</script>

<template>
  <UIPageFilter
    v-model:search="store.params.search"
    @onSearch="onSearch"
    @onAdd="onAdd"
    @show="beforeShow"
    @onClear="resetFilter"
    :filter-count="filterCount"
    :search-loading="store.loading"
    filter-placement="bottom-end"
    :popover-style="{ width: '560px', maxWidth: 'calc(100vw - 32px)', padding: '0', borderRadius: '20px' }"
  >
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
            v-model:search="componentStore.structureParams.search"
            @onSearch="componentStore._structures"
            :loading="componentStore.structureLoading"
            @onSubmit="filterEvent"
          />
        </div>
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('content.created') }}</label>
          <n-date-picker
            v-model:value="store.params.created"
            type="date"
            :format="useAppSetting.datePicketFormat"
            @update:value="filterEvent"
            clearable
          />
        </div>
      </div>
    </template>
  </UIPageFilter>
</template>
