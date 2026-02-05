<script setup>
  import { UIModal, UIPageContent } from '@/components/index.js'
  import { useAccountStore, useTurnstileDashboardStore } from '@/store/modules/index.js'
  import {
    Filter,
    PreviewList,
    WorkTimeCard,
    InfoGraph,
    RowChart,
    DeviceCard,
    MonthlyCard,
    FaceCard
  } from './ui/index.js'

  const dashboardStore = useTurnstileDashboardStore()
  const accStore = useAccountStore()
  import { computed, onMounted } from 'vue'
  import SimpleCard from '@/pages/turnstile/dashboard/ui/SimpleCard.vue'
  import SimpleCardSketlon from '@/pages/turnstile/dashboard/ui/SimpleCardSketlon.vue'
  import DailyEventChart from '@/pages/turnstile/dashboard/ui/DailyEventChart.vue'

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
    if (!accStore.checkAction(accStore.pn.turnstileDashboard)) return
    if (!dashboardStore.dashboardParams.date) {
      dashboardStore.dashboardParams.date = new Date().getTime()
    }
    dashboardStore._dashboard()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <div class="grid grid-cols-12 gap-4 mt-4">
      <SimpleCardSketlon v-if="dashboardStore.mainChartLoading" :count="2" class="col-span-3" />
      <template v-else v-for="(item, idx) in dashboardStore.mainCards" :key="idx">
        <SimpleCard
          class="col-span-3"
          :type="item.type"
          :title="item.title"
          :badge-text="item.badgeText"
          :count="item.count"
          :icon="item.icon"
          :list="item.list"
          :list-more="item.listMore"
          @click="onPreview(item.previewType)"
        />
      </template>
      <SimpleCardSketlon v-if="dashboardStore.workerStatsLoading" :count="2" class="col-span-3" />
      <template v-else v-for="(item, idx) in dashboardStore.currentWorkers" :key="idx">
        <SimpleCard
          class="col-span-3"
          :type="item.type"
          :title="item.title"
          :badge-text="item.badgeText"
          :count="item.count"
          :icon="item.icon"
          :list="item.list"
          :list-more="item.listMore"
          @click="onPreview(item.previewType)"
        />
      </template>

      <div
        class="xl:col-span-8 lg:col-span-12 col-span-12 p-2 grid grid-cols-12 border border-surface-line rounded-xl bg-surface-section"
      >
        <div class="xl:col-span-6 lg:col-span-5 col-span-12">
          <RowChart @onPreview="onPreview" />
        </div>
        <div class="xl:col-span-6 lg:col-span-7 col-span-12 overflow-hidden">
          <DailyEventChart />
        </div>
      </div>

      <InfoGraph
        @onPreview="onPreview"
        class="xl:col-span-4 lg:col-span-6 md:col-span-6 col-span-12"
      />

      <DeviceCard
        @onPreview="onPreview"
        class="xl:col-span-4 lg:col-span-6 md:col-span-6 col-span-12"
      />

      <WorkTimeCard @onPreview="onPreview" class="xl:col-span-8 col-span-12" />
      <MonthlyCard @onPreview="onPreview" class="col-span-6" />
      <div class="col-span-6 p-2 border border-surface-line rounded-xl bg-surface-section relative">
        <FaceCard @onPreview="onPreview" />
      </div>
    </div>

    <UIModal v-model:visible="dashboardStore.previewVisible" :width="1400">
      <template #header-title>
        <h1 class="text-lg font-medium flex items-center gap-4">
          {{ $t('hcEvent.preview') }}
          <span class="bg-primary/10 text-primary py-1 px-2 rounded-2xl text-sm"
            >#{{ $t(typeTitle) }}</span
          >
        </h1>
      </template>
      <PreviewList />
    </UIModal>
  </UIPageContent>
</template>
