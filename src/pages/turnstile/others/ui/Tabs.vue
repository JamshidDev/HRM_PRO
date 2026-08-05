<script setup>
  import { useOthersStore } from '@/store/modules/index.js'
  const store = useOthersStore()
</script>

<template>
  <n-tabs
    animated
    v-model:value="store.activeTab"
    class="hidden-tab-header flex-1 flex flex-col"
    pane-wrapper-class="flex-1 flex flex-col"
    type="segment"
  >
    <template v-for="page in store.pageOptions" :key="page.key">
      <n-tab-pane :name="page.key" class="!pt-0 flex-1 flex flex-col gap-4">
        <component :is="page.component" />
      </n-tab-pane>
    </template>
  </n-tabs>
</template>
