<script setup>
  import InfoCardGrid from './ui/InfoCardGrid.vue'
  import { useUsefulStore } from '@stores'
  import { UIDrawer } from '@components'
  import OrgDetail from './ui/OrgDetail.vue'
  const store = useUsefulStore()
  const tab = ref(0)
</script>
<template>
  <div class="h-full p-4 flex flex-col">
    <InfoCardGrid v-model:tab="tab" class="flex-1 min-h-0" />
    <UIDrawer
      :width="550"
      :visible="store.visible"
      @update:visible="(v) => (store.visible = v)"
      :title="store.orgInstance?.name"
    >
      <template #content>
        <OrgDetail />
      </template>
    </UIDrawer>
  </div>
</template>
