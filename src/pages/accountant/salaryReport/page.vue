<script setup>
  import { UIPageContent } from '@/components/index.js'
  import Filter from './ui/Filter.vue'
  import MonthTab from './ui/MonthTab.vue'
  import OrgTab from './ui/OrgTab.vue'
  import { useSalaryReportStore } from '@/store/modules/index.js'
  const store = useSalaryReportStore()
</script>

<template>
  <UIPageContent>
    <Filter />
    <n-tabs animated v-model:value="store.activeTab" class="hidden-tab-header" type="segment">
      <n-tab-pane :name="store.tabs[0].id">
        <MonthTab />
      </n-tab-pane>
      <n-tab-pane :name="store.tabs[1].id">
        <OrgTab />
      </n-tab-pane>
    </n-tabs>
  </UIPageContent>
</template>
