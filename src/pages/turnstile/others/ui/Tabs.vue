<script setup>
  import { useOthersStore } from '@/store/modules/index.js'
  const store = useOthersStore()
</script>

<template>
  <div class="w-full">
    <n-tabs animated v-model:value="store.activeTab" class="hidden-tab-header" type="segment">
      <template v-for="page in store.pageOptions" :key="page.key">
        <n-tab-pane :name="page.key" class="!pt-0">
          <component :is="page.component" />
        </n-tab-pane>
      </template>
    </n-tabs>
  </div>
</template>
