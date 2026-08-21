<script setup>
  /**
   * Figma v3 · Tab 2 "Kohorta — qabul yiliga ko'ra saqlanib qolish"
   * (node 2959:59384).
   *
   * Matritsa: qatorlar — ishga qabul yili va o'sha yil qabul qilinganlar soni,
   * ustunlar — 6/12/18/24/30 oydan keyin ishda qolganlar ulushi. Hali kelmagan
   * davr `null` bo'ladi va maketdagi kabi kulrang `—` bilan chiziladi.
   *
   * Katakcha foni ulush darajasiga qarab tonlanadi (yashil → amber → qizil).
   */
  import HeadMortarboard from '@/assets/icons/hrmDashboard/head-mortarboard.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import { useDashboardStore } from '@/store/modules/index.js'
  import { toCount, toRoundPercent } from '../../format.js'

  defineEmits(['detail'])

  const store = useDashboardStore()

  const card = computed(() => store.movement.retention_cohorts || {})
  const isMock = computed(() => store.isMock('movement', 'retention_cohorts'))

  const months = computed(() => card.value.months || [])

  /** Maketdagi issiqlik shkalasi: yuqori ulush — yashil, past — qizil. */
  const cellClass = (value) => {
    if (value === null || value === undefined) return 'bg-fig-bg-disable text-fig-text-disable'
    if (value >= 80) return 'bg-fig-green-100 text-fig-text-green'
    if (value >= 70) return 'bg-fig-green-100 text-fig-text-primary'
    if (value >= 65) return 'bg-fig-yellow-100 text-fig-text-primary'
    return 'bg-fig-red-100 text-fig-text-red'
  }

  const rows = computed(() =>
    (card.value.rows || []).map((row) => ({
      ...row,
      cells: months.value.map((_, idx) => row.values?.[idx] ?? null)
    }))
  )
</script>

<template>
  <FigPanel
    tint="indigo"
    :icon="HeadMortarboard"
    :title="$t('dashboardPage.retention.title')"
    :action-text="$t('content.detail')"
    :mock="isMock"
    inner-class="px-2 pt-1 pb-2"
    @action="$emit('detail')"
  >
    <!-- Tor ekranda matritsa o'z ichida gorizontal skroll qiladi -->
    <div class="w-full overflow-x-auto">
      <div class="min-w-[560px]">
        <div class="flex items-center gap-2 px-2 py-2">
          <p class="w-[150px] shrink-0 text-[12px] leading-4 text-fig-text-tertiary">
            {{ $t('dashboardPage.retention.cohort') }}
          </p>
          <p
            v-for="month in months"
            :key="month"
            class="min-w-px flex-1 text-center text-[12px] leading-4 text-fig-text-tertiary"
          >
            {{ $t('dashboardPage.retention.month', { count: month }) }}
          </p>
        </div>

        <div v-for="row in rows" :key="row.year" class="flex items-center gap-2 px-2 py-1">
          <p class="w-[150px] shrink-0 truncate text-[12px] leading-4 text-fig-text-secondary">
            {{ row.year }} · {{ $t('dashboardPage.retention.people', { count: toCount(row.hired_count) }) }}
          </p>
          <p
            v-for="(cell, idx) in row.cells"
            :key="idx"
            class="min-w-px flex-1 rounded-lg py-2 text-center text-[12px] leading-4 font-semibold"
            :class="cellClass(cell)"
          >
            {{ cell === null ? '—' : toRoundPercent(cell) }}
          </p>
        </div>
      </div>
    </div>
  </FigPanel>
</template>
