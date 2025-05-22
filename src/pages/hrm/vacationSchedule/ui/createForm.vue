<script setup>
import validationRules from "@/utils/validationRules.js";
import {UISelect} from "@/components/index.js"
import {useComponentStore, useVacationScheduleStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const formRef = ref(null)

const store = useVacationScheduleStore()
const componentStore = useComponentStore()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error) {
      if (store.visibleType) {
        store._create()
      } else {
        store._update()
      }
    }
  })
}

const onChangeStructure = (v)=>{
  store.payload.organization_id=v
  if(v.length>0){
    componentStore.workerList = []
    store.payload.worker_position_id = null
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
  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }
})
</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.vacationSchedule"
      :model="store.payload"
  >
    <div style="min-height:calc(100vh - 120px)">
      <template v-if="store.visibleType">
        <n-form-item class="w-full" :label="$t(`documentPage.form.organization`)" path="organization_id">
          <UISelect
              :options="componentStore.structureList"
              :modelV="store.payload.organization_id"
              @defaultValue="(v)=>store.payload.organization_id=v"
              @updateModel="onChangeStructure"
              :checkedVal="store.structureCheck"
              @updateCheck="(v)=>store.structureCheck=v"
              :loading="componentStore.structureLoading"
              :multiple="false"
              :auto-select="true"
          />
        </n-form-item>
        <n-form-item class="w-full" :label="$t(`documentPage.form.worker`)" path="worker_position_id">
          <n-select
              v-model:value="store.payload.worker_position_id"
              filterable

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
      </template>


      <n-form-item class="w-full" :label="$t(`content.month`)" path="month">
        <n-select
            v-model:value="store.payload.month"
            filterable

            :options="Utils.monthList"
            label-field="name"
            value-field="id"
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