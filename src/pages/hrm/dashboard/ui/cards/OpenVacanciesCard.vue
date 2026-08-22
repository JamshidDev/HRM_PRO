<script setup>
  /**
   * Figma v3 · Tab 2 "Ochiq vakansiyalar — lavozimlar" (node 2966:69137).
   *
   * Yuqorida jami vakansiya soni va o'tgan yilga nisbatan o'zgarish, ostida
   * top lavozimlar ro'yxati; oxirgi qator — qolgan lavozimlar yig'indisi
   * ("Qolgan 12 lavozim").
   */
  import HeadMortarboard from '@/assets/icons/hrmDashboard/head-mortarboard.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import FigBarRow from '../fig/FigBarRow.vue'
  import FigTrend from '../fig/FigTrend.vue'
  import { useDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { toCount } from '../../format.js'

  defineEmits(['detail'])

  const store = useDashboardStore()
  const { t } = i18n.global

  const card = computed(() => store.movement.open_vacancies_by_position || {})
  const isMock = computed(() => store.isMock('movement', 'open_vacancies_by_position'))

  const rows = computed(() => {
    const items = (card.value.items || []).map((item) => ({ ...item, label: item.name }))
    const others = card.value.others
    if (others) {
      items.push({
        ...others,
        label: t('dashboardPage.vacancy.others', { count: others.positions_count })
      })
    }
    return items
  })

  const maxCount = computed(() => Math.max(...rows.value.map((item) => item.count ?? 0), 0))
</script>

<template>
  <FigPanel
    tint="indigo"
    :icon="HeadMortarboard"
    :title="$t('dashboardPage.vacancy.openTitle')"
    :action-text="$t('content.detail')"
    :mock="isMock"
    inner-class="px-4 pt-2 pb-1 gap-1"
    @action="$emit('detail')"
  >
    <div class="flex flex-col gap-1 pb-1">
      <p class="text-[20px] leading-6 font-semibold whitespace-nowrap text-fig-text-primary">
        {{ toCount(card.total?.value) }}
      </p>
      <FigTrend :metric="card.total" unit="count" />
    </div>

    <FigBarRow
      v-for="(row, idx) in rows"
      :key="idx"
      label-first
      :label="row.label"
      :segments="[{ value: row.count, token: '--fig-icon-brand' }]"
      :max-value="maxCount"
      :count="row.count"
      :percent="row.percent"
      :metric="row"
      :label-width="130"
    />
  </FigPanel>
</template>
