<script setup>
  import { UIModal, UIPageContent } from '@/components/index.js'
  import { useAccountStore, useTurnstileDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import {
    Filter,
    PreviewList,
    InfoGraph,
    WorkerAnalyticPanel,
    PlanCard,
    PrivilegeCard,
    DeviceCard,
    MonthlyCard,
    FaceCard
  } from './ui/index.js'

  const { t } = i18n.global
  const dashboardStore = useTurnstileDashboardStore()
  const accStore = useAccountStore()
  import { computed, onMounted, onBeforeUnmount } from 'vue'
  import SimpleCard from '@/pages/turnstile/dashboard/ui/SimpleCard.vue'
  import SimpleCardSketlon from '@/pages/turnstile/dashboard/ui/SimpleCardSketlon.vue'
  import AttendanceRateCard from '@/pages/turnstile/dashboard/ui/AttendanceRateCard.vue'

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
    // Store sahifalar orasida saqlanadi: «bugunni kuzatish» yoqiq bo'lsa, kecha ochilgan sahifaga bugun
    // qaytilganda ham sana bugunga suriladi (eski kun ko'rinib qolmasin).
    if (!dashboardStore.dashboardParams.date || dashboardStore.followToday) {
      dashboardStore.dashboardParams.date = new Date().getTime()
    }
    dashboardStore._dashboard()
    dayTimer = setInterval(rollToToday, 60 * 1000)
  })

  // Yarim tun: «bugunni kuzatish» yoqiq va sana kechagi bo'lib qolgan bo'lsa — bugunga o'tib, qayta yuklanadi
  // (devor ekranida kecha-kunduz ochiq turgan holat).
  let dayTimer = null
  const rollToToday = () => {
    if (!dashboardStore.followToday) return
    const picked = new Date(dashboardStore.dashboardParams.date || Date.now())
    if (picked.toDateString() === new Date().toDateString()) return
    dashboardStore.dashboardParams.date = new Date().getTime()
    if (accStore.canView(accStore.pn.turnstileDashboard)) dashboardStore._dashboard()
  }
  onBeforeUnmount(() => clearInterval(dayTimer))
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
      <Filter class="min-w-0" />

      <!-- Maketdagi tartib: o'ng ustunlar qat'iy 280px, chapdagilar cho'ziladi -->
      <div class="flex flex-col gap-4 mt-4">
        <!-- KPI: 976px dan 4 ta bir qatorda, undan kichikda 2 tadan (3+1 bo'lib qolmasin) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SimpleCardSketlon
            v-if="dashboardStore.mainChartLoading"
            :count="2"
            class="min-w-0"
          />
          <template v-else v-for="(item, idx) in dashboardStore.mainCards" :key="idx">
            <SimpleCard
              class="min-w-0"
              :title="item.title"
              :count="item.count"
              :icon="item.icon"
              :tint="item.tint"
              :list="item.list"
              :list-more="item.listMore"
              :rows="item.rows"
              :hint="item.hint"
              @row-preview="onPreview"
              @click="onPreview(item.previewType)"
            />
          </template>
          <SimpleCardSketlon
            v-if="dashboardStore.workerStatsLoading"
            :count="2"
            class="min-w-0"
          />
          <template v-else v-for="(item, idx) in dashboardStore.currentWorkers" :key="idx">
            <SimpleCard
              class="min-w-0"
              :title="item.title"
              :count="item.count"
              :icon="item.icon"
              :tint="item.tint"
              :list="item.list"
              :list-more="item.listMore"
              :rows="item.rows"
              :hint="item.hint"
              @row-preview="onPreview"
              @click="onPreview(item.previewType)"
            />
          </template>
        </div>

        <!-- 1-qator: kun davomida o'tishlar + bugungi davomat darajasi.
             Ustunlar 976px (`lg`) dan — loyihada `xl` = 1440px, undan kichik ekranda
             kartalar ostida bo'sh joy qolardi. 2 ustunli ekranda 3-karta to'liq enda. -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <WorkerAnalyticPanel class="lg:col-span-2" />
          <AttendanceRateCard @onPreview="onPreview" />
        </div>

        <!-- 2-qator: uchta pie (bir xil `DonutCard` qolipi) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <PlanCard @onPreview="onPreview" />
          <InfoGraph @onPreview="onPreview" />
          <DeviceCard class="md:col-span-2 lg:col-span-1" @onPreview="onPreview" />
        </div>

        <!-- 3-qator: grafik qamrovi, imtiyozli xodimlar ro'yxati, Face ID -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MonthlyCard @onPreview="onPreview" />
          <PrivilegeCard @onPreview="onPreview" />
          <FaceCard class="md:col-span-2 lg:col-span-1" @onPreview="onPreview" />
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
  // Dashboard palitrasidagi «neytral» rang (ui/palette.js `soft`): yorug'da och ko'k,
  // qorong'ida kulrang — `--fig-blue-300` qorong'ida shaffof bo'lib xira ko'rinardi.
  :root {
    --ts-soft: var(--fig-blue-300);
  }

  [data-theme='dark'] {
    --ts-soft: var(--fig-text-disable);
  }

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
