<script setup>
  // Kun / davr tanlagich. Ikki rejim (`mode`):
  //  • 'day'    — bitta kun: tez tanlash (Bugun, Kecha, Ertaga, 2 kun oldin / keyin, Hafta / Oy boshi) + kalendarda bitta bosish;
  //  • 'period' — davr: tez tanlash (Shu/O'tgan hafta, Shu/O'tgan oy, Oxirgi 7/30 kun) + kalendarda 2 bosish.
  // Oyna ikki sahifali (yonma-yon siljiydi): tez tanlash ⇄ kalendar. Tez tanlash bosilsa — qo'llanadi va yopiladi.
  //
  // `n-date-picker` (type="date" / "daterange") o'rniga TO'G'RIDAN-TO'G'RI qo'yiladi — bir xil API:
  //  • `v-model:value` — kun: son (ms, kun boshi); davr: `[ms, ms]`;
  //  • `v-model:formatted-value` + `value-format` (date-fns tokenlari, default 'yyyy-MM-dd') — kun: satr; davr: `[satr, satr]`;
  //  • `is-date-disabled(ts)`, `clearable` (default false — Naive kabi), `disabled`, `loading`, `placeholder`,
  //    `start-placeholder` / `end-placeholder`; `type="daterange"` → davr rejimi (agar `mode` berilmasa).
  // Ikkala hodisa ham har doim chiqadi (Naive kabi): `update:value` va `update:formatted-value`.
  // Qiymat shakli (son yoki massiv) — kelgan qiymatdan; qiymat bo'sh bo'lsa — rejimdan (kun → son, davr → massiv).
  // `format`, `actions`, `update-value-on-close` qabul qilinadi, lekin ishlatilmaydi (ko'rinish doim DD.MM.YYYY).
  import dayjs from 'dayjs'
  import {
    ArrowLeft16Regular,
    CalendarLtr16Regular,
    CalendarLtr20Regular,
    ChevronDown16Regular,
    ChevronLeft16Regular,
    ChevronRight16Regular,
    DismissCircle16Filled
  } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t, tc } = i18n.global

  // `class` / `style` maydonning o'ziga tushsin (ildiz — n-popover, u attr'larni oynaga berib yuboradi).
  defineOptions({ inheritAttrs: false })

  const props = defineProps({
    value: { type: [Array, Number], default: null },
    // Berilmasa `undefined` qoladi — shunda bog'lanmagan deb hisoblanadi.
    formattedValue: { type: [Array, String], default: undefined },
    valueFormat: { type: String, default: 'yyyy-MM-dd' },
    // 'day' | 'period'. Berilmasa: `type="daterange"` → 'period', aks holda 'day'.
    mode: { type: String, default: null, validator: (v) => v == null || ['day', 'period'].includes(v) },
    type: { type: String, default: 'date' },
    placeholder: { type: String, default: null },
    startPlaceholder: { type: String, default: null },
    endPlaceholder: { type: String, default: null },
    clearable: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    // Naive kabi: 'error' | 'warning' | 'success'. Berilmasa — n-form-item validatsiya holatidan olinadi.
    status: { type: String, default: null },
    loading: { type: Boolean, default: false },
    isDateDisabled: { type: Function, default: null },
    placement: { type: String, default: 'bottom-start' },
    // Shu kundan keyingi kunlar tanlanmaydi. ms / Date / null.
    maxDate: { type: [Number, Date], default: null },
    // Naive kabi o'lcham: 'small' (28px) | 'medium' (34px) | 'large' (40px). Filtr / forma o'z o'zgaruvchisi bilan ustun.
    size: { type: String, default: null },
    // Qiymat bo'sh bo'lsa kalendar shu oydan ochiladi (Naive `default-calendar-start-time`). ms.
    defaultCalendarStartTime: { type: Number, default: null },
    // Naive'dan qolgan — qabul qilinadi, ishlatilmaydi.
    format: { type: String, default: null },
    actions: { type: [Array, null], default: undefined },
    updateValueOnClose: { type: Boolean, default: false }
  })
  const emit = defineEmits(['update:value', 'update:formatted-value'])

  // ---- n-form-item bilan bog'lanish (Naive o'z inputlari kabi) ----
  // Kalit oddiy satr ('n-form-item'): forma xatosida qizil hoshiya, tanlanganda «change/input», oyna yopilganda «blur»
  // — validatsiya shu signallar bilan ishlaydi. Ichkariga null beramiz (ichki komponentlar formaga ulanmasin).
  const NFormItem = inject('n-form-item', null)
  provide('n-form-item', null)
  const mergedStatus = computed(() => props.status || NFormItem?.mergedValidationStatus?.value || null)
  const mergedDisabled = computed(() => props.disabled || Boolean(NFormItem?.disabled?.value))
  const notifyChange = () => {
    NFormItem?.handleContentInput?.()
    NFormItem?.handleContentChange?.()
  }
  const notifyBlur = () => NFormItem?.handleContentBlur?.()
  onBeforeUnmount(() => NFormItem?.restoreValidation?.())

  const MONTH_KEYS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  const WEEK_KEYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const today = () => dayjs().startOf('day')
  // Hafta dushanbadan boshlanadi.
  const weekStart = (d) => d.subtract((d.day() + 6) % 7, 'day').startOf('day')

  // Tez tanlash — rejim bo'yicha, 2 ustunda juft-juft.
  // DIQQAT, adashtirmang: «O'tgan hafta» = oldingi Du–Ya (kalendar haftasi), «Oxirgi 7 kun» = bugun + oldingi 6 kun;
  // «O'tgan oy» = oldingi kalendar oyi to'liq, «Oxirgi 30 kun» = bugun + oldingi 29 kun.
  const PRESETS = {
    // Bir xil sana chiqib qolsa (masalan dushanba kuni «Bugun» = «Hafta boshi») — birinchisi faol bo'ladi.
    day: [
      { key: 'today', range: () => [today(), today()] },
      { key: 'yesterday', range: () => [today().subtract(1, 'day'), today().subtract(1, 'day')] },
      { key: 'tomorrow', range: () => [today().add(1, 'day'), today().add(1, 'day')] },
      { key: 'twoDaysAgo', range: () => [today().subtract(2, 'day'), today().subtract(2, 'day')] },
      { key: 'inTwoDays', range: () => [today().add(2, 'day'), today().add(2, 'day')] },
      { key: 'weekStart', range: () => [weekStart(today()), weekStart(today())] },
      { key: 'monthStart', range: () => [today().startOf('month'), today().startOf('month')] }
    ],
    period: [
      { key: 'thisWeek', range: () => [weekStart(today()), weekStart(today()).add(6, 'day')] },
      { key: 'lastWeek', range: () => [weekStart(today()).subtract(7, 'day'), weekStart(today()).subtract(1, 'day')] },
      { key: 'thisMonth', range: () => [today().startOf('month'), today().endOf('month').startOf('day')] },
      {
        key: 'lastMonth',
        range: () => [today().subtract(1, 'month').startOf('month'), today().subtract(1, 'month').endOf('month').startOf('day')]
      },
      { key: 'last7', range: () => [today().subtract(6, 'day'), today()] },
      { key: 'last30', range: () => [today().subtract(29, 'day'), today()] }
    ]
  }
  const isDay = computed(() => (props.mode ?? (props.type === 'daterange' ? 'period' : 'day')) === 'day')
  const presets = computed(() => PRESETS[isDay.value ? 'day' : 'period'])

  const show = ref(false)
  const page = ref('quick') // 'quick' | 'calendar'
  const quickAnimKey = ref(0) // tugmalar har ochilganda ketma-ket paydo bo'lsin
  const monthDir = ref('next') // oy almashganda siljish yo'nalishi
  const calView = ref('days') // kalendar ichida: 'days' | 'months' | 'years'
  const view = ref(today().startOf('month'))
  const pickStart = ref(null)
  const hoverDay = ref(null)

  // ---- Qiymat: kirish / chiqish (Naive `n-date-picker` bilan bir xil shakllar) ----
  const usesFormatted = computed(() => props.formattedValue !== undefined)
  const rawValue = computed(() => (usesFormatted.value ? props.formattedValue : props.value))
  // date-fns tokenlari (yyyy, MM, dd, HH, mm, ss) → dayjs format satri.
  const dayjsFormat = computed(() =>
    props.valueFormat.replace(/yyyy/g, 'YYYY').replace(/dd/g, 'DD')
  )
  // Satrni `value-format` bo'yicha o'qish (customParseFormat plaginisiz).
  const parseFormatted = (str) => {
    const fmt = props.valueFormat
    const tokens = []
    const re = new RegExp(
      '^' +
        fmt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/yyyy|MM|dd|HH|mm|ss/g, (tk) => {
          tokens.push(tk)
          return tk === 'yyyy' ? '(\\d{4})' : '(\\d{1,2})'
        })
    )
    const m = re.exec(String(str).trim())
    if (!m) return dayjs(str)
    const part = Object.fromEntries(tokens.map((tk, i) => [tk, Number(m[i + 1])]))
    return dayjs(new Date(part.yyyy, (part.MM ?? 1) - 1, part.dd ?? 1))
  }
  const toDay = (x) => (typeof x === 'string' ? parseFormatted(x) : dayjs(x))
  // Ichki ko'rinish: [boshlanish, tugash] (bitta kun = ikkalasi bir xil) yoki null.
  const range = computed(() => {
    const v = rawValue.value
    if (v == null || v === '') return null
    const arr = Array.isArray(v) ? v : [v, v]
    if (arr[0] == null || arr[1] == null || arr[0] === '' || arr[1] === '') return null
    const d = arr.map(toDay)
    return d[0].isValid() && d[1].isValid() ? d.map((x) => x.startOf('day')) : null
  })
  const hasValue = computed(() => !!range.value)
  const from = computed(() => range.value?.[0] ?? null)
  const to = computed(() => range.value?.[1] ?? null)
  // Chiqish shakli: hozirgi qiymat massiv bo'lsa massiv; bo'sh bo'lsa — rejimdan (davr → massiv, kun → son/satr).
  const outArray = computed(() => (rawValue.value == null || rawValue.value === '' ? !isDay.value : Array.isArray(rawValue.value)))

  const fmtShort = (d) => d.format('DD.MM')
  const fmtFull = (d) => d.format('DD.MM.YYYY')
  const rangeHint = (a, b) => (a.isSame(b, 'day') ? fmtShort(a) : `${fmtShort(a)} – ${fmtShort(b)}`)
  // Davr uzunligi (ikkala chet ham kiradi): «7 kun».
  const dayCount = (a, b) => {
    const n = Math.abs(b.diff(a, 'day')) + 1
    return tc('dayPicker.days', n, { n })
  }

  const max = computed(() => (props.maxDate != null ? dayjs(props.maxDate).startOf('day') : null))
  const isDisabled = (d) => Boolean((max.value && d.isAfter(max.value, 'day')) || props.isDateDisabled?.(d.valueOf()))

  // Chiqmaydigan tugmalar: butunlay `maxDate` dan keyingisi (masalan «Ertaga»), hamda sanasi oldingi tugma bilan
  // bir xil bo'lgani (masalan chorshanba kuni «2 kun oldin» = «Hafta boshi» — ikki tugmada bitta sana chalg'itadi).
  const presetRows = computed(() => {
    const seen = new Set()
    return presets.value
      .map((p) => {
        const [a, b] = p.range()
        return { key: p.key, label: t(`dayPicker.${p.key}`), hint: rangeHint(a, b), id: `${a.valueOf()}-${b.valueOf()}`, off: isDisabled(a) }
      })
      .filter((r) => {
        if (r.off || seen.has(r.id)) return false
        seen.add(r.id)
        return true
      })
  })

  // Faqat joriy rejimning tez tanlashlari bilan solishtiriladi.
  const presetKey = computed(() => {
    if (!hasValue.value) return null
    const p = presets.value.find((x) => {
      const [a, b] = x.range()
      return a.isSame(from.value, 'day') && b.isSame(to.value, 'day')
    })
    return p?.key ?? null
  })

  // Maydonda faqat sanalar (tez tanlash nomi yozilmaydi): bitta kun → «25.11.2026»;
  // davr → «23.11 – 29.11» + kulrang «7 kun» (yil faqat joriy yil bo'lmasa: «20.12.2025 – 05.01.2026»).
  const fieldMain = computed(() => {
    if (!hasValue.value) return ''
    if (from.value.isSame(to.value, 'day')) return fmtFull(from.value)
    const thisYear = today().year()
    const fmt = from.value.year() === thisYear && to.value.year() === thisYear ? fmtShort : fmtFull
    return `${fmt(from.value)} – ${fmt(to.value)}`
  })
  const fieldSub = computed(() => (hasValue.value && !from.value.isSame(to.value, 'day') ? dayCount(from.value, to.value) : ''))
  // «Kun / Davr tanlash» tugmasi ostidagi sana — faqat ixtiyoriy (tez tanlashda yo'q) qiymat bo'lsa.
  const customHint = computed(() => (hasValue.value && !presetKey.value ? rangeHint(from.value, to.value) : ''))

  const emitRange = (a, b) => {
    const [s, e] = (a.isAfter(b) ? [b, a] : [a, b]).map((x) => x.startOf('day'))
    const ts = [s.valueOf(), e.valueOf()]
    const fm = [s.format(dayjsFormat.value), e.format(dayjsFormat.value)]
    emit('update:value', outArray.value ? ts : ts[0])
    emit('update:formatted-value', outArray.value ? fm : fm[0])
    notifyChange()
  }

  const reset = () => {
    pickStart.value = null
    hoverDay.value = null
  }

  // Tez tanlash — tugallangan tanlov: qo'llanadi va oyna yopiladi.
  const onPreset = (key) => {
    const p = presets.value.find((x) => x.key === key)
    if (!p) return
    emitRange(...p.range())
    reset()
    show.value = false
  }

  const goPage = (p) => {
    reset()
    if (p === 'quick') quickAnimKey.value++
    page.value = p
  }

  const onClear = () => {
    reset()
    emit('update:value', null)
    emit('update:formatted-value', null)
    notifyChange()
  }

  // Bo'sh maydon matni: berilgani, aks holda davr uchun «Boshlanish – Tugash», bo'lmasa umumiy.
  const placeholderText = computed(() => {
    if (props.placeholder) return props.placeholder
    if (!isDay.value && props.startPlaceholder && props.endPlaceholder) return `${props.startPlaceholder} – ${props.endPlaceholder}`
    return t('dayPicker.placeholder')
  })

  const onShowChange = (v) => {
    if (v && (mergedDisabled.value || props.loading)) return
    if (!v && show.value) notifyBlur()
    // Davr rejimida faqat boshlanish tanlanib oyna yopilsa — bitta kun sifatida qo'llanadi.
    if (!v && pickStart.value) emitRange(pickStart.value, pickStart.value)
    if (v) {
      view.value = (from.value ?? (props.defaultCalendarStartTime != null ? dayjs(props.defaultCalendarStartTime) : today())).startOf('month')
      calView.value = 'days'
      // Ixtiyoriy qiymat tanlangan bo'lsa — to'g'ri kalendarga; aks holda tez tanlash.
      page.value = hasValue.value && !presetKey.value ? 'calendar' : 'quick'
      quickAnimKey.value++
    }
    reset()
    show.value = v
  }

  const onDay = (d) => {
    if (isDisabled(d)) return
    // Kun rejimi: bitta bosish — tanlandi.
    if (isDay.value) {
      emitRange(d, d)
      show.value = false
      return
    }
    if (!pickStart.value) {
      pickStart.value = d
      return
    }
    emitRange(pickStart.value, d)
    reset()
    show.value = false
  }

  // `maxDate` dan keyingi oy / yilga o'tib bo'lmaydi — u yerda hamma kun yopiq bo'lardi.
  // Ko'rinish bo'yicha qadam: kunlar → 1 oy, oylar → 1 yil, yillar → 12 yil.
  const stepOf = () => (calView.value === 'days' ? [1, 'month'] : calView.value === 'months' ? [1, 'year'] : [12, 'year'])
  const yearBlockStart = computed(() => view.value.year() - (view.value.year() % 12))
  const canNext = computed(() => {
    if (!max.value) return true
    if (calView.value === 'years') return yearBlockStart.value + 12 <= max.value.year()
    const unit = calView.value === 'days' ? 'month' : 'year'
    return !view.value.add(1, unit).startOf(unit).isAfter(max.value, 'day')
  })
  const step = (dir) => {
    if (dir > 0 && !canNext.value) return
    monthDir.value = dir > 0 ? 'next' : 'prev'
    const [n, unit] = stepOf()
    view.value = view.value.add(dir * n, unit)
  }
  // Sarlavha bosilganda bir pog'ona yuqoriga: kunlar → oylar → yillar (yillardan — kunlarga qaytadi).
  const onTitle = () => {
    calView.value = calView.value === 'days' ? 'months' : calView.value === 'months' ? 'years' : 'days'
  }
  const years = computed(() => Array.from({ length: 12 }, (_, i) => yearBlockStart.value + i))
  const isYearDisabled = (y) => Boolean(max.value && y > max.value.year())
  const onYear = (y) => {
    if (isYearDisabled(y)) return
    monthDir.value = y >= view.value.year() ? 'next' : 'prev'
    view.value = view.value.year(y)
    calView.value = 'months'
  }
  const isMonthDisabled = (m) => isDisabled(view.value.month(m).startOf('month'))
  const onMonth = (m) => {
    if (isMonthDisabled(m)) return
    monthDir.value = m >= view.value.month() ? 'next' : 'prev'
    view.value = view.value.month(m).startOf('month')
    calView.value = 'days'
  }
  // Oy / yil ko'rinishi almashganda Transition shu kalit bo'yicha siljitadi.
  const gridKey = computed(
    () =>
      `${calView.value}-${calView.value === 'days' ? view.value.format('YYYY-MM') : calView.value === 'months' ? view.value.year() : yearBlockStart.value}`
  )

  // Davr tanlash paytida kursor turgan kun ustida «N kun» belgisi.
  const countDay = computed(() => (pickStart.value ? (hoverDay.value ?? pickStart.value) : null))
  const countText = computed(() => (countDay.value ? dayCount(pickStart.value, countDay.value) : ''))
  const onHover = (d) => {
    if (pickStart.value && !isDisabled(d)) hoverDay.value = d
  }

  const title = computed(() => {
    if (calView.value === 'days') return `${t(`month.${MONTH_KEYS[view.value.month()]}`)} ${view.value.year()}`
    if (calView.value === 'months') return String(view.value.year())
    return `${yearBlockStart.value} – ${yearBlockStart.value + 11}`
  })

  // ---- Kun rejimida yozib kiritish: DD.MM.YYYY niqobi (nuqtalar o'zi qo'yiladi) ----
  // To'liq va to'g'ri sana yozilsa — darhol qo'llanadi; chala / noto'g'ri qolsa — chiqishda oldingi qiymatga qaytadi;
  // butunlay o'chirilsa — qiymat tozalanadi.
  const inputRef = ref(null)
  const inputText = ref('')
  const inputFocused = ref(false)
  const syncInput = () => {
    if (!inputFocused.value) inputText.value = hasValue.value ? fmtFull(from.value) : ''
  }
  watch(() => [from.value?.valueOf(), isDay.value], syncInput, { immediate: true })
  const maskDate = (raw) => {
    const d = raw.replace(/\D/g, '').slice(0, 8)
    return [d.slice(0, 2), d.slice(2, 4), d.slice(4, 8)].filter(Boolean).join('.')
  }
  const parseTyped = (txt) => {
    const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(txt)
    if (!m) return null
    const [dd, mm, yy] = [Number(m[1]), Number(m[2]), Number(m[3])]
    const d = dayjs(new Date(yy, mm - 1, dd))
    // Haqiqiy sana bo'lsin (31.02 kabi emas) va oqilona yil.
    if (yy < 1900 || yy > 2100 || d.date() !== dd || d.month() !== mm - 1) return null
    return d.startOf('day')
  }
  const onTyping = (e) => {
    inputText.value = maskDate(e.target.value)
    e.target.value = inputText.value
    const d = parseTyped(inputText.value)
    if (d && !isDisabled(d)) {
      emitRange(d, d)
      view.value = d.startOf('month')
      calView.value = 'days'
    }
  }
  const onInputFocus = () => {
    inputFocused.value = true
  }
  // Oyna ichida bosilganda input fokusni yo'qotadi — buni «chiqib ketish» deb hisoblamaymiz.
  let panelPressed = false
  const onPanelPress = () => {
    panelPressed = true
    setTimeout(() => (panelPressed = false), 0)
  }
  const onInputBlur = () => {
    inputFocused.value = false
    if (!inputText.value) {
      if (hasValue.value) onClear()
    } else if (!parseTyped(inputText.value)) {
      syncInput()
    }
    // Klaviatura bilan (Tab) maydondan chiqilsa — oyna yopiladi (Naive kabi); oyna ichidagi bosish — yopmaydi.
    if (show.value && !panelPressed) onShowChange(false)
    else if (!show.value) notifyBlur()
  }
  const onInputClick = () => {
    if (!show.value) onShowChange(true)
  }
  const onInputEnter = () => {
    onInputBlur()
    onShowChange(false)
    inputRef.value?.blur()
  }
  const weekNames = computed(() => WEEK_KEYS.map((k) => t(`shortWeek.${k}`)))
  const monthNames = computed(() => MONTH_KEYS.map((k) => t(`month.${k}`)))

  const days = computed(() => {
    const first = weekStart(view.value)
    const now = today()
    // Tanlash jarayonida — boshlanish va kursor orasidagi oraliq ko'rsatiladi.
    let a = from.value
    let b = to.value
    const preview = Boolean(pickStart.value)
    if (preview) {
      a = pickStart.value
      b = hoverDay.value ?? pickStart.value
      if (a.isAfter(b)) [a, b] = [b, a]
    }
    return Array.from({ length: 42 }, (_, i) => {
      const d = first.add(i, 'day')
      const dow = d.day()
      return {
        d,
        key: d.format('YYYY-MM-DD'),
        num: d.date(),
        out: d.month() !== view.value.month(),
        weekend: dow === 0 || dow === 6,
        today: d.isSame(now, 'day'),
        start: a && d.isSame(a, 'day'),
        end: b && d.isSame(b, 'day'),
        inRange: a && b && !d.isBefore(a, 'day') && !d.isAfter(b, 'day'),
        preview,
        disabled: isDisabled(d),
        count: countDay.value && d.isSame(countDay.value, 'day')
      }
    })
  })

  // Maydondagi sana kesilgan bo'lsa — hover'da tooltip (oyna ochiq paytda emas).
  const mainRef = ref(null)
  const tipShow = ref(false)
  const onMainEnter = () => {
    const el = mainRef.value
    tipShow.value = !show.value && !!el && el.scrollWidth > el.clientWidth
  }
  watch(show, (v) => v && (tipShow.value = false))

  // Oyna balandligi ko'rinib turgan sahifaga moslashadi (silliq) — sahifalar har xil balandlikda.
  const quickRef = ref(null)
  const calRef = ref(null)
  const pagesH = ref(null)
  let ro = null
  const measure = () => {
    const el = page.value === 'quick' ? quickRef.value : calRef.value
    if (el) pagesH.value = el.offsetHeight
  }
  watch(page, () => nextTick(measure))
  watch(show, (v) => {
    if (!v) return
    nextTick(() => {
      measure()
      if (typeof ResizeObserver === 'undefined' || ro) return
      ro = new ResizeObserver(measure)
      if (quickRef.value) ro.observe(quickRef.value)
      if (calRef.value) ro.observe(calRef.value)
    })
  })
  onBeforeUnmount(() => ro?.disconnect())
