<script setup>
  import { UIPageContent, NoDataPicture } from '@/components/index.js'
  import OrgAccessLevelTree from './ui/OrgAccessLevelTree.vue'
  import AccessLevelList from './ui/AccessLevelList.vue'
  import {
    useTurnstileHikCentralStore,
    useAccountStore,
    useComponentStore
  } from '@/store/modules/index.js'

  const store = useTurnstileHikCentralStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.turnstileOrganizationAccessLevelsRead)) return
    componentStore._structures()
    store._index_access_levels()
  })
</script>

<template>
  <UIPageContent>
    <n-spin :show="store.accessLevelsLoading || store.orgAccessLevelsLoading" class="h-full">
      <div class="flex gap-3 relative">
        <div
          class="bg-surface-section rounded-md grow basis-[50%] shrink-0 overflow-auto w-full md:w-auto"
        >
          <OrgAccessLevelTree />
        </div>
        <div
          class="bg-surface-ground transition-all rounded-md grow basis-[50%] shrink-0 absolute md:static w-full md:w-auto top-0 bottom-0"
          :style="{ right: store.payload.organization_id?.length ? '0' : '-100%' }"
        >
          <div class="md:p-2">
            <AccessLevelList />
          </div>
        </div>
      </div>
    </n-spin>
  </UIPageContent>
</template>
