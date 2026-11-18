<script setup>
  import { TIMESHEET_APPROVAL_ENABLED } from '../approval.js'
  import { h, onBeforeUnmount, onMounted, ref } from 'vue'
  import { useMessage } from 'naive-ui'
  import { confirmUnsaved, showAlert } from '@/components/notify/alertDialog.js'
  import {
    Add20Filled,
    ArrowDownload20Filled,
    Checkmark20Filled,
    Delete20Regular,
    ArrowReset20Regular,
    Dismiss20Regular,
    CheckmarkCircle16Filled,
    LockClosed20Filled,
    LockOpen20Filled,
    LockOpen16Regular,
    Send16Regular,
    Eye16Filled,
    Info16Regular,
    Info20Filled,
    MoreVertical20Filled,
    Save20Filled,
    Search20Regular,
    Wand20Filled
  } from '@vicons/fluent'
  import {
    useComponentStore,
    useTimesheetConfirmStore,
    useTimesheetWorkerStore
  } from '@/store/modules/index.js'
  import {
    UIDeleteConfirm,
    UIDepartmentSelect,
    UIDragSelector,
    UIModal,
    UIPagination,
    UISegmentTabs,
    UITable,
    UIUser
  } from '@/components/index.js'
  import dayjs from 'dayjs'
  import Utils from '@/utils/Utils.js'
  import { colorOfDetail } from './timesheetGrid.js'
  import { TIMESHEET_TYPES_WITH_HOURS } from '@/store/modules/hrm/timesheetWorkerStore.js'
  import DayDetailModal from './DayDetailModal.vue'
  import FillControls from './FillControls.vue'
  import {
    MAX_QUICK_TYPES,
    isDefaultQuickTypes,
    quickTypeIds,
    resetQuickTypes,
    toggleQuickType
  } from './quickTypes.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const message = useMessage()
  const store = useTimesheetWorkerStore()
  const compStore = useComponentStore()
  const confirmStore = useTimesheetConfirmStore()

  onMounted(() => {
    if (compStore.timesheetTypes.length === 0) {
      compStore._timesheetEnums()
    }
    store.resetAll()
  })

  /* ------------------------------------------------------------------------
   * Xodim qidiruvi — asboblar qatoridagi doim ko'rinadigan input.
   *
   * Yozilganda 400 ms debounce bilan serverga so'rov ketadi. Backend `search`
   * ni F.I.Sh. (bo'sh joy bilan ajratilgan har bir bo'lak) VA tabel raqami
   * (`workers.card`) bo'yicha qidiradi — `buildWorkerSearchCond`.
   * ---------------------------------------------------------------------- */
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

  /* «Tabel» ustuni: tabel raqami joyida tahrirlanadi, 1 soniya debounce bilan saqlanadi. */
  const tableDraft = ref({})
  const tableSaving = ref({})
  const tableTimers = {}
  const onlyDigits = (v) => /^\d*$/.test(v)
  const tableValue = (item) => tableDraft.value[item.id] ?? item.table ?? ''
  const onTableInput = (item, value) => {
    tableDraft.value[item.id] = value
    clearTimeout(tableTimers[item.id])
    tableTimers[item.id] = setTimeout(async () => {
      if ((value || null) === (item.table || null)) return
      tableSaving.value[item.id] = true
      try {
        await store.updateTableNumber(item.id, value)
        // Saqlash davomida yana yozilgan bo'lsa qoralama qoladi — keyingi saqlashni kutadi.
        if (tableDraft.value[item.id] === value) delete tableDraft.value[item.id]
      } finally {
        tableSaving.value[item.id] = false
      }
    }, 1000)
  }
  onBeforeUnmount(() => Object.values(tableTimers).forEach(clearTimeout))

  /* ------------------------------------------------------------------------
   * Qator amallari (3 nuqta) va «Auto hisoblash».
   * ---------------------------------------------------------------------- */
  const rowMenuOptions = computed(() => [
    { key: 'recalc', label: t('timesheetPage.recalc') },
    { key: 'history', label: t('timesheetPage.changes.title') }
  ])

  // «Auto» tugmasi bilan bir mantiq — faqat bitta xodim uchun.
  const onRowMenu = async (key, item) => {
    if (key === 'history' && item?.id) return openHistory(item.id)
    if (key !== 'recalc' || !item?.id) return
    confirmAutoCalc([item.id])
  }

  // Auto hisob katakni TO'LIQ almashtiradi — qo'lda kiritilgan ta'til, safar va h.k. ham
  // «K 0» / «D» bo'lib qolardi (2026-11-13 dev'da ko'rildi). To'ldirilgan katak bo'lsa avval so'raladi;
  // bo'sh tabelda (yoki bo'sh xodimda) darhol hisoblanadi. `ids` yo'q — joriy sahifadagi hamma xodim.
  const filledCellsOf = (ids) =>
    store.list
      .filter((w) => !ids || ids.includes(w.id))
      .reduce((n, w) => n + Object.values(w.days || {}).filter((d) => d?.length).length, 0)
  const runAutoCalc = async (ids = null) => {
    const res = await store.autoCalc(ids)
    if (!res) return
    message.success(t('timesheetPage.autoCalcDone'))
    if (res.checks) message.warning(t('timesheetPage.needsCheckCount', { n: res.checks }))
  }
  const confirmAutoCalc = (ids = null) => {
    const count = filledCellsOf(ids)
    if (!count) return runAutoCalc(ids)
    showAlert({
      type: 'warning',
      title: t('timesheetPage.autoOverwrite.title'),
      message: t('timesheetPage.autoOverwrite.content', { count }),
      confirmText: t('content.continue'),
      cancelText: t('content.cancel'),
      onConfirm: () => runAutoCalc(ids)
    })
  }

  /* ------------------------------------------------------------------------
   * Auto hisoblash.
   *
   * Manba — ISH VAQTI grafigi (`turnstile_worker_schedules`) va tasdiqlangan
   * ta'til buyruqlari. Natija LOKAL qo'yiladi, bazaga «Saqlash» bosilganda
   * ketadi. Turniket hodisalari bo'yicha hisoblash keyingi bosqichda.
   * ---------------------------------------------------------------------- */
  // «Форма ФТУ №3» Excel — faqat bo'lim kesimida: oynada bo'lim so'raladi.
  const exportVisible = ref(false)
  const exportDepartmentId = ref(null)
  const onDownload = () => {
    exportDepartmentId.value = store.params.department_id
    exportVisible.value = true
  }
  const onExportConfirm = async () => {
    await store._export(exportDepartmentId.value)
    exportVisible.value = false
  }

  /* ------------------------------------------------------------------------
   * Tablar: «Tabel» (panjara) va «Tabelchilar» (mas'ul xodimlar).
   * Panjara `v-show` bilan yashiriladi — tanlov va yuklangan sahifa saqlanadi.
   * ---------------------------------------------------------------------- */
  const activeTab = ref('grid')
  const mainTabs = computed(() => [
    { id: 'grid', name: t('timesheetPage.tabGrid') },
    { id: 'timekeepers', name: t('timesheetPage.tabTimekeepers') }
  ])
  // Tab almashganda ma'lumot HAR DOIM qayta o'qiladi — qulf yoki soat boshqa
  // joyda o'zgargan bo'lishi mumkin, eski keshni ko'rsatmaymiz.
  // «Qo'shish» — `TimesheetList.vue` dagi mavjud kelishuvchilar oynasini ochadi,
  // yangi forma yozilmadi. Oyna yopilgach ro'yxat qayta o'qiladi.
  const openVerifierForm = () => {
    confirmStore.elementId = store.elementId
    confirmStore.visible = true
  }
  watch(
    () => confirmStore.visible,
    (v, prev) => {
      if (prev && !v && activeTab.value === 'timekeepers') store._confirmations()
    }
  )

  // Xato qo'shilgan kelishuvchini olib tashlash. Tasdiqlaganini backend
  // bermaydi (400), shuning uchun tugma ham faqat tasdiqlamaganlarda chiqadi.
  const verifierToDelete = ref(null)
  const verifierDeleteVisible = ref(false)
  const verifierDeleteLoading = ref(false)

  const onDeleteVerifier = (row) => {
    verifierToDelete.value = row
    verifierDeleteVisible.value = true
  }
  const verifierDeleteName = computed(() => {
    const w = verifierToDelete.value?.worker ?? {}
    return [w.last_name, w.first_name, w.middle_name].filter(Boolean).join(' ')
  })
  const confirmDeleteVerifier = () => {
    verifierDeleteLoading.value = true
    store
      ._deleteConfirmation(verifierToDelete.value?.id)
      .finally(() => {
        verifierDeleteLoading.value = false
        verifierDeleteVisible.value = false
      })
  }

  // Kelishuvchilar kartochkasi ichidagi tab.
  const approverTab = ref('list')
  const approverTabs = computed(() => [
    { id: 'list', name: t('timesheetPage.verifiers') },
    { id: 'history', name: t('timesheetPage.history') }
  ])
  const onApproverTab = (v) => {
    if (v === 'history') store._confirmationHistory()
    else store._confirmations()
  }

  const onTabChange = (v) => {
    if (v === 'timekeepers') {
      store._timekeepers()
      if (TIMESHEET_APPROVAL_ENABLED) onApproverTab(approverTab.value)
    }
    else store._index()
  }
  // «Aprel 2026» — `store.month` 0 dan boshlanadi.
  const periodText = computed(() =>
    `${Utils.monthList.find((m) => m.id - 1 === store.month)?.name ?? ''} ${store.year ?? ''}`.trim()
  )

  // O'ng kartochkadagi tabel ma'lumotlari — hammasi mavjud store holatidan.
  const timesheetInfo = computed(() => {
    const holidays = store.days.filter((d) => d.is_holiday).length
    const locked = Object.keys(store.timekeeperLocks).length
    return [
      { label: t('content.organization'), value: store.organization?.name ?? '—' },
      { label: t('timesheetPage.periodLabel'), value: periodText.value },
      { label: t('timesheetPage.daysCount'), value: store.days.length },
      { label: t('timesheetPage.holidaysCount'), value: holidays },
      { label: t('timesheetPage.workersCount'), value: store.totalItems },
      { label: t('timesheetPage.timekeepersCount'), value: store.timekeeperTotal },
      { label: t('timesheetPage.lockedCount'), value: locked }
    ]
  })

  // Kelishuv holati rangi: 3 tasdiqladi, 4 rad etdi, qolgani kutilmoqda.
  // Tarix holati: 1 yaratildi, 2 yangilandi/tasdiqlandi, 3 rad etildi, 4 o'chirildi.
  const historyTagType = (id) =>
    id === 3 ? 'error' : id === 4 ? 'default' : id === 1 ? 'info' : 'success'

  const confirmationTagType = (id) =>
    id === 3 ? 'success' : id === 4 ? 'error' : id === 2 ? 'info' : 'warning'

  // Holat chipi — ro'yxatdagi «Tabel holati» ustuni bilan bir xil rang va ikonka (`Table.vue` `STATE`).
  const timesheetStatus = computed(() => {
    if (store.lock.status) {
      return { text: t('timesheetPage.accessFinished'), type: 'success', tone: 'green', icon: CheckmarkCircle16Filled }
    }
    if (store.lock.sent_at && store.lock.confirmation !== 4) {
      return { text: t('timesheetPage.accessSent'), type: 'info', tone: 'brand', icon: Send16Regular }
    }
    if (store.lock.locked) {
      return { text: t('timesheetPage.lockedTag'), type: 'warning', tone: 'amber', icon: LockClosed20Filled }
    }
    return { text: t('timesheetPage.statusOpen'), type: 'default', tone: 'neutral', icon: LockOpen16Regular }
  })
  const TONE_CLASS = {
    green: 'bg-fig-chip-green text-fig-chip-green-text',
    brand: 'bg-fig-chip-brand text-fig-chip-brand-text',
    amber: 'bg-fig-chip-amber text-fig-chip-amber-text',
    neutral: 'bg-fig-bg-disable text-fig-text-tertiary'
  }

  const departmentNames = (row) =>
    (row.departments ?? [])
      .map((d) => d?.department?.name)
      .filter(Boolean)
      .join(', ')

  const timekeeperColumns = computed(() => [
    { key: 'worker', title: t('content.worker'), minWidth: 260 },
    { key: 'departments', title: t('content.departments'), minWidth: 220 },
    // OXIRGI ustun = amal ustuni: faqat switch. `storage-key` berilmagani uchun
    // `UITable` o'zining `__actions` ustunini qo'shmaydi, ya'ni ortiqcha bo'sh
    // ustun chiqmaydi.
    { key: 'access', title: t('timesheetPage.accessColumn'), minWidth: 96, align: 'center' }
  ])

  const changeTimekeeperPage = (v) => {
    store.timekeeperParams.page = v.page
    store.timekeeperParams.per_page = v.per_page
    store._timekeepers()
  }

  // Tabelning O'ZI yopiq bo'lsa hech kim yozolmaydi — switch ham bloklanadi.
  // HR yopgan tabelda tabelchi (bo'lim boshlig'i) faqat ko'radi.
  const lockedByHr = computed(() => Boolean(store.lock.locked && store.timekeeperMode))
  const timesheetLocked = computed(
    () =>
      store.lock.status ||
      (store.lock.sent_at && store.lock.confirmation !== 4) ||
      lockedByHr.value
  )

  // Yopiq tabelda «Saqlash» o'rnida sabab ko'rsatiladi — tabelchi nega
  // yozolmayotganini tugmaning o'zidan biladi.
  const lockedActionLabel = computed(() =>
    store.lock.status
      ? t('timesheetPage.accessFinished')
      : lockedByHr.value
        ? t('timesheetPage.lockedByHr')
        : t('timesheetPage.inApproval')
  )

  // Ruxsat switch'i. Default — OCHIQ; qulflansa tabelchi SHU OY tabelini
  // o'zgartira olmaydi.
  const isOpen = (row) => !store.timekeeperLocks[row.id]
  const onToggleAccess = (row, open) => {
    store.setTimekeeperLock(row.id, !open)
  }


  const onAutoCalc = () => confirmAutoCalc()

  // O'zgarishlar tarixi (audit_logs): kim, qachon, qaysi katakni o'zgartirgan.
  const historyOpen = ref(false)
  const historyLoading = ref(false)
  const historyRows = ref([])
  const historyFilter = ref({ worker_position_id: null, day: null })
  const historyPage = ref({ page: 1, pageSize: 20, itemCount: 0 })
  const loadHistory = async () => {
    historyLoading.value = true
    try {
      const res = await store.fetchChanges({
        ...historyFilter.value,
        page: historyPage.value.page,
        per_page: historyPage.value.pageSize
      })
      historyRows.value = res.data
      historyPage.value.itemCount = res.total
    } finally {
      historyLoading.value = false
    }
  }
  const openHistory = (workerPositionId = null, day = null) => {
    historyFilter.value = { worker_position_id: workerPositionId, day }
    historyPage.value.page = 1
    historyOpen.value = true
    loadHistory()
  }
  const onHistoryFilter = () => {
    historyPage.value.page = 1
    loadHistory()
  }
  const onHistoryPage = (page) => {
    historyPage.value.page = page
    loadHistory()
  }
  const historyWorkerOptions = computed(() => store.list.map((w) => ({ label: w.name, value: w.id })))
  const historyDayOptions = computed(() => store.days.map((d) => ({ label: String(d.day), value: d.day })))
  const historyCell = (list) =>
    list.length
      ? list.map((c) =>
          h('span', { class: 'ts-hist-chip', style: ruleKeyStyle(c.status) }, cellLabel(c.type ?? '—', c.status, c.hours))
        )
      : h('span', { class: 'ts-hist-empty' }, t('timesheetPage.calcDiff.empty'))
  // Xodim / o'zgartirgan foydalanuvchi — loyihaning UIUser kartochkasi (rasm, F.I.O., lavozim yoki rol).
  const personCell = (p, position) =>
    p?.name
      ? h(UIUser, {
          short: false,
          data: {
            photo: p.photo,
            lastName: p.last_name,
            firstName: p.first_name,
            middleName: p.middle_name,
            position
          }
        })
      : h('span', { class: 'ts-hist-empty' }, '—')
  const historyColumns = computed(() => [
    { title: t('timesheetPage.changes.at'), key: 'at', width: 128, render: (r) => dayjs(r.at).format('DD.MM.YYYY HH:mm') },
    { title: t('timesheetPage.changes.worker'), key: 'worker', minWidth: 280, render: (r) => personCell(r.worker, r.worker?.position) },
    { title: t('timesheetPage.changes.day'), key: 'work_date', width: 64, render: (r) => dayjs(r.work_date).format('DD.MM') },
    { title: t('timesheetPage.changes.before'), key: 'before', width: 120, render: (r) => historyCell(r.before) },
    { title: t('timesheetPage.changes.after'), key: 'after', width: 120, render: (r) => historyCell(r.after) },
    {
      title: t('timesheetPage.calcDiff.diff'),
      key: 'diff',
      width: 64,
      render: (r) => {
        const diff = hoursOf(r.after) - hoursOf(r.before)
        if (!diff) return '—'
        return h('b', { class: diff > 0 ? 'ts-hist-more' : 'ts-hist-less' }, `${diff > 0 ? '+' : ''}${diff}`)
      }
    },
    { title: t('timesheetPage.changes.user'), key: 'user', minWidth: 260, render: (r) => personCell(r.user, r.user?.role) }
  ])

  // Qoidalar modali — hisoblash qanday ishlashini ko'rsatadi.
  const rulesOpen = ref(false)
  const rules = ref(null)
  const rulesSearch = ref('')
  const openRules = async () => {
    rulesSearch.value = ''
    rulesOpen.value = true
    if (!rules.value) rules.value = await store.autoCalcRules()
  }
  // Qidiruv: shart / buyruq turi / kod / nomi bo'yicha, katta-kichik harf farqsiz.
  const rulesMatch = (...parts) => {
    const q = rulesSearch.value.trim().toLowerCase()
    return !q || parts.some((p) => String(p ?? '').toLowerCase().includes(q))
  }
  const scheduleRules = computed(() =>
    (rules.value?.schedule_rules ?? []).filter((r) => rulesMatch(r.condition, r.timesheet_key))
  )
  const vacationRules = computed(() =>
    (rules.value?.vacation_rules ?? []).filter((r) =>
      rulesMatch(r.command_label, r.timesheet_key, r.timesheet_label)
    )
  )
  // Tez tanlov chiplari — panelda qaysi turlar turishini foydalanuvchi shu oynada tanlaydi.
  const quickTypeOptions = computed(() =>
    (compStore.timesheetTypes ?? []).filter((v) => rulesMatch(v.key, v.name))
  )
  const quickFull = computed(() => quickTypeIds.value.length >= MAX_QUICK_TYPES)
  // Kod chipi — jadvaldagi rang bilan, foni shu rangning och varianti (light + dark).
  const ruleKeyStyle = (typeId) => {
    const color = colorOfDetail({ status_id: typeId })
    return { color, background: `color-mix(in srgb, ${color} 14%, transparent)` }
  }

  /* Kun tafsiloti oynasi — katakcha burchagidagi tugma ochadi.
   * Oyna alohida komponentda: `DayDetailModal.vue` (Figma «HRM Railway» v3,
   * node 3690:66416); `worker` va `date` bo'yicha so'rovni o'zi yuboradi. */
  const detailOpen = ref(false)
  const detailWorker = ref(null)
  const detailDate = ref('')

  const openDayDetail = (item, day) => {
    detailWorker.value = item
    detailDate.value = dayjs().year(store.year).month(store.month).date(day.day).format('YYYY-MM-DD')
    detailOpen.value = true
  }

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
  // Bugungi kun sarlavhada belgilanadi — uzun oyda qayerdaligini topish oson bo'lsin.
  const isToday = (day) => {
    const now = dayjs()
    return now.year() === store.year && now.month() === store.month && now.date() === day.day
  }

  const dayDetails = (item, day) => item.days[day.day]

  // Katak nimadan farq qilishi: Auto ishlatilgan xodimda — tizim hisobidan; aks holda — bazadagi
  // (saqlangan) qiymatdan, faqat oldin TO'LDIRILGAN katak qo'lda o'zgartirilib hali saqlanmagan bo'lsa.
  // Bo'sh katak va soatsiz tur 0 soat. Saqlangach belgi yo'qoladi (doimiy tarix — backend, docs/api/timesheet-cell-changes.md).
  const hoursOf = (details) => (details ?? []).reduce((a, d) => a + (d?.hours || 0), 0)
  const typeOf = (details) => (details ?? []).map((d) => d?.status_id).filter(Boolean).join('/')
  const cellLabel = (key, statusId, hours) =>
    TIMESHEET_TYPES_WITH_HOURS.has(Number(statusId)) ? `${key}-${hours ?? 0}` : key
  const cellDiff = (item, day) => {
    const key = `${item.id}|${day.day}`
    let baseDetails
    let mode
    if (store.calcWorkers[item.id]) {
      const base = store.calcBase[key]
      baseDetails = base ? [base] : []
      mode = 'calc'
    } else {
      const before = store.savedCells[key]
      if (!before?.length || !store.pending[key]) return null
      baseDetails = before
      mode = 'saved'
    }
    const actual = dayDetails(item, day)
    const diff = hoursOf(actual) - hoursOf(baseDetails)
    if (!diff && typeOf(actual) === typeOf(baseDetails)) return null
    // Qisqa ko'rinish: «K-7», soatsiz tur faqat harf («MT»), ikki tur «K-7 / T-1».
    const label = (list) =>
      list.length
        ? list.map((d) => cellLabel(typeByIdOrNull(d.status_id)?.key ?? d.status, d.status_id, d.hours)).join(' / ')
        : t('timesheetPage.calcDiff.empty')
    const typeChanged = typeOf(actual) !== typeOf(baseDetails)
    const text = diff
      ? t(diff > 0 ? 'timesheetPage.calcDiff.more' : 'timesheetPage.calcDiff.less', { n: Math.abs(diff) }) +
        (typeChanged ? `, ${t('timesheetPage.calcDiff.typeAlso')}` : '')
      : t(actual?.length ? 'timesheetPage.calcDiff.typeOnly' : 'timesheetPage.calcDiff.cleared')
    return { mode, diff, text, system: label(baseDetails), entered: label(actual ?? []) }
  }
  // Xodim bo'yicha tizimdan jami farq: soat, ish kuni («D» sanalmaydi) va o'zgargan kataklar soni.
  // «Umumiy ish kuni» bilan bir qoida (store `isWorkDay`): soati > 0 bo'lgan kun.
  const isWorkDetails = (list) => (list ?? []).some((d) => Number(d?.hours) > 0)
  const rowDiff = (item) => {
    if (!store.calcWorkers[item.id]) return null
    let hours = 0
    let days = 0
    let cells = 0
    for (const day of store.days) {
      const d = cellDiff(item, day)
      if (!d) continue
      const base = store.calcBase[`${item.id}|${day.day}`]
      hours += d.diff
      days += Number(isWorkDetails(dayDetails(item, day))) - Number(isWorkDetails(base ? [base] : []))
      cells++
    }
    return cells ? { hours, days, cells } : null
  }
  const signed = (n) => (n > 0 ? `+${n}` : String(n))

  /**
   * Bir kunda bir nechta yozuv bo'lishi mumkin — har biri O'Z rangida chiziladi,
   * qiymatlar `/` bilan ajratiladi.
   */
  const partsOf = (details, field) =>
    (details ?? [])
      .filter((d) => d?.[field] !== null && d?.[field] !== undefined)
      .map((d) => ({ value: d[field], color: colorOfDetail(d) }))

  // Drag davom etayotganda katakcha hover'i o'chadi: yashil ramka ham,
  // «ko'rish» tugmasi ham tanlash ustidan chiqib xalaqit berardi.
  const dragging = ref(false)

  // Saqlanmagan kataklar store'da (`store.pending`) — xodim va kun bo'yicha, har biri o'z qiymati bilan.
  const pendingCount = computed(() => Object.keys(store.pending).length)

  /* ------------------------------------------------------------------------
   * Tanlov → amal.
   *
   * Avval kataklar belgilanadi (drag; Shift/Ctrl bilan qo'shib belgilanadi),
   * Panel doim ko'rinadi (tur, soat, «Tozalash»). «Qo'llash» yo'q:
   * avval harf (yoki «Tozalash»), keyin katak bosiladi / belgilanadi → darhol yoziladi.
   * Harf ham, o'chirg'ich ham tanlanmagan bo'lsa kataklar belgilanmaydi (`canSelect`).
   * Yozilgach tanlov tozalanadi (harf almashsa eski kataklar o'zgarmasin). Ilgari teskari edi — avval pastda tur tanlanar,
   * har drag darhol yozardi («cho'tka»), tanlov esa ko'rinmasdi.
   * Kalit — `${row}|${col}` (sahifadagi qator va kun indeksi); sahifa,
   * bo'lim yoki qidiruv o'zgarsa ro'yxat yangilanadi va tanlov tozalanadi.
   * ---------------------------------------------------------------------- */
  const selectedCells = ref(new Set())
  // Yopilish animatsiyasida «0» ko'rinmasin — oxirgi son saqlanadi.
  const shownSelectedCount = ref(0)
  watch(
    () => selectedCells.value.size,
    (n) => {
      if (n) shownSelectedCount.value = n
    }
  )
  const selectionAdd = ref(false)
  const isSelected = (row, col) => selectedCells.value.has(`${row}|${col}`)
  const clearSelection = () => {
    if (selectedCells.value.size) selectedCells.value = new Set()
  }
  // Harf ham, o'chirg'ich ham tanlanmagan bo'lsa — kataklar belgilanmaydi
  // (belgilangan katak bilan qiladigan ish yo'q). Avval harf, keyin kataklar.
  const canSelect = computed(
    () => !timesheetLocked.value && Boolean(store.payload.status || store.payload.isClearing)
  )
  watch(canSelect, (v) => !v && clearSelection())
  // Drag selector Shift'ni o'zi biladi, lekin bizga aytmaydi — shu yerda ushlanadi.
  const onGridMouseDown = (e) => {
    selectionAdd.value = e.shiftKey || e.ctrlKey || e.metaKey
  }
  const onSelectionChange = (items) => {
    // Yopiq tabelda belgilash yo'q (server ham 403 qaytaradi).
    if (timesheetLocked.value) return
    const next = selectionAdd.value ? new Set(selectedCells.value) : new Set()
    for (const item of items) next.add(`${item.row}|${item.col}`)
    selectedCells.value = next
    // Harf (yoki o'chirg'ich) oldindan tanlangan bo'lsa — belgilangan kataklarga darhol yoziladi.
    applySelection()
  }
  watch(() => store.list, clearSelection)
  watch(timesheetLocked, (v) => v && clearSelection())

  // Tur ID'lari ketma-ket EMAS (1,2,3,5,10,14…) — indeks bo'yicha
  // olish boshqa turni qaytaradi, shuning uchun ID bo'yicha qidiriladi.
  const canApply = computed(() => {
    if (timesheetLocked.value || !selectedCells.value.size) return false
    if (store.payload.status == null) return false
    if (typeByIdOrNull(store.payload.status)?.hours && store.payload.hours == null) return false
    if (typeByIdOrNull(store.payload.status2)?.hours && store.payload.hours2 == null) return false
    return true
  })

  // Kataklar lokal yoziladi — so'rov «Saqlash» bosilganda ketadi.
  const fillSelected = (details) => {
    for (const key of selectedCells.value) {
      const [row, col] = key.split('|').map(Number)
      store.applyLocalCell(row, col, details)
    }
  }
  // Yozilgandan keyin tanlov TOZALANADI: aks holda keyingi harf tanlanganda
  // allaqachon to'ldirilgan kataklar ham yangi harfga o'zgarib ketardi.
  const applySelection = () => {
    if (timesheetLocked.value || !selectedCells.value.size) return
    if (store.payload.isClearing) fillSelected([])
    else if (canApply.value) fillSelected(previewDetails.value)
    else return
    clearSelection()
  }
  // Bekor qiladigan narsa bormi — tanlov, harf yoki o'chirg'ich.
  const canResetFill = computed(
    () => Boolean(selectedCells.value.size || store.payload.status || store.payload.isClearing)
  )
  // «Bekor qilish» / Esc — tanlov ham, cho'tka ham bekor.
  const resetFill = () => {
    clearSelection()
    store.payload.status = null
    store.payload.hours = null
    store.payload.isClearing = false
  }
  const clearSelectedCells = () => {
    if (timesheetLocked.value || !selectedCells.value.size) return
    fillSelected([])
    clearSelection()
  }

  // Klaviatura: Delete/Backspace — tozalash, Esc — bekor.
  // Input ichida yozilayotganda (soat, qidiruv) ishlamaydi.
  const onKeydown = (e) => {
    if (activeTab.value !== 'grid') return
    const el = e.target
    if (el?.closest?.('input, textarea, [contenteditable="true"], .n-base-select-menu')) return
    if (e.key === 'Escape') resetFill()
    else if (!selectedCells.value.size) return
    else if (e.key === 'Delete' || e.key === 'Backspace') clearSelectedCells()
    else return
    e.preventDefault()
  }
  onMounted(() => window.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

  // Panel balandligi (tor ekranda 2 qatorga o'tadi) — panjara pastida shuncha joy qoladi.
  const selbarRef = ref(null)
  const selbarHeight = ref(52)
  let selbarObserver = null
  watch(selbarRef, (el) => {
    selbarObserver?.disconnect()
    selbarObserver = null
    if (!el) return
    selbarObserver = new ResizeObserver(() => {
      selbarHeight.value = el.offsetHeight
    })
    selbarObserver.observe(el)
  })
  onBeforeUnmount(() => selbarObserver?.disconnect())

  /* Pastki qatordagi sahifa oralig'i. */
  const pageRange = computed(() => {
    const { page, per_page } = store.params
    if (!store.totalItems) return '0'
    return `${(page - 1) * per_page + 1}–${Math.min(page * per_page, store.totalItems)}`
  })

  // Saqlanmagan kataklar bo'lsa yopishdan oldin so'raladi — jimgina yo'qolmasin.
  // Loyihaning umumiy ogohlantirish oynasi (`$Alert`), Naive dialog emas.
  // Fon / Esc / ✕ — tabelga qaytish (hech narsa o'zgarmaydi).
  const onClose = () => {
    if (!pendingCount.value) {
      store.visible = false
      return
    }
    // Umumiy oyna (Ta'tillar grafigi bilan bir xil): qizil «Saqlamasdan chiqish» | yashil «Saqlash va chiqish».
    confirmUnsaved({
      message: t('timesheetPage.unsaved.content', { count: pendingCount.value }),
      // Saqlash xato bersa tabel ochiq qoladi — kataklar yo'qolmaydi.
      onSave: async () => {
        try {
          await store._save()
        } catch {
          return
        }
        store.visible = false
      },
      onDiscard: () => {
        store.pending = {}
        store.visible = false
      }
    })
  }

  // Xato bo'lsa kutilayotgan kataklar o'chmaydi — tuzatib qayta saqlash mumkin.
  const onSave = async () => {
    if (!pendingCount.value) return
    await store._save()
  }

  const changePage = (v) => {
    store.resetSelection()
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  // Pastki paneldagi «namuna» katakcha — tanlov katakchaga nima yozilishini
  // aynan panjaradagi ko'rinishda ko'rsatadi.
  const typeByIdOrNull = (id) =>
    id == null ? null : (compStore.timesheetTypes?.find((v) => v.id === id) ?? null)

  const previewDetails = computed(() => {
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

</script>

<template>
  <div class="ts-root">
    <!-- ── Sarlavha kartasi (bitta qator) ──────────────────────────────────
         Chap: tab, bo'lim, qidiruv. O'ng: barcha amallar. Tashkilot nomi — pastki qatorda. -->
    <div class="ts-header">
      <div class="ts-header-main">
        <div class="ts-toolbar">
          <UISegmentTabs
            v-model="activeTab"
            :tabs="mainTabs"
            class="ts-tabs"
            @update:model-value="onTabChange"
          />
          <template v-if="activeTab === 'grid'">
            <div class="ts-department-select">
              <UIDepartmentSelect
                v-model="store.params.department_id"
                :organization="store.organizationId"
                :source="store.timekeeperMode ? 'timesheet' : 'tree'"
                :placeholder="$t('timesheetPage.allDepartments')"
                @update:model-value="store.applyFilters"
              />
            </div>
            <n-input
              :loading="searching"
              :placeholder="$t('timesheet.searchWorkerHint')"
              :value="store.params.search"
              class="ts-search-field"
              clearable
              @update:value="onSearchInput"
            >
              <template #prefix>
                <n-icon :component="Search20Regular" size="18" />
              </template>
            </n-input>
          </template>
        </div>
      </div>

      <div class="ts-header-actions">
        <n-button
          v-if="activeTab === 'grid'"
          :disabled="timesheetLocked"
          :loading="store.autoLoading"
          secondary
          type="primary"
          @click="onAutoCalc"
        >
          <template #icon>
            <n-icon :component="Wand20Filled" />
          </template>
          {{ $t('timesheetPage.autoCalcShort') }}
        </n-button>
        <n-button secondary type="info" @click="openRules">
          <template #icon>
            <n-icon :component="Info20Filled" />
          </template>
          {{ $t('timesheetPage.infoShort') }}
        </n-button>
        <n-button secondary type="success" @click="onDownload">
          <template #icon>
            <n-icon :component="ArrowDownload20Filled" />
          </template>
          {{ $t('content.download') }}
        </n-button>
        <span class="ts-header-divider" />
        <n-button secondary type="error" @click="onClose">
          <template #icon>
            <n-icon :component="Dismiss20Regular" />
          </template>
          {{ $t('content.close') }}
        </n-button>
        <n-button
          v-if="activeTab === 'grid' && timesheetLocked"
          :type="timesheetStatus.type"
          disabled
          secondary
        >
          <template #icon>
            <n-icon :component="LockClosed20Filled" />
          </template>
          {{ lockedActionLabel }}
        </n-button>
        <!-- O'chiq «Saqlash» sababini tooltip aytadi (o'chiq tugma hover'ni ushlamaydi — span ichida). -->
        <n-tooltip v-else-if="activeTab === 'grid'" :disabled="Boolean(pendingCount)">
          <template #trigger>
            <span class="inline-flex">
              <n-button
                :loading="store.saveLoading"
                :disabled="!pendingCount"
                type="primary"
                @click="onSave"
              >
                <template #icon>
                  <n-icon :component="Save20Filled" />
                </template>
                {{ $t('content.save') }}{{ pendingCount ? ` (${pendingCount})` : '' }}
              </n-button>
            </span>
          </template>
          {{ $t('timesheetPage.saveHint') }}
        </n-tooltip>
      </div>
    </div>

    <!-- ── Tabelchilar: boshqa sahifalardagi kabi `UITable` ─────────────── -->
    <div v-if="activeTab === 'timekeepers'" class="ts-body ts-keepers">
      <div class="ts-keepers-table">
        <!-- Switch nima qilishi — jadval ustida bir qator izoh. -->
        <p class="ts-keepers-hint">
          <n-icon :component="Info16Regular" size="16" />
          {{ $t('timesheetPage.accessHint') }}
        </p>
        <UITable
          :columns="timekeeperColumns"
          :data="store.timekeeperList"
          :loading="store.timekeeperLoading"
          :page="store.timekeeperParams.page"
          :per-page="store.timekeeperParams.per_page"
          :total="store.timekeeperTotal"
          @change-page="changeTimekeeperPage"
        >
          <template #cell-worker="{ row }">
            <UIUser
              :data="{
                photo: row?.worker?.photo,
                firstName: row?.worker?.first_name,
                middleName: row?.worker?.middle_name,
                lastName: row?.worker?.last_name,
                position: row?.position_name
              }"
              :short="false"
            />
          </template>

          <!-- Bo'lim nomlari matn bo'lib (ilgari faqat son badge'i edi); uzun bo'lsa kesiladi, to'liq — title'da. -->
          <template #cell-departments="{ row }">
            <span v-if="row.departments?.length" :title="departmentNames(row)" class="ts-keeper-deps">
              {{ departmentNames(row) }}
            </span>
            <span v-else class="text-textColor3">{{ $t('timesheetPage.noDepartments') }}</span>
          </template>

          <template #empty>
            <n-empty :description="$t('timesheetPage.timekeeperEmpty')" class="py-10" />
          </template>

          <template #cell-access="{ row }">
            <n-tooltip>
              <template #trigger>
                <span class="inline-flex">
                  <n-switch
                    :class="['ts-access-switch', isOpen(row) ? 'is-open' : 'is-locked']"
                    :disabled="timesheetLocked"
                    :value="isOpen(row)"
                    size="large"
                    @update:value="(v) => onToggleAccess(row, v)"
                  >
                    <template #checked-icon>
                      <n-icon :component="LockOpen20Filled" />
                    </template>
                    <template #unchecked-icon>
                      <n-icon :component="LockClosed20Filled" />
                    </template>
                  </n-switch>
                </span>
              </template>
              {{ $t('timesheetPage.accessHint') }}
            </n-tooltip>
          </template>
        </UITable>
      </div>

      <!-- O'ng yarmi — ikkita kartochka ustma-ust. -->
      <div class="ts-keepers-side">
        <div class="ts-info-card">
          <div class="ts-info-head">
            <span class="ts-info-title">{{ $t('timesheetPage.timesheetInfo') }}</span>
            <span :class="TONE_CLASS[timesheetStatus.tone]" class="ts-state-chip">
              <n-icon :component="timesheetStatus.icon" size="14" />
              {{ timesheetStatus.text }}
            </span>
          </div>
          <div v-for="row in timesheetInfo" :key="row.label" class="ts-info-row">
            <span class="ts-info-label">{{ row.label }}</span>
            <span class="ts-info-value">{{ row.value }}</span>
          </div>
        </div>

        <!-- Kelishuvchilar / Tarix — ichki tabli kartochka. -->
        <div v-if="TIMESHEET_APPROVAL_ENABLED" class="ts-info-card ts-approvers-card">
          <div class="ts-info-head">
            <UISegmentTabs
              v-model="approverTab"
              :tabs="approverTabs"
              @update:model-value="onApproverTab"
            />
            <div class="ts-approvers-actions">
              <n-button
                v-if="approverTab === 'list' && !timesheetLocked"
                type="primary"
                @click="openVerifierForm"
              >
                <template #icon>
                  <n-icon :component="Add20Filled" />
                </template>
                {{ $t('content.add') }}
              </n-button>
            </div>
          </div>

          <div class="ts-approvers-body">
            <template v-if="approverTab === 'history'">
              <div v-if="!store.historyList.length" class="ts-approvers-empty">
                {{ $t('timesheetPage.historyEmpty') }}
              </div>
              <div v-for="log in store.historyList" :key="log.id" class="ts-approver">
                <UIUser
                  :data="{
                    photo: log?.worker?.photo,
                    firstName: log?.worker?.first_name,
                    middleName: log?.worker?.middle_name,
                    lastName: log?.worker?.last_name,
                    position: log?.description || log?.status?.name
                  }"
                  :short="false"
                />
                <div class="ts-history-meta">
                  <n-tag :bordered="false" :type="historyTagType(log?.status?.id)" round size="small">
                    {{ log?.status?.name }}
                  </n-tag>
                  <span class="ts-history-date">{{ log?.created_at }}</span>
                </div>
              </div>
            </template>

            <template v-else>
              <div v-if="!store.confirmationList.length" class="ts-approvers-empty">
                {{ $t('timesheetPage.verifiersEmpty') }}
              </div>
              <div v-for="c in store.confirmationList" :key="c.id" class="ts-approver">
                <UIUser
                  :data="{
                    photo: c?.worker?.photo,
                    firstName: c?.worker?.first_name,
                    middleName: c?.worker?.middle_name,
                    lastName: c?.worker?.last_name,
                    position: c?.position
                  }"
                  :short="false"
                />
                <div class="ts-approver-meta">
                  <n-tag
                    :bordered="false"
                    :type="confirmationTagType(c?.status?.id)"
                    round
                    size="small"
                  >
                    {{ c?.status?.name }}
                  </n-tag>
                  <n-button
                    v-if="c?.status?.id !== 3 && !timesheetLocked"
                    :title="$t('content.delete')"
                    circle
                    class="ts-approver-del"
                    secondary
                    size="small"
                    type="error"
                    @click="onDeleteVerifier(c)"
                  >
                    <template #icon>
                      <n-icon :component="Delete20Regular" />
                    </template>
                  </n-button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Kelishuvchini olib tashlash — loyihaning umumiy tasdiq modali. -->
    <UIDeleteConfirm
      v-model:visible="verifierDeleteVisible"
      :title="verifierDeleteName"
      :warning="$t('timesheetPage.verifierDeleteConfirm')"
      :loading="verifierDeleteLoading"
      @confirm="confirmDeleteVerifier"
    />

    <n-spin
      v-show="activeTab === 'grid'"
      :show="(store.loading && !searching) || store.saveLoading"
      class="ts-body"
      content-class="ts-body-content"
    >
      <!-- ── Panjara kartasi: maketda 20px radius + 4px ichki otstup ──────── -->
      <div class="ts-card">
        <UIDragSelector
          :class="{ 'ts-dragging': dragging, 'has-selbar': !timesheetLocked }"
          :style="{ '--selbar-h': `${selbarHeight}px` }"
          :disabled="!canSelect"
          class="ts-scroll"
          @mousedown.capture="onGridMouseDown"
          :live-selection="false"
          :scroll-zone-left="300"
          :scroll-zone-right="88"
          :scroll-zone-top="44"
          @selection-change="onSelectionChange"
          @selection-end="dragging = false"
          @selection-start="dragging = true"
        >
          <div class="ts-grid">
            <!-- Sarlavha qatori — skrollda tepada yopishib qoladi. -->
            <div class="ts-hrow no-selectable-item">
              <div class="ts-head ts-c-num">№</div>
              <div class="ts-head ts-c-worker ts-head-search">
                <span class="ts-head-title">{{ $t('content.worker') }}</span>
              </div>
              <div class="ts-head ts-c-table">{{ $t('timesheet.name') }}</div>
              <div
                v-for="day in store.days"
                :key="`h-${day.day}`"
                :class="{ 'is-weekend': isWeekend(day), 'is-today': isToday(day) }"
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
                    <span :title="item.full_name || item.name" class="ts-worker-name">{{ item.name }}</span>
                    <span class="ts-worker-sub">
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

              <div class="ts-c-table ts-c-table-edit no-selectable-item" @mousedown.stop>
                <!-- `loading` false bo'lsa ham Naive o'ngda spinner joyini qoldiradi — saqlanmayotganda undefined. -->
                <n-input
                  :allow-input="onlyDigits"
                  :disabled="timesheetLocked"
                  :loading="tableSaving[item.id] || undefined"
                  :maxlength="20"
                  :placeholder="$t('timesheetPage.tableNoPh')"
                  :value="tableValue(item)"
                  class="ts-table-input"
                  size="small"
                  @update:value="(v) => onTableInput(item, v)"
                />
              </div>

              <div
                v-for="(day, col) in store.days"
                :key="col"
                :class="{
                  'is-weekend': isWeekend(day),
                  'is-rest': !dayDetails(item, day)?.length && isWeekend(day),
                  'is-empty': !dayDetails(item, day)?.length && !isWeekend(day),
                  'is-edited': cellDiff(item, day),
                  'is-check': store.calcBase[`${item.id}|${day.day}`]?.needs_check,
                  'is-selected': isSelected(row, col)
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
                  class="ts-cell-info no-selectable-item"
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
                <span
                  v-if="store.nightCont[`${item.id}|${day.day}`]"
                  :title="$t('timesheetPage.nightContCell')"
                  class="ts-cell-cont"
                >
                  ↳
                </span>
                <template v-if="cellDiff(item, day)">
                  <span class="ts-edit-mark" />
                  <span
                    :class="{
                      'is-start': col < 3,
                      'is-end': col > store.days.length - 4,
                      'is-below': row === 0
                    }"
                    class="ts-diff-tip no-selectable-item"
                  >
                    <b>
                      {{
                        $t(cellDiff(item, day).mode === 'saved' ? 'timesheetPage.calcDiff.before' : 'timesheetPage.calcDiff.system')
                      }}:
                    </b>
                    {{ cellDiff(item, day).system }}<br />
                    <b>{{ $t('timesheetPage.calcDiff.entered') }}:</b> {{ cellDiff(item, day).entered }}<br />
                    <b>{{ $t('timesheetPage.calcDiff.diff') }}:</b> {{ cellDiff(item, day).text }}
                    <template v-if="cellDiff(item, day).mode === 'saved'">
                      <br /><i class="ts-diff-note">{{ $t('timesheetPage.calcDiff.unsaved') }}</i>
                    </template>
                  </span>
                </template>
              </div>

              <div class="ts-c-total ts-c-days no-selectable-item">
                {{ item.allMonth.days || 0 }}
                <span
                  v-if="rowDiff(item)?.days"
                  :class="rowDiff(item).days > 0 ? 'is-more' : 'is-less'"
                  :title="$t('timesheetPage.changes.rowDiff', { cells: rowDiff(item).cells })"
                  class="ts-total-diff"
                  @click.stop="openHistory(item.id)"
                >
                  {{ signed(rowDiff(item).days) }}
                </span>
              </div>
              <div class="ts-c-total ts-c-hours no-selectable-item">
                {{ item.allMonth.hours || 0 }}
                <span
                  v-if="rowDiff(item)?.hours"
                  :class="rowDiff(item).hours > 0 ? 'is-more' : 'is-less'"
                  :title="$t('timesheetPage.changes.rowDiff', { cells: rowDiff(item).cells })"
                  class="ts-total-diff"
                  @click.stop="openHistory(item.id)"
                >
                  {{ signed(rowDiff(item).hours) }}
                </span>
              </div>
            </div>
          </div>
          <!-- Bo'sh holat: bo'limda xodim yo'q yoki qidiruv hech narsa topmadi. -->
          <n-empty
            v-if="!store.loading && !store.list.length"
            :description="$t('timesheetPage.gridEmpty')"
            class="ts-grid-empty no-selectable-item"
          >
            <template #extra>
              <span class="text-xs text-textColor3">{{ $t('timesheetPage.gridEmptyHint') }}</span>
            </template>
          </n-empty>
        </UIDragSelector>

        <!-- ── Tanlov paneli: belgilangan kataklarga nima yozilishi ─────────
             Doim ko'rinadi (ochiq tabelda): harf → katak yoki katak → harf. -->
        <Transition name="ts-selbar">
          <div v-if="!timesheetLocked" ref="selbarRef" class="ts-selbar no-selectable-item">
            <!-- Hisoblagich silliq ochiladi / yopiladi — panel kengligi sakramasin. -->
            <Transition name="ts-selbar-lead">
              <div v-if="selectedCells.size" class="ts-selbar-lead">
                <div class="ts-selbar-count">
                  <b>{{ shownSelectedCount }}</b>
                  <span>{{ $t('timesheetPage.selectedLabel') }}</span>
                </div>
                <span class="ts-selbar-divider" />
              </div>
            </Transition>
            <FillControls
              :has-selection="Boolean(selectedCells.size)"
              :preview-details="previewDetails"
              @pick="applySelection"
            >
              <template #end>
                <!-- ✕ «yopish»ga o'xshardi — endi matnli «Bekor qilish» (tanlov + harf + o'chirg'ich). -->
                <n-tooltip :delay="300">
                  <template #trigger>
                    <n-button :disabled="!canResetFill" tertiary @click="resetFill">
                      <template #icon>
                        <n-icon :component="ArrowReset20Regular" />
                      </template>
                      {{ $t('content.cancel') }}
                    </n-button>
                  </template>
                  {{ $t('timesheetPage.selectionKeys') }}
                </n-tooltip>
              </template>
            </FillControls>
          </div>
        </Transition>
      </div>
    </n-spin>

    <!-- ── Pastki qator: chapda tashkilot nomi, o'ngda sahifalash ── -->
    <div v-show="activeTab === 'grid'" class="ts-footer">
      <span :title="store.organization?.name" class="ts-title-name">
        {{ store.organization?.name || '—' }}
      </span>
      <div class="ts-footer-pages">
        <span class="ts-footer-range">
          <b>{{ pageRange }}</b> / {{ store.totalItems }}
        </span>
        <UIPagination
          :page="store.params.page"
          :per_page="store.params.per_page"
          :show-size-picker="false"
          :total="store.totalItems"
          short
          @change-page="changePage"
        />
      </div>
    </div>

    <!-- Kun tafsiloti.
         Tuzilishi ATAYLAB «javobdan tushuntirishga» qarab boradi:
         sarlavha (kim/qachon) → natija → ko'rsatkichlar → grafik → vaqt o'qi. -->
    <UIModal
      v-model:visible="exportVisible"
      :title="$t('timesheetPage.exportTitle')"
      :width="420"
    >
      <n-form-item :label="$t('documentPage.form.department')" :show-feedback="false">
        <UIDepartmentSelect
          v-model="exportDepartmentId"
          :organization="store.organizationId"
          :source="store.timekeeperMode ? 'timesheet' : 'tree'"
          :placeholder="$t('timesheetPage.exportNeedDepartment')"
        />
      </n-form-item>
      <!-- Boshqa forma oynalari kabi: «Bekor qilish | Yuklash». -->
      <div class="flex gap-3 pt-4">
        <n-button class="flex-1" @click="exportVisible = false">{{ $t('content.cancel') }}</n-button>
        <n-button
          :disabled="!exportDepartmentId"
          :loading="store.exportLoading"
          class="flex-1"
          type="primary"
          @click="onExportConfirm"
        >
          <template #icon>
            <n-icon :component="ArrowDownload20Filled" />
          </template>
          {{ $t('content.download') }}
        </n-button>
      </div>
    </UIModal>

    <DayDetailModal
      v-model:date="detailDate"
      v-model:visible="detailOpen"
      :worker="detailWorker"
    />

    <!-- Hisoblash qoidalari. Balandligi QAT'IY — ichki qism skrollanadi,
         aks holda ta'til jadvali 13 qator bo'lib modalni cho'zib yuborardi. -->
    <UIModal v-model:visible="historyOpen" :title="$t('timesheetPage.changes.title')" :width="1240">
      <div class="ts-hist-filters">
        <n-select
          v-model:value="historyFilter.worker_position_id"
          :options="historyWorkerOptions"
          :placeholder="$t('timesheetPage.changes.allWorkers')"
          clearable
          filterable
          @update:value="onHistoryFilter"
        />
        <n-select
          v-model:value="historyFilter.day"
          :options="historyDayOptions"
          :placeholder="$t('timesheetPage.changes.allDays')"
          clearable
          style="width: 170px"
          @update:value="onHistoryFilter"
        />
      </div>
      <n-data-table
        :columns="historyColumns"
        :data="historyRows"
        :loading="historyLoading"
        :max-height="520"
        :pagination="historyPage"
        :row-key="(r) => `${r.at}|${r.worker?.id}|${r.work_date}`"
        remote
        size="small"
        @update:page="onHistoryPage"
      />
    </UIModal>

    <UIModal
      v-model:visible="rulesOpen"
      :title="$t('timesheetPage.autoRulesTitle')"
      :width="900"
    >
      <n-input
        v-model:value="rulesSearch"
        :placeholder="$t('timesheetPage.rulesSearch')"
        class="mb-3"
        clearable
        round
      >
        <template #prefix>
          <n-icon :component="Search20Regular" />
        </template>
      </n-input>
      <n-spin :show="!rules" class="ts-rules-scroll">
        <!-- Tanlov panelidagi tez tur chiplari: bosib qo'shiladi / olib tashlanadi -->
        <template v-if="quickTypeOptions.length">
          <div class="ts-quick-head">
            <h4 class="ts-rules-head">{{ $t('timesheetPage.quickTypesTitle') }}</h4>
            <n-button
              v-if="!isDefaultQuickTypes"
              size="tiny"
              quaternary
              type="primary"
              @click="resetQuickTypes"
            >
              {{ $t('timesheetPage.quickTypesReset') }}
            </n-button>
          </div>
          <p class="ts-quick-hint">
            {{ $t('timesheetPage.quickTypesHint', { max: MAX_QUICK_TYPES }) }}
          </p>
          <div class="ts-quick-grid">
            <button
              v-for="type in quickTypeOptions"
              :key="type.id"
              :class="{ 'is-on': quickTypeIds.includes(type.id) }"
              :disabled="quickFull && !quickTypeIds.includes(type.id)"
              class="ts-quick-item"
              type="button"
              @click="toggleQuickType(type.id)"
            >
              <span :style="ruleKeyStyle(type.id)" class="ts-rules-key">{{ type.key }}</span>
              <span class="ts-quick-name">{{ type.name }}</span>
              <n-icon
                v-if="quickTypeIds.includes(type.id)"
                :component="Checkmark20Filled"
                class="ts-quick-check"
              />
            </button>
          </div>
        </template>

        <template v-if="scheduleRules.length">
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
                <tr v-for="(r, i) in scheduleRules" :key="`s-${i}`">
                  <td>{{ r.condition }}</td>
                  <td>
                    <span
                      v-if="r.timesheet_key"
                      :style="ruleKeyStyle(r.timesheet_type)"
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
        </template>

        <template v-if="vacationRules.length">
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
                <tr v-for="r in vacationRules" :key="r.command_type">
                  <td>{{ r.command_label }}</td>
                  <td>
                    <span :style="ruleKeyStyle(r.timesheet_type)" class="ts-rules-key">
                      {{ r.timesheet_key }}
                    </span>
                  </td>
                  <td class="ts-rules-label">{{ r.timesheet_label }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <div
          v-if="rules && !quickTypeOptions.length && !scheduleRules.length && !vacationRules.length"
          class="py-10 text-center text-sm text-textColor3"
        >
          {{ $t('timesheetPage.rulesNotFound') }}
        </div>
      </n-spin>
    </UIModal>
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
  $side: 132px; // «Tabel» ustuni (raqam inputi uchun yetarli)
  $total: 80px; // «Kun» va «Soat»
  $num: 60px; // tartib raqami

  .ts-root {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    /* Dashboard bilan bir xil fon — segment tab yo'lagi (kulrang) ajralib turadi. */
    background: var(--app-bg);
    overflow: hidden;
  }

  /* ── Yorliqli maydon (filtrlar va pastki panel uchun umumiy) ──────────── */
  .ts-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  /* ── Tablar va «Tabelchilar» ro'yxati ─────────────────────────────────── */
  /* Filtr qatorining birinchi elementi — kengligi mazmuniga qarab. */
  .ts-tabs {
    flex: 0 0 auto;
  }
  /* Tabelchilar tabi ikkiga bo'linadi: chapda jadval, o'ngda ma'lumot. */
  .ts-keepers {
    display: flex;
    gap: 16px;
    min-height: 0;
  }
  .ts-keepers-table {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-width: 0;
    min-height: 0;
  }
  .ts-keepers-side {
    display: flex;
    /* Ma'lumot kartochkasi ixcham — jadval qolgan kenglikni oladi (ilgari 50/50, o'ng tomon bo'sh qolardi). */
    flex: 0 0 380px;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
    min-height: 0;
  }
  .ts-info-card {
    flex: 0 0 auto;
    width: 100%;
    min-width: 0;
    padding: 16px;
    border-radius: 16px;
    background: var(--fig-block-bg);
  }
  .ts-info-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 12px;
  }
  .ts-info-title {
    font-size: 15px;
    font-weight: 600;
  }
  .ts-info-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    padding: 8px 0;
    border-bottom: 1px solid var(--table-border);
  }
  .ts-info-row:last-child {
    border-bottom: none;
  }
  .ts-info-label {
    font-size: 13px;
    color: var(--fig-text-tertiary);
  }
  .ts-info-value {
    font-weight: 600;
    text-align: right;
  }
  /* Kelishuvchilar kartochkasi qolgan balandlikni to'liq egallaydi,
     ro'yxat esa uning ICHIDA skrollanadi. */
  .ts-approvers-card {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }
  .ts-approvers-body {
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
  }
  .ts-approvers-actions {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 12px;
  }
  .ts-approver-meta {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 8px;
  }
  /* O'chirish tugmasi ro'yxatni chalg'itmasin — xira turadi, qator ustiga
     kelganda to'liq ko'rinadi. Klaviatura fokusida ham ochiladi. */
  .ts-approver-del {
    opacity: 0.35;
    transition: opacity 0.18s ease;
  }
  .ts-approver:hover .ts-approver-del,
  .ts-approver-del:focus-visible {
    opacity: 1;
  }
  .ts-history-meta {
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }
  .ts-history-date {
    font-size: 11px;
    color: var(--fig-text-tertiary);
  }
  .ts-approvers-empty {
    padding: 8px 0;
    font-size: 13px;
    color: var(--fig-text-tertiary);
  }
  .ts-approver {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid var(--table-border);
  }
  /* Xodim bloki qolgan joyni oladi, teg qisqarmaydi. */
  .ts-approver :deep(.ui__user-component) {
    flex: 1 1 auto;
    min-width: 0;
  }
  .ts-approver :deep(.ui__user-component > div:last-child) {
    width: auto;
    flex: 1 1 auto;
    min-width: 0;
  }
  /* `UIUser` ismni `truncate` bilan kesadi — kartochkada joy bor, o'ralsin. */
  .ts-approver :deep(.ui__user-component .truncate) {
    overflow: visible;
    white-space: normal;
    text-overflow: clip;
  }
  .ts-approver :deep(.n-tag) {
    flex: 0 0 auto;
  }
  .ts-approver:last-child {
    border-bottom: none;
  }
  /* Tabelchi bo'limlari — bir qatorda, uzun bo'lsa kesiladi. */
  .ts-keeper-deps {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ts-keepers-hint {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    margin: 0 0 12px;
    font-size: 13px;
    color: var(--fig-text-tertiary);
  }
  /* Ruxsat switch'i: rail — xira ton, tugmacha — to'q rang, qulf ikonkasi OQ.
     Standart holatda ikonka oq tugmacha ichida qora bo'lib chiqardi. */
  .ts-access-switch :deep(.n-switch__button) {
    color: #fff;
  }
  .ts-access-switch :deep(.n-switch__button-placeholder),
  .ts-access-switch :deep(.n-switch__button .n-icon) {
    color: #fff;
  }
  /* `large` tugmacha kattaroq — ikonka ham u bilan mutanosib bo'lsin. */
  .ts-access-switch :deep(.n-switch__button .n-icon) {
    font-size: 18px;
  }
  .ts-access-switch.is-open :deep(.n-switch__rail) {
    background-color: color-mix(in srgb, var(--fig-icon-green) 28%, transparent) !important;
  }
  .ts-access-switch.is-open :deep(.n-switch__button) {
    background-color: var(--fig-icon-green);
  }
  .ts-access-switch.is-locked :deep(.n-switch__rail) {
    background-color: color-mix(in srgb, var(--fig-icon-red) 28%, transparent) !important;
  }
  .ts-access-switch.is-locked :deep(.n-switch__button) {
    background-color: var(--fig-icon-red);
  }
  .ts-field-label {
    font-size: 12px;
    line-height: 16px;
    color: var(--fig-text-tertiary);
  }
  /* Pastki qatordagi tashkilot nomi. */
  .ts-title-name {
    min-width: 0;
    font-size: 13px;
    font-weight: 600;
    line-height: 18px;
    color: var(--fig-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ts-state-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    line-height: 16px;
    white-space: nowrap;
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
  /* Bo'sh holat keng panjara ostida chapga yopishadi — gorizontal skrollda ham ko'rinadi. */
  .ts-grid-empty {
    position: sticky;
    left: 0;
    width: 100%;
    padding: 48px 16px;
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
    /* Chetki kataklar yumaloq (16px) — burchak tashqarisi karta rangida bo'lsin,
       aks holda tik skrollda ostidagi qatorlar o'sha joydan ko'rinib qoladi. */
    background: var(--fig-block-bg);
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
    /* Bugun — raqam asosiy rangda, ostida chiziq. */
    &.is-today {
      box-shadow: inset 0 -2px 0 var(--fig-icon-brand);
    }
    &.is-today .ts-day-num {
      color: var(--fig-icon-brand);
      font-weight: 700;
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
  .ts-worker-post {
    font-size: 11px;
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
  // Input ustunga sig'sin: o'ngdan ham chegara, o'lcham kichik.
  .ts-c-table-edit {
    display: flex;
    align-items: center;
    padding-right: 12px;
  }
  .ts-table-input {
    width: 100%;
    max-width: 100%;
    font-variant-numeric: tabular-nums;
    // Doira emas — oddiy yumaloq burchak.
    --n-border-radius: 8px !important;
    // Ichki otstup kichik — matn inputni ko'proq egallaydi (Naive small: 10px).
    --n-padding-left: 4px !important;
    --n-padding-right: 4px !important;
  }
  // Matn markazda — bo'sh joy chap va o'ngda teng bo'ladi (placeholder ham, raqam ham).
  .ts-table-input :deep(.n-input__input-el),
  .ts-table-input :deep(.n-input__placeholder) {
    text-align: center;
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
  /* Tizim hisobidan o'zgartirilgan katak: faqat burchak belgisi; farq va izoh hover'da. */
  /* O'zgartirilgan katak belgisi — yuqori chap burchakda doim ko'rinadi. */
  .ts-edit-mark {
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 8px 8px 0 0;
    border-color: var(--fig-text-red) transparent transparent transparent;
    pointer-events: none;
  }
  /* Jami ustunlarda tizim hisobidan farq — mayda, sonning ostida. */
  .ts-brow .ts-c-total {
    flex-direction: column;
    line-height: 1.15;
  }
  .ts-total-diff {
    font-size: 10px;
    font-weight: 700;
    cursor: pointer;
  }
  .ts-total-diff.is-more {
    color: var(--fig-icon-green);
  }
  .ts-total-diff.is-less {
    color: var(--fig-text-red);
  }
  .ts-hist-filters {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
  :deep(.ts-hist-chip) {
    display: inline-block;
    margin-right: 4px;
    padding: 0 6px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
  }
  :deep(.ts-hist-empty) {
    color: var(--fig-text-tertiary);
    font-size: 12px;
  }
  :deep(.ts-hist-more) {
    color: var(--fig-icon-green);
  }
  :deep(.ts-hist-less) {
    color: var(--fig-text-red);
  }
  .ts-diff-tip {
    position: absolute;
    z-index: 30;
    left: 50%;
    bottom: calc(100% + 6px);
    transform: translateX(-50%);
    min-width: 200px;
    padding: 8px 10px;
    border-radius: 8px;
    background: var(--textColor0);
    color: var(--surface-section);
    font-size: 11px;
    font-weight: 400;
    line-height: 1.55;
    text-align: left;
    white-space: nowrap;
    display: none;
    pointer-events: none;
  }
  /* Chekka ustun/birinchi qatorda oyna jadvaldan chiqib kesilmasin. */
  .ts-diff-tip.is-start {
    left: 0;
    transform: none;
  }
  .ts-diff-tip.is-end {
    left: auto;
    right: 0;
    transform: none;
  }
  .ts-diff-tip.is-below {
    bottom: auto;
    top: calc(100% + 6px);
  }
  .ts-cell.is-edited:hover .ts-diff-tip {
    display: block;
  }
  .ts-diff-note {
    opacity: 0.7;
  }
  .ts-dragging .ts-cell.is-edited:hover .ts-diff-tip {
    display: none;
  }
  /* Drag paytida hover belgilari o'chadi — tanlash chegarasi toza ko'rinsin. */
  .ts-dragging .ts-cell:hover {
    box-shadow: none;
  }
  .ts-dragging .ts-cell:hover .ts-cell-info {
    opacity: 0;
    transform: scale(0.6);
    pointer-events: none;
  }

  /* Skroll chizig'i ingichka — kontent kengligini yemasin. */
  .ts-rules-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .ts-rules-scroll::-webkit-scrollbar-thumb {
    background: var(--surface-line);
    border-radius: 3px;
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
  /* Kod — rangli chip (rang + foni `ruleKeyStyle` dan). */
  .ts-rules-key {
    display: inline-block;
    min-width: 28px;
    padding: 1px 8px;
    border-radius: 999px;
    text-align: center;
    font-size: 12px;
    font-weight: 700;
  }
  .ts-rules-dash {
    color: var(--fig-text-tertiary);
  }
  /* Tez tanlov chiplari tanlovi */
  .ts-quick-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .ts-quick-head .ts-rules-head {
    margin-top: 0;
  }
  .ts-quick-hint {
    margin: 0 0 8px;
    font-size: 12px;
    color: var(--fig-text-tertiary);
  }
  .ts-quick-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 6px;
  }
  .ts-quick-item {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    padding: 5px 8px;
    border: 1px solid var(--surface-line);
    border-radius: 10px;
    background: var(--surface-section);
    text-align: left;
    cursor: pointer;
    transition:
      border-color 0.12s,
      background 0.12s;
  }
  .ts-quick-item:hover:not(:disabled) {
    border-color: var(--primary-color);
  }
  .ts-quick-item.is-on {
    border-color: var(--primary-color);
    background: color-mix(in srgb, var(--primary-color) 8%, var(--surface-section));
  }
  .ts-quick-item:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .ts-quick-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
    font-weight: 500;
    color: var(--fig-text-primary);
  }
  .ts-quick-check {
    flex-shrink: 0;
    font-size: 16px;
    color: var(--primary-color);
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
    /* Tungi smena davomi — soat oldingi kunga yozilgan. */
    .ts-cell-cont {
      position: absolute;
      bottom: 1px;
      left: 3px;
      font-size: 10px;
      line-height: 10px;
      color: var(--fig-text-tertiary);
    }
    /* Tungi smenada kirish/chiqish yo'q — tabelchi tekshirishi kerak. */
    &.is-check {
      background: rgba(245, 158, 11, 0.14);
      box-shadow: inset 0 0 0 1.5px rgba(245, 158, 11, 0.85);
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

  /* ── Sarlavha kartasi ─────────────────────────────────────────────────── */
  .ts-header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
    background: var(--fig-block-bg);
    border-radius: 20px;
  }
  /* Chap tomon: tab, bo'lim, qidiruv — amallar bilan bitta qatorda. */
  .ts-header-main {
    flex: 1 1 auto;
    min-width: 0;
  }
  .ts-header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
    flex-shrink: 0;
  }
  .ts-header-divider {
    width: 1px;
    height: 24px;
    margin: 0 4px;
    background: var(--surface-line);
  }
  .ts-toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .ts-department-select {
    width: 300px;
    flex: 0 1 300px;
    min-width: 180px;
  }
  .ts-toolbar .ts-search-field {
    flex: 0 1 280px;
    min-width: 180px;
  }

  /* ── Tanlangan katak ──────────────────────────────────────────────────── */
  .ts-grid .ts-cell.is-selected {
    background: color-mix(in srgb, var(--primary-color) 12%, var(--surface-section));
    box-shadow: inset 0 0 0 2px var(--primary-color);
  }
  /* Panel oxirgi qatorlarni yopmasin — pastda panel balandligicha joy qoladi
     (`--selbar-h` — ResizeObserver; 2 qatorga o'tsa ham). */
  .ts-scroll.has-selbar .ts-grid {
    padding-bottom: calc(var(--selbar-h, 52px) + 32px);
  }

  /* ── Tanlov paneli (suzuvchi) ─────────────────────────────────────────── */
  .ts-card {
    position: relative;
  }
  /* Markazda; sig'masa 2-qatorga o'tadi (`flex-wrap`). `left: 50%` + translate bilan bo'lmaydi —
     unda panel karta ENINING YARMIDA o'ralib qolardi. */
  .ts-selbar {
    position: absolute;
    left: 16px;
    right: 16px;
    bottom: 16px;
    z-index: 20;
    width: fit-content;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 8px 8px 8px 16px;
    background: var(--surface-section);
    border: 1px solid var(--surface-line);
    border-radius: 16px;
    box-shadow:
      0 12px 32px rgb(16 24 40 / 16%),
      0 2px 6px rgb(16 24 40 / 8%);
    white-space: nowrap;
  }
  .ts-selbar-enter-active,
  .ts-selbar-leave-active {
    transition:
      opacity 0.18s ease,
      transform 0.18s ease;
  }
  .ts-selbar-enter-from,
  .ts-selbar-leave-to {
    opacity: 0;
    transform: translateY(12px);
  }
  .ts-selbar-lead {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    gap: 8px;
    max-width: 240px;
    overflow: hidden;
  }
  .ts-selbar-lead-enter-active,
  .ts-selbar-lead-leave-active {
    transition:
      max-width 0.25s ease,
      margin 0.25s ease,
      opacity 0.18s ease;
  }
  .ts-selbar-lead-enter-from,
  .ts-selbar-lead-leave-to {
    max-width: 0;
    margin-right: -8px;
    opacity: 0;
  }
  @media (prefers-reduced-motion: reduce) {
    .ts-selbar-lead-enter-active,
    .ts-selbar-lead-leave-active {
      transition: none;
    }
  }
  .ts-selbar-count {
    display: flex;
    align-items: baseline;
    gap: 4px;
    font-size: 13px;
    color: var(--fig-text-secondary);
  }
  .ts-selbar-count b {
    font-size: 16px;
    color: var(--primary-color);
  }
  .ts-selbar-divider {
    width: 1px;
    height: 28px;
    margin: 0 4px;
    background: var(--surface-line);
  }
  /* ── Pastki qator: legenda + sahifalash ───────────────────────────────── */
  .ts-footer {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 16px;
    min-height: 52px;
    justify-content: space-between;
    padding: 4px 8px 4px 16px;
    background: var(--fig-block-bg);
    border-radius: 16px;
  }
  .ts-footer-pages {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
    margin-left: auto;
  }
  .ts-footer-range {
    font-size: 13px;
    color: var(--fig-text-secondary);
    white-space: nowrap;
  }
  .ts-footer-range b {
    color: var(--fig-text-primary);
  }
  .ts-footer-pages :deep(> div) {
    padding-block: 0;
    width: auto;
  }

  @media (max-width: 1280px) {
    .ts-header,
    .ts-toolbar {
      flex-wrap: wrap;
    }
    .ts-selbar {
      flex-wrap: wrap;
      white-space: normal;
    }
  }
</style>

<style lang="scss">
  /* Bo'lim ro'yxati — uzun nomlar kesilmasin, keyingi qatorga tushsin.
     Menyu `body` ga teleport bo'ladi, shuning uchun global (scoped emas). */
</style>
