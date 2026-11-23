<script setup>
  // «Grafik bo'yicha tahlil» — umumiy `StatCard` qolipida.
  import { Warning16Regular, ChevronRight20Regular } from '@vicons/fluent'
  import { Utils } from '@/utils/index.js'
  import StatCard from './StatCard.vue'
  import { PALETTE, TINT } from './palette.js'
  import { percentText } from './format.js'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { CalendarEdit20Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useTurnstileDashboardStore()
  const emits = defineEmits(['onPreview'])

  const total = computed(() => store.attendance?.total || 0)
  // Oylik «grafik tuzilmagan» kunlik no_schedule dan farq qiladi — ulush 100% dan oshmasin.
  const without = computed(() => store.monthlyTotalWorkerCount || 0)
  const withoutCapped = computed(() => Math.min(without.value, total.value))
  // Grafikka biriktirilganlar = faol xodimlar − grafik tuzilmaganlar.
  const withSchedule = computed(() => total.value - withoutCapped.value)
  const percent = computed(() => percentText(withoutCapped.value, total.value))

  // Qamrov: grafikka biriktirilganlar ulushi (ko'k), qolgani — grafigi yo'qlar (qizil).
  const coverage = computed(() => percentText(withSchedule.value, total.value))
  const coverageWidth = computed(() => (total.value ? (withSchedule.value / total.value) * 100 : 0))

  const rows = computed(() => [
    {
      label: t('turnStileDashboard.work_durations.workerCountWithSchedule'),
      count: withSchedule.value,
      token: PALETTE.main
    },
    {
      label: t('turnStileDashboard.compare.withoutSchedule'),
      count: without.value,
      token: PALETTE.bad,
      previewType: 'notIncludedSchedule'
    }
  ])
</script>

<template>
  <StatCard
    :icon="CalendarEdit20Regular"
    :tint="TINT.bad"
    :title="$t('turnStileDashboard.cards.graphAnalytic')"
    :loading="store.monthlyLoading"
    :label="$t('turnStileDashboard.cards.currentMonthWorkerCount')"
    :label-hint="$t('turnStileDashboard.cards.withoutScheduleInfo')"
    :value="without"
    :chip="{ text: `${percent}%`, tone: 'bad' }"
    :rows="rows"
    @on-preview="emits('onPreview', $event)"
  >
    <template #visual>
      <!-- «Grafik bilan qamrab olingan 55,4%» + ustun (ko'k qamrov, qizil — grafigi yo'q) + nima qilish kerak -->
      <div v-if="total" class="w-full">
        <div class="flex items-baseline justify-between gap-2">
          <span class="text-[13px] leading-[18px] text-fig-text-secondary">
            {{ $t('turnStileDashboard.kpi.coverage') }}
          </span>
          <span class="text-[22px] leading-7 font-bold text-fig-text-primary">{{ coverage }}%</span>
        </div>
        <div
          class="mt-2 h-3.5 w-full overflow-hidden rounded-full"
          :style="{ backgroundColor: `var(${PALETTE.bad})` }"
        >
          <div
            class="coverage-bar h-full rounded-full"
            :style="{ width: `${coverageWidth}%`, backgroundColor: `var(${PALETTE.main})` }"
          ></div>
        </div>
        <button
          v-if="without"
          type="button"
          class="mt-3 flex w-full cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[12px] leading-4 font-semibold text-fig-text-red transition-colors hover:bg-fig-red-100"
          @click="emits('onPreview', 'notIncludedSchedule')"
        >
          <n-icon size="16"><Warning16Regular /></n-icon>
          <span class="min-w-0 flex-1 truncate">
            {{ $t('turnStileDashboard.kpi.needSchedule', { n: Utils.formatNumberToMoney(without) }) }}
          </span>
          <n-icon size="14"><ChevronRight20Regular /></n-icon>
        </button>
      </div>
    </template>
  </StatCard>
</template>

<style scoped>
  .coverage-bar {
    transition: width 0.9s cubic-bezier(0.22, 1, 0.36, 1);
  }

  @media (prefers-reduced-motion: reduce) {
    .coverage-bar {
      transition: none;
    }
  }
</style>
