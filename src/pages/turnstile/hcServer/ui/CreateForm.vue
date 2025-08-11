<script setup>
import validationRules from "@/utils/validationRules.js";
import {UISelect} from "@/components/index.js"
import {useComponentStore, useHcServerStore} from "@/store/modules/index.js"
import UIHelper from "@/utils/UIHelper.js"

const formRef = ref(null)

const store = useHcServerStore()
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
  store.payload.department_id= null
  store.workerList = []
  componentStore.departmentList = []
  store.payload.workers = []
  store.payload.department_id = null

  if(v.length>0){
    componentStore.workerList = []
    store.workerParams.organization_id= v[0].id
    componentStore.depParams.organizations =  v[0].id
    store._workers()
  }
}

const onChangeDepartment = (v)=>{
  store.payload.workers = []
  store.workerParams.department_id = v
}

const onChangeWorker = (v)=>{
}

const onOpenEv = (v)=>{
  if(!v) return
  // store.payload.workers = []
  store.workerParams.search=null
  store.workerParams.page=1
  store._workers()
}

const onPanelEv = (v)=>{
  if(!v) return
  if(store.visibleType && !store.payload.department_id){
    componentStore.onOpenDepartmentEv(v)
  }
  if(!store.visibleType && componentStore.departmentList.length === 1){
    store.payload.department_id = null
    componentStore.onOpenDepartmentEv(v)
  }

}

watch(()=>store.payload.workers,(values)=>{
  store.selectedWorkers = store.workerList.filter((x)=>values.includes(x.id))
})

onMounted(()=>{
  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }
  store._levels()

  if(store.departmentList.length===0){
    store._department()
  }
})
</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.common"
      :model="store.payload"
  >
    <div>
      <template v-if="store.visibleType">
        <n-form-item :label="$t(`hcServer.form.name`)" path="name" :rule-path="validationRules.rulesNames.requiredStringField">
          <n-input
              type="textarea"
              autosize
              v-model:value="store.payload.name"
          />
        </n-form-item>
        <n-form-item
            class="w-full"
            :label="$t(`documentPage.form.organization`)"
            path="organization_id"
            :rule-path="validationRules.rulesNames.requiredMultiSelectField"
        >
          <UISelect
              :options="componentStore.structureList"
              :modelV="store.payload.organization_id"
              @defaultValue="(v)=>store.payload.organization_id=v"
              @updateModel="onChangeStructure"
              :checkedVal="store.structureCheck"
              @updateCheck="(v)=>store.structureCheck=v"
              :loading="componentStore.structureLoading"
              v-model:search="componentStore.structureParams.search"
              @onSearch="componentStore._structures"
              :multiple="false"
          />
        </n-form-item>
        <n-form-item
            :label="$t(`departmentPositionPage.form.department_id`)">
          <n-select
              :disabled="store.payload.organization_id.length === 0"
              v-model:value="store.payload.department_id"
              filterable
              :filter="()=>true"
              clearable
              :options="componentStore.departmentList"
              :render-label="UIHelper.selectRender.label"
              :render-tag="UIHelper.selectRender.value"
              value-field="id"
              :loading="componentStore.departmentLoading"
              @search="componentStore._onSearchDepartment"
              @scroll="componentStore._onScrollDepartment"
              @update:show="onPanelEv"
              @update:value="onChangeDepartment"
              :ignore-composition="false"
          />
        </n-form-item>

        <n-form-item
            class="w-full"
            :label="$t(`documentPage.form.worker`)"
        >
          <n-select
              :disabled="store.payload.organization_id.length === 0"
              v-model:value="store.payload.workers"
              filterable
              multiple
              clearable
              :options="store.workerList"
              label-field="name"
              value-field="id"
              :render-label="UIHelper.selectRender.label"
              :render-tag="UIHelper.selectRender.value"
              @update:value="onChangeWorker"
              :loading="store.workerLoading"
              @scroll="store.onScrollWorker"
              @search="store.onSearchWorker"
              @update:show="onOpenEv"
              :ignore-composition="true"
              :max-tag-count="1"
          />
        </n-form-item>

        <n-form-item
            :label="$t(`hcServer.form.access_level_id`)"
            path="access_level_id"
            :rule-path="validationRules.rulesNames.requiredNumberField">
          <n-select
              filterable
              v-model:value="store.payload.access_level_id"
              :options="store.levelList"
              :loading="store.levelLoading"
              label-field="name"
              value-field="id"
          />
        </n-form-item>
        <n-form-item
            :label="$t(`hcServer.form.department`)"
            path="department"
            :rule-path="validationRules.rulesNames.requiredNumberField">
          <n-select
              filterable
              v-model:value="store.payload.department"
              :options="store.departmentList"
              :loading="store.departmentLoading"
              label-field="name"
              value-field="id"
          />
        </n-form-item>
      </template>

    </div>

    <div class="grid grid-cols-2 gap-2 mt-8">
      <n-button @click="store.visible=false" type="error" ghost>
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