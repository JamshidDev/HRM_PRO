<script setup>
  // «Kadrlar harakati» — korxonalar faolligi reytingi: top-10 + o'z korxonasi (top-10 da bo'lmasa pastda).
  import FigPanel from '../fig/FigPanel.vue'
  import { UISegmentTabs } from '@/components/index.js'
  import ApiService from '@/service/ApiService.js'
  import i18n from '@/i18n/index.js'
  import { NIcon } from 'naive-ui'
  import { Trophy20Filled } from '@vicons/fluent'
  import OrgRatingRow from './OrgRatingRow.vue'
  import OrgRatingDetailModal from './OrgRatingDetailModal.vue'
  import OrgRatingAllModal from './OrgRatingAllModal.vue'

  defineEmits(['detail'])
  // Sarlavha ikonkasi — kubok (reyting).
  const AwardIcon = () => h(NIcon, { size: 18, color: 'var(--fig-icon-brand, #3a7bfa)' }, () => h(Trophy20Filled))
  const { t } = i18n.global

  const period = ref('7')
  const loading = ref(false)
  const data = ref(null)

  const periodTabs = computed(() => [
    { id: '7', name: t('dashboardPage.orgRating.period7') },
    { id: '30', name: t('dashboardPage.orgRating.period30') }
  ])

  const load = () => {
    loading.value = true
    ApiService.dashboardService
      ._orgRating({ params: { period: period.value } })
      .then((res) => (data.value = res.data.data))
      .finally(() => (loading.value = false))
  }
  watch(period, load, { immediate: true })

  const mineId = computed(() => data.value?.mine?.organization?.id ?? null)

  const detailVisible = ref(false)
  const detailItem = ref(null)
  const detailPeriod = ref('7')
  const openDetail = (item, p = period.value) => {
    detailItem.value = item
    detailPeriod.value = p
    detailVisible.value = true
  }

  const allVisible = ref(false)
</script>

<template>
  <FigPanel
    tint="blue"
    :icon="AwardIcon"
    :title="$t('dashboardPage.orgRating.title')"
    inner-class="px-3 pt-2 pb-2 gap-2"
  >
    <template #header-extra>
      <UISegmentTabs v-model="period" :tabs="periodTabs" class="org-period-tabs" />
    </template>

    <n-spin :show="loading">
      <div class="flex flex-col gap-0.5 min-h-[120px]">
        <OrgRatingRow header />
        <OrgRatingRow
          v-for="item in data?.top || []"
          :key="item.organization.id"
          :item="item"
          :highlight="item.organization.id === mineId"
          @select="openDetail"
        />

        <template v-if="data?.mine && !data.mine_in_top">
          <div class="flex items-center gap-2 pt-1 text-[11px] text-fig-text-tertiary">
            <span class="h-px flex-1 bg-fig-bg-tertiary" />
            {{ $t('dashboardPage.orgRating.yourOrg') }}
            <span class="h-px flex-1 bg-fig-bg-tertiary" />
          </div>
          <OrgRatingRow :item="data.mine" highlight @select="openDetail" />
        </template>
      </div>
    </n-spin>

    <div class="flex justify-end">
      <button
        type="button"
        class="cursor-pointer text-[12px] leading-4 text-fig-text-brand transition-opacity hover:opacity-80"
        @click="allVisible = true"
      >
        {{ $t('dashboardPage.orgRating.viewAll') }} ↗
      </button>
    </div>
  </FigPanel>

  <OrgRatingDetailModal v-model:visible="detailVisible" :item="detailItem" :period="detailPeriod" />
  <OrgRatingAllModal v-model:visible="allVisible" :initial-period="period" @select="openDetail" />
</template>

<style scoped>
  /* Sarlavhadagi davr tanlovi — kichik o'lcham (umumiy komponentga tegilmaydi). */
  .org-period-tabs {
    height: 28px;
    padding: 2px;
    border-radius: 8px;
  }
  .org-period-tabs :deep(.seg-tabs__item) {
    padding: 3px 10px;
    font-size: 12px;
    line-height: 16px;
    border-radius: 6px;
  }
  .org-period-tabs :deep(.seg-tabs__indicator) {
    border-radius: 6px;
  }
</style>
