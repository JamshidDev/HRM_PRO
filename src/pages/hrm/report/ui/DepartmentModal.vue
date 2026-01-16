<script setup>
import DepartmentFrom from '@/pages/hrm/department/ui/createForm.vue'
import {UIModal} from "@components"
import {useDepartmentStore, useReport2Store} from "@stores"

const store = useReport2Store()
const dpStore = useDepartmentStore()

const onSuccessEv = () => {
  store.department.visible = false
  store._getDepartment()
}

</script>


<template>
  <UIModal
      :width="600"
      v-model:visible="store.department.visible"
      :title="$t(dpStore.visibleType? 'departmentPage.createTitle' : 'departmentPage.updateTitle')"
  >
    <DepartmentFrom
        :callback="onSuccessEv"
        @onCancelEv="store.department.visible = false"
        :height-full="false"
    />
  </UIModal>
</template>
