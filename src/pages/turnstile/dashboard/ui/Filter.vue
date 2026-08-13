<script setup>
  import {
    useAccountStore,
    useComponentStore,
    useTurnstileDashboardStore
  } from '@/store/modules/index.js'
  import { UINSelect, UISelect } from '@/components/index.js'
  import OrgIcon from '@/assets/icons/dashboard/filter-org.svg'
  import DepartmentIcon from '@/assets/icons/dashboard/filter-department.svg'
  import DateIcon from '@/assets/icons/dashboard/filter-date.svg'
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
    // page.vue bilan bir xil qoida (bare YOKI '-read').
    if (!accStore.canView(accStore.pn.turnstileDashboard)) return
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
  <div class="flex flex-col gap-3">
    <h3 class="text-[24px] leading-[30px] font-semibold text-fig-text-primary mb-0">
      {{ $t('turnStileDashboard.name') }}
    </h3>

    <div class="flex flex-wrap items-center justify-end gap-2.5">
      <div class="md:w-[220px] w-full filter-field">
        <span class="filter-field__icon"><OrgIcon /></span>
        <UISelect
          :placeholder="$t('turnStileDashboard.filter.organizationPlaceholder')"
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
      <div class="md:w-[220px] w-full filter-field">
        <span class="filter-field__icon"><DepartmentIcon /></span>
        <UINSelect
          multiple
          clearable
          :placeholder="$t('turnStileDashboard.filter.departmentPlaceholder')"
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
      <div class="md:w-[160px] w-full filter-field">
        <span class="filter-field__icon"><DateIcon /></span>
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
  </div>
</template>

<style scoped>
  /* Maketdagidek maydon ichida ikonka: input matnini o'ngga suramiz. */
  .filter-field {
    position: relative;
  }

  /* 18px ramka, ichida SVG o'z tabiiy o'lchamida (maketdagi glyph) */
  .filter-field__icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;
    pointer-events: none;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Matnni ikonkadan keyin boshlash uchun naive-ui'ning o'z padding
     o'zgaruvchilarini qayta yozamiz — shunda placeholder, tanlangan qiymat
     va teglar bir xil siljiydi. */
  /* `!important` shart: naive bu o'zgaruvchilarni element `style` atributiga
     inline yozadi. */
  .filter-field :deep(.n-input) {
    --n-padding-left: 36px !important;
  }

  .filter-field :deep(.n-base-selection) {
    --n-padding-single-left: 36px !important;
    --n-padding-multiple-left: 32px !important;
  }

  /* Maketdagi Button komponenti: h 36, radius 8, chegara #d0d5dd,
     matn 14/18 medium #344054. Naive'ning inline `--n-*` larini bosamiz. */
  .filter-field :deep(.n-input),
  .filter-field :deep(.n-base-selection) {
    --n-height: 36px !important;
    --n-border-radius: 8px !important;
    --n-font-size: 14px !important;
    --n-border: 1px solid var(--fig-br-secondary) !important;
    --n-border-hover: 1px solid var(--fig-br-secondary) !important;
    --n-border-focus: 1px solid var(--primary-color) !important;
    --n-color: transparent !important;
    --n-text-color: var(--fig-text-secondary) !important;
    --n-placeholder-color: var(--fig-text-secondary) !important;
    font-weight: 500;
  }
</style>
