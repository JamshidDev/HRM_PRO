<script setup>
  // Grafik ichi: tepada filtrlar (bo'lim daraxti), sahifalangan xodimlar; har qator o'zgarishi bilan saqlanadi.
  import { useVacationScheduleStore } from '@stores'
  import { useAppSetting, Utils } from '@utils'
  import { UIDepartmentSelect, UIPagination, UIUser } from '@components'
  import { ArrowSync20Regular, Dismiss20Regular, Search20Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'
  import DaysEditor from './DaysEditor.vue'

  const { t } = i18n.global
  const store = useVacationScheduleStore()
  const grid = computed(() => store.grid)

  const MONTH_KEYS = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december'
  ]
  const monthOptions = MONTH_KEYS.map((k, i) => ({ label: t(`month.${k}`), value: i + 1 }))
  const stateOptions = computed(() => [
    { label: t('vacationSchedule.grid.stateUnfilled'), value: 'unfilled' },
    { label: t('vacationSchedule.grid.stateFilled'), value: 'filled' },
    { label: t('vacationSchedule.grid.stateNoTableNumber'), value: 'no_table_number' }
  ])

  const locked = computed(() => Boolean(grid.value.summary?.locked))
  const year = computed(() => grid.value.summary?.year)
  const organizationId = computed(() => grid.value.summary?.organization_id ?? null)
  const isOutOfYear = (ts) => new Date(ts).getFullYear() !== Number(year.value)
  // Ta'til sanasi kalendari grafik yilidan ochiladi.
  const yearStart = computed(() =>
    year.value ? new Date(Number(year.value), 0, 1).getTime() : undefined
  )
  const isSaving = (id) => grid.value.savingIds.includes(id)
  const bulkDate = ref(null)
  const syncLoading = ref(false)

  const reload = () => {
    grid.value.params.page = 1
    store._gridRows()
  }
  let searchTimer = null
  const onSearch = () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(reload, 400)
  }
  const onChangePage = ({ page, per_page }) => {
    grid.value.params.page = page
    grid.value.params.per_page = per_page
    store._gridRows()
  }

  const onPlanDate = (row, ts) => {
    row.plan_date = ts
    store._saveRow(row, { plan_date: ts ? Utils.timeToZone(ts) : null })
  }
  // Davr boshi o'zgarsa, oxiri +1 yil bo'ladi (41-buyruq qoidasi); oxirini alohida tuzatish mumkin.
  const onPeriodFrom = (row, ts) => {
    row.period_from = ts
    const data = { period_from: ts ? Utils.timeToZone(ts) : null }
    if (ts) {
      const to = new Date(ts)
      to.setFullYear(to.getFullYear() + 1)
      row.period_to = to.getTime()
      data.period_to = Utils.timeToZone(row.period_to)
    }
    store._saveRow(row, data)
  }
  const onPeriodTo = (row, ts) => {
    row.period_to = ts
    store._saveRow(row, { period_to: ts ? Utils.timeToZone(ts) : null })
  }
  const onTableNumber = (row) => {
    const v = String(row.table_number ?? '').trim()
    if (v && !/^\d{1,20}$/.test(v)) {
      $Alert.validation(t('vacationSchedule.grid.tableNumberDigits'))
      return
    }
    store._saveRow(row, { table_number: v || null })
  }
  const onDays = (row, data) => store._saveRow(row, data)

  const allChecked = computed(
    () => grid.value.rows.length > 0 && grid.value.checked.length === grid.value.rows.length
  )
  const toggleAll = (v) => {
    grid.value.checked = v ? grid.value.rows.map((r) => r.id) : []
  }
  const toggleRow = (id, v) => {
    grid.value.checked = v
      ? [...grid.value.checked, id]
      : grid.value.checked.filter((x) => x !== id)
  }
  const onBulk = async () => {
    await store._bulkPlanDate(bulkDate.value)
    bulkDate.value = null
  }
  const onSync = async () => {
    syncLoading.value = true
    try {
      await store._sync()
    } finally {
      syncLoading.value = false
    }
  }

  const progress = computed(() => {
    const s = grid.value.summary
    return s?.total ? Math.round((s.filled / s.total) * 100) : 0
  })
  // Sahifa/filtr almashganda jadval boshiga qaytadi.
  const scrollRef = ref(null)
  watch(
    () => grid.value.rows,
    () => {
      if (scrollRef.value) scrollRef.value.scrollTop = 0
    }
  )
  const rowNumber = (idx) => (grid.value.params.page - 1) * grid.value.params.per_page + idx + 1
