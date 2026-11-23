<script setup>
  // «Face ID tahlili» — umumiy `StatCard` qolipida: kelganlar turniket / mobil bo'yicha.
  import { Phone20Regular } from '@vicons/fluent'
  import FaceTurnstileIcon from '@/assets/icons/dashboard/face-turnstile.svg'
  import StatCard from './StatCard.vue'
  import { PALETTE, TINT } from './palette.js'
  import { percentText } from './format.js'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import HeadAiScanIcon from '@/assets/icons/dashboard/head-ai-scan.svg'

  const { t } = i18n.global
  const store = useTurnstileDashboardStore()
  const emits = defineEmits(['onPreview'])

  const turnstile = computed(() => store.attendance?.came_turnstile || 0)
  const mobile = computed(() => store.attendance?.came_mobile || 0)
  // Jami — backenddagi `came` (yuqoridagi «Ishga kelgan» kartasi bilan bir xil son). Ilgari
  // turniket + mobil yig'indisi edi — backend ikki kanaldan o'tganni ikkala guruhga qo'shsa, farq qilardi.
  const total = computed(() => store.attendance?.came || 0)
  const mobilePercent = computed(() => percentText(mobile.value, total.value))

  // Vizual: ikki plitka (turniket / mobil) — ikonka, ulush, qisqa nom; bosilsa ro'yxat.
  const tiles = computed(() => [
    {
      icon: markRaw(FaceTurnstileIcon),
      label: t('turnStileDashboard.kpi.turnstileShort'),
      share: percentText(turnstile.value, total.value),
      token: PALETTE.main,
      previewType: 'att_came_turnstile'
    },
    {
      icon: markRaw(Phone20Regular),
      label: t('turnStileDashboard.kpi.mobileShort'),
      share: percentText(mobile.value, total.value),
      token: PALETTE.second,
      previewType: 'att_came_mobile'
    }
  ])

  const rows = computed(() => [
    {
      label: t('turnStileDashboard.cards.turnstileFace'),
      count: turnstile.value,
      token: PALETTE.main,
      previewType: 'att_came_turnstile'
    },
    {
      label: t('turnStileDashboard.cards.mobileFace'),
      count: mobile.value,
      token: PALETTE.second,
      previewType: 'att_came_mobile'
    }
  ])
</script>

<template>
  <StatCard
    :icon="HeadAiScanIcon"
    :tint="TINT.main"
    :title="$t('turnStileDashboard.compare.faceIdTitle')"
    :loading="store.mainChartLoading"
    :label="$t('turnStileDashboard.cards.come')"
    :value="total"
    :chip="{ text: `${mobilePercent}% ${$t('turnStileDashboard.rate.mobile')}`, tone: 'second' }"
    :rows="rows"
    @on-preview="emits('onPreview', $event)"
  >
    <template #visual>
      <!-- Ma'lumot bo'lmasa ham plitkalar ko'rinadi (0%) — karta bo'sh kulrang chiziqqa tushib qolmasin. -->
      <div class="grid w-full grid-cols-2 gap-2">
        <button
          v-for="tile in tiles"
          :key="tile.previewType"
          type="button"
          class="flex h-20 cursor-pointer items-center gap-3 rounded-xl px-3 text-left transition-transform duration-200 hover:-translate-y-0.5"
          :style="{ backgroundColor: `color-mix(in srgb, var(${tile.token}) 12%, transparent)` }"
          @click="emits('onPreview', tile.previewType)"
        >
          <span
            class="face-tile__icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
            :style="{ backgroundColor: `var(${tile.token})` }"
          >
            <component :is="tile.icon" />
          </span>
          <span class="min-w-0">
            <span class="block text-[20px] leading-6 font-bold text-fig-text-primary">{{ tile.share }}%</span>
            <span class="block truncate text-[12px] leading-4 text-fig-text-tertiary">{{ tile.label }}</span>
          </span>
        </button>
      </div>
    </template>
  </StatCard>
</template>

<style scoped>
  /* SVG ikonkalar o'z rangida chizilgan — plitkada oq bo'lishi uchun currentColor. */
  .face-tile__icon :deep(svg) {
    width: 20px;
    height: 20px;
  }

  .face-tile__icon :deep(path[fill]:not([fill='none'])) {
    fill: currentColor;
  }
</style>