</script>

<template>
  <n-popover
    :show="show"
    :disabled="mergedDisabled || loading"
    trigger="click"
    :placement="placement"
    :show-arrow="false"
    :style="{ padding: 0, borderRadius: '14px' }"
    @update:show="onShowChange"
  >
    <template #trigger>
      <div
        v-bind="$attrs"
        class="ui-day-picker"
        :class="{
          'is-open': show,
          'is-disabled': mergedDisabled,
          'is-error': mergedStatus === 'error',
          'is-warning': mergedStatus === 'warning',
          [`udp-size-${size}`]: !!size
        }"
        :tabindex="mergedDisabled || isDay ? -1 : 0"
        role="button"
        :aria-disabled="mergedDisabled || undefined"
        @keydown.enter.prevent="onShowChange(!show)"
      >
        <span class="udp-text">
          <!-- Kun rejimi: sanani yozib ham kiritish mumkin (DD.MM.YYYY). -->
          <input
            v-if="isDay"
            ref="inputRef"
            class="udp-input"
            :value="inputText"
            :placeholder="placeholderText"
            :disabled="mergedDisabled || loading"
            inputmode="numeric"
            maxlength="10"
            autocomplete="off"
            @input="onTyping"
            @focus="onInputFocus"
            @blur="onInputBlur"
            @click.stop="onInputClick"
            @keydown.enter.stop.prevent="onInputEnter"
          />
          <template v-else-if="hasValue">
            <!-- Matn sig'masa (kesilsa) — hover'da to'liq sana; kesilmagan matn takrorlanmaydi. -->
            <n-tooltip trigger="manual" :show="tipShow" placement="top">
              <template #trigger>
                <span ref="mainRef" class="udp-main" @mouseenter="onMainEnter" @mouseleave="tipShow = false">
                  {{ fieldMain }}
                </span>
              </template>
              {{ fieldMain }}<template v-if="fieldSub"> · {{ fieldSub }}</template>
            </n-tooltip>
            <span v-if="fieldSub" class="udp-sub">{{ fieldSub }}</span>
          </template>
          <span v-else class="udp-ph">{{ placeholderText }}</span>
        </span>
        <span class="udp-suffix">
          <n-spin v-if="loading" :size="14" />
          <n-icon v-else class="udp-icon" :size="16"><CalendarLtr20Regular /></n-icon>
          <button
            v-if="clearable && hasValue && !mergedDisabled && !loading"
            type="button"
            class="udp-clear"
            :aria-label="$t('dayPicker.clear')"
            @click.stop="onClear"
          >
            <n-icon :size="16"><DismissCircle16Filled /></n-icon>
          </button>
        </span>
      </div>
    </template>

    <div class="udp-panel" @mousedown="onPanelPress">
      <div class="udp-pages" :style="pagesH ? { height: `${pagesH}px` } : null">
        <!-- ===== 1. Tez tanlash ===== -->
        <section
          ref="quickRef"
          class="udp-page udp-page--quick"
          :class="{ 'is-active': page === 'quick' }"
          :inert="page !== 'quick'"
        >
          <div :key="quickAnimKey" class="udp-quick">
            <button
              v-for="(r, i) in presetRows"
              :key="r.key"
              type="button"
              class="udp-tile"
              :class="{ 'is-active': r.key === presetKey }"
              :style="{ '--i': i }"
              @click="onPreset(r.key)"
            >
              <span class="udp-tile-label">{{ r.label }}</span>
              <span class="udp-tile-hint">{{ r.hint }}</span>
            </button>
            <!-- Kalendarga o'tish. Ixtiyoriy kun/davr tanlangan bo'lsa — faol, sanasi ostida. -->
            <button
              type="button"
              class="udp-tile udp-tile--pick"
              :class="{ 'is-active': customHint }"
              :style="{ '--i': presetRows.length }"
              @click="goPage('calendar')"
            >
              <span class="udp-tile-label">
                <n-icon :size="15"><CalendarLtr16Regular /></n-icon>
                {{ isDay ? $t('dayPicker.pickDay') : $t('dayPicker.period') }}
              </span>
              <span v-if="customHint" class="udp-tile-hint">{{ customHint }}</span>
            </button>
          </div>
        </section>

        <!-- ===== 2. Kalendar ===== -->
        <section
          ref="calRef"
          class="udp-page udp-page--calendar"
          :class="{ 'is-active': page === 'calendar' }"
          :inert="page !== 'calendar'"
        >
          <div class="udp-head">
            <div class="flex min-w-0 items-center">
              <!-- Tez tanlashga qaytish (← — oy strelkalari ‹ › bilan adashmasin). -->
              <button type="button" class="udp-nav udp-back" @click="goPage('quick')">
                <n-icon :size="15"><ArrowLeft16Regular /></n-icon>
              </button>
              <button type="button" class="udp-title" @click="onTitle">
                {{ title }}
                <n-icon :size="12" :class="{ 'rotate-180': calView !== 'days' }"><ChevronDown16Regular /></n-icon>
              </button>
            </div>
            <div class="flex items-center gap-0.5">
              <button type="button" class="udp-nav" @click="step(-1)">
                <n-icon :size="14"><ChevronLeft16Regular /></n-icon>
              </button>
              <button type="button" class="udp-nav" :disabled="!canNext" @click="step(1)">
                <n-icon :size="14"><ChevronRight16Regular /></n-icon>
              </button>
            </div>
          </div>

          <Transition :name="`udp-month-${monthDir}`" mode="out-in">
            <div v-if="calView === 'days'" :key="gridKey" class="udp-grid" @mouseleave="hoverDay = null">
              <span v-for="(w, i) in weekNames" :key="w" class="udp-wd" :class="{ 'is-weekend': i > 4 }">{{ w }}</span>
              <button
                v-for="c in days"
                :key="c.key"
                type="button"
                class="udp-day"
                :class="{
                  'is-out': c.out,
                  'is-weekend': c.weekend,
                  'is-today': c.today,
                  'is-start': c.start,
                  'is-end': c.end,
                  'in-range': c.inRange,
                  'is-preview': c.preview,
                  'is-disabled': c.disabled
                }"
                :disabled="c.disabled"
                @click="onDay(c.d)"
                @mouseenter="onHover(c.d)"
              >
                <span>{{ c.num }}</span>
                <span v-if="c.count" class="udp-count">{{ countText }}</span>
              </button>
            </div>

            <div v-else-if="calView === 'months'" :key="gridKey" class="udp-months">
              <button
                v-for="(m, i) in monthNames"
                :key="m"
                type="button"
                class="udp-month"
                :class="{ 'is-current': view.month() === i }"
                :disabled="isMonthDisabled(i)"
                @click="onMonth(i)"
              >
                {{ m }}
              </button>
            </div>

            <!-- Yillar: 12 tadan; ‹ › — 12 yilga suriladi. Yil tanlansa — o'sha yilning oylari. -->
            <div v-else :key="gridKey" class="udp-months">
              <button
                v-for="y in years"
                :key="y"
                type="button"
                class="udp-month"
                :class="{ 'is-current': view.year() === y, 'is-this-year': y === today().year() }"
                :disabled="isYearDisabled(y)"
                @click="onYear(y)"
              >
                {{ y }}
              </button>
            </div>
          </Transition>
        </section>
      </div>
    </div>
  </n-popover>
