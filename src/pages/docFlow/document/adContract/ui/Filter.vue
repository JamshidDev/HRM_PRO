<script setup>
  import { UIPageFilter, UISelect } from '@/components/index.js'
  import { useComponentStore, useAdContractStore, useAccountStore } from '@/store/modules/index.js'
  import { useAppSetting } from '@/utils/index.js'

  const store = useAdContractStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.hrContractAdditionalWrite)) return
    store.visibleType = true
    store.resetForm()
    store.visible = true
  }

  const filterCount = computed(
    () =>
      Number(Boolean(store.params.organizations.length)) +
      Number(Boolean(store.params.confirmation)) +
      Number(Boolean(store.params.created))
  )

  const onSearchEv = () => {
    if (!accStore.checkAction(accStore.pn.hrContractAdditionalRead)) return
    store.params.page = 1
    store._index()
  }

  const filterEvent = () => {
    store.params.page = 1
    store._index()
  }

  const resetFilter = () => {
    store.params.organizations = []
    store.params.confirmation = null
    store.params.created = null
    filterEvent()
  }

  const onChangeStructure = (v) => {
    store.params.organizations = v
    filterEvent()
  }

  const beforeShow = (v) => {
    if (v && componentStore.confirmationStatusList.length === 0) {
      componentStore._enumsAdmin()
    }
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  }
</script>

<template>
  <UIPageFilter
    @onAdd="onAdd"
    @onSearch="onSearchEv"
    v-model:search="store.params.search"
    :search-loading="store.loading"
    :filter-count="filterCount"
    @show="beforeShow"
    @onClear="resetFilter"
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
          <label>{{ $t('content.status') }}</label>
          <n-select
            v-model:value="store.params.confirmation"
            :options="componentStore.confirmationStatusList"
            label-field="name"
            value-field="id"
            clearable
            @update:value="filterEvent"
            :loading="componentStore.enumAdminLoading"
          />
        </div>
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('content.created') }}</label>
          <n-date-picker
            v-model:value="store.params.created"
            type="date"
            :format="useAppSetting.datePicketFormat"
            @update:value="filterEvent"
          />
        </div>
      </div>
    </template>
  </UIPageFilter>
</template>
