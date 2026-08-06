<script setup>
  import { UIDrawer } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import createForm from './ui/createForm.vue'
  import { useSpecialityStore } from '@/store/modules/index.js'
  import { useAccountStore } from '@/store/modules/index.js'

  const store = useSpecialityStore()
  const accStore = useAccountStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.specialitiesRead)) return
    store._index()
  })
</script>

<template>
  <Table />
  <UIDrawer
    :visible="store.visible"
    @update:visible="(v) => (store.visible = v)"
    :title="
      store.visibleType
        ? $t('othersPage.speciality.createTitle')
        : $t('othersPage.speciality.updateTitle')
    "
  >
    <template #content>
      <createForm />
    </template>
  </UIDrawer>
</template>
