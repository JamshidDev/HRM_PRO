<script setup>
  import { onMounted, ref } from 'vue'
  import { VueDraggable } from 'vue-draggable-plus'
  import {
    Add16Filled,
    Broom16Filled,
    ChevronLeft16Filled,
    Delete20Filled,
    ReOrderDotsVertical24Filled
  } from '@vicons/fluent'
  import { useComponentStore, useTimesheetWorkerStore } from '@/store/modules/index.js'
  import { UIPagination } from '@/components/index.js'
  import dayjs from 'dayjs'
  import { NAvatar, NTooltip } from 'naive-ui'
  import { useDebounceFn } from '@vueuse/core'
  import Utils from '@/utils/Utils.js'
  import MiniTimesheetInfoTable from './MiniTimesheetInfoTable.vue'
  import { statusClassOf, timesheetLegend } from './timesheetGrid.js'

  const store = useTimesheetWorkerStore()
  const compStore = useComponentStore()
  const isDragging = ref(false)
  const form = ref(null)
  const isAddUserVisible = ref(false)
  const addUserSelect = ref(null)

  const onAdd = () => {
    isAddUserVisible.value = true
    setTimeout(() => {
      addUserSelect.value?.focus()
    }, 200)
  }

  onMounted(() => {
    if (compStore.timesheetTypes.length === 0) {
      compStore._timesheetEnums()
    }
    store.resetAll()
  })

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

  const renderWorkerLabel = (option) => {
    return [
      h(
        'div',
        {
          class: 'flex gap-2 my-1 items-center',
          onClick: () => {
            if (option.disabled) return
            isAddUserVisible.value = false
            store._prepend_workers(option)
          }
        },
        [
          h(NAvatar, {
            class: '',
            src: option.worker.photo || Utils.noAvailableImage,
            'fallback-src': Utils.noAvailableImage
          }),
          h('div', { class: 'flex flex-col' }, [
            h(
              'div',
              { class: 'text-xs font-medium text-gray-500' },
              `${option.worker.last_name}.${option.worker.first_name[0]}.${option.worker.middle_name[0]}`
            ),
            h('div', { class: 'text-xs text-gray-400' }, option.post_name)
          ])
        ]
      )
    ]
  }
  const searchPin = ref('')

  const checkWorker = useDebounceFn(() => {
    if (searchPin.value.split('-').join('').length === 14) {
      store._check_pin(searchPin.value.split('-').join(''))
    }
  }, 300)

  /* ------------------------------------------------------------------------
   * Katakcha ko'rinishi (Figma node 3368:103614)
   *
   * Maketda uch xil holat bor va ular ATAYLAB farqlanadi:
   *   • yozuvi bor kun   — holat harfiga mos rangli fon (`timesheetGrid.js`)
   *   • dam olish kuni   — bo'sh, kulrang fon (`--fig-bg-disable`)
   *   • yozuvsiz ish kuni — oq fon, o'rtada tire
   * --------------------------------------------------------------------- */

  const isWeekend = (day) => day.weekDay === 0 || day.weekDay === 6

  const dayDetails = (item, day) => item.days[day.day]

  /** Bir kunda bir nechta yozuv bo'lishi mumkin — maketdagidek `/` bilan qo'shiladi. */
  const joinBy = (details, field) => {
    const values = details.map((d) => d?.[field]).filter((v) => v !== null && v !== undefined)
    return values.length ? values.join('/') : null
  }

  const weekDayLabel = (day) => dayjs().day(day.weekDay).format('ddd').substring(0, 2)

  const periodLabel = computed(() => {
    if (store.month == null || !store.year) return null
    return dayjs().month(store.month).year(store.year).format('MMMM YYYY')
  })
</script>

