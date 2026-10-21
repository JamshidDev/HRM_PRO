<script setup>
  // «Rollar kesimida» — top-6 rol amallari; eng ko'p amalli rol to'q rangda.
  import HeadBriefcase from '@/assets/icons/hrmDashboard/activity/head-briefcase.svg?url'
  import i18n from '@/i18n/index.js'
  import { formatCount } from './utils.js'

  const { t, te } = i18n.global

  const props = defineProps({
    roles: { type: Array, default: () => [] }
  })

  const rows = computed(() => {
    const total = props.roles.reduce((sum, r) => sum + (r.count || 0), 0)
    const max = Math.max(1, ...props.roles.map((r) => r.count || 0))
    return props.roles.map((r) => {
      const key = `dashboardPage.activity.roles.${r.name}`
      return {
        ...r,
        label: te(key) ? t(key) : r.name,
        top: r.count > 0 && r.count === max,
        percent: total ? Math.round((r.count / total) * 100) : 0,
        width: `${(r.count / max) * 100}%`
      }
    })
  })
</script>

<template>
  <div class="flex h-full flex-col gap-4 rounded-2xl bg-fig-block shadow-card p-4">
    <div class="flex w-full items-center gap-2.5">
      <span class="flex shrink-0 items-center rounded-full bg-fig-blue-100 p-1.5">
        <img :src="HeadBriefcase" alt="" width="20" height="20" class="block" />
      </span>
      <p
        class="min-w-0 flex-1 truncate text-[14px] leading-[18px] font-semibold text-fig-text-primary"
      >
        {{ $t('dashboardPage.activity.byRoles') }}
      </p>
    </div>

    <div class="flex w-full flex-col gap-4">
      <div v-for="row in rows" :key="row.name" class="flex w-full flex-col gap-1">
        <div class="flex w-full items-end justify-between gap-2 leading-4 whitespace-nowrap">
          <p class="min-w-0 truncate text-[12px] font-medium text-fig-text-secondary">
            {{ row.label }}
          </p>
          <div class="flex shrink-0 items-center gap-1.5">
            <p class="text-[12px] font-semibold text-fig-text-primary">
              {{ formatCount(row.count) }}
            </p>
            <p class="text-[11.5px] text-[#98a2b3]">{{ row.percent }}%</p>
          </div>
        </div>
        <div class="relative h-1.5 w-full overflow-hidden rounded-[3px] bg-fig-bg-disable">
          <div
            class="absolute top-0 left-0 h-1.5 rounded-[3px]"
            :class="row.top ? 'bg-fig-bg-brand' : 'bg-fig-bg-brand/70'"
            :style="{ width: row.width }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>
