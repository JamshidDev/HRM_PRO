<script setup>
  import { UIModal, UIPageContent } from '@/components/index.js'
  import { useAccountStore, useTurnstileDashboardStore } from '@/store/modules/index.js'
  import {
    Filter,
    PreviewList,
    WorkTimeCard,
    InfoGraph,
    WorkerAnalyticPanel,
    DeviceCard,
    MonthlyCard,
    FaceCard
  } from './ui/index.js'

  const dashboardStore = useTurnstileDashboardStore()
  const accStore = useAccountStore()
  import { computed, onMounted } from 'vue'
  import SimpleCard from '@/pages/turnstile/dashboard/ui/SimpleCard.vue'
  import SimpleCardSketlon from '@/pages/turnstile/dashboard/ui/SimpleCardSketlon.vue'

  const typeTitle = computed(() => {
    const type = dashboardStore.previewParams.type
    return dashboardStore.cardTypes[type].name
  })

  const onPreview = (v) => {
    dashboardStore.yesterday = false
    dashboardStore.previewParams.type = v
    dashboardStore.previewList = []
    dashboardStore.previewParams.date = dashboardStore.dashboardParams.date
    dashboardStore.previewVisible = true
  }

  onMounted(() => {
    // `canView` — bare `turnstile-dashboard` YOKI `-read`. Ilgari bu yerda bare,
    // ui/Filter.vue da esa `-read` tekshirilardi: faqat `-read` olgan rol sahifani
    // ochar, lekin kartalar yuklanmasdi.
    if (!accStore.canView(accStore.pn.turnstileDashboard)) return
    if (!dashboardStore.dashboardParams.date) {
      dashboardStore.dashboardParams.date = new Date().getTime()
    }
    dashboardStore._dashboard()
  })
</script>

<template>
  <UIPageContent>
    <div>
      <Filter />
      <div class="grid grid-cols-12 gap-4 mt-4">
        <SimpleCardSketlon
          v-if="dashboardStore.mainChartLoading"
          :count="2"
          class="xl:col-span-3 md:col-span-6 col-span-12"
        />
        <template v-else v-for="(item, idx) in dashboardStore.mainCards" :key="idx">
          <SimpleCard
            class="xl:col-span-3 md:col-span-6 col-span-12"
            :type="item.type"
            :title="item.title"
            :badge-text="item.badgeText"
            :count="item.count"
            :icon="item.icon"
            :chip-color="item.chipColor"
            :list="item.list"
            :list-more="item.listMore"
            :delta="dashboardStore.deltas[item.deltaKey]"
            :invert="item.invert"
            :decor="item.decor"
            :delta-loading="dashboardStore.compareLoading"
            @click="onPreview(item.previewType)"
          />
        </template>
        <SimpleCardSketlon
          v-if="dashboardStore.workerStatsLoading"
          :count="2"
          class="xl:col-span-3 md:col-span-6 col-span-12"
        />
        <template v-else v-for="(item, idx) in dashboardStore.currentWorkers" :key="idx">
          <SimpleCard
            class="xl:col-span-3 md:col-span-6 col-span-12"
            :type="item.type"
            :title="item.title"
            :badge-text="item.badgeText"
            :count="item.count"
            :icon="item.icon"
            :chip-color="item.chipColor"
            :list="item.list"
            :list-more="item.listMore"
            :delta="dashboardStore.deltas[item.deltaKey]"
            :invert="item.invert"
            :decor="item.decor"
            :delta-loading="dashboardStore.compareLoading"
            @click="onPreview(item.previewType)"
          />
        </template>

        <WorkerAnalyticPanel @onPreview="onPreview" class="col-span-12" />

        <WorkTimeCard @onPreview="onPreview" class="xl:col-span-8 col-span-12" />
        <MonthlyCard @onPreview="onPreview" class="xl:col-span-4 col-span-12" />

        <InfoGraph @onPreview="onPreview" class="xl:col-span-6 col-span-12" />
        <DeviceCard @onPreview="onPreview" class="xl:col-span-3 md:col-span-6 col-span-12" />
        <FaceCard @onPreview="onPreview" class="xl:col-span-3 md:col-span-6 col-span-12" />
      </div>
    </div>

    <UIModal v-model:visible="dashboardStore.previewVisible" :width="1400">
      <template #header-title>
        <h1 class="text-lg font-medium flex items-center gap-4">
          {{ $t('hcEvent.preview') }}
          <span class="bg-primary/10 text-primary py-1 px-2 rounded-2xl text-sm">
            #{{ $t(typeTitle) }}
          </span>
        </h1>
      </template>
      <PreviewList />
    </UIModal>
  </UIPageContent>
</template>

<style lang="scss">
  // `hover-effect-card` global uslubi hozircha faqat HRM dashboard sahifasida
  // e'lon qilingan — bu sahifa mustaqil ochilganda ham ishlashi uchun takrorlanadi.
  .hover-effect-card {
    cursor: pointer;
    transform: scale(1);
    transition: 0.2s ease;

    &:hover {
      transform: scale(1.01);
      z-index: 10;
      box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    }
  }
</style>