<template>
  <div class="ts-root">
    <!-- Tepa qator: ortga + sarlavha + amallar (maketdagi «Top Bar») -->
    <div class="ts-topbar">
      <n-button class="ts-back" quaternary @click="store.visible = false">
        <template #icon>
          <n-icon :component="ChevronLeft16Filled" />
        </template>
        {{ $t('content.back') }}
      </n-button>

      <div class="ts-heading">
        <h2 class="ts-title">{{ store.department || $t('timesheetPage.name') }}</h2>
        <span v-if="periodLabel" class="ts-period">{{ periodLabel }}</span>
      </div>

      <div class="ts-actions">
        <n-button
          :type="store.payload.isClearing ? 'primary' : 'default'"
          @click="
            () => {
              store.payload.isClearing = !store.payload.isClearing
              store.resetStatuses()
            }
          "
        >
          <template #icon>
            <n-icon :component="Broom16Filled" />
          </template>
          {{ $t('content.clear') }}
        </n-button>
        <n-button type="primary" @click="onAdd">
          <template #icon>
            <n-icon :component="Add16Filled" />
          </template>
          {{ $t('timesheetPage.addNewWorker') }}
        </n-button>
      </div>
    </div>

    <n-spin :show="store.loading || store.saveLoading" class="ts-body">
      <!-- Panjara kartasi: maketda 20px radius + 4px ichki otstup -->
      <div class="ts-card">
        <div class="ts-scroll">
          <VueDraggable
            v-model="store.list"
            :animation="150"
            :onStart="store.resetSelection"
            handle=".ts-handle"
            target=".ts-tbody"
          >
            <table class="ts-grid" @mouseleave="handleMouseLeave">
              <thead>
                <tr>
                  <th class="ts-col-worker">{{ $t('content.worker') }}</th>
                  <th class="ts-col-table">{{ $t('timesheet.name') }}</th>
                  <th
                    v-for="day in store.days"
                    :key="day.day"
                    :class="{ 'is-weekend': isWeekend(day) }"
                    class="ts-col-day"
                  >
                    <span class="ts-day-num">{{ day.day }}</span>
                    <span class="ts-day-week">{{ weekDayLabel(day) }}</span>
                  </th>
                  <th class="ts-col-total ts-col-total-days">{{ $t('content.day') }}</th>
                  <th class="ts-col-total ts-col-total-hours">{{ $t('content.hour') }}</th>
                </tr>
              </thead>

              <tbody class="ts-tbody">
                <!-- PIN bo'yicha xodim qo'shish qatori -->
                <tr v-if="isAddUserVisible" class="ts-row">
                  <td class="ts-col-worker">
                    <div class="ts-add-cell">
                      <n-button
                        circle
                        quaternary
                        size="tiny"
                        type="error"
                        @click="isAddUserVisible = false"
                      >
                        <template #icon>
                          <n-icon :component="Delete20Filled" />
                        </template>
                      </n-button>
                      <n-popselect :options="store.pinWorkers" :render-label="renderWorkerLabel">
                        <n-input
                          v-model:value="searchPin"
                          v-mask="`####-####-####-##`"
                          :loading="store.pinLoading"
                          :placeholder="$t('timesheetPage.pin')"
                          size="small"
                          type="text"
                          @update:value="checkWorker"
                        />
                      </n-popselect>
                    </div>
                  </td>
                  <td class="ts-col-table"></td>
                  <td
                    v-for="(day, col) in store.days"
                    :key="col"
                    :class="{ 'is-rest': isWeekend(day) }"
                    class="ts-cell"
                  ></td>
                  <td class="ts-col-total ts-col-total-days"></td>
                  <td class="ts-col-total ts-col-total-hours"></td>
                </tr>

                <!-- Xodim qatorlari -->
                <tr v-for="(item, row) in store.list" :key="row" class="ts-row">
                  <td class="ts-col-worker">
                    <div class="ts-worker">
                      <n-icon
                        :component="ReOrderDotsVertical24Filled"
                        class="ts-handle"
                        :title="$t('content.move')"
                      />
                      <n-avatar
                        :fallback-src="Utils.noAvailableImage"
                        :src="item?.photo || Utils.noAvailableImage"
                        :size="32"
                        circle
                      />
                      <div class="ts-worker-text">
                        <span class="ts-worker-name">{{ item.name }}</span>
                        <n-tooltip :disabled="!item?.position" animated trigger="hover">
                          {{ item?.position }}
                          <template #trigger>
                            <span class="ts-worker-post">{{ item?.position || '—' }}</span>
                          </template>
                        </n-tooltip>
                      </div>
                    </div>
                  </td>

                  <td class="ts-col-table">
                    <span class="ts-table-no">{{ item.table || '—' }}</span>
                  </td>

                  <!-- Kun katakchalari -->
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
                      <span class="ts-cell-status">
                        {{ joinBy(dayDetails(item, day), 'status') }}
                      </span>
                      <span v-if="joinBy(dayDetails(item, day), 'hours')" class="ts-cell-hours">
                        {{ joinBy(dayDetails(item, day), 'hours') }}
                      </span>
                    </template>
                    <span v-else-if="!isWeekend(day)" class="ts-cell-dash">—</span>
                  </td>

                  <!--
                    Jamlanma ustunlari o'ngga yopishtirilgan. Oy yarmigacha bo'lgan
                    taqsimot ilgari hover'da sirg'alib chiqadigan panelda edi; endi
                    u tooltipda — ma'lumot yo'qolmadi, lekin panjara maketdagidek
                    ikkita oddiy ustun bilan tugaydi.
                  -->
                  <td class="ts-col-total ts-col-total-days">
                    <n-tooltip trigger="hover" placement="left">
                      <template #trigger>
                        <span class="ts-total-value">{{ item.allMonth.days }}</span>
                      </template>
                      <MiniTimesheetInfoTable
                        :allDays="item.allMonth.days"
                        :allHours="item.allMonth.hours"
                        :halfDays="item.halfMonth.days"
                        :halfHours="item.halfMonth.hours"
                      />
                    </n-tooltip>
                  </td>
                  <td class="ts-col-total ts-col-total-hours">
                    <span class="ts-total-value">{{ item.allMonth.hours }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </VueDraggable>
        </div>

        <div class="ts-legend-divider"></div>

        <!-- Legenda — maketdagi olti element, o'sha tartibda -->
        <div class="ts-legend">
          <span v-for="entry in timesheetLegend" :key="entry.key" class="ts-legend-item">
            <i :style="{ backgroundColor: entry.color }" class="ts-legend-dot"></i>
            {{ $t(`timesheetPage.legend.${entry.key}`) }}
          </span>
        </div>
      </div>

      <!-- Pastki panel: tanlangan katakchalarga yoziladigan qiymatlar -->
      <n-form ref="form" class="ts-form">
        <div class="ts-form-field ts-form-field-wide">
          <label class="ts-form-label">{{ $t('timesheetPage.workTimeType') }}</label>
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
        <div class="ts-form-field">
          <label class="ts-form-label">{{ $t('timesheetPage.hours') }}</label>
          <n-input-number
            v-model:value="store.payload.hours"
            :disabled="
              !(store.payload.status && compStore.timesheetTypes[store.payload.status - 1]?.hours)
            "
            :min="0"
          />
        </div>
        <div class="ts-form-field ts-form-field-wide">
          <label class="ts-form-label">{{ $t('timesheetPage.workTimeType') }} 2</label>
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
        <div class="ts-form-field">
          <label class="ts-form-label">{{ $t('timesheetPage.hours') }} 2</label>
          <n-input-number
            v-model:value="store.payload.hours2"
            :disabled="
              !(store.payload.status2 && compStore.timesheetTypes[store.payload.status2 - 1]?.hours)
            "
            :min="0"
          />
        </div>
      </n-form>

      <UIPagination
        v-if="store.totalItems > store.params.per_page"
        :page="store.params.page"
        :per_page="store.params.per_page"
        :total="store.totalItems"
        @change-page="changePage"
      />
    </n-spin>
  </div>
</template>

<style lang="scss" scoped>
  /* Maketdagi o'lchamlar: katakcha 44px, yon ustunlar 150px, karta radiusi 20px. */
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

  /* ── Tepa qator ─────────────────────────────────────────────────────── */
  .ts-topbar {
    display: flex;
    align-items: center;
    gap: 24px;
    flex-shrink: 0;
  }
  .ts-back {
    background: var(--fig-bg-tertiary);
    border-radius: 8px;
  }
  .ts-heading {
    display: flex;
    align-items: baseline;
    gap: 12px;
    flex: 1 1 auto;
    min-width: 0;
  }
  .ts-title {
    font-size: 18px;
    font-weight: 600;
    line-height: 24px;
    color: var(--fig-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ts-period {
    font-size: 12px;
    line-height: 16px;
    color: var(--fig-text-tertiary);
    text-transform: capitalize;
    flex-shrink: 0;
  }
  .ts-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  /* ── Panjara kartasi ────────────────────────────────────────────────── */
  .ts-body {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .ts-card {
    background: var(--fig-block-bg);
    border-radius: 20px;
    padding: 4px;
    overflow: hidden;
  }
  .ts-scroll {
    overflow: auto;
    /*
     * Yopishtirilgan ustunlar ishlashi uchun skroll AYNAN shu konteynerda
     * bo'lishi kerak — tashqi elementga ko'chsa, `position: sticky` tayanch
     * yo'qotadi va ustunlar oddiy qatorlar bilan birga suriladi.
     */
    max-height: calc(100vh - 320px);
  }

  .ts-grid {
    border-collapse: separate;
    border-spacing: 0;
    user-select: none;
    table-layout: fixed;
  }

  /* ── Sarlavha qatori ────────────────────────────────────────────────── */
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
  thead tr th:first-child {
    border-top-left-radius: 16px;
  }
  thead tr th:last-child {
    border-top-right-radius: 16px;
  }
  .ts-col-day {
    width: $cell;
    min-width: $cell;
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
    /* Dam olish kunlari maketda qizil sarlavha bilan ajratilgan. */
    &.is-weekend .ts-day-num,
    &.is-weekend .ts-day-week {
      color: var(--fig-text-red);
    }
  }

  /* ── Yopishtirilgan ustunlar ────────────────────────────────────────── */
  .ts-col-worker,
  .ts-col-table,
  .ts-col-total {
    position: sticky;
    z-index: 2;
    background: var(--fig-block-bg);
  }
  thead .ts-col-worker,
  thead .ts-col-table,
  thead .ts-col-total {
    z-index: 4;
    background: var(--fig-bg-disable);
  }
  .ts-col-worker {
    left: 0;
    width: $side;
    min-width: $side;
    padding-left: 12px;
    text-align: left;
  }
  .ts-col-table {
    left: $side;
    width: $side;
    min-width: $side;
    padding-left: 12px;
    text-align: left;
    /* Kun ustunlari ostiga surilganda chegara ko'rinib tursin. */
    box-shadow: inset -1px 0 0 var(--fig-bg-disable);
  }
  .ts-col-total {
    width: $cell;
    min-width: $cell;
    text-align: center;
  }
  .ts-col-total-hours {
    right: 0;
  }
  .ts-col-total-days {
    right: $cell;
    box-shadow: inset 1px 0 0 var(--fig-bg-disable);
  }

  /* ── Qatorlar ───────────────────────────────────────────────────────── */
  .ts-row {
    td {
      height: $cell;
      background: var(--fig-block-bg);
      border-bottom: 1px solid var(--fig-bg-disable);
    }
  }
  .ts-worker {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .ts-handle {
    flex-shrink: 0;
    /* `n-icon` svg'ni `font-size` bo'yicha o'lchaydi — `width` ta'sir qilmaydi. */
    font-size: 14px;
    color: var(--fig-text-disable);
    cursor: grab;
    opacity: 0;
    transition: opacity 0.15s ease;
    .ts-row:hover & {
      opacity: 1;
    }
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
  .ts-total-value {
    font-size: 14px;
    font-weight: 500;
    color: var(--fig-text-primary);
  }
  .ts-add-cell {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  /* ── Kun katakchalari ───────────────────────────────────────────────── */
  .ts-cell {
    width: $cell;
    min-width: $cell;
    text-align: center;
    line-height: 1.15;
    /*
     * Ranglar `timesheetGrid.js` dagi holat harfiga bog'liq. Fon/matn
     * juftliklari Figma maketidan olindi va loyihaning `--fig-*` tokenlariga
     * xaritalandi — yangi rang kiritilmadi.
     */
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
    /* Dam olish kuni — bo'sh kulrang katakcha. */
    &.is-rest {
      background: var(--fig-bg-disable);
    }
    &.is-empty {
      color: var(--fig-text-disable);
    }
    /* Sudrab tanlash: joriy diapazon va ustiga yozib bo'lmaydigan katakchalar. */
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
  /* Faqat soat bo'lsa (harfsiz) u asosiy o'lchamda chiziladi. */
  .ts-cell-status:only-child {
    font-size: 14px;
  }
  .ts-cell-dash {
    font-size: 12px;
  }

  /* ── Legenda ────────────────────────────────────────────────────────── */
  .ts-legend-divider {
    height: 1px;
    margin: 8px 4px;
    background: var(--fig-bg-disable);
  }
  .ts-legend {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 20px;
    padding: 8px;
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

  /* ── Pastki panel ───────────────────────────────────────────────────── */
  .ts-form {
    display: grid;
    grid-template-columns: 3fr 1fr 3fr 1fr;
    gap: 16px;
    margin-top: 16px;
    padding: 12px 16px;
    background: var(--fig-block-bg);
    border-radius: 16px;
    flex-shrink: 0;
  }
  .ts-form-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }
  .ts-form-label {
    font-size: 12px;
    line-height: 16px;
    color: var(--fig-text-tertiary);
  }

  @media (max-width: 900px) {
    .ts-form {
      grid-template-columns: 1fr 1fr;
    }
    .ts-topbar {
      flex-wrap: wrap;
      gap: 12px;
    }
  }
</style>
