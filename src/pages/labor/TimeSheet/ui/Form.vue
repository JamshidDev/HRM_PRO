<script setup>
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useComponentStore, useTimeSheetStore, useUserDepartmentStore} from "@/store/modules/index.js";

const store = useTimeSheetStore()
const componentStore = useComponentStore()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error) {
      if(store.visibleType){
        store._create()
      }else{
        store._update()
      }
    }
  })
}


onMounted(()=>{
  if(componentStore.timesheetDepartmentList.length === 0){
    componentStore._timesheetDepartment()
  }
})

</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.common"
      :model="store.payload"
      class="h-full flex flex-col"
  >
    <n-form-item :label="$t(`timeSheetPage.department`)" path="department_id" rule-path="requiredNumberField">
      <n-select
          v-model:value="store.payload.department_id"
          filterable
          :placeholder="$t(`content.choose`)"
          :options="componentStore.timesheetDepartmentList"
          label-field="name"
          value-field="id"
          :loading="componentStore.timesheetDepartmentLoading"

      />
    </n-form-item>
    <n-form-item :label="$t(`content.month`)" path="timestamp" rule-path="requiredNumberField">
      <n-date-picker
          class="w-full"
          v-model:value="store.payload.timestamp"
          type="month"
          format="y MMMM"
          month-format="MMMM"
          clearable
          :actions="null"
          update-value-on-close
      />
    </n-form-item>
    <div class="mt-auto">
      <n-button
          block
          @click="onSubmit"
          :loading="store.saveLoading"
          type="primary"
      >
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>



</template>

<style scoped>

</style>