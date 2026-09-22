<script setup>
  import { h, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
  import { useMessage } from 'naive-ui'
  import {
    Add20Filled,
    ArrowDownload20Filled,
    Delete20Regular,
    Dismiss20Regular,
    Eraser20Filled,
    LockClosed20Filled,
    LockOpen20Filled,
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
    UIDConfirm,
    UIDragSelector,
    UIPagination,
    UITable,
    UIUser
  } from '@/components/index.js'
  import dayjs from 'dayjs'
  import Utils from '@/utils/Utils.js'
  import { colorOfDetail } from './timesheetGrid.js'
  import DayDetailModal from './DayDetailModal.vue'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const message = useMessage()
  const store = useTimesheetWorkerStore()
  const compStore = useComponentStore()
  const confirmStore = useTimesheetConfirmStore()
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
  // TODO: yuklash endpointi hali yo'q — backendda tabel eksporti qo'shilgach ulanadi.
  const onDownload = () => {}

  /* ------------------------------------------------------------------------
   * Tablar: «Tabel» (panjara) va «Tabelchilar» (mas'ul xodimlar).
   * Panjara `v-show` bilan yashiriladi — tanlov va yuklangan sahifa saqlanadi.
   * ---------------------------------------------------------------------- */
  const activeTab = ref('grid')
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
  const onApproverTab = (v) => {
    if (v === 'history') store._confirmationHistory()
    else store._confirmations()
  }

  const onTabChange = (v) => {
    if (v === 'timekeepers') {
      store._timekeepers()
      onApproverTab(approverTab.value)
    }
    else store._index()
  }
  // O'ng kartochkadagi tabel ma'lumotlari — hammasi mavjud store holatidan.
  const timesheetInfo = computed(() => {
    const holidays = store.days.filter((d) => d.is_holiday).length
    const locked = Object.keys(store.timekeeperLocks).length
    return [
      { label: t('content.organization'), value: store.organization?.name ?? '—' },
      {
        label: t('timesheetPage.periodLabel'),
        value: `${Utils.monthList.find((m) => m.id - 1 === store.month)?.name ?? ''} ${store.year ?? ''}`.trim()
      },
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

  const timesheetStatus = computed(() => {
    if (store.lock.status) {
      return { text: t('timesheetPage.accessFinished'), type: 'error' }
    }
    if (store.lock.sent_at && store.lock.confirmation !== 4) {
      return { text: t('timesheetPage.accessSent'), type: 'warning' }
    }
    return { text: t('timesheetPage.statusOpen'), type: 'success' }
  })

  const departmentNames = (row) =>
    (row.departments ?? [])
      .map((d) => d?.department?.name)
      .filter(Boolean)
      .join(', ')

  const timekeeperColumns = computed(() => [
    { key: 'worker', title: t('content.worker'), minWidth: 260 },
    {
      key: 'departments',
      title: t('content.departments'),
      // Ichida faqat kichkina badge — keng ustun bo'sh joy bo'lib qolardi.
      width: 110,
      align: 'center'
    },
    // OXIRGI ustun = amal ustuni: faqat switch. `storage-key` berilmagani uchun
    // `UITable` o'zining `__actions` ustunini qo'shmaydi, ya'ni ortiqcha bo'sh
    // ustun chiqmaydi.
    { key: 'access', title: '', width: 96, align: 'center' }
  ])

  const changeTimekeeperPage = (v) => {
    store.timekeeperParams.page = v.page
    store.timekeeperParams.per_page = v.per_page
    store._timekeepers()
  }

  // Tabelning O'ZI yopiq bo'lsa hech kim yozolmaydi — switch ham bloklanadi.
  const timesheetLocked = computed(
    () => store.lock.status || (store.lock.sent_at && store.lock.confirmation !== 4)
  )

  // Yopiq tabelda «Saqlash» o'rnida sabab ko'rsatiladi — tabelchi nega
  // yozolmayotganini tugmaning o'zidan biladi.
  const lockedActionLabel = computed(() =>
    store.lock.status ? t('timesheetPage.accessFinished') : t('timesheetPage.inApproval')
  )

  // Ruxsat switch'i. Default — OCHIQ; qulflansa tabelchi SHU OY tabelini
  // o'zgartira olmaydi.
  const isOpen = (row) => !store.timekeeperLocks[row.id]
  const onToggleAccess = (row, open) => {
    store.setTimekeeperLock(row.id, !open)
  }


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

  /* Kun tafsiloti oynasi — katakcha burchagidagi tugma ochadi.
   *
   * Figma «HRM Railway» v3 (node 3690:66416) bo'yicha YANGI oyna alohida
   * komponentda: `DayDetailModal.vue`. Eski oyna shu faylda, pastda turibdi
   * va o'zgarmadi — dizayn qaytarilsa flagni `false` qilish kifoya. */
  const USE_NEW_DAY_DETAIL = true

  const detailOpen = ref(false)
  const detailLoading = ref(false)
  const detail = ref(null)
  // Modal sarlavhasi uchun — xodim va kun konteksti saqlanadi (matn emas,
  // OBYEKT: sarlavhada rasm, lavozim va kun holati ham ko'rsatiladi).
  const detailWorker = ref(null)
  const detailDay = ref(null)
  const detailDate = ref('')

  // Vaqt o'qi izohi bosilganda — SHU qatlam ajratib ko'rsatiladi, qolganlari
  // xiralashadi. Aks holda to'rtta qatlam ustma-ust tushib, qaysi rang qaysi
  // biriga tegishli ekani faqat izohdan taxmin qilinardi.
  const tlFocus = ref('')
  const tlLegend = [
    { key: 'plan', label: 'timesheetPage.lgPlan' },
    { key: 'lunch', label: 'timesheetPage.lgLunch' },
    { key: 'raw', label: 'timesheetPage.lgRaw' },
    { key: 'counted', label: 'timesheetPage.lgCounted' }
  ]
  const toggleTlFocus = (key) => {
    tlFocus.value = tlFocus.value === key ? '' : key
  }

  const openDayDetail = async (item, day) => {
    const date = dayjs().year(store.year).month(store.month).date(day.day).format('YYYY-MM-DD')
    detailWorker.value = item
    detailDay.value = day
    detailDate.value = date
    detailOpen.value = true
    // Yangi oyna `worker` va `date` bo'yicha o'zi so'rov yuboradi.
    if (USE_NEW_DAY_DETAIL) return
    detailLoading.value = true
    tlFocus.value = ''
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
    if (d.vacation_type) {
      const c = d.vacation_command
      const parts = [
        c?.number ? `${t('timesheetPage.commandNo')} ${c.number}` : null,
        c?.date ? dayjs(c.date).format('DD.MM.YYYY') : null
      ].filter(Boolean)
      return {
        tone: 'warning',
        text: t('timesheetPage.byVacation'),
        command: parts.length ? parts.join(' · ') : null
      }
    }
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

  // Yorliqlar orasidagi minimal masofa (o'q balandligining %): 760px da
  // ~20px — yozuv qatorining balandligi. Faqat HAQIQIY ustma-ust tushishning
  // oldini oladi: undan kattaroq qiymat yaqin vaqtlarni sun'iy ravishda
  // uzoqlashtirib, yorliqni o'z nuqtasidan ancha pastga olib tushardi.
  // ⚠️ `.ts-tl` balandligi o'zgarsa bu qiymat ham qayta hisoblanishi kerak.
  const MIN_GAP_PCT = 2.6

  /* Yorliqlarni joylashtirish: to'qnashganlari o'z nuqtalarining O'RTASIGA
   * nisbatan ikki tomonga yoyiladi — faqat pastga surilsa, ketma-ket yaqin
   * vaqtlar bir-birini itarib, oxirgi yozuv o'z vaqtidan juda uzoqqa tushib
   * ketardi (bog'lovchi chiziq ham uzun qiya bo'lib qolardi).
   * Kirish: o'sish tartibidagi haqiqiy pozitsiyalar. Chiqish: shu tartibdagi
   * yorliq pozitsiyalari. */
  const spreadLabels = (tops, gap) => {
    if (!tops.length) return []
    // Bir-biriga xalaqit beradigan yorliqlar guruhga yig'iladi. Guruh o'z
    // a'zolarining o'rtacha pozitsiyasida markazlashadi; markazlashgach u
    // oldingi guruhga tegib ketishi mumkin — shuning uchun tekshiruv siklda.
    const groups = []
    const startOf = (g) => g.sum / g.count - ((g.count - 1) * gap) / 2
    for (const top of tops) {
      groups.push({ count: 1, sum: top })
      while (groups.length > 1) {
        const b = groups[groups.length - 1]
        const a = groups[groups.length - 2]
        if (startOf(b) >= startOf(a) + a.count * gap) break
        a.count += b.count
        a.sum += b.sum
        groups.pop()
      }
    }
    const out = []
    let last = -Infinity
    for (const g of groups) {
      // O'q chetidan chiqib ketmasin — yuqoridan ham, pastdan ham.
      let start = Math.min(Math.max(0, startOf(g)), 100 - (g.count - 1) * gap)
      // Chetga siqilgan guruh oldingisining ustiga tushmasin.
      if (last > -Infinity) start = Math.max(start, last + gap)
      for (let k = 0; k < g.count; k++) out.push(start + k * gap)
      last = out[out.length - 1]
    }
    return out
  }

  /* Bog'lovchi chiziq qutisi. Yorliq o'z nuqtasidan yuqorida ham, pastda ham
   * bo'lishi mumkin — shuning uchun qutining yo'nalishi ham hisoblanadi.
   * `near` — chiziqning yorliq tomonidagi uchi (SVG da x=0 yoki x=100 —
   * qaysi tomonda ekanini chaqiruvchi biladi), `far` — ustun tomonidagi. */
  const linkBox = (truePos, labelPos) => {
    const top = Math.min(truePos, labelPos)
    const height = Math.abs(labelPos - truePos)
    return {
      style: { top: `${top}%`, height: `${height}%` },
      // Yorliq pastda bo'lsa uning uchi qutining PASTIDA (y=100).
      labelY: labelPos >= truePos ? 100 : 0,
      colY: labelPos >= truePos ? 0 : 100
    }
  }

  const fmtMin = (m) =>
    m == null
      ? '—'
      : `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

  /* ------------------------------------------------------------------------
   * Vaqt o'qi — BITTA ustun.
   *
   * Reja va fakt alohida ikki ustun edi; ular bir xil vaqt o'qida bo'lgani
   * uchun ustma-ust qo'yilsa kesishma («hisobga olingan qism») o'z-o'zidan
   * ko'rinadi. Endi bitta ustunda uch qatlam:
   *   ① reja oynasi — ko'k fon, ichidan tushlik shtrixlab kesiladi;
   *   ② turniket intervali — shaffof yashil ramka («ichkarida edi»);
   *   ③ hisobga olingan qism — to'q yashil to'ldirish (① ∩ ② − tushlik).
   * Grafik vaqtlari CHAPDA yorliq bo'lib turadi, turniket hodisalari O'NGDA.
   * ---------------------------------------------------------------------- */
  const planBand = computed(() => {
    const w = workWindow.value
    if (!w) return null
    return { style: { top: `${pct(w[0])}%`, height: `${pct(w[1]) - pct(w[0])}%` } }
  })

  // Chapdagi grafik yorliqlari: ish boshlanishi → tushlik → ish tugashi.
  // Yozuvlar ustma-ust tushmasligi uchun pastga suriladi, `top` esa
  // HAQIQIY vaqtda qoladi — bog'lovchi chiziq shundan tortiladi.
  const planMarks = computed(() => {
    const out = []
    const sch = detail.value?.schedule
    const push = (key, kind, label, hhmm, endOfDay = false) => {
      const m = hhmmToMin(hhmm, endOfDay)
      if (m == null) return
      out.push({ key, kind, label, time: String(hhmm).slice(0, 5), top: pct(m) })
    }
    if (sch?.start_time) push('ws', 'work', t('timesheetPage.workStart'), sch.start_time)
    const br = detail.value?.planned_break
    if (br) {
      push('bs', 'break', t('timesheetPage.lunchStart'), br.start_time)
      push('be', 'break', t('timesheetPage.lunchEnd'), br.end_time, true)
    }
    if (sch?.end_time) push('we', 'work', t('timesheetPage.workEnd'), sch.end_time, true)

    out.sort((a, b) => a.top - b.top)
    const placed = spreadLabels(
      out.map((mk) => mk.top),
      MIN_GAP_PCT
    )
    out.forEach((mk, i) => {
      mk.labelTop = placed[i]
      mk.labelStyle = { top: `${placed[i]}%` }
      // Yorliq CHAPDA: SVG da x=0 — yorliq tomoni, x=100 — ustun tomoni.
      const box = linkBox(mk.top, placed[i])
      mk.linkStyle = box.style
      mk.y1 = box.labelY
      mk.y2 = box.colY
    })
    return out
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

  /* Turniket intervali va undan HISOBGA OLINGAN qismlar.
   *
   * Har interval uchun: xom oraliq (kirishdan chiqishgacha) va uning ichidan
   * grafik oynasiga tushgan, tushlikdan tashqari bo'laklar. Bo'laklar ham
   * chizma uchun (foizli `parts`), ham o'qiladigan ro'yxat uchun (`ranges`:
   * «09:00 → 13:00 · 4:00») qaytariladi — chizma ostidagi hisob bloki
   * «qaysi soatdan qaysi soatgacha» degan savolga aynan shundan javob beradi.
   */
  const workIntervals = computed(() =>
    (detail.value?.segments ?? [])
      .filter((sg) => sg.type === 'work' && sg.to)
      .map((sg) => {
        const a = minOfDay(sg.from)
        const b = minOfDay(sg.to)
        const win = workWindow.value
        const lunch = lunchWindow.value
        const parts = []
        const ranges = []
        let counted = 0
        if (win) {
          const c = Math.max(a, win[0])
          const d = Math.min(b, win[1])
          if (d > c) {
            const raw =
              lunch && lunch[0] < d && lunch[1] > c
                ? [
                    [c, Math.min(lunch[0], d)],
                    [Math.max(lunch[1], c), d]
                  ]
                : [[c, d]]
            // ⚠️ Foizlar INTERVAL ichida hisoblanadi: `.ts-tl-iv-counted`
            // intervalning o'zi ichida joylashadi, o'qqa nisbatan emas.
            const span = b - a || 1
            for (const [x, y] of raw) {
              if (y <= x) continue
              counted += y - x
              parts.push({
                top: `${((x - a) / span) * 100}%`,
                height: `${((y - x) / span) * 100}%`
              })
              ranges.push({ from: fmtMin(x), to: fmtMin(y), dur: minutesToHm(y - x) })
            }
          }
        }
        return {
          from: fmtMin(a),
          to: fmtMin(b),
          dur: minutesToHm(sg.minutes),
          counted: minutesToHm(counted),
          partial: counted < sg.minutes,
          parts,
          ranges,
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
    //
    // CHAPDAGI reja yorliqlari hisobga OLINMAYDI: ular ustunning narigi
    // tomonida, ya'ni yozuvlar bir-birini qoplamaydi. Ilgari ular ham
    // qochirilardi (chiziqlar bitta uzluksiz chiziqdek ko'rinmasin deb),
    // lekin buning evaziga hodisa yozuvi o'z vaqtidan sezilarli pastga
    // tushib ketardi — noaniqlik chiroylilikdan qimmatroq.
    // `spreadLabels` o'sish tartibini kutadi.
    raw.sort((a, b) => minOfDay(a.at) - minOfDay(b.at))
    const trueTops = raw.map((e) => pct(minOfDay(e.at)))
    const placed = spreadLabels(trueTops, MIN_GAP_PCT)
    return raw.map((e, i) => {
      // Yorliq O'NGDA: SVG da x=0 — ustun tomoni, x=100 — yorliq tomoni.
      const box = linkBox(trueTops[i], placed[i])
      return {
        top: placed[i],
        linkStyle: box.style,
        y1: box.colY,
        y2: box.labelY,
        time: exact(e.at),
        direction: e.direction,
        device: byTime.get(String(e.at)) ?? null
      }
    })
  })

  // Y o'qi. Chiziq HAR SOATDA — yaqin oraliqlarni ajratish uchun mayda
  // to'r kerak; yozuv esa har 2 soatda, aks holda chap chet qalashib
  // ketadi. Chiziq butun maydonni kesib o'tadi: zolak qaysi soatga to'g'ri
  // kelishini ko'z bilan o'qish uchun.
  const tlTicks = computed(() => {
    const out = []
    for (let m = 0; m <= 1440; m += 60) {
      const major = (m / 60) % 2 === 0
      out.push({
        m,
        major,
        top: pct(m),
        label: major ? `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:00` : null
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

  // Drag davom etayotganda katakcha hover'i o'chadi: yashil ramka ham,
  // «ko'rish» tugmasi ham tanlash ustidan chiqib xalaqit berardi.
  const dragging = ref(false)

  // Saqlanmagan (kutilayotgan) katakchalar: key `row-col` → {row, col, wasOccupied}.
  // Tanlangan katak DARHOL qiymat bilan to'ladi, serverga «Saqlash» da ketadi.
  const pendingCells = ref(new Map())

  const canSelectRange = () => {
    // Tasdiqlashga chiqarilgan yoki yakunlangan tabel o'zgartirilmaydi —
    // na tabelchi, na HR uchun (server ham 403 qaytaradi).
    if (timesheetLocked.value) return false
    if (!store.payload.isClearing && store.payload.status == null) {
      return false
    }
    // Namuna o'chirilgan — tanlov saqlanadi, lekin katakka yozilmaydi.
    if (!store.payload.isClearing && !previewActive.value) {
      return false
    }
    // Tur ID'lari ketma-ket EMAS (1,2,3,5,10,14…) — indeks bo'yicha
    // olish boshqa turni qaytaradi, shuning uchun ID bo'yicha qidiriladi.
    if (typeByIdOrNull(store.payload.status)?.hours && store.payload.hours == null) {
      return false
    }
    if (typeByIdOrNull(store.payload.status2)?.hours && store.payload.hours2 == null) {
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
    // Tozalash yoqilsa namuna o'chadi, o'chirilsa qaytadi. Tanlov TOZALANMAYDI —
    // qiymatlar selectlarda va namunada (xira holatda) turaveradi.
    previewActive.value = !store.payload.isClearing
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

  // Namuna katakchasining O'ZI tugma. «Namuna» va «Tozalash» — bir-birini
  // istisno qiladigan ikki rejim: biri yoqilsa ikkinchisi o'chadi. Namuna
  // o'chirilganda tanlov selectlarda QOLADI, faqat katakka yozilmaydi.
  const previewActive = ref(true)
  const togglePreview = () => {
    if (!previewDetails.value.length && !store.payload.isClearing) return
    previewActive.value = !previewActive.value
    if (previewActive.value) store.payload.isClearing = false
  }

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
      <!-- Tablar korxona tanlovidan OLDIN, SHU qatorda. `segment` — tugma
           ko'rinishidagi tab; yorliqli maydonlar bilan pastdan tekislanadi. -->
      <n-tabs
        v-model:value="activeTab"
        class="ts-tabs"
        type="segment"
        @update:value="onTabChange"
      >
        <n-tab name="grid">{{ $t('timesheetPage.tabGrid') }}</n-tab>
        <n-tab name="timekeepers">{{ $t('timesheetPage.tabTimekeepers') }}</n-tab>
      </n-tabs>

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
          :disabled="activeTab === 'timekeepers'"
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
        <n-button secondary type="error" @click="store.visible = false">
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
        <n-button
          v-else-if="activeTab === 'grid'"
          :loading="store.saveLoading"
          type="primary"
          @click="onSave"
        >
          <template #icon>
            <n-icon :component="Save20Filled" />
          </template>
          {{ $t('content.save') }}
        </n-button>
      </div>
    </div>

    <!-- ── Tabelchilar: boshqa sahifalardagi kabi `UITable` ─────────────── -->
    <div v-if="activeTab === 'timekeepers'" class="ts-body ts-keepers">
      <div class="ts-keepers-table">
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

          <!-- Faqat SONI — ro'yxat uzun bo'lsa jadvalni cho'zib yuborardi.
             To'liq ro'yxat tooltipda qoladi. -->
          <template #cell-departments="{ row }">
            <n-badge
              :show-zero="true"
              :title="departmentNames(row)"
              :value="row.departments?.length ?? 0"
              class="ts-dep-badge"
            />
          </template>

          <template #cell-access="{ row }">
            <n-switch
              :class="['ts-access-switch', isOpen(row) ? 'is-open' : 'is-locked']"
              :disabled="timesheetLocked"
              :title="$t('timesheetPage.accessColumn')"
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
          </template>
        </UITable>
      </div>

      <!-- O'ng yarmi — ikkita kartochka ustma-ust. -->
      <div class="ts-keepers-side">
        <div class="ts-info-card">
          <div class="ts-info-head">
            <span class="ts-info-title">{{ $t('timesheetPage.timesheetInfo') }}</span>
            <n-tag :bordered="false" :type="timesheetStatus.type" round size="small">
              {{ timesheetStatus.text }}
            </n-tag>
          </div>
          <div v-for="row in timesheetInfo" :key="row.label" class="ts-info-row">
            <span class="ts-info-label">{{ row.label }}</span>
            <span class="ts-info-value">{{ row.value }}</span>
          </div>
        </div>

        <!-- Kelishuvchilar / Tarix — ichki tabli kartochka. -->
        <div class="ts-info-card ts-approvers-card">
          <div class="ts-info-head">
            <n-tabs
              v-model:value="approverTab"
              class="ts-approver-tabs"
              size="small"
              type="segment"
              @update:value="onApproverTab"
            >
              <n-tab name="list">{{ $t('timesheetPage.verifiers') }}</n-tab>
              <n-tab name="history">{{ $t('timesheetPage.history') }}</n-tab>
            </n-tabs>
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
    <UIDConfirm
      v-model:visible="verifierDeleteVisible"
      :save-loading="verifierDeleteLoading"
      close-btn-text="content.cancel"
      submit-btn-text="content.delete"
      type="warning"
      @onClose="verifierDeleteVisible = false"
      @onSave="confirmDeleteVerifier"
    >
      <div class="text-center">
        <p class="text-lg font-medium">{{ verifierDeleteName }}</p>
        <p class="text-textColor3 mt-1">
          {{ $t('timesheetPage.verifierDeleteConfirm') }}
        </p>
      </div>

      <!-- `type="warning"` standart holatda FAQAT yopish tugmasini beradi
           (u ogohlantirish uchun) — bu yerda tasdiq kerak, shuning uchun
           amallar o'zimizniki. -->
      <template #action>
        <div class="grid grid-cols-2 gap-2">
          <n-button ghost type="tertiary" @click="verifierDeleteVisible = false">
            {{ $t('content.no') }}
          </n-button>
          <n-button
            :loading="verifierDeleteLoading"
            type="error"
            @click="confirmDeleteVerifier"
          >
            {{ $t('content.yes') }}
          </n-button>
        </div>
      </template>
    </UIDConfirm>

    <n-spin
      v-show="activeTab === 'grid'"
      :show="(store.loading && !searching) || store.saveLoading"
      class="ts-body"
      content-class="ts-body-content"
    >
      <!-- ── Panjara kartasi: maketda 20px radius + 4px ichki otstup ──────── -->
      <div class="ts-card">
        <UIDragSelector
          :class="{ 'ts-dragging': dragging }"
          class="ts-scroll"
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
    <div v-show="activeTab === 'grid'" class="ts-pagination">
      <UIPagination
        :page="store.params.page"
        :per_page="store.params.per_page"
        :show-size-picker="false"
        :total="store.totalItems"
        @change-page="changePage"
      />
    </div>
    <div v-show="activeTab === 'grid'" class="ts-bottom">
      <n-form ref="form" class="ts-bottom-row">
        <div class="ts-field ts-field-type">
          <label class="ts-field-label">{{ $t('timesheetPage.workTimeType') }}</label>
          <n-select
            v-model:value="store.payload.status"
            :consistent-menu-width="false"
            :disabled="timesheetLocked || store.payload.isClearing"
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
            :disabled="timesheetLocked || !typeByIdOrNull(store.payload.status)?.hours"
            :min="0"
          />
        </div>
        <div class="ts-field ts-field-type">
          <label class="ts-field-label">{{ $t('timesheetPage.workTimeType') }}</label>
          <n-select
            v-model:value="store.payload.status2"
            :consistent-menu-width="false"
            :disabled="timesheetLocked || store.payload.isClearing || !store.payload.status"
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
            :disabled="timesheetLocked || !typeByIdOrNull(store.payload.status2)?.hours"
            :min="0"
          />
        </div>

        <!-- Natija namunasi — shu qatorning davomi. -->
        <div class="ts-field ts-field-preview">
          <div
            :class="{
              'ts-preview-off': !previewActive,
              'ts-preview-on': previewActive && previewDetails.length
            }"
            :title="previewActive ? $t('content.active') : $t('content.noActive')"
            class="ts-cell ts-preview-cell"
            @click="togglePreview"
          >
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

        <!-- «Tozalash / Auto / qoidalar» — tepadagi filtr qatoridan shu yerga
             ko'chirildi: uchalasi ham panjara ustida ishlaydi. -->
        <div class="ts-bottom-actions">
          <n-button
            :class="{ 'ts-clear-active': store.payload.isClearing }"
            :disabled="timesheetLocked"
            :secondary="!store.payload.isClearing"
            type="error"
            @click="toggleClearing"
          >
            <template #icon>
              <n-icon :component="Eraser20Filled" />
            </template>
            {{ $t('content.clear') }}
          </n-button>
          <n-button
            :disabled="timesheetLocked"
            :loading="store.autoLoading"
            type="primary"
            @click="onAutoCalc"
          >
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
            {{ $t('timesheetPage.infoShort') }}
          </n-button>
          <n-button secondary type="success" @click="onDownload">
            <template #icon>
              <n-icon :component="ArrowDownload20Filled" />
            </template>
            {{ $t('content.download') }}
          </n-button>
        </div>
      </n-form>
    </div>

    <!-- Kun tafsiloti.
         Tuzilishi ATAYLAB «javobdan tushuntirishga» qarab boradi:
         sarlavha (kim/qachon) → natija → ko'rsatkichlar → grafik → vaqt o'qi. -->
    <DayDetailModal
      v-if="USE_NEW_DAY_DETAIL"
      v-model:date="detailDate"
      v-model:visible="detailOpen"
      :worker="detailWorker"
    />

    <n-modal
      v-else
      v-model:show="detailOpen"
      class="ts-detail-modal"
      preset="card"
      size="small"
      style="width: 1360px; max-width: 96vw"
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
                  <!-- Ta'tilda asos bo'lgan buyruq — raqami va sanasi. -->
                  <span v-if="dayReason.command" class="ts-dm-reason-extra">
                    {{ dayReason.command }}
                  </span>
                </p>
              </section>

              <!-- ④ Vaqt o'qi — BITTA ustun.
                   Reja va fakt bir xil vaqt o'qida bo'lgani uchun ustma-ust
                   qo'yildi: kesishma (hisobga olingan qism) o'z-o'zidan
                   ko'rinadi, ikkita ustunni ko'z bilan solishtirish shart
                   emas. Grafik vaqtlari CHAPDA, turniket hodisalari O'NGDA. -->
              <!-- Hodisa bo'lmasa ham ko'rsatiladi: grafik va tushlik bandi
                   o'zi ma'lumot beradi («nima bo'lishi kerak edi»). -->
              <section v-if="detail?.schedule || detail?.segments?.length" class="ts-dm-card">
                <!-- Sarlavha + izohlar bitta yopishqoq blok: 760px lik o'qni
                     skroll qilganda ham qaysi rang nima ekani ko'rinib tursin
                     (va qatlam tanlash tugmalari qo'l ostida qolsin). -->
                <div class="ts-tl-sticky">
                  <h4 class="ts-dm-card-head">{{ $t('timesheetPage.timeline') }}</h4>

                  <!-- Izohlar — tugma: bosilgani o'qda ajratiladi, qolgan
                       qatlamlar xiralashadi. Yana bosilsa — hammasi qaytadi. -->
                  <div class="ts-tl-legend">
                    <button
                      v-for="lg in tlLegend"
                      :key="lg.key"
                      :aria-pressed="tlFocus === lg.key"
                      :class="{
                        'is-active': tlFocus === lg.key,
                        'is-dim': tlFocus && tlFocus !== lg.key
                      }"
                      class="ts-tl-lg-btn"
                      type="button"
                      @click="toggleTlFocus(lg.key)"
                    >
                      <i :class="`is-${lg.key}`" class="ts-lg"></i>{{ $t(lg.label) }}
                    </button>
                  </div>
                </div>

                <div :class="tlFocus ? `is-focus is-focus-${tlFocus}` : ''" class="ts-tl">
                  <!-- Soat to'ri — butun maydonni kesib o'tadi -->
                  <span
                    v-for="tick in tlTicks"
                    :key="`t-${tick.m}`"
                    :class="{ 'is-major': tick.major }"
                    :style="{ top: `${tick.top}%` }"
                    class="ts-tl-tick"
                  >
                    <span v-if="tick.label" class="ts-tl-tick-label">{{ tick.label }}</span>
                  </span>

                  <!-- CHAPDA: grafik vaqtlari (ish boshlanishi/tugashi,
                       tushlik boshlanishi/tugashi) — yorliq + ustungacha
                       tortilgan chiziq. -->
                  <template v-for="mark in planMarks" :key="`m-${mark.key}`">
                    <span :class="`is-${mark.kind}`" :style="mark.labelStyle" class="ts-tl-mark">
                      {{ mark.label }} <b>{{ mark.time }}</b>
                    </span>
                    <svg
                      :class="`is-${mark.kind}`"
                      :style="mark.linkStyle"
                      class="ts-tl-mlink"
                      preserveAspectRatio="none"
                      viewBox="0 0 100 100"
                    >
                      <line
                        :y1="mark.y1"
                        :y2="mark.y2"
                        stroke="currentColor"
                        stroke-dasharray="4 4"
                        stroke-width="1"
                        vector-effect="non-scaling-stroke"
                        x1="0"
                        x2="100"
                      />
                    </svg>
                  </template>

                  <!-- ① Reja oynasi — ustunning foni, ichida tushlik -->
                  <span v-if="planBand" :style="planBand.style" class="ts-tl-plan">
                    <span
                      v-if="lunchBand"
                      :style="lunchBand.style"
                      :title="`${$t('timesheetPage.segLunch')} ${lunchBand.label}`"
                      class="ts-tl-plan-lunch"
                    ></span>
                  </span>
                  <span v-else class="ts-tl-plan is-none">
                    <span class="ts-tl-plan-none">{{ $t('timesheetPage.noSchedule') }}</span>
                  </span>

                  <!-- ② Turniket intervali — shaffof yashil ramka,
                       ③ ichida hisobga olingan bo'laklar to'q yashil -->
                  <span
                    v-for="(iv, i) in workIntervals"
                    :key="`iv-${i}`"
                    :style="iv.style"
                    class="ts-tl-iv"
                  >
                    <span
                      v-for="(pt, j) in iv.parts"
                      :key="`p-${j}`"
                      :style="pt"
                      class="ts-tl-iv-counted"
                    ></span>
                  </span>

                  <!-- O'NGDA: har bir kirish/chiqish, ustunga to'g'ri chiziq
                       bilan bog'langan (yozuv o'qilishi uchun surilgan
                       bo'lsa ham qaysi vaqt ekani ko'rinib tursin). -->
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
                      :y1="e.y1"
                      :y2="e.y2"
                      stroke="currentColor"
                      stroke-dasharray="4 4"
                      stroke-width="1"
                      vector-effect="non-scaling-stroke"
                      x1="0"
                      x2="100"
                    />
                  </svg>

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

                <!-- Hisob bloki: qaysi oraliq turniket bo'yicha olingan va
                     uning qaysi bo'laklari grafik uchun hisobga olingan. -->
                <div v-if="workIntervals.length" class="ts-tl-calc">
                  <h5 class="ts-tl-calc-head">{{ $t('timesheetPage.calcHead') }}</h5>
                  <div v-for="(iv, i) in workIntervals" :key="`c-${i}`" class="ts-tl-calc-block">
                    <div class="ts-tl-calc-row is-raw">
                      <i class="ts-lg is-raw"></i>
                      <span class="ts-tl-calc-range">{{ iv.from }} → {{ iv.to }}</span>
                      <span class="ts-tl-calc-dur">{{ iv.dur }}</span>
                    </div>
                    <div
                      v-for="(r, j) in iv.ranges"
                      :key="`cr-${j}`"
                      class="ts-tl-calc-row is-counted"
                    >
                      <i class="ts-lg is-counted"></i>
                      <span class="ts-tl-calc-range">{{ r.from }} → {{ r.to }}</span>
                      <span class="ts-tl-calc-dur">{{ r.dur }}</span>
                    </div>
                    <div v-if="!iv.ranges.length" class="ts-tl-calc-row is-none">
                      <i class="ts-lg is-empty"></i>
                      <span class="ts-tl-calc-range">{{ $t('timesheetPage.notCounted') }}</span>
                      <span class="ts-tl-calc-dur">0:00</span>
                    </div>
                  </div>
                  <div class="ts-tl-calc-total">
                    <span>{{ $t('timesheetPage.counted') }}</span>
                    <b>{{ minutesToHm(detail?.counted_minutes) }}</b>
                  </div>
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

  /* ── Tablar va «Tabelchilar» ro'yxati ─────────────────────────────────── */
  /* Filtr qatorining birinchi elementi — kengligi mazmuniga qarab. */
  .ts-tabs {
    flex: 0 0 auto;
    /* `n-tabs` standart holatda `width: 100%` — filtr qatorini siqib chiqarardi. */
    width: auto;
  }
  /* `segment` tab standart holatda ustunlarni TENG bo'ladi — «Tabel» va
     «Tabelchilar» bir xil kenglik olardi. Har tugma o'z matniga moslanadi. */
  .ts-tabs :deep(.n-tabs-rail) {
    grid-template-columns: none;
    grid-auto-flow: column;
    grid-auto-columns: max-content;
  }
  .ts-tabs :deep(.n-tabs-tab) {
    padding-inline: 16px;
    font-weight: 500;
    transition:
      color 0.22s ease,
      background-color 0.22s ease;
  }
  /* Asosiy rangdagi segment: chegara va xira fon railda, faol tab to'liq ko'k. */
  .ts-tabs :deep(.n-tabs-rail) {
    border: 1px solid color-mix(in srgb, var(--fig-icon-brand) 35%, transparent);
    background-color: color-mix(in srgb, var(--fig-icon-brand) 8%, transparent);
  }
  /* Faol tab foni — tabning O'ZIDA emas, ko'chib yuruvchi `capsule` da. */
  .ts-tabs :deep(.n-tabs-capsule) {
    border-color: var(--fig-icon-brand);
    background-color: var(--fig-icon-brand);
  }
  .ts-tabs :deep(.n-tabs-tab--active),
  .ts-tabs :deep(.n-tabs-tab--active .n-tabs-tab__label) {
    color: #fff;
  }
  /* Bosilganda kichik javob — segment tugmaday his qilinsin. */
  .ts-tabs :deep(.n-tabs-tab:active) {
    transform: scale(0.97);
  }

  @media (prefers-reduced-motion: reduce) {
    .ts-tabs :deep(.n-tabs-tab) {
      transition: none;
    }
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
    flex: 1 1 50%;
    min-width: 0;
    min-height: 0;
  }
  .ts-keepers-side {
    display: flex;
    flex: 1 1 50%;
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
  .ts-approver-tabs {
    width: auto;
  }
  .ts-approver-tabs :deep(.n-tabs-rail) {
    grid-template-columns: none;
    grid-auto-flow: column;
    grid-auto-columns: max-content;
  }
  .ts-approver-tabs :deep(.n-tabs-tab) {
    padding-inline: 12px;
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
  /* Bo'limlar soni — rangsiz, faqat chegara; raqam qalin. */
  .ts-dep-badge :deep(.n-badge-sup) {
    border: 1px solid var(--table-border);
    background-color: transparent;
    box-shadow: none;
    color: var(--fig-text-primary);
    font-weight: 600;
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
  .ts-filters {
    display: flex;
    /* Maydonlarda yorliq USTIDA — tablar ular bilan pastdan tekislanadi. */
    align-items: flex-end;
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
  /* Drag paytida hover belgilari o'chadi — tanlash chegarasi toza ko'rinsin. */
  .ts-dragging .ts-cell:hover {
    box-shadow: none;
  }
  .ts-dragging .ts-cell:hover .ts-cell-info {
    opacity: 0;
    transform: scale(0.6);
    pointer-events: none;
  }

  /* ── Tafsilot va qoidalar modallari ───────────────────────────────────── */
  /* Modal tanasi — balandligi qat'iy, o'zi skrollanmaydi: skroll HAR BIR
     ustunda alohida. Aks holda o'ngdagi qisqa ro'yxat chapdagi uzun o'q
     bilan birga sudralib, ostida katta bo'sh joy qolardi. */
  .ts-dm-body {
    height: 76vh;
  }
  /* Ikki ustun: chapda hisob-kitob, o'ngda turniketning xom ro'yxati. */
  .ts-dm-cols {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 400px;
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
    /* O'q va kartochkalardan yuqorida — ular o'z konteksti ichida qolsa ham
       zaxira sifatida ochiq farq qoldiriladi. */
    z-index: 5;
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
  /* Buyruq ma'lumoti — sababning davomi, undan xiraroq. */
  .ts-dm-reason-extra {
    margin-left: 8px;
    padding-left: 8px;
    border-left: 1px solid currentColor;
    font-variant-numeric: tabular-nums;
    opacity: 0.75;
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
   * BITTA ustun, uch qatlam ustma-ust:
   *   ① reja oynasi   — ko'k fon (ichida tushlik shtrixlab kesilgan)
   *   ② turniket      — shaffof yashil ramka («ichkarida edi»)
   *   ③ hisobga olindi — to'q yashil to'ldirish (① ∩ ② − tushlik)
   * Kesishma shu tariqa o'z-o'zidan ko'rinadi. Chapda grafik vaqtlari,
   * o'ngda turniket hodisalari — ikkalasi ham ustunga chiziq bilan ulanadi.
   * O'q QAT'IY 24 soat, kunlar bir-biri bilan solishtirilsin.
   * ───────────────────────────────────────────────────────────────────── */
  $tlHours: 44px; // eng chapda soat yozuvlari
  $tlMarkLbl: 146px; // grafik yorliqlari
  $tlLeader: 40px; // yorliqdan ustungacha chiziq
  $tlLeft: $tlHours + $tlMarkLbl + $tlLeader;
  $tlCol: 116px; // yagona ustun kengligi
  $tlEv: $tlCol + 60px; // hodisalar ro'yxati (orasi — bog'lovchi chiziq)

  /* Balandlik ATAYLAB katta: o'q qat'iy 24 soat bo'lgani uchun tushlik
     (1 soat) 440px da atigi ~18px chiqardi va yaqin oraliqlar bir-biriga
     qo'shilib ketardi. 760px da bir soat ~32px. */
  .ts-tl {
    position: relative;
    height: 760px;
    margin: 0 0 6px $tlLeft;
    /* ALOHIDA yig'ish konteksti: ichkarisidagi qatlamlar (`z-index: 1..3`)
       shu quti bilan birga chegaralanadi. Aks holda ular skrollda
       tepadagi yopishqoq ko'rsatkich plitalari USTIGA chiqib ketardi. */
    z-index: 0;
  }
  /* Qatlamlar: to'r → chiziqlar → reja → turniket → hodisa yozuvlari. */
  .ts-tl-tick {
    position: absolute;
    left: 0;
    right: 0;
    height: 0;
    border-top: 1px solid var(--surface-line);
    opacity: 0.22;
    z-index: 0;
  }
  /* Yozuvi bor (juft) soatlar biroz to'qroq — sanashda tayanch nuqta. */
  .ts-tl-tick.is-major {
    opacity: 0.5;
  }
  .ts-tl-tick-label {
    position: absolute;
    left: -#{$tlLeft};
    top: -7px;
    width: #{$tlHours - 8};
    text-align: right;
    font-size: 10px;
    font-variant-numeric: tabular-nums;
    color: var(--fig-text-tertiary);
  }

  /* ── CHAP: grafik vaqtlari ───────────────────────────────────────────── */
  .ts-tl-mark {
    position: absolute;
    right: calc(100% + #{$tlLeader});
    width: $tlMarkLbl;
    margin-top: -8px;
    text-align: right;
    font-size: 11px;
    line-height: 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: currentColor;
    z-index: 2;
  }
  .ts-tl-mark b {
    font-variant-numeric: tabular-nums;
  }
  .ts-tl-mark.is-work,
  .ts-tl-mlink.is-work {
    color: var(--fig-chip-indigo-text);
  }
  .ts-tl-mark.is-break,
  .ts-tl-mlink.is-break {
    color: var(--fig-chip-amber-text);
  }
  /* Yorliq o'qilishi uchun pastga surilgan bo'lishi mumkin — chiziq
     yorliqdan (pastda) ustundagi HAQIQIY vaqtga (yuqorida) tortiladi. */
  .ts-tl-mlink {
    position: absolute;
    right: 100%;
    width: $tlLeader;
    min-height: 1px;
    overflow: visible;
    pointer-events: none;
    opacity: 0.75;
    z-index: 1;
  }

  /* ── ① Reja oynasi ───────────────────────────────────────────────────── */
  .ts-tl-plan {
    position: absolute;
    left: 0;
    width: $tlCol;
    overflow: hidden;
    border-radius: 8px;
    background: var(--fig-chip-indigo-bg);
    border: 1px solid var(--fig-chip-indigo-text);
    z-index: 1;
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
    width: 110px;
    transform: translate(-50%, -50%);
    text-align: center;
    font-size: 10px;
    line-height: 13px;
    color: var(--fig-text-tertiary);
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

  /* ── ② Turniket intervali ────────────────────────────────────────────── */
  /* ATAYLAB shaffof: ostidagi reja oynasi ko'rinib tursin. Ramka ichida
     ko'k fon bor — demak grafik vaqti; yo'q — demak grafikdan tashqarida. */
  .ts-tl-iv {
    position: absolute;
    left: 0;
    width: $tlCol;
    /* To'ldirish ramkaning yumaloq burchaklaridan chiqib ketmasin. */
    overflow: hidden;
    border: 2px solid var(--fig-icon-green);
    border-radius: 8px;
    background: transparent;
    z-index: 2;
  }
  /* ── ③ Hisobga olingan bo'lak ────────────────────────────────────────── */
  .ts-tl-iv-counted {
    position: absolute;
    left: 0;
    right: 0;
    background: color-mix(in srgb, var(--fig-icon-green) 58%, transparent);
  }

  /* ── Yopishqoq sarlavha + izoh ────────────────────────────────────────
   * O'q 760px — bir ekranga sig'maydi. Skrollda «qaysi rang nima» yo'qolib
   * ketmasin va qatlam tanlash tugmalari qo'l ostida tursin.
   * `top` — ko'rsatkich plitalari blokining balandligi: plita 60px
   * (10 + 14 + 2 + 22 + 10 + 2px chegara) + blokning 10px ichki pastki
   * bo'shlig'i. Plitalar bilan ORASIDA tirqish qolsa, ostidagi o'q ko'rinib
   * qolardi — shuning uchun raqam aniq shu yerga bog'lab qo'yilgan. */
  $dmStatsH: 70px;

  .ts-tl-sticky {
    position: sticky;
    top: $dmStatsH;
    /* Plitalardan past (`5`), o'qdan yuqori (`.ts-tl` — 0). */
    z-index: 3;
    /* Izohning pastki chekinishi YOPISHQOQ quti ichida: tashqarida qolsa
       skrollda shu 12px orqali o'q ko'rinib o'tardi. */
    padding-bottom: 12px;
    background: var(--surface-section);
  }
  .ts-tl-sticky .ts-tl-legend {
    margin-bottom: 0;
  }
  /* Tor ekranda plitalar ikki qatorga tushadi — tayanch nuqta ham pastroq. */
  @media (max-width: 640px) {
    .ts-tl-sticky {
      top: $dmStatsH + 68px;
    }
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
  /* Izoh endi tugma — `n-` komponent emas, shuning uchun brauzer
     standartlari qo'lda so'ndiriladi. */
  .ts-tl-lg-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 8px;
    border: 1px solid transparent;
    border-radius: 999px;
    background: transparent;
    font: inherit;
    color: inherit;
    cursor: pointer;
    transition:
      opacity 0.15s ease,
      background 0.15s ease,
      border-color 0.15s ease;
  }
  .ts-tl-lg-btn:hover {
    background: color-mix(in srgb, var(--surface-line) 35%, transparent);
  }
  .ts-tl-lg-btn.is-active {
    border-color: var(--surface-line);
    background: var(--surface-section);
    font-weight: 600;
    color: var(--fig-text-primary);
  }
  /* Tanlanmaganlari xiralashadi — ko'z darrov tanlanganini topadi. */
  .ts-tl-lg-btn.is-dim {
    opacity: 0.45;
  }

  /* ── Qatlamni ajratib ko'rsatish ──────────────────────────────────────
   * Ustma-ust turgan to'rt qatlamdan bittasi tanlanadi: tanlangani
   * kuchayadi (qalin chegara + halqa), qolganlari so'nadi.
   * DIQQAT: tushlik reja ICHIDA, «hisobga olindi» esa interval ichida —
   * shuning uchun ota-element `opacity` bilan emas, rang/chegara bilan
   * so'ndiriladi, aks holda bola-element ham birga xiralashib ketardi. */
  .ts-tl.is-focus .ts-tl-plan,
  .ts-tl.is-focus .ts-tl-iv,
  .ts-tl.is-focus .ts-tl-plan-lunch,
  .ts-tl.is-focus .ts-tl-iv-counted,
  .ts-tl.is-focus .ts-tl-mark,
  .ts-tl.is-focus .ts-tl-mlink,
  .ts-tl.is-focus .ts-tl-ev,
  .ts-tl.is-focus .ts-tl-link {
    transition:
      opacity 0.15s ease,
      background 0.15s ease,
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  /* Reja oynasi so'ngan holat — foni yo'q, chegarasi zo'rg'a ko'rinadi. */
  .ts-tl.is-focus-lunch .ts-tl-plan,
  .ts-tl.is-focus-raw .ts-tl-plan,
  .ts-tl.is-focus-counted .ts-tl-plan {
    background: transparent;
    border-color: color-mix(in srgb, var(--fig-chip-indigo-text) 22%, transparent);
  }
  /* Interval ramkasi so'ngan holat. */
  .ts-tl.is-focus-plan .ts-tl-iv,
  .ts-tl.is-focus-lunch .ts-tl-iv {
    border-color: color-mix(in srgb, var(--fig-icon-green) 20%, transparent);
  }
  .ts-tl.is-focus-counted .ts-tl-iv {
    border-color: color-mix(in srgb, var(--fig-icon-green) 30%, transparent);
  }
  /* Ichkaridagi bo'laklar — bular bola element, opacity bemalol. */
  .ts-tl.is-focus-plan .ts-tl-iv-counted,
  .ts-tl.is-focus-lunch .ts-tl-iv-counted,
  .ts-tl.is-focus-raw .ts-tl-iv-counted {
    opacity: 0.18;
  }
  .ts-tl.is-focus-raw .ts-tl-plan-lunch,
  .ts-tl.is-focus-counted .ts-tl-plan-lunch {
    opacity: 0.15;
  }
  .ts-tl.is-focus-plan .ts-tl-plan-lunch {
    opacity: 0.3;
  }

  /* Tanlangan qatlam — qalinroq chegara va tashqi halqa. */
  .ts-tl.is-focus-plan .ts-tl-plan {
    border-width: 2px;
    background: color-mix(in srgb, var(--fig-chip-indigo-text) 14%, var(--fig-chip-indigo-bg));
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--fig-chip-indigo-text) 22%, transparent);
  }
  .ts-tl.is-focus-lunch .ts-tl-plan-lunch {
    border-top-style: solid;
    border-bottom-style: solid;
    border-top-width: 2px;
    border-bottom-width: 2px;
    background: repeating-linear-gradient(
      -45deg,
      color-mix(in srgb, var(--fig-icon-amber) 70%, transparent) 0 4px,
      color-mix(in srgb, var(--fig-icon-amber) 16%, transparent) 4px 8px
    );
  }
  .ts-tl.is-focus-raw .ts-tl-iv {
    border-width: 3px;
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--fig-icon-green) 22%, transparent);
  }
  .ts-tl.is-focus-counted .ts-tl-iv-counted {
    background: var(--fig-icon-green);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--fig-icon-green) 30%, transparent);
  }

  /* Chap yorliqlar va o'ng hodisalar ham tanlovga ergashadi: grafik
     tanlansa — grafik vaqtlari, turniket tanlansa — kirish/chiqishlar. */
  .ts-tl.is-focus-raw .ts-tl-mark,
  .ts-tl.is-focus-raw .ts-tl-mlink,
  .ts-tl.is-focus-counted .ts-tl-mark,
  .ts-tl.is-focus-counted .ts-tl-mlink {
    opacity: 0.3;
  }
  .ts-tl.is-focus-plan .ts-tl-mark.is-break,
  .ts-tl.is-focus-plan .ts-tl-mlink.is-break,
  .ts-tl.is-focus-lunch .ts-tl-mark.is-work,
  .ts-tl.is-focus-lunch .ts-tl-mlink.is-work {
    opacity: 0.3;
  }
  .ts-tl.is-focus-plan .ts-tl-ev,
  .ts-tl.is-focus-plan .ts-tl-link,
  .ts-tl.is-focus-lunch .ts-tl-ev,
  .ts-tl.is-focus-lunch .ts-tl-link {
    opacity: 0.35;
  }
  .ts-lg {
    flex-shrink: 0;
    width: 14px;
    height: 10px;
    border-radius: 3px;
  }
  .ts-lg.is-counted {
    background: color-mix(in srgb, var(--fig-icon-green) 58%, transparent);
    border: 1px solid var(--fig-icon-green);
  }
  .ts-lg.is-raw {
    background: transparent;
    border: 2px solid var(--fig-icon-green);
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
  .ts-lg.is-empty {
    background: transparent;
    border: 1px dashed var(--surface-line);
  }

  /* ── Ustun ↔ hodisa bog'lovchisi ──────────────────────────────────────
   * Quti yuqori cheti — HAQIQIY vaqt (ustun chetiga to'g'ri keladi),
   * pastki cheti — surilgan yozuv markazi. TO'G'RI chiziq: burchakli
   * «tirsak» tutashish joyida har doim notekis ko'rinardi. */
  .ts-tl-link {
    position: absolute;
    left: $tlCol;
    width: $tlEv - $tlCol - 3px;
    min-height: 1px;
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

  /* ── O'NG: turniket hodisalari ───────────────────────────────────────── */
  .ts-tl-ev {
    position: absolute;
    left: $tlEv;
    right: 0;
    height: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
    z-index: 3;
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

  /* ── Hisob bloki ─────────────────────────────────────────────────────
   * Chizma «qayerda» ni ko'rsatadi, bu blok esa «qaysi soatdan qaysi
   * soatgacha va qancha» degan savolga raqam bilan javob beradi. */
  .ts-tl-calc {
    margin-top: 14px;
    padding: 10px 12px;
    border: 1px solid var(--surface-line);
    border-radius: 10px;
    background: var(--surface-ground-soft);
  }
  .ts-tl-calc-head {
    margin: 0 0 8px;
    font-size: 12px;
    font-weight: 600;
    color: var(--fig-text-primary);
  }
  .ts-tl-calc-block + .ts-tl-calc-block {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px dashed var(--surface-line);
  }
  .ts-tl-calc-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 2px 0;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: var(--fig-text-secondary);
  }
  /* Hisobga olingan bo'laklar xom oraliqdan ICHKARIDA — chapga surilgan
     va uzuq chiziq bilan unga bog'langan. */
  .ts-tl-calc-row.is-counted {
    margin-left: 14px;
    padding-left: 10px;
    border-left: 1px dashed var(--fig-icon-green);
    color: var(--fig-chip-green-text);
    font-weight: 600;
  }
  .ts-tl-calc-row.is-none {
    margin-left: 14px;
    padding-left: 10px;
    border-left: 1px dashed var(--surface-line);
    color: var(--fig-text-tertiary);
  }
  .ts-tl-calc-range {
    flex: 1;
  }
  .ts-tl-calc-dur {
    font-weight: 700;
    color: var(--fig-text-primary);
  }
  .ts-tl-calc-row.is-counted .ts-tl-calc-dur {
    color: var(--fig-chip-green-text);
  }
  .ts-tl-calc-row.is-none .ts-tl-calc-dur {
    color: var(--fig-text-tertiary);
  }
  .ts-tl-calc-total {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--surface-line);
    font-size: 12px;
    color: var(--fig-text-tertiary);
  }
  .ts-tl-calc-total b {
    font-size: 15px;
    font-variant-numeric: tabular-nums;
    color: var(--fig-chip-green-text);
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
    /* `.ts-root` 16px gap beradi — sahifalash jadval va pastki panelga
       yaqinroq tursin uchun manfiy margin bilan 4px ga tortiladi. */
    margin: -12px 0;
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
    cursor: pointer;
    user-select: none;
  }
  /* Bosilgan — tanlov vaqtincha o'chirilgan (qiymat selectlarda qoladi). */
  .ts-preview-cell.ts-preview-off {
    border-style: dashed;
    opacity: 0.4;
  }
  /* Panjara katakchasining yashil hover'i bu yerda keraksiz — namuna
     katakcha emas, tugma. */
  .ts-preview-cell:hover {
    box-shadow: none;
  }
  /* Faol va tanlov bor — asosiy rang va sekin to'lqin, sezilib tursin. */
  .ts-preview-cell.ts-preview-on,
  .ts-preview-cell.ts-preview-on:hover {
    border-color: var(--fig-icon-brand);
    box-shadow: 0 0 0 1px var(--fig-icon-brand);
  }
  .ts-preview-cell.ts-preview-on::before,
  .ts-preview-cell.ts-preview-on::after {
    content: '';
    position: absolute;
    inset: 0;
    border: 2px solid var(--fig-icon-brand);
    pointer-events: none;
    animation: ts-preview-ripple 2.4s ease-out infinite;
  }
  .ts-preview-cell.ts-preview-on::before {
    animation-delay: 1.2s;
  }
  @keyframes ts-preview-ripple {
    from {
      opacity: 0.7;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(1.35);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .ts-preview-cell.ts-preview-on::before {
      display: none;
    }
    .ts-preview-cell.ts-preview-on::after {
      animation: none;
      opacity: 0.7;
    }
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

  /* Tozalash rejimi YOQILGANINI bildiradi — tugma atrofida sekin to'lqin.
     Ikki halqa yarim davr farq bilan chiqadi, shunda uzilish sezilmaydi. */
  .ts-clear-active {
    position: relative;
  }
  .ts-clear-active::before,
  .ts-clear-active::after {
    content: '';
    position: absolute;
    inset: 0;
    /* `currentColor` EMAS: faol tugmaning matni oq, halqa oq fonda ko'rinmaydi. */
    border: 2px solid var(--fig-icon-red);
    border-radius: inherit;
    pointer-events: none;
    animation: ts-clear-ripple 2.4s ease-out infinite;
  }
  .ts-clear-active::before {
    animation-delay: 1.2s;
  }
  @keyframes ts-clear-ripple {
    from {
      opacity: 0.7;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(1.45);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .ts-clear-active::before {
      display: none;
    }
    .ts-clear-active::after {
      animation: none;
      opacity: 0.7;
    }
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
