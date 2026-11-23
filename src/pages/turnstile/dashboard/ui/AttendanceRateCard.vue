<script setup>
  /**
   * «Bugungi davomat darajasi» — yarim doira o'lchagich.
   * Ulush = grafik bo'yicha kelgan ÷ kelishi shart (`plan.expected − plan.excused`).
   * Sodda: yoy + oxirida yuguruvchi «tugma», markazda foiz va daraja pill'i
   * (Yaxshi / O'rtacha / Past), ostida «kelgan / kelishi kerak». Pastda ikki plitka:
   * kech kelgan va erta ketganlar (son, bosilsa ro'yxat).
   */
  import { Info16Regular, ChevronRight20Regular } from '@vicons/fluent'
  import { Utils } from '@/utils/index.js'
  import { UICountUp } from '@/components/index.js'
  import CardHeader from './CardHeader.vue'
  import { PALETTE, TINT, CHIP_CLASS } from './palette.js'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import { Gauge20Regular } from '@vicons/fluent'

  const store = useTurnstileDashboardStore()
  const emits = defineEmits(['onPreview'])

  const GOOD = 90 // shu foizdan «Yaxshi»
  const MEDIUM = 70 // shu foizdan «O'rtacha», undan past — «Past»
  // Sarlavha «Bugungi …» faqat bugungi sana tanlanganda — o'tgan kun tanlansa «Davomat darajasi».
  const isToday = computed(
    () => new Date(store.dashboardParams.date || Date.now()).toDateString() === new Date().toDateString()
  )
  const formatCount = (v) => Utils.formatNumberToMoney(v) || '0'
  const formatPercent = (v) => String(v).replace('.', ',')

  // Daraja = grafik bo'yicha kelganlar ÷ kelishi SHART bo'lganlar.
  // Kelishi shart = grafikda ish kuni bo'lganlar − sababli (ta'til, kasallik, safar…):
  // sababli xodimlar foizni noto'g'ri pasaytirmasin.
  const came = computed(() => store.attendance?.plan?.came || 0)
  const expected = computed(() =>
    Math.max((store.attendance?.plan?.expected || 0) - (store.attendance?.plan?.excused || 0), 0)
  )
  const percent = computed(() =>
    // pastga yaxlitlanadi: 24 935 / 24 936 «100%» emas, «99,9%» — kelmagan bor ekan, 100 ko'rinmasin
    expected.value ? Math.min(Math.floor((came.value / expected.value) * 1000) / 10, 100) : 0
  )

  // Bugun hech kim kelishi shart bo'lmasa (yakshanba, bayram, ma'lumot yo'q) — foiz o'lchanmaydi:
  // «0% · Past» emas, «—» chiqadi.
  const hasData = computed(() => expected.value > 0)

  // Daraja: rang roli va pill matni.
  const level = computed(() => {
    if (percent.value >= GOOD) return { role: 'main', key: 'good' }
    if (percent.value >= MEDIUM) return { role: 'warn', key: 'medium' }
    return { role: 'bad', key: 'low' }
  })
  const arcColors = computed(() =>
    level.value.role === 'main' ? [PALETTE.second, PALETTE.main] : [PALETTE[level.value.role], PALETTE[level.value.role]]
  )

  // --- o'lchagich geometriyasi: markaz (100, 100), radius 80, chapdan o'ngga 180° ---
  const R = 80
  const point = (p, r = R) => {
    const a = Math.PI * (1 - p / 100)
    return { x: 100 + r * Math.cos(a), y: 100 - r * Math.sin(a) }
  }
  // Yoy va tugma 0 dan o'z qiymatigacha birga «yuguradi».
  const shown = ref(0)
  let frame = null
  const animateTo = (to) => {
    cancelAnimationFrame(frame)
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      shown.value = to
      return
    }
    // Joriy holatdan yangi qiymatga (fon yangilanishida 0 dan qayta boshlanmasin).
    const from = shown.value
    const start = performance.now()
    const step = (now) => {
      const t = Math.min((now - start) / 1100, 1)
      shown.value = from + (to - from) * (1 - Math.pow(1 - t, 3))
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
  }
  watch(percent, animateTo, { immediate: true })
  onBeforeUnmount(() => cancelAnimationFrame(frame))
  const knob = computed(() => point(shown.value))

  // SVG id'lari sahifada yagona bo'lishi kerak.
  const uid = Math.random().toString(36).slice(2, 8)
  const gradientId = `att-rate-g-${uid}`
  const glowId = `att-rate-f-${uid}`

  const tiles = computed(() => [
    {
      label: 'turnStileDashboard.cards.lateCome',
      count: store.countForDate(store.workTime?.late_and_early?.late),
      token: PALETTE.bad,
      previewType: 'late_come'
    },
    {
      label: 'turnStileDashboard.cards.earlyGo',
      count: store.countForDate(store.workTime?.late_and_early?.early),
      token: PALETTE.warn,
      previewType: 'early_leave'
    }
  ])
</script>

