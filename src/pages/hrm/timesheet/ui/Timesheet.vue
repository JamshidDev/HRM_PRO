<script setup>
  import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
  import { useMessage } from 'naive-ui'
  import {
    Dismiss20Regular,
    Info20Filled,
    MoreVertical20Filled,
    Search20Regular,
    Wand20Filled
  } from '@vicons/fluent'
  import { useComponentStore, useTimesheetWorkerStore } from '@/store/modules/index.js'
  import { UIDragSelector, UIPagination } from '@/components/index.js'
  import dayjs from 'dayjs'
  import Utils from '@/utils/Utils.js'
  import { UISegmentTabs } from '@/components/index.js'
  import { colorOfDetail } from './timesheetGrid.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const message = useMessage()
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
   * «Xodim» ustuni sarlavhasidagi qidiruv.
   *
   * Ikonka bosilganda input ochiladi (sarlavha matni o'rniga), yozilganda
   * 400 ms debounce bilan serverga so'rov ketadi. Backend `search` ni
   * F.I.Sh. (bo'sh joy bilan ajratilgan har bir bo'lak) VA tabel raqami
   * (`workers.card`) bo'yicha qidiradi — `buildWorkerSearchCond`.
   * ---------------------------------------------------------------------- */
  const searchOpen = ref(false)
  const searchInput = ref(null)
  let searchTimer = null

  // Qidiruvda butun panjara `n-spin` ostida yo'qolib ketmasin — indikator
  // faqat inputda aylanadi, jadval joyida qoladi.
  const searching = ref(false)
  watch(
    () => store.loading,
    (v) => {
      if (!v) searching.value = false
    }
  )

  const toggleSearch = async () => {
    searchOpen.value = !searchOpen.value
    if (searchOpen.value) {
      await nextTick()
      searchInput.value?.focus?.()
    } else if (store.params.search) {
      // Yopilganda qidiruv bekor qilinadi va ro'yxat tiklanadi.
      store.params.search = null
      store.params.page = 1
      searching.value = true
      store._index()
    }
  }

  const onSearchInput = (v) => {
    store.params.search = v || null
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      store.params.page = 1
      searching.value = true
      store._index()
    }, 400)
  }

  onBeforeUnmount(() => clearTimeout(searchTimer))

  /* ------------------------------------------------------------------------
   * Qator amallari (3 nuqta) va «Auto hisoblash».
   * ---------------------------------------------------------------------- */
  const rowMenuOptions = computed(() => [{ key: 'recalc', label: t('timesheetPage.recalc') }])

  // «Auto» tugmasi bilan bir mantiq — faqat bitta xodim uchun.
  const onRowMenu = (key) => {
    if (key === 'recalc') message.info(t('timesheetPage.autoCalcSoon'))
  }

  /* ------------------------------------------------------------------------
   * Auto hisoblash.
   *
   * Manba — ISH VAQTI grafigi (`turnstile_worker_schedules`) va tasdiqlangan
   * ta'til buyruqlari. Natija LOKAL qo'yiladi, bazaga «Saqlash» bosilganda
   * ketadi. Turniket hodisalari bo'yicha hisoblash keyingi bosqichda.
   * ---------------------------------------------------------------------- */
  const onAutoCalc = async () => {
    const res = await store.autoCalc()
    if (!res) return
    message.success(t('timesheetPage.autoCalcDone', { count: res.cells }))
  }

  // Qoidalar modali — hisoblash qanday ishlashini ko'rsatadi.
  const rulesOpen = ref(false)
  const rules = ref(null)
  const openRules = async () => {
    rulesOpen.value = true
    if (!rules.value) rules.value = await store.autoCalcRules()
  }

  // Kun tafsiloti modali — katakcha burchagidagi tugma ochadi.
  const detailOpen = ref(false)
  const detailLoading = ref(false)
  const detailTab = ref('schedule')
  const detailTabs = computed(() => [
    { id: 'schedule', name: t('timesheetPage.tabWorkTime') },
    { id: 'turnstile', name: t('timesheetPage.tabTurnstile') }
  ])
  const detail = ref(null)
  const detailTitle = ref('')

  const openDayDetail = async (item, day) => {
    const date = dayjs().year(store.year).month(store.month).date(day.day).format('YYYY-MM-DD')
    detailTitle.value = `${item.name} · ${date}`
    detailOpen.value = true
    detailLoading.value = true
    detail.value = null
    try {
      detail.value = await store.dayDetail(item.id, date)
    } finally {
      detailLoading.value = false
    }
  }

  const hm = (v) => (v ? String(v).slice(11, 16) : '—')
  const minutesToHm = (m) =>
    m == null ? '—' : `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`

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
      h(
        'div',
        { class: 'font-medium text-gray-500 whitespace-nowrap' },
        `${option.name} (${option.key})`
      )
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
          class="ts-org-select"
          disabled
          label-field="name"
          value-field="id"
        />
      </div>
      <div class="ts-field">
        <n-select
          v-model:value="store.params.department_id"
          :loading="store.departmentLoading"
          :menu-props="{ class: 'ts-dep-menu' }"
          :options="store.departmentOptions"
          :placeholder="$t('documentPage.form.department')"
          :virtual-scroll="false"
          class="ts-department-select"
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
        <n-button :loading="store.autoLoading" secondary type="info" @click="onAutoCalc">
          <template #icon>
            <n-icon :component="Wand20Filled" />
          </template>
          {{ $t('timesheetPage.autoCalcShort') }}
        </n-button>
        <n-button :title="$t('timesheetPage.autoRulesTitle')" circle quaternary @click="openRules">
          <template #icon>
            <n-icon :component="Info20Filled" />
          </template>
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
      :show="(store.loading && !searching) || store.saveLoading"
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
              <div class="ts-head ts-c-worker ts-head-search">
                <template v-if="searchOpen">
                  <n-input
                    ref="searchInput"
                    :loading="searching"
                    :placeholder="$t('timesheet.searchWorkerHint')"
                    :value="store.params.search"
                    class="ts-search-field"
                    clearable
                    size="medium"
                    @update:value="onSearchInput"
                  >
                    <template #prefix>
                      <n-icon :component="Search20Regular" size="18" />
                    </template>
                  </n-input>
                  <n-button
                    circle
                    class="ts-search-btn"
                    quaternary
                    size="medium"
                    @click="toggleSearch"
                  >
                    <template #icon>
                      <n-icon :component="Dismiss20Regular" size="18" />
                    </template>
                  </n-button>
                </template>
                <template v-else>
                  <span class="ts-head-title">{{ $t('content.worker') }}</span>
                  <n-button
                    circle
                    class="ts-search-btn"
                    quaternary
                    size="medium"
                    @click="toggleSearch"
                  >
                    <template #icon>
                      <n-icon :component="Search20Regular" size="18" />
                    </template>
                  </n-button>
                </template>
              </div>
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
                    <span class="ts-worker-sub">
                      <!-- Tabel raqami (workers.card) — lavozim oldida. -->
                      <span v-if="item?.table" class="ts-worker-badge">
                        {{ item.table }}
                      </span>
                      <span class="ts-worker-post">
                        {{ item?.position || $t('content.noAvailable') }}
                      </span>
                    </span>
                  </div>
                </div>
                <n-dropdown
                  :options="rowMenuOptions"
                  placement="bottom-start"
                  trigger="click"
                  @select="onRowMenu"
                >
                  <n-button circle class="ts-row-menu-btn" quaternary size="small">
                    <template #icon>
                      <n-icon :component="MoreVertical20Filled" size="18" />
                    </template>
                  </n-button>
                </n-dropdown>
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
                <!-- Burchakdagi tugma: shu kun uchun grafik/ta'til/turniket
                     tafsiloti. `.stop` — drag-select ishga tushmasin. -->
                <span class="ts-cell-info" @click.stop="openDayDetail(item, day)" @mousedown.stop>
                  <n-icon :component="Info20Filled" size="12" />
                </span>
                <template v-if="dayDetails(item, day)?.length">
                  <span class="ts-cell-status">
                    <template
                      v-for="(part, i) in partsOf(dayDetails(item, day), 'status')"
                      :key="`s-${i}`"
                    >
                      <span v-if="i" class="ts-sep">/</span
                      ><span :style="{ color: part.color }">{{ part.value }}</span>
                    </template>
                  </span>
                  <span class="ts-cell-hours">
                    <template
                      v-for="(part, i) in partsOf(dayDetails(item, day), 'hours')"
                      :key="`h-${i}`"
                    >
                      <span v-if="i" class="ts-sep">/</span
                      ><span :style="{ color: part.color }">{{ part.value }}</span>
                    </template>
                  </span>
                </template>
              </div>

              <div class="ts-c-total ts-c-days no-selectable-item">
                {{ item.allMonth.days || 0 }}
              </div>
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
          <label class="ts-field-label">{{ $t('timesheetPage.workTimeType') }}</label>
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
          <label class="ts-field-label">{{ $t('timesheetPage.hours') }}</label>
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
          <div class="ts-cell ts-preview-cell">
            <template v-if="previewDetails.length">
              <span class="ts-cell-status">
                <template v-for="(part, i) in partsOf(previewDetails, 'status')" :key="`ps-${i}`">
                  <span v-if="i" class="ts-sep">/</span
                  ><span :style="{ color: part.color }">{{ part.value }}</span>
                </template>
              </span>
              <span class="ts-cell-hours">
                <template v-for="(part, i) in partsOf(previewDetails, 'hours')" :key="`ph-${i}`">
                  <span v-if="i" class="ts-sep">/</span
                  ><span :style="{ color: part.color }">{{ part.value }}</span>
                </template>
              </span>
            </template>
          </div>
        </div>
      </n-form>
    </div>

    <!-- Kun tafsiloti — o'rta o'lchamli, tabli. -->
    <n-modal
      v-model:show="detailOpen"
      :title="detailTitle"
      class="ts-detail-modal"
      preset="card"
      size="small"
      style="width: 640px; max-width: 94vw"
    >
      <n-spin :show="detailLoading">
        <UISegmentTabs v-model="detailTab" :tabs="detailTabs" class="mb-4" />

        <template v-if="detailTab === 'schedule'">
          <div>
            <template v-if="detail?.schedule">
              <n-descriptions :column="1" bordered label-placement="left" size="small">
                <n-descriptions-item :label="$t('timesheetPage.workStatus')">
                  {{
                    detail.schedule.work_status === 1
                      ? $t('timesheetPage.workDay')
                      : $t('timesheetPage.restDay')
                  }}
                </n-descriptions-item>
                <n-descriptions-item :label="$t('timesheetPage.planTime')">
                  {{ (detail.schedule.start_time || '—').slice(0, 5) }} –
                  {{ (detail.schedule.end_time || '—').slice(0, 5) }}
                </n-descriptions-item>
                <n-descriptions-item :label="$t('timesheetPage.planMinutes')">
                  {{ minutesToHm(detail.schedule.daily_minutes) }}
                </n-descriptions-item>
                <n-descriptions-item :label="$t('timesheetPage.daytimeEvening')">
                  {{ minutesToHm(detail.schedule.daytime) }} /
                  {{ minutesToHm(detail.schedule.evening_time) }}
                </n-descriptions-item>
              </n-descriptions>
            </template>
            <n-empty v-else :description="$t('timesheetPage.noSchedule')" class="py-6" />

            <div class="ts-detail-result">
              <span class="ts-detail-result-label">{{ $t('timesheetPage.computed') }}</span>
              <template v-if="detail?.computed">
                <n-tag
                  :color="{ textColor: colorOfDetail({ status_id: detail.computed.status }) }"
                  round
                  size="small"
                >
                  {{ detail.computed.key }}
                </n-tag>
                <span class="ts-detail-hours"
                  >{{ detail.computed.hours }} {{ $t('timesheetPage.hours') }}</span
                >
              </template>
              <span v-else class="ts-detail-empty">{{ $t('timesheetPage.restDay') }}</span>
              <n-tag v-if="detail?.vacation_type" round size="small" type="warning">
                {{ $t('timesheetPage.byVacation') }}
              </n-tag>
              <n-tag v-else-if="detail?.is_holiday" round size="small" type="error">
                {{ detail.holiday_name }}
              </n-tag>
            </div>
          </div>
        </template>

        <template v-else>
          <div>
            <n-alert :bordered="false" class="mb-3" type="info">
              {{ $t('timesheetPage.turnstileNotUsed') }}
            </n-alert>
            <n-table v-if="detail?.events?.length" :bordered="false" size="small" striped>
              <thead>
                <tr>
                  <th>{{ $t('content.time') }}</th>
                  <th>{{ $t('timesheetPage.direction') }}</th>
                  <th>{{ $t('timesheetPage.device') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(e, i) in detail.events" :key="i">
                  <td>{{ hm(e.at) }}</td>
                  <td>
                    <n-tag :type="e.direction ? 'success' : 'default'" round size="small">
                      {{ e.direction ? $t('timesheetPage.enter') : $t('timesheetPage.exit') }}
                    </n-tag>
                  </td>
                  <td>{{ e.device_name || '—' }}</td>
                </tr>
              </tbody>
            </n-table>
            <n-empty v-else :description="$t('timesheetPage.noEvents')" class="py-6" />

            <div v-if="detail?.turnstile?.pairs?.length" class="ts-detail-result">
              <span class="ts-detail-result-label">{{ $t('timesheetPage.insideTotal') }}</span>
              <span class="ts-detail-hours">
                {{ minutesToHm(detail.turnstile.total_minutes) }}
              </span>
              <span class="ts-detail-empty">
                {{ hm(detail.turnstile.first_in) }} – {{ hm(detail.turnstile.last_out) }}
              </span>
            </div>
          </div>
        </template>
      </n-spin>
    </n-modal>

    <!-- Hisoblash qoidalari. Balandligi QAT'IY — ichki qism skrollanadi,
         aks holda ta'til jadvali 13 qator bo'lib modalni cho'zib yuborardi. -->
    <n-modal
      v-model:show="rulesOpen"
      :title="$t('timesheetPage.autoRulesTitle')"
      class="ts-rules-modal"
      preset="card"
      size="medium"
      style="width: 900px; max-width: 94vw"
    >
      <div class="ts-rules-scroll">
        <h4 class="ts-rules-head">{{ $t('timesheetPage.tabWorkTime') }}</h4>
        <div class="ts-rules-table-wrap">
          <table class="ts-rules-table">
            <thead>
              <tr>
                <th>{{ $t('timesheetPage.condition') }}</th>
                <th style="width: 160px">{{ $t('timesheetPage.workTimeType') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in rules?.schedule_rules ?? []" :key="`s-${i}`">
                <td>{{ r.condition }}</td>
                <td>
                  <span
                    v-if="r.timesheet_key"
                    :style="{ color: colorOfDetail({ status_id: r.timesheet_type }) }"
                    class="ts-rules-key"
                  >
                    {{ r.timesheet_key }}
                  </span>
                  <span v-else class="ts-rules-dash">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 class="ts-rules-head">{{ $t('timesheetPage.vacationRules') }}</h4>
        <div class="ts-rules-table-wrap">
          <table class="ts-rules-table">
            <thead>
              <tr>
                <th>{{ $t('timesheetPage.commandType') }}</th>
                <th style="width: 100px">{{ $t('timesheetPage.workTimeType') }}</th>
                <th style="width: 260px">{{ $t('content.name') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in rules?.vacation_rules ?? []" :key="r.command_type">
                <td>{{ r.command_label }}</td>
                <td>
                  <span
                    :style="{ color: colorOfDetail({ status_id: r.timesheet_type }) }"
                    class="ts-rules-key"
                  >
                    {{ r.timesheet_key }}
                  </span>
                </td>
                <td class="ts-rules-label">{{ r.timesheet_label }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<style lang="scss" scoped>
  /* O'lchamlar Figma «HRM Railway» maketidan (node 3368:103614):
     katakcha 44px, yon ustunlar 150px, karta radiusi 20px, otstuplar 16px. */
  /* O'lchamlar navbatchilik grafigi panjarasi bilan bir xil:
     kun katakchasi 60×50, № 60, o'ng jamlar 80, qator balandligi 50. */
  $cell: 60px; // kun ustuni kengligi
  $row: 50px; // qator balandligi
  $worker: 320px; // «Xodim» ustuni
  $side: 200px; // «Tabel» ustuni
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
    /* Korxona va bo'lim nomlari uzun — kengroq maydon. */
    .ts-field:has(.ts-org-select),
    .ts-field:has(.ts-department-select) {
      width: 300px;
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
    flex: 1 0 $worker;
    width: $worker;
    min-width: $worker;
    padding-left: 12px;
    text-align: left;
  }
  .ts-c-table {
    left: $num + $worker;
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
  /* Qator amallari — «Xodim» katagi ichida, o'ng chetda.
     DOIM ko'rinadi: yuzasi va chegarasi bor, aks holda tugma sezilmasdi. */
  .ts-row-menu-btn {
    flex-shrink: 0;
    margin-left: auto;
    margin-right: 4px;
    color: var(--fig-text-secondary);
    background: var(--fig-block-bg);
    transition:
      color 0.15s,
      background 0.15s;
  }
  .ts-row-menu-btn:hover {
    color: var(--primaryColor);
    background: var(--surface-line);
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
  /* Ism ostidagi qator: tabel raqami badge'i + lavozim. */
  .ts-worker-sub {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
  }
  .ts-worker-badge {
    flex-shrink: 0;
    padding: 0 4px;
    border-radius: 4px;
    font-size: 10px;
    line-height: 14px;
    font-weight: 500;
    color: var(--primaryColor);
    background: var(--primaryColorHover, rgba(51, 102, 255, 0.1));
    user-select: all;
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

  /* «Xodim» sarlavhasi — matn/input va qidiruv tugmasi bir qatorda. */
  /* Yopiq holatda matn + ikonka BIRGA markazda; qidiruv ochilganda
     input butun kenglikni oladi (`.ts-search-field { flex: 1 }`). */
  .ts-hrow .ts-c-worker.ts-head-search {
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 10px;
  }
  .ts-head-title {
    flex: 0 1 auto;
    min-width: 0;
    font-size: 13px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ts-search-field {
    flex: 1;
    min-width: 0;
  }
  .ts-search-field :deep(.n-input__border),
  .ts-search-field :deep(.n-input__state-border) {
    border-radius: 8px;
  }
  .ts-search-field :deep(.n-input-wrapper) {
    padding-inline: 8px;
  }
  .ts-search-field :deep(.n-input__prefix) {
    margin-right: 6px;
    color: var(--fig-text-secondary);
  }
  .ts-search-field :deep(.n-input__input-el) {
    font-size: 13px;
    font-weight: 400;
  }
  /* Ikonka tugma — sarlavha matni bilan bir tekis, hover'da ajralib turadi. */
  .ts-search-btn {
    flex-shrink: 0;
    color: var(--fig-text-secondary);
  }
  .ts-search-btn :deep(.n-icon) {
    font-size: 18px;
  }
  .ts-search-btn:hover {
    color: var(--primaryColor);
  }
  .ts-table-no {
    font-size: 12px;
    color: var(--fig-text-secondary);
  }

  /* Katakcha burchagidagi tafsilot tugmasi — faqat hover'da, panjara
     zichligini buzmasligi uchun kichkina. */
  .ts-cell {
    position: relative;
  }
  .ts-cell-info {
    position: absolute;
    top: 1px;
    right: 1px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    border-radius: 4px;
    color: var(--fig-text-tertiary);
    opacity: 0;
    cursor: pointer;
    transition:
      opacity 0.15s,
      color 0.15s;
  }
  .ts-cell:hover .ts-cell-info {
    opacity: 1;
  }
  .ts-cell-info:hover {
    color: var(--primaryColor);
  }

  /* ── Tafsilot va qoidalar modallari ───────────────────────────────────── */
  .ts-detail-result {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 16px;
    padding: 10px 12px;
    background: var(--fig-block-bg);
    border-radius: 10px;
  }
  .ts-detail-result-label {
    font-size: 12px;
    color: var(--fig-text-tertiary);
  }
  .ts-detail-hours {
    font-size: 14px;
    font-weight: 600;
    color: var(--fig-text-primary);
  }
  .ts-detail-empty {
    font-size: 12px;
    color: var(--fig-text-secondary);
  }
  /* Qat'iy balandlik — modal kontent uzunligiga qarab sakramaydi. */
  .ts-rules-scroll {
    height: 62vh;
    overflow-y: auto;
    padding-right: 4px;
  }
  .ts-rules-head {
    margin: 14px 0 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--fig-text-primary);
  }
  .ts-rules-head:first-child {
    margin-top: 0;
  }
  /* Tashqi ramka ALOHIDA konteynerda: `border-collapse: collapse` bilan
     jadvalning o'z chegarasi katak chiziqlariga yopishib, burchak radiusi
     va ramkaning bir qismi yo'qolardi. */
  .ts-rules-table-wrap {
    border: 1px solid var(--surface-line);
    border-radius: 10px;
    overflow: hidden;
  }
  .ts-rules-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }
  .ts-rules-table th {
    padding: 5px 10px;
    text-align: left;
    font-size: 11px;
    font-weight: 500;
    line-height: 16px;
    color: var(--fig-text-tertiary);
    background: var(--fig-block-bg);
    border-bottom: 1px solid var(--surface-line);
  }
  .ts-rules-table td {
    padding: 4px 10px;
    line-height: 17px;
    color: var(--fig-text-primary);
    border-bottom: 1px solid var(--surface-line);
  }
  .ts-rules-table th + th,
  .ts-rules-table td + td {
    border-left: 1px solid var(--surface-line);
  }
  .ts-rules-table tbody tr:last-child td {
    border-bottom: none;
  }
  .ts-rules-table tbody tr:hover td {
    background: var(--fig-block-bg);
  }
  .ts-rules-key {
    font-size: 12px;
    font-weight: 600;
  }
  .ts-rules-dash {
    color: var(--fig-text-tertiary);
  }
  .ts-rules-label {
    font-size: 11px;
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
     joylashuv kontentga qarab o'zgarmaydi — soat bo'lmasa qatori bo'sh turadi.
     Urg'u SOATDA: tabelchi avval necha soat yozilganini o'qiydi, harf esa
     turni aniqlashtiradi. */
  .ts-cell-status {
    display: block;
    height: 12px;
    line-height: 12px;
    font-size: 10px;
    font-weight: 600;
  }
  .ts-cell-hours {
    display: block;
    height: 16px;
    line-height: 16px;
    font-size: 13px;
    font-weight: 700;
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
    flex: 0 0 360px;
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

<style lang="scss">
  /* Bo'lim ro'yxati — uzun nomlar kesilmasin, keyingi qatorga tushsin.
     Menyu `body` ga teleport bo'ladi, shuning uchun global (scoped emas). */
  .ts-dep-menu.n-base-select-menu .n-base-select-option {
    height: auto;
    min-height: 34px;
    padding-block: 6px;
  }
  .ts-dep-menu.n-base-select-menu .n-base-select-option .n-base-select-option__content {
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
    line-height: 18px;
    word-break: break-word;
  }
</style>
