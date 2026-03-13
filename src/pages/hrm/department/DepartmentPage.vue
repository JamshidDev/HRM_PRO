<script setup>
  import { UIDrawer, UIPageContent } from '@components'
  import { useDepartmentStore, useAccountStore } from '@stores'
  import { Filter, createForm, TabPage, Preview} from './ui'

  const accStore = useAccountStore()
  const store = useDepartmentStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrDepartmentsRead)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <TabPage />
    <UIDrawer
      v-model:visible="store.visible"
      :title="
        store.visibleType ? $t('departmentPage.createTitle') : $t('departmentPage.updateTitle')
      "
    >
      <template #content>
        <createForm @onCancelEv="store.visible = false" />
      </template>
    </UIDrawer>
    <Preview />
  </UIPageContent>
</template>
