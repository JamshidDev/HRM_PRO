<script setup>
  // «Barchasini ko'rish» — barcha korxonalar reytingi: 7 kun / 30 kun / butun davr.
  import { UIModal, UISegmentTabs } from '@/components/index.js'
  import ApiService from '@/service/ApiService.js'
  import i18n from '@/i18n/index.js'
  import Utils from '@/utils/Utils.js'
  import OrgRatingRow from './OrgRatingRow.vue'
  import { Search16Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const visible = defineModel('visible', { type: Boolean, default: false })
  const props = defineProps({ initialPeriod: { type: String, default: '7' } })
  const emit = defineEmits(['select'])

  const period = ref(props.initialPeriod)
  const loading = ref(false)
  const data = ref(null)
  const search = ref('')
  const status = ref('all')

  const periodTabs = computed(() => [
    { id: '7', name: t('dashboardPage.orgRating.period7') },
    { id: '30', name: t('dashboardPage.orgRating.period30') },
    { id: 'all', name: t('dashboardPage.orgRating.periodAll') }
  ])

  const allItems = computed(() => data.value?.items || [])
  const activeCount = computed(() => allItems.value.filter((i) => i.active).length)
  const inactiveCount = computed(() => allItems.value.length - activeCount.value)

  // Holat filtri — sonlari bilan (ilgari izohsiz checkbox edi).
  const statusTabs = computed(() => [
    { id: 'all', name: `${t('dashboardPage.orgRating.filter.all')} · ${allItems.value.length}` },
    { id: 'active', name: `${t('dashboardPage.orgRating.filter.active')} · ${activeCount.value}` },
    { id: 'inactive', name: `${t('dashboardPage.orgRating.filter.inactive')} · ${inactiveCount.value}` }
  ])

  const avgScore = computed(() => {
    const list = allItems.value
    if (!list.length) return 0
    return Math.round((list.reduce((s, i) => s + Number(i.score || 0), 0) / list.length) * 10) / 10
  })

  const summary = computed(() => [
    { key: 'total', value: allItems.value.length, cls: 'text-fig-text-primary' },
    { key: 'active', value: activeCount.value, cls: 'text-fig-text-green' },
    { key: 'inactive', value: inactiveCount.value, cls: 'text-fig-text-red' },
    { key: 'avg', value: avgScore.value, cls: 'text-fig-text-brand' }
  ])

  // Davr oralig'i — «Butun davr» da ko'rsatilmaydi.
  const range = computed(() =>
    data.value?.from && data.value?.to && period.value !== 'all'
      ? `${Utils.timeOnlyDate(data.value.from)} — ${Utils.timeOnlyDate(data.value.to)}`
      : ''
  )

  const load = () => {
    loading.value = true
    ApiService.dashboardService
      ._orgRating({ params: { period: period.value, all: 1 } })
      .then((res) => (data.value = res.data.data))
      .finally(() => (loading.value = false))
  }

  const items = computed(() => {
    const q = search.value.trim().toLowerCase()
    return allItems.value.filter(
      (i) =>
        (status.value === 'all' || (status.value === 'active' ? i.active : !i.active)) &&
        (!q || (i.organization.name || '').toLowerCase().includes(q))
    )
  })
  const mine = computed(() => data.value?.mine ?? null)
  const mineId = computed(() => mine.value?.organization?.id ?? null)

  const onSelect = (item) =>
    emit('select', item, period.value, {
      total: allItems.value.length,
      from: data.value?.from,
      to: data.value?.to
    })

  // Ochilganda (yoki ochiq holda mount bo'lganda) yuklanadi.
  watch(
    visible,
    (v) => {
      if (v) {
        period.value = props.initialPeriod
        search.value = ''
        status.value = 'all'
        load()
      }
    },
    { immediate: true }
  )
  watch(period, () => visible.value && load())
</script>

<template>
  <UIModal v-model:visible="visible" :width="880" :title="$t('dashboardPage.orgRating.allTitle')">
    <div class="flex flex-col gap-3">
      <!-- Umumiy ko'rsatkichlar + davr. -->
      <div class="flex flex-wrap items-center gap-2">
        <div
          v-for="s in summary"
          :key="s.key"
          class="flex min-w-[112px] flex-col rounded-lg bg-fig-bg-secondary px-3 py-1.5"
        >
          <span class="text-[11px] text-fig-text-tertiary">{{ $t(`dashboardPage.orgRating.summary.${s.key}`) }}</span>
          <n-skeleton v-if="loading" height="20px" width="40px" round class="my-0.5" />
          <span v-else class="text-[16px] leading-6 font-semibold tabular-nums" :class="s.cls">{{ s.value }}</span>
        </div>
        <div class="ml-auto flex flex-col items-end gap-1">
          <UISegmentTabs v-model="period" :tabs="periodTabs" class="org-period-tabs" />
          <span v-if="range" class="text-[11px] tabular-nums text-fig-text-tertiary">{{ range }}</span>
        </div>
      </div>

      <!-- Qidiruv va holat filtri. -->
      <div class="flex flex-wrap items-center gap-3">
        <n-input v-model:value="search" clearable size="small" style="width: 260px" :placeholder="$t('content.search')">
          <template #prefix>
            <n-icon :component="Search16Regular" />
          </template>
        </n-input>
        <UISegmentTabs v-model="status" :tabs="statusTabs" class="org-period-tabs ml-auto" />
      </div>

      <div class="rounded-xl border border-fig-bg-tertiary p-1.5">
        <OrgRatingRow header class="pt-1" />
        <!-- Qat'iy balandlik — qidiruv/filtrda modal sakramaydi, ro'yxat ichida skroll. -->
        <div class="flex flex-col gap-0.5 h-[52vh] overflow-y-auto pr-1">
          <template v-if="loading">
            <OrgRatingRow v-for="i in 12" :key="`sk-${i}`" skeleton />
          </template>
          <template v-else>
            <OrgRatingRow
              v-for="item in items"
              :key="item.organization.id"
              :item="item"
              show-small
              :highlight="item.organization.id === mineId"
              @select="onSelect"
            />
            <n-empty v-if="!items.length" class="py-10" />
          </template>
        </div>
      </div>

      <!-- O'z korxonasi doim pastda — uzun ro'yxatda qidirmasdan ko'rinadi. -->
      <div v-if="mine && !loading" class="flex flex-col gap-1">
        <span class="px-2.5 text-[11px] text-fig-text-tertiary">{{ $t('dashboardPage.orgRating.yourOrg') }}</span>
        <OrgRatingRow :item="mine" show-small highlight @select="onSelect" />
      </div>
    </div>
  </UIModal>
</template>

<style scoped>
  /* Davr/holat tanlovi — kartadagi bilan bir xil kichik o'lcham. */
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
