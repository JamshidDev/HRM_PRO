<script setup>
import {UIAutoComplete, UIStructure, UIUser} from "@/components/index.js"
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useContractStore, useComponentStore} from "@/store/modules/index.js";
import { NAvatar } from "naive-ui"
import Utils from "@/utils/Utils.js"
import UIDepartment from "@/components/ui/UIDepartment.vue"

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

const onChangeDepartment = (v)=>{
  store.payload.department_id = v
  componentStore.departmentPositionList = []
  store.payload.department_position_id = null
  componentStore._departmentPosition(v[0].id)
}

const onSelectDirector = (v)=>{
  store.payload.director_id =v.length === 2? [v[1]]: v
}

const onChangeStatus = (v)=>{
  if(v){
    componentStore._positions()
  }
}
const onChangeStructure = (v)=>{
  store.payload.organization_id=v
  if(v.length>0){
    componentStore.departmentList = []
    store.payload.department_id = []
    componentStore.depParams.organizations =v[0].id
    componentStore._departmentTree()
  }
}
const onFocusDoc = ()=>{
  componentStore._docExample()
}
const onFocusConf = ()=>{
  componentStore._confirmations()
}




const renderLabel = (option)=>{
  return [
    h(
        'div',
        {
          class:'flex gap-2 my-1 items-center'
        },[
          h(NAvatar,
              {
                class:'',
                src:option.photo,
                'fallback-src':Utils.noAvailableImage,
              },),
            h('div',{ class:'flex flex-col'}, [
              h('div',{ class:'text-xs font-medium text-gray-500'},`${option.last_name}.${option.last_name[0]}.${option.middle_name[0]}`),
              h('div',{ class:'text-xs text-gray-400'},option.position),
            ])
        ]
    ),
  ];
}

const rules = computed(()=>(store.payload.position_status && store.payload.type === 2)? validationRules.contractFromV2 :validationRules.contractFrom)

onMounted(()=>{
  if(componentStore.groupList.length===0){
    componentStore._enums()
  }

})


</script>

<template>
  <n-form
      ref="formRef"
      :rules="rules"
      :model="store.payload"
  >
    <div style="height:calc(100vh - 120px)" class="overflow-y-auto">
      <div class="grid grid-cols-12 gap-x-4">
        <div class="col-span-12 flex justify-center">
          <div class="w-[600px]">
            <template v-if="componentStore.contractPanel">
              <div class="w-full rounded-xl border-surface-line border mb-4 p-1">
                <UIUser :data="componentStore.worker" :short="false"/>
              </div>

            </template>
            <template v-else>
              <UIAutoComplete v-model:pin="store.payload.pin" />
            </template>
          </div>
        </div>


        <div class="col-span-12 border border-dashed p-2 rounded-xl border-gray-200 bg-gray-50">
          <div class="grid grid-cols-12 gap-x-4">
            <div class="col-span-2">
              <n-form-item :label="$t(`documentPage.form.contractNumber`)" path="number">
                <n-input
                    class="w-full"
                    type="text"
                    :placeholder="$t(`content.enterField`)"
                    v-model:value="store.payload.number"
                />
              </n-form-item>
            </div>
            <div class="col-span-4">
              <n-form-item :label="$t(`documentPage.form.type`)" path="type">
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
            <div class="col-span-2">
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
              <n-form-item :label="$t(`documentPage.form.documentExampleId`)" path="document_example_id">
                <n-select
                    @focus="onFocusDoc"
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
          </div>
        </div>
        <div class="col-span-12 border border-dashed p-2 rounded-xl border-gray-200 bg-gray-50 mt-4">
          <div class="grid grid-cols-12 gap-x-4">
            <div class="col-span-12">
              <n-form-item :label="$t(`documentPage.form.organization`)" path="organization_id">
                <UIStructure
                    :modelV="store.payload.organization_id"
                    @updateModel="onChangeStructure"
                    :checkedVal="store.structureCheck"
                    @updateCheck="(v)=>store.structureCheck=v"
                    :multiple="false"
                />
              </n-form-item>
            </div>
            <div v-if="store.payload.type === 2" class="col-span-12 flex justify-end">
              <n-checkbox v-model:checked="store.payload.position_status" @update:checked="onChangeStatus">
                <span class="text-xs text-gray-500">{{$t(`documentPage.form.positionStatus`)}}</span>
              </n-checkbox>
            </div>

            <template v-if="store.payload.position_status && (store.payload.type === 2)">
              <div class="col-span-4">
                <n-form-item :label="$t(`documentPage.form.position`)" path="position_id">
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
            </template>
            <template v-else>
              <div class="col-span-6">
                <n-form-item :label="$t(`documentPage.form.department`)" path="department_id">
                  <UIDepartment
                      :modelV="store.payload.department_id"
                      @updateModel="onChangeDepartment"
                      :checkedVal="store.departmentCheck"
                      @updateCheck="(v)=>store.departmentCheck=v"
                      :multiple="false"
                  />
                </n-form-item>
              </div>
              <div class="col-span-6">
                <n-form-item :label="$t(`documentPage.form.position`)" path="department_position_id">
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
            </template>

            <div class="col-span-4">
              <n-form-item :label="$t(`documentPage.form.group`)" path="group">
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
              <n-form-item :label="$t(`documentPage.form.rank`)" path="rank">
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
            <div class="col-span-2">
              <n-form-item :label="$t(`documentPage.form.salary`)" path="salary">
                <n-input
                    class="w-full"
                    type="text"
                    :placeholder="$t(`content.enterField`)"
                    :allow-input="Utils.onlyAllowNumber"
                    v-model:value="store.payload.salary"
                >
                  <template #suffix>
                    {{$t('content.sum')}}
                  </template>
                </n-input>
              </n-form-item>
            </div>
            <div class="col-span-2">
              <n-form-item :label="$t(`documentPage.form.tableNumber`)" path="table_number">
                <n-input
                    class="w-full"
                    type="text"
                    :placeholder="$t(`content.enterField`)"
                    :allow-input="Utils.onlyAllowNumber"
                    v-model:value="store.payload.table_number"
                />
              </n-form-item>
            </div>
            <div class="col-span-12">
              <n-form-item :label="$t(`documentPage.form.postName`)" path="post_name">
                <n-input
                    class="w-full"
                    type="text"
                    :placeholder="$t(`content.enterField`)"
                    v-model:value="store.payload.post_name"
                />
              </n-form-item>
            </div>

          </div>
        </div>
        <div class="col-span-12 mt-4">
          <n-form-item :label="$t(`documentPage.form.director`)" path="director_id">
            <n-select
                @focus="onFocusConf"
                size="large"
                value-field="id"
                multiple
                v-model:value="store.payload.director_id"
                @update:value="onSelectDirector"
                :placeholder="$t(`content.choose`)"
                :options="componentStore.confirmationList"
                :loading="componentStore.confirmationLoading"
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