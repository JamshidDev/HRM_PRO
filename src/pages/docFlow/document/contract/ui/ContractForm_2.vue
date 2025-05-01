<script setup>
import Utils from "@/utils/Utils.js"
import {UIStructure, UIUpload} from "@/components/index.js"
import UIDepartment from "@/components/ui/UIDepartment.vue"
import {useComponentStore, useContractStore} from "@/store/modules/index.js"

const store = useContractStore()
const componentStore = useComponentStore()

const onChangeStatus = (v)=>{
  if(!v){
    componentStore._positions()
  }
}

const showCheckBox = computed(()=>{
  return [2,4,5].includes(store.payload.type)
})

const onChangeDepartment = (v)=>{
  store.payload.department_id = v
  componentStore.departmentPositionList = []
  store.payload.department_position_id = null
  componentStore._departmentPosition(v[0].id)
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

</script>

<template>
  <div class="grid grid-cols-12 gap-x-4">
    <div class="col-span-12 border border-dashed p-2 rounded-xl border-surface-line bg-surface-ground mt-4">
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
<!--        <div v-if="showCheckBox" class="col-span-12 flex justify-end">-->
<!--          <n-checkbox v-model:checked="store.payload.position_status" @update:checked="onChangeStatus">-->
<!--            <span class="text-xs text-gray-500">{{$t(`documentPage.form.positionStatus`)}}</span>-->
<!--          </n-checkbox>-->
<!--        </div>-->
<!--        <template v-if="!store.payload.position_status && showCheckBox">-->
<!--          <div class="col-span-4">-->
<!--            <n-form-item :label="$t(`documentPage.form.position`)" path="position_id">-->
<!--              <n-select-->
<!--                  v-model:value="store.payload.position_id"-->
<!--                  filterable-->
<!--                  :placeholder="$t(`content.choose`)"-->
<!--                  :options="componentStore.positionList"-->
<!--                  label-field="name"-->
<!--                  value-field="id"-->
<!--                  :loading="componentStore.positionLoading"-->
<!--              />-->
<!--            </n-form-item>-->
<!--          </div>-->
<!--        </template>-->
        <div class="col-span-12 md:col-span-6">
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
        <div class="col-span-12 md:col-span-6">
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

        <div class="col-span-12 md:col-span-6 lg:col-span-3">
          <n-form-item :label="$t(`documentPage.form.group`)" path="group">
            <n-select
                v-model:value="store.payload.group"
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
        <div class="col-span-12 md:col-span-6 lg:col-span-3">
          <n-form-item :label="$t(`documentPage.form.rank`)" path="rank">
            <n-select
                v-model:value="store.payload.rank"
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
              :path="(store.payload.position_status && (store.payload.type === 2))? 'rate_no':'rate'"
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
                v-model:value="store.payload.rate"
            />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-2">
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
        <div class="col-span-12 md:col-span-6 lg:col-span-2">
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

<!--        <div class="col-span-12">-->
<!--          <n-form-item :label="$t(`documentPage.form.postName`)" path="post_name">-->
<!--            <n-input-->
<!--                class="w-full"-->
<!--                type="text"-->
<!--                :placeholder="$t(`content.enterField`)"-->
<!--                v-model:value="store.payload.post_name"-->
<!--            />-->
<!--          </n-form-item>-->
<!--        </div>-->

      </div>
    </div>

<!--    <div class="col-span-12 border border-dashed p-2 rounded-xl border-surface-line bg-surface-ground mt-4">-->
<!--      <div class="grid grid-cols-12 gap-x-4">-->
<!--        <div class="col-span-12">-->
<!--          <UIUpload v-model:files="store.payload.files" />-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
  </div>
</template>

<style scoped>

</style>