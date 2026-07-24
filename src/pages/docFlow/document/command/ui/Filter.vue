<script setup>
  import { UIPageFilter, UISelect } from '@/components/index.js'
  import { useAccountStore, useCommandStore, useComponentStore } from '@/store/modules/index.js'
  import { useAppSetting } from '@/utils/index.js'

  const store = useCommandStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.hrCommandsWrite)) return
    store.visibleType = true
    store.resetForm()
    store.visible = true
  }

  const filterCount = computed(
    () =>
      Number(Boolean(store.params.confirmation)) +
      Number(Boolean(store.params.created)) +
      Number(Boolean(store.params.organizations.length))
  )

  const onSearchEv = () => {
    if (!accStore.checkAction(accStore.pn.hrCommandsRead)) return
    store.params.page = 1
    store._index()
  }

  const filterEvent = () => {
    store.params.page = 1
    store._index()
  }

  const resetFilter = () => {
    store.params.organizations = []
    store.params.status = null
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
    :popover-style="{
      width: '560px',
      maxWidth: 'calc(100vw - 32px)',
      minHeight: 'auto',
      padding: '0',
      borderRadius: '20px'
    }"
  >
    <template #filterContent>
      <div class="command-filter-panel grid grid-cols-12 gap-x-5 gap-y-4">
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

<style scoped>
  .command-filter-panel label {
    display: block;
    margin-bottom: 6px;
    color: var(--textColor1);
    font-size: 13px;
    font-weight: 500;
  }

  .command-filter-panel :deep(:where(.n-select, .n-date-picker)) {
    width: 100%;
    --n-height: 40px !important;
    --n-border-radius: 16px !important;
  }

  .command-filter-panel :deep(.n-select) {
    --n-padding-single: 0 12px !important;
    --n-padding-multiple: 0 12px !important;
  }
</style>
