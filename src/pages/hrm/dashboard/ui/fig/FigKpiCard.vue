<script setup>
  /**
   * Figma v3 dashboard KPI kartasi (node 2959:58231).
   *
   * Tuzilishi: tint chip + 20px ikonka, 20px qiymat, o'ng yuqorida 64px xira
   * suv belgisi va pastda 12px radiusli `bg-secondary` blokda uch qator —
   * ikkita "nom — qiymat" va eng pastda "o'tgan yilga" trendi.
   *
   * Karta konfiguratsiyasi `pages/hrm/dashboard/kpi.js` da yasaladi: bu yerda
   * hisob-kitob yo'q, faqat matn va i18n kalitlari chiziladi.
   */
  import ChipUsers from '@/assets/icons/hrmDashboard/chip-users.svg'
  import ChipUserAlt from '@/assets/icons/hrmDashboard/chip-user-alt.svg'
  import ChipHierarchy from '@/assets/icons/hrmDashboard/chip-hierarchy.svg'
  import ChipAgreement from '@/assets/icons/hrmDashboard/chip-agreement.svg'
  import ChipMedicalFile from '@/assets/icons/hrmDashboard/head-medical-file.svg'
  import MarkUsers from '@/assets/icons/hrmDashboard/wm-users.svg'
  import MarkUserAlt from '@/assets/icons/hrmDashboard/wm-user-alt.svg'
  import MarkHierarchy from '@/assets/icons/hrmDashboard/wm-hierarchy.svg'
  import MarkAgreement from '@/assets/icons/hrmDashboard/wm-agreement.svg'
  import FigTrend from './FigTrend.vue'

  const props = defineProps({
    /**
     * `kpi.js` qaytaradigan obyekt:
     * `{ titleKey, value, unitKey?, rows: [{titleKey, value, unitKey}], trend: {metric, unit} }`
     */
    card: {
      type: Object,
      required: true
    },
    variant: {
      type: String,
      default: 'users'
    },
    mock: Boolean
  })

  // Maketdagi kartalar: chip foni, 20px ikonka va 64px suv belgisi.
  const VARIANTS = {
    users: { tint: 'bg-fig-blue-100', icon: ChipUsers, mark: MarkUsers },
    pension: { tint: 'bg-fig-amber-100', icon: ChipUserAlt, mark: MarkUserAlt },
    positions: { tint: 'bg-fig-indigo-100', icon: ChipHierarchy, mark: MarkHierarchy },
    fxsh: { tint: 'bg-fig-indigo-100', icon: ChipAgreement, mark: MarkAgreement },
    // Kadrlar harakati bobi
    timeToFill: { tint: 'bg-fig-blue-100', icon: ChipHierarchy, mark: MarkHierarchy },
    tenure: { tint: 'bg-fig-amber-100', icon: ChipUserAlt, mark: MarkUserAlt },
    // Davomat bobi
    atWork: { tint: 'bg-fig-blue-100', icon: ChipUsers, mark: MarkUsers },
    vacation: { tint: 'bg-fig-amber-100', icon: ChipUserAlt, mark: MarkUserAlt },
    chronicLate: { tint: 'bg-fig-red-100', icon: ChipMedicalFile, mark: null },
    sickLeave: { tint: 'bg-fig-red-100', icon: ChipMedicalFile, mark: null }
  }

  const variant = computed(() => VARIANTS[props.variant] || VARIANTS.users)
  const rows = computed(() => props.card.rows || [])

  /**
   * Trend qatori (va uning ustidagi ajratgich) faqat taqqoslash ma'lumoti
   * bo'lganda chiziladi — backend o'tgan yil ko'rsatkichini bermaganda
   * `FigTrend` bo'sh qolib, tepasida yolg'iz chiziq qolmasin.
   */
  const hasTrend = computed(() => {
    const trend = props.card.trend
    if (!trend?.metric) return false
    const value = trend.unit === 'pp' ? trend.metric.delta_pp : trend.metric.delta
    return value !== null && value !== undefined
  })
</script>

<template>
  <!-- `mock` — ko'rsatkich hali `mock.js` dan olinmoqda: plita blur qilinadi va
       ustiga «Tez orada» yozuvi chiqadi (grafik kartalaridagi bilan bir xil
       qatlam, uslubi `assets/scss/component.scss` da). Backend qiymatni bergan
       zahoti `store.isMock(...)` `false` qaytaradi va qatlam o'zi yo'qoladi. -->
  <div class="fig-soon" :class="mock && 'fig-soon--on'">
    <div
      class="fig-soon__card relative flex flex-col gap-2 overflow-hidden rounded-2xl bg-fig-block px-1 pt-1.5 pb-1"
    >
      <!-- o'ng yuqoridagi xira suv belgisi: 64px ramka, ikonka o'z o'lchamida markazda -->
      <span
        v-if="variant.mark"
        aria-hidden="true"
        class="pointer-events-none absolute top-3 right-3 flex h-16 w-16 items-center justify-center select-none"
      >
        <component :is="variant.mark" />
      </span>

      <div class="relative flex items-center gap-1 px-2">
        <span class="shrink-0 rounded-lg p-1" :class="variant.tint">
          <span class="flex h-5 w-5 items-center justify-center">
            <component :is="variant.icon" />
          </span>
        </span>
        <p
          class="min-w-0 flex-1 truncate text-[14px] leading-[18px] font-medium text-fig-text-tertiary"
        >
          {{ $t(card.titleKey) }}
        </p>
        <span
          v-if="mock"
          class="shrink-0 rounded bg-fig-bg-tertiary px-1.5 py-0.5 text-[10px] leading-3 font-medium tracking-wide uppercase text-fig-text-disable"
        >
          mock
        </span>
      </div>

      <p
        class="relative px-2 text-[20px] leading-6 font-semibold whitespace-nowrap text-fig-text-primary"
      >
        {{ card.value }}<template v-if="card.unitKey"> {{ $t(card.unitKey) }}</template>
      </p>

      <!-- `mt-auto` — qo'shni karta balandroq bo'lsa ham panel pastda qoladi -->
      <div class="mt-auto flex flex-col gap-1.5 rounded-xl bg-fig-bg-secondary px-3 py-1.5">
        <template v-for="(row, idx) in rows" :key="idx">
          <span v-if="idx" class="h-px w-full rounded-full bg-fig-br-disable"></span>
          <div class="flex items-start justify-between gap-2">
            <p class="min-w-0 flex-1 text-[12px] leading-4 text-fig-text-tertiary">
              {{ $t(row.titleKey) }}
            </p>
            <p
              class="shrink-0 text-right text-[12px] leading-4 font-semibold whitespace-nowrap text-fig-text-primary"
            >
              {{ row.value }}<template v-if="row.unitKey"> {{ $t(row.unitKey) }}</template>
            </p>
          </div>
        </template>

        <template v-if="hasTrend">
          <span v-if="rows.length" class="h-px w-full rounded-full bg-fig-br-disable"></span>
          <FigTrend :metric="card.trend.metric" :unit="card.trend.unit" />
        </template>
      </div>
    </div>

    <div v-if="mock" class="fig-soon__veil">
      <span class="fig-soon__badge">{{ $t('dashboardPage.comingSoon') }}</span>
    </div>
  </div>
</template>
