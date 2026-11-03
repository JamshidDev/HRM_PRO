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
  import ApiService from '@/service/ApiService.js'
  import { useDashboardStore } from '@/store/modules/index.js'
  import ActivityDocuments from './ActivityDocuments.vue'
  import ActivityTopOrganizations from './ActivityTopOrganizations.vue'
  import ActivityOrganizationModal from './ActivityOrganizationModal.vue'
  import { dayMonth, formatCount } from './utils.js'

  const store = useDashboardStore()

  // KPI doim joriy oy bo'yicha (oy tanlovi olib tashlandi).
  const now = new Date()
  const year = computed(() => now.getFullYear())
  const month = computed(() => now.getMonth())
  const monthParam = computed(() => `${year.value}-${String(month.value + 1).padStart(2, '0')}`)

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
    <!-- Hujjatlar holati -->
    <ActivityDocuments />

    <n-spin :show="loading" class="activity-body">
      <!-- KPI -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="kpi in kpis"
          :key="kpi.key"
          class="relative flex flex-col gap-2 overflow-hidden rounded-2xl bg-fig-block shadow-card px-2 py-3"
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
</style>
