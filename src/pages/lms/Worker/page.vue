<script setup>
  import { UIDrawer, UIPageContent } from '@/components/index.js'
  import Filter from './ui/Filter.vue'
  import Table from './ui/Table.vue'
  import createForm from './ui/createForm.vue'
  import { useAccountStore, useLmsWorkerStore } from '@/store/modules/index.js'

  const store = useLmsWorkerStore()
  const accStore = useAccountStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.lmsWorkerRead)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
    <UIDrawer
      :visible="store.visible"
      @update:visible="(v) => (store.visible = v)"
      :title="store.visibleType ? $t('lmsWorkerPage.createTitle') : $t('lmsWorkerPage.updateTitle')"
    >
      <template #content>
        <createForm />
      </template>
    </UIDrawer>
  </UIPageContent>
</template>