</script>

<template>
  <n-drawer
    :show="grid.visible"
    width="100%"
    :close-on-esc="true"
    @update:show="(v) => !v && store.closeGrid()"
  >
    <n-drawer-content body-content-class="!p-0" :native-scrollbar="false">
      <template #header>
        <div class="flex w-full flex-wrap items-center gap-x-6 gap-y-2">
          <div class="flex flex-col">
            <span class="text-base font-semibold">
              {{ $t('vacationSchedule.grid.title', { year: year ?? '' }) }}
            </span>
            <span v-if="locked" class="text-xs text-fig-text-red">
              {{ $t('vacationSchedule.grid.locked') }}
            </span>
          </div>
          <div v-if="grid.summary" class="flex min-w-[260px] flex-1 items-center gap-3">
            <n-progress
              type="line"
              :percentage="progress"
              :show-indicator="false"
              class="max-w-[220px]"
            />
            <span class="whitespace-nowrap text-sm">
              {{ $t('vacationSchedule.grid.filled') }}: <b>{{ grid.summary.filled }}</b> /
              {{ grid.summary.total }}
            </span>
            <span class="whitespace-nowrap text-xs text-textColor2">
              {{ $t('vacationSchedule.grid.stateNoTableNumber') }}:
              {{ grid.summary.no_table_number }}
            </span>
          </div>
          <div class="ml-auto flex items-center gap-2">
            <n-button v-if="!locked" size="small" :loading="syncLoading" @click="onSync">
              <template #icon>
                <n-icon><ArrowSync20Regular /></n-icon>
              </template>
              {{ $t('vacationSchedule.grid.sync') }}
            </n-button>
            <n-button quaternary circle @click="store.closeGrid()">
              <template #icon>
                <n-icon><Dismiss20Regular /></n-icon>
              </template>
            </n-button>
          </div>
        </div>
      </template>

      <section class="flex h-[calc(100vh-70px)] min-h-0 flex-col p-3">
        <div class="mb-2 flex flex-wrap items-center gap-2">
          <div class="w-[320px]">
            <UIDepartmentSelect
              v-model="grid.params.department_id"
              :organization="organizationId"
              own
              :placeholder="$t('vacationSchedule.grid.allDepartments')"
              @update:model-value="reload"
            />
          </div>
          <n-input
            v-model:value="grid.params.search"
            class="!w-[240px]"
            clearable
            :placeholder="$t('content.search')"
            @update:value="onSearch"
          >
            <template #prefix>
              <n-icon><Search20Regular /></n-icon>
            </template>
          </n-input>
          <n-select
            v-model:value="grid.params.state"
            class="!w-[200px]"
            clearable
            :options="stateOptions"
            :placeholder="$t('content.status')"
            @update:value="reload"
          />
          <n-select
            v-model:value="grid.params.month"
            class="!w-[150px]"
            clearable
            :options="monthOptions"
            :placeholder="$t('vacationSchedule.grid.month')"
            @update:value="reload"
          />
          <div
            v-if="grid.checked.length && !locked"
            class="ml-auto flex items-center gap-2 rounded-lg bg-surface-ground px-2 py-1"
          >
            <span class="text-xs">
              {{ $t('vacationSchedule.grid.selected', { n: grid.checked.length }) }}
            </span>
            <n-date-picker
              v-model:value="bulkDate"
              type="date"
              size="small"
              class="!w-[150px]"
              :format="useAppSetting.datePicketFormat"
              :is-date-disabled="isOutOfYear"
              :default-calendar-start-time="yearStart"
            />
            <n-button size="small" type="primary" :disabled="!bulkDate" @click="onBulk">
              {{ $t('vacationSchedule.grid.bulkApply') }}
            </n-button>
          </div>
        </div>

        <n-spin :show="grid.loading" class="vs-spin min-h-0 flex-1">
          <div ref="scrollRef" class="h-full overflow-auto rounded-lg border border-surface-line">
            <table class="vs-table">
              <thead>
                <tr>
                  <th class="w-9">
                    <n-checkbox
                      :checked="allChecked"
                      :disabled="locked"
                      @update:checked="toggleAll"
                    />
                  </th>
                  <th class="w-10">№</th>
                  <th class="w-[280px] text-left">{{ $t('content.worker') }}</th>
                  <th class="min-w-[180px] text-left">{{ $t('content.department') }}</th>
                  <th class="w-[120px]">{{ $t('vacationSchedule.form.table_number') }}</th>
                  <th class="w-[150px]">{{ $t('vacationSchedule.form.period_from') }}</th>
                  <th class="w-[150px]">{{ $t('vacationSchedule.form.period_to') }}</th>
                  <th class="w-[100px]">{{ $t('vacationSchedule.form.all_days') }}</th>
                  <th class="w-[150px]">{{ $t('vacationSchedule.form.plan_date') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!grid.loading && !grid.rows.length">
                  <td colspan="9" class="py-12 text-center text-sm text-textColor3">
                    {{ $t('content.no-data') }}
                  </td>
                </tr>
                <tr v-for="(row, idx) in grid.rows" :key="row.id">
                  <td class="text-center">
                    <n-checkbox
                      :checked="grid.checked.includes(row.id)"
                      :disabled="locked"
                      @update:checked="(v) => toggleRow(row.id, v)"
                    />
                  </td>
                  <td class="text-center text-xs text-textColor2">{{ rowNumber(idx) }}</td>
                  <td>
                    <UIUser
                      :data="{
                        photo: row.worker.photo,
                        firstName: row.worker.first_name,
                        middleName: row.worker.middle_name,
                        lastName: row.worker.last_name,
                        position: row.position
                      }"
                    />
                  </td>
                  <td>
                    <span class="line-clamp-2 text-xs" :title="row.department?.name">
                      {{ row.department?.name }}
                    </span>
                  </td>
                  <td>
                    <n-input
                      v-model:value="row.table_number"
                      size="small"
                      :disabled="locked"
                      :allow-input="Utils.onlyAllowNumber"
                      :placeholder="$t('vacationSchedule.grid.tableNumberPh')"
                      @change="onTableNumber(row)"
                    />
                  </td>
                  <td>
                    <n-date-picker
                      :value="row.period_from"
                      type="date"
                      size="small"
                      :disabled="locked"
                      :format="useAppSetting.datePicketFormat"
                      @update:value="(v) => onPeriodFrom(row, v)"
                    />
                  </td>
                  <td>
                    <n-date-picker
                      :value="row.period_to"
                      type="date"
                      size="small"
                      :disabled="locked"
                      :format="useAppSetting.datePicketFormat"
                      @update:value="(v) => onPeriodTo(row, v)"
                    />
                  </td>
                  <td class="text-center">
                    <DaysEditor
                      :row="row"
                      :disabled="locked"
                      :loading="isSaving(row.id)"
                      @save="(d) => onDays(row, d)"
                    />
                  </td>
                  <td>
                    <n-date-picker
                      :value="row.plan_date"
                      type="date"
                      size="small"
                      clearable
                      :disabled="locked"
                      :format="useAppSetting.datePicketFormat"
                      :is-date-disabled="isOutOfYear"
                      :default-calendar-start-time="yearStart"
                      @update:value="(v) => onPlanDate(row, v)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </n-spin>

        <div class="mt-2 flex justify-end">
          <UIPagination
            :short="false"
            :page="grid.params.page"
            :per_page="grid.params.per_page"
            :total="grid.total"
            @change-page="onChangePage"
          />
        </div>
      </section>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped>
  .vs-spin :deep(.n-spin-content) {
    height: 100%;
  }
  .vs-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 13px;
  }
  .vs-table thead th {
    position: sticky;
    top: 0;
    z-index: 1;
    padding: 8px 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--color-textColor2);
    background: var(--color-surface-section);
    border-bottom: 1px solid var(--color-surface-line);
  }
  .vs-table tbody td {
    padding: 6px;
    border-bottom: 1px solid var(--color-surface-line);
    vertical-align: middle;
  }
</style>
