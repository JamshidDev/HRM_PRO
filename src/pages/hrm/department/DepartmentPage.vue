<script setup>
  import { UIDrawer, UIPageContent } from '@components'
  import { useDepartmentStore, useAccountStore } from '@stores'
  import { Filter, createForm, Table, Preview} from './ui'

  const accStore = useAccountStore()
  const store = useDepartmentStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrDepartmentsRead)) return
    store._index()
  })

  const onSaved = () => {
    store.visible = false
    store.refreshNode(store.refreshTarget)
  }
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
    <UIDrawer
      v-model:visible="store.visible"
      :title="
        store.visibleType ? $t('departmentPage.createTitle') : $t('departmentPage.updateTitle')
      "
    >
      <template #content>
        <createForm @onCancelEv="store.visible = false" :callback="onSaved" />
      </template>
    </UIDrawer>
    <Preview />
  </UIPageContent>
</template>
