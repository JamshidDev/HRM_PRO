<script setup>
import InfoCardGrid from './ui/InfoCardGrid.vue'
import {useOrganizationLeaderStore, useUsefulStore} from "@/store/modules";
import {UIDrawer} from "@/components/index.js"
import OrgDetail from './ui/OrgDetail.vue'
const store = useUsefulStore()
</script>
<template>
  <div class="h-full p-4">
    <InfoCardGrid />
    <UIDrawer
        :width="550"
        :visible="store.visible"
        @update:visible="(v)=>store.visible = v"
        :title="store.orgInstance?.name"
    >
      <template #content>
        <OrgDetail />
      </template>
    </UIDrawer>
  </div>
</template>