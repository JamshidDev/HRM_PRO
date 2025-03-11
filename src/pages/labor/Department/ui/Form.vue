<script setup>
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useComponentStore, useUserDepartmentStore} from "@/store/modules/index.js";
import {UIStructure} from "@/components/index.js";

const store = useUserDepartmentStore()
const componentStore = useComponentStore()

const onSubmit = ()=>{
  console.log(store.payload.worker_positions)
  formRef.value?.validate((error)=>{
    if(!error) {
      store._attach()
    }
  })
}


onMounted(()=>{
  if(componentStore.workerList.length === 0){
    componentStore._workers()
  }
  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }
})

const changeOrgs = (v)=>{
  console.log(v)
  store.payload.organizations=v
  componentStore._workers({org_ids: v.map(i=>i.id).join(',')})
}

const workerRenderLabel = (option)=>{
  return [
    h('div',{ class:'flex flex-col pt-2'}, [
      h('div',{ class:'text-xs font-medium text-gray-500'},option.name),
      h('div',{ class:'text-xs text-primary'},option.position),
    ])
  ];
}
const workerRenderValue = ({option})=>{
  return [
    h('div',{ class:'flex flex-col'}, [
      h('div',{ class:'text-sm font-medium text-gray-500'},option.name),
    ])
  ];
}

</script>

<template>
    <n-form
        ref="formRef"
        :rules="validationRules.common"
        :model="store.payload"
        class="h-full flex flex-col"
    >
      <n-form-item :label="$t(`content.organization`)" path="organizations">
        <UIStructure
            :modelV="store.payload.organizations"
            :checkedVal="store.structureCheck"
            @updateCheck="(v)=>store.structureCheck=v"
            @updateModel="changeOrgs"
        />
      </n-form-item>
      <n-form-item :label="$t(`userDepartmentPage.staff`)" path="worker_positions" rule-path="requiredMultiSelectField">
        <n-select
            multiple
            v-model:value="store.payload.worker_positions"
            filterable
            :placeholder="$t(`content.choose`)"
            :options="componentStore.workerList"
            label-field="name"
            value-field="id"
            :render-label="workerRenderLabel"
            :render-tag="workerRenderValue"
            :loading="componentStore.workerLoading"
        />
<!--            @update:value="onChangeWorker"-->
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