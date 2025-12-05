<script setup>
import {useComponentStore, useTimesheetDepartmentStore} from "@/store/modules";
import {UINSelect, UISelect} from "@/components/index.js"
import UIDepartment from "@/components/ui/UIDepartment.vue"
import ValidationRules from "@/utils/validationRules.js";

const store = useTimesheetDepartmentStore()
const componentStore = useComponentStore()

const changeOrg = (v)=>{
  store.payload.organizations=v
  store.payload.departments = []
  store.departmentList = []
  if(v.length){
    store._department()
  }
}

const onChangeDepartment = (v)=>{
  store.payload.departments = v
}

const formRef = ref(null)

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error) {
      store._create()
    }
  })
}

onMounted(()=>{
  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }
})

</script>
<template>
  <n-form
      ref="formRef"
      :model="store.payload"
      class="h-full flex flex-col"
      :rules="ValidationRules.common"
  >
    <n-form-item
        :label="$t(`content.workplace`)"
        path="organizations"
        rule-path="requiredMultiSelectField"
    >
      <UISelect
          :options="componentStore.structureList"
          :modelV="store.payload.organizations"
          @defaultValue="changeOrg"
          @updateModel="changeOrg"
          :checkedVal="store.structureCheck"
          @updateCheck="(v)=>store.structureCheck=v"
          :loading="componentStore.structureLoading"
          v-model:search="componentStore.structureParams.search"
          @onSearch="componentStore._structures"
          :multiple="false"
      />

    </n-form-item>

    <n-form-item
        :label="$t(`documentPage.form.department`)"
        path="departments"
        rule-path="requiredMultiSelectField"
    >
<!--      <UIDepartment-->
<!--          :modelV="store.payload.departments"-->
<!--          @updateModel="onChangeDepartment"-->
<!--          :checkedVal="store.departmentCheck"-->
<!--          @updateCheck="(v)=>store.departmentCheck=v"-->
<!--          v-model:search="componentStore.depParams.search"-->
<!--      />-->
      <UINSelect
          multiple
          clearable
          :loading="store.departmentLoading"
          :options="store.departmentList"
          v-model:value="store.payload.departments"

      />
    </n-form-item>
    <div class="mt-auto">
      <n-button block type="primary" :loading="store.saveLoading" @click="onSubmit" >
        {{$t('content.save')}}
      </n-button>
    </div>
  </n-form>
</template>