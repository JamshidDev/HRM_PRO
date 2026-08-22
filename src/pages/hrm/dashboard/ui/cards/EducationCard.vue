<script setup>
  /**
   * Figma v3 · Tab 1 "Xodimlarning ma'lumoti bo'yicha" (node 2959:58481).
   *
   * 34px balandlikdagi 100 % stacked bar (oltita ta'lim darajasi), ostida
   * uch ustunli legend — nom, son, ulush va o'zgarish. Eng pastda esa
   * agregat guruhlar qatori (oliy ma'lumotli / o'rta maxsus).
   *
   * Backend hozir faqat agregat guruhlarni beradi (`education.groups`),
   * darajalar kesimi (`levels`) mock'dan olinadi — shu sababli stacked bar
   * ustida "mock" chipi turadi.
   */
  import HeadMortarboard from '@/assets/icons/hrmDashboard/head-mortarboard.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import FigStackedBar from '../fig/FigStackedBar.vue'
  import FigTrend from '../fig/FigTrend.vue'
  import { useDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { toCount, toPercent, share, sumBy } from '../../format.js'

  defineEmits(['detail'])

  const store = useDashboardStore()
  const { t } = i18n.global

  // Maketdagi segment ranglari tartibi
  const TOKENS = [
    '--fig-icon-brand',
    '--fig-icon-purple',
    '--fig-icon-indigo',
    '--fig-icon-green',
    '--fig-icon-amber',
    '--fig-icon-red'
  ]

  const card = computed(() => store.overview.education || {})
  const isMock = computed(() => store.isMock('overview', 'education.levels'))

  /** Segment ulushlari uchun bazis — darajalar yig'indisi. */
  const total = computed(() => sumBy(card.value.levels, 'count'))

  /**
   * Agregat guruhlar ulushi butun xodimlar soniga nisbatan hisoblanadi:
   * guruhlar backenddan kelayotgan bo'lsa (darajalar esa hali mock), ularni
   * mock yig'indisiga bo'lish noto'g'ri foiz berardi.
   */
  const groupBase = computed(() => store.overview.kpi?.workers?.total?.value || total.value)

  const levels = computed(() =>
    (card.value.levels || []).map((item, idx) => ({
      ...item,
      label: item.label ?? t(`dashboardPage.eduLevel.${item.key}`),
      // Backend `percent` bermasa yig'indiga nisbatan hisoblanadi
      percent: item.percent ?? share(item.count, total.value),
      token: TOKENS[idx % TOKENS.length]
    }))
  )

  const groups = computed(() =>
    (card.value.groups || []).map((item) => ({
      ...item,
      label: item.label ?? t(`dashboardPage.eduGroup.${item.key}`),
      percent: item.percent ?? share(item.count, groupBase.value)
    }))
  )
</script>

<template>
  <FigPanel
    tint="indigo"
    :icon="HeadMortarboard"
    :title="$t('dashboardPage.edu.title')"
    :action-text="$t('content.detail')"
    :mock="isMock"
    inner-class="px-4 pt-1.5 pb-0.5 gap-4"
    @action="$emit('detail')"
  >
    <FigStackedBar :items="levels" />

    <div class="grid gap-x-3.5 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
      <div v-for="item in levels" :key="item.key" class="flex min-w-0 gap-2 pt-0.5">
        <span
          class="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-[3px]"
          :style="{ backgroundColor: `var(${item.token})` }"
        ></span>
        <div class="flex min-w-0 flex-1 flex-col gap-0.5">
          <p class="truncate text-[12px] leading-4 text-fig-text-secondary">{{ item.label }}</p>
          <div class="flex items-baseline gap-2">
            <p class="text-[12px] leading-4 font-semibold whitespace-nowrap text-fig-text-primary">
              {{ toCount(item.count) }}
            </p>
            <p class="text-[12px] leading-4 whitespace-nowrap text-fig-text-tertiary">
              {{ toPercent(item.percent) }}
            </p>
            <div class="min-w-0 flex-1">
              <FigTrend :metric="item" unit="count" :label-key="null" small />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- agregat guruhlar: maketda eng pastdagi bitta qator -->
    <div v-if="groups.length" class="mt-auto flex flex-wrap items-center gap-x-6 gap-y-1 pb-1">
      <div v-for="group in groups" :key="group.key" class="flex items-center gap-1.5">
        <p class="text-[12px] leading-4 whitespace-nowrap text-fig-text-tertiary">
          {{ group.label }} — {{ toCount(group.count) }} · {{ toPercent(group.percent) }}
        </p>
        <FigTrend :metric="group" unit="pp" :label-key="null" small />
      </div>
    </div>
  </FigPanel>
</template>
