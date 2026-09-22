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
  import { Dismiss20Regular } from '@vicons/fluent'
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
  const fmtMin = (m) =>
    m == null
      ? '—'
      : `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
  const hm = (v) => (v ? String(v).slice(11, 16) : '—')
  const exact = (v) => (v ? String(v).slice(11, 19) : '—')
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
   * Maketda soat kengligi 64px, chetlarida 16px otstup — ya'ni butun sutka
   * 1568px. Shu son o'zgarsa CSS dagi `--tsd-plot-w` ham o'zgaradi.
   * --------------------------------------------------------------------- */
  const HOUR_W = 64
  const PAD = 16
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
    // Yorliqlar («09:00», «18:00») zolak ichiga sig'masa ko'rsatilmaydi.
    return { style: band(w[0], w[1]), wide: px(w[1]) - px(w[0]) >= 120, from: fmtMin(w[0]), to: fmtMin(w[1]) }
  })
  const lunchBand = computed(() => {
    const l = lunchWindow.value
    if (!l) return null
    return { style: band(l[0], l[1]), wide: px(l[1]) - px(l[0]) >= 56 }
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
                from: fmtMin(y),
                to: fmtMin(z)
              })
              ranges.push({ from: fmtMin(y), to: fmtMin(z), dur: minutesToHm(z - y) })
            }
          }
        }
        return {
          from: fmtMin(a),
          to: fmtMin(b),
          dur: minutesToHm(sg.minutes),
          countedText: minutesToHm(counted),
          parts,
          ranges,
          style: band(a, b)
        }
      })
  )

  /* Hodisa nuqtalari. Yaqin turganlari BITTA belgiga yig'iladi (maketdagi
   * «2» rozetkasi): 64px/soat da 18px ≈ 17 daqiqa — undan yaqin o'tishlar
   * ko'z bilan baribir ajratilmaydi, ro'yxat esa yon panelda to'liq turadi. */
  const CLUSTER_PX = 18
  const marks = computed(() => {
    const raw = []
    for (const sg of detail.value?.segments ?? []) {
      if (sg.type === 'break') continue
      if (sg.from) raw.push({ m: minOfDay(sg.from), dir: true, at: sg.from })
      if (sg.to) raw.push({ m: minOfDay(sg.to), dir: false, at: sg.to })
    }
    raw.sort((a, b) => a.m - b.m)
    const groups = []
    for (const e of raw) {
      const last = groups[groups.length - 1]
      if (last && last.dir === e.dir && px(e.m) - px(last.m2) < CLUSTER_PX) {
        last.items.push(e)
        last.m2 = e.m
      } else groups.push({ dir: e.dir, m1: e.m, m2: e.m, items: [e] })
    }
    return groups.map((g) => ({
      dir: g.dir,
      count: g.items.length,
      left: `${(px(g.m1) + px(g.m2)) / 2}px`,
      title: `${g.dir ? t('timesheetPage.enter') : t('timesheetPage.exit')}: ${g.items
        .map((i) => exact(i.at))
        .join(', ')}`
    }))
  })

  /* --- Ko'rsatkich kartochkalari ------------------------------------------ */
  const stats = computed(() => [
    {
      key: 'plan',
      tone: 'lime',
      icon: IconPlan,
      label: t('timesheetPage.planMinutes'),
      value: minutesToHm(detail.value?.plan_minutes)
    },
    {
      key: 'turnstile',
      tone: 'indigo',
      icon: IconTurnstile,
      label: t('timesheetPage.inTurnstile'),
      value: minutesToHm(detail.value?.fact_minutes)
    },
    {
      key: 'outside',
      tone: 'green',
      icon: IconOutside,
      rotate: true,
      label: t('timesheetPage.breakTotal'),
      value: minutesToHm(detail.value?.outside_minutes ?? 0)
    },
    {
      key: 'counted',
      tone: 'amber',
      icon: IconCounted,
      label: t('timesheetPage.counted'),
      value: minutesToHm(detail.value?.counted_minutes)
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
      { key: 'plan', label: t('timesheetPage.planMinutes'), value: minutesToHm(d?.plan_minutes) },
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
    { key: 'counted', label: 'timesheetPage.lgCounted' }
  ]
  const focus = ref('')
  const toggleFocus = (key) => {
    focus.value = focus.value === key ? '' : key
  }

  /* --- Gorizontal skroll va maketdagi o'z skrollbari ---------------------- */
  const viewport = ref(null)
  const track = ref(null)
  const thumb = reactive({ left: 0, width: 0 })

  const syncThumb = () => {
    const v = viewport.value
    const tr = track.value
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

  window.addEventListener('resize', syncThumb)
  onBeforeUnmount(() => {
    window.removeEventListener('resize', syncThumb)
    onUp()
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
                  <span class="tsd-stat-label">{{ s.label }}</span>
                </div>
                <div class="tsd-stat-num">{{ s.value }}</div>
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

              <div class="tsd-chart">
                <!-- Qator nomlari skrollda joyida qoladi -->
                <div class="tsd-rows">
                  <span class="tsd-row-label is-plan">{{ $t('timesheetPage.lgPlan') }}</span>
                  <span class="tsd-row-label is-turn">{{ $t('timesheetPage.tabTurnstile') }}</span>
                  <span class="tsd-row-label is-ev">{{ $t('timesheetPage.eventsShort') }}</span>
                </div>

                <div ref="viewport" class="tsd-viewport" @scroll="syncThumb">
                  <div :class="focus ? `is-focus is-focus-${focus}` : ''" class="tsd-plot">
                    <template v-for="tk in ticks" :key="tk.h">
                      <span :style="{ left: `${tk.x}px` }" class="tsd-grid"></span>
                      <span :style="{ left: `${tk.x}px` }" class="tsd-tick">{{ tk.label }}</span>
                    </template>

                    <!-- Reja oynasi va uning ichidagi tushlik -->
                    <span v-if="planBand" :style="planBand.style" class="tsd-band is-plan">
                      <template v-if="planBand.wide">
                        <b class="tsd-band-t is-s">{{ planBand.from }}</b>
                        <b class="tsd-band-t is-e">{{ planBand.to }}</b>
                      </template>
                    </span>
                    <span v-if="lunchBand" :style="lunchBand.style" class="tsd-band is-lunch">
                      <b v-if="lunchBand.wide" class="tsd-band-t is-s">
                        {{ $t('timesheetPage.lgLunch') }}
                      </b>
                    </span>

                    <!-- Turniket: xom oraliq (ramka) va hisobga olingan qism -->
                    <template v-for="(iv, i) in intervals" :key="`iv-${i}`">
                      <span
                        :style="iv.style"
                        :title="`${iv.from} → ${iv.to} · ${iv.dur}`"
                        class="tsd-iv"
                      ></span>
                      <span
                        v-for="(p, j) in iv.parts"
                        :key="`p-${i}-${j}`"
                        :style="p.style"
                        :title="`${p.from} → ${p.to} · ${p.dur}`"
                        class="tsd-ct"
                      >
                        <b v-if="p.wide">{{ p.dur }}</b>
                      </span>
                    </template>

                    <!-- Kirish/chiqish belgilari -->
                    <template v-for="(mk, i) in marks" :key="`mk-${i}`">
                      <span
                        v-if="mk.count > 1"
                        :class="mk.dir ? 'is-in' : 'is-out'"
                        :style="{ left: mk.left }"
                        :title="mk.title"
                        class="tsd-cluster"
                      >
                        {{ mk.count }}
                      </span>
                      <span
                        v-else
                        :class="mk.dir ? 'is-in' : 'is-out'"
                        :style="{ left: mk.left }"
                        :title="mk.title"
                        class="tsd-dot"
                      ></span>
                    </template>
                  </div>
                </div>

                <!-- So'nuvchi chetlar `.tsd-chart` ga tegishli: skroll ichida
                     bo'lsa kontent bilan birga surilib ketardi. -->
                <span class="tsd-fade is-l"></span>
                <span class="tsd-fade is-r"></span>
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
                  <span class="tsd-calc-n">{{ $t('timesheetPage.counted') }}</span>
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
                  <span class="tsd-calc-n">{{ iv.dur }}</span>
                  <span class="tsd-calc-n is-counted">{{ iv.countedText }}</span>
                </div>

                <div v-if="intervals.length" class="tsd-calc-row is-total">
                  <span class="tsd-calc-ranges">{{ $t('content.count') }}</span>
                  <span class="tsd-calc-n">{{ minutesToHm(detail?.fact_minutes) }}</span>
                  <span class="tsd-calc-n is-counted">
                    {{ minutesToHm(detail?.counted_minutes) }}
                  </span>
                </div>
              </div>
            </section>
          </div>

          <!-- ── O'ng ustun ──────────────────────────────────────────────── -->
          <aside class="tsd-aside">
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
              <div class="tsd-ev">
                <div class="tsd-ev-head">
                  <span>{{ $t('content.time') }}</span>
                  <span>{{ $t('timesheetPage.eventStatus') }}</span>
                  <span>{{ $t('timesheetPage.device') }}</span>
                </div>
                <div v-if="!detail?.events?.length" class="tsd-calc-empty">
                  {{ $t('timesheetPage.noEvents') }}
                </div>
                <div v-for="(e, i) in detail?.events ?? []" :key="`e-${i}`" class="tsd-ev-row">
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
    --tsd-plot-w: 1568px;

    display: flex;
    flex-direction: column;
    width: 1160px;
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
    gap: 16px;
    align-items: flex-start;
    padding: 16px 24px;
    overflow-y: auto;
    max-height: calc(92vh - 60px);
  }

  .tsd-main {
    display: flex;
    flex: 1 0 0;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
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
    padding: 0 8px;
    font-size: 20px;
    font-weight: 600;
    line-height: 26px;
    color: var(--fig-text-primary);
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
    height: 160px;
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

    &.is-plan {
      top: 41px;
    }

    &.is-turn {
      top: 89px;
    }

    &.is-ev {
      top: 131px;
    }
  }

  .tsd-viewport {
    flex: 1 0 0;
    min-width: 0;
    height: 160px;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .tsd-plot {
    position: relative;
    width: var(--tsd-plot-w);
    height: 160px;
  }

  .tsd-grid {
    position: absolute;
    top: 26px;
    width: 1px;
    height: 134px;
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
    top: 32px;
    height: 36px;
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
    position: absolute;
    top: 9px;
    font-size: 14px;
    font-weight: 600;
    line-height: 18px;
    white-space: nowrap;

    &.is-s {
      left: 10px;
    }

    &.is-e {
      right: 10px;
    }
  }

  .tsd-band.is-plan .tsd-band-t {
    color: var(--fig-text-brand);
  }

  .tsd-band.is-lunch .tsd-band-t {
    top: 10px;
    font-size: 12px;
    line-height: 16px;
    color: var(--fig-chip-amber-text);
  }

  /* Turniket: xom oraliq — ramka, hisobga olingani — to'ldirilgan. */
  .tsd-iv {
    position: absolute;
    top: 80px;
    height: 36px;
    background: var(--fig-block-bg);
    border: 1.5px solid var(--fig-icon-green);
    border-radius: 8px;
    transition: opacity 0.15s;
  }

  .tsd-ct {
    position: absolute;
    top: 84px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 28px;
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

  /* Hodisa belgilari — o'z vaqtining ustida markazlashadi. */
  .tsd-dot {
    position: absolute;
    top: 134px;
    width: 12px;
    height: 12px;
    border: 2px solid var(--fig-block-bg);
    border-radius: 50%;
    transform: translateX(-50%);

    &.is-in {
      background: var(--fig-icon-green);
    }

    &.is-out {
      background: var(--fig-icon-orange);
    }
  }

  .tsd-cluster {
    position: absolute;
    top: 130px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 7px;
    font-size: 12px;
    font-weight: 600;
    line-height: 16px;
    color: #fff;
    border: 2px solid var(--fig-block-bg);
    border-radius: 999px;
    transform: translateX(-50%);

    &.is-in {
      background: var(--fig-icon-green);
    }

    &.is-out {
      background: var(--fig-bg-red-fill);
    }
  }

  /* Tanlangan qatlam ajratiladi, qolgani xiralashadi. */
  .tsd-plot.is-focus {
    .tsd-band,
    .tsd-iv,
    .tsd-ct,
    .tsd-dot,
    .tsd-cluster {
      opacity: 0.18;
    }
  }

  .tsd-plot.is-focus-plan .tsd-band.is-plan,
  .tsd-plot.is-focus-lunch .tsd-band.is-lunch,
  .tsd-plot.is-focus-raw .tsd-iv,
  .tsd-plot.is-focus-raw .tsd-dot,
  .tsd-plot.is-focus-raw .tsd-cluster,
  .tsd-plot.is-focus-counted .tsd-ct {
    opacity: 1;
  }

  /* Skroll chetlari — kontent «kesilgandek» emas, so'nib ketadi. */
  .tsd-fade {
    position: absolute;
    top: 0;
    width: 24px;
    height: 160px;
    pointer-events: none;

    &.is-l {
      left: 105px;
      background: linear-gradient(to right, var(--fig-bg-secondary), transparent);
    }

    &.is-r {
      right: 0;
      background: linear-gradient(to left, var(--fig-bg-secondary), transparent);
    }
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
    width: 112px;
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
  .tsd-aside {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    width: 360px;
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
  .tsd-ev-head,
  .tsd-ev-row {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 0 8px;

    > * {
      flex: 1 0 0;
      min-width: 0;
    }
  }

  .tsd-ev-head {
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

    & + & {
      border-top: 1px solid var(--tsd-line);
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
