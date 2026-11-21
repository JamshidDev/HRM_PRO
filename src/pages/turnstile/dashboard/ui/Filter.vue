<script setup>
  import {
    useAccountStore,
    useComponentStore,
    useTurnstileDashboardStore
  } from '@/store/modules/index.js'
  import { ArrowSync20Regular } from '@vicons/fluent'
  import { UISelect, UIDepartmentSelect } from '@/components/index.js'
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

  const onChangeDate = (v) => {
    // Bugun tanlansa — dashboard «bugunni kuzatadi» (yarim tundan keyin / qaytib kelganda o'zi yangi kunga o'tadi).
    dashboardStore.followToday = !v || new Date(v).toDateString() === new Date().toDateString()
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

  // Yangilash tugmasi: «Hisobot» — butun dashboard; «Davomat» — shu oy, shu sahifa (1-sahifaga qaytmaydi).
  const refreshing = computed(() =>
    dashboardStore.activeTab === 'attendance' ? dashboardStore.month.loading : dashboardStore.dashboardLoading
  )
  const onRefresh = () => {
    if (!accStore.canView(accStore.pn.turnstileDashboard)) return
    clearTimeout(timer)
    if (dashboardStore.activeTab === 'attendance') dashboardStore._attendanceMonth()
    else dashboardStore._dashboard()
  }

  onBeforeUnmount(() => {
    clearTimeout(timer)
  })
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap items-center justify-end gap-2.5">
      <!-- Yangilash: joriy tabni qayta yuklaydi (Davomatda — shu sahifani). Yuklanayotganda aylanadi. -->
      <n-tooltip>
        <template #trigger>
          <n-button
            secondary
            class="!h-[34px] !w-[34px] !rounded-xl !p-0"
            :disabled="refreshing"
            @click="onRefresh"
          >
            <n-icon size="18" :class="refreshing && 'refresh-spin'">
              <ArrowSync20Regular />
            </n-icon>
          </n-button>
        </template>
        {{ $t('content.refresh') }}
      </n-tooltip>
      <div class="md:w-[220px] w-full">
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
      <div class="md:w-[220px] w-full">
        <UIDepartmentSelect
          v-model="dashboardStore.dashboardParams.departments"
          :organization="dashboardStore.dashboardParams.organizations"
          multiple
          :placeholder="$t('turnStileDashboard.filter.departmentPlaceholder')"
          @update:model-value="onChangeDepartment"
        />
      </div>
      <div class="md:w-[160px] w-full">
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
  .refresh-spin {
    animation: refresh-spin 0.8s linear infinite;
  }

  @keyframes refresh-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .refresh-spin {
      animation: none;
    }
  }
</style>
