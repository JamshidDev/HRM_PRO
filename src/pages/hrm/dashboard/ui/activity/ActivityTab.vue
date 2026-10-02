<script setup>
  // «Kadrlar harakati» bobi — korxonalar faolligi (Figma «Foydalanuvchilar faolligi» maketi, korxona kesimida).
  import ChipChartColumn from '@/assets/icons/hrmDashboard/activity/chip-chart-column.svg?url'
  import ChipUsers from '@/assets/icons/hrmDashboard/activity/chip-users.svg?url'
  import ChipChartSimple from '@/assets/icons/hrmDashboard/activity/chip-chart-simple.svg?url'
  import ChipFireFlame from '@/assets/icons/hrmDashboard/activity/chip-fire-flame.svg?url'
  import WmChartColumn from '@/assets/icons/hrmDashboard/activity/wm-chart-column.svg?url'
  import WmUsers from '@/assets/icons/hrmDashboard/activity/wm-users.svg?url'
  import WmChartSimple from '@/assets/icons/hrmDashboard/activity/wm-chart-simple.svg?url'
  import WmFireFlame from '@/assets/icons/hrmDashboard/activity/wm-fire-flame.svg?url'
  import CalendarIcon from '@/assets/icons/hrmDashboard/activity/calendar.svg?url'
  import DownloadIcon from '@/assets/icons/hrmDashboard/activity/download.svg?url'
  import ApiService from '@/service/ApiService.js'
  import { useDashboardStore } from '@/store/modules/index.js'
  import ActivityChart from './ActivityChart.vue'
  import ActivityRoles from './ActivityRoles.vue'
  import ActivityTopOrganizations from './ActivityTopOrganizations.vue'
  import ActivityOrganizationModal from './ActivityOrganizationModal.vue'
  import { dayMonth, formatCount, monthName } from './utils.js'

  const store = useDashboardStore()

  const now = new Date()
  const period = ref(new Date(now.getFullYear(), now.getMonth(), 1).getTime())
  const pickerOpen = ref(false)

  const year = computed(() => new Date(period.value).getFullYear())
  const month = computed(() => new Date(period.value).getMonth())
  const periodLabel = computed(() => `${monthName(month.value)}, ${year.value}`)
  const monthParam = computed(() => `${year.value}-${String(month.value + 1).padStart(2, '0')}`)

  const onPeriod = (value) => {
    if (!value) return
    const d = new Date(value)
    period.value = new Date(d.getFullYear(), d.getMonth(), 1).getTime()
    pickerOpen.value = false
  }

  const loading = ref(false)
  const data = ref(null)
  // Oxirgi so'rov javobi eski javobni bosib ketmasin.
  let requestId = 0

  const load = () => {
    const id = ++requestId
    loading.value = true
    const params = store.appendParams({ month: monthParam.value })
    ApiService.dashboardService
      ._activity({ params })
      .then((res) => {
        if (id === requestId) data.value = res.data.data
      })
      .finally(() => {
        if (id === requestId) loading.value = false
      })
  }
  watch([monthParam, () => store.params.organizations], load, { immediate: true, deep: true })

  const daily = computed(() => data.value?.daily || [])
  const roles = computed(() => data.value?.roles || [])
  const summary = computed(() => data.value?.kpi || {})

  // Jadvaldagi «ko'z» tugmasi — korxona faolligi modali
  const viewedOrganization = ref(null)
  const orgModal = ref(false)
  const onViewOrganization = (row) => {
    viewedOrganization.value = row
    orgModal.value = true
  }

  const kpis = computed(() => [
    {
      key: 'total',
      title: 'dashboardPage.activity.totalActions',
      value: formatCount(summary.value.total_actions ?? 0),
      tint: 'bg-fig-blue-100',
      icon: ChipChartColumn,
      mark: WmChartColumn
    },
    {
      key: 'organizations',
      title: 'dashboardPage.activity.activeOrganizations',
      value: `${summary.value.active_organizations ?? 0} / ${summary.value.total_organizations ?? 0}`,
      tint: 'bg-fig-indigo-100',
      icon: ChipUsers,
      mark: WmUsers
    },
    {
      key: 'avg',
      title: 'dashboardPage.activity.dailyAvg',
      value: formatCount(summary.value.daily_avg ?? 0),
      tint: 'bg-fig-green-100',
      icon: ChipChartSimple,
      mark: WmChartSimple
    },
    {
      key: 'peak',
      title: 'dashboardPage.activity.mostActiveDay',
      value: summary.value.peak_day
        ? dayMonth(year.value, month.value, summary.value.peak_day.day)
        : '—',
      tint: 'bg-fig-amber-100',
      icon: ChipFireFlame,
      mark: WmFireFlame
    }
  ])
