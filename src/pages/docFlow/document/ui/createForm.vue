<script setup>
import {UIAutoComplete, UIStructure, UITree} from "@/components/index.js"
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useContractStore, useComponentStore} from "@/store/modules/index.js";
import { NAvatar } from "naive-ui"
import Utils from "@/utils/Utils.js"

const store = useContractStore()
const componentStore = useComponentStore()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      store.saveLoading = true
      if(store.visibleType){
        store._create()
      }else{
        store._update()
      }

    }
  })
}

const onChangeDepartment = ()=>{
  componentStore._departmentPosition(store.payload.department_id)
}

const renderLabel = (option)=>{
  return [
    h(
        NAvatar,
        {
          style: {
            verticalAlign: "-0.15em",
            marginRight: "4px"
          },
          src:option.worker.photo,
          'fallback-src':Utils.noAvailableImage,
        },
    ),
    option.position
  ];
}

</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.confirmation"
      :model="store.payload"
  >
    <div style="min-height:calc(100vh - 120px)">
      <div class="grid grid-cols-12 gap-x-4">
        <div class="col-span-4">
          <UIAutoComplete v-model:pin="store.payload.uuid" />
        </div>
        <div class="col-span-4">
          <n-form-item :label="$t(`documentPage.form.organization`)" path="organization">
            <UIStructure
                :modelV="store.payload.organization_id"
                @updateModel="(v)=>store.payload.organization_id=v"
                :checkedVal="store.structureCheck"
                @updateCheck="(v)=>store.structureCheck=v"
            />
          </n-form-item>
        </div>
        <div class="col-span-4">
          <n-form-item :label="$t(`documentPage.form.contractDate`)" path="contract_date">
            <n-date-picker
                class="w-full"
                v-model:value="store.payload.contract_date"
                type="date"
                :placeholder="$t(`content.choose`)"
            />
          </n-form-item>
        </div>
        <div class="col-span-4">
          <n-form-item :label="$t(`documentPage.form.contractNumber`)" path="contract_date">
            <n-input
                class="w-full"
                type="text"
                :placeholder="$t(`content.enterField`)"
                v-model:value="store.payload.number"
            />
          </n-form-item>
        </div>
        <div class="col-span-4">
          <n-form-item :label="$t(`documentPage.form.tableNumber`)" path="contract_date">
            <n-input
                class="w-full"
                type="text"
                :placeholder="$t(`content.enterField`)"
                v-model:value="store.payload.table_number"
            />
          </n-form-item>
        </div>
        <div class="col-span-4">
          <n-form-item :label="$t(`documentPage.form.type`)" path="contract_date">
            <n-select
                v-model:value="store.payload.type"
                filterable
                :placeholder="$t(`content.choose`)"
                :options="componentStore.contractTypeList"
                label-field="name"
                value-field="id"
                :loading="componentStore.enumLoading"
            />
          </n-form-item>
        </div>
        <div class="col-span-4">
          <n-form-item :label="$t(`documentPage.form.documentExampleId`)" path="contract_date">
            <n-select
                v-model:value="store.payload.document_example_id"
                filterable
                :placeholder="$t(`content.choose`)"
                :options="componentStore.docExampleList"
                label-field="name"
                value-field="id"
                :loading="componentStore.docExampleLoading"
            />
          </n-form-item>
        </div>
        <div class="col-span-4">
          <n-form-item :label="$t(`documentPage.form.department`)" path="contract_date">
            <n-select
                v-model:value="store.payload.department_id"
                filterable
                :placeholder="$t(`content.choose`)"
                :options="componentStore.departmentList"
                label-field="name"
                value-field="id"
                :loading="componentStore.departmentLoading"
                @update:value="onChangeDepartment"
            />
          </n-form-item>
        </div>
        <div class="col-span-4">
          <n-form-item :label="$t(`documentPage.form.position`)" path="contract_date">
            <n-select
                :disabled="!Boolean(store.payload.department_id)"
                v-model:value="store.payload.department_position_id"
                filterable
                :placeholder="$t(`content.choose`)"
                :options="componentStore.departmentPositionList"
                label-field="name"
                value-field="id"
                :loading="componentStore.departmentPositionLoading"
            />
          </n-form-item>
        </div>
        <div class="col-span-4">
          <n-form-item :label="$t(`documentPage.form.position`)" path="contract_date">
            <n-select
                v-model:value="store.payload.position_id"
                filterable
                :placeholder="$t(`content.choose`)"
                :options="componentStore.positionList"
                label-field="name"
                value-field="id"
                :loading="componentStore.positionLoading"
            />
          </n-form-item>
        </div>
        <div class="col-span-4">
          <n-checkbox class="mt-10" v-model:checked="store.payload.position_status">
            <span class="text-xs text-gray-500">{{$t(`documentPage.form.positionStatus`)}}</span>
          </n-checkbox>
        </div>
        <div class="col-span-4">
          <n-form-item :label="$t(`documentPage.form.salary`)" path="contract_date">
            <n-input
                class="w-full"
                type="text"
                :placeholder="$t(`content.enterField`)"
                v-model:value="store.payload.salary"
            >
              <template #suffix>
                {{$t('content.sum')}}
              </template>
            </n-input>
          </n-form-item>
        </div>
        <div class="col-span-4">
          <n-form-item :label="$t(`documentPage.form.group`)" path="contract_date">
            <n-select
                v-model:value="store.payload.group"
                filterable
                :placeholder="$t(`content.choose`)"
                :options="componentStore.groupList"
                label-field="name"
                value-field="id"
                :loading="componentStore.enumLoading"
            />
          </n-form-item>
        </div>
        <div class="col-span-4">
          <n-form-item :label="$t(`documentPage.form.rank`)" path="contract_date">
            <n-select
                v-model:value="store.payload.rank"
                filterable
                :placeholder="$t(`content.choose`)"
                :options="componentStore.rankList"
                label-field="name"
                value-field="id"
                :loading="componentStore.enumLoading"
            />
          </n-form-item>
        </div>
        <div class="col-span-4">
          <n-form-item :label="$t(`documentPage.form.postName`)" path="contract_date">
            <n-input
                class="w-full"
                type="text"
                :placeholder="$t(`content.enterField`)"
                v-model:value="store.payload.post_name"
            />
          </n-form-item>
        </div>
        <div class="col-span-4">
          <n-form-item :label="$t(`documentPage.form.director`)" path="contract_date">
            <n-select
                label-field="id"
                value-field="id"
                v-model:value="store.payload.director_uuid"
                :placeholder="$t(`content.choose`)"
                :options="componentStore.confirmationList"
                :render-label="renderLabel" />
          </n-form-item>
        </div>



      </div>



    </div>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.openVisible(false)" type="error" ghost>
        {{$t('content.cancel')}}
      </n-button>
      <n-button
          @click="onSubmit"
          :loading="store.saveLoading"
          type="primary">
        {{$t('content.save')}}
      </n-button>
    </div>
  </n-form>
</template>

<style scoped>

</style>