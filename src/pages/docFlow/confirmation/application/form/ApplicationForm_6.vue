<script setup>
import {useComponentStore, useConfApplicationStore} from "@/store/modules/index.js"
import UIDepartment from "@/components/ui/UIDepartment.vue"
import {useAppSetting} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"

const store = useConfApplicationStore()
const componentStore = useComponentStore()

const onChangeDepartment = (v)=>{
  store.department_id = v
  componentStore.departmentPositionList = []
  store.payload.department_position_id = null
  componentStore._departmentPosition(v[0].id)
}

onMounted(()=>{
  componentStore.depParams.organizations = store.confirmParams.organization_id
  componentStore._departmentTree()
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
      <n-form-item
          :label="$t(`documentPage.form.rate`)"
          path="rate"
      >
        <n-input-number
            :max="1"
            :min="0.1"
            :step="0.1"
            :show-button="false"
            class="w-full"
            type="text"

            :allow-input="Utils.onlyAllowNumber"
            v-model:value="store.payload.rate"
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
      <n-form-item :label="$t(`applicationPage.form.reason`)" path="reason">
        <n-input
            class="w-full"
            type="textarea"

            v-model:value="store.payload.reason"
        />
      </n-form-item>
    </div>
  </div>
</template>

<style scoped>

</style>