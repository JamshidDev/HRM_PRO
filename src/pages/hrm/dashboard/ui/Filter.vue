<script setup>
  import { UISelect } from '@/components/index.js'
  import { useComponentStore, useDashboardStore } from '@/store/modules/index.js'

  const componentStore = useComponentStore()
  const store = useDashboardStore()

  const updateModel = (v) => {
    store.params.organizations = v
    if (store.activeTab === 'audit') {
      store._getAuditCounts()
      store.audit.detail.page = 1
      store._getAuditPreview()
      return
    }
    if (store?.activeDetail) {
      store.params.page = 1
      store._index_detail()
    }
    store._dashboard()
  }

  onMounted(() => {
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  })
</script>

<template>
  <div class="flex gap-3">
    <div class="w-[400px]">
      <UISelect
        :options="componentStore.structureList"
        :modelV="store.params.organizations"
        @defaultValue="(v) => (store.params.organizations = v)"
        @updateModel="updateModel"
        v-model:search="componentStore.structureParams.search"
        @onSearch="componentStore._structures"
        :checkedVal="store.structureCheck"
        @updateCheck="(v) => (store.structureCheck = v)"
        :loading="componentStore.structureLoading"
      />
    </div>
  </div>
</template>

<style scoped></style>