<template>
  <div class="bg-fig-block shadow-card rounded-2xl px-1 pb-1 relative overflow-hidden flex flex-col">
    <!-- qo'shni kartalar kabi ikki qatorli sarlavha: ostida formula -->
    <CardHeader
      :icon="Gauge20Regular"
      :tint="TINT.main"
      :title="isToday ? $t('turnStileDashboard.rate.title') : $t('turnStileDashboard.rate.titleDay')"
      :subtitle="`${$t('turnStileDashboard.kpi.came')} ÷ ${$t('turnStileDashboard.rate.mustCome')}`"
      :subtitle-hint="$t('turnStileDashboard.rate.hint')"
    >
      <template #extra>
        <n-tooltip :style="{ maxWidth: '260px' }">
          <template #trigger>
            <n-icon size="16" class="mr-1 shrink-0 cursor-help text-fig-text-tertiary">
              <Info16Regular />
            </n-icon>
          </template>
          <p>{{ $t('turnStileDashboard.rate.hint') }}</p>
          <!-- Chip darajalari (Yaxshi / O'rtacha / Past) qaysi foizdan ekani -->
          <p class="mt-1.5">{{ $t('turnStileDashboard.rate.levels', { good: GOOD, medium: MEDIUM }) }}</p>
        </n-tooltip>
      </template>
    </CardHeader>

    <div v-if="store.mainChartLoading" class="flex-1 flex items-center justify-center p-4">
      <n-skeleton :width="220" :height="130" :sharp="false" />
    </div>

    <div v-else class="flex-1 flex flex-col items-center justify-center px-3 pb-3">
      <div class="relative w-full max-w-[280px]">
        <svg viewBox="0 0 200 112" class="w-full overflow-visible">
          <defs>
            <linearGradient :id="gradientId" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" :stop-color="`var(${arcColors[0]})`" />
              <stop offset="100%" :stop-color="`var(${arcColors[1]})`" />
            </linearGradient>
            <filter :id="glowId" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" :flood-color="`var(${arcColors[1]})`" flood-opacity="0.55" />
            </filter>
          </defs>

          <!-- asos yoy -->
          <path
            d="M20 100 A80 80 0 0 1 180 100"
            fill="none"
            stroke="var(--fig-br-disable)"
            stroke-width="14"
            stroke-linecap="round"
          />
          <!-- qiymat yoyi (0 da chizilmaydi: yumaloq uchli 0 uzunlikdagi chiziq ikki nuqta bo'lib qolardi) -->
          <path
            v-if="hasData && shown > 0.5"
            d="M20 100 A80 80 0 0 1 180 100"
            fill="none"
            :stroke="`url(#${gradientId})`"
            stroke-width="14"
            stroke-linecap="round"
            pathLength="100"
            :stroke-dasharray="`${shown} 100`"
          />

          <!-- yoy oxiridagi tugma -->
          <circle
            v-if="hasData && shown > 0.5"
            :cx="knob.x"
            :cy="knob.y"
            r="9"
            fill="var(--fig-block-bg)"
            :stroke="`var(${arcColors[1]})`"
            stroke-width="4"
            :filter="`url(#${glowId})`"
          />

        </svg>

        <div class="absolute inset-x-0 bottom-1 flex flex-col items-center gap-1">
          <p class="text-[32px] leading-9 font-bold text-fig-text-primary">
            <template v-if="hasData"><UICountUp :value="formatPercent(percent)" />%</template>
            <template v-else>—</template>
          </p>
          <span
            v-if="hasData"
            class="rounded-full px-2.5 py-0.5 text-[12px] leading-4 font-semibold"
            :class="CHIP_CLASS[level.role]"
          >
            {{ $t(`turnStileDashboard.rate.${level.key}`) }}
          </span>
        </div>
      </div>
      <!-- formula ko'rinib tursin: kelgan ÷ kelishi shart -->
      <div class="mt-3 flex items-center justify-center gap-3 text-center">
        <div>
          <p class="text-[16px] leading-5 font-bold text-fig-text-primary">{{ formatCount(came) }}</p>
          <p class="text-[11px] leading-4 text-fig-text-tertiary">{{ $t('turnStileDashboard.kpi.came') }}</p>
        </div>
        <span class="text-[18px] leading-5 text-fig-text-disable">÷</span>
        <div>
          <p class="text-[16px] leading-5 font-bold text-fig-text-primary">{{ formatCount(expected) }}</p>
          <p class="text-[11px] leading-4 text-fig-text-tertiary">{{ $t('turnStileDashboard.rate.mustCome') }}</p>
        </div>
      </div>
    </div>

    <!-- kech kelgan / erta ketgan — ikki plitka -->
    <div class="mt-auto grid grid-cols-2 gap-1">
      <button
        v-for="tile in tiles"
        :key="tile.previewType"
        type="button"
        class="group cursor-pointer rounded-xl bg-fig-bg-secondary px-3 py-2.5 text-left transition-colors duration-200 hover:bg-fig-bg-tertiary"
        @click="emits('onPreview', tile.previewType)"
      >
        <p class="flex items-center gap-1.5 text-[12px] leading-4 text-fig-text-tertiary">
          <span class="h-2 w-2 shrink-0 rounded-full" :style="{ backgroundColor: `var(${tile.token})` }"></span>
          <span class="min-w-0 flex-1 truncate" :title="$t(tile.label)">{{ $t(tile.label) }}</span>
          <n-icon
            size="14"
            class="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
          >
            <ChevronRight20Regular />
          </n-icon>
        </p>
        <p class="mt-1 text-[20px] leading-6 font-bold text-fig-text-primary">
          <UICountUp :value="formatCount(tile.count)" />
        </p>
      </button>
    </div>
  </div>
</template>
