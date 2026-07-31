<script setup>
  import { UIDrawer } from '@/components/index.js'
  import { usePolyclinicStore } from '@/store/modules/index.js'
  import createForm from './ui/createForm.vue'
  import Filter from './ui/Filter.vue'
  import Table from './ui/Table.vue'

  const store = usePolyclinicStore()

  onMounted(() => {
    store._index()
  })
</script>

<template>
  <Filter />
  <Table />
  <UIDrawer
    :visible="store.visible"
    @update:visible="(v) => (store.visible = v)"
    :title="store.visibleType ? $t('polyclinic.createTitle') : $t('polyclinic.updateTitle')"
  >
    <template #content>
      <createForm />
    </template>
  </UIDrawer>
</template>
