<script setup>
  // «Barchasini ko'rish» — barcha korxonalar reytingi: 7 kun / 30 kun / butun davr.
  import { UIModal, UISegmentTabs } from '@/components/index.js'
  import ApiService from '@/service/ApiService.js'
  import i18n from '@/i18n/index.js'
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
  const onlyInactive = ref(false)

  const periodTabs = computed(() => [
    { id: '7', name: t('dashboardPage.orgRating.period7') },
    { id: '30', name: t('dashboardPage.orgRating.period30') },
    { id: 'all', name: t('dashboardPage.orgRating.periodAll') }
  ])

  const load = () => {
    loading.value = true
    ApiService.dashboardService
      ._orgRating({ params: { period: period.value, all: 1 } })
      .then((res) => (data.value = res.data.data))
      .finally(() => (loading.value = false))
  }

  const items = computed(() => {
    const q = search.value.trim().toLowerCase()
    return (data.value?.items || []).filter(
      (i) =>
        (!onlyInactive.value || !i.active) &&
        (!q || (i.organization.name || '').toLowerCase().includes(q))
    )
  })
  const mineId = computed(() => data.value?.mine?.organization?.id ?? null)

  // Ochilganda (yoki ochiq holda mount bo'lganda) yuklanadi.
  watch(
    visible,
    (v) => {
      if (v) {
        period.value = props.initialPeriod
        load()
      }
    },
    { immediate: true }
  )
  watch(period, () => visible.value && load())
</script>

<template>
  <UIModal v-model:visible="visible" :width="860" :title="$t('dashboardPage.orgRating.allTitle')">
    <div class="flex flex-col gap-3">
      <!-- Bitta qator: chapda qidiruv + filtr, o'ngda sana va davr. -->
      <div class="flex flex-wrap items-center gap-3">
        <n-input
          v-model:value="search"
          clearable
          size="small"
          style="width: 220px"
          :placeholder="$t('content.search')"
        >
          <template #prefix>
            <n-icon :component="Search16Regular" />
          </template>
        </n-input>
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-checkbox v-model:checked="onlyInactive" size="small" />
          </template>
          {{ $t('dashboardPage.orgRating.onlyInactive') }}
        </n-tooltip>
        <div class="ml-auto flex shrink-0 items-center gap-3 whitespace-nowrap">
          <UISegmentTabs v-model="period" :tabs="periodTabs" class="org-period-tabs" />
        </div>
      </div>

      <n-spin :show="loading">
        <OrgRatingRow header />
        <!-- Qat'iy balandlik — qidiruv/filtrda modal sakramaydi, ro'yxat ichida skroll. -->
        <div class="flex flex-col gap-0.5 h-[60vh] overflow-y-auto pr-1">
          <OrgRatingRow
            v-for="item in items"
            :key="item.organization.id"
            :item="item"
            show-small
            :highlight="item.organization.id === mineId"
            @select="emit('select', $event, period)"
          />
          <n-empty v-if="!loading && !items.length" class="py-8" />
        </div>
      </n-spin>
    </div>
  </UIModal>
</template>

<style scoped>
  /* Davr tanlovi — kartadagi bilan bir xil kichik o'lcham. */
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
