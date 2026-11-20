<script setup>
  import { UIModal, UIPageContent, UISegmentTabs } from '@/components/index.js'
  import { useAccountStore, useTurnstileDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import {
    Filter,
    PreviewList,
    WorkTimeCard,
    InfoGraph,
    WorkerAnalyticPanel,
    PlanCard,
    PrivilegeCard,
    DeviceCard,
    MonthlyCard,
    FaceCard,
    AttendanceMonth
  } from './ui/index.js'

  const { t } = i18n.global
  const dashboardStore = useTurnstileDashboardStore()
  const accStore = useAccountStore()
  import { computed, onMounted } from 'vue'
  import SimpleCard from '@/pages/turnstile/dashboard/ui/SimpleCard.vue'
  import SimpleCardSketlon from '@/pages/turnstile/dashboard/ui/SimpleCardSketlon.vue'

  const typeTitle = computed(() => {
    const type = dashboardStore.previewParams.type
    return dashboardStore.cardTypes[type].name
  })

  const tabs = computed(() => [
    { id: 'report', name: t('turnStileDashboard.tabs.report') },
    { id: 'attendance', name: t('turnStileDashboard.tabs.attendance') }
  ])

  // Tab almashganda shu tab ma'lumoti yuklanadi (filtr ikkala tab uchun umumiy).
  const onChangeTab = (v) => {
    dashboardStore.activeTab = v
    if (!accStore.canView(accStore.pn.turnstileDashboard)) return
    dashboardStore._dashboard()
  }

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
  <UIPageContent class="!h-auto !min-h-full pb-4 md:pb-6">
    <!-- `.main-content .ui-page-content` ga global `height: 100%` berilgan.
         Kartalar ro'yxati o'sha qat'iy balandlikdan oshib ketgani uchun
         konteynerning `padding-bottom` i skroll uzunligiga qo'shilmasdi va
         eng pastki karta ekran chetiga yopishib qolardi. `h-auto` +
         `min-h-full`: sahifa kontenti bo'yicha o'sadi, skrollni `.main-content`
         boshqaradi, pastdagi padding esa o'z joyida ko'rinadi. -->
    <div>
      <!-- Chapda tablar, o'ngda umumiy filtr (bir qatorda). -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <UISegmentTabs
          :model-value="dashboardStore.activeTab"
          :tabs="tabs"
          variant="elevated"
          @update:model-value="onChangeTab"
        />
        <Filter class="flex-1 min-w-0" />
      </div>

      <AttendanceMonth v-if="dashboardStore.activeTab === 'attendance'" class="mt-4" />

      <!-- Maketdagi tartib: o'ng ustunlar qat'iy 280px, chapdagilar cho'ziladi -->
      <div v-if="dashboardStore.activeTab === 'report'" class="flex flex-col gap-4 mt-4">
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
              :decor="item.decor"
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
              :decor="item.decor"
              @click="onPreview(item.previewType)"
            />
          </template>
        </div>

        <WorkerAnalyticPanel @onPreview="onPreview" />

        <WorkTimeCard @onPreview="onPreview" />

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <MonthlyCard @onPreview="onPreview" />
          <DeviceCard @onPreview="onPreview" />
          <FaceCard @onPreview="onPreview" />
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <PlanCard @onPreview="onPreview" />
          <PrivilegeCard @onPreview="onPreview" />
          <InfoGraph @onPreview="onPreview" />
        </div>

        <!-- Pastdagi bo'shliq kontent oqimining o'zida: skroll konteynerining
             `padding-bottom` i overflow bo'lganda skroll uzunligiga qo'shilmay
             qolishi mumkin, haqiqiy element esa hamisha hisobga olinadi.
             Yuqoridagi `gap-4` ustiga qo'shilib, oxirgi qator bilan ekran
             chegarasi orasida ko'rinadigan havo qoldiradi. -->
        <div class="h-4 md:h-8 shrink-0" aria-hidden="true"></div>
      </div>
    </div>

    <UIModal v-model:visible="dashboardStore.previewVisible" :width="1400">
      <template #header-title>
        <h1 class="text-lg font-medium text-fig-text-primary flex items-center gap-4">
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
