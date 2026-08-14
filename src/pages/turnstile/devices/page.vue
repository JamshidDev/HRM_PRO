<script setup>
  import { UIPageContent, UIModal } from '@/components/index.js'
  import Filter from './ui/Filter.vue'
  import Table from './ui/Table.vue'
  import createForm from './ui/createForm.vue'
  import { useAccountStore, useDevicesStore } from '@/store/modules/index.js'

  const store = useDevicesStore()
  const accStore = useAccountStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.turnstileDevicesRead)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
    <UIModal
      :width="600"
      :visible="store.visible"
      @update:visible="(v) => (store.visible = v)"
      :title="store.visibleType ? $t('devices.createTitle') : $t('devices.updateTitle')"
    >
      <template #default>
        <createForm />
      </template>
    </UIModal>
  </UIPageContent>
</template>
