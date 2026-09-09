<script setup>
  import { UISelect } from '@/components/index.js'
  import validationRules from '@/utils/validationRules.js'
  import Utils from '@/utils/Utils.js'
  const formRef = ref(null)
  import { useComponentStore, useTimesheetStore } from '@/store/modules/index.js'

  const store = useTimesheetStore()
  const componentStore = useComponentStore()

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        if (store.visibleType) {
          store._create()
        } else {
          store._update()
        }
      }
    })
  }

  onMounted(() => {
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  })
</script>

<template>
  <!-- Tabel hujjati korxona-oy: bo'lim tanlanmaydi, u tabel ichida filtr.
       Korxona ro'yxati — struktura API'si (rol doirasi), buyruq formasidagi kabi. -->
  <n-form ref="formRef" :rules="validationRules.common" :model="store.payload">
    <n-form-item
      :label="$t('timesheet.type.organization')"
      path="work_place_id"
      rule-path="requiredNumberField"
    >
      <UISelect
        :options="componentStore.structureList"
        :model-v="store.selectedOrganizations"
        @updateModel="store.setOrganization"
        @defaultValue="store.setOrganization"
        :checked-val="store.structureCheck"
        @updateCheck="(v) => (store.structureCheck = v)"
        v-model:search="componentStore.structureParams.search"
        @onSearch="componentStore._structures"
        :loading="componentStore.structureLoading"
        :multiple="false"
      />
    </n-form-item>

    <div class="grid grid-cols-2 gap-3">
      <n-form-item :label="$t('content.year')" path="year" rule-path="requiredNumberField">
        <n-select
          v-model:value="store.payload.year"
          :options="Utils.yearList"
          label-field="name"
          value-field="id"
        />
      </n-form-item>
      <n-form-item :label="$t('content.month')" path="month" rule-path="requiredNumberField">
        <n-select
          v-model:value="store.payload.month"
          :options="Utils.monthList"
          label-field="name"
          value-field="id"
        />
      </n-form-item>
    </div>

    <div class="pt-2">
      <n-button block @click="onSubmit" :loading="store.saveLoading" type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>

<style scoped></style>
