<script setup>
  import { UINSelect, UIPageFilter, UISelect } from '@/components/index.js'
  import {
    useAccountStore,
    useComponentStore,
    useTurnstileHikCentralWorkerStore
  } from '@/store/modules/index.js'

  import i18n from '@/i18n/index.js'
  import {SuperSelect} from "@components"
  const t = i18n.global.t

  const store = useTurnstileHikCentralWorkerStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()

  const filterEvent = () => {
    if (!accStore.checkAction(accStore.pn.turnstileHikCentralWorkersRead)) return
    store.params.page = 1
    store._index()
  }

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.turnstileHikCentralWorkersWrite)) return
    store.resetForm()
    store.visibleType = true
    store.visible = true
    store.payload.isWorker = 0
  }

  const onSearch = () => {
    store.params.page = 1
    filterEvent()
  }

  const onChangeStructure = (v) => {
    store.params.organizations = v
    store.department.params.organizations = v.map((x) => x.id)
    store.params.departments = []
    store.department.list = []
    filterEvent()
    if (v.length === 0) return
    store.department.params.page = 1
    store.department.params.search = null
    departmentAction.fetch()
  }

  const onDefaultEv = (v) => {
    store.params.organizations = v
    componentStore.depParams.organizations = v.map((x) => x.id)
    componentStore.departmentList = []
    if (v.length === 0) return
    componentStore._departments()
  }

  const onChangeDepartment = (v) => {
    filterEvent()
  }

  const beforeShow = (v) => {
    if(!v) return
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
    store._levels()
  }

  const resetFilter = () => {
    store.params.organizations = []
    store.params.access_level_id = null
    store.params.added = 'all'
    store.params.departments = []
    store.params.status = null
    filterEvent()
  }

  const statusOption = [
    {
      name: t('content.process'),
      id: 1
    },
    {
      name: t('content.success'),
      id: 2
    },
    {
      name: t('content.error'),
      id: 3
    }
  ]

  const workerOption = [
    {
      name: t('content.all'),
      id: 'all'
    },
    {
      name: t('turnstile.hcWorkersPage.added'),
      id: 'yes'
    },
    {
      name: t('turnstile.hcWorkersPage.no-added'),
      id: 'no'
    }
  ]

  const filterCount = computed(
    () =>
      Number(Boolean(store.params.organizations.length)) +
      Boolean(store.params.access_level_id) +
      Boolean(store.params.departments.length) +
      Boolean(store.params.status) +
      Boolean(store.params.added)
  )

  const departmentAction = {
    fetch:()=>store._department(),
    onSearch:()=>{store.department.params.page = 1; store._department()},
    onScroll:()=>{store.department.params.page++; store._department(true)}
  }
</script>

<template>
  <UIPageFilter
    v-model:search="store.params.search"
    @onSearch="onSearch"
    @show="beforeShow"
    @onClear="resetFilter"
    @onAdd="onAdd"
    :search-loading="store.loading"
    :filter-count="filterCount"
    :add-button-title="$t('turnstile.terminalUser.notCompanyWorker')"
  >
    <template #filterContent>
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{
        $t('actionLog.table.structure')
      }}</label>
      <UISelect
        :options="componentStore.structureList"
        :modelV="store.params.organizations"
        @updateModel="onChangeStructure"
        @defaultValue="onDefaultEv"
        @onSearch="componentStore._structures"
        @onSubmit="filterEvent"
        @updateCheck="(v) => (store.structureCheck2 = v)"
        :checkedVal="store.structureCheck2"
        :loading="componentStore.structureLoading"
        v-model:search="componentStore.structureParams.search"
      />
      <label class="mt-3 text-xs text-gray-500 mb-1">{{
        $t('workerPage.filter.department')
      }}</label>
      <SuperSelect
        :disabled="store.params.organizations.length === 0"
        v-model:value="store.params.departments"
        v-model:search="store.department.params.search"
        :options="store.department.list"
        :per-page="store.department.params.per_page"
        :total-count="store.department.totalItems"
        @update:value="onChangeDepartment"
        @onScrollEv="departmentAction.onScroll"
        @onSearch="departmentAction.onSearch"
        :loading="store.department.loading"
        multiple
        clearable
      />
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{
        $t('turnstile.hcWorkersPage.access_levels')
      }}</label>
      <n-select
        filterable
        v-model:value="store.params.access_level_id"
        :options="store.levelList"
        :loading="store.levelLoading"
        label-field="name"
        value-field="id"
        @update:value="filterEvent"
      />
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{ $t('content.status') }}</label>
      <n-select
        filterable
        v-model:value="store.params.status"
        :options="statusOption"
        label-field="name"
        value-field="id"
        @update:value="filterEvent"
      />
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{ $t('content.status') }}</label>
      <n-select
        filterable
        v-model:value="store.params.added"
        :options="workerOption"
        label-field="name"
        value-field="id"
        @update:value="filterEvent"
      />
    </template>
  </UIPageFilter>
</template>
