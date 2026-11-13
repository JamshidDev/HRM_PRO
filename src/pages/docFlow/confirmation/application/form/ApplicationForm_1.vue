<script setup>
  import { useComponentStore, useConfApplicationStore } from '@/store/modules/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import { UIDepartmentSelect } from '@/components/index.js'

  const store = useConfApplicationStore()
  const componentStore = useComponentStore()

  const onChangeDepartment = (v) => {
    store.department_id = v
    componentStore.departmentPositionList = []
    store.payload.department_position_id = null
    if (v.length > 0) {
      store._allPositions(v[0].id)
    }
  }

</script>

<template>
  <div class="grid grid-cols-12 gap-x-4">
    <div class="col-span-12 pr-3">
      <n-form-item :label="$t(`documentPage.form.department`)">
        <UIDepartmentSelect
          :model-value="store.department_id"
          @update:model-value="onChangeDepartment"
          :organization="store.organization_id"
          source="all"
          return-object
        />
      </n-form-item>
    </div>
    <div class="col-span-12">
      <n-form-item :label="$t(`documentPage.form.position`)" path="department_position_id">
        <n-select
          :disabled="!Boolean(store.department_id)"
          v-model:value="store.payload.department_position_id"
          filterable
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
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
  </div>
</template>

<style scoped></style>
