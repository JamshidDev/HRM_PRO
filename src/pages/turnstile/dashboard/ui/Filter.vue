<script setup>
  import {
    useAccountStore,
    useComponentStore,
    useTurnstileDashboardStore
  } from '@/store/modules/index.js'
  import { UINSelect, UISelect } from '@/components/index.js'
  import { generateUUIDKey, useAppSetting, useDebounce } from '@/utils/index.js'

  const dashboardStore = useTurnstileDashboardStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()

  const depParams = computed(() => ({
    ...dashboardStore.filterDepParams,
    organizations: dashboardStore.dashboardParams.organizations.map((v) => v.id).toString(),
    key: undefined
  }))
  const detectKey = (dashboardStore.filterDepParams.key ||= generateUUIDKey())
  const departmentState = computed(() => componentStore.getDepartmentState(detectKey))
  const fetchDepartment = componentStore.createDepartmentFetcher(detectKey)
  const debounceFetchDepartment = useDebounce(fetchDepartment)
  const onScrollDepartment = () => {
    dashboardStore.filterDepParams.page++
    fetchDepartment(depParams.value, true)
  }

  const onSearchDepartment = (v) => {
    dashboardStore.filterDepParams.page = 1
    dashboardStore.filterDepParams.search = v
    fetchDepartment(depParams.value)
  }

  let timer = null
  const filterEvent = () => {
    if (!accStore.checkAction(accStore.pn.turnstileDashboardRead)) return
    clearTimeout(timer)
    timer = setTimeout(() => {
      dashboardStore._dashboard()
    }, 1000)
  }

  const onChangeStructure = (v) => {
    dashboardStore.dashboardParams.organizations = v
    dashboardStore.dashboardParams.departments = []
    departmentState.value.list = []
    filterEvent()
    dashboardStore.filterDepParams.page = 1
    debounceFetchDepartment(depParams.value)
  }

  const onChangeDepartment = () => {
    filterEvent()
  }

  const onChangeDate = () => {
    filterEvent()
  }

  const onDefault = (v) => {
    dashboardStore.dashboardParams.organizations = v
    dashboardStore.dashboardParams.departments = []
    departmentState.value.list = []
    dashboardStore.filterDepParams.page = 1
    debounceFetchDepartment(depParams.value)
  }

  onMounted(() => {
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  })

  onBeforeUnmount(() => {
    clearTimeout(timer)
  })
</script>

<template>
  <div class="flex flex-wrap items-end gap-3">
    <div class="mr-auto">
      <h3 class="text-2xl font-bold leading-[1.2] text-textColor0 mb-0">
        {{ $t('turnStileDashboard.name') }}
      </h3>
      <div class="text-xs leading-[1.2] text-secondary font-medium mt-1">
        {{ $t('turnStileDashboard.description') }}
      </div>
    </div>
    <div class="md:w-[200px] w-full">
      <label class="block text-[11px] text-textColor3 mb-1 font-semibold">{{
        $t('actionLog.table.structure')
      }}</label>
      <UISelect
        :options="componentStore.structureList"
        :model-v="dashboardStore.dashboardParams.organizations"
        :checked-val="dashboardStore.structureCheck2"
        :loading="componentStore.structureLoading"
        v-model:search="componentStore.structureParams.search"
        @defaultValue="onDefault"
        @updateModel="onChangeStructure"
        @updateCheck="(v) => (dashboardStore.structureCheck2 = v)"
        @onSearch="componentStore._structures"
        @onSubmit="filterEvent"
      />
    </div>
    <div class="md:w-[200px] w-full">
      <label class="block text-[11px] text-textColor3 mb-1 font-semibold">{{
        $t('content.department')
      }}</label>
      <UINSelect
        multiple
        clearable
        :loading="departmentState.loading"
        :options="departmentState.list"
        :query="dashboardStore.filterDepParams.search"
        :total-count="departmentState.total"
        v-model:value="dashboardStore.dashboardParams.departments"
        @update:value="onChangeDepartment"
        @onScrollEv="onScrollDepartment"
        @onSearch="onSearchDepartment"
      />
    </div>
    <div class="md:w-[160px] w-full">
      <label class="block text-[11px] text-textColor3 mb-1 font-semibold">{{
        $t('content.date')
      }}</label>
      <n-date-picker
        v-model:value="dashboardStore.dashboardParams.date"
        @update:value="onChangeDate"
        type="date"
        update-value-on-close
        :actions="null"
        :format="useAppSetting.datePicketFormat"
      />
    </div>
  </div>
</template>
