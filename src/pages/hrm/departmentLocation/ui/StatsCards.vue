<script setup>
  /**
   * Mobile face kartalari: korxonalar, hududlar, erkin rejim, joy belgilanmaganlar.
   *
   * Ko'rinishi HRM dashboard KPI kartasi bilan bir xil (`dashboard/ui/fig/FigKpiCard.vue`):
   * rangli chip + ikonka, 20px qiymat (0 dan sanab chiqadi) va pastda kulrang izoh paneli.
   * Kartalar faqat ma'lumot — bosilmaydi; ro'yxatni filtrlash «Filterlar» panelidagi «Joy holati» orqali.
   * Qiymatlar `GET /v1/extra/mobile-face/stats` dan.
   */
  import { UICountUp } from '@/components/index.js'
  import { useDepartmentLocationStore } from '@/store/modules/index.js'
  import {
    Building24Regular,
    Map20Filled,
    Location20Filled,
    PersonQuestionMark20Regular
  } from '@vicons/fluent'

  const store = useDepartmentLocationStore()

  const isWorkers = computed(() => store.activeTab === 'workers')

  const cards = computed(() => [
    { key: 'organizations', icon: Building24Regular, tint: 'bg-fig-blue-100 text-fig-brand' },
    { key: 'areas', icon: Map20Filled, tint: 'bg-fig-indigo-100 text-fig-indigo' },
    { key: 'free', icon: Location20Filled, tint: 'bg-fig-green-100 text-fig-green' },
    {
      key: 'unassigned',
      titleKey: isWorkers.value ? 'unassignedWorkers' : 'unassignedDepartments',
      icon: PersonQuestionMark20Regular,
      tint: 'bg-fig-amber-100 text-fig-amber'
    }
  ])

  // UICountUp formatlangan matn kutadi (`3 763`).
  const valueOf = (key) => (store.stats?.[key] ?? 0).toLocaleString('ru-RU').replace(/\s/g, ' ')

  const firstLoad = computed(() => store.statsLoading && !store.stats)
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 mb-3">
    <div
      v-for="c in cards"
      :key="c.key"
      class="flex min-w-0 flex-col gap-2 rounded-2xl bg-fig-block shadow-card px-1 pt-1.5 pb-1"
    >
      <div class="flex items-center gap-1 px-2">
        <span class="flex shrink-0 rounded-lg p-1" :class="c.tint">
          <n-icon size="20"><component :is="c.icon" /></n-icon>
        </span>
        <p class="min-w-0 flex-1 truncate text-[14px] leading-[18px] font-medium text-fig-text-tertiary">
          {{ $t(`departmentLocationPage.stats.${c.titleKey ?? c.key}`) }}
        </p>
      </div>

      <div class="px-2 text-[20px] leading-6 font-semibold whitespace-nowrap text-fig-text-primary">
        <n-skeleton v-if="firstLoad" :width="56" height="24px" round />
        <UICountUp v-else :value="valueOf(c.key)" />
      </div>

      <div class="mt-auto rounded-xl bg-fig-bg-secondary px-3 py-1.5 text-[12px] leading-4 text-fig-text-tertiary">
        <span class="block truncate">{{ $t(`departmentLocationPage.statsHint.${c.key}`) }}</span>
      </div>
    </div>
  </div>
</template>
