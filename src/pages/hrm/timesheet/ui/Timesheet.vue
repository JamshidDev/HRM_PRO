<script setup>
  import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
  import { useMessage } from 'naive-ui'
  import {
    Dismiss20Regular,
    Eye16Filled,
    Info16Regular,
    Info20Filled,
    MoreVertical20Filled,
    Search20Regular,
    Wand20Filled
  } from '@vicons/fluent'
  import { useComponentStore, useTimesheetWorkerStore } from '@/store/modules/index.js'
  import { UIDragSelector, UIPagination } from '@/components/index.js'
  import dayjs from 'dayjs'
  import Utils from '@/utils/Utils.js'
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
  const onRowMenu = async (key, item) => {
    if (key !== 'recalc' || !item?.id) return
    const res = await store.autoCalc([item.id])
    if (!res) return
    message.success(t('timesheetPage.autoCalcDone'))
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
    message.success(t('timesheetPage.autoCalcDone'))
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
  const detail = ref(null)
  // Modal sarlavhasi uchun — xodim va kun konteksti saqlanadi (matn emas,
  // OBYEKT: sarlavhada rasm, lavozim va kun holati ham ko'rsatiladi).
  const detailWorker = ref(null)
  const detailDay = ref(null)
  const detailDate = ref('')

  const openDayDetail = async (item, day) => {
    const date = dayjs().year(store.year).month(store.month).date(day.day).format('YYYY-MM-DD')
    detailWorker.value = item
    detailDay.value = day
    detailDate.value = date
    detailOpen.value = true
    detailLoading.value = true
    detail.value = null
    try {
      detail.value = await store.dayDetail(item.id, date)
    } finally {
      detailLoading.value = false
    }
  }

  // «12.05.2026 · Se» — hafta kuni sarlavhada ham ko'rinsin.
  const detailDateLabel = computed(() => {
    if (!detailDate.value) return ''
    const d = dayjs(detailDate.value)
    return `${d.format('DD.MM.YYYY')} · ${shortWeek[d.day()]}`
  })
  const detailIsRest = computed(() => Boolean(detailDay.value) && isWeekend(detailDay.value))

  // Yuqoridagi ko'rsatkich plitalari — javobning O'ZI (reja / fakt / hisob)
  // birinchi ekranda tursin, o'q va jadval esa tushuntirish bo'lib qolsin.
  const detailStats = computed(() => [
    {
      key: 'plan',
      label: t('timesheetPage.planMinutes'),
      value: minutesToHm(detail.value?.plan_minutes),
      hint: t('timesheetPage.hintPlan')
    },
    {
      key: 'fact',
      label: t('timesheetPage.factMinutes'),
      value: minutesToHm(detail.value?.fact_minutes),
      hint: t('timesheetPage.hintFact')
    },
    {
      key: 'counted',
      label: t('timesheetPage.counted'),
      value: minutesToHm(detail.value?.counted_minutes),
      accent: true,
      hint: t('timesheetPage.hintCounted')
    },
    {
      key: 'break',
      label: t('timesheetPage.breakTotal'),
      value: minutesToHm(breakMinutes.value),
      hint: t('timesheetPage.hintBreak')
    }
  ])

  // Kun sababi: ta'til buyrug'i > bayram > soat 0 sababi (backend kaliti).
  const dayReason = computed(() => {
    const d = detail.value
    if (!d) return null
    if (d.vacation_type) return { tone: 'warning', text: t('timesheetPage.byVacation') }
    if (d.is_holiday && d.holiday_name) return { tone: 'error', text: d.holiday_name }
    if (d.zero_reason) return { tone: 'warning', text: t(`timesheetPage.zero_${d.zero_reason}`) }
    return null
  })

  // Mobil ilova hodisasi (qurilma o'tishi emas) — auth_type bo'yicha.
  const isMobileEvent = (e) => String(e?.auth_type || '').toLowerCase().includes('mobile')

  const hm = (v) => (v ? String(v).slice(11, 16) : '—')
  // Hodisa vaqti ANIQ — soniyagacha.
  const exact = (v) => (v ? String(v).slice(11, 19) : '—')
  const minOfDay = (v) => {
    if (!v) return null
    const t = String(v).slice(11, 16).split(':')
    return Number(t[0]) * 60 + Number(t[1])
  }

  // O'q — QAT'IY 24 soat (00:00–24:00). Moslashuvchan oraliqdan voz kechildi:
  // kunlar bir-biri bilan taqqoslanadigan bo'lishi kerak, aks holda 4 soatlik
  // smena 12 soatlik smena bilan bir xil balandlikda chiqardi.
  const TL_FROM = 0
  const TL_TO = 1440

  const pct = (m) => ((m - TL_FROM) / (TL_TO - TL_FROM)) * 100

  const hhmmToMin = (v, endOfDay = false) => {
    if (!v) return null
    const h = Number(String(v).slice(0, 2))
    const mi = Number(String(v).slice(3, 5))
    const m = h * 60 + mi
    return endOfDay && m === 0 ? 1440 : m
  }

  // Yorliqlar orasidagi minimal masofa (o'q balandligining %): 440px da
  // ~18px — 12px shrift uchun yetarli, aks holda yaqin vaqtlar qoplanadi.
  const MIN_GAP_PCT = 4.4

  const fmtMin = (m) =>
    m == null
      ? '—'
      : `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

  /* ------------------------------------------------------------------------
   * «Reja» yo'lakchasi.
   *
   * Avval grafik vaqtlari o'q chetiga yozilgan CHIZIQLAR edi — ular faqat
   * «qachon» ni aytardi, «qancha» ni emas, va fakt bilan yonma-yon
   * taqqoslab bo'lmasdi. Endi reja ham fakt kabi ZOLAK: ish oynasi bitta
   * ustun, ichidan tushlik kesib olinadi. Ikkala ustun yonma-yon turgani
   * uchun «kech keldi / erta ketdi» bir qarashda ko'rinadi.
   * ---------------------------------------------------------------------- */
  const planBand = computed(() => {
    const w = workWindow.value
    if (!w) return null
    return {
      style: { top: `${pct(w[0])}%`, height: `${pct(w[1]) - pct(w[0])}%` },
      from: fmtMin(w[0]),
      to: fmtMin(w[1])
    }
  })

  // Tushlik reja zolagi ICHIDA chiziladi — shuning uchun foizlar oynaga
  // emas, zolakning o'ziga nisbatan hisoblanadi.
  const lunchBand = computed(() => {
    const w = workWindow.value
    const l = lunchWindow.value
    if (!w || !l) return null
    const a = Math.max(l[0], w[0])
    const b = Math.min(l[1], w[1])
    if (b <= a) return null
    const span = w[1] - w[0] || 1
    return {
      style: { top: `${((a - w[0]) / span) * 100}%`, height: `${((b - a) / span) * 100}%` },
      label: `${fmtMin(a)}–${fmtMin(b)}`
    }
  })

  // Ish intervallari — qavs: kirishdan chiqadi, pastga tushadi, chiqishga
  // qaytib kiradi. Faqat YOPILGAN juftlar (chiqishi qayd etilganlari).
  // Grafik oynasi va tushlik — hisob qoidasi UI'da ham shu chegaralardan.
  const workWindow = computed(() => {
    const sch = detail.value?.schedule
    if (!sch?.start_time) return null
    const a = hhmmToMin(sch.start_time)
    let b = hhmmToMin(sch.end_time, true) ?? 1440
    if (b <= a) b = 1440
    return [a, b]
  })
  const lunchWindow = computed(() => {
    const br = detail.value?.planned_break
    if (!br) return null
    const a = hhmmToMin(br.start_time)
    const b = hhmmToMin(br.end_time, true)
    return a != null && b != null && b > a ? [a, b] : null
  })

  // Ish intervali. Butun oraliq xira qavs bo'lib chiziladi, HISOBGA OLINGAN
  // qismlari esa ustidan to'q yashil bilan bo'yaladi — soat qayerdan
  // to'plangani ko'rinib tursin (grafikdan tashqarisi va tushlik kirmaydi).
  const workIntervals = computed(() =>
    (detail.value?.segments ?? [])
      .filter((sg) => sg.type === 'work' && sg.to)
      .map((sg) => {
        const a = minOfDay(sg.from)
        const b = minOfDay(sg.to)
        const win = workWindow.value
        const lunch = lunchWindow.value
        const parts = []
        let counted = 0
        if (win) {
          const c = Math.max(a, win[0])
          const d = Math.min(b, win[1])
          if (d > c) {
            const ranges =
              lunch && lunch[0] < d && lunch[1] > c
                ? [
                    [c, Math.min(lunch[0], d)],
                    [Math.max(lunch[1], c), d]
                  ]
                : [[c, d]]
            // ⚠️ Foizlar INTERVAL ichida hisoblanadi: `.ts-tl-iv-counted`
            // intervalning o'zi ichida joylashadi, o'qqa nisbatan emas.
            const span = b - a || 1
            for (const [x, y] of ranges) {
              if (y <= x) continue
              counted += y - x
              parts.push({
                top: `${((x - a) / span) * 100}%`,
                height: `${((y - x) / span) * 100}%`
              })
            }
          }
        }
        return {
          dur: minutesToHm(sg.minutes),
          counted: minutesToHm(counted),
          partial: counted < sg.minutes,
          parts,
          style: { top: `${pct(a)}%`, height: `${Math.max(1.2, pct(b) - pct(a))}%` }
        }
      })
  )

  // Vaqt o'qidagi nuqtalar SEGMENT chegaralaridan olinadi — backend ketma-ket
  // bir xil hodisalarda oxirgisini tanlagan, ya'ni qoida avtomatik qo'llanadi.
  // (Xom ro'yxat «Turniket» tabida to'liq ko'rinadi.)
  const eventRows = computed(() => {
    const raw = []
    for (const sg of detail.value?.segments ?? []) {
      if (sg.type === 'break') continue
      raw.push({ at: sg.from, direction: true })
      if (sg.to) raw.push({ at: sg.to, direction: false })
    }
    const byTime = new Map((detail.value?.events ?? []).map((e) => [String(e.at), e.device_name]))
    // Yaqin vaqtlar bir nuqtaga tushib yozuvlari qoplanib qolmasin — yozuv
    // PASTGA suriladi. `trueTop` esa hodisaning HAQIQIY vaqti: zolakdan
    // yozuvgacha tortiladigan bog'lovchi chiziq aynan shundan boshlanadi,
    // aks holda «bu vaqt chizmaning qayeri?» degan savol javobsiz qolardi.
    const out = []
    let last = -99
    for (const e of raw) {
      const trueTop = pct(minOfDay(e.at))
      const top = Math.max(trueTop, last + MIN_GAP_PCT)
      last = top
      out.push({
        top,
        // Bog'lovchi chiziq qutisi: yuqori cheti — HAQIQIY vaqt (zolak
        // chetiga to'g'ri keladi), pastki cheti — surilgan yozuv markazi.
        linkStyle: { top: `${trueTop}%`, height: `${top - trueTop}%` },
        time: exact(e.at),
        direction: e.direction,
        device: byTime.get(String(e.at)) ?? null
      })
    }
    return out
  })

  // Y o'qi — har 2 soatda to'liq kenglikdagi yordamchi chiziq (24 soat /
  // 2 = 13 ta yozuv). Chiziq butun maydonni kesib o'tadi: zolak qaysi
  // soatga to'g'ri kelishini ko'z bilan o'qish uchun.
  const tlTicks = computed(() => {
    const out = []
    for (let m = 0; m <= 1440; m += 120) {
      out.push({
        m,
        top: pct(m),
        label: `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:00`
      })
    }
    return out
  })

  // «Tashqarida jami» — backend hisoblaydi (`WorkTimeCalculator`), frontend
  // takrorlamaydi: panjara va modal bir xil songa tayanishi kerak.
  const breakMinutes = computed(() => detail.value?.outside_minutes ?? 0)
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
                  @select="(key) => onRowMenu(key, item)"
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
                     tafsiloti. `.stop` — drag-select ishga tushmasin.
                     ATAYLAB tugma ko'rinishida (fon + chegara + ko'z ikonkasi):
                     oldingi kichkina nuqta bosiladigan narsaga o'xshamasdi. -->
                <button
                  :title="$t('timesheetPage.dayDetail')"
                  class="ts-cell-info"
                  type="button"
                  @click.stop="openDayDetail(item, day)"
                  @mousedown.stop
                >
                  <n-icon :component="Eye16Filled" size="12" />
                </button>
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

        <!-- «Tozalash / Auto / qoidalar» — tepadagi filtr qatoridan shu yerga
             ko'chirildi: uchalasi ham panjara ustida ishlaydi. -->
        <div class="ts-bottom-actions">
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
          <n-button
            :title="$t('timesheetPage.autoRulesTitle')"
            round
            secondary
            type="info"
            @click="openRules"
          >
            <template #icon>
              <n-icon :component="Info20Filled" />
            </template>
          </n-button>
        </div>
      </n-form>
    </div>

    <!-- Kun tafsiloti.
         Tuzilishi ATAYLAB «javobdan tushuntirishga» qarab boradi:
         sarlavha (kim/qachon) → natija → ko'rsatkichlar → grafik → vaqt o'qi. -->
    <n-modal
      v-model:show="detailOpen"
      class="ts-detail-modal"
      preset="card"
      size="small"
      style="width: 1180px; max-width: 96vw"
    >
      <template #header>
        <div class="ts-dm-head">
          <n-avatar
            :fallback-src="Utils.noAvailableImage"
            :size="40"
            :src="detailWorker?.photo || Utils.noAvailableImage"
            circle
          />
          <div class="ts-dm-head-text">
            <span class="ts-dm-name">{{ detailWorker?.full_name || detailWorker?.name }}</span>
            <span class="ts-dm-sub">
              <span v-if="detailWorker?.table" class="ts-dm-badge">{{ detailWorker.table }}</span>
              <span>{{ detailWorker?.position || $t('content.noAvailable') }}</span>
            </span>
          </div>
          <!-- Kun yakuni sarlavhada: tabel kodi, bayram/ta'til belgisi va sana. -->
          <div class="ts-dm-head-meta">
            <span
              v-if="detail?.computed"
              :style="{ color: colorOfDetail({ status_id: detail.computed.status }) }"
              class="ts-dm-key"
            >
              {{ detail.computed.key }}
            </span>
            <span :class="{ 'is-rest': detailIsRest }" class="ts-dm-date">{{ detailDateLabel }}</span>
          </div>
        </div>
      </template>

      <n-spin :show="detailLoading">
        <div class="ts-dm-body">
          <!-- Tablar olib tashlandi: ish vaqti va turniket ro'yxati bir-birini
               TO'LDIRADI (o'q qoida qo'llangandan keyingi holatni, jadval esa
               xom hodisalarni ko'rsatadi), shuning uchun ular yonma-yon. -->
          <div class="ts-dm-cols">
            <div class="ts-dm-col-main">
              <!-- ② Ko'rsatkichlar — reja / fakt / hisob / tashqarida. -->
              <div class="ts-dm-stats">
                <div
                  v-for="st in detailStats"
                  :key="st.key"
                  :class="{ 'is-accent': st.accent }"
                  class="ts-dm-stat"
                >
                  <span class="ts-dm-stat-label">
                    {{ st.label }}
                    <n-popover placement="top" trigger="click" :style="{ maxWidth: '240px' }">
                      <template #trigger>
                        <button class="ts-dm-info" type="button">
                          <n-icon size="14">
                            <Info16Regular />
                          </n-icon>
                        </button>
                      </template>
                      {{ st.hint }}
                    </n-popover>
                  </span>
                  <span class="ts-dm-stat-value">{{ st.value }}</span>
                </div>
              </div>

              <!-- ③ Ish grafigi — jadval emas, ixcham yorliq/qiymat panjarasi. -->
              <section class="ts-dm-card">
                <h4 class="ts-dm-card-head">{{ $t('timesheetPage.scheduleHead') }}</h4>
                <div v-if="detail?.schedule" class="ts-dm-grid">
                  <div class="ts-dm-gi">
                    <span class="ts-dm-gi-label">{{ $t('timesheetPage.workStatus') }}</span>
                    <span class="ts-dm-gi-value">
                      <n-tag
                        :type="detail.schedule.work_status === 1 ? 'success' : 'error'"
                        class="ts-dm-tag"
                        round
                        size="small"
                      >
                        {{
                          detail.schedule.work_status === 1
                            ? $t('timesheetPage.workDay')
                            : $t('timesheetPage.restDay')
                        }}
                      </n-tag>
                    </span>
                  </div>
                  <div class="ts-dm-gi">
                    <span class="ts-dm-gi-label">{{ $t('timesheetPage.planTime') }}</span>
                    <span class="ts-dm-gi-value is-num">
                      <template v-if="detail.schedule.start_time && detail.schedule.end_time">
                        {{ detail.schedule.start_time.slice(0, 5) }} –
                        {{ detail.schedule.end_time.slice(0, 5) }}
                      </template>
                      <span v-else class="ts-dm-gi-none">
                        {{ $t('timesheetPage.notSet') }}
                      </span>
                    </span>
                  </div>
                  <div class="ts-dm-gi">
                    <span class="ts-dm-gi-label">{{ $t('timesheetPage.planMinutes') }}</span>
                    <span class="ts-dm-gi-value is-num">
                      {{ minutesToHm(detail.schedule.daily_minutes) }}
                    </span>
                  </div>
                  <!-- Grafikdagi tushlik oynasi; shablonda bo'lmasa bo'sh qoladi. -->
                  <div class="ts-dm-gi">
                    <span class="ts-dm-gi-label">{{ $t('timesheetPage.lgLunch') }}</span>
                    <span class="ts-dm-gi-value is-num">
                      <template v-if="detail?.planned_break">
                        {{ detail.planned_break.start_time.slice(0, 5) }} –
                        {{ detail.planned_break.end_time.slice(0, 5) }}
                      </template>
                      <span v-else class="ts-dm-gi-none">
                        {{ $t('timesheetPage.notSet') }}
                      </span>
                    </span>
                  </div>
                </div>
                <n-empty
                  v-else
                  :description="$t('timesheetPage.noSchedule')"
                  class="py-4"
                  size="small"
                />
              </section>

              <!-- Kun nega shunday yopilgan: ta'til/bayram yoki soat 0 sababi.
                   Sarlavhada teg edi — u yerda tafsilot sig'masdi. -->
              <section v-if="dayReason" class="ts-dm-card">
                <h4 class="ts-dm-card-head">{{ $t('timesheetPage.reasonHead') }}</h4>
                <p :class="`is-${dayReason.tone}`" class="ts-dm-reason">
                  {{ dayReason.text }}
                </p>
              </section>

              <!-- ④ Vaqt o'qi — REJA va FAKT yonma-yon ikki ustun.
                 Avval reja faqat chap chetdagi uzuq chiziqlar edi; endi u
                 ham zolak, shuning uchun «kech keldi / erta ketdi» ustunlar
                 farqidan bir qarashda ko'rinadi. -->
              <!-- Hodisa bo'lmasa ham ko'rsatiladi: grafik va tushlik bandi
                 o'zi ma'lumot beradi («nima bo'lishi kerak edi»). -->
              <section v-if="detail?.schedule || detail?.segments?.length" class="ts-dm-card">
                <h4 class="ts-dm-card-head">{{ $t('timesheetPage.timeline') }}</h4>

                <div class="ts-tl-legend">
                  <span><i class="ts-lg is-plan"></i>{{ $t('timesheetPage.lgPlan') }}</span>
                  <span><i class="ts-lg is-lunch"></i>{{ $t('timesheetPage.lgLunch') }}</span>
                  <span><i class="ts-lg is-counted"></i>{{ $t('timesheetPage.lgCounted') }}</span>
                  <span><i class="ts-lg is-raw"></i>{{ $t('timesheetPage.lgRaw') }}</span>
                </div>

                <!-- Ustun sarlavhalari — qaysi zolak nima ekani yozib qo'yiladi. -->
                <div class="ts-tl-cols">
                  <span class="ts-tl-col is-plan">{{ $t('timesheetPage.planShort') }}</span>
                  <span class="ts-tl-col is-fact">{{ $t('timesheetPage.laneFact') }}</span>
                  <span class="ts-tl-col is-ev">{{ $t('timesheetPage.eventsShort') }}</span>
                </div>

                <div class="ts-tl">
                  <!-- Soat to'ri — butun maydonni kesib o'tadi -->
                  <span
                    v-for="tick in tlTicks"
                    :key="`t-${tick.m}`"
                    :style="{ top: `${tick.top}%` }"
                    class="ts-tl-tick"
                  >
                    <span class="ts-tl-tick-label">{{ tick.label }}</span>
                  </span>

                  <!-- REJA ustuni: ish oynasi, ichidan tushlik kesilgan -->
                  <span v-if="planBand" :style="planBand.style" class="ts-tl-plan">
                    <span class="ts-tl-plan-time is-from">{{ planBand.from }}</span>
                    <span
                      v-if="lunchBand"
                      :style="lunchBand.style"
                      :title="`${$t('timesheetPage.segLunch')} ${lunchBand.label}`"
                      class="ts-tl-plan-lunch"
                    ></span>
                    <span class="ts-tl-plan-time is-to">{{ planBand.to }}</span>
                  </span>
                  <span v-else class="ts-tl-plan is-none">
                    <span class="ts-tl-plan-none">{{ $t('timesheetPage.noSchedule') }}</span>
                  </span>

                  <!-- FAKT ustuni: turniket intervallari -->
                  <span
                    v-for="(iv, i) in workIntervals"
                    :key="`iv-${i}`"
                    :style="iv.style"
                    class="ts-tl-iv"
                  >
                    <!-- Hisobga OLINGAN qismlar — to'q yashil -->
                    <span
                      v-for="(pt, j) in iv.parts"
                      :key="`p-${j}`"
                      :style="pt"
                      class="ts-tl-iv-counted"
                    ></span>
                    <span class="ts-tl-iv-dur">
                      {{ iv.counted }}
                      <i v-if="iv.partial">/ {{ iv.dur }}</i>
                    </span>
                  </span>

                  <!-- Bog'lovchi chiziq: FAKT zolagining chetidagi haqiqiy
                     vaqtdan yozuvgacha. Yozuv o'qilishi uchun pastga
                     surilgan bo'lishi mumkin — chiziq shu farqni silliq
                     bosib o'tadi.
                     TO'G'RI chiziq — burchakli «tirsak» har qanday holda ham
                     tutashish joyida notekis ko'rinardi (shtrix fazasi va
                     yarim piksel farqi). `non-scaling-stroke` esa quti
                     cho'zilganda ham shtrixni bir tekis saqlaydi. -->
                  <svg
                    v-for="(e, i) in eventRows"
                    :key="`lk-${i}`"
                    :class="e.direction ? 'is-in' : 'is-out'"
                    :style="e.linkStyle"
                    class="ts-tl-link"
                    preserveAspectRatio="none"
                    viewBox="0 0 100 100"
                  >
                    <line
                      stroke="currentColor"
                      stroke-dasharray="4 4"
                      stroke-width="1"
                      vector-effect="non-scaling-stroke"
                      x1="0"
                      x2="100"
                      y1="0"
                      y2="100"
                    />
                  </svg>

                  <!-- Turniket hodisalari — o'ngda, aniq vaqt bilan -->
                  <span
                    v-for="(e, i) in eventRows"
                    :key="`e-${i}`"
                    :class="e.direction ? 'is-in' : 'is-out'"
                    :style="{ top: `${e.top}%` }"
                    class="ts-tl-ev"
                  >
                    <span class="ts-tl-ev-dot"></span>
                    <span class="ts-tl-ev-time">{{ e.time }}</span>
                    <span class="ts-tl-ev-dir">
                      {{ e.direction ? $t('timesheetPage.enter') : $t('timesheetPage.exit') }}
                    </span>
                    <span class="ts-tl-ev-dev">{{ e.device || '—' }}</span>
                  </span>
                </div>

                <p v-if="!detail?.segments?.length" class="ts-tl-empty">
                  {{ $t('timesheetPage.noEvents') }}
                </p>
              </section>
            </div>

            <!-- O'ng ustun: turniketning XOM ro'yxati. Chapdagi o'q qoida
                 qo'llangandan keyingi natijani ko'rsatadi, bu yerda esa
                 qurilmadan kelgan hamma hodisa bor — farqi shunda. -->
            <aside class="ts-dm-col-side">
              <section class="ts-dm-card is-full">
                <div v-if="detail?.turnstile?.pairs?.length" class="ts-dm-inside">
                  <span class="ts-dm-inside-label">{{ $t('timesheetPage.tabTurnstile') }}</span>
                  <span class="ts-dm-inside-range">
                    {{ hm(detail.turnstile.first_in) }} – {{ hm(detail.turnstile.last_out) }}
                  </span>
                </div>

                <span v-if="detail?.events?.length" class="ts-dm-sub-head">
                  {{ $t('timesheetPage.eventsShort') }}
                  <span class="ts-dm-count">{{ detail.events.length }}</span>
                </span>
                <div v-if="detail?.events?.length" class="ts-dm-events">
                  <n-table :bordered="false" class="ts-dm-table" size="small">
                    <thead>
                      <tr>
                        <th>{{ $t('content.time') }}</th>
                        <th>{{ $t('timesheetPage.eventStatus') }}</th>
                        <th>{{ $t('timesheetPage.device') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(e, i) in detail.events" :key="i">
                        <!-- Soniya ham kerak: 10:58:04 chiqish va 10:58:07 kirish
                             daqiqada bir xil ko'rinib, dubl bo'lib tuyulardi. -->
                        <td>{{ exact(e.at) }}</td>
                        <td>
                          <n-tag :type="e.direction ? 'success' : 'error'" round size="small">
                            {{ e.direction ? $t('timesheetPage.enter') : $t('timesheetPage.exit') }}
                          </n-tag>
                        </td>
                        <td>
                          <span class="ts-dm-dev">{{ e.device_name || '—' }}</span>
                          <!-- Mobil ilovadan kelgan yozuv qurilma o'tishidan farqlansin. -->
                          <span v-if="isMobileEvent(e)" class="ts-dm-src">
                            {{ $t('timesheetPage.srcMobile') }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </n-table>
                </div>
                <n-empty
                  v-else
                  :description="$t('timesheetPage.noEvents')"
                  class="py-6"
                  size="small"
                />
              </section>
            </aside>
          </div>
        </div>
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

  /* Katakcha burchagidagi tafsilot tugmasi.
     Avval bu 12px ikonka edi va hover'da shunchaki YASHIL NUQTA bo'lib
     ko'rinardi — bosiladigan narsaga o'xshamasdi. Endi u haqiqiy tugma:
     o'z foni, chegarasi va ko'z ikonkasi bor, hover'da to'ladi. */
  .ts-cell {
    position: relative;
  }
  /* Katakcha ustida turganda butun katak ham belgilanadi — tugma qaysi
     kunga tegishli ekani shubhasiz bo'lsin. */
  .ts-cell:hover {
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--fig-icon-green) 55%, transparent);
  }
  .ts-cell-info {
    position: absolute;
    top: 2px;
    right: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    padding: 0;
    border: 1px solid var(--fig-icon-green);
    border-radius: 6px;
    background: var(--surface-section);
    box-shadow: 0 1px 3px rgb(16 24 40 / 18%);
    color: var(--fig-icon-green);
    opacity: 0;
    transform: scale(0.6);
    pointer-events: none;
    cursor: pointer;
    transition:
      opacity 0.12s ease,
      transform 0.12s ease,
      background 0.12s ease,
      color 0.12s ease;
  }
  .ts-cell:hover .ts-cell-info,
  .ts-cell-info:focus-visible {
    opacity: 1;
    transform: scale(1);
    pointer-events: auto;
  }
  .ts-cell-info:hover {
    background: var(--fig-icon-green);
    color: #fff;
  }
  .ts-cell-info:focus-visible {
    outline: 2px solid var(--fig-text-brand);
    outline-offset: 1px;
  }

  /* ── Tafsilot va qoidalar modallari ───────────────────────────────────── */
  /* Modal tanasi — balandligi qat'iy, o'zi skrollanmaydi: skroll HAR BIR
     ustunda alohida. Aks holda o'ngdagi qisqa ro'yxat chapdagi uzun o'q
     bilan birga sudralib, ostida katta bo'sh joy qolardi. */
  .ts-dm-body {
    height: 66vh;
  }
  /* Ikki ustun: chapda hisob-kitob, o'ngda turniketning xom ro'yxati. */
  .ts-dm-cols {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 360px;
    gap: 14px;
    height: 100%;
    align-items: stretch;
  }
  .ts-dm-col-main,
  .ts-dm-col-side {
    min-width: 0;
    height: 100%;
    /* Grid elementi sukut bo'yicha kontentdan kichraymaydi — juftliklar
       ro'yxati qo'shilgach o'ng ustun modaldan tashqariga chiqib ketardi. */
    min-height: 0;
  }
  .ts-dm-col-side {
    overflow: hidden;
  }
  .ts-dm-col-side {
    padding: 12px 14px;
    /* Chegara xiraroq — eski brauzerda to'liq rang, yangisida yarim shaffof. */
    border: 1px solid var(--surface-line);
    border-color: color-mix(in srgb, var(--surface-line) 40%, transparent);
    border-radius: 12px;
  }
  .ts-dm-col-main {
    overflow-y: auto;
    padding-right: 6px;
  }
  /* Skroll chizig'i ingichka — kontent kengligini yemasin. */
  .ts-dm-col-main::-webkit-scrollbar,
  .ts-dm-events::-webkit-scrollbar,
  .ts-rules-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .ts-dm-col-main::-webkit-scrollbar-thumb,
  .ts-dm-events::-webkit-scrollbar-thumb,
  .ts-rules-scroll::-webkit-scrollbar-thumb {
    background: var(--surface-line);
    border-radius: 3px;
  }
  /* Tor ekranda ustunlar bir-birining ostiga tushadi — u holda skroll
     yana bitta, tashqi. */
  @media (max-width: 1080px) {
    .ts-dm-body {
      overflow-y: auto;
    }
    .ts-dm-cols {
      grid-template-columns: minmax(0, 1fr);
      height: auto;
    }
    .ts-dm-col-main,
    .ts-dm-col-side {
      height: auto;
      overflow: visible;
    }
    .ts-dm-col-side {
      padding: 12px 14px;
    }
    .ts-dm-card.is-full {
      height: auto;
    }
    .ts-dm-events {
      max-height: 360px;
    }
  }

  /* Sarlavha: xodim + kun. Modal ochilishi bilan «kim, qaysi kun» ko'rinsin. */
  .ts-dm-head {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .ts-dm-head-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .ts-dm-name {
    font-size: 15px;
    font-weight: 600;
    line-height: 20px;
    color: var(--fig-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ts-dm-sub {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    font-size: 12px;
    line-height: 16px;
    color: var(--fig-text-tertiary);
  }
  /* Uzun lavozim sarlavhani buzmasin — qisqartiriladi. */
  .ts-dm-sub > span:last-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ts-dm-badge {
    flex-shrink: 0;
  }
  .ts-dm-badge {
    padding: 0 6px;
    border-radius: 5px;
    background: var(--fig-chip-brand-bg);
    color: var(--fig-chip-brand-text);
    font-size: 11px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .ts-dm-head-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    /* O'ngda modalning yopish tugmasi turadi — unga tiqilib qolmasin. */
    margin-left: auto;
    margin-right: 20px;
  }
  /* Tabel kodi — rangi status rangidan (inline style), shakli sarlavhaga mos. */
  .ts-dm-key {
    padding: 2px 10px;
    border-radius: 999px;
    background: var(--surface-ground-soft);
    font-size: 13px;
    font-weight: 700;
    line-height: 18px;
    white-space: nowrap;
  }
  .ts-dm-date {
    padding: 5px 10px;
    border-radius: 8px;
    background: var(--fig-chip-brand-bg);
    color: var(--fig-chip-brand-text);
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  /* Dam olish/bayram kuni sarlavhada ham qizil — panjaradagi kabi. */
  .ts-dm-date.is-rest {
    background: var(--fig-chip-pink-bg);
    color: var(--fig-chip-pink-text);
  }


  /* Ko'rsatkich plitalari — 4 ta ustun, tor ekranda 2 ta. */
  /* To'rt plita skrollda ham tepada qotib turadi — kunning asosiy raqamlari
     ko'zdan ketmasin. Fon shaffof bo'lsa ostidagi kontent ko'rinib qolardi. */
  .ts-dm-stats {
    position: sticky;
    top: 0;
    z-index: 2;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    padding-bottom: 10px;
    margin-bottom: 8px;
    background: var(--surface-section);
  }
  .ts-dm-stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 10px 12px;
    border: 1px solid var(--surface-line);
    border-color: color-mix(in srgb, var(--surface-line) 40%, transparent);
    border-radius: 10px;
    background: var(--surface-ground-soft);
  }
  /* Asosiy raqam — «hisobga olindi» — yashil bilan ajratiladi. */
  .ts-dm-stat.is-accent {
    background: var(--fig-chip-green-bg);
  }
  .ts-dm-stat-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    font-size: 11px;
    line-height: 14px;
    color: var(--fig-text-tertiary);
  }
  /* Izoh tugmasi — bosilganda plita nimani anglatishini tushuntiradi.
     Ikonkaning o'zi mayda, shuning uchun bosiladigan maydon kattaroq. */
  .ts-dm-info {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    margin: -3px -4px -3px 0;
    padding: 0;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--fig-text-tertiary);
    cursor: pointer;
    transition:
      color 0.15s,
      background 0.15s;
  }
  .ts-dm-info:hover,
  .ts-dm-info:focus-visible {
    background: color-mix(in srgb, var(--fig-text-tertiary) 12%, transparent);
    color: var(--fig-text-secondary);
    outline: none;
  }
  /* Urg'uli plitada ikonka ham yashil oilaga tushadi. */
  .ts-dm-stat.is-accent .ts-dm-info {
    color: color-mix(in srgb, var(--fig-chip-green-text) 70%, transparent);
  }
  .ts-dm-stat.is-accent .ts-dm-info:hover {
    color: var(--fig-chip-green-text);
    background: color-mix(in srgb, var(--fig-chip-green-text) 12%, transparent);
  }
  .ts-dm-stat-value {
    font-size: 17px;
    font-weight: 700;
    line-height: 22px;
    font-variant-numeric: tabular-nums;
    color: var(--fig-text-primary);
  }
  .ts-dm-stat.is-accent .ts-dm-stat-value {
    color: var(--fig-chip-green-text);
  }

  /* Kun sababi — «Ish grafigi» kartochkasidan keyingi izoh qatori. */
  .ts-dm-reason {
    margin: 0;
    padding: 8px 10px;
    border-radius: 8px;
    font-size: 12px;
    line-height: 16px;
  }
  .ts-dm-reason.is-warning {
    background: var(--fig-chip-amber-bg);
    color: var(--fig-chip-amber-text);
  }
  .ts-dm-reason.is-error {
    background: var(--fig-chip-pink-bg);
    color: var(--fig-chip-pink-text);
  }

  /* Bo'limlar kartochkasi. */
  /* Kartochka QUTI emas: chegara va fon yo'q — bo'limlar sarlavha va oraliq
     bilan ajraladi, ichkaridagi plitalargina fonli. */
  .ts-dm-card {
    padding: 0;
    margin-bottom: 18px;
  }
  .ts-dm-card-head {
    margin: 0 0 10px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    color: var(--fig-text-tertiary);
  }
  .ts-dm-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 16px;
  }
  .ts-dm-gi {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
    padding: 7px 10px;
    border-radius: 8px;
    background: var(--surface-ground-soft);
  }
  .ts-dm-gi-label {
    font-size: 12px;
    color: var(--fig-text-tertiary);
  }
  .ts-dm-gi-value {
    font-size: 13px;
    font-weight: 600;
    text-align: right;
    color: var(--fig-text-primary);
  }
  .ts-dm-gi-value.is-num {
    font-variant-numeric: tabular-nums;
  }
  /* Qiymat yo'q — «Belgilanmagan», raqamlardan xiraroq. */
  /* «Belgilanmagan» — ma'lumot yo'qligi belgisi, qiymat emas: eng xira. */
  .ts-dm-gi-none {
    font-size: 11px;
    font-weight: 400;
    color: var(--fig-text-tertiary);
    opacity: 0.6;
  }

  /* O'ng ustundagi kartochka butun ustun balandligini egallaydi, jadval
     esa uning ichida cho'ziladi — ostida bo'sh joy qolmaydi. */
  .ts-dm-card.is-full {
    display: flex;
    flex-direction: column;
    height: 100%;
    margin-bottom: 0;
  }
  /* «Ichkarida» yakuni — ixcham, jadval tepasida. */
  .ts-dm-inside {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 4px 8px;
    padding: 8px 10px;
    margin-bottom: 8px;
    border-radius: 8px;
    background: var(--surface-ground-soft);
  }
  .ts-dm-inside-label {
    font-size: 12px;
    color: var(--fig-text-tertiary);
  }
  .ts-dm-inside-range {
    margin-left: auto;
    font-size: 14px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--fig-text-primary);
  }
  .ts-dm-count {
    padding: 0 7px;
    border-radius: 999px;
    background: var(--surface-ground-soft);
    font-size: 11px;
    font-weight: 700;
    line-height: 17px;
    font-variant-numeric: tabular-nums;
    color: var(--fig-text-secondary);
  }
  /* Panel ichidagi kichik bo'lim sarlavhasi. */
  .ts-dm-col-side .ts-dm-inside {
    margin-top: 0;
  }
  .ts-dm-sub-head {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 12px 0 6px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    color: var(--fig-text-tertiary);
  }
  /* Qurilma nomi + manba belgisi. */
  .ts-dm-dev {
    display: block;
    font-size: 11px;
    line-height: 15px;
  }
  .ts-dm-src {
    display: inline-block;
    margin-top: 2px;
    padding: 0 6px;
    border-radius: 5px;
    background: var(--fig-chip-brand-bg);
    color: var(--fig-chip-brand-text);
    font-size: 10px;
    font-weight: 600;
    line-height: 16px;
  }

  /* Hodisalar ko'p bo'lsa jadvalning O'ZI skrollanadi — sarlavha va
     «Ichkarida» yakuni joyida qoladi. */
  .ts-dm-events {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
  /* Jadval ichida skroll bo'lgani uchun sarlavha qatori yopishib turadi. */
  .ts-dm-table :deep(th) {
    position: sticky;
    top: 0;
    z-index: 1;
    padding: 6px 10px;
    border: none;
    background: var(--surface-ground-soft);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.3px;
    text-transform: uppercase;
    color: var(--fig-text-tertiary);
  }
  .ts-dm-table :deep(th:first-child) {
    border-radius: 8px 0 0 8px;
  }
  .ts-dm-table :deep(th:last-child) {
    border-radius: 0 8px 8px 0;
  }
  .ts-dm-table :deep(td) {
    padding: 7px 10px;
    border: none;
    font-size: 13px;
    font-variant-numeric: tabular-nums;
  }
  /* Vaqt — qatordagi asosiy qiymat; holat va qurilma unga yordamchi. */
  .ts-dm-table :deep(td:first-child) {
    font-weight: 700;
  }
  .ts-dm-table :deep(td:nth-child(2)),
  .ts-dm-table :deep(td:nth-child(3)) {
    font-size: 11px;
  }
  /* naive-ui o'lchamni `--n-*` orqali beradi; o'sha o'zgaruvchilar
     komponentning o'zida e'lon qilingani uchun ularni qayta yozish yetmaydi —
     xossalarning O'ZI aniqroq selektor bilan belgilanadi. */
  .ts-dm-table :deep(.n-tag),
  .ts-dm-gi-value .n-tag {
    height: 17px;
    min-height: 17px;
    padding: 0 6px;
    font-size: 10px;
    line-height: 17px;
  }
  .ts-dm-table :deep(.n-tag__content),
  .ts-dm-gi-value .n-tag :deep(.n-tag__content) {
    line-height: 17px;
  }
  /* Qator ajratgichi o'rniga — kursor ostida yumshoq fon. */
  .ts-dm-table :deep(tbody tr:hover td) {
    background: var(--surface-ground-soft);
  }

  @media (max-width: 640px) {
    .ts-dm-stats {
      grid-template-columns: repeat(2, 1fr);
    }
    .ts-dm-grid {
      grid-template-columns: 1fr;
    }
  }
  /* ── Vaqt o'qi (24 soat) ───────────────────────────────────────────────
   * Uch ustun: REJA (grafik oynasi) — FAKT (turniket intervallari) —
   * HODISALAR ro'yxati. Reja ham fakt kabi zolak bo'lgani uchun ikkalasini
   * yonma-yon taqqoslash mumkin: kechikish/erta ketish ustunlar chetidan
   * ko'rinadi. O'q QAT'IY 24 soat, kunlar bir-biri bilan solishtirilsin.
   * ───────────────────────────────────────────────────────────────────── */
  $tlGutter: 52px; // chapda soat yozuvlari
  $tlLane: 64px; // bitta zolak kengligi
  $tlGap: 20px; // zolaklar orasi
  $tlFact: $tlLane + $tlGap; // FAKT ustunining chap cheti
  $tlFactRight: 2 * $tlLane + $tlGap; // FAKT ustunining o'ng cheti
  $tlEv: 2 * ($tlLane + $tlGap) + 72px; // hodisalar (davomiylik yorlig'idan keyin)

  /* Ustun sarlavhalari — zolaklar bilan bir vertikalda. */
  .ts-tl-cols {
    position: relative;
    height: 18px;
    margin-left: $tlGutter;
  }
  .ts-tl-col {
    position: absolute;
    top: 0;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: var(--fig-text-tertiary);
  }
  .ts-tl-col.is-plan {
    left: 0;
    width: $tlLane;
    text-align: center;
  }
  .ts-tl-col.is-fact {
    left: $tlFact;
    width: $tlLane;
    text-align: center;
  }
  .ts-tl-col.is-ev {
    left: $tlEv;
  }

  .ts-tl {
    position: relative;
    height: 440px;
    margin: 0 0 6px $tlGutter;
  }
  /* Qatlamlar: to'r → bog'lovchi chiziqlar → zolaklar → hodisa yozuvlari. */
  .ts-tl-plan,
  .ts-tl-iv {
    z-index: 2;
  }
  .ts-tl-ev {
    z-index: 3;
  }
  /* Soat to'ri — butun kenglikni kesib o'tadi, shuning uchun zolakning
     qaysi soatga tushishini chizg'ichsiz o'qish mumkin. */
  .ts-tl-tick {
    position: absolute;
    left: 0;
    right: 0;
    height: 0;
    border-top: 1px solid var(--surface-line);
    opacity: 0.45;
    z-index: 0;
  }
  .ts-tl-tick-label {
    position: absolute;
    left: -#{$tlGutter};
    top: -7px;
    width: #{$tlGutter - 10};
    text-align: right;
    font-size: 10px;
    font-variant-numeric: tabular-nums;
    color: var(--fig-text-tertiary);
  }

  /* ── REJA zolagi ─────────────────────────────────────────────────────── */
  .ts-tl-plan {
    position: absolute;
    left: 0;
    width: $tlLane;
    /* Qisqa smenada vaqt yorliqlari zolakdan tashqariga chiqib ketmasin. */
    overflow: hidden;
    border-radius: 8px;
    background: var(--fig-chip-indigo-bg);
    border: 1px solid var(--fig-chip-indigo-text);
  }
  /* Grafik yo'q kun — bo'sh, uzuq chegarali ustun. */
  .ts-tl-plan.is-none {
    top: 0;
    height: 100%;
    background: transparent;
    border-style: dashed;
    border-color: var(--surface-line);
  }
  .ts-tl-plan-none {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 120px;
    transform: translate(-50%, -50%);
    text-align: center;
    font-size: 10px;
    line-height: 13px;
    color: var(--fig-text-tertiary);
  }
  /* Boshlanish/tugash vaqti zolakning O'ZIDA — chap chetdagi uzuq
     chiziqlarga ehtiyoj qolmaydi. */
  .ts-tl-plan-time {
    position: absolute;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 11px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--fig-chip-indigo-text);
  }
  .ts-tl-plan-time.is-from {
    top: 3px;
  }
  .ts-tl-plan-time.is-to {
    bottom: 3px;
  }
  /* Tushlik — reja ichidan «kesib olingan» qiya shtrixli bo'lak. */
  .ts-tl-plan-lunch {
    position: absolute;
    left: 0;
    right: 0;
    border-top: 1px dashed var(--fig-chip-amber-text);
    border-bottom: 1px dashed var(--fig-chip-amber-text);
    background: repeating-linear-gradient(
      -45deg,
      color-mix(in srgb, var(--fig-icon-amber) 34%, transparent) 0 4px,
      transparent 4px 8px
    );
  }

  /* ── FAKT zolagi ─────────────────────────────────────────────────────── */
  /* Butun oraliq — xira yashil (ichkarida bo'lgan vaqt). */
  .ts-tl-iv {
    position: absolute;
    left: $tlFact;
    width: $tlLane;
    border: 1px solid var(--fig-icon-green);
    border-radius: 8px;
    background: color-mix(in srgb, var(--fig-icon-green) 12%, transparent);
  }
  /* Hisobga olingan qism — to'q yashil. */
  .ts-tl-iv-counted {
    position: absolute;
    left: 0;
    right: 0;
    background: color-mix(in srgb, var(--fig-icon-green) 45%, transparent);
    border-radius: 3px;
  }
  /* Davomiylik yorlig'i bog'lovchi chiziqlar bilan kesishishi mumkin —
     o'z foni bilan ularning ustida turadi. */
  .ts-tl-iv-dur {
    position: absolute;
    top: 50%;
    left: calc(100% + 6px);
    transform: translateY(-50%);
    padding: 0 4px;
    border-radius: 4px;
    background: var(--surface-section);
    font-size: 12px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    color: var(--fig-chip-green-text);
  }
  /* Xom vaqt — hisobga olingandan farq qilsa, yonida xira ko'rsatiladi. */
  .ts-tl-iv-dur i {
    font-size: 11px;
    font-style: normal;
    font-weight: 400;
    color: var(--fig-text-tertiary);
  }

  /* Izoh qatori o'qdan OLDIN turadi — ranglarni avval o'qib olish qulay. */
  .ts-tl-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 14px;
    margin-bottom: 12px;
    padding: 8px 10px;
    border-radius: 8px;
    background: var(--surface-ground-soft);
    font-size: 11px;
    color: var(--fig-text-secondary);
  }
  .ts-tl-legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .ts-lg {
    width: 14px;
    height: 10px;
    border-radius: 3px;
  }
  .ts-lg.is-counted {
    background: color-mix(in srgb, var(--fig-icon-green) 45%, transparent);
    border: 1px solid var(--fig-icon-green);
  }
  .ts-lg.is-raw {
    background: color-mix(in srgb, var(--fig-icon-green) 12%, transparent);
    border: 1px solid var(--fig-icon-green);
  }
  .ts-lg.is-plan {
    background: var(--fig-chip-indigo-bg);
    border: 1px solid var(--fig-chip-indigo-text);
  }
  .ts-lg.is-lunch {
    border: 1px dashed var(--fig-chip-amber-text);
    background: repeating-linear-gradient(
      -45deg,
      color-mix(in srgb, var(--fig-icon-amber) 34%, transparent) 0 4px,
      transparent 4px 8px
    );
  }

  /* ── Zolak ↔ hodisa bog'lovchisi ──
   * Quti HAQIQIY vaqtdan boshlanadi, balandligi esa yozuv surilgan
   * masofaga teng. Ichida uch bo'lak: yuqori gorizontal (zolakdan),
   * vertikal (surilishni bosib o'tadi) va pastki gorizontal (yozuvgacha).
   * Surilish bo'lmasa balandlik 0 — oddiy to'g'ri chiziq chiqadi. */
  .ts-tl-link {
    position: absolute;
    left: $tlFactRight;
    width: $tlEv - $tlFactRight - 3px;
    /* Surilish bo'lmasa balandlik 0% — shunda ham chiziq ko'rinsin. */
    min-height: 1px;
    /* Chekka nuqtalardagi shtrix yarmi qirqilib qolmasin. */
    overflow: visible;
    pointer-events: none;
    opacity: 0.6;
    z-index: 1;
  }
  .ts-tl-link.is-in {
    color: var(--fig-icon-green);
  }
  .ts-tl-link.is-out {
    color: var(--fig-icon-orange);
  }

  /* ── Hodisalar ro'yxati ──────────────────────────────────────────────── */
  .ts-tl-ev {
    position: absolute;
    left: $tlEv;
    right: 0;
    height: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
  }
  .ts-tl-ev-dot {
    flex-shrink: 0;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 0 3px color-mix(in srgb, currentColor 18%, transparent);
  }
  .ts-tl-ev.is-in {
    color: var(--fig-icon-green);
  }
  .ts-tl-ev.is-out {
    color: var(--fig-icon-orange);
  }
  .ts-tl-ev-time {
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--fig-text-primary);
  }
  .ts-tl-ev-dir {
    padding: 1px 7px;
    border-radius: 999px;
    background: color-mix(in srgb, currentColor 14%, transparent);
    font-size: 11px;
    font-weight: 600;
    color: currentColor;
  }
  .ts-tl-ev-dev {
    font-size: 11px;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--fig-text-tertiary);
  }

  .ts-tl-empty {
    margin: 10px 0 0;
    font-size: 12px;
    color: var(--fig-text-tertiary);
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
    font-weight: 600;
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
    font-weight: 600;
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
  /* Amal tugmalari pastki panelning O'NG chetida. */
  .ts-bottom-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
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