</script>

<template>
  <div class="flex flex-col gap-4 pb-4">
    <!-- Sarlavha -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex min-w-0 flex-col gap-0.5">
        <p class="text-[20px] leading-7 font-semibold text-fig-text-primary">
          {{ $t('dashboardPage.activity.title') }}
        </p>
        <p class="text-[12.5px] leading-[18px] text-fig-text-tertiary">
          {{ $t('dashboardPage.activity.subtitle') }}
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <n-popover
          v-model:show="pickerOpen"
          trigger="click"
          placement="bottom-end"
          :show-arrow="false"
          raw
        >
          <template #trigger>
            <button
              type="button"
              class="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg bg-fig-block px-4 transition-opacity hover:opacity-80"
            >
              <img :src="CalendarIcon" alt="" width="18" height="18" class="block shrink-0" />
              <span
                class="text-[14px] leading-[18px] font-medium whitespace-nowrap text-fig-text-secondary"
              >
                {{ periodLabel }}
              </span>
            </button>
          </template>
          <n-date-picker
            panel
            type="month"
            :value="period"
            :actions="null"
            @update:value="onPeriod"
          />
        </n-popover>

        <!-- Eksport endpointi hali yo'q -->
        <n-tooltip>
          <template #trigger>
            <button
              type="button"
              class="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#008838] px-4 transition-opacity hover:opacity-90"
            >
              <img :src="DownloadIcon" alt="" width="18" height="18" class="block shrink-0" />
              <span class="text-[14px] leading-[18px] font-medium whitespace-nowrap text-white">
                {{ $t('dashboardPage.activity.export') }}
              </span>
            </button>
          </template>
          {{ $t('dashboardPage.activity.soon') }}
        </n-tooltip>
      </div>
    </div>

    <n-spin :show="loading" class="activity-body">
      <!-- KPI -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="kpi in kpis"
          :key="kpi.key"
          class="relative flex flex-col gap-2 overflow-hidden rounded-2xl bg-fig-block px-2 py-3"
        >
          <div class="relative flex flex-col gap-2">
            <div class="flex items-center gap-2 px-2">
              <span class="flex shrink-0 items-center rounded-full p-1" :class="kpi.tint">
                <img :src="kpi.icon" alt="" width="16" height="16" class="block" />
              </span>
              <p class="truncate text-[14px] leading-[18px] font-medium text-fig-text-tertiary">
                {{ $t(kpi.title) }}
              </p>
            </div>
            <p
              class="px-2 text-[20px] leading-[26px] font-semibold whitespace-nowrap text-fig-text-primary"
            >
              {{ kpi.value }}
            </p>
          </div>
          <img
            :src="kpi.mark"
            alt=""
            width="64"
            height="64"
            aria-hidden="true"
            class="pointer-events-none absolute top-1/2 right-4 block -translate-y-1/2 select-none"
          />
        </div>
      </div>

      <!-- Grafik + rollar (maketda 728 : 360) -->
      <div class="activity-charts grid grid-cols-1 gap-4">
        <ActivityChart
          :daily="daily"
          :year="year"
          :month="month"
          :average="summary.daily_avg ?? 0"
        />
        <ActivityRoles :roles="roles" />
      </div>
    </n-spin>

    <ActivityTopOrganizations @view="onViewOrganization" />

    <ActivityOrganizationModal v-model:visible="orgModal" :organization="viewedOrganization" />
  </div>
</template>

<style scoped>
  .activity-body :deep(.n-spin-content) {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  @media (min-width: 1024px) {
    .activity-charts {
      grid-template-columns: minmax(0, 728fr) minmax(0, 360fr);
    }
  }
</style>
