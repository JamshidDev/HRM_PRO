<script setup>
import validationRules from "@/utils/validationRules.js"
import {useComponentStore, useWorkerProfileStore} from "@/store/modules/index.js"
import {useAppSetting} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import UIHelper from "@/utils/UIHelper.js"
import {UISelect} from "@/components/index.js"
import UIDepartment from "../../../../components/ui/UIDepartment.vue"

const store = useWorkerProfileStore()
const componentStore = useComponentStore()
const formRef = ref(null)

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      store._updatePosition()
    }
  })
}

const onChangeStructure = (v)=>{
  store.editPayload.organization_id=v
  if(v.length>0){
    componentStore.departmentList = []
    store.editPayload.department_id = []
    store.editPayload.department_position_id = null
    componentStore.depParams.organizations =v[0].id
    componentStore._departmentTree()
  }
}

const onChangeDepartment = (v)=>{
  store.editPayload.department_id = v
  componentStore.departmentPositionList = []
  store.editPayload.department_position_id = null
  componentStore._departmentPosition(v[0].id)
}

onMounted(()=>{
  componentStore._enums()
  componentStore._scheduleList()

  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }
})
</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.common"
      :model="store.editPayload"
  >
    <div class="grid grid-cols-12 gap-x-4">
      <div class="col-span-12 md:col-span-6 lg:col-span-2">
        <n-form-item
            :label="$t(`documentPage.form.contractNumber`)"
            path="contract_number"
            :rule-path="validationRules.rulesNames.requiredStringField">
          <n-input
              class="w-full"
              type="text"
              :placeholder="$t(`content.enterField`)"
              v-model:value="store.editPayload.contract_number"
          />
        </n-form-item>
      </div>
      <div class="col-span-12 md:col-span-6 lg:col-span-7">
        <n-form-item
            :label="$t(`documentPage.form.type`)"
            path="type"
            :rule-path="validationRules.rulesNames.requiredNumberField">
          <n-select
              v-model:value="store.editPayload.type"
              filterable
              :placeholder="$t(`content.choose`)"
              :options="componentStore.contractTypeList"
              label-field="name"
              value-field="id"
              :loading="componentStore.enumLoading"
          />
        </n-form-item>
      </div>
      <div class="col-span-12 md:col-span-6 lg:col-span-3">
        <n-form-item
            :label="$t(`documentPage.form.contractDate`)"
            path="contract_date"
            :rule-path="validationRules.rulesNames.requiredDateTimeField">
          <n-date-picker
              class="w-full"
              v-model:value="store.editPayload.contract_date"
              type="date"
              :placeholder="$t(`content.choose`)"
              :format="useAppSetting.datePicketFormat"
          />
        </n-form-item>
      </div>

      <div class="col-span-12 md:col-span-6 lg:col-span-2">
        <n-form-item
            :label="$t(`documentPage.form.group`)"
            path="group"
            :rule-path="validationRules.rulesNames.requiredNumberField">
          <n-select
              v-model:value="store.editPayload.group"
              filterable
              :placeholder="$t(`content.choose`)"
              :options="componentStore.groupList"
              label-field="name"
              value-field="id"
              :loading="componentStore.enumLoading"
              clearable
          />
        </n-form-item>
      </div>
      <div class="col-span-12 md:col-span-6 lg:col-span-2">
        <n-form-item
            :label="$t(`documentPage.form.rank`)"
            path="rank"
            :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-select
              v-model:value="store.editPayload.rank"
              filterable
              :placeholder="$t(`content.choose`)"
              :options="componentStore.rankList"
              label-field="name"
              value-field="id"
              :loading="componentStore.enumLoading"
              clearable
          />
        </n-form-item>
      </div>
      <div class="col-span-12 md:col-span-6 lg:col-span-2">
        <n-form-item
            :label="$t(`documentPage.form.rate`)"
            path="rate"
            :rule-path="validationRules.rulesNames.requiredNumberField"
        >
          <n-input-number
              :max="1"
              :min="0.1"
              :step="0.1"
              :show-button="false"
              class="w-full"
              type="text"
              :placeholder="$t(`content.enterField`)"
              :allow-input="Utils.onlyAllowNumber"
              v-model:value="store.editPayload.rate"
          />
        </n-form-item>
      </div>
      <div class="col-span-12 md:col-span-6 lg:col-span-2">
        <n-form-item
            :label="$t(`documentPage.form.salary`)"
            path="salary"
            :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input

              class="w-full"
              type="text"
              :placeholder="$t(`content.enterField`)"
              :allow-input="Utils.onlyAllowNumber"
              v-model:value="store.editPayload.salary"
          >
            <template #suffix>
              {{$t('content.sum')}}
            </template>
          </n-input>
        </n-form-item>
      </div>
      <div class="col-span-12 md:col-span-6 lg:col-span-4">
        <n-form-item
            :label="$t(`documentPage.form.schedule_id`)"
            path="schedule_id"
            :rule-path="validationRules.rulesNames.requiredNumberField"
        >
          <n-select
              v-model:value="store.editPayload.schedule_id"
              filterable
              :placeholder="$t(`content.choose`)"
              :options="componentStore.scheduleList"
              value-field="id"
              :loading="componentStore.scheduleLoading"
              :render-label="UIHelper.scheduleRender.label"
              :render-tag="UIHelper.scheduleRender.value"
              clearable
          />
        </n-form-item>
      </div>

      <div class="col-span-12 md:col-span-6">
        <n-form-item :label="$t(`documentPage.form.organization`)" path="organization_id">
          <UISelect
              :options="componentStore.structureList"
              :modelV="store.editPayload.organization_id"
              @updateModel="onChangeStructure"
              :checkedVal="store.structureCheckV2"
              @updateCheck="(v)=>store.structureCheckV2=v"
              :loading="componentStore.structureLoading"
              :multiple="false"
          />
        </n-form-item>
      </div>
      <div class="col-span-12 md:col-span-6">
        <n-form-item :label="$t(`documentPage.form.department`)" path="department_id">
          <UIDepartment
              :modelV="store.editPayload.department_id"
              @updateModel="onChangeDepartment"
              :checkedVal="store.departmentCheckV2"
              @updateCheck="(v)=>store.departmentCheckV2=v"
              :multiple="false"
          />
        </n-form-item>
      </div>
      <div class="col-span-12 md:col-span-6">
        <n-form-item :label="$t(`documentPage.form.position`)" path="department_position_id">
          <n-select
              :disabled="!Boolean(store.editPayload.department_id.length)"
              v-model:value="store.editPayload.department_position_id"
              filterable
              :placeholder="$t(`content.choose`)"
              :options="componentStore.departmentPositionList"
              label-field="name"
              value-field="id"
              :loading="componentStore.departmentPositionLoading"
          />
        </n-form-item>
      </div>
      <div class="col-span-12">
        <div class="grid grid-cols-2 gap-2 mt-10">
          <n-button @click="()=>store.editVisible=false" type="error" ghost>
            {{$t('content.cancel')}}
          </n-button>
          <n-button
              @click="onSubmit"
              :loading="store.positionLoading"
              type="primary">
            {{$t('content.save')}}
          </n-button>
        </div>
      </div>
    </div>
  </n-form>
</template>

<style scoped>

</style>