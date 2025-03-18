<script setup>
import i18n from "@/i18n/index.js";
import {useComponentStore, useTimesheetDepartmentStore} from "@/store/modules";
import {UIStructure} from "@/components/index.js";
import UIDepartment from "@/components/ui/UIDepartment.vue"
import ValidationRules from "@/utils/validationRules.js";
const t = i18n.global.t

const store = useTimesheetDepartmentStore()
const componentStore = useComponentStore()

const changeOrgs = (v)=>{
  store.payload.organizations=v
  store.payload.departments = []
  if(v.length){
    componentStore._departmentTree(v[0].id)
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
    <n-tabs
        type="segment"
        v-model:value="store.payload.type"
      @update-value="store.resetDefaults()"
    >
      <n-tab-pane v-for="(item, idx) in store.tabs" :key="idx" :tab="item.label" :name="item.type">
        <n-form-item
            :label="$t(`content.organization`)"
            path="organizations"
          rule-path="requiredMultiSelectField"
        >
          <UIStructure
              :modelV="store.payload.organizations"
              :checkedVal="store.structureCheck"
              @updateCheck="(v)=>store.structureCheck=v"
              @updateModel="changeOrgs"
              :multiple="false"
          />
        </n-form-item>

        <template v-if="item.type === 'department'">
          <n-form-item
              :label="$t(`documentPage.form.department`)"
              path="departments"
              rule-path="requiredMultiSelectField"
          >
            <UIDepartment
                :modelV="store.payload.departments"
                @updateModel="onChangeDepartment"
                :checkedVal="store.departmentCheck"
                @updateCheck="(v)=>store.departmentCheck=v"
            />
          </n-form-item>
        </template>
      </n-tab-pane>

    </n-tabs>
    <div class="mt-auto">
      <n-button block type="primary" :loading="store.saveLoading" @click="onSubmit" >
        {{$t('content.save')}}
      </n-button>
    </div>
  </n-form>
</template>