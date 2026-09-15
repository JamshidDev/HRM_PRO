<script setup>
  /**
   * Figma v3 · Tab 1 "Xodimlarning millati — waffle" (node 2959:58553).
   *
   * 100 katakli waffle (har bir katak ≈ 1 %) va o'ngda millatlar ro'yxati
   * sonlari bilan.
   *
   * Nuqtalar `percent` bo'yicha taqsimlanadi: har bir millatga o'z ulushiga
   * teng miqdorda nuqta beriladi, yig'indi 100 dan kam chiqsa qolgan nuqtalar
   * eng katta ulushga qo'shiladi — maketdagi to'liq 10×10 to'r saqlanadi.
   */
  import HeadPie from '@/assets/icons/accDashboard/head-pie.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import { useDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { toCount } from '../../format.js'

  const store = useDashboardStore()
  const { t } = i18n.global

  // Top-10 uchun 10 ta rang; `other` doim kulrang — u yig'ma guruh, millat emas.
  const TOKENS = [
    '--fig-icon-brand',
    '--fig-icon-pink',
    '--fig-icon-indigo',
    '--fig-icon-green',
    '--fig-icon-amber',
    '--fig-icon-purple',
    '--fig-icon-orange',
    '--fig-icon-red',
    '--fig-icon-yellow',
    '--fig-blue-300'
  ]

  const OTHER_TOKEN = '--fig-text-tertiary'

  const CELLS = 100

  const card = computed(() => store.overview.nationality || {})
  const isMock = computed(() => store.isMock('overview', 'nationality'))

  const items = computed(() =>
    (card.value.items || []).map((item, idx) => ({
      ...item,
      label: item.label ?? t(`dashboardPage.nationality.items.${item.key}`),
      token: item.key === 'other' ? OTHER_TOKEN : TOKENS[idx % TOKENS.length]
    }))
  )

  // `other` — yig'ma guruh, ro'yxat oxirida alohida qator bo'lib turadi.
  const mainItems = computed(() => items.value.filter((item) => item.key !== 'other'))
  const otherItem = computed(() => items.value.find((item) => item.key === 'other') || null)

  // Millatlar ustun bo'yicha to'ldiriladi: 10 ta → 5 qatordan ikki ustun.
  const legendRows = computed(() => Math.ceil(mainItems.value.length / 2) || 1)

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
    :mock="isMock"
    inner-class="px-4 pt-2 pb-3 gap-3"
  >
    <div class="flex flex-wrap items-start gap-5">
      <div class="grid shrink-0 grid-cols-10 gap-1">
        <span
          v-for="(token, idx) in cells"
          :key="idx"
          class="h-4 w-4 rounded-[4px]"
          :style="{ backgroundColor: `var(${token})` }"
        ></span>
      </div>

      <div class="flex min-w-[240px] flex-1 flex-col gap-1">
        <div
          class="grid grid-flow-col grid-cols-2 gap-x-6"
          :style="{ gridTemplateRows: `repeat(${legendRows}, minmax(0, 1fr))` }"
        >
          <div v-for="item in mainItems" :key="item.key" class="flex items-center gap-2.5 py-1">
            <span
              class="h-3 w-3 shrink-0 rounded-[3px]"
              :style="{ backgroundColor: `var(${item.token})` }"
            ></span>
            <p class="min-w-0 flex-1 truncate text-[13px] leading-[18px] text-fig-text-secondary">
              {{ item.label }}
            </p>
            <p
              class="shrink-0 text-right text-[14px] leading-[18px] font-bold whitespace-nowrap text-fig-text-primary"
            >
              {{ toCount(item.count) }}
            </p>
          </div>
        </div>

        <div
          v-if="otherItem"
          class="flex items-center gap-2.5 border-t border-fig-br-disable py-1 pt-2"
        >
          <span
            class="h-3 w-3 shrink-0 rounded-[3px]"
            :style="{ backgroundColor: `var(${otherItem.token})` }"
          ></span>
          <p class="min-w-0 flex-1 truncate text-[13px] leading-[18px] text-fig-text-secondary">
            {{ otherItem.label }}
          </p>
          <p
            class="shrink-0 text-right text-[14px] leading-[18px] font-bold whitespace-nowrap text-fig-text-primary"
          >
            {{ toCount(otherItem.count) }}
          </p>
        </div>
      </div>
    </div>
  </FigPanel>
</template>
