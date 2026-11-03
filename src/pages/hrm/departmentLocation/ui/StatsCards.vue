<script setup>
  // Mobile face kartalari: korxonalar, hududlar, erkin rejim, joy belgilanmagan xodimlar.
  import { computed } from 'vue'
  import { useDepartmentLocationStore } from '@/store/modules/index.js'
  import {
    Building24Regular,
    Map20Filled,
    Location20Filled,
    PersonQuestionMark20Regular
  } from '@vicons/fluent'

  const store = useDepartmentLocationStore()

  const cards = computed(() => [
    {
      key: 'organizations',
      icon: Building24Regular,
      tone: 'text-primary bg-primary/10',
      borderTone: 'hover:border-primary/40'
    },
    {
      key: 'areas',
      icon: Map20Filled,
      tone: 'text-info bg-info/10',
      borderTone: 'hover:border-info/40'
    },
    {
      key: 'free',
      icon: Location20Filled,
      tone: 'text-success bg-success/10',
      borderTone: 'hover:border-success/40'
    },
    {
      key: store.stats?.view === 'workers' ? 'unassignedWorkers' : 'unassignedDepartments',
      field: 'unassigned',
      icon: PersonQuestionMark20Regular,
      tone: 'text-warning bg-warning/10',
      borderTone: 'hover:border-warning/40'
    }
  ])
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-3.5">
    <div
      v-for="c in cards"
      :key="c.key"
      class="group relative flex items-center gap-3.5 rounded-xl border border-surface-line bg-surface-section p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-md"
      :class="c.borderTone"
    >
      <div
        class="flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
        :class="c.tone"
      >
        <n-icon size="22"><component :is="c.icon" /></n-icon>
      </div>
      <div class="min-w-0 flex-1">
        <div class="text-xs font-medium text-textColor3 truncate leading-4 mb-1">
          {{ $t(`departmentLocationPage.stats.${c.key}`) }}
        </div>
        <n-skeleton v-if="store.statsLoading && !store.stats" :width="56" height="26px" round />
        <div v-else class="text-2xl font-bold tracking-tight text-textColor0 leading-7">
          {{ (store.stats?.[c.field ?? c.key] ?? 0).toLocaleString('ru-RU') }}
        </div>
      </div>
    </div>
  </div>
</template>
