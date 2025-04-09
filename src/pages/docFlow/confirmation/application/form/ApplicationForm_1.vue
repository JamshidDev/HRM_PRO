<script setup>
import {useComponentStore, useConfApplicationStore} from "@/store/modules/index.js"
import {useAppSetting} from "@/utils/index.js"
import {UISelect} from "@/components/index.js"

const store = useConfApplicationStore()
const componentStore = useComponentStore()

const onChangeDepartment = (v)=>{
  store.department_id = v
  componentStore.departmentPositionList = []
  store.payload.department_position_id = null
  if(v.length>0){
    store._allPositions(v[0].id)
  }

}


onMounted(()=>{
  const id = store.organization_id?.[0]?.id
  componentStore._allDepartmentTree(id)
})
</script>

<template>
  <div class="grid grid-cols-12 gap-x-4">
    <div class="col-span-12 pr-3">
      <n-form-item :label="$t(`documentPage.form.department`)">
        <UISelect
            :options="componentStore.allDepartmentTrees"
            :modelV="store.department_id"
            @updateModel="onChangeDepartment"
            :checkedVal="store.departmentCheck"
            @updateCheck="(v)=>store.departmentCheck=v"
            :multiple="false"
            :loading="componentStore.allDepartmentLoading"
        />
      </n-form-item>
    </div>
    <div class="col-span-12">
      <n-form-item :label="$t(`documentPage.form.position`)" path="department_position_id">
        <n-select
            :disabled="!Boolean(store.department_id)"
            v-model:value="store.payload.department_position_id"
            filterable
            :placeholder="$t(`content.choose`)"
            :options="store.allPositions"
            label-field="name"
            value-field="id"
            :loading="store.allPositionLoading"
        />
      </n-form-item>
    </div>
    <div class="col-span-12">
      <n-form-item :label="$t(`applicationPage.form.from_date`)" path="from_date">
        <n-date-picker
            class="w-full"
            v-model:value="store.payload.from_date"
            type="date"
            :placeholder="$t(`content.choose`)"
            :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
  </div>
</template>

<style scoped>

</style>