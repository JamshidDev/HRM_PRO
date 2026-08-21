<script setup>
  /**
   * Figma v3 · Tab 1 "Xodimlarning millati — waffle" (node 2959:58553).
   *
   * Yuqorida jami son va o'tgan yilga nisbatan o'zgarish, ostida 100 nuqtali
   * waffle (har bir nuqta ≈ 1 %) va o'ngda millatlar ro'yxati ulushlari bilan.
   *
   * Nuqtalar `percent` bo'yicha taqsimlanadi: har bir millatga o'z ulushiga
   * teng miqdorda nuqta beriladi, yig'indi 100 dan kam chiqsa qolgan nuqtalar
   * eng katta ulushga qo'shiladi — maketdagi to'liq 10×10 to'r saqlanadi.
   */
  import HeadPie from '@/assets/icons/accDashboard/head-pie.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import FigTrend from '../fig/FigTrend.vue'
  import { useDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { toCount, toPercent } from '../../format.js'

  defineEmits(['detail'])

  const store = useDashboardStore()
  const { t } = i18n.global

  const TOKENS = [
    '--fig-icon-brand',
    '--fig-icon-pink',
    '--fig-icon-indigo',
    '--fig-icon-green',
    '--fig-icon-amber',
    '--fig-icon-purple',
    '--fig-icon-orange',
    '--fig-icon-red'
  ]

  const CELLS = 100

  const card = computed(() => store.overview.nationality || {})
  const isMock = computed(() => store.isMock('overview', 'nationality'))

  const items = computed(() =>
    (card.value.items || []).map((item, idx) => ({
      ...item,
      label: item.label ?? t(`dashboardPage.nationality.items.${item.key}`),
      token: TOKENS[idx % TOKENS.length]
    }))
  )

  const cells = computed(() => {
    const list = items.value
    if (!list.length) return []

    const counts = list.map((item) => Math.round(Number(item.percent || 0)))
    const assigned = counts.reduce((sum, value) => sum + value, 0)
    // Yaxlitlash sababli yetmagan/oshgan nuqtalar eng katta ulushga qo'shiladi
    const biggest = counts.indexOf(Math.max(...counts))
    counts[biggest] += CELLS - assigned

    return counts.flatMap((count, idx) =>
      Array.from({ length: Math.max(count, 0) }, () => list[idx].token)
    )
  })
</script>

<template>
  <FigPanel
    muted
    tint="green"
    :icon="HeadPie"
    :title="$t('dashboardPage.nationality.title')"
    :action-text="$t('content.detail')"
    :mock="isMock"
    inner-class="px-4 pt-2 pb-3 gap-3"
    @action="$emit('detail')"
  >
    <div class="flex flex-col gap-1">
      <p class="text-[20px] leading-6 font-semibold whitespace-nowrap text-fig-text-primary">
        {{ toCount(card.total?.value) }}
      </p>
      <FigTrend :metric="card.total" unit="count" />
    </div>

    <div class="flex flex-wrap items-start gap-5">
      <div class="grid shrink-0 grid-cols-10 gap-1">
        <span
          v-for="(token, idx) in cells"
          :key="idx"
          class="h-2.5 w-2.5 rounded-full"
          :style="{ backgroundColor: `var(${token})` }"
        ></span>
      </div>

      <div class="flex min-w-[160px] flex-1 flex-col">
        <div v-for="item in items" :key="item.key" class="flex items-center gap-2 py-[3px]">
          <span
            class="h-2.5 w-2.5 shrink-0 rounded-full"
            :style="{ backgroundColor: `var(${item.token})` }"
          ></span>
          <p class="min-w-0 flex-1 truncate text-[12px] leading-4 text-fig-text-secondary">
            {{ item.label }}
          </p>
          <p
            class="shrink-0 text-right text-[12px] leading-4 font-semibold whitespace-nowrap text-fig-text-primary"
          >
            {{ toPercent(item.percent) }}
          </p>
        </div>
      </div>
    </div>
  </FigPanel>
</template>
