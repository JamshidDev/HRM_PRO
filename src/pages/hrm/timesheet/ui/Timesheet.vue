<script setup>
  import { onMounted, ref } from 'vue'
  import { Broom16Filled, Dismiss12Regular } from '@vicons/fluent'
  import { useComponentStore, useTimesheetWorkerStore } from '@/store/modules/index.js'
  import { UIPagination } from '@/components/index.js'
  import dayjs from 'dayjs'
  import { NTooltip } from 'naive-ui'

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
  <div class="flex h-full flex-col gap-3 p-6">
    <!-- Chapda: korxona · bo'lim · yil · oy (joriy tabel bo'yicha tanlangan).
         O'ngda: jadval uchun yordamchi tugmalar. -->
    <div class="flex shrink-0 flex-wrap items-center justify-between gap-2">
      <div class="flex flex-1 flex-wrap items-center gap-2">
        <n-select
          style="width: 200px"
          :value="store.organizationId"
          :options="orgOptions"
          :placeholder="$t('content.workplace')"
          label-field="name"
          value-field="id"
          disabled
        />
        <n-select
          style="width: 200px"
          v-model:value="store.params.department_id"
          :options="store.departmentOptions"
          :loading="store.departmentLoading"
          label-field="name"
          value-field="id"
          clearable
          filterable
          :placeholder="$t('documentPage.form.department')"
          @update:value="store.applyFilters"
        />
        <n-select
          style="width: 120px"
          :value="store.year"
          :options="yearOptions"
          :placeholder="$t('content.year')"
          disabled
        />
        <n-select
          style="width: 120px"
          :value="store.month"
          :options="monthOptions"
          :placeholder="$t('content.month')"
          disabled
        />
      </div>

      <div class="flex items-center gap-2">
        <n-button
          :type="store.payload.isClearing ? 'primary' : 'tertiary'"
          @click="
            () => {
              store.payload.isClearing = !store.payload.isClearing
              store.resetStatuses()
            }
          "
        >
          {{ $t('content.clear') }}
          <template #icon>
            <n-icon :component="Broom16Filled" />
          </template>
        </n-button>
        <n-button quaternary circle @click="store.visible = false">
          <template #icon>
            <n-icon :component="Dismiss12Regular" />
          </template>
        </n-button>
      </div>
    </div>

    <n-spin
      :show="store.loading || store.saveLoading"
      class="flex min-h-0 flex-1 flex-col"
      content-class="flex h-full min-h-0 flex-col"
    >
      <!-- Scroll FAQAT shu qutida: sarlavha va footer joyida qoladi. -->
      <div class="timesheet-scroll min-h-0 flex-1 overflow-auto border border-surface-line">
        <table
          class="relative bg-surface-section border-separate border-spacing-0 shadow-sm select-none w-full"
          @mouseleave="handleMouseLeave"
        >
          <thead class="bg-surface-ground">
            <tr>
              <th class="w-[50px] min-w-[50px] max-w-[50px]" rowspan="3">
                {{ $t('content.number') }}
              </th>
              <th class="w-[220px] min-w-[220px] max-w-[220px]" rowspan="3">
                {{ $t('content.worker') }}
              </th>
              <th class="w-[180px] min-w-[180px] max-w-[180px] px-3" rowspan="3">
                {{ $t('timesheet.name') }}
              </th>
              <th v-if="store.days.length" :colspan="store.days.length" rowspan="1">
                {{ $t('timesheetPage.tableTitle') }}
              </th>
              <th class="w-[80px] min-w-[80px] max-w-[80px]" rowspan="3">
                {{ $t('timesheetPage.work_days') }}
              </th>
              <th class="w-[80px] min-w-[80px] max-w-[80px]" rowspan="3">
                {{ $t('timesheetPage.work_hours') }}
              </th>
            </tr>
            <tr>
              <th
                v-for="day in store.days"
                :key="day.day"
                :class="{ weekend: day.weekDay === 0 || day.weekDay === 6 }"
                rowspan="2"
              >
                <div class="flex flex-col">
                  <p>{{ day.day }}</p>
                  <span class="text-xs">
                    {{ dayjs().day(day.weekDay).format('ddd').substring(0, 2) }}
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <!--     Workers row       -->
            <tr v-for="(item, row) in store.list" :key="row" class="timesheet_row">
              <!--      Tartib raqam (sahifani hisobga olib)        -->
              <td class="w-[50px] min-w-[50px] max-w-[50px] text-center text-secondary">
                {{ (store.params.page - 1) * store.params.per_page + row + 1 }}
              </td>

              <!--      Worker        -->
              <td class="w-[220px] min-w-[220px] max-w-[220px]">
                <div class="flex flex-col text-start">
                  <span class="w-full truncate text-sm leading-tight text-textColor2">
                    {{ item.name }}
                  </span>
                  <n-tooltip :disabled="!item?.position" animated trigger="hover">
                    {{ item?.position }}
                    <template #trigger>
                      <span class="w-full truncate text-xs leading-tight text-textColor1">
                        {{ item?.position || '' }}
                      </span>
                    </template>
                  </n-tooltip>
                </div>
              </td>

              <td>{{ item.table }}</td>
              <!--   Days section  -->
              <td
                v-for="(day, col) in store.days"
                :key="col"
                :class="{
                  'timesheet_day-selected': isCellSelected(row, col),
                  'timesheet_day-ignore':
                    isCellSelected(row, col) && !store.payload.isClearing && item.days[day.day]
                }"
                :data-col="col"
                :data-row="row"
                class="timesheet_day h-[44px] max-h-[44px] min-h-[44px] w-[44px] min-w-[44px] max-w-[44px] overflow-hidden p-0 text-center"
                @mousedown="handleMouseDown"
                @mousemove="handleMouseMove"
                @mouseup="handleMouseUp"
              >
                <div class="flex flex-col">
                  <div class="grow border-b border-surface-line shrink-0">
                    <p v-if="item.days[day.day]?.length">
                      {{
                        item.days[day.day]?.length > 1
                          ? item.days[day.day].map((i) => i.status).join('/')
                          : item.days[day.day][0].status
                      }}
                    </p>
                  </div>
                  <div class="grow shrink-0">
                    <p v-if="item.days[day.day]?.length" class="font-bold">
                      {{
                        item.days[day.day]?.filter((i) => i?.hours).length > 1
                          ? item.days[day.day].map((i) => i?.hours).join('/')
                          : item.days[day.day][0].hours || '&nbsp;'
                      }}
                    </p>
                  </div>
                </div>
              </td>
              <!-- Oy yakuni: ish kuni va ish soati (info ikonka o'rniga). -->
              <td class="w-[80px] min-w-[80px] max-w-[80px] text-center font-medium">
                {{ item.allMonth.days || 0 }}
              </td>
              <td class="w-[80px] min-w-[80px] max-w-[80px] text-center font-bold">
                {{ item.allMonth.hours || 0 }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-3 shrink-0">
        <n-form ref="form">
          <n-grid :cols="8" :x-gap="10">
            <n-form-item-gi :show-feedback="false" :show-label="false" :span="3">
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
            </n-form-item-gi>
            <n-form-item-gi :show-feedback="false" :show-label="false" :span="1">
              <n-input-number
                v-model:value="store.payload.hours"
                :disabled="
                  !(
                    store.payload.status &&
                    compStore.timesheetTypes[store.payload.status - 1]?.hours
                  )
                "
                :min="0"
              />
            </n-form-item-gi>
            <n-divider />
            <n-form-item-gi :show-feedback="false" :show-label="false" :span="3">
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
            </n-form-item-gi>
            <n-form-item-gi :show-feedback="false" :show-label="false" :span="1">
              <n-input-number
                v-model:value="store.payload.hours2"
                :disabled="
                  !(
                    store.payload.status2 &&
                    compStore.timesheetTypes[store.payload.status2 - 1]?.hours
                  )
                "
                :min="0"
              />
            </n-form-item-gi>
          </n-grid>
        </n-form>
      </div>

      <UIPagination
        :page="store.params.page"
        :per_page="store.params.per_page"
        :total="store.totalItems"
        @change-page="changePage"
      />
    </n-spin>
  </div>
</template>
<style lang="scss" scoped>
  /* Sarlavha qatori va chapdagi 3 ustun (drag, xodim, tabel) qotib turadi —
     scroll faqat kunlar bo'yicha yuradi. */
  .timesheet-scroll {
    thead th {
      position: sticky;
      top: 0;
      z-index: 3;
      background: var(--surface-ground);
    }
    /* Guruh sarlavhasi qat'iy 44px — kunlar qatori aynan shu balandlikda yopishadi. */
    thead tr:first-child th {
      height: 44px;
    }
    thead tr:nth-child(2) th {
      top: 44px;
    }
    thead tr:first-child th:nth-child(-n + 3),
    tbody td:nth-child(-n + 3) {
      position: sticky;
      z-index: 4;
      background: var(--surface-section);
    }
    thead tr:first-child th:nth-child(1),
    tbody td:nth-child(1) {
      left: 0;
    }
    thead tr:first-child th:nth-child(2),
    tbody td:nth-child(2) {
      left: 50px;
    }
    thead tr:first-child th:nth-child(3),
    tbody td:nth-child(3) {
      left: 270px;
    }
    thead tr:first-child th:nth-child(-n + 3) {
      background: var(--surface-ground);
      z-index: 5;
    }
  }

  thead {
    overflow: hidden;
  }
  tr {
    &:first-child {
      th {
        border-top: 1px solid var(--surface-line);
        &:last-child {
          border-right: 1px solid var(--surface-line);
          background-color: var(--surface-ground);
        }
      }
    }
    &:first-child,
    &:nth-child(2) {
      th {
        border-left: 1px solid var(--surface-line);
        border-bottom: 1px solid var(--surface-line);
      }
    }
  }
  tr {
    td {
      border: 1px solid var(--surface-line);
    }
  }
  .timesheet_day {
    &-selected {
      border: 1px solid var(--primary-color);
    }
    &-ignore {
      border: 1px solid var(--secondary-color);
    }
  }

  /* Ustunlar kengligi kontentga qarab o'zgarmasin — hammasi qat'iy.
     `width: max-content` jadval kunlar soniga qarab kengayishiga ruxsat beradi,
     lekin har bir ustun o'z belgilangan kengligida qoladi. */
  table {
    table-layout: fixed;
    width: max-content;
  }

  th,
  td {
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    /* Kataklar siqilib qolmasligi uchun ichki bo'shliq. */
    padding: 4px 8px;
  }
  thead th {
    padding: 6px 8px;
  }

  .weekend {
    background: rgba(var(--danger-color), 0.2);
    font-weight: bold;
    color: var(--danger-color);
  }
</style>
