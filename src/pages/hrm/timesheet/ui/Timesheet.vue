<script setup>
  import { onMounted, ref } from 'vue'
  import { Dismiss20Regular } from '@vicons/fluent'
  import { useComponentStore, useTimesheetWorkerStore } from '@/store/modules/index.js'
  import { UIPagination } from '@/components/index.js'
  import dayjs from 'dayjs'
  import { NTooltip } from 'naive-ui'
  import Utils from '@/utils/Utils.js'
  import { statusClassOf, timesheetLegend } from './timesheetGrid.js'

  const store = useTimesheetWorkerStore()
  const compStore = useComponentStore()
  const isDragging = ref(false)
  const form = ref(null)

  onMounted(() => {
    if (compStore.timesheetTypes.length === 0) {
      compStore._timesheetEnums()
    }
    store.resetAll()
  })

  /* ------------------------------------------------------------------------
   * Katakcha ko'rinishi — Figma «HRM Railway» (node 3368:103614).
   *
   * Maketda uch xil holat ATAYLAB farqlanadi:
   *   • yozuvi bor kun    — holat harfiga mos rangli fon (`timesheetGrid.js`)
   *   • dam olish kuni    — bo'sh, kulrang fon
   *   • yozuvsiz ish kuni — oq fon, o'rtada tire
   * --------------------------------------------------------------------- */
  const isWeekend = (day) => day.weekDay === 0 || day.weekDay === 6

  const dayDetails = (item, day) => item.days[day.day]

  /** Bir kunda bir nechta yozuv bo'lishi mumkin — maketdagidek `/` bilan qo'shiladi. */
  const joinBy = (details, field) => {
    const values = details.map((d) => d?.[field]).filter((v) => v !== null && v !== undefined)
    return values.length ? values.join('/') : null
  }

  const isCellSelected = (row, col) => {
    if (!store.payload.start || !store.payload.end) return false
    const rowStart = Math.min(store.payload.start.row, store.payload.end.row)
    const rowEnd = Math.max(store.payload.start.row, store.payload.end.row)
    const colStart = Math.min(store.payload.start.col, store.payload.end.col)
    const colEnd = Math.max(store.payload.start.col, store.payload.end.col)
    return row >= rowStart && row <= rowEnd && col >= colStart && col <= colEnd
  }

  const canSelectRange = () => {
    if (!store.payload.isClearing && store.payload.status == null) {
      return false
    }
    if (
      store.payload.status != null &&
      compStore.timesheetTypes?.[store.payload.status - 1]?.hours &&
      store.payload.hours == null
    ) {
      return false
    }
    if (
      store.payload.status2 != null &&
      compStore.timesheetTypes?.[store.payload.status2 - 1]?.hours &&
      store.payload.hours2 == null
    ) {
      return false
    }

    return true
  }

  const handleMouseDown = (e) => {
    if (canSelectRange()) {
      isDragging.value = true
      const { col, row } = e.currentTarget.dataset
      const cell = { row: Number(row), col: Number(col) }

      store.resetSelection()
      store.payload.start = cell
      store.payload.end = cell
    }
  }

  const handleMouseMove = (e) => {
    if (!isDragging.value) return
    const { col, row } = e.currentTarget.dataset
    store.payload.end = { row: Number(row), col: Number(col) }
  }

  const handleMouseUp = () => {
    isDragging.value = false
    form.value?.validate((error) => {
      if (!error) {
        store._create()
      }
    })
  }

  const handleMouseLeave = () => {
    isDragging.value = false
    store.resetSelection()
  }

  const changePage = (v) => {
    store.resetSelection()
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const renderOption = ({ node, option }) => {
    return [
      h(
        NTooltip,
        {
          delay: 300
        },
        {
          trigger: () => node,
          default: () => `${option.name} (${option.key})`
        }
      )
    ]
  }

  const renderLabel = (option) => {
    return [h('div', { class: 'font-medium text-gray-500' }, `${option.name} (${option.key})`)]
  }

  const orgOptions = computed(() =>
    store.organization ? [{ id: store.organization.id, name: store.organization.name }] : []
  )
  const yearOptions = computed(() => {
    const y = store.year || dayjs().year()
    return [y - 1, y, y + 1].map((v) => ({ label: String(v), value: v }))
  })
  const monthOptions = computed(() =>
    Array.from({ length: 12 }, (_, i) => ({
      label: dayjs().month(i).format('MMMM'),
      value: i
    }))
  )
</script>

<template>
  <div class="ts-root">
    <!-- ── Tepa qator: sarlavha va o'ngda yopish ─────────────────────────── -->
    <div class="ts-topbar">
      <h2 class="ts-title">{{ store.department || $t('timesheetPage.name') }}</h2>

      <n-button :title="$t('content.close')" circle quaternary @click="store.visible = false">
        <template #icon>
          <n-icon :component="Dismiss20Regular" />
        </template>
      </n-button>
    </div>

    <!-- ── Filtrlar: maketda yorliq maydon USTIDA ─────────────────────────── -->
    <div class="ts-filters">
      <div class="ts-field">
        <label class="ts-field-label">{{ $t('content.workplace') }}</label>
        <n-select
          :options="orgOptions"
          :placeholder="$t('content.workplace')"
          :value="store.organizationId"
          disabled
          label-field="name"
          value-field="id"
        />
      </div>
      <div class="ts-field">
        <label class="ts-field-label">{{ $t('documentPage.form.department') }}</label>
        <n-select
          v-model:value="store.params.department_id"
          :loading="store.departmentLoading"
          :options="store.departmentOptions"
          :placeholder="$t('documentPage.form.department')"
          clearable
          filterable
          label-field="name"
          value-field="id"
          @update:value="store.applyFilters"
        />
      </div>
      <div class="ts-field">
        <label class="ts-field-label">{{ $t('content.year') }}</label>
        <n-select
          :options="yearOptions"
          :placeholder="$t('content.year')"
          :value="store.year"
          disabled
        />
      </div>
      <div class="ts-field">
        <label class="ts-field-label">{{ $t('content.month') }}</label>
        <n-select
          :options="monthOptions"
          :placeholder="$t('content.month')"
          :value="store.month"
          disabled
        />
      </div>
    </div>

    <n-spin
      :show="store.loading || store.saveLoading"
      class="ts-body"
      content-class="ts-body-content"
    >
      <!-- ── Panjara kartasi: maketda 20px radius + 4px ichki otstup ──────── -->
      <div class="ts-card">
        <div class="ts-scroll">
          <table class="ts-grid" @mouseleave="handleMouseLeave">
            <thead>
              <tr>
                <th class="ts-c-worker">{{ $t('content.worker') }}</th>
                <th class="ts-c-table">{{ $t('timesheet.name') }}</th>
                <th
                  v-for="day in store.days"
                  :key="day.day"
                  :class="{ 'is-weekend': isWeekend(day) }"
                  class="ts-c-day ts-day-head"
                >
                  <span class="ts-day-num">{{ day.day }}</span>
                  <span class="ts-day-week">
                    {{ dayjs().day(day.weekDay).format('ddd').substring(0, 2) }}
                  </span>
                </th>
                <th class="ts-c-total ts-c-days">{{ $t('content.day') }}</th>
                <th class="ts-c-total ts-c-hours">{{ $t('content.hour') }}</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(item, row) in store.list" :key="row" class="ts-row">
                <td class="ts-c-worker">
                  <div class="ts-worker">
                    <n-avatar
                      :fallback-src="Utils.noAvailableImage"
                      :size="32"
                      :src="item?.photo || Utils.noAvailableImage"
                      circle
                    />
                    <div class="ts-worker-text">
                      <span class="ts-worker-name">{{ item.name }}</span>
                      <n-tooltip :disabled="!item?.position" animated trigger="hover">
                        {{ item?.position }}
                        <template #trigger>
                          <span class="ts-worker-post">
                            {{ item?.position || $t('content.noAvailable') }}
                          </span>
                        </template>
                      </n-tooltip>
                    </div>
                  </div>
                </td>

                <td class="ts-c-table">
                  <span class="ts-table-no">{{ item.table || '—' }}</span>
                </td>

                <td
                  v-for="(day, col) in store.days"
                  :key="col"
                  :class="[
                    statusClassOf(dayDetails(item, day)),
                    {
                      'is-rest': !dayDetails(item, day)?.length && isWeekend(day),
                      'is-empty': !dayDetails(item, day)?.length && !isWeekend(day),
                      'is-selected': isCellSelected(row, col),
                      'is-occupied':
                        isCellSelected(row, col) &&
                        !store.payload.isClearing &&
                        dayDetails(item, day)
                    }
                  ]"
                  :data-col="col"
                  :data-row="row"
                  class="ts-cell"
                  @mousedown="handleMouseDown"
                  @mousemove="handleMouseMove"
                  @mouseup="handleMouseUp"
                >
                  <template v-if="dayDetails(item, day)?.length">
                    <span class="ts-cell-status">{{
                      joinBy(dayDetails(item, day), 'status')
                    }}</span>
                    <span v-if="joinBy(dayDetails(item, day), 'hours')" class="ts-cell-hours">
                      {{ joinBy(dayDetails(item, day), 'hours') }}
                    </span>
                  </template>
                  <span v-else-if="!isWeekend(day)" class="ts-cell-dash">—</span>
                </td>

                <td class="ts-c-total ts-c-days">{{ item.allMonth.days || 0 }}</td>
                <td class="ts-c-total ts-c-hours">{{ item.allMonth.hours || 0 }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="ts-legend-divider"></div>

        <!-- Rang legendasi — maketdagi olti element, o'sha tartibda -->
        <div class="ts-legend">
          <span v-for="entry in timesheetLegend" :key="entry.key" class="ts-legend-item">
            <i :style="{ backgroundColor: entry.color }" class="ts-legend-dot"></i>
            {{ $t(`timesheetPage.legend.${entry.key}`) }}
          </span>
        </div>
      </div>
    </n-spin>

    <!--
      Pastki panel — maketdagi yorliqli to'rt maydon. Semantikasi o'zgarmadi:
      tanlangan katakchalarga yoziladigan ikkita (tur + soat) juftlik.
    -->
    <div class="ts-bottom">
      <n-form ref="form" class="ts-bottom-grid">
        <div class="ts-field">
          <label class="ts-field-label">{{ $t('timesheetPage.workTimeType') }}</label>
          <n-select
            v-model:value="store.payload.status"
            :disabled="store.payload.isClearing"
            :loading="compStore.timesheetEnumsLoading"
            :options="compStore.timesheetTypes"
            :render-label="renderLabel"
            :render-option="renderOption"
            label-field="name"
            value-field="id"
            @update-value="
              (_, v) => {
                if (!v?.hours) store.payload.hours = null
              }
            "
          />
        </div>
        <div class="ts-field">
          <label class="ts-field-label">{{ $t('timesheetPage.hours') }}</label>
          <n-input-number
            v-model:value="store.payload.hours"
            :disabled="
              !(store.payload.status && compStore.timesheetTypes[store.payload.status - 1]?.hours)
            "
            :min="0"
          />
        </div>
        <div class="ts-field">
          <label class="ts-field-label">{{ $t('timesheetPage.workTimeType') }} 2</label>
          <n-select
            v-model:value="store.payload.status2"
            :disabled="store.payload.isClearing || !store.payload.status"
            :loading="compStore.timesheetEnumsLoading"
            :options="compStore.timesheetTypes"
            :render-label="renderLabel"
            :render-option="renderOption"
            clearable
            label-field="name"
            value-field="id"
            @update-value="
              (_, v) => {
                if (!v?.hours) store.payload.hours2 = null
              }
            "
          />
        </div>
        <div class="ts-field">
          <label class="ts-field-label">{{ $t('timesheetPage.hours') }} 2</label>
          <n-input-number
            v-model:value="store.payload.hours2"
            :disabled="
              !(store.payload.status2 && compStore.timesheetTypes[store.payload.status2 - 1]?.hours)
            "
            :min="0"
          />
        </div>
      </n-form>
    </div>

    <!--
      Sahifalash — ildizning eng pastida, `flex-shrink: 0`. Ilgari u `n-spin`
      ichida, jadval kartasidan keyin turardi va uzun ro'yxatda kontent bilan
      birga surilib, ko'rinmay qolardi.
    -->
    <div class="ts-pagination">
      <UIPagination
        :page="store.params.page"
        :per_page="store.params.per_page"
        :total="store.totalItems"
        @change-page="changePage"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  /* O'lchamlar Figma «HRM Railway» maketidan (node 3368:103614):
     katakcha 44px, yon ustunlar 150px, karta radiusi 20px, otstuplar 16px. */
  $cell: 44px;
  $side: 150px;

  .ts-root {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    background: var(--surface-ground);
    overflow: hidden;
  }

  /* ── Tepa qator ───────────────────────────────────────────────────────── */
  .ts-topbar {
    display: flex;
    align-items: center;
    gap: 24px;
    flex-shrink: 0;
  }
  .ts-title {
    flex: 1 1 auto;
    min-width: 0;
    font-size: 18px;
    font-weight: 600;
    line-height: 24px;
    color: var(--fig-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ── Yorliqli maydon (filtrlar va pastki panel uchun umumiy) ──────────── */
  .ts-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }
  .ts-field-label {
    font-size: 12px;
    line-height: 16px;
    color: var(--fig-text-tertiary);
  }
  .ts-filters {
    display: flex;
    gap: 16px;
    flex-shrink: 0;
    .ts-field {
      width: 180px;
    }
  }

  /* ── Panjara kartasi ──────────────────────────────────────────────────── */
  .ts-body {
    flex: 1 1 auto;
    min-height: 0;
  }
  :deep(.ts-body-content) {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }
  .ts-card {
    display: flex;
    flex-direction: column;
    min-height: 0;
    background: var(--fig-block-bg);
    border-radius: 20px;
    padding: 4px;
  }
  .ts-scroll {
    /*
     * Skroll AYNAN shu qutida bo'lishi shart — tashqariga ko'chsa
     * `position: sticky` tayanch yo'qotadi va yopishtirilgan ustunlar
     * oddiy qatorlar bilan birga surilib ketadi.
     */
    min-height: 0;
    overflow: auto;
  }

  .ts-grid {
    border-collapse: separate;
    border-spacing: 0;
    table-layout: fixed;
    /* Kunlar soniga qarab kengayadi, lekin har ustun o'z kengligida qoladi. */
    width: max-content;
    user-select: none;
  }

  /* ── Sarlavha qatori ──────────────────────────────────────────────────── */
  thead th {
    position: sticky;
    top: 0;
    z-index: 3;
    height: $cell;
    background: var(--fig-bg-disable);
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    color: var(--fig-text-secondary);
    white-space: nowrap;
    border: 0.5px solid rgba(234, 236, 240, 0.24);
  }
  thead th:first-child {
    border-top-left-radius: 16px;
  }
  thead th:last-child {
    border-top-right-radius: 16px;
  }
  .ts-day-head {
    text-align: center;
    .ts-day-num {
      display: block;
      font-size: 14px;
      line-height: 16px;
    }
    .ts-day-week {
      display: block;
      font-size: 11px;
      line-height: 12px;
      color: var(--fig-text-tertiary);
    }
    /* Maketda dam olish kunida FAQAT matn qizil — fon o'zgarmaydi. */
    &.is-weekend .ts-day-num,
    &.is-weekend .ts-day-week {
      color: var(--fig-text-red);
    }
  }

  /* ── Yopishtirilgan ustunlar ──────────────────────────────────────────── */
  .ts-c-worker,
  .ts-c-table,
  .ts-c-total {
    position: sticky;
    z-index: 2;
    background: var(--fig-block-bg);
  }
  thead .ts-c-worker,
  thead .ts-c-table,
  thead .ts-c-total {
    z-index: 4;
    background: var(--fig-bg-disable);
  }
  .ts-c-worker {
    left: 0;
    width: $side;
    min-width: $side;
    padding-left: 12px;
    text-align: left;
  }
  .ts-c-table {
    left: $side;
    width: $side;
    min-width: $side;
    padding-left: 12px;
    text-align: left;
    /* Kun ustunlari ostiga surilganda chegara ko'rinib tursin. */
    box-shadow: inset -1px 0 0 var(--fig-bg-disable);
  }
  .ts-c-total {
    width: $cell;
    min-width: $cell;
    text-align: center;
    font-size: 14px;
    font-weight: 500;
    color: var(--fig-text-primary);
  }
  .ts-c-hours {
    right: 0;
  }
  .ts-c-days {
    right: $cell;
    box-shadow: inset 1px 0 0 var(--fig-bg-disable);
  }

  /* ── Qatorlar ─────────────────────────────────────────────────────────── */
  .ts-row td {
    height: $cell;
    background: var(--fig-block-bg);
    border-bottom: 1px solid var(--fig-bg-disable);
  }
  .ts-worker {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .ts-worker-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .ts-worker-name {
    font-size: 12px;
    font-weight: 600;
    line-height: 16px;
    color: var(--fig-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ts-worker-post {
    font-size: 10px;
    line-height: 15px;
    letter-spacing: 0.2px;
    color: var(--fig-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ts-table-no {
    font-size: 12px;
    color: var(--fig-text-secondary);
  }

  /* ── Kun katakchalari ───────────────────────────────────────────────────
   * Fon/matn juftliklari maketdan olinib, loyihaning mavjud `--fig-*`
   * tokenlariga xaritalandi. Harf → sinf mosligi `timesheetGrid.js` da.
   */
  .ts-cell {
    width: $cell;
    min-width: $cell;
    text-align: center;
    line-height: 1.15;
    &.is-work {
      background: var(--fig-chip-green-bg);
      color: var(--fig-text-green);
    }
    &.is-vacation {
      background: var(--fig-bg-brand-surface);
      color: var(--fig-text-brand);
    }
    &.is-holiday {
      background: var(--fig-indigo-100);
      color: var(--fig-chip-indigo-text);
    }
    &.is-sick {
      background: var(--fig-chip-amber-bg);
      color: var(--fig-chip-amber-text);
    }
    &.is-absent {
      background: var(--fig-red-50);
      color: var(--fig-text-red);
    }
    &.is-rest {
      background: var(--fig-bg-disable);
    }
    &.is-empty {
      color: var(--fig-text-disable);
    }
    /* `border` EMAS, `inset` soya — 44px panjara siljimasin. */
    &.is-selected {
      box-shadow: inset 0 0 0 2px var(--fig-bg-brand-fill);
    }
    &.is-occupied {
      box-shadow: inset 0 0 0 2px var(--fig-icon-amber);
    }
  }
  .ts-cell-status {
    display: block;
    font-size: 13px;
    font-weight: 500;
  }
  .ts-cell-hours {
    display: block;
    font-size: 10px;
  }
  /* Harfsiz, faqat soat bo'lsa u asosiy o'lchamda chiziladi. */
  .ts-cell-status:only-child {
    font-size: 14px;
  }
  .ts-cell-dash {
    font-size: 12px;
  }

  /* ── Legenda ──────────────────────────────────────────────────────────── */
  .ts-legend-divider {
    height: 1px;
    margin: 8px 4px 0;
    background: var(--fig-bg-disable);
    flex-shrink: 0;
  }
  .ts-legend {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 20px;
    padding: 8px;
    flex-shrink: 0;
  }
  .ts-legend-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    line-height: 16px;
    color: var(--fig-text-tertiary);
    white-space: nowrap;
  }
  .ts-legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 100px;
    flex-shrink: 0;
  }

  .ts-pagination {
    flex-shrink: 0;
  }

  /* ── Pastki panel ─────────────────────────────────────────────────────── */
  .ts-bottom {
    flex-shrink: 0;
    background: var(--fig-block-bg);
    border-radius: 16px;
    padding: 12px 16px;
  }
  .ts-bottom-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  @media (max-width: 900px) {
    .ts-filters {
      flex-wrap: wrap;
    }
    .ts-bottom-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .ts-topbar {
      flex-wrap: wrap;
      gap: 12px;
    }
  }
</style>
