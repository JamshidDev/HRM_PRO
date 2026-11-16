<script setup>
  // Grafik ichi: tepada filtrlar, sahifalangan xodimlar; har qator o'zining «Saqlash» tugmasi bilan saqlanadi.
  import { useComponentStore, useVacationScheduleStore } from '@stores'
  import { useAppSetting, Utils } from '@utils'
  import { UIDepartmentSelect, UIPagination, UIUser } from '@components'
  import {
    ArrowDownload20Regular,
    ArrowSync20Regular,
    Dismiss20Regular,
    Save20Regular,
    Search20Regular
  } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'
  import DaysEditor from './DaysEditor.vue'
  import { confirmDialog } from '@/components/notify/alertDialog.js'

  const { t } = i18n.global
  const store = useVacationScheduleStore()
  const grid = computed(() => store.grid)
  const componentStore = useComponentStore()
  // Kunlar ustunida qo'shimcha ta'til nomlari ko'rinishi uchun ro'yxat bir marta yuklanadi.
  watch(
    () => grid.value.visible,
    (v) => {
      if (v && !componentStore.vacationAdditional?.length && !componentStore.enumLoading) {
        componentStore._enums()
      }
    }
  )

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
    { label: t('vacationSchedule.grid.stateAll'), value: 'all' },
    { label: t('vacationSchedule.grid.stateFilled'), value: 'filled' },
    { label: t('vacationSchedule.grid.stateUnfilled'), value: 'unfilled' }
  ])

  const locked = computed(() => Boolean(grid.value.summary?.locked))
  const organizationId = computed(() => grid.value.summary?.organization_id ?? null)
  const dirtyCount = computed(() => Object.keys(grid.value.dirty).length)
  const isInvalid = (row) => grid.value.invalidIds.includes(row.id)
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

  const onMonth = (row, m) => store.setField(row, { month: m ?? null })
  // Davr boshi o'zgarsa, oxiri +1 yil bo'ladi (41-buyruq qoidasi); oxirini alohida tuzatish mumkin.
  const onPeriodFrom = (row, ts) => {
    const data = { period_from: ts ? Utils.timeToZone(ts) : null }
    if (ts) {
      const to = new Date(ts)
      to.setFullYear(to.getFullYear() + 1)
      data.period_to = Utils.timeToZone(to.getTime())
    }
    store.setField(row, data)
  }
  const onPeriodTo = (row, ts) =>
    store.setField(row, { period_to: ts ? Utils.timeToZone(ts) : null })
  const onTableNumber = (row) => {
    const v = String(row.table_number ?? '').trim()
    if (v && !/^\d{1,20}$/.test(v)) {
      $Alert.validation(t('vacationSchedule.grid.tableNumberDigits'))
      return
    }
    store.setField(row, { table_number: v || null })
  }
  const onDays = (row, data) => store.setField(row, data)

  const isDirty = (row) => Boolean(grid.value.dirty[row.id])
  const isSaving = (row) => grid.value.savingIds.includes(row.id)
  // Saqlanmagan o'zgarish bo'lsa — yopish yoki bekor qilishdan oldin so'raladi.
  const askDiscard = async () =>
    !dirtyCount.value ||
    (await confirmDialog({
      type: 'warning',
      message: t('vacationSchedule.grid.unsavedConfirm', { n: dirtyCount.value })
    }))
  const onClose = async () => {
    if (await askDiscard()) {
      store.discardChanges()
      store.closeGrid()
    }
  }

  const onSync = async () => {
    syncLoading.value = true
    try {
      await store._sync()
    } finally {
      syncLoading.value = false
    }
  }

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
    placement="bottom"
    height="100vh"
    :close-on-esc="true"
    @update:show="(v) => !v && onClose()"
  >
    <n-drawer-content body-content-class="!p-0" :native-scrollbar="false">
      <template #header>
        <div class="flex w-full flex-wrap items-center gap-2">
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
          <span v-if="locked" class="text-xs text-fig-text-red">
            {{ $t('vacationSchedule.grid.locked') }}
          </span>
          <div class="ml-auto flex items-center gap-2">
            <n-button type="success" :loading="grid.exporting" @click="store._export()">
              <template #icon>
                <n-icon><ArrowDownload20Regular /></n-icon>
              </template>
              Excel
            </n-button>
            <n-button v-if="!locked" type="primary" :loading="syncLoading" @click="onSync">
              <template #icon>
                <n-icon><ArrowSync20Regular /></n-icon>
              </template>
              {{ $t('vacationSchedule.grid.sync') }}
            </n-button>
            <n-button quaternary circle @click="onClose">
              <template #icon>
                <n-icon><Dismiss20Regular /></n-icon>
              </template>
            </n-button>
          </div>
        </div>
      </template>

      <section class="flex h-[calc(100vh-70px)] min-h-0 flex-col p-3 pt-2">
        <n-spin :show="grid.loading" class="vs-spin min-h-0 flex-1">
          <div ref="scrollRef" class="h-full overflow-auto rounded-lg border border-surface-line">
            <table class="vs-table">
              <thead>
                <tr>
                  <th class="w-10">№</th>
                  <th class="w-[220px] text-left">{{ $t('content.worker') }}</th>
                  <th class="w-[180px] text-left">{{ $t('content.department') }}</th>
                  <th class="w-[100px]">{{ $t('vacationSchedule.form.table_number') }}</th>
                  <th class="w-[130px]">{{ $t('vacationSchedule.form.period_from') }}</th>
                  <th class="w-[130px]">{{ $t('vacationSchedule.form.period_to') }}</th>
                  <th class="text-left">{{ $t('vacationSchedule.form.all_days') }}</th>
                  <th class="w-[130px]">{{ $t('vacationSchedule.grid.vacationMonth') }}</th>
                  <th class="w-[56px]"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!grid.loading && !grid.rows.length">
                  <td colspan="9" class="py-12 text-center text-sm text-textColor3">
                    {{ $t('content.no-data') }}
                  </td>
                </tr>
                <tr
                  v-for="(row, idx) in grid.rows"
                  :key="row.id"
                  :class="{
                    'vs-row--dirty': grid.dirty[row.id],
                    'vs-row--invalid': isInvalid(row)
                  }"
                >
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
                      :disabled="locked"
                      :allow-input="Utils.onlyAllowNumber"
                      :placeholder="$t('vacationSchedule.grid.tableNumberPh')"
                      @change="onTableNumber(row)"
                    />
                  </td>
                  <td>
                    <n-date-picker
                      :value="row.period_from"
                      :status="isInvalid(row) && !row.period_from ? 'error' : undefined"
                      type="date"
                      :disabled="locked"
                      :format="useAppSetting.datePicketFormat"
                      @update:value="(v) => onPeriodFrom(row, v)"
                    />
                  </td>
                  <td>
                    <n-date-picker
                      :value="row.period_to"
                      :status="isInvalid(row) && !row.period_to ? 'error' : undefined"
                      type="date"
                      :disabled="locked"
                      :format="useAppSetting.datePicketFormat"
                      @update:value="(v) => onPeriodTo(row, v)"
                    />
                  </td>
                  <td>
                    <DaysEditor :row="row" :disabled="locked" @save="(d) => onDays(row, d)" />
                  </td>
                  <td>
                    <n-select
                      :value="row.month"
                      :status="isInvalid(row) && !row.month ? 'error' : undefined"
                      clearable
                      :disabled="locked"
                      :options="monthOptions"
                      :placeholder="$t('vacationSchedule.grid.month')"
                      @update:value="(v) => onMonth(row, v)"
                    />
                  </td>
                  <td class="text-center">
                    <n-button
                      v-if="!locked"
                      circle
                      :type="isDirty(row) ? 'primary' : 'default'"
                      :secondary="!isDirty(row)"
                      :disabled="!isDirty(row)"
                      :loading="isSaving(row)"
                      :title="$t('content.save')"
                      @click="store._saveRow(row)"
                    >
                      <template #icon>
                        <n-icon><Save20Regular /></n-icon>
                      </template>
                    </n-button>
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
    table-layout: fixed;
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
  .vs-table tbody tr.vs-row--dirty td:first-child {
    box-shadow: inset 3px 0 0 var(--color-primary);
  }
  .vs-table tbody tr.vs-row--invalid td {
    background: color-mix(in srgb, var(--color-fig-text-red) 6%, transparent);
  }
  .vs-table tbody td {
    padding: 6px;
    border-bottom: 1px solid var(--color-surface-line);
    vertical-align: middle;
  }
</style>
