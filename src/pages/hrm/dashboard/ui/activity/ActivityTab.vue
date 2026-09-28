<script setup>
  /**
   * «Kadrlar harakati» bobi — Figma «Foydalanuvchilar faolligi» (node 3831:81221).
   *
   * Backend endpointi hali yo'q: barcha bloklar `mock.js` dan chiziladi. KPI
   * qiymatlari kunlik qatordan hisoblanadi, shuning uchun grafik, tooltip va
   * KPI hamisha bir-biriga mos. Endpoint paydo bo'lganda `daily`, `roles`,
   * `users` manbasini almashtirish kifoya.
   */
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
  import ActivityChart from './ActivityChart.vue'
  import ActivityRoles from './ActivityRoles.vue'
  import ActivityTopUsers from './ActivityTopUsers.vue'
  import ActivityUserModal from './ActivityUserModal.vue'
  import { buildDaily, rolesMock, totalUsersMock, usersMock } from './mock.js'
  import { dayMonth, daysInMonth, formatCount, monthName, totalOf } from './utils.js'

  const now = new Date()
  const period = ref(new Date(now.getFullYear(), now.getMonth(), 1).getTime())
  const pickerOpen = ref(false)

  const year = computed(() => new Date(period.value).getFullYear())
  const month = computed(() => new Date(period.value).getMonth())
  const periodLabel = computed(() => `${monthName(month.value)}, ${year.value}`)

  const onPeriod = (value) => {
    if (!value) return
    const d = new Date(value)
    period.value = new Date(d.getFullYear(), d.getMonth(), 1).getTime()
    pickerOpen.value = false
  }

  const daily = computed(() => buildDaily(daysInMonth(year.value, month.value)))
  const users = usersMock
  const roles = rolesMock

  const totalActions = computed(() => daily.value.reduce((sum, d) => sum + totalOf(d), 0))
  const average = computed(() =>
    daily.value.length ? Math.round(totalActions.value / daily.value.length) : 0
  )
  const peakDay = computed(() =>
    daily.value.reduce((best, d) => (!best || totalOf(d) > totalOf(best) ? d : best), null)
  )
  // Mock: 86 ta faol mas'ul (maketdagi qiymat)
  const activeUsers = 86

  // Jadvaldagi «ko'z» tugmasi — xodim faolligi modali
  const viewedUser = ref(null)
  const userModal = ref(false)
  const onViewUser = (row) => {
    viewedUser.value = row
    userModal.value = true
  }

  const kpis = computed(() => [
    {
      key: 'total',
      title: 'dashboardPage.activity.totalActions',
      value: formatCount(totalActions.value),
      tint: 'bg-fig-blue-100',
      icon: ChipChartColumn,
      mark: WmChartColumn
    },
    {
      key: 'users',
      title: 'dashboardPage.activity.activeUsers',
      value: `${activeUsers} / ${totalUsersMock}`,
      tint: 'bg-fig-indigo-100',
      icon: ChipUsers,
      mark: WmUsers
    },
    {
      key: 'avg',
      title: 'dashboardPage.activity.dailyAvg',
      value: formatCount(average.value),
      tint: 'bg-fig-green-100',
      icon: ChipChartSimple,
      mark: WmChartSimple
    },
    {
      key: 'peak',
      title: 'dashboardPage.activity.mostActiveDay',
      value: peakDay.value ? dayMonth(year.value, month.value, peakDay.value.day) : '—',
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
      <ActivityChart :daily="daily" :year="year" :month="month" :average="average" />
      <ActivityRoles :roles="roles" />
    </div>

    <ActivityTopUsers :users="users" :total="totalUsersMock" @view="onViewUser" />

    <ActivityUserModal v-model:visible="userModal" :user="viewedUser" />
  </div>
</template>

<style scoped>
  @media (min-width: 1024px) {
    .activity-charts {
      grid-template-columns: minmax(0, 728fr) minmax(0, 360fr);
    }
  }
</style>
