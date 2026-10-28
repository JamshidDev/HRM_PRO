<script setup>
  // «Umumiy» tab o'ramasi — keep-alive uchun bitta komponent (SummaryCards + Overview).
  // KPI kartalari doim ko'rinadi; holatlar (Overview/F) korxona tanlangach.
  import { computed } from 'vue'
  import { useSalaryControlStore } from '@/store/modules/index.js'
  import SummaryCards from './SummaryCards.vue'
  import Overview from './Overview.vue'
  import EmptyState from './EmptyState.vue'

  const store = useSalaryControlStore()
  const hasOrg = computed(
    () => store.params.organizations.length > 0 || Boolean(store.params.ones_code)
  )
</script>

<template>
  <div class="flex flex-col gap-4">
    <SummaryCards />
    <Overview v-if="hasOrg" />
    <EmptyState v-else class="mt-4" :text="$t('salary1c.selectOrg')" />
  </div>
</template>
