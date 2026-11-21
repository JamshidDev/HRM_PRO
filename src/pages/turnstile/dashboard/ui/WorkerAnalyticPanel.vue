<script setup>
  /**
   * «Soatlik o'tishlar» — tanlangan kunda har soatda turniket/mobil orqali o'tgan
   * xodimlar soni (ustunli grafik, backend oraliqlari — dev'da 2 soatlik). Tepada 3 ko'rsatkich:
   * eng gavjum oraliq, jami o'tishlar va faol vaqt.
   * (Ilgari bu yerda jami/reja/kelgan/kelmagan legendasi turardi — grafikka aloqasi
   * yo'q edi, bu sonlar yuqori kartalar va «Reja bo'yicha davomat» da bor.)
   */
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import CardHeader from './CardHeader.vue'
  import { PALETTE, TINT, CHIP_CLASS } from './palette.js'
  import DailyEventChart from './DailyEventChart.vue'
  import { Utils } from '@/utils/index.js'
  import { UICountUp } from '@/components/index.js'
  import { WorkerAnalyticPanelSkeleton } from './skeleton/index.js'
  import { Clock20Regular } from '@vicons/fluent'

  const store = useTurnstileDashboardStore()

  const events = computed(() => (Array.isArray(store.dailyEvents) ? store.dailyEvents : []))
  const formatCount = (v) => Utils.formatNumberToMoney(v) || '0'

  // Yorliq = oraliq boshi; oraliq uzunligi ma'lumotdan (dev backend: 2 soat).
  const toMinutes = (hour) => {
    const [h, m] = String(hour).split(':').map(Number)
    return (h || 0) * 60 + (m || 0)
  }
  const stepMin = computed(() =>
    events.value.length > 1 ? toMinutes(events.value[1].hour) - toMinutes(events.value[0].hour) : 60
  )
  // Kun oxiri «24:00» bo'lib yoziladi («22:00 – 00:00» emas).
  const fmt = (min) => {
    if (min === 1440) return '24:00'
    const m = ((min % 1440) + 1440) % 1440
    return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
  }
  const range = (hour) => `${hour} – ${fmt(toMinutes(hour) + stepMin.value)}`

  const peak = computed(() =>
    events.value.reduce((best, v) => (v.count > (best?.count || 0) ? v : best), null)
  )
  const total = computed(() => events.value.reduce((s, v) => s + (v.count || 0), 0))
  // Faol vaqt — o'tishlar cho'qqining 5% idan ko'p bo'lgan birinchi oraliq boshi va oxirgi oraliq oxiri.
  const activeRange = computed(() => {
    const limit = (peak.value?.count || 0) * 0.05
    const busy = events.value.filter((v) => v.count > limit)
    if (!busy.length) return '—'
    let end = toMinutes(busy[busy.length - 1].hour) + stepMin.value
    // Bugun: oraliq hali tugamagan bo'lsa — oxiri hozirgi vaqt (kelajak ko'rsatilmasin).
    const now = new Date()
    const picked = new Date(store.dashboardParams.date || Date.now())
    if (picked.toDateString() === now.toDateString()) {
      end = Math.min(end, now.getHours() * 60 + now.getMinutes())
    }
    return `${busy[0].hour} – ${fmt(end)}`
  })
</script>

<template>
  <div class="bg-fig-block shadow-card rounded-2xl px-1 pb-1 relative overflow-hidden flex flex-col">
    <!-- ma'lumoti stats-four dan — o'sha so'rov yuklanishini kutadi -->
    <WorkerAnalyticPanelSkeleton v-if="store.dailyAttendanceLoading" />

    <template v-else>
      <CardHeader :icon="Clock20Regular" :tint="TINT.main" :title="$t('turnStileDashboard.hourly.title')" />
      <p class="-mt-2 px-2 pb-2 text-[12px] leading-4 text-fig-text-disable">
        {{ $t('turnStileDashboard.hourly.hint', { n: stepMin / 60 }) }}
      </p>

      <!-- grafikni tushuntiruvchi 3 ko'rsatkich -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 px-2 pb-2">
        <div class="rounded-xl bg-fig-bg-secondary px-3 py-2">
          <p class="flex items-center gap-1.5 text-[12px] leading-4 text-fig-text-tertiary">
            <span
              class="peak-dot h-2 w-2 rounded-full"
              :style="{ backgroundColor: `var(${PALETTE.main})` }"
            ></span>
            {{ $t('turnStileDashboard.hourly.peak') }}
          </p>
          <p class="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span class="whitespace-nowrap text-[18px] leading-6 font-bold text-fig-text-primary">
              {{ peak?.count ? range(peak.hour) : '—' }}
            </span>
            <span
              v-if="peak?.count"
              class="whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] leading-4 font-semibold"
              :class="CHIP_CLASS.main"
            >
              {{ formatCount(peak.count) }} {{ $t('turnStileDashboard.hourly.people') }}
            </span>
          </p>
        </div>
        <div class="rounded-xl bg-fig-bg-secondary px-3 py-2">
          <p class="text-[12px] leading-4 text-fig-text-tertiary">
            {{ $t('turnStileDashboard.hourly.total') }}
          </p>
          <p class="mt-1 whitespace-nowrap text-[18px] leading-6 font-bold text-fig-text-primary">
            <UICountUp :value="formatCount(total)" />
          </p>
        </div>
        <div class="rounded-xl bg-fig-bg-secondary px-3 py-2">
          <p class="text-[12px] leading-4 text-fig-text-tertiary">
            {{ $t('turnStileDashboard.hourly.active') }}
          </p>
          <p class="mt-1 whitespace-nowrap text-[18px] leading-6 font-bold text-fig-text-primary">
            {{ activeRange }}
          </p>
        </div>
      </div>

      <!-- grafik karta balandligining qolganini to'ldiradi (qo'shni karta balandroq bo'lsa ham) -->
      <div class="mx-2 mb-2 flex-1 min-h-[200px]">
        <DailyEventChart />
      </div>
    </template>
  </div>
</template>

<style scoped>
  /* Cho'qqi nuqtasi sekin «nafas oladi». */
  .peak-dot {
    animation: peak-pulse 1.8s ease-in-out infinite;
  }

  @keyframes peak-pulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.35;
      transform: scale(0.7);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .peak-dot {
      animation: none;
    }
  }
</style>
