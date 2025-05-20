<script setup>
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useComponentStore, useTimesheetStore} from "@/store/modules/index.js";

const store = useTimesheetStore()
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
  if(!componentStore.timesheetWorkplace){
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
    <n-tabs v-model:value="store.payload.active_tab" type="segment"  @update-value="store.resetForm()">
      <n-tab-pane name="organization" :tab="$t('timesheet.type.organization')">
        <n-form-item :show-label="false" path="work_place_id" rule-path="requiredNumberField">
          <n-select
              v-model:value="store.payload.work_place_id"
              filterable

              :options="componentStore.timesheetWorkplace?.organizations"
              label-field="name"
              value-field="id"
              :loading="componentStore.timesheetWorkplaceLoading"

          />
        </n-form-item>
        <n-form-item  :label="$t(`content.month`)" path="timestamp" rule-path="requiredNumberField">
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
      </n-tab-pane>
      <n-tab-pane name="department" :tab="$t('timesheet.type.department')">
        <n-form-item :show-label="false" path="department_id" rule-path="requiredNumberField">
          <n-select
              v-model:value="store.payload.department_id"
              filterable

              :options="componentStore.timesheetWorkplace?.departments"
              label-field="name"
              value-field="id"
              :loading="componentStore.timesheetWorkplaceLoading"
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
      </n-tab-pane>
    </n-tabs>

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