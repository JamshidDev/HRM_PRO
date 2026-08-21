<script setup>
  /**
   * Figma v3 · Tab 1 "Yosh va jins bo'yicha tuzilma" (node 2959:58420).
   *
   * Beshta yosh guruhi; har bir qatorda ikki rangli bar (erkak — ko'k,
   * ayol — pushti), so'ng nom, son, ulush va o'tgan yilga nisbatan o'zgarish.
   * Pastda umumiy jins taqsimoti va uning protsent punktdagi siljishi.
   */
  import HeadMortarboard from '@/assets/icons/hrmDashboard/head-mortarboard.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import FigBarRow from '../fig/FigBarRow.vue'
  import FigTrend from '../fig/FigTrend.vue'
  import { useDashboardStore } from '@/store/modules/index.js'
  import { toCount, toRoundPercent } from '../../format.js'

  defineEmits(['detail'])

  const store = useDashboardStore()

  const card = computed(() => store.overview.age_gender || {})
  const isMock = computed(() => store.isMock('overview', 'age_gender'))

  const buckets = computed(() => card.value.buckets || [])

  /** Bar eni eng katta guruhga nisbatan hisoblanadi. */
  const maxCount = computed(() => Math.max(...buckets.value.map((item) => item.count ?? 0), 0))

  const genders = computed(() => {
    const total = card.value.gender_total
    if (!total) return []
    return [
      {
        key: 'man',
        token: '--fig-icon-brand',
        labelKey: 'enum.man',
        count: total.male?.count,
        percent: total.male?.percent
      },
      {
        key: 'woman',
        token: '--fig-icon-pink',
        labelKey: 'enum.woman',
        count: total.female?.count,
        percent: total.female?.percent
      }
    ]
  })
</script>

<template>
  <FigPanel
    tint="indigo"
    :icon="HeadMortarboard"
    :title="$t('dashboardPage.age.structureTitle')"
    :action-text="$t('content.detail')"
    :mock="isMock"
    inner-class="px-4 py-1"
    @action="$emit('detail')"
  >
    <FigBarRow
      v-for="bucket in buckets"
      :key="bucket.key"
      :label="bucket.label"
      :segments="[
        { value: bucket.male, token: '--fig-icon-brand' },
        { value: bucket.female, token: '--fig-icon-pink' }
      ]"
      :max-value="maxCount"
      :count="bucket.count"
      :percent="bucket.percent"
      :metric="bucket"
      :label-width="70"
    />

    <div class="mt-auto flex flex-wrap items-center gap-4 pt-1.5">
      <div v-for="item in genders" :key="item.key" class="flex items-center gap-1.5">
        <span
          class="h-[9px] w-[9px] shrink-0 rounded-[2px]"
          :style="{ backgroundColor: `var(${item.token})` }"
        ></span>
        <p class="text-[12px] leading-4 whitespace-nowrap text-fig-text-secondary">
          {{ $t(item.labelKey) }} · {{ toCount(item.count) }} · {{ toRoundPercent(item.percent) }}
        </p>
      </div>
      <FigTrend
        v-if="card.gender_total"
        :metric="card.gender_total"
        unit="pp"
        :label-key="null"
      />
    </div>
  </FigPanel>
</template>
