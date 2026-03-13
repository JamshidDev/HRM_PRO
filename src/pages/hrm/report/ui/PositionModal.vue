<script setup>
  import { UIModal } from '@components'
  import createFrom from './CreateForm.vue'
  import { useReport2Store, useDepartmentPositionStore } from '@stores'

  const store = useReport2Store()
  const pnStore = useDepartmentPositionStore()
</script>

<template>
  <template>
    <UIModal
      :width="900"
      v-model:visible="store.position.visible"
      :title="
        $t(
          store.position.visibleType
            ? 'departmentPositionPage.createTitle'
            : 'departmentPositionPage.updateTitle'
        )
      "
    >
      <createFrom />
    </UIModal>
  </template>
</template>
