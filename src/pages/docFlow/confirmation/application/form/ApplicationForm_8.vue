<script setup>
import {useComponentStore, useConfApplicationStore} from "@/store/modules/index.js"

const store = useConfApplicationStore()
const componentStore = useComponentStore()


</script>

<template>
  <div class="grid grid-cols-12 gap-x-4">
    <div class="col-span-12">
      <n-form-item :label="$t(`applicationPage.form.education_type`)" path="education_type">
        <n-select
            v-model:value="store.payload.education_type"
            filterable
            :placeholder="$t(`content.choose`)"
            :options="componentStore.educationTypes"
            label-field="name"
            value-field="id"
            :loading="componentStore.workerApplicationLoading"
        />
      </n-form-item>
    </div>
    <div class="col-span-6">
      <n-form-item :label="$t(`applicationPage.form.univer_number`)" path="univer_number">
        <n-input
            class="w-full"
            type="text"
            :placeholder="$t(`content.enterField`)"
            v-model:value="store.payload.univer_number"
        />
      </n-form-item>
    </div>
    <div class="col-span-6">
      <n-form-item :label="$t(`applicationPage.form.univer_date`)" path="univer_date">
        <n-date-picker
            class="w-full"
            v-model:value="store.payload.univer_date"
            type="date"
            :placeholder="$t(`content.choose`)"
        />
      </n-form-item>
    </div>
  </div>
</template>