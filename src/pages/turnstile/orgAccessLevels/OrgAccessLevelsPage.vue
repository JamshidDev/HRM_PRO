<script setup>
import {UIPageContent, NoDataPicture} from "@/components/index.js"
import OrgAccessLevelTree from './ui/OrgAccessLevelTree.vue'
import AccessLevelList from './ui/AccessLevelList.vue'
import {useTurnstileHikCentralStore, useAccountStore} from "@/store/modules/index.js";

const store = useTurnstileHikCentralStore()
const accStore = useAccountStore()

onMounted(() => {
  store.params.page = 1
  store.params.per_page = 1000
  store.params.search = null
  store.accessLevels = []
  if(!accStore.checkAction(accStore.pn.turnstileOrganizationAccessLevelsRead)) return
  store._org_access_levels()
  store._index_access_levels()
})

onUnmounted(()=>{
  store.params.page = 1
  store.params.per_page = 10
  store.params.search = null
  store.accessLevels = []
})
</script>

<template>
  <UIPageContent>
    <n-spin :show="store.accessLevelsLoading || store.orgAccessLevelsLoading" class="h-full">
      <div class="flex gap-3 relative">
        <div class="bg-surface-section rounded-md grow basis-[50%] shrink-0 overflow-auto w-full md:w-auto">
          <OrgAccessLevelTree class="p-2 "/>
        </div>
        <div class="bg-surface-ground transition-all rounded-md grow basis-[50%] shrink-0 absolute md:static w-full md:w-auto top-0 bottom-0" :style="{right: store.payload.organization_id?.length ? '0' : '-100%'}">
          <div class="md:p-2">
            <AccessLevelList/>
          </div>
        </div>
      </div>
    </n-spin>
  </UIPageContent>
</template>
