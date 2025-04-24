<script setup>
import validationRules from "@/utils/validationRules.js";
import {UIStructure, UIUpload} from "@/components/index.js"

const formRef = ref(null)
import {useComponentStore, useVacationScheduleStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = useVacationScheduleStore()
const componentStore = useComponentStore()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error) {
      if (store.visibleType) {
        store._create(formData)
        formData.append('file', store.payload.file[0]?.file)
      } else {
        formData.append('_method', 'PUT')
        console.log(store.payload.file)
        if(typeof store.payload.file[0]?.file !== 'string'){
          formData.append('file', store.payload.file[0]?.file)
        }
        store._update(formData)
      }


    }
  })
}


const onChangeStructure = (v)=>{
  store.payload.organization_id=v
  if(v.length>0){
    componentStore.workerList = []
    store.workers = []
    componentStore.workerParams.organization_id= v[0].id
    componentStore._workers()
  }
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


onMounted(()=>{
})

</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.documentArchive"
      :model="store.payload"
  >
    <div style="min-height:calc(100vh - 120px)">

      <n-form-item class="w-full" :label="$t(`documentPage.form.organization`)" path="organization_id">
        <UIStructure
            :modelV="store.payload.organization_id"
            @updateModel="onChangeStructure"
            :checkedVal="store.structureCheck"
            @updateCheck="(v)=>store.structureCheck=v"
            :multiple="false"
        />
      </n-form-item>
      <n-form-item class="w-full" :label="$t(`documentPage.form.worker`)" path="worker">
        <n-select
            v-model:value="store.payload.worker"
            filterable
            :placeholder="$t(`content.choose`)"
            :options="componentStore.workerList"
            label-field="name"
            value-field="id"
            :render-label="workerRenderLabel"
            :render-tag="workerRenderValue"
            :loading="componentStore.workerLoading"
            @scroll="componentStore.onScrollWorker"
            @search="componentStore.onSearchWorker"
        />
      </n-form-item>
      <n-form-item class="w-full" :label="$t(`documentPage.form.worker`)" path="workers">
        <n-select
            v-model:value="store.payload.month"
            filterable
            :placeholder="$t(`content.choose`)"
            :options="Utils.monthList"
            label-field="name"
            value-field="id"
            :filter="()=>true"
            @search="componentStore.onSearchWorker"
            :reset-menu-on-options-change="false"
        />
      </n-form-item>

    </div>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.openVisible(false)" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button
          @click="onSubmit"
          :loading="store.saveLoading"
          type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>

<style scoped>

</style>