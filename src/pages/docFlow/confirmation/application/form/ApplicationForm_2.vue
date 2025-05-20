<script setup>
import {useComponentStore, useConfApplicationStore} from "@/store/modules/index.js"
import UIDepartment from "@/components/ui/UIDepartment.vue"
import {NAvatar} from "naive-ui"
import Utils from "@/utils/Utils.js"
import {useAppSetting} from "@/utils/index.js"

const store = useConfApplicationStore()
const componentStore = useComponentStore()

const onChangeDepartment = (v)=>{
  store.department_id = v
  componentStore.departmentPositionList = []
  store.payload.department_position_id = null
  componentStore._departmentPosition(v[0].id)
}
const renderLabel2 = (option)=>{
  return [
    h(
        'div',
        {
          class:'flex gap-2 my-1 items-center'
        },[
          h(NAvatar,
              {
                class:'',
                src:option.worker.photo,
                'fallback-src':Utils.noAvailableImage,
              },),
          h('div',{ class:'flex flex-col'}, [
            h('div',{ class:'text-xs font-medium text-gray-500'},`${option.worker.last_name}.${option.worker.last_name[0]}.${option.worker.middle_name[0]}`),
            h('div',{ class:'text-xs text-gray-400'},option.post_name),
          ])
        ]
    ),
  ];
}
const renderValue = ({option})=>{
  return [
    h(
        'div',
        {
          class:'flex gap-2 my-1 items-center'
        },`${option?.worker?.last_name} ${option?.worker?.first_name} ${option?.worker?.middle_name}`),
  ];
}

onMounted(()=>{
  componentStore.depParams.organizations = store.organization_id[0].id
  componentStore._departmentTree()
  store._vacationWorker(store.organization_id[0].id)
})
</script>

<template>
  <div class="grid grid-cols-12 gap-x-4">
    <div class="col-span-12 pr-3">
      <n-form-item :label="$t(`documentPage.form.department`)">
        <UIDepartment
            :modelV="store.department_id"
            @updateModel="onChangeDepartment"
            :checkedVal="store.departmentCheck"
            @updateCheck="(v)=>store.departmentCheck=v"
            :multiple="false"
        />
      </n-form-item>
    </div>
    <div class="col-span-12">
      <n-form-item :label="$t(`documentPage.form.position`)" path="department_position_id">
        <n-select
            :disabled="!Boolean(store.department_id)"
            v-model:value="store.payload.department_position_id"
            filterable

            :options="componentStore.departmentPositionList"
            label-field="name"
            value-field="id"
            :loading="componentStore.departmentPositionLoading"
        />
      </n-form-item>
    </div>
    <div class="col-span-12">
      <n-form-item :label="$t(`applicationPage.form.from_date`)" path="from_date">
        <n-date-picker
            class="w-full"
            v-model:value="store.payload.from_date"
            type="date"

            :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
    <div class="col-span-12">
      <n-form-item :label="$t(`applicationPage.form.temporarily_absent`)" path="temporarily_absent">
        <n-select
            v-model:value="store.payload.temporarily_absent"

            :options="store.vacationWorkerList"
            :loading="store.vacationWorkerLoading"
            :render-label="renderLabel2"
            :render-tag="renderValue"
            label-field="id"
            value-field="id"
        />
      </n-form-item>
    </div>
  </div>
</template>

<style scoped>

</style>