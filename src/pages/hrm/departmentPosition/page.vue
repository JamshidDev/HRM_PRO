<script setup>
  import { UIDrawer, UIModal, UIPageContent } from '@components'
  import { useDepartmentPositionStore, useAccountStore } from '@stores'
  import { createFrom, Table, Filter, Preview, SalaryHistoryModal } from './ui'

  const store = useDepartmentPositionStore()
  const accStore = useAccountStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrPositionsRead)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
    <UIDrawer
      :width="800"
      :visible="store.visible"
      @update:visible="(v) => (store.visible = v)"
      :title="
        store.visibleType
          ? $t('departmentPositionPage.createTitle')
          : $t('departmentPositionPage.updateTitle')
      "
    >
      <template #content>
        <createFrom @onCancelEv="store.visible = false" />
      </template>
    </UIDrawer>
    <Preview />
    <UIModal
      :width="'860px'"
      :visible="store.salaryHistory.visible"
      @update:visible="(v) => (store.salaryHistory.visible = v)"
      :title="$t('departmentPositionPage.salaryHistory.title')"
    >
      <SalaryHistoryModal />
    </UIModal>
  </UIPageContent>
</template>
