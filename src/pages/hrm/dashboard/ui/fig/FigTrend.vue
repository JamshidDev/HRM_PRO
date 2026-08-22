<script setup>
  /**
   * Figma v3 "Trend YoY" qatori (node 2959:58254) — maketda eng ko'p
   * takrorlanadigan element: uchburchak + ishorali o'zgarish + qavs ichida foiz.
   *
   * Ko'rinishlari (`unit` bo'yicha):
   *   count   → `▲ +12 600 (4,7 %)`
   *   days    → `▼ −6 kun (13,6 %)`
   *   years   → `▼ −0,1 yil (1,5 %)`
   *   pp      → `▲ +2,1 p.p.`        (protsent punkt — qavs ichi bo'lmaydi)
   *   percent → `▲ 16 %`             (ustun izohlari: ishorasiz, butun)
   *
   * Ma'lumot yetarli bo'lmasa (backend o'tgan yil ko'rsatkichini bermasa)
   * qator butunlay chizilmaydi — o'ylab topilgan o'zgarish ko'rsatilmaydi.
   */
  import TriangleGreen from '@/assets/icons/accDashboard/triangle-green.svg'
  import TriangleRed from '@/assets/icons/accDashboard/triangle-red.svg'
  import { toDecimal, toSignedCount, toSignedDecimal } from '../../format.js'

  const props = defineProps({
    // `{value, prev, delta, delta_percent}` yoki `{value, prev, delta_pp}`
    metric: {
      type: Object,
      default: null
    },
    unit: {
      type: String,
      default: 'count' // 'count' | 'days' | 'years' | 'pp' | 'percent'
    },
    // Chapdagi izoh matni (i18n kaliti). `null` — faqat o'zgarish chiziladi.
    labelKey: {
      type: String,
      default: 'dashboardPage.trend.vsLastYear'
    },
    // Kichik o'lchamli variant (karta ichidagi qatorlar uchun)
    small: Boolean
  })

  /** Yo'nalishni belgilovchi son. */
  const raw = computed(() => {
    const m = props.metric
    if (!m) return null
    if (props.unit === 'pp') return m.delta_pp
    if (props.unit === 'percent') return m.delta_percent
    return m.delta
  })

  const visible = computed(() => raw.value !== null && raw.value !== undefined)

  const dir = computed(() => {
    const value = Number(raw.value || 0)
    return value > 0 ? 'up' : value < 0 ? 'down' : 'flat'
  })

  const colorClass = computed(
    () =>
      ({ up: 'text-fig-text-green', down: 'text-fig-text-red' })[dir.value] ||
      'text-fig-text-tertiary'
  )

  /** Sondan keyingi birlik (tarjima qilinadi): `kun`, `yil`, `p.p.` */
  const unitKey = computed(
    () =>
      ({
        days: 'dashboardPage.trend.days',
        years: 'dashboardPage.trend.years',
        pp: 'dashboardPage.trend.pp'
      })[props.unit]
  )

  /** Asosiy son — kasr birliklarda vergul bilan, butunlarda bo'sh joy bilan. */
  const amount = computed(() => {
    if (props.unit === 'pp') return toSignedDecimal(props.metric.delta_pp)
    // Maketdagi ustun izohlarida foiz ishorasiz va butun yoziladi (`▲ 16 %`) —
    // yo'nalishni uchburchakning o'zi ko'rsatadi.
    if (props.unit === 'percent') return `${toDecimal(props.metric.delta_percent, 0)} %`
    if (props.unit === 'years') return toSignedDecimal(props.metric.delta)
    return toSignedCount(props.metric.delta)
  })

  /** Qavs ichidagi foiz — `pp`/`percent` variantlarida chizilmaydi. */
  const percentText = computed(() => {
    if (props.unit === 'pp' || props.unit === 'percent') return null
    const percent = props.metric?.delta_percent
    if (percent === null || percent === undefined) return null
    return `(${toDecimal(percent)} %)`
  })
</script>

<template>
  <div v-if="visible" class="flex items-center justify-between gap-2">
    <p
      v-if="labelKey"
      class="min-w-0 flex-1 truncate text-fig-text-tertiary"
      :class="small ? 'text-[11px] leading-4' : 'text-[12px] leading-4'"
    >
      {{ $t(labelKey) }}
    </p>

    <div class="flex shrink-0 items-center gap-1">
      <!-- Maketdagi uchburchak yuqoriga qaragan holda eksport qilingan —
           pasayishda qizil nusxasi 180° buriladi. -->
      <span
        v-if="dir !== 'flat'"
        class="flex h-3 w-3 items-center justify-center"
        :class="dir === 'down' && 'rotate-180'"
      >
        <component :is="dir === 'up' ? TriangleGreen : TriangleRed" />
      </span>
      <!-- O'zgarish nolga teng bo'lsa maketda kulrang tire turadi -->
      <span v-else class="h-0.5 w-2.5 shrink-0 rounded-full bg-fig-text-tertiary"></span>

      <p
        class="font-semibold whitespace-nowrap"
        :class="[colorClass, small ? 'text-[11px] leading-4' : 'text-[12px] leading-4']"
      >
        {{ amount }}<template v-if="unitKey"> {{ $t(unitKey) }}</template>
        <template v-if="percentText"> {{ percentText }}</template>
      </p>
    </div>
  </div>
</template>
