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

      <!-- Maketdagi tartib: o'ng ustunlar qat'iy 280px, chapdagilar cho'ziladi -->
      <div class="flex flex-col gap-4 mt-4">
        <div class="flex flex-wrap items-stretch gap-4">
          <SimpleCardSketlon
            v-if="dashboardStore.mainChartLoading"
            :count="2"
            class="flex-1 min-w-[240px]"
          />
          <template v-else v-for="(item, idx) in dashboardStore.mainCards" :key="idx">
            <SimpleCard
              class="flex-1 min-w-[240px]"
              :title="item.title"
              :count="item.count"
              :icon="item.icon"
              :tint="item.tint"
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
            class="flex-1 min-w-[240px]"
          />
          <template v-else v-for="(item, idx) in dashboardStore.currentWorkers" :key="idx">
            <SimpleCard
              class="flex-1 min-w-[240px]"
              :title="item.title"
              :count="item.count"
              :icon="item.icon"
              :tint="item.tint"
              :list="item.list"
              :list-more="item.listMore"
              :delta="dashboardStore.deltas[item.deltaKey]"
              :invert="item.invert"
              :decor="item.decor"
              :delta-loading="dashboardStore.compareLoading"
              @click="onPreview(item.previewType)"
            />
          </template>
        </div>

        <WorkerAnalyticPanel @onPreview="onPreview" />

        <div class="flex flex-wrap items-stretch gap-4">
          <WorkTimeCard @onPreview="onPreview" class="flex-1 min-w-[320px]" />
          <MonthlyCard @onPreview="onPreview" class="w-full xl:w-[280px] xl:shrink-0" />
        </div>

        <div class="flex flex-wrap items-stretch gap-4">
          <InfoGraph @onPreview="onPreview" class="flex-1 min-w-[320px]" />
          <DeviceCard
            @onPreview="onPreview"
            class="flex-1 xl:flex-none xl:w-[280px] min-w-[260px]"
          />
          <FaceCard @onPreview="onPreview" class="flex-1 xl:flex-none xl:w-[280px] min-w-[260px]" />
        </div>
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
