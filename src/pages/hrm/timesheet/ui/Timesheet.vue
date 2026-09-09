<script setup>
  import { onMounted, ref } from 'vue'
  import { Dismiss20Regular } from '@vicons/fluent'
  import { useComponentStore, useTimesheetWorkerStore } from '@/store/modules/index.js'
  import { UIDragSelector, UIPagination } from '@/components/index.js'
  import dayjs from 'dayjs'
  import Utils from '@/utils/Utils.js'
  import { colorOfDetail } from './timesheetGrid.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useTimesheetWorkerStore()
  const compStore = useComponentStore()
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
  // Hafta kunining qisqa nomi — `shortWeek` i18n kalitlaridan (grafik sahifasi kabi).
  const shortWeek = {
    0: t('shortWeek.Sun'),
    1: t('shortWeek.Mon'),
    2: t('shortWeek.Tue'),
    3: t('shortWeek.Wed'),
    4: t('shortWeek.Thu'),
    5: t('shortWeek.Fri'),
    6: t('shortWeek.Sat')
  }

  // Dam olish VA bayram kuni — ikkalasi ham qizil ko'rsatiladi.
  const isWeekend = (day) => day.weekDay === 0 || day.weekDay === 6 || Boolean(day.is_holiday)

  const dayDetails = (item, day) => item.days[day.day]

  /**
   * Bir kunda bir nechta yozuv bo'lishi mumkin — har biri O'Z rangida chiziladi,
   * qiymatlar `/` bilan ajratiladi.
   */
  const partsOf = (details, field) =>
    (details ?? [])
      .filter((d) => d?.[field] !== null && d?.[field] !== undefined)
      .map((d) => ({ value: d[field], color: colorOfDetail(d) }))

  // Saqlanmagan (kutilayotgan) katakchalar: key `row-col` → {row, col, wasOccupied}.
  // Tanlangan katak DARHOL qiymat bilan to'ladi, serverga «Saqlash» da ketadi.
  const pendingCells = ref(new Map())

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

  // Drag tugagach tanlangan katakchalar TANLANGAN QIYMAT bilan to'ldiriladi
  // (tozalash rejimida bo'shatiladi). So'rov «Saqlash» bosilganda ketadi.
  const onSelectionChange = (items) => {
    if (!canSelectRange()) return
    for (const item of items) {
      const row = Number(item.row)
      const col = Number(item.col)
      const key = `${row}-${col}`
      if (!pendingCells.value.has(key)) {
        pendingCells.value.set(key, {
          row,
          col,
          wasOccupied: Boolean(store.list[row]?.days?.[col + 1]?.length)
        })
      }
      store.applyLocalCell(row, col, store.payload.isClearing ? [] : previewDetails.value)
    }
  }

  const toggleClearing = () => {
    store.payload.isClearing = !store.payload.isClearing
    if (store.payload.isClearing) store.resetStatuses()
  }

  const onSave = () => {
    if (!pendingCells.value.size) return
    const cells = [...pendingCells.value.values()]
    pendingCells.value = new Map()
    form.value?.validate((error) => {
      if (!error) store._save(cells)
    })
  }

  const changePage = (v) => {
    store.resetSelection()
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const renderLabel = (option) => {
    return [
      h('div', { class: 'font-medium text-gray-500 whitespace-nowrap' }, `${option.name} (${option.key})`)
    ]
  }

  // Pastki paneldagi «namuna» katakcha — tanlov katakchaga nima yozilishini
  // aynan panjaradagi ko'rinishda ko'rsatadi.
  const typeByIdOrNull = (id) =>
    id == null ? null : (compStore.timesheetTypes?.find((v) => v.id === id) ?? null)

  const previewDetails = computed(() => {
    if (store.payload.isClearing) return []
    return [
      { type: typeByIdOrNull(store.payload.status), hours: store.payload.hours },
      { type: typeByIdOrNull(store.payload.status2), hours: store.payload.hours2 }
    ]
      .filter((v) => v.type)
      .map((v) => ({
        status: v.type.key,
        status_id: v.type.id,
        hours: v.type.hours ? v.hours : null
      }))
  })

  const orgOptions = computed(() =>
    store.organization ? [{ id: store.organization.id, name: store.organization.name }] : []
  )
  const yearOptions = computed(() => {
    const y = store.year || dayjs().year()
    return [y - 1, y, y + 1].map((v) => ({ label: String(v), value: v }))
  })
  const monthOptions = computed(() =>
    Utils.monthList.map((m) => ({ label: m.name, value: m.id - 1 }))
  )
</script>

<template>
  <div class="ts-root">
    <!-- ── Filtrlar: maketda yorliq maydon USTIDA ─────────────────────────── -->
    <div class="ts-filters">
      <div class="ts-field">
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
        <n-select
          :options="yearOptions"
          :placeholder="$t('content.year')"
          :value="store.year"
          disabled
        />
      </div>
      <div class="ts-field">
        <n-select
          :options="monthOptions"
          :placeholder="$t('content.month')"
          :value="store.month"
          disabled
        />
      </div>

      <div class="ts-filters-actions">
        <n-button
          :type="store.payload.isClearing ? 'warning' : 'tertiary'"
          secondary
          @click="toggleClearing"
        >
          {{ $t('content.clear') }}
        </n-button>
        <n-button :loading="store.saveLoading" type="primary" @click="onSave">
          {{ $t('content.save') }}
        </n-button>
        <n-button secondary type="error" @click="store.visible = false">
          <template #icon>
            <n-icon :component="Dismiss20Regular" />
          </template>
          {{ $t('content.close') }}
        </n-button>
      </div>
    </div>

    <n-spin
      :show="store.loading || store.saveLoading"
      class="ts-body"
      content-class="ts-body-content"
    >
      <!-- ── Panjara kartasi: maketda 20px radius + 4px ichki otstup ──────── -->
      <div class="ts-card">
        <UIDragSelector
          class="ts-scroll"
          :live-selection="false"
          :scroll-zone-left="300"
          :scroll-zone-right="88"
          :scroll-zone-top="44"
          @selection-change="onSelectionChange"
        >
          <div class="ts-grid">
            <!-- Sarlavha qatori — skrollda tepada yopishib qoladi. -->
            <div class="ts-hrow no-selectable-item">
              <div class="ts-head ts-c-num">№</div>
              <div class="ts-head ts-c-worker">{{ $t('content.worker') }}</div>
              <div class="ts-head ts-c-table">{{ $t('timesheet.name') }}</div>
              <div
                v-for="day in store.days"
                :key="`h-${day.day}`"
                :class="{ 'is-weekend': isWeekend(day) }"
                class="ts-head ts-c-day ts-day-head"
              >
                <span class="ts-day-num">{{ day.day }}</span>
                <span class="ts-day-week">{{ shortWeek[day.weekDay] }}</span>
              </div>
              <div class="ts-head ts-c-total ts-c-days ts-head-sm">
                {{ $t('timesheetPage.totalWorkDays') }}
              </div>
              <div class="ts-head ts-c-total ts-c-hours ts-head-sm">
                {{ $t('timesheetPage.totalWorkHours') }}
              </div>
            </div>

            <div v-for="(item, row) in store.list" :key="row" class="ts-brow">
              <div class="ts-c-num no-selectable-item">
                {{ (store.params.page - 1) * store.params.per_page + row + 1 }}
              </div>
              <div class="ts-c-worker no-selectable-item">
                <div class="ts-worker">
                  <n-avatar
                    :fallback-src="Utils.noAvailableImage"
                    :size="32"
                    :src="item?.photo || Utils.noAvailableImage"
                    circle
                  />
                  <div class="ts-worker-text">
                    <span class="ts-worker-name">{{ item.name }}</span>
                    <span class="ts-worker-post">
                      {{ item?.position || $t('content.noAvailable') }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="ts-c-table no-selectable-item">
                <span class="ts-table-no">{{ item.table }}</span>
              </div>

              <div
                v-for="(day, col) in store.days"
                :key="col"
                :class="{
                  'is-rest': !dayDetails(item, day)?.length && isWeekend(day),
                  'is-empty': !dayDetails(item, day)?.length && !isWeekend(day)
                }"
                :data-col="col"
                :data-row="row"
                class="ts-cell"
                data-selectable
              >
                <template v-if="dayDetails(item, day)?.length">
                  <span class="ts-cell-status">
                    <template
                      v-for="(part, i) in partsOf(dayDetails(item, day), 'status')"
                      :key="`s-${i}`"
                    >
                      <span v-if="i" class="ts-sep">/</span><span :style="{ color: part.color }">{{ part.value }}</span>
                    </template>
                  </span>
                  <span class="ts-cell-hours">
                    <template
                      v-for="(part, i) in partsOf(dayDetails(item, day), 'hours')"
                      :key="`h-${i}`"
                    >
                      <span v-if="i" class="ts-sep">/</span><span :style="{ color: part.color }">{{ part.value }}</span>
                    </template>
                  </span>
                </template>
              </div>

              <div class="ts-c-total ts-c-days no-selectable-item">{{ item.allMonth.days || 0 }}</div>
              <div class="ts-c-total ts-c-hours no-selectable-item">
                {{ item.allMonth.hours || 0 }}
              </div>
            </div>
          </div>
        </UIDragSelector>
      </div>
    </n-spin>

    <!--
      Pastki panel — maketdagi yorliqli to'rt maydon. Semantikasi o'zgarmadi:
      tanlangan katakchalarga yoziladigan ikkita (tur + soat) juftlik.
    -->
    <!--
      Sahifalash — ildizning eng pastida, `flex-shrink: 0`. Ilgari u `n-spin`
      ichida, jadval kartasidan keyin turardi va uzun ro'yxatda kontent bilan
      birga surilib, ko'rinmay qolardi.
    -->
    <div class="ts-pagination">
      <UIPagination
        :page="store.params.page"
        :per_page="store.params.per_page"
        :show-size-picker="false"
        :total="store.totalItems"
        @change-page="changePage"
      />
    </div>
    <div class="ts-bottom">
      <n-form ref="form" class="ts-bottom-row">
        <div class="ts-field ts-field-type">
          <label class="ts-field-label">{{ $t('timesheetPage.workTimeType') }}</label>
          <n-select
            v-model:value="store.payload.status"
            :consistent-menu-width="false"
            :disabled="store.payload.isClearing"
            :loading="compStore.timesheetEnumsLoading"
            :options="compStore.timesheetTypes"
            :render-label="renderLabel"
            label-field="name"
            value-field="id"
            @update-value="
              (_, v) => {
                if (!v?.hours) store.payload.hours = null
              }
            "
          />
        </div>
        <div class="ts-field ts-field-hours">
          <label class="ts-field-label">{{ $t('timesheetPage.hours') }}</label>
          <n-input-number
            v-model:value="store.payload.hours"
            :disabled="
              !(store.payload.status && compStore.timesheetTypes[store.payload.status - 1]?.hours)
            "
            :min="0"
          />
        </div>
        <div class="ts-field ts-field-type">
          <label class="ts-field-label">{{ $t('timesheetPage.workTimeType') }} 2</label>
          <n-select
            v-model:value="store.payload.status2"
            :consistent-menu-width="false"
            :disabled="store.payload.isClearing || !store.payload.status"
            :loading="compStore.timesheetEnumsLoading"
            :options="compStore.timesheetTypes"
            :render-label="renderLabel"
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
        <div class="ts-field ts-field-hours">
          <label class="ts-field-label">{{ $t('timesheetPage.hours') }} 2</label>
          <n-input-number
            v-model:value="store.payload.hours2"
            :disabled="
              !(store.payload.status2 && compStore.timesheetTypes[store.payload.status2 - 1]?.hours)
            "
            :min="0"
          />
        </div>

        <!-- Natija namunasi — shu qatorning davomi. -->
        <div class="ts-field ts-field-preview">
          <label class="ts-field-label">
            {{ $t('content.result') }}
            <template v-if="!canSelectRange()">
              · <span class="ts-hint">{{ $t('timesheetPage.pickTypeFirst') }}</span>
            </template>
            <template v-else-if="pendingCells.size">
              · {{ $t('timesheetPage.selectedCells', { count: pendingCells.size }) }}
            </template>
          </label>
          <div class="ts-cell ts-preview-cell">
            <template v-if="previewDetails.length">
              <span class="ts-cell-status">
                <template v-for="(part, i) in partsOf(previewDetails, 'status')" :key="`ps-${i}`">
                  <span v-if="i" class="ts-sep">/</span><span :style="{ color: part.color }">{{ part.value }}</span>
                </template>
              </span>
              <span class="ts-cell-hours">
                <template v-for="(part, i) in partsOf(previewDetails, 'hours')" :key="`ph-${i}`">
                  <span v-if="i" class="ts-sep">/</span><span :style="{ color: part.color }">{{ part.value }}</span>
                </template>
              </span>
            </template>
          </div>
        </div>
      </n-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  /* O'lchamlar Figma «HRM Railway» maketidan (node 3368:103614):
     katakcha 44px, yon ustunlar 150px, karta radiusi 20px, otstuplar 16px. */
  /* O'lchamlar navbatchilik grafigi panjarasi bilan bir xil:
     kun katakchasi 60×50, № 60, o'ng jamlar 80, qator balandligi 50. */
  $cell: 60px; // kun ustuni kengligi
  $row: 50px; // qator balandligi
  $side: 200px; // «Xodim» va «Tabel» ustunlari
  $total: 80px; // «Kun» va «Soat»
  $num: 60px; // tartib raqami

  .ts-root {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    background: var(--surface-ground);
    overflow: hidden;
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
    flex: 1 1 auto;
    min-height: 0;
    background: var(--fig-block-bg);
    border-radius: 20px;
    padding: 4px;
  }
  .ts-scroll {
    /*
     * Skroll AYNAN shu qutida bo'lishi shart — tashqariga ko'chsa
     * `position: sticky` tayanch yo'qotadi: sarlavha ham, yon ustunlar ham
     * oddiy qatorlar bilan birga surilib ketadi.
     */
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;

    /* Skroll chizig'i ingichka — grafik sahifasidagi panjara bilan bir xil. */
    scrollbar-width: thin;
    scrollbar-color: var(--surface-line) transparent;
    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background: var(--surface-line);
      border-radius: 4px;
    }
    &::-webkit-scrollbar-corner {
      background: transparent;
    }
  }

  .ts-grid {
    width: max-content;
    min-width: 100%;
    user-select: none;
  }
  /* Qatorlar flex — `position: sticky` ustunlar uchun jadval emas, oqim kerak
     (grafik sahifasidagi panjara bilan bir xil yondashuv). */
  .ts-hrow,
  .ts-brow {
    display: flex;
    width: max-content;
    min-width: 100%;
  }
  .ts-hrow {
    position: sticky;
    top: 0;
    z-index: 6;
  }

  /* ── Sarlavha qatori ──────────────────────────────────────────────────── */
  .ts-head {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: $row;
    /* Ranglar navbatchilik grafigi bilan bir xil tokenlardan. */
    background: var(--surface-section);
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    color: var(--textColor1);
    white-space: nowrap;
    border: 1px solid var(--surface-line);
    margin-left: -1px;
    flex-shrink: 0;
  }
  .ts-hrow .ts-c-worker,
  .ts-hrow .ts-c-table {
    align-items: flex-start;
  }
  .ts-hrow .ts-c-num {
    border-top-left-radius: 16px;
  }
  .ts-hrow .ts-c-hours {
    border-top-right-radius: 16px;
  }
  /* Uzun sarlavha (jami ustunlari) — kichik shrift, ikki qatorga o'raladi. */
  .ts-head-sm {
    padding: 0 4px;
    font-size: 10px;
    line-height: 1.15;
    text-align: center;
    white-space: normal;
  }
  .ts-day-head {
    text-align: center;
    background: var(--schedule-weekday-bg);
    &.is-weekend {
      background: var(--schedule-weekend-bg);
    }
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
  .ts-c-num,
  .ts-c-worker,
  .ts-c-table,
  .ts-c-total {
    position: sticky;
    z-index: 3;
    background: var(--surface-section);
  }
  .ts-hrow .ts-c-num,
  .ts-hrow .ts-c-worker,
  .ts-hrow .ts-c-table,
  .ts-hrow .ts-c-total {
    z-index: 7;
    background: var(--surface-section);
  }
  /* Tartib raqami — eng chapdagi yopishtirilgan ustun. */
  .ts-c-num {
    left: 0;
    width: $num;
    min-width: $num;
    justify-content: center;
    font-size: 12px;
    color: var(--fig-text-secondary);
  }
  .ts-brow .ts-c-num {
    justify-content: center;
  }
  .ts-c-worker {
    left: $num;
    flex: 1 0 $side;
    width: $side;
    min-width: $side;
    padding-left: 12px;
    text-align: left;
  }
  .ts-c-table {
    left: $num + $side;
    width: $side;
    min-width: $side;
    padding-left: 12px;
    text-align: left;
    /* Kun ustunlari ostiga surilganda chegara ko'rinib tursin. */
    box-shadow: inset -1px 0 0 var(--surface-line);
  }
  .ts-c-day {
    width: $cell;
    min-width: $cell;
  }
  .ts-c-total {
    width: $total;
    min-width: $total;
    text-align: center;
    font-size: 14px;
    font-weight: 500;
    color: var(--fig-text-primary);
  }
  .ts-c-hours {
    right: 0;
  }
  .ts-c-days {
    right: $total;
    box-shadow: inset 1px 0 0 var(--surface-line);
  }

  /* ── Qatorlar ─────────────────────────────────────────────────────────── */
  .ts-brow > div {
    display: flex;
    align-items: center;
    height: $row;
    background: var(--surface-section);
    border: 1px solid var(--table-border);
    margin-left: -1px;
    margin-top: -1px;
    flex-shrink: 0;
  }
  .ts-brow .ts-c-total {
    justify-content: center;
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
    flex-direction: column;
    justify-content: center;
    text-align: center;
    line-height: 1.15;
    cursor: pointer;
    /* Rangsiz (ish kuni) katakchada matn TO'Q qora bo'ladi. */
    color: var(--textColor0);
    /* Fon neytral: rang MA'NOSI matnda (`TimesheetTypeColor`). */
    /* Bo'sh dam olish / bayram kuni — XIRA qizil (to'ldirilgani to'q qoladi). */
    &.is-rest {
      background: rgba(229, 56, 59, 0.05);
    }
    &.is-empty {
      color: var(--fig-text-disable);
    }
    /* Saqlanmagan katakcha ALOHIDA belgilanmaydi — rangsiz tur to'q qora
       bo'lib qolishi kerak. Nechta katak kutayotgani pastki paneldagi
       «Natija · N ta katak tanlandi» yozuvida ko'rinadi. */
  }
  /* Katakcha ichi bir xil standart: harf qatori + soat qatori. O'lcham va
     joylashuv kontentga qarab o'zgarmaydi — soat bo'lmasa qatori bo'sh turadi. */
  .ts-cell-status {
    display: block;
    height: 16px;
    line-height: 16px;
    font-size: 13px;
    font-weight: 700;
  }
  .ts-cell-hours {
    display: block;
    height: 12px;
    line-height: 12px;
    font-size: 10px;
    font-weight: 600;
  }
  /* Ajratuvchi `/` — harf va soat qatorlarida BIR XIL neytral rangda. */
  .ts-sep {
    color: var(--fig-text-tertiary);
    padding: 0 1px;
  }

  /* ── Legenda ──────────────────────────────────────────────────────────── */
  .ts-pagination {
    flex-shrink: 0;
    margin: -8px 0;
  }

  /* ── Pastki panel ─────────────────────────────────────────────────────── */
  .ts-bottom {
    flex-shrink: 0;
    background: var(--fig-block-bg);
    border-radius: 16px;
    padding: 6px 12px 8px;
  }

  .ts-filters-actions {
    display: flex;
    align-self: flex-end;
    gap: 8px;
    margin-left: auto;
  }
  /* Panjaradagi katakcha bilan AYNAN bir xil o'lcham va ko'rinish. */
  .ts-preview-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: $cell;
    min-width: $cell;
    height: $row;
    border: 1px solid var(--table-border);
    background: var(--surface-section);
  }

  /* Pastki panel — hamma element BITTA qatorda, kengliklar taqsimlangan. */
  .ts-bottom-row {
    display: flex;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 16px;
  }
  .ts-field-type {
    flex: 0 0 240px;
  }
  .ts-field-hours {
    flex: 0 0 110px;
  }
  .ts-hint {
    color: var(--fig-text-red);
  }
  .ts-field-preview {
    flex: 0 0 auto;
    margin-right: auto;
  }

  @media (max-width: 900px) {
    .ts-filters {
      flex-wrap: wrap;
    }
  }
</style>
