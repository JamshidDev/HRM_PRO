<script setup>
  import InfoCardGrid from './ui/InfoCardGrid.vue'
  import { useUsefulStore } from '@stores'
  import { UIDrawer, UIPageTitle } from '@components'
  import OrgDetail from './ui/OrgDetail.vue'
  const store = useUsefulStore()
</script>
<template>
  <div class="h-full p-4">
    <UIPageTitle :title="$t('navigation.general')" />
    <InfoCardGrid />
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
