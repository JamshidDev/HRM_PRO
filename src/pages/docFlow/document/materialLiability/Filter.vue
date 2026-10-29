<script setup>
  import { ArrowCounterclockwise20Regular } from '@vicons/fluent'
  import { UIPageFilter, UISelect } from '@/components/index.js'
  import {
    useAccountStore,
    useComponentStore,
    useMaterialLiabilityStore
  } from '@/store/modules/index.js'
  import { AppPaths } from '@/utils/index.js'

  const store = useMaterialLiabilityStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()
  const structureCheck = ref([])

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.hrContractsWrite)) return
    store.openCreate()
  }

  const filterCount = computed(
    () =>
      Number(Boolean(store.params.organizations.length)) +
      Number(Boolean(store.params.confirmation))
  )

  const filterEvent = () => {
    store.params.page = 1
    store._index()
  }

  const onSearchEv = () => {
    if (!accStore.checkAction(accStore.pn.hrContractsRead)) return
    filterEvent()
  }

  const resetFilter = () => {
    store.params.organizations = []
    store.params.confirmation = null
    filterEvent()
  }

  const onChangeStructure = (v) => {
    store.params.organizations = v
    filterEvent()
  }

  const beforeShow = (v) => {
    if (v && componentStore.confirmationStatusList.length === 0) componentStore._enumsAdmin()
    if (componentStore.structureList.length === 0) componentStore._structures()
  }

  const router = useRouter()
  const onHistory = () => {
    router.push({ path: AppPaths.Audit, query: { trigger_name: 'hr.material-liability' } })
  }
</script>

<template>
  <UIPageFilter
    :placeholder="$t('documentSettings.searchPlaceholder')"
    :add-permission="accStore.pn.hrContractsWrite"
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
            :checked-val="structureCheck"
            @updateCheck="(v) => (structureCheck = v)"
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
      </div>
    </template>
    <template #filterEnd>
      <n-button
        v-if="accStore.checkPermission(accStore.pn.hrContractsRead)"
        class="ui-page-action-button w-full! md:w-auto!"
        secondary
        icon-placement="right"
        @click="onHistory"
      >
        <template #icon>
          <n-icon><ArrowCounterclockwise20Regular /></n-icon>
        </template>
        {{ $t('audit.historyBtn') }}
      </n-button>
    </template>
  </UIPageFilter>
</template>