</template>

<style scoped>
  /* Default kenglik — Tailwind `components` qatlamida: sahifa bergan `w-[160px]` / `max-w-…` (utilities) doim ustun.
     (Qatlamsiz yozilsa Tailwind 4 klasslaridan kuchli bo'lib, ularni bosib ketardi.) */
  @layer components {
    .ui-day-picker {
      width: 100%;
    }
  }

  /* ---- Maydon: boshqa input/select'lar bilan bir xil «filled» ko'rinish (theme.js `filledInputOverrides`) ---- */
  .ui-day-picker {
    --udp-h: 34px;
    --udp-r: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    height: var(--udp-h);
    padding: 0 10px 0 12px;
    border: 1px solid var(--input-border);
    border-radius: var(--udp-r);
    background: var(--input-fill);
    cursor: pointer;
    outline: none;
    transition:
      border-color 0.2s,
      background-color 0.2s,
      box-shadow 0.2s;
  }
  .ui-day-picker.udp-size-small {
    --udp-h: 28px;
    --udp-r: 8px;
    font-size: 13px;
  }
  .ui-day-picker.udp-size-large {
    --udp-h: 40px;
  }
  .ui-day-picker:hover {
    border-color: var(--input-border-hover);
  }
  .ui-day-picker.is-disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
  .ui-day-picker.is-disabled:hover {
    border-color: var(--input-border);
  }
  .ui-day-picker.is-open,
  .ui-day-picker:focus-visible {
    border-color: var(--primary-color);
    background: var(--input-fill-focus);
    box-shadow: 0 0 0 3px var(--input-ring);
  }
  .udp-text {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: baseline;
    gap: 6px;
    white-space: nowrap;
    overflow: hidden;
    font-size: 14px;
  }
  .udp-main {
    color: var(--textColor0);
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .udp-sub {
    color: var(--textColor3);
    font-size: 12.5px;
    flex: none;
  }
  .udp-ph {
    color: var(--textColor3);
  }
  /* Kun rejimidagi yozish maydoni — tashqi ko'rinish o'zgarmaydi (oddiy matn kabi). */
  .udp-input {
    flex: 1;
    min-width: 0;
    width: 100%;
    padding: 0;
    border: 0;
    outline: none;
    background: transparent;
    color: var(--textColor0);
    font: inherit;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
  }
  .udp-input::placeholder {
    color: var(--textColor3);
    opacity: 1;
  }
  .udp-input:disabled {
    cursor: not-allowed;
  }
  /* Forma xatosi / ogohlantirish (n-form-item) — Naive inputlari kabi */
  .ui-day-picker.is-error {
    border-color: var(--danger-color);
  }
  .ui-day-picker.is-error.is-open,
  .ui-day-picker.is-error:focus-within {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--danger-color) 18%, transparent);
  }
  .ui-day-picker.is-warning {
    border-color: var(--warning-color, #f0a020);
  }
  .ui-day-picker:focus-within:not(.is-error) {
    border-color: var(--primary-color);
    background: var(--input-fill-focus);
    box-shadow: 0 0 0 3px var(--input-ring);
  }
  .udp-suffix {
    position: relative;
    display: grid;
    place-items: center;
    width: 18px;
    height: 18px;
    flex: none;
    color: var(--textColor3);
  }
  .udp-clear {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    border: 0;
    padding: 0;
    background: inherit;
    color: var(--textColor3);
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.15s;
  }
  .ui-day-picker:hover .udp-clear {
    opacity: 1;
  }
  .udp-clear:hover {
    color: var(--textColor1);
  }

  /* ---- Oyna: ikki sahifa, balandlik ko'rinib turganiga moslashadi ---- */
  .udp-panel {
    width: 264px;
    padding: 6px;
    overflow: hidden;
  }
  .udp-pages {
    position: relative;
    transition: height 0.24s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .udp-page {
    position: absolute;
    inset: 0 0 auto;
    transition:
      transform 0.24s cubic-bezier(0.2, 0.8, 0.2, 1),
      opacity 0.2s ease,
      visibility 0s linear 0.24s;
  }
  /* Ko'rinib turgan sahifa oqimda (balandlikni beradi), yashirini ustiga absolute. */
  .udp-page.is-active {
    position: relative;
    transition:
      transform 0.24s cubic-bezier(0.2, 0.8, 0.2, 1),
      opacity 0.2s ease 0.04s,
      visibility 0s;
  }
  .udp-page:not(.is-active) {
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
  }
  /* Tez tanlash chapda, kalendar o'ngda — almashganda tegishli tomonga siljiydi. */
  .udp-page--quick:not(.is-active) {
    transform: translateX(-24px);
  }
  .udp-page--calendar:not(.is-active) {
    transform: translateX(24px);
  }

  /* ---- 1. Tez tanlash: 2 ustunli tugmalar ---- */
  .udp-quick {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: 48px;
    gap: 4px;
  }
  .udp-tile {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 1px;
    min-width: 0;
    padding: 0 10px;
    border: 1px solid transparent;
    border-radius: 10px;
    background: var(--input-fill);
    color: var(--textColor0);
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition:
      background 0.15s,
      border-color 0.15s,
      color 0.15s;
    animation: udp-tile-in 0.26s cubic-bezier(0.2, 0.8, 0.2, 1) both;
    animation-delay: calc(var(--i) * 18ms);
  }
  /* Toq sonli oxirgi tugma — butun qator. */
  .udp-tile:last-child:nth-child(odd) {
    grid-column: span 2;
  }
  .udp-tile:hover {
    border-color: var(--input-border-hover);
  }
  .udp-tile:active {
    transform: scale(0.98);
  }
  .udp-tile.is-active {
    border-color: var(--primary-color);
    background: color-mix(in srgb, var(--primary-color) 10%, var(--surface-section));
  }
  .udp-tile-label {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
    font-weight: 600;
  }
  .udp-tile-hint {
    color: var(--textColor3);
    font-size: 12px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }
  /* «Kun / Davr tanlash» — kalendarni ochuvchi amal: belgisi bilan, chiziqli hoshiya, ko'k matn. */
  .udp-tile--pick {
    align-items: center;
    border: 1px dashed color-mix(in srgb, var(--primary-color) 45%, transparent);
    background: transparent;
    color: var(--primary-color);
  }
  .udp-tile--pick .udp-tile-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .udp-tile--pick:hover {
    border-color: var(--primary-color);
    background: color-mix(in srgb, var(--primary-color) 6%, transparent);
  }
  .udp-tile--pick.is-active {
    border-style: solid;
  }
  .udp-tile.is-active .udp-tile-label,
  .udp-tile.is-active .udp-tile-hint {
    color: var(--primary-color);
  }
  @keyframes udp-tile-in {
    from {
      opacity: 0;
      transform: translateY(6px) scale(0.98);
    }
  }

  /* ---- 2. Kalendar ---- */
  .udp-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2px;
  }
  .udp-head button {
    border: 0;
    background: transparent;
    cursor: pointer;
    font: inherit;
  }
  .udp-title {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 6px;
    border-radius: 8px;
    color: var(--textColor0);
    font-weight: 700;
    font-size: 15px;
  }
  .udp-nav {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    color: var(--textColor1);
  }
  .udp-back {
    color: var(--primary-color);
  }
  .udp-title:hover,
  .udp-nav:hover {
    background: var(--surface-ground-soft);
  }

  .udp-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    row-gap: 2px;
  }
  .udp-wd {
    padding: 2px 0 4px;
    text-align: center;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--textColor3);
  }
  .udp-wd.is-weekend,
  .udp-day.is-weekend {
    color: color-mix(in srgb, var(--danger-color) 75%, var(--textColor3));
  }
  .udp-day {
    position: relative;
    height: 36px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--textColor0);
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  }
  .udp-day > span:first-child {
    position: relative;
    z-index: 1;
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    margin: 0 auto;
    border-radius: 10px;
    transition: background 0.1s;
  }
  .udp-day:not(.is-disabled):hover > span:first-child {
    background: var(--surface-ground-soft);
  }
  /* Faqat raqam xira bo'ladi — «N kun» belgisi emas. */
  .udp-day.is-out > span:first-child {
    opacity: 0.4;
    font-weight: 400;
  }
  /* Bugun — ostida nuqta */
  .udp-day.is-today > span:first-child::after {
    content: '';
    position: absolute;
    bottom: 4px;
    left: 50%;
    width: 5px;
    height: 5px;
    margin-left: -2.5px;
    border-radius: 50%;
    background: var(--primary-color);
  }
  /* Davr — yumshoq ko'k tasma */
  .udp-day.in-range::before {
    content: '';
    position: absolute;
    inset: 1px 0;
    background: color-mix(in srgb, var(--primary-color) 13%, transparent);
  }
  .udp-day.in-range.is-preview::before {
    background: color-mix(in srgb, var(--primary-color) 8%, transparent);
  }
  .udp-day.is-start::before {
    left: 50%;
  }
  .udp-day.is-end::before {
    right: 50%;
  }
  .udp-day.is-start.is-end::before {
    display: none;
  }
  .udp-day.is-start > span:first-child,
  .udp-day.is-end > span:first-child {
    background: var(--primary-color) !important;
    color: #fff;
    font-weight: 700;
  }
  .udp-day.is-start.is-today > span:first-child::after,
  .udp-day.is-end.is-today > span:first-child::after {
    background: #fff;
  }

  .udp-months {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
  }
  .udp-month {
    height: 40px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    color: var(--textColor0);
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  }
  .udp-month:hover {
    background: var(--surface-ground-soft);
  }
  .udp-month.is-this-year:not(.is-current) {
    color: var(--primary-color);
  }
  .udp-month.is-current {
    background: color-mix(in srgb, var(--primary-color) 13%, transparent);
    color: var(--primary-color);
    font-weight: 600;
  }

  /* `maxDate` dan keyingi kunlar / oylar */
  .udp-day.is-disabled,
  .udp-month:disabled {
    cursor: not-allowed;
  }
  .udp-day.is-disabled > span:first-child,
  .udp-month:disabled {
    opacity: 0.3;
  }
  .udp-nav:disabled {
    opacity: 0.35;
    cursor: not-allowed;
    background: transparent !important;
  }

  /* Davr tanlash paytida kursor ustidagi «N kun» belgisi (absolute — oyna balandligi o'zgarmaydi) */
  .udp-count {
    position: absolute;
    bottom: calc(100% - 3px);
    left: 50%;
    z-index: 3;
    transform: translateX(-50%);
    padding: 2px 7px;
    border-radius: 6px;
    background: var(--textColor0);
    color: var(--surface-section);
    font-size: 11.5px;
    font-weight: 600;
    line-height: 16px;
    white-space: nowrap;
    pointer-events: none;
    box-shadow: 0 2px 6px rgba(15, 23, 42, 0.18);
  }

  /* Oy / yil almashinuvi: strelka tomonga qisqa siljish */
  .udp-month-next-enter-active,
  .udp-month-next-leave-active,
  .udp-month-prev-enter-active,
  .udp-month-prev-leave-active {
    transition:
      transform 0.14s ease,
      opacity 0.14s ease;
  }
  .udp-month-next-enter-from,
  .udp-month-prev-leave-to {
    opacity: 0;
    transform: translateX(14px);
  }
  .udp-month-next-leave-to,
  .udp-month-prev-enter-from {
    opacity: 0;
    transform: translateX(-14px);
  }
  @media (prefers-reduced-motion: reduce) {
    .udp-pages,
    .udp-page,
    .udp-tile {
      animation: none !important;
      transition: none !important;
    }
  }
</style>
