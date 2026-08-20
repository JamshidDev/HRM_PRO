<script setup>
  /**
   * Figma v3 · Tab 1 "Xodimlarning ma'lumoti bo'yicha" (node 2959:58481).
   *
   * 34px balandlikdagi yagona stacked bar: har bir segment eni o'z ulushiga
   * teng, ichida oq foiz yozuvi (segment tor bo'lsa yozuv chizilmaydi).
   * Ostida ikki ustunli legend: rangli kvadrat, nom, son va foiz.
   *
   * Maketdagi oltita ta'lim darajasi o'rniga backend uchtasini qaytaradi
   * (oliy / o'rta / o'rta maxsus) — segmentlar ham shuncha bo'ladi.
   */
  import HeadMortarboard from '@/assets/icons/hrmDashboard/head-mortarboard.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import { useDashboardStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'

  defineEmits(['detail'])

  const store = useDashboardStore()

  // Maketdagi segment ranglari tartibi
  const TOKENS = [
    '--fig-icon-brand',
    '--fig-icon-purple',
    '--fig-icon-indigo',
    '--fig-icon-green',
    '--fig-icon-amber',
    '--fig-icon-red'
  ]

  const total = computed(() =>
    store.dashboard.eduCard.reduce((sum, item) => sum + (item.count ?? 0), 0)
  )

  const items = computed(() =>
    store.dashboard.eduCard.map((item, idx) => {
      const count = item.count ?? 0
      const percent = total.value ? (count / total.value) * 100 : 0
      return {
        title: item.title,
        count,
        percent,
        // maketdagi vergulli foiz: `32.75` → `32,8 %`
        percentLabel: `${percent.toFixed(1).replace('.', ',')} %`,
        token: TOKENS[idx % TOKENS.length]
      }
    })
  )

  const format = (value) => Utils.formatNumberToMoney(value) || String(value ?? 0)
</script>

<template>
  <FigPanel
    tint="indigo"
    :icon="HeadMortarboard"
    :title="$t('dashboardPage.edu.title')"
    :action-text="$t('content.detail')"
    inner-class="px-4 pt-1.5 pb-0.5 gap-4"
    @action="$emit('detail')"
  >
    <div class="flex h-[34px] w-full items-start gap-0.5 overflow-hidden">
      <div
        v-for="(item, idx) in items"
        :key="idx"
        class="flex h-full items-center justify-center overflow-hidden rounded-[10px]"
        :style="{ width: `${item.percent}%`, backgroundColor: `var(${item.token})` }"
      >
        <!-- tor segmentda yozuv sig'maydi — maketda ham ular bo'sh qoladi -->
        <p
          v-if="item.percent >= 8"
          class="text-[12px] leading-4 font-semibold whitespace-nowrap text-white"
        >
          {{ item.percentLabel }}
        </p>
      </div>
    </div>

    <div class="grid gap-x-3.5 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
      <div v-for="(item, idx) in items" :key="idx" class="flex min-w-0 gap-2 pt-0.5">
        <span
          class="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-[3px]"
          :style="{ backgroundColor: `var(${item.token})` }"
        ></span>
        <div class="flex min-w-0 flex-1 flex-col gap-0.5">
          <p class="truncate text-[12px] leading-4 text-fig-text-secondary">{{ $t(item.title) }}</p>
          <div class="flex items-baseline gap-2">
            <p class="text-[12px] leading-4 font-semibold whitespace-nowrap text-fig-text-primary">
              {{ format(item.count) }}
            </p>
            <p class="text-[12px] leading-4 whitespace-nowrap text-fig-text-tertiary">
              {{ item.percentLabel }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </FigPanel>
</template>
