<script setup>
  import { h } from 'vue'
  import { Checkmark12Filled, Dismiss12Filled } from '@vicons/fluent'
  import { NIcon } from 'naive-ui'
  import { UIPagination, UIUser } from '@/components/index.js'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useTurnstileDashboardStore()

  // Joriy oy (YYYY-MM) — kelajakdagi kunlar bo'sh qoladi.
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const isFutureDay = (day) => {
    const key = store.month.monthKey
    if (!key) return false
    if (key > currentMonth) return true
    if (key < currentMonth) return false
    return store.month.today != null && day > store.month.today
  }

  const dayCell = (row, day) => {
    if (isFutureDay(day)) return null
    const came = row.cameSet.has(day)
    return h(
      'span',
      {
        class: [
          'inline-flex w-5 h-5 items-center justify-center rounded-full',
          came ? 'bg-fig-chip-green text-fig-chip-green-text' : 'bg-fig-red-100 text-fig-text-red'
        ],
        title: came ? t('turnStileDashboard.month.came') : t('turnStileDashboard.month.absent')
      },
      [h(NIcon, { size: 12 }, { default: () => h(came ? Checkmark12Filled : Dismiss12Filled) })]
    )
  }

  const columns = computed(() => {
    const days = Array.from({ length: store.month.daysInMonth }, (_, i) => i + 1)
    return [
      {
        title: t('content.worker'),
        key: 'user',
        fixed: 'left',
        width: 260,
        render: (row) => h(UIUser, { data: row.user, short: false })
      },
      ...days.map((day) => ({
        title: String(day).padStart(2, '0'),
        key: `d${day}`,
        width: 38,
        align: 'center',
        className: day === store.month.today ? 'bg-fig-chip-brand' : '',
        render: (row) => dayCell(row, day)
      })),
      {
        title: t('turnStileDashboard.month.total'),
        key: 'came_total',
        fixed: 'right',
        width: 80,
        align: 'center',
        render: (row) =>
          h('span', { class: 'font-grotesk font-semibold' }, String(row.came_days.length))
      }
    ]
  })

  let timer = null
  const onSearch = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      store.monthParams.page = 1
      store._attendanceMonth()
    }, 500)
  }

  const onChangeMonth = () => {
    store.monthParams.page = 1
    store._attendanceMonth()
  }

  // Dastlab oy tanlagichi dashboard sanasining oyida.
  if (!store.monthParams.month) {
    store.monthParams.month = store.dashboardParams.date || Date.now()
  }

  const onChangePage = (v) => {
    store.monthParams.page = v.page
    store.monthParams.per_page = v.per_page
    store._attendanceMonth()
  }
</script>

<template>
  <div class="bg-surface-section shadow-card rounded-2xl p-3 flex flex-col gap-3">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-3">
        <n-date-picker
          v-model:value="store.monthParams.month"
          type="month"
          format="MM.yyyy"
          class="!w-[150px]"
          :clearable="false"
          :placeholder="$t('turnStileDashboard.month.pick')"
          @update:value="onChangeMonth"
        />
        <p class="text-[14px] leading-[20px] font-medium text-fig-text-primary">
          {{ $t('turnStileDashboard.month.title', { month: store.month.monthKey || '' }) }}
        </p>
      </div>
      <div class="flex items-center gap-3">
        <span class="flex items-center gap-1.5 text-[12px] text-fig-text-secondary">
          <span class="w-3 h-3 rounded-full bg-fig-chip-green"></span>
          {{ $t('turnStileDashboard.month.came') }}
        </span>
        <span class="flex items-center gap-1.5 text-[12px] text-fig-text-secondary">
          <span class="w-3 h-3 rounded-full bg-fig-red-100"></span>
          {{ $t('turnStileDashboard.month.absent') }}
        </span>
        <n-input
          v-model:value="store.monthParams.search"
          clearable
          class="!w-[260px]"
          :placeholder="$t('content.search')"
          @update:value="onSearch"
        />
      </div>
    </div>

    <n-data-table
      :columns="columns"
      :data="store.month.list"
      :loading="store.month.loading"
      :row-key="(row) => row.id"
      :scroll-x="260 + 38 * store.month.daysInMonth + 80"
      size="small"
      :bordered="true"
      :single-line="false"
    />

    <UIPagination
      :page="store.monthParams.page"
      :per_page="store.monthParams.per_page"
      :total="store.month.total"
      @change-page="onChangePage"
    />
  </div>
</template>
