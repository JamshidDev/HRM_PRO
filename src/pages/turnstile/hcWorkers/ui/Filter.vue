<script setup>
  import { UIPageFilter, UISelect, UIDepartmentSelect } from '@/components/index.js'
  import {
    useAccountStore,
    useComponentStore,
    useTurnstileHikCentralWorkerStore
  } from '@/store/modules/index.js'

  import i18n from '@/i18n/index.js'
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

  // Sukut korxona — bo'limlar select ko'rsatadigan store.department ga yuklanadi.
  const onDefaultEv = (v) => {
    store.params.organizations = v
    store.department.params.organizations = v.map((x) => x.id)
    store.department.list = []
    if (v.length === 0) return
    store.department.params.page = 1
    store.department.params.search = null
    departmentAction.fetch()
  }

  const onChangeDepartment = () => {
    filterEvent()
  }

  const beforeShow = (v) => {
    if (!v) return
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
    store._levels()
  }

  const resetFilter = () => {
    store.params.organizations = []
    store.params.access_level_id = null
    store.params.departments = []
    store.params.status = null
    store.params.workerType = 'own'
    filterEvent()
  }

  // Mehmonlar filtri faqat alohida ruxsat bilan (turnstile-hik-central-workers-guests).
  const canSeeGuests = computed(() =>
    accStore.checkPermission(accStore.pn.turnstileHikCentralWorkersGuests)
  )
  const workerTypeOption = computed(() => [
    { name: t('turnstile.hcWorkersPage.membershipOwn'), id: 'own' },
    { name: t('turnstile.hcWorkersPage.no-added'), id: 'not_added' },
    ...(canSeeGuests.value
      ? [{ name: t('turnstile.hcWorkersPage.membershipGuest'), id: 'guest' }]
      : [])
  ])

  // Mehmonlarning bizda bo'linmasi yo'q — bo'linma filtri qo'llanmaydi.
  const onChangeWorkerType = (v) => {
    if (v === 'guest') store.params.departments = []
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

  const filterCount = computed(
    () =>
      Number(Boolean(store.params.organizations.length)) +
      Boolean(store.params.access_level_id) +
      Boolean(store.params.departments.length) +
      Boolean(store.params.status) +
      Number(store.params.workerType !== 'own')
  )

  const departmentAction = {
    fetch: () => store._department(),
    onSearch: () => {
      store.department.params.page = 1
      store._department()
    },
    onScroll: () => {
      store.department.params.page++
      store._department(true)
    }
  }
</script>

<template>
  <UIPageFilter
    :add-permission="accStore.pn.turnstileHikCentralWorkersWrite"
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
      <div class="ui-filter-grid grid grid-cols-12 gap-x-5 gap-y-4">
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('actionLog.table.structure') }}</label>
          <UISelect
            :options="componentStore.structureList"
            :model-v="store.params.organizations"
            @updateModel="onChangeStructure"
            @defaultValue="onDefaultEv"
            @onSearch="componentStore._structures"
            @onSubmit="filterEvent"
            @updateCheck="(v) => (store.structureCheck2 = v)"
            :checked-val="store.structureCheck2"
            :loading="componentStore.structureLoading"
            v-model:search="componentStore.structureParams.search"
          />
        </div>
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('workerPage.filter.department') }}</label>
          <UIDepartmentSelect
            v-model="store.params.departments"
            :organization="store.params.organizations"
            :disabled="store.params.workerType === 'guest'"
            multiple
            @update:model-value="onChangeDepartment"
          />
        </div>
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('turnstile.hcWorkersPage.access_levels') }}</label>
          <n-select
            filterable
            v-model:value="store.params.access_level_id"
            :options="store.levelList"
            :loading="store.levelLoading"
            label-field="name"
            value-field="id"
            @update:value="filterEvent"
          />
        </div>
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('content.status') }}</label>
          <n-select
            filterable
            v-model:value="store.params.status"
            :options="statusOption"
            label-field="name"
            value-field="id"
            @update:value="filterEvent"
          />
        </div>
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('turnstile.hcWorkersPage.membership') }}</label>
          <n-select
            v-model:value="store.params.workerType"
            :options="workerTypeOption"
            :consistent-menu-width="false"
            label-field="name"
            value-field="id"
            @update:value="onChangeWorkerType"
          />
        </div>
      </div>
    </template>
  </UIPageFilter>
</template>
