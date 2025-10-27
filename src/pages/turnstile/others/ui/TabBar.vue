<script setup>
import {HeaderTabContainer} from "@/components/layoutTab/index.js"
import {useOthersStore} from "@/store/modules/index.js"


const store = useOthersStore()


const emits = defineEmits(['onTabChange'])

const handleTabChange = (key) => {
  store.activeTab = key
}
</script>

<template>
  <div class="tab-bar-container">
    <HeaderTabContainer
        v-model:tab="store.activeTab"
        :options="store.pageOptions"
        @onSelect="handleTabChange"
    />
  </div>
</template>

<style scoped>
.tab-bar-container {
  width: 100%;
  background: var(--surface-ground);
  border-bottom: 1px solid var(--surface-line);
}
</style>
