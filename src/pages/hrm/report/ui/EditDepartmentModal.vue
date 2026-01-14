<script setup>
import {validationRules} from "@utils"
import DepartmentFrom from '@/pages/hrm/department/ui/createForm.vue'
import {UIModal} from "@components"
import {useReport2Store} from "@stores"

const store = useReport2Store()

</script>



<template>
  <UIModal
      :width="900"
      v-model:visible="store.department.visible"
      :title="$t('departmentPage.updateTitle')"
  >
    <DepartmentFrom/>
  </UIModal>
</template>
