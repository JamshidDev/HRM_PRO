<script setup>
  // Mobile face kartalari: korxonalar, hududlar, erkin rejim, joy belgilanmagan xodimlar.
  import { useDepartmentLocationStore } from '@/store/modules/index.js'
  import {
    Building24Regular,
    Map20Filled,
    Location20Filled,
    PersonQuestionMark20Regular
  } from '@vicons/fluent'

  const store = useDepartmentLocationStore()

  const cards = computed(() => [
    { key: 'organizations', icon: Building24Regular, tone: 'text-primary bg-primary/10' },
    { key: 'areas', icon: Map20Filled, tone: 'text-info bg-info/10' },
    { key: 'free', icon: Location20Filled, tone: 'text-success bg-success/10' },
    {
      key: store.stats?.view === 'workers' ? 'unassignedWorkers' : 'unassignedDepartments',
      field: 'unassigned',
      icon: PersonQuestionMark20Regular,
      tone: 'text-warning bg-warning/10'
    }
  ])
</script>

<template>
  <div class="grid grid-cols-12 gap-3 mb-3">
    <div
      v-for="c in cards"
      :key="c.key"
      class="col-span-3 flex items-center gap-3 rounded-xl border border-surface-line bg-surface-section px-3 py-2"
    >
      <div class="flex size-9 shrink-0 items-center justify-center rounded-lg" :class="c.tone">
        <n-icon size="18"><component :is="c.icon" /></n-icon>
      </div>
      <div class="min-w-0 flex-1">
        <div class="text-xs text-textColor3 truncate">{{ $t(`departmentLocationPage.stats.${c.key}`) }}</div>
        <n-skeleton v-if="store.statsLoading && !store.stats" :width="48" height="20px" round />
        <div v-else class="text-lg font-semibold text-textColor0 leading-6">
          {{ (store.stats?.[c.field ?? c.key] ?? 0).toLocaleString('ru-RU') }}
        </div>
      </div>
    </div>
  </div>
</template>
