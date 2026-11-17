<script setup>
  // Grafik ichi: tepada filtrlar, sahifalangan xodimlar; o'zgarishlar to'planadi va tepadagi bitta «Saqlash» bilan saqlanadi.
  import { useComponentStore, useVacationScheduleStore } from '@stores'
  import { useAppSetting, Utils } from '@utils'
  import { UIDepartmentSelect, UIPageFilter, UITable, UIUser } from '@components'
  import {
    ArrowDownload20Regular,
    ArrowSync20Regular,
    Dismiss20Regular,
    Save20Regular
  } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'
  import DaysEditor from './DaysEditor.vue'
  import { confirmUnsaved } from '@/components/notify/alertDialog.js'

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

  // Sahifada `scrollbar-gutter: stable` (style.css) — oyna ochiqligida o'ngda ~15px skrollbar joyi qolib,
  // u yerda qorong'i chiziq ko'rinardi va oyna kesilgandek bo'lardi. Oyna ochiq paytda orqadagi sahifa
  // baribir aylantirilmaydi, shuning uchun joy vaqtincha o'chiriladi va yopilganda qaytariladi.
  const setGutter = (open) => {
    document.documentElement.style.scrollbarGutter = open ? 'auto' : ''
  }
  watch(() => grid.value.visible, setGutter, { immediate: true })
  onBeforeUnmount(() => setGutter(false))

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
    { label: t('vacationSchedule.grid.stateUnfilled'), value: 'unfilled' },
    { label: t('vacationSchedule.grid.stateNoTableNumber'), value: 'no_table_number' }
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

  // Holat va oy — «Filterlar» tugmasi ichida.
  // Bo'lim tashqarida (qidiruvdan oldin) — sanoq va tozalash faqat panel ichidagilar uchun.
  const filterCount = computed(
    () =>
      Number(grid.value.params.state && grid.value.params.state !== 'all') +
      Number(Boolean(grid.value.params.month))
  )
  const resetFilters = () => {
    grid.value.params.state = 'all'
    grid.value.params.month = null
    reload()
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
  // Saqlanmagan o'zgarish bo'lsa — umumiy oyna: «Saqlamasdan chiqish» | «Saqlash va chiqish»; Esc — oynada qolish.
  // Saqlashda to'ldirilmagan qator chiqsa (qizaradi) — grafik ochiq qoladi.
  const onClose = () => {
    if (!dirtyCount.value) {
      store.closeGrid()
      return
    }
    confirmUnsaved({
      message: t('vacationSchedule.grid.unsavedConfirm', { n: dirtyCount.value }),
      onSave: async () => {
        await store._saveAll()
        if (!Object.keys(grid.value.dirty).length) store.closeGrid()
      },
      onDiscard: () => {
        store.discardChanges()
        store.closeGrid()
      }
    })
  }

  const onSync = async () => {
    syncLoading.value = true
    try {
      await store._sync()
    } finally {
      syncLoading.value = false
    }
  }

  // Boshqa sahifalardagi oddiy jadval (UITable): ism va bo'lim moslashuvchan, qolganlari o'z kengligida.
  const columns = computed(() => [
    { key: 'worker', title: t('content.worker'), minWidth: 220 },
    { key: 'department', title: t('content.department'), minWidth: 200 },
    { key: 'table_number', title: t('vacationSchedule.form.table_number'), width: 120 },
    { key: 'period_from', title: t('vacationSchedule.form.period_from'), width: 150 },
    { key: 'period_to', title: t('vacationSchedule.form.period_to'), width: 150 },
    { key: 'all_days', title: t('vacationSchedule.form.all_days'), width: 120 },
    { key: 'month', title: t('vacationSchedule.grid.vacationMonth'), width: 150 }
  ])
  // To'ldirilmagan majburiy maydoni bor qator — qizg'ish fon; saqlanmagan o'zgarishi bor qator — chapda ko'k chiziq.
  const rowClass = (row) =>
    [isInvalid(row) && 'vs-row--invalid', isDirty(row) && 'vs-row--dirty'].filter(Boolean).join(' ')
</script>

<template>
  <n-drawer
    class="vs-drawer"
    :show="grid.visible"
    placement="bottom"
    height="100vh"
    :close-on-esc="true"
    @update:show="(v) => !v && onClose()"
  >
    <n-drawer-content body-content-class="!p-0" :native-scrollbar="false">
      <template #header>
        <div class="vs-header flex w-full flex-wrap items-center gap-x-4 gap-y-2">
          <UIPageFilter
            class="w-full"
            v-model:search="grid.params.search"
            :show-add-button="false"
            :auto-focus-input="false"
            :filter-count="filterCount"
            :search-loading="grid.loading"
            @onSearch="reload"
            @onClear="resetFilters"
          >
            <!-- Bo'lim — tez-tez ishlatiladi, shuning uchun «Filterlar» ichida emas, qidiruvdan oldin -->
            <template #filterBefore>
              <div class="w-[260px] shrink-0">
                <UIDepartmentSelect
                  v-model="grid.params.department_id"
                  :organization="organizationId"
                  own
                  :placeholder="$t('vacationSchedule.grid.allDepartments')"
                  @update:model-value="reload"
                />
              </div>
            </template>

            <template #filterContent>
              <div class="ui-filter-grid grid grid-cols-12 gap-x-5 gap-y-4">
                <div class="col-span-12">
                  <label>{{ $t('content.status') }}</label>
                  <n-select
                    v-model:value="grid.params.state"
                    :options="stateOptions"
                    @update:value="reload"
                  />
                </div>
                <div class="col-span-12">
                  <label>{{ $t('vacationSchedule.grid.vacationMonth') }}</label>
                  <n-select
                    v-model:value="grid.params.month"
                    clearable
                    :options="monthOptions"
                    :placeholder="$t('vacationSchedule.grid.month')"
                    @update:value="reload"
                  />
                </div>
              </div>
            </template>

            <template #filterEnd>
              <div class="flex items-center gap-2">
                <span v-if="locked" class="text-xs text-fig-text-red">
                  {{ $t('vacationSchedule.grid.locked') }}
                </span>
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
                <!-- Bitta «Saqlash»: barcha o'zgargan qatorlar (boshqa sahifadagilar ham) bitta so'rovda -->
                <n-button
                  v-if="!locked"
                  type="primary"
                  :disabled="!dirtyCount"
                  :loading="grid.saving"
                  @click="store._saveAll()"
                >
                  <template #icon>
                    <n-icon><Save20Regular /></n-icon>
                  </template>
                  {{ $t('content.save') }}<template v-if="dirtyCount"> ({{ dirtyCount }})</template>
                </n-button>
                <n-button quaternary circle @click="onClose">
                  <template #icon>
                    <n-icon><Dismiss20Regular /></n-icon>
                  </template>
                </n-button>
              </div>
            </template>
          </UIPageFilter>
        </div>
      </template>

      <section class="h-[calc(100vh-70px)] p-3 pt-2">
        <UITable
          :columns="columns"
          :data="grid.rows"
          :loading="grid.loading"
          :page="grid.params.page"
          :per-page="grid.params.per_page"
          :total="grid.total"
          :row-class-name="rowClass"
          :bottom-gap="0"
          storage-key="hrm-vacation-schedule-grid"
          @change-page="onChangePage"
        >
          <template #cell-worker="{ row }">
            <UIUser
              :data="{
                photo: row.worker?.photo,
                firstName: row.worker?.first_name ?? '',
                middleName: row.worker?.middle_name ?? '',
                lastName: row.worker?.last_name ?? '',
                position: row.position
              }"
            />
          </template>

          <template #cell-department="{ row }">
            <span class="line-clamp-2 text-xs">{{ row.department?.name }}</span>
          </template>

          <template #cell-table_number="{ row }">
            <n-input
              v-model:value="row.table_number"
              :disabled="locked"
              :allow-input="Utils.onlyAllowNumber"
              :placeholder="$t('vacationSchedule.grid.tableNumberPh')"
              @change="onTableNumber(row)"
            />
          </template>

          <template #cell-period_from="{ row }">
            <n-date-picker
              :value="row.period_from"
              :status="isInvalid(row) && !row.period_from ? 'error' : undefined"
              type="date"
              :disabled="locked"
              :format="useAppSetting.datePicketFormat"
              @update:value="(v) => onPeriodFrom(row, v)"
            />
          </template>

          <template #cell-period_to="{ row }">
            <n-date-picker
              :value="row.period_to"
              :status="isInvalid(row) && !row.period_to ? 'error' : undefined"
              type="date"
              :disabled="locked"
              :format="useAppSetting.datePicketFormat"
              @update:value="(v) => onPeriodTo(row, v)"
            />
          </template>

          <template #cell-all_days="{ row }">
            <DaysEditor :row="row" :disabled="locked" @save="(d) => onDays(row, d)" />
          </template>

          <template #cell-month="{ row }">
            <n-select
              :value="row.month"
              :status="isInvalid(row) && !row.month ? 'error' : undefined"
              clearable
              :disabled="locked"
              :options="monthOptions"
              :placeholder="$t('vacationSchedule.grid.month')"
              @update:value="(v) => onMonth(row, v)"
            />
          </template>
        </UITable>
      </section>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped>
  :deep(.vs-row--dirty td:first-child) {
    box-shadow: inset 3px 0 0 var(--color-primary);
  }
  :deep(.vs-row--invalid td) {
    background: color-mix(in srgb, var(--color-fig-text-red) 6%, transparent) !important;
  }
</style>

<style>
  /* To'liq ekranli oyna — burchaklar to'g'ri (teleport qilingani uchun scoped emas). */
  .n-drawer.vs-drawer {
    border-radius: 0;
  }
</style>
