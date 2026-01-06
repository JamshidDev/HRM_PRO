<script setup>
  import validationRules from '@/utils/validationRules.js'
  const formRef = ref(null)
  import { useSpecialReportStore } from '@/store/modules/hrm/specialReportStore'
  import UISelect from '@/components/ui/UISelect.vue'
  import { useComponentStore } from '@/store/modules'

  const store = useSpecialReportStore()
  const componentStore = useComponentStore()

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        store._exportRequest()
      }
    })
  }
</script>

<template>
  <n-form ref="formRef" :model="store.payload" :show-label="false">
    <n-form-item path="organizations" rule-path="requiredMultiSelectField">
      <div class="w-full">
        <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{
          $t('actionLog.table.structure')
        }}</label>
        <u-i-select
          :options="componentStore.structureList"
          :modelV="store.payload.organizations"
          @defaultValue="(v) => (store.payload.organizations = v)"
          @updateModel="(v) => (store.payload.organizations = v)"
          :checkedVal="store.structureCheck"
          @updateCheck="(v) => (store.structureCheck = v)"
          :loading="componentStore.structureLoading"
          v-model:search="componentStore.structureParams.search"
          @onSearch="componentStore._structures"
        />
      </div>
    </n-form-item>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.visible = false" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onSubmit" :loading="store.saveLoading" type="primary" v-fly-upload>
        {{ $t('content.create') }}
      </n-button>
    </div>
  </n-form>
</template>

<style scoped></style>
