<script setup>
  /* ---------------------------------------------------------------------------
   * Kun tafsiloti — Figma «HRM Railway» v3 (node 3690:66416).
   *
   * Eski oyna (`Timesheet.vue` ichidagi `.ts-detail-modal`) O'ZGARMADI va
   * o'sha faylda turibdi. Bu — ALOHIDA komponent: maketning o'zi boshqa
   * (vaqt o'qi VERTIKALDAN GORIZONTALGA o'tgan, ko'rsatkichlar va yon panel
   * qayta tuzilgan), shuning uchun eskisini «tuzatish» emas, yangisini yozish
   * arzonroq va eskisi ishlashda davom etadi.
   *
   * Ma'lumot manbai — o'sha `store.dayDetail(...)`, semantikasi o'zgarmadi.
   * ------------------------------------------------------------------------ */
  import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
  import dayjs from 'dayjs'
  import { Dismiss20Regular, ReOrderDotsVertical16Filled } from '@vicons/fluent'
  import { useTimesheetWorkerStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import IconPlan from '@/assets/icons/tsCalendarCheck.svg'
  import IconTurnstile from '@/assets/icons/tsDoorOpen.svg'
  import IconOutside from '@/assets/icons/tsUpload.svg'
  import IconCounted from '@/assets/icons/tsClipboardCheck.svg'

  const { t } = i18n.global
  const store = useTimesheetWorkerStore()

  const props = defineProps({
    visible: { type: Boolean, default: false },
    // Panjaradagi qator: { id, name, full_name, photo, position, table }
    worker: { type: Object, default: null },
    date: { type: String, default: '' }
  })
  const emit = defineEmits(['update:visible', 'update:date'])

  const show = computed({
    get: () => props.visible,
    set: (v) => emit('update:visible', v)
  })

  /* --- Ma'lumot ----------------------------------------------------------- */
  const detail = ref(null)
  const loading = ref(false)

  const load = async () => {
    if (!props.visible || !props.worker?.id || !props.date) return
    loading.value = true
    detail.value = null
    try {
      detail.value = await store.dayDetail(props.worker.id, props.date)
    } finally {
      loading.value = false
    }
    await nextTick()
    centerOnPlan()
    syncThumb()
  }

  watch(() => [props.visible, props.worker?.id, props.date], load, { immediate: true })

  /* --- Sarlavha ----------------------------------------------------------- */
  const longWeek = {
    0: t('longWeek.Sun'),
    1: t('longWeek.Mon'),
    2: t('longWeek.Tue'),
    3: t('longWeek.Wed'),
    4: t('longWeek.Thu'),
    5: t('longWeek.Fri'),
    6: t('longWeek.Sat')
  }

  const workerName = computed(() => props.worker?.full_name || props.worker?.name || '')
  const initials = computed(() =>
    workerName.value
      .split(/[\s.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('')
  )
  const dateLabel = computed(() => {
    if (!props.date) return ''
    const d = dayjs(props.date)
    return `${d.format('DD.MM.YYYY')}, ${longWeek[d.day()]}`
  })

  // Kunma-kun yurish — oy ichida, `store.days` chegarasida.
  const dayIndex = computed(() =>
    props.date ? store.days.findIndex((d) => d.day === dayjs(props.date).date()) : -1
  )
  const hasPrev = computed(() => dayIndex.value > 0)
  const hasNext = computed(() => dayIndex.value > -1 && dayIndex.value < store.days.length - 1)
  const go = (dir) => {
    const next = store.days[dayIndex.value + dir]
    if (!next) return
    emit('update:date', dayjs(props.date).date(next.day).format('YYYY-MM-DD'))
  }

  /* --- Vaqt yordamchilari ------------------------------------------------- */
  const minutesToHm = (m) =>
    m == null ? '—' : `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`

  /* «Qanday hisoblandi» jadvalida davomiylik SO'Z bilan yoziladi.
   * «3:37» soat ko'rsatkichi (12:24 kabi) bilan adashtirilardi — bu yerda esa
   * u DAVOMIYLIK, ya'ni boshqa narsa. Chizmadagi va tepadagi ko'rsatkichlar
   * ixcham shaklda qoladi: u yerda joy yo'q va kontekst aniq. */
  const durationParts = (m) => {
    if (m == null) return null
    const h = Math.floor(m / 60)
    const mi = m % 60
    const out = []
    if (h) out.push({ n: h, u: t('timesheetPage.hourUnit') })
    // Butun soat bo'lsa «0 daqiqa» yozilmaydi; lekin soat 0 bo'lsa daqiqa
    // shart — aks holda qiymat umuman ko'rinmay qolardi.
    if (mi || !h) out.push({ n: mi, u: t('timesheetPage.minuteUnit') })
    return out
  }

  const minutesToWords = (m) => {
    const parts = durationParts(m)
    return parts ? parts.map((x) => `${x.n} ${x.u}`).join(' ') : '—'
  }
  const fmtMin = (m) =>
    m == null
      ? '—'
      : `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
  const hm = (v) => (v ? String(v).slice(11, 16) : '—')
  const exact = (v) => (v ? String(v).slice(11, 19) : '—')
  // Nuqtalar soniyagacha joylashadi: 12:23:57 va 12:24:03 bir xil daqiqada,
  // lekin ular AYRIM o'tishlar — chizmada ham shunday ko'rinishi kerak.
  const secOfDay = (v) => {
    if (!v) return null
    const p = String(v).slice(11, 19).split(':')
    if (p.length < 2) return null
    return Number(p[0]) * 3600 + Number(p[1]) * 60 + Number(p[2] || 0)
  }
  const minOfDay = (v) => {
    if (!v) return null
    const p = String(v).slice(11, 16).split(':')
    return Number(p[0]) * 60 + Number(p[1])
  }
  const hhmmToMin = (v, endOfDay = false) => {
    if (!v) return null
    const m = Number(String(v).slice(0, 2)) * 60 + Number(String(v).slice(3, 5))
    return endOfDay && m === 0 ? 1440 : m
  }
  const isMobileEvent = (e) => String(e?.auth_type || '').toLowerCase().includes('mobile')

  /* --- Chizma geometriyasi ------------------------------------------------
   * Maketda soat kengligi 64px. Chetki otstup maketdagi 16px dan 24px ga
   * kattalashtirildi: soat yorlig'i o'z chizig'ida MARKAZLASHADI, ya'ni
   * «00:00» ning chap yarmi (≈17px) maydondan chiqib qirqilardi.
   * --------------------------------------------------------------------- */
  const HOUR_W = 64
  const PAD = 24
  const PLOT_W = PAD * 2 + 24 * HOUR_W
  const px = (m) => PAD + (m / 60) * HOUR_W

  const ticks = computed(() =>
    Array.from({ length: 25 }, (_, h) => ({
      h,
      x: px(h * 60),
      label: `${String(h).padStart(2, '0')}:00`
    }))
  )

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

  const band = (a, b) => ({ left: `${px(a)}px`, width: `${px(b) - px(a)}px` })

  const planBand = computed(() => {
    const w = workWindow.value
    if (!w) return null
    const width = px(w[1]) - px(w[0])
    return {
      style: band(w[0], w[1]),
      // Yorliqlar zolak ichiga sig'masa ko'rsatilmaydi: vaqt — 120px dan,
      // «Ish boshlanishi / Ish tugashi» so'zlari esa ikki tomonga joy
      // bo'lgandagina (≈4 soatlik smena).
      wide: width >= 120,
      words: width >= 260,
      from: fmtMin(w[0]),
      to: fmtMin(w[1])
    }
  })
  const lunchBand = computed(() => {
    const l = lunchWindow.value
    if (!l) return null
    return {
      style: band(l[0], l[1]),
      wide: px(l[1]) - px(l[0]) >= 56,
      // Tushlik odatda 1 soat = 64px; «13:00 – 14:00» u yerga sig'maydi,
      // shuning uchun vaqtlar zolak OSTIDA, markaziga tenglab yoziladi.
      capStyle: { left: `${(px(l[0]) + px(l[1])) / 2}px` },
      from: fmtMin(l[0]),
      to: fmtMin(l[1])
    }
  })

  /* Turniket intervallari va ular ichidan HISOBGA OLINGAN bo'laklar.
   * Qoida eski oynadagi bilan bir xil: grafik oynasiga tushgan, tushlikdan
   * tashqari qism. Farqi — foizlar emas, piksellar (o'q gorizontal). */
  const intervals = computed(() =>
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
            for (const [y, z] of raw) {
              if (z <= y) continue
              counted += z - y
              parts.push({
                style: band(y, z),
                wide: px(z) - px(y) >= 48,
                dur: minutesToHm(z - y),
                durText: minutesToWords(z - y),
                from: fmtMin(y),
                to: fmtMin(z)
              })
              ranges.push({ from: fmtMin(y), to: fmtMin(z) })
            }
          }
        }
        return {
          from: fmtMin(a),
          to: fmtMin(b),
          durText: minutesToWords(sg.minutes),
          countedText: minutesToWords(counted),
          parts,
          ranges,
          style: band(a, b)
        }
      })
  )

  /* Hodisa nuqtalari.
   *
   * Manba — XOM `events`, segment chegaralari EMAS. Backend ketma-ket bir xil
   * yo'nalishdagi o'tishlardan bittasini tanlaydi; tanlanmagani ham qurilmada
   * bo'lgan, shuning uchun chizmada ko'rinishi kerak — lekin boshqacha:
   * segmentga tushgani «hisobda», qolgani «juftlanmagan» (kulrang).
   *
   * Yaqin turganlari BITTA rozetkaga yig'iladi: 64px/soat da 18px ≈ 17 daqiqa,
   * undan yaqin o'tishlarni ko'z baribir ajratmaydi. Rozetka BOSILADI — ichida
   * necha marta va qaysi soniyada kirib-chiqilgani ro'yxat bo'lib ochiladi.
   */
  const CLUSTER_PX = 18

  // Segmentga tushgan vaqtlar — aynan shular hisobga olingan.
  const usedAt = computed(() => {
    const set = new Set()
    for (const sg of detail.value?.segments ?? []) {
      if (sg.type === 'break') continue
      if (sg.from) set.add(String(sg.from))
      if (sg.to) set.add(String(sg.to))
    }
    return set
  })

  const marks = computed(() => {
    const used = usedAt.value
    const raw = (detail.value?.events ?? [])
      .map((e) => ({
        at: String(e.at),
        s: secOfDay(e.at),
        dir: Boolean(e.direction),
        device: e.device_name || '—',
        mobile: isMobileEvent(e),
        used: used.has(String(e.at))
      }))
      .filter((e) => e.s != null)
      .sort((a, b) => a.s - b.s)

    const groups = []
    for (const e of raw) {
      const last = groups[groups.length - 1]
      if (last && last.dir === e.dir && px(e.s / 60) - px(last.s2 / 60) < CLUSTER_PX) {
        last.items.push(e)
        last.s2 = e.s
      } else groups.push({ dir: e.dir, s1: e.s, s2: e.s, items: [e] })
    }

    return groups.map((g) => {
      // Guruhda hisobga olingani bo'lmasa — butun rozetka kulrang.
      const anyUsed = g.items.some((i) => i.used)
      const x = (px(g.s1 / 60) + px(g.s2 / 60)) / 2
      return {
        dir: g.dir,
        items: g.items,
        count: g.items.length,
        x,
        left: `${x}px`,
        tone: anyUsed ? (g.dir ? 'is-in' : 'is-out') : 'is-idle',
        title: g.items.map((i) => exact(i.at)).join(', ')
      }
    })
  })

  /* --- Rozetka bosilganda ochiladigan ro'yxat ----------------------------- */
  const ROWS_W = 105 // qator nomlari ustuni (104px) + 1px chegara
  const POP_W = 520

  const openMark = ref(null)
  const scrollLeft = ref(0)
  const chartW = ref(0)

  const closeMark = () => {
    openMark.value = null
  }
  const toggleMark = (i) => {
    openMark.value = openMark.value === i ? null : i
  }
  // Boshqa kunga o'tilsa indeks boshqa hodisaga to'g'ri kelib qolardi.
  watch(detail, closeMark)

  const popover = computed(() => {
    const mk = marks.value[openMark.value]
    if (!mk) return null
    const w = Math.min(POP_W, Math.max(240, chartW.value))
    // Rozetkaning KO'RINADIGAN maydondagi o'rni — skroll siljishi hisobga olinadi.
    const anchor = ROWS_W + mk.x - scrollLeft.value
    const cardLeft = Math.min(Math.max(0, anchor - w / 2), Math.max(0, chartW.value - w))
    const span = mk.items[mk.count - 1].s - mk.items[0].s
    const dirLabel = mk.dir ? t('timesheetPage.enter') : t('timesheetPage.exit')
    return {
      width: w,
      cardLeft,
      arrowLeft: Math.min(Math.max(14, anchor - cardLeft), w - 14),
      // Rozetka skrollda chetga chiqib ketsa oyna ham ko'rinmaydi.
      visible: anchor > ROWS_W - 12 && anchor < chartW.value + 12,
      title:
        mk.count > 1 ? t('timesheetPage.clusterCount', { n: mk.count, dir: dirLabel }) : dirLabel,
      sub:
        mk.count > 1
          ? `${exact(mk.items[0].at)} – ${exact(mk.items[mk.count - 1].at)} · ${
              span < 60
                ? t('timesheetPage.withinSeconds', { n: span })
                : t('timesheetPage.withinMinutes', { n: Math.round(span / 60) })
            }`
          : exact(mk.items[0].at),
      items: mk.items.map((e) => ({
        ...e,
        time: exact(e.at),
        dirLabel: e.dir ? t('timesheetPage.enter') : t('timesheetPage.exit'),
        tone: e.used ? (e.dir ? 'is-in' : 'is-out') : 'is-idle'
      }))
    }
  })

  // Yon paneldagi jadvalda shu hodisalar ajratiladi: rozetka va ro'yxat bitta
  // narsa haqida ekani ko'rinib tursin.
  const markedAt = computed(() => new Set(popover.value?.items.map((e) => e.at) ?? []))

  const evList = ref(null)
  watch(markedAt, async (set) => {
    if (!set.size) return
    await nextTick()
    evList.value?.querySelector('.is-marked')?.scrollIntoView({ block: 'nearest' })
  })

  /* --- Ko'rsatkich kartochkalari ------------------------------------------ */
  const stats = computed(() => [
    {
      key: 'plan',
      tone: 'lime',
      icon: IconPlan,
      label: t('timesheetPage.planMinutes'),
      parts: durationParts(detail.value?.plan_minutes)
    },
    {
      key: 'turnstile',
      tone: 'indigo',
      icon: IconTurnstile,
      label: t('timesheetPage.inTurnstile'),
      parts: durationParts(detail.value?.fact_minutes)
    },
    {
      key: 'outside',
      tone: 'green',
      icon: IconOutside,
      rotate: true,
      label: t('timesheetPage.breakTotal'),
      parts: durationParts(detail.value?.outside_minutes ?? 0)
    },
    {
      key: 'counted',
      tone: 'amber',
      icon: IconCounted,
      label: t('timesheetPage.countedFull'),
      parts: durationParts(detail.value?.counted_minutes)
    }
  ])

  /* --- Yon panel ---------------------------------------------------------- */
  // Kun holati: ta'til > bayram > grafikdagi ish/dam kuni.
  const dayBadge = computed(() => {
    const d = detail.value
    if (!d) return null
    if (d.vacation_type) return { tone: 'amber', text: t('timesheetPage.byVacation') }
    if (d.is_holiday) return { tone: 'red', text: d.holiday_name || t('timesheetPage.restDay') }
    if (d.schedule?.work_status === 1) return { tone: 'green', text: t('timesheetPage.workDay') }
    return { tone: 'gray', text: t('timesheetPage.restDay') }
  })

  // Nega shunday chiqqani: ta'til buyrug'i yoki soat 0 sababi. Maketda alohida
  // blok yo'q — ro'yxatning oddiy qatori bo'lib qo'shiladi.
  const reasonText = computed(() => {
    const d = detail.value
    if (!d) return null
    if (d.vacation_type) {
      const c = d.vacation_command
      return (
        [
          c?.number ? `${t('timesheetPage.commandNo')} ${c.number}` : null,
          c?.date ? dayjs(c.date).format('DD.MM.YYYY') : null
        ]
          .filter(Boolean)
          .join(' · ') || null
      )
    }
    if (d.zero_reason) return t(`timesheetPage.zero_${d.zero_reason}`)
    return null
  })

  const infoRows = computed(() => {
    const d = detail.value
    const sch = d?.schedule
    const br = d?.planned_break
    const out = [
      {
        key: 'time',
        label: t('timesheetPage.planTime'),
        value:
          sch?.start_time && sch?.end_time
            ? `${sch.start_time.slice(0, 5)} – ${sch.end_time.slice(0, 5)}`
            : t('timesheetPage.notSet')
      },
      {
        key: 'lunch',
        label: t('timesheetPage.lgLunch'),
        value: br ? `${br.start_time.slice(0, 5)} – ${br.end_time.slice(0, 5)}` : t('timesheetPage.notSet')
      },
      {
        key: 'plan',
        label: t('timesheetPage.planMinutes'),
        value: minutesToWords(d?.plan_minutes)
      },
      {
        key: 'turnstile',
        label: t('timesheetPage.tabTurnstile'),
        value: d?.turnstile?.first_in
          ? `${hm(d.turnstile.first_in)} – ${hm(d.turnstile.last_out)}`
          : '—'
      }
    ]
    if (reasonText.value) out.push({ key: 'reason', label: t('timesheetPage.reasonHead'), value: reasonText.value })
    return out
  })

  /* --- Izohlar: bosilgan qatlam ajratiladi, qolgani xiralashadi ----------- */
  const legend = [
    { key: 'plan', label: 'timesheetPage.lgPlan' },
    { key: 'lunch', label: 'timesheetPage.lgLunch' },
    { key: 'raw', label: 'timesheetPage.inside' },
    { key: 'counted', label: 'timesheetPage.countedShort' },
    { key: 'events', label: 'timesheetPage.eventsShort' }
  ]
  const focus = ref('')
  const toggleFocus = (key) => {
    focus.value = focus.value === key ? '' : key
  }

  /* --- Yon panel kengligi ------------------------------------------------
   * Standart o'lcham — maketdagidek; foydalanuvchi ajratgichni sudrab
   * o'zgartira oladi. Tanlovi saqlanadi, aks holda oyna har ochilganda
   * standartga qaytib, sozlashning ma'nosi qolmasdi.
   * --------------------------------------------------------------------- */
  const ASIDE_KEY = 'hrm.timesheet.dayDetail.asideWidth'
  const ASIDE_DEFAULT = 300
  const ASIDE_MIN = 240
  const ASIDE_MAX = 560

  const asideW = ref(ASIDE_DEFAULT)
  try {
    const saved = Number(localStorage.getItem(ASIDE_KEY))
    if (saved >= ASIDE_MIN && saved <= ASIDE_MAX) asideW.value = saved
  } catch {
    // localStorage yopiq (private rejim) — standart o'lcham qoladi.
  }
  const saveAside = () => {
    try {
      localStorage.setItem(ASIDE_KEY, String(asideW.value))
    } catch {
      // saqlanmasa ham joriy seansda ishlaydi.
    }
  }

  // Sudrash paytida tutqich yoqilgan holatda qoladi (sichqoncha undan chiqib
  // ketsa ham) — foydalanuvchi nimani boshqarayotganini yo'qotmasin.
  const dragging = ref(false)

  let splitDrag = null
  const onSplitMove = (e) => {
    if (!splitDrag) return
    // Ajratgich CHAPGA surilsa panel kengayadi — shuning uchun ayirma teskari.
    asideW.value = Math.min(
      Math.max(ASIDE_MIN, splitDrag.w - (e.clientX - splitDrag.x)),
      ASIDE_MAX
    )
  }
  const onSplitUp = () => {
    if (!splitDrag) return
    splitDrag = null
    dragging.value = false
    document.body.style.userSelect = ''
    saveAside()
    window.removeEventListener('pointermove', onSplitMove)
    window.removeEventListener('pointerup', onSplitUp)
  }
  const onSplitDown = (e) => {
    splitDrag = { x: e.clientX, w: asideW.value }
    dragging.value = true
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', onSplitMove)
    window.addEventListener('pointerup', onSplitUp)
  }
  const resetAside = () => {
    asideW.value = ASIDE_DEFAULT
    saveAside()
  }

  /* --- Gorizontal skroll va maketdagi o'z skrollbari ---------------------- */
  const viewport = ref(null)
  const track = ref(null)
  const chart = ref(null)
  const thumb = reactive({ left: 0, width: 0 })

  // Chizma kengligi oynani joylashtirish uchun kerak — modal `96vw` gacha
  // cho'zilgani uchun uni qat'iy songa bog'lab bo'lmaydi.
  let ro = null
  watch(chart, (el) => {
    ro?.disconnect()
    ro = null
    if (!el) return
    chartW.value = el.clientWidth
    ro = new ResizeObserver(() => {
      chartW.value = el.clientWidth
      syncThumb()
    })
    ro.observe(el)
  })

  const syncThumb = () => {
    const v = viewport.value
    const tr = track.value
    if (v) scrollLeft.value = v.scrollLeft
    if (!v || !tr) return
    const tw = tr.clientWidth
    thumb.width = Math.max(24, (v.clientWidth / v.scrollWidth) * tw)
    const maxScroll = v.scrollWidth - v.clientWidth
    const maxLeft = tw - thumb.width
    thumb.left = maxScroll > 0 ? (v.scrollLeft / maxScroll) * maxLeft : 0
  }

  // Ochilganda ish oynasi markazga keladi — sutkaning 00:00 i emas, xodimning
  // ish vaqti ko'rinishi kerak.
  const centerOnPlan = () => {
    const v = viewport.value
    if (!v) return
    const w = workWindow.value
    const center = w ? (px(w[0]) + px(w[1])) / 2 : PLOT_W / 2
    v.scrollLeft = Math.max(0, center - v.clientWidth / 2)
  }

  let drag = null
  const onMove = (e) => {
    const v = viewport.value
    const tr = track.value
    if (!drag || !v || !tr) return
    const maxLeft = tr.clientWidth - thumb.width
    const left = Math.min(Math.max(0, drag.left + e.clientX - drag.x), maxLeft)
    v.scrollLeft = maxLeft > 0 ? (left / maxLeft) * (v.scrollWidth - v.clientWidth) : 0
  }
  const onUp = () => {
    drag = null
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }
  const onThumbDown = (e) => {
    drag = { x: e.clientX, left: thumb.left }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }
  // Yo'lakning bo'sh joyiga bosilsa — g'altak shu nuqtaga markazlashadi.
  const onTrackDown = (e) => {
    const v = viewport.value
    const tr = track.value
    if (!v || !tr) return
    const maxLeft = tr.clientWidth - thumb.width
    const left = Math.min(
      Math.max(0, e.clientX - tr.getBoundingClientRect().left - thumb.width / 2),
      maxLeft
    )
    v.scrollLeft = maxLeft > 0 ? (left / maxLeft) * (v.scrollWidth - v.clientWidth) : 0
  }

  // Esc oynani yopadi — modalgacha yetib bormasin, aks holda butun tafsilot
  // yopilib ketardi. Tashqariga bosilganda ham yopiladi (belgilar `.stop`).
  const onKey = (e) => {
    if (e.key !== 'Escape' || openMark.value === null) return
    e.stopPropagation()
    closeMark()
  }

  window.addEventListener('resize', syncThumb)
  window.addEventListener('keydown', onKey, true)
  document.addEventListener('click', closeMark)
  onBeforeUnmount(() => {
    window.removeEventListener('resize', syncThumb)
    window.removeEventListener('keydown', onKey, true)
    document.removeEventListener('click', closeMark)
    ro?.disconnect()
    onUp()
    onSplitUp()
  })
</script>

<template>
  <n-modal v-model:show="show" class="tsd-modal">
    <div class="tsd">
      <!-- ── Sarlavha: kim / qaysi kun / yopish ──────────────────────────── -->
      <header class="tsd-head">
        <div class="tsd-id">
          <n-avatar
            v-if="worker?.photo"
            :fallback-src="Utils.noAvailableImage"
            :size="40"
            :src="worker.photo"
            circle
          />
          <span v-else class="tsd-id-ava">{{ initials }}</span>
          <div class="tsd-id-text">
            <span class="tsd-id-name">{{ workerName }}</span>
            <span class="tsd-id-sub">
              <span v-if="worker?.table" class="tsd-id-badge">{{ worker.table }}</span>
              <span>{{ worker?.position || $t('content.noAvailable') }}</span>
            </span>
          </div>
        </div>

        <div class="tsd-nav">
          <button
            :disabled="!hasPrev"
            :title="$t('timesheetPage.prevDay')"
            class="tsd-nav-btn"
            type="button"
            @click="go(-1)"
          >
            ‹
          </button>
          <span class="tsd-nav-date">{{ dateLabel }}</span>
          <button
            :disabled="!hasNext"
            :title="$t('timesheetPage.nextDay')"
            class="tsd-nav-btn"
            type="button"
            @click="go(1)"
          >
            ›
          </button>
        </div>

        <button :title="$t('content.close')" class="tsd-close" type="button" @click="show = false">
          <n-icon :component="Dismiss20Regular" size="20" />
        </button>
      </header>

      <n-spin :show="loading">
        <div class="tsd-body">
          <!-- ── Chap ustun ──────────────────────────────────────────────── -->
          <div class="tsd-main">
            <!-- ① Ko'rsatkichlar — javobning O'ZI birinchi ekranda. -->
            <div class="tsd-stats">
              <div v-for="s in stats" :key="s.key" :class="`is-${s.tone}`" class="tsd-stat">
                <div class="tsd-stat-top">
                  <span class="tsd-stat-ico">
                    <component :is="s.icon" :class="{ 'is-rot': s.rotate }" />
                  </span>
                  <span :title="s.label" class="tsd-stat-label">{{ s.label }}</span>
                </div>
                <div class="tsd-stat-num">
                  <template v-if="s.parts">
                    <span v-for="(d, i) in s.parts" :key="i" class="tsd-stat-part">
                      <b>{{ d.n }}</b><i>{{ d.u }}</i>
                    </span>
                  </template>
                  <b v-else>—</b>
                </div>
                <component :is="s.icon" :class="{ 'is-rot': s.rotate }" class="tsd-stat-wm" />
              </div>
            </div>

            <!-- ② Kun bo'ylab — gorizontal vaqt o'qi -->
            <section class="tsd-card">
              <div class="tsd-card-head">
                <h4 class="tsd-card-title">{{ $t('timesheetPage.dayScale') }}</h4>
                <div class="tsd-legend">
                  <button
                    v-for="lg in legend"
                    :key="lg.key"
                    :aria-pressed="focus === lg.key"
                    :class="{ 'is-active': focus === lg.key, 'is-dim': focus && focus !== lg.key }"
                    class="tsd-lg-btn"
                    type="button"
                    @click="toggleFocus(lg.key)"
                  >
                    <i :class="`is-${lg.key}`" class="tsd-sw"></i>{{ $t(lg.label) }}
                  </button>
                </div>
              </div>

              <div ref="chart" class="tsd-chart">
                <!-- Qator nomlari skrollda joyida qoladi -->
                <div class="tsd-rows">
                  <span class="tsd-row-label is-plan">{{ $t('timesheetPage.lgPlan') }}</span>
                  <span class="tsd-row-label is-turn">{{ $t('timesheetPage.tabTurnstile') }}</span>
                  <span class="tsd-row-label is-ev">{{ $t('timesheetPage.eventsShort') }}</span>
                </div>

                <div ref="viewport" class="tsd-viewport" @scroll="syncThumb">
                  <div
                    :class="focus ? `is-focus is-focus-${focus}` : ''"
                    :style="{ width: `${PLOT_W}px` }"
                    class="tsd-plot"
                  >
                    <template v-for="tk in ticks" :key="tk.h">
                      <span :style="{ left: `${tk.x}px` }" class="tsd-grid"></span>
                      <span :style="{ left: `${tk.x}px` }" class="tsd-tick">{{ tk.label }}</span>
                    </template>

                    <!-- Reja oynasi va uning ichidagi tushlik -->
                    <span v-if="planBand" :style="planBand.style" class="tsd-band is-plan">
                      <template v-if="planBand.wide">
                        <span class="tsd-band-t is-s">
                          <b>{{ planBand.from }}</b>
                          <i v-if="planBand.words">{{ $t('timesheetPage.workStart') }}</i>
                        </span>
                        <span class="tsd-band-t is-e">
                          <b>{{ planBand.to }}</b>
                          <i v-if="planBand.words">{{ $t('timesheetPage.workEnd') }}</i>
                        </span>
                      </template>
                    </span>
                    <template v-if="lunchBand">
                      <span :style="lunchBand.style" class="tsd-band is-lunch">
                        <b v-if="lunchBand.wide">{{ $t('timesheetPage.lgLunch') }}</b>
                      </span>
                      <span :style="lunchBand.capStyle" class="tsd-lunch-cap">
                        {{ lunchBand.from }} – {{ lunchBand.to }}
                      </span>
                    </template>

                    <!-- Turniket: xom oraliq (ramka) va hisobga olingan qism -->
                    <template v-for="(iv, i) in intervals" :key="`iv-${i}`">
                      <span
                        :style="iv.style"
                        :title="`${iv.from} → ${iv.to} · ${iv.durText}`"
                        class="tsd-iv"
                      ></span>
                      <span
                        v-for="(p, j) in iv.parts"
                        :key="`p-${i}-${j}`"
                        :style="p.style"
                        :title="`${p.from} → ${p.to} · ${p.durText}`"
                        class="tsd-ct"
                      >
                        <b v-if="p.wide">{{ p.dur }}</b>
                      </span>
                    </template>

                    <!-- Kirish/chiqish belgilari — bosilsa ro'yxat ochiladi -->
                    <button
                      v-for="(mk, i) in marks"
                      :key="`mk-${i}`"
                      :class="[mk.tone, { 'is-cluster': mk.count > 1, 'is-open': openMark === i }]"
                      :style="{ left: mk.left }"
                      :title="mk.title"
                      class="tsd-mark"
                      type="button"
                      @click.stop="toggleMark(i)"
                    >
                      <template v-if="mk.count > 1">{{ mk.count }}</template>
                    </button>
                  </div>
                </div>

                <!-- Rozetka ro'yxati: necha marta va qaysi soniyada o'tilgan,
                     har biri hisobga olinganmi yoki juftlanmaganmi. -->
                <div
                  v-if="popover?.visible"
                  :style="{ left: `${popover.cardLeft}px`, width: `${popover.width}px` }"
                  class="tsd-pop"
                  @click.stop
                >
                  <span :style="{ left: `${popover.arrowLeft}px` }" class="tsd-pop-arrow"></span>
                  <div class="tsd-pop-head">
                    <div class="tsd-pop-head-t">
                      <p class="tsd-pop-title">{{ popover.title }}</p>
                      <p class="tsd-pop-sub">{{ popover.sub }}</p>
                    </div>
                    <button
                      :title="$t('content.close')"
                      class="tsd-pop-x"
                      type="button"
                      @click="closeMark"
                    >
                      <n-icon :component="Dismiss20Regular" size="18" />
                    </button>
                  </div>

                  <div class="tsd-pop-list">
                    <div v-for="(e, i) in popover.items" :key="`pe-${i}`" class="tsd-pop-row">
                      <i :class="e.tone" class="tsd-pop-dot"></i>
                      <div class="tsd-pop-txt">
                        <p class="tsd-pop-t">
                          <b>{{ e.time }}</b>
                          <span :class="e.tone">{{ e.dirLabel }}</span>
                        </p>
                        <p class="tsd-pop-dev">
                          {{ e.device }}
                          <em v-if="e.mobile">{{ $t('timesheetPage.srcMobile') }}</em>
                        </p>
                      </div>
                      <span :class="e.used ? 'is-used' : 'is-skipped'" class="tsd-pop-tag">
                        {{ e.used ? $t('timesheetPage.inCount') : $t('timesheetPage.notCounted') }}
                      </span>
                    </div>
                  </div>

                  <div class="tsd-pop-foot">
                    <span class="tsd-pop-foot-l">
                      <i class="tsd-sw is-plan"></i>
                      {{ $t('timesheetPage.rowsMarked', { n: popover.items.length }) }}
                    </span>
                    <span>{{ $t('timesheetPage.escClose') }}</span>
                  </div>
                </div>
              </div>

              <div class="tsd-sb">
                <span class="tsd-sb-spacer"></span>
                <div ref="track" class="tsd-sb-track" @pointerdown="onTrackDown">
                  <div
                    :style="{ left: `${thumb.left}px`, width: `${thumb.width}px` }"
                    class="tsd-sb-thumb"
                    @pointerdown.stop="onThumbDown"
                  ></div>
                </div>
              </div>

              <p v-if="!planBand" class="tsd-note">{{ $t('timesheetPage.noSchedule') }}</p>
            </section>

            <!-- ③ Qanday hisoblandi -->
            <section class="tsd-card">
              <h4 class="tsd-card-title">{{ $t('timesheetPage.calcHead') }}</h4>
              <div class="tsd-calc">
                <div class="tsd-calc-cols">
                  <span>{{ $t('timesheetPage.interval') }}</span>
                  <span class="tsd-calc-n">{{ $t('timesheetPage.inside') }}</span>
                  <span class="tsd-calc-n">{{ $t('timesheetPage.countedShort') }}</span>
                </div>

                <div v-if="!intervals.length" class="tsd-calc-empty">
                  {{ $t('timesheetPage.noEvents') }}
                </div>

                <div v-for="(iv, i) in intervals" :key="`c-${i}`" class="tsd-calc-row">
                  <div class="tsd-calc-ranges">
                    <span class="tsd-calc-range">
                      <i class="tsd-sw is-raw"></i>{{ iv.from }} → {{ iv.to }}
                    </span>
                    <span
                      v-for="(r, j) in iv.ranges"
                      :key="`r-${j}`"
                      class="tsd-calc-range is-counted"
                    >
                      <i class="tsd-sw is-counted"></i>{{ r.from }} → {{ r.to }}
                    </span>
                    <span v-if="!iv.ranges.length" class="tsd-calc-range is-none">
                      <i class="tsd-sw is-none"></i>{{ $t('timesheetPage.notCounted') }}
                    </span>
                  </div>
                  <span class="tsd-calc-n">{{ iv.durText }}</span>
                  <span class="tsd-calc-n is-counted">{{ iv.countedText }}</span>
                </div>

                <div v-if="intervals.length" class="tsd-calc-row is-total">
                  <span class="tsd-calc-ranges">{{ $t('content.count') }}</span>
                  <span class="tsd-calc-n">{{ minutesToWords(detail?.fact_minutes) }}</span>
                  <span class="tsd-calc-n is-counted">
                    {{ minutesToWords(detail?.counted_minutes) }}
                  </span>
                </div>
              </div>
            </section>
          </div>

          <!-- Ajratgich: chizma bilan yon panel o'rtasidagi kenglikni
               foydalanuvchi o'zi taqsimlaydi. -->
          <div
            :class="{ 'is-drag': dragging }"
            :title="$t('timesheetPage.resizePanel')"
            class="tsd-split"
            @dblclick="resetAside"
            @pointerdown.prevent="onSplitDown"
          >
            <span class="tsd-split-grip">
              <n-icon :component="ReOrderDotsVertical16Filled" size="14" />
            </span>
          </div>

          <!-- ── O'ng ustun ──────────────────────────────────────────────── -->
          <aside :style="{ width: `${asideW}px` }" class="tsd-aside">
            <section class="tsd-aside-sec is-info">
              <h4 class="tsd-card-title">{{ $t('timesheetPage.dayInfo') }}</h4>
              <div class="tsd-info">
                <div class="tsd-info-row">
                  <span class="tsd-info-label">{{ $t('timesheetPage.workStatus') }}</span>
                  <span v-if="dayBadge" :class="`is-${dayBadge.tone}`" class="tsd-badge">
                    {{ dayBadge.text }}
                  </span>
                </div>
                <div v-for="r in infoRows" :key="r.key" class="tsd-info-row">
                  <span class="tsd-info-label">{{ r.label }}</span>
                  <span class="tsd-info-value">{{ r.value }}</span>
                </div>
              </div>
            </section>

            <section class="tsd-aside-sec">
              <h4 class="tsd-card-title">{{ $t('timesheetPage.eventsShort') }}</h4>
              <div ref="evList" class="tsd-ev">
                <div class="tsd-ev-head">
                  <span>{{ $t('content.time') }}</span>
                  <span>{{ $t('timesheetPage.eventStatus') }}</span>
                  <span>{{ $t('timesheetPage.device') }}</span>
                </div>
                <div v-if="!detail?.events?.length" class="tsd-calc-empty">
                  {{ $t('timesheetPage.noEvents') }}
                </div>
                <div
                  v-for="(e, i) in detail?.events ?? []"
                  :key="`e-${i}`"
                  :class="{ 'is-marked': markedAt.has(String(e.at)) }"
                  class="tsd-ev-row"
                >
                  <span class="tsd-ev-time">{{ exact(e.at) }}</span>
                  <span :class="e.direction ? 'is-in' : 'is-out'" class="tsd-ev-dir">
                    <i class="tsd-ev-dot"></i>
                    {{ e.direction ? $t('timesheetPage.enter') : $t('timesheetPage.exit') }}
                  </span>
                  <span class="tsd-ev-dev">
                    {{ e.device_name || '—' }}
                    <em v-if="isMobileEvent(e)">{{ $t('timesheetPage.srcMobile') }}</em>
                  </span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </n-spin>
    </div>
  </n-modal>
</template>

<style lang="scss" scoped>
  /* Maketdagi «br-tertiary» — loyihada `--fig-bg-disable` bilan bir xil
     (#f2f4f7 / qorong'ida #344054), shuning uchun lokal taxallus. */
  .tsd {
    --tsd-line: var(--fig-bg-disable);

    display: flex;
    flex-direction: column;
    width: 1280px;
    max-width: 96vw;
    overflow: hidden;
    background: var(--fig-block-bg);
    border-radius: 32px;
  }

  /* ── Sarlavha ─────────────────────────────────────────────────────────── */
  .tsd-head {
    display: flex;
    flex-shrink: 0;
    gap: 24px;
    align-items: center;
    padding: 10px 32px;
    background: var(--fig-bg-tertiary);
    border-bottom: 1px solid var(--tsd-line);
  }

  .tsd-id {
    display: flex;
    flex: 1 0 0;
    gap: 12px;
    align-items: center;
    min-width: 0;
  }

  .tsd-id-ava {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    font-size: 14px;
    font-weight: 600;
    line-height: 18px;
    color: var(--fig-text-brand);
    background: var(--fig-bg-brand-surface);
    border-radius: 20px;
  }

  .tsd-id-text {
    display: flex;
    flex: 1 0 0;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }

  .tsd-id-name {
    overflow: hidden;
    font-size: 18px;
    font-weight: 600;
    line-height: 24px;
    color: var(--fig-text-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tsd-id-sub {
    display: flex;
    gap: 6px;
    align-items: center;
    overflow: hidden;
    font-size: 12px;
    line-height: 16px;
    color: var(--fig-text-tertiary);
    white-space: nowrap;
  }

  .tsd-id-badge {
    padding: 1px 6px;
    font-weight: 600;
    color: var(--fig-chip-brand-text);
    background: var(--fig-chip-brand-bg);
    border-radius: 999px;
  }

  .tsd-nav {
    display: flex;
    flex-shrink: 0;
    gap: 10px;
    align-items: center;
    padding: 7px 10px;
    background: var(--fig-bg-secondary);
    border-radius: 8px;
  }

  .tsd-nav-date {
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    color: var(--fig-text-primary);
    white-space: nowrap;
  }

  .tsd-nav-btn {
    font-size: 14px;
    line-height: 18px;
    color: var(--fig-text-secondary);
    cursor: pointer;
    background: none;
    border: 0;

    &:disabled {
      color: var(--fig-text-disable);
      cursor: default;
    }
  }

  .tsd-close {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    padding: 6px;
    color: var(--fig-text-secondary);
    cursor: pointer;
    background: var(--fig-block-bg);
    border: 0;
    border-radius: 9999px;

    &:hover {
      color: var(--fig-text-red);
    }
  }

  /* ── Tanasi ───────────────────────────────────────────────────────────── */
  .tsd-body {
    display: flex;
    // Ustunlar orasidagi 16px ajratgichning O'ZIDA (4px + 2×6px chekka).
    gap: 0;
    align-items: flex-start;
    max-height: calc(92vh - 60px);
    padding: 16px 24px;
    overflow: auto;
  }

  .tsd-main {
    display: flex;
    flex: 1 0 0;
    flex-direction: column;
    gap: 16px;
    min-width: 420px;
  }

  /* ── Ko'rsatkich kartochkalari ────────────────────────────────────────── */
  .tsd-stats {
    display: flex;
    gap: 12px;
  }

  .tsd-stat {
    position: relative;
    display: flex;
    flex: 1 0 0;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
    padding: 6px 4px;
    overflow: hidden;
    background: var(--fig-bg-secondary);
    border-radius: 12px;
  }

  .tsd-stat-top {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 0 8px;
  }

  .tsd-stat-ico {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    padding: 4px;
    border-radius: 9999px;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  .tsd-stat-label {
    overflow: hidden;
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    color: var(--fig-text-tertiary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tsd-stat-num {
    position: relative;
    // Suv belgisi ustidan o'tsin: «10 soat 38 daqiqa» kartochkaning butun
    // kengligini egallashi mumkin, aks holda u qirqilardi.
    z-index: 1;
    display: flex;
    gap: 6px;
    align-items: baseline;
    padding: 0 8px;
    white-space: nowrap;

    b {
      font-size: 20px;
      font-weight: 600;
      line-height: 26px;
      color: var(--fig-text-primary);
    }

    i {
      font-size: 12px;
      font-style: normal;
      font-weight: 500;
      line-height: 16px;
      color: var(--fig-text-tertiary);
    }
  }

  .tsd-stat-part {
    display: flex;
    gap: 3px;
    align-items: baseline;
  }

  /* Suv belgisi — kartochkaning o'ng chetida, o'qishga xalaqit bermaydi. */
  .tsd-stat-wm {
    position: absolute;
    top: 50%;
    right: 8px;
    width: 44px;
    height: 44px;
    opacity: 0.16;
    transform: translateY(-50%);
    pointer-events: none;
  }

  .is-rot {
    transform: rotate(90deg);
  }

  .tsd-stat-wm.is-rot {
    transform: translateY(-50%) rotate(90deg);
  }

  .tsd-stat.is-lime {
    .tsd-stat-ico {
      color: var(--fig-chip-lime-text);
      background: var(--fig-lime-100);
    }

    .tsd-stat-wm {
      color: var(--fig-chip-lime-text);
    }
  }

  .tsd-stat.is-indigo {
    .tsd-stat-ico {
      color: var(--fig-icon-indigo);
      background: var(--fig-indigo-100);
    }

    .tsd-stat-wm {
      color: var(--fig-icon-indigo);
    }
  }

  .tsd-stat.is-green {
    .tsd-stat-ico {
      color: var(--fig-icon-green);
      background: var(--fig-green-100);
    }

    .tsd-stat-wm {
      color: var(--fig-icon-green);
    }
  }

  .tsd-stat.is-amber {
    .tsd-stat-ico {
      color: var(--fig-icon-amber);
      background: var(--fig-amber-100);
    }

    .tsd-stat-wm {
      color: var(--fig-icon-amber);
    }
  }

  /* ── Kartochka ────────────────────────────────────────────────────────── */
  .tsd-card {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    background: var(--fig-bg-secondary);
    border-radius: 16px;
  }

  .tsd-card-head {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
  }

  .tsd-card-title {
    font-size: 14px;
    font-weight: 600;
    line-height: 18px;
    color: var(--fig-text-primary);
  }

  /* ── Izohlar (qatlam tanlash) ─────────────────────────────────────────── */
  .tsd-legend {
    display: flex;
    flex-shrink: 0;
    overflow: hidden;
    border-radius: 12px;
  }

  .tsd-lg-btn {
    display: flex;
    gap: 4px;
    align-items: center;
    height: 32px;
    padding: 6px 10px;
    font-size: 12px;
    font-weight: 600;
    line-height: 16px;
    color: var(--fig-text-secondary);
    cursor: pointer;
    background: var(--fig-bg-tertiary);
    border: 0;
    transition: opacity 0.15s;

    &.is-dim {
      opacity: 0.45;
    }

    &.is-active {
      background: var(--fig-block-bg);
    }
  }

  /* Namuna kvadratchalari — chizmadagi qatlamlar bilan AYNAN bir xil. */
  .tsd-sw {
    flex-shrink: 0;
    width: 14px;
    height: 14px;
    border-radius: 4px;

    &.is-plan {
      background: var(--fig-blue-100);
      border: 1.5px solid var(--fig-icon-brand);
    }

    &.is-lunch {
      background: var(--fig-amber-100);
      border: 1.5px dashed var(--fig-icon-amber);
    }

    &.is-raw {
      background: var(--fig-block-bg);
      border: 1.5px solid var(--fig-icon-green);
    }

    &.is-counted {
      background: var(--fig-icon-green);
    }

    &.is-none {
      background: var(--fig-bg-tertiary);
    }

    &.is-events {
      background: var(--fig-icon-green);
      border-radius: 50%;
    }
  }

  /* ── Chizma ───────────────────────────────────────────────────────────── */
  .tsd-chart {
    position: relative;
    display: flex;
    align-items: flex-start;
  }

  .tsd-rows {
    position: relative;
    flex-shrink: 0;
    width: 104px;
    height: 208px;
    border-right: 1px solid var(--tsd-line);
  }

  .tsd-row-label {
    position: absolute;
    left: 0;
    font-size: 14px;
    font-weight: 500;
    line-height: 18px;
    color: var(--fig-text-secondary);
    white-space: nowrap;

    // Har biri o'z qatorining O'RTASIGA tenglanadi.
    &.is-plan {
      top: 47px;
    }

    &.is-turn {
      top: 117px;
    }

    &.is-ev {
      top: 175px;
    }
  }

  .tsd-viewport {
    flex: 1 0 0;
    min-width: 0;
    height: 208px;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .tsd-plot {
    position: relative;
    height: 208px;
  }

  .tsd-grid {
    position: absolute;
    top: 26px;
    width: 1px;
    height: 182px;
    background: var(--tsd-line);
  }

  .tsd-tick {
    position: absolute;
    top: 0;
    font-size: 13px;
    font-weight: 500;
    line-height: 16px;
    color: var(--fig-text-tertiary);
    white-space: nowrap;
    transform: translateX(-50%);
  }

  /* Reja oynasi va tushlik — bitta qatorda, ustma-ust. */
  .tsd-band {
    position: absolute;
    top: 34px;
    height: 44px;
    transition: opacity 0.15s;

    &.is-plan {
      background: var(--fig-blue-100);
      border: 1px solid var(--fig-icon-brand);
      border-radius: 8px;
    }

    &.is-lunch {
      background: var(--fig-amber-100);
      border: 1px dashed var(--fig-icon-amber);
    }
  }

  .tsd-band-t {
    // So'zsiz (bitta qator) va so'z bilan (ikki qator) holatlarda ham
    // zolakning o'rtasida turishi uchun tepa/past bo'ylab cho'ziladi.
    position: absolute;
    top: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    white-space: nowrap;

    b {
      font-size: 14px;
      font-weight: 600;
      line-height: 18px;
    }

    i {
      font-size: 11px;
      font-style: normal;
      font-weight: 500;
      line-height: 14px;
      opacity: 0.85;
    }

    &.is-s {
      left: 10px;
      align-items: flex-start;
    }

    &.is-e {
      right: 10px;
      align-items: flex-end;
    }
  }

  .tsd-band.is-plan .tsd-band-t {
    color: var(--fig-text-brand);
  }

  .tsd-band.is-lunch b {
    position: absolute;
    top: 14px;
    left: 10px;
    font-size: 12px;
    font-weight: 600;
    line-height: 16px;
    color: var(--fig-chip-amber-text);
    white-space: nowrap;
  }

  /* Tushlik oralig'i — zolak ostida, markaziga tenglab. Zolakdan kengroq
     bo'lishi mumkin, shuning uchun alohida element. */
  .tsd-lunch-cap {
    position: absolute;
    top: 82px;
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    color: var(--fig-chip-amber-text);
    white-space: nowrap;
    transition: opacity 0.15s;
    transform: translateX(-50%);
  }

  /* Turniket: xom oraliq — ramka, hisobga olingani — to'ldirilgan. */
  .tsd-iv {
    position: absolute;
    top: 106px;
    height: 40px;
    background: var(--fig-block-bg);
    border: 1.5px solid var(--fig-icon-green);
    border-radius: 8px;
    transition: opacity 0.15s;
  }

  .tsd-ct {
    position: absolute;
    top: 111px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 30px;
    overflow: hidden;
    background: var(--fig-icon-green);
    border-radius: 6px;
    transition: opacity 0.15s;

    b {
      font-size: 14px;
      font-weight: 600;
      line-height: 18px;
      color: #fff;
      white-space: nowrap;
    }
  }

  /* Hodisa belgilari — o'z vaqtining ustida markazlashadi va BOSILADI.
     Kulrang = segmentga tushmagan (juftlanmagan) o'tish. */
  .tsd-mark {
    position: absolute;
    top: 178px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 12px;
    height: 12px;
    padding: 0;
    font-size: 12px;
    font-weight: 600;
    line-height: 16px;
    color: #fff;
    cursor: pointer;
    background: var(--fig-neutral-300);
    border: 2px solid var(--fig-block-bg);
    border-radius: 999px;
    transition:
      opacity 0.15s,
      box-shadow 0.15s;
    transform: translateX(-50%);

    &.is-cluster {
      top: 174px;
      width: auto;
      min-width: 20px;
      height: 20px;
      padding: 0 7px;
    }

    &.is-in {
      background: var(--fig-icon-green);
    }

    &.is-out {
      background: var(--fig-icon-orange);
    }

    &.is-open {
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--fig-icon-brand) 45%, transparent);
    }
  }

  /* Tanlangan qatlam ajratiladi, qolgani xiralashadi. */
  .tsd-plot.is-focus {
    .tsd-band,
    .tsd-lunch-cap,
    .tsd-iv,
    .tsd-ct,
    .tsd-mark {
      opacity: 0.18;
    }
  }

  .tsd-plot.is-focus-plan .tsd-band.is-plan,
  .tsd-plot.is-focus-lunch .tsd-band.is-lunch,
  .tsd-plot.is-focus-lunch .tsd-lunch-cap,
  .tsd-plot.is-focus-raw .tsd-iv,
  .tsd-plot.is-focus-counted .tsd-ct,
  .tsd-plot.is-focus-events .tsd-mark {
    opacity: 1;
  }

  /* ── Rozetka ro'yxati ─────────────────────────────────────────────────── */
  .tsd-pop {
    position: absolute;
    top: calc(100% + 10px);
    z-index: 20;
    background: var(--fig-block-bg);
    border: 1px solid var(--tsd-line);
    border-radius: 16px;
    box-shadow: 0 12px 32px rgb(16 24 40 / 14%);
  }

  .tsd-pop-arrow {
    position: absolute;
    top: -6px;
    width: 10px;
    height: 10px;
    background: var(--fig-block-bg);
    border-top: 1px solid var(--tsd-line);
    border-left: 1px solid var(--tsd-line);
    transform: translateX(-50%) rotate(45deg);
  }

  .tsd-pop-head {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid var(--tsd-line);
  }

  .tsd-pop-head-t {
    min-width: 0;
  }

  .tsd-pop-title {
    font-size: 16px;
    font-weight: 600;
    line-height: 22px;
    color: var(--fig-text-primary);
  }

  .tsd-pop-sub {
    margin-top: 2px;
    font-size: 13px;
    line-height: 18px;
    color: var(--fig-text-tertiary);
  }

  .tsd-pop-x {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    padding: 4px;
    color: var(--fig-text-tertiary);
    cursor: pointer;
    background: none;
    border: 0;
    border-radius: 9999px;

    &:hover {
      color: var(--fig-text-red);
    }
  }

  /* Ro'yxat uzun bo'lsa (bir necha o'tish) oynaning O'ZI cho'zilmaydi. */
  .tsd-pop-list {
    max-height: 264px;
    overflow-y: auto;
  }

  .tsd-pop-row {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 10px 16px;

    & + & {
      border-top: 1px solid var(--tsd-line);
    }
  }

  .tsd-pop-dot {
    flex-shrink: 0;
    width: 10px;
    height: 10px;
    background: var(--fig-neutral-300);
    border-radius: 50%;

    &.is-in {
      background: var(--fig-icon-green);
    }

    &.is-out {
      background: var(--fig-icon-orange);
    }
  }

  .tsd-pop-txt {
    flex: 1 0 0;
    min-width: 0;
  }

  .tsd-pop-t {
    display: flex;
    gap: 8px;
    align-items: baseline;
    font-size: 14px;
    line-height: 18px;

    b {
      font-weight: 600;
      color: var(--fig-text-primary);
    }

    span {
      font-weight: 500;
      color: var(--fig-text-tertiary);

      &.is-in {
        color: var(--fig-text-green);
      }

      &.is-out {
        color: var(--fig-icon-orange);
      }
    }
  }

  .tsd-pop-dev {
    margin-top: 2px;
    overflow: hidden;
    font-size: 12px;
    line-height: 16px;
    color: var(--fig-text-tertiary);
    text-overflow: ellipsis;
    white-space: nowrap;

    em {
      margin-left: 4px;
      font-style: normal;
      color: var(--fig-chip-indigo-text);
    }
  }

  .tsd-pop-tag {
    flex-shrink: 0;
    padding: 3px 10px;
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    border-radius: 999px;

    &.is-used {
      color: var(--fig-chip-brand-text);
      background: var(--fig-chip-brand-bg);
    }

    &.is-skipped {
      color: var(--fig-text-tertiary);
      background: var(--fig-bg-tertiary);
    }
  }

  .tsd-pop-foot {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    font-size: 12px;
    line-height: 16px;
    color: var(--fig-text-tertiary);
    background: var(--fig-bg-secondary);
    border-top: 1px solid var(--tsd-line);
    border-radius: 0 0 15px 15px;
  }

  .tsd-pop-foot-l {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  /* ── Skrollbar (maketdagi shakl) ──────────────────────────────────────── */
  .tsd-sb {
    display: flex;
    align-items: center;
    margin-top: -4px;
  }

  .tsd-sb-spacer {
    flex-shrink: 0;
    width: 104px;
  }

  .tsd-sb-track {
    position: relative;
    flex: 1 0 0;
    height: 6px;
    min-width: 0;
    cursor: pointer;
    background: var(--tsd-line);
    border-radius: 999px;
  }

  .tsd-sb-thumb {
    position: absolute;
    top: 0;
    height: 6px;
    background: var(--fig-br-secondary);
    border-radius: 999px;
  }

  .tsd-note {
    font-size: 12px;
    line-height: 16px;
    color: var(--fig-text-tertiary);
  }

  /* ── Qanday hisoblandi ────────────────────────────────────────────────── */
  .tsd-calc {
    display: flex;
    flex-direction: column;
  }

  .tsd-calc-cols,
  .tsd-calc-row {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 8px;
  }

  .tsd-calc-cols {
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    color: var(--fig-text-tertiary);

    > span:first-child {
      flex: 1 0 0;
      min-width: 0;
    }
  }

  .tsd-calc-row {
    border-top: 1px solid var(--tsd-line);
  }

  .tsd-calc-ranges {
    display: flex;
    flex: 1 0 0;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
    font-size: 14px;
    font-weight: 500;
    line-height: 18px;
    color: var(--fig-text-primary);
  }

  .tsd-calc-range {
    display: flex;
    gap: 10px;
    align-items: center;

    &.is-counted {
      font-size: 12px;
      line-height: 16px;
      color: var(--fig-text-green);
    }

    &.is-none {
      font-size: 12px;
      line-height: 16px;
      color: var(--fig-text-tertiary);
    }

    .tsd-sw {
      width: 12px;
      height: 12px;
      border-radius: 3px;
    }
  }

  .tsd-calc-n {
    flex-shrink: 0;
    width: 148px;
    white-space: nowrap;
    font-size: 14px;
    font-weight: 500;
    line-height: 18px;
    color: var(--fig-text-primary);
    text-align: right;

    &.is-counted {
      font-weight: 600;
      color: var(--fig-text-green);
    }
  }

  .tsd-calc-empty {
    padding: 12px 8px;
    font-size: 12px;
    color: var(--fig-text-tertiary);
    border-top: 1px solid var(--tsd-line);
  }

  /* ── Yon panel ────────────────────────────────────────────────────────── */
  .tsd-split {
    position: relative;
    display: flex;
    flex-shrink: 0;
    align-self: stretch;
    align-items: center;
    justify-content: center;
    width: 4px;
    min-height: 208px;
    margin: 0 6px;
    cursor: col-resize;
    user-select: none;
    border-radius: 999px;
    transition: background 0.15s;

    &:hover,
    &.is-drag {
      background: var(--fig-icon-brand);
    }
  }

  /* Tutqich ajratgichdan kengroq: 4px lik chiziqni ko'z ilg'amaydi, nuqtali
     ikonka esa «bu narsa sudraladi» degan yagona ishora. */
  .tsd-split-grip {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 34px;
    color: var(--fig-text-tertiary);
    background: var(--fig-bg-tertiary);
    border: 1px solid var(--tsd-line);
    border-radius: 6px;
    transition:
      color 0.15s,
      background 0.15s,
      border-color 0.15s;
  }

  .tsd-split:hover .tsd-split-grip,
  .tsd-split.is-drag .tsd-split-grip {
    color: #fff;
    background: var(--fig-icon-brand);
    border-color: var(--fig-icon-brand);
  }

  .tsd-aside {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    overflow: hidden;
    border: 1px solid var(--tsd-line);
    border-radius: 16px;
  }

  .tsd-aside-sec {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;

    &.is-info {
      border-bottom: 1px solid var(--tsd-line);
    }
  }

  .tsd-info-row {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;

    & + & {
      border-top: 1px solid var(--tsd-line);
    }
  }

  .tsd-info-label {
    flex-shrink: 0;
    font-size: 12px;
    line-height: 16px;
    color: var(--fig-text-tertiary);
  }

  .tsd-info-value {
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    color: var(--fig-text-primary);
    text-align: right;
  }

  .tsd-badge {
    padding: 2px 8px;
    font-size: 12px;
    font-weight: 600;
    line-height: 16px;
    border-radius: 999px;

    &.is-green {
      color: var(--fig-text-green);
      background: var(--fig-green-100);
    }

    &.is-amber {
      color: var(--fig-chip-amber-text);
      background: var(--fig-amber-100);
    }

    &.is-red {
      color: var(--fig-text-red);
      background: var(--fig-red-100);
    }

    &.is-gray {
      color: var(--fig-text-tertiary);
      background: var(--fig-bg-tertiary);
    }
  }

  /* ── Hodisalar jadvali ───────────────────────────────────────────────── */
  .tsd-ev {
    max-height: 420px;
    overflow: auto;
  }

  .tsd-ev-head,
  .tsd-ev-row {
    display: flex;
    gap: 8px;
    // Panel torayganda ustunlar bir-biriga kirib ketmasin — gorizontal skroll.
    min-width: 264px;
    align-items: center;
    padding: 0 8px;

    > * {
      flex: 1 0 0;
      min-width: 0;
    }
  }

  .tsd-ev-head {
    position: sticky;
    top: 0;
    z-index: 1;
    min-height: 32px;
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    color: var(--fig-text-tertiary);
    background: var(--fig-bg-secondary);
    border-radius: 8px;
  }

  .tsd-ev-row {
    min-height: 40px;
    transition: background 0.15s;

    & + & {
      border-top: 1px solid var(--tsd-line);
    }

    // Chizmadagi rozetka bosilganda — o'sha qatorlar shu yerda ajratiladi.
    &.is-marked {
      background: var(--fig-chip-brand-bg);
      border-radius: 8px;
    }
  }

  .tsd-ev-time {
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    color: var(--fig-text-primary);
  }

  .tsd-ev-dir {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;

    &.is-in {
      color: var(--fig-text-green);
    }

    &.is-out {
      color: var(--fig-text-red);
    }
  }

  .tsd-ev-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    background: currentcolor;
    border-radius: 50%;
  }

  .tsd-ev-dev {
    overflow: hidden;
    font-size: 12px;
    line-height: 16px;
    color: var(--fig-text-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;

    em {
      margin-left: 4px;
      font-size: 11px;
      font-style: normal;
      color: var(--fig-text-tertiary);
    }
  }
</style>
