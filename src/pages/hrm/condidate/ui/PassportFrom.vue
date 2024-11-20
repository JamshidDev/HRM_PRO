<script setup>
import validationRules from "@/utils/validationRules.js"
import {useComponentStore, useCreateWorkerStore} from "@/store/modules/index.js"
import {CloudArrowUp24Regular} from "@vicons/fluent"
const store = useCreateWorkerStore()
const componentStore = useComponentStore()
const formRef = ref(null)

const onSubmit = ()=>{

}

defineExpose({
  onSubmit,
})

</script>

<template>
  <n-form
      class="grid grid-cols-12 gap-x-4"
      ref="formRef"
      :model="store.passport"
  >
    <n-form-item
        class="col-span-4"
        :label="$t(`createWorkerPage.form.serial_number`)"
        path="serial_number">
      <n-input
          class="w-full"
          type="text"
          v-mask="`AA ######`"
          :placeholder="$t(`createWorkerPage.form.serial_number`)"
          v-model:value="store.passport.serial_number"
      />
    </n-form-item>
    <n-form-item
        class="col-span-4"
        :label="$t(`createWorkerPage.form.from_date`)"
        path="from_date">
      <n-date-picker
          class="w-full"
          v-model:value="store.passport.from_date"
          type="date"
          :placeholder="$t(`createWorkerPage.form.from_date`)"
      />
    </n-form-item>
    <n-form-item
        class="col-span-4"
        :label="$t(`createWorkerPage.form.to_date`)"
        path="to_date">
      <n-date-picker
          class="w-full"
          v-model:value="store.passport.to_date"
          type="date"
          :placeholder="$t(`createWorkerPage.form.to_date`)"
      />
    </n-form-item>
    <n-form-item
        class="col-span-4"
        :label="$t(`createWorkerPage.form.passport_address`)"
        path="address">
      <n-input
          class="w-full"
          type="text"
          :placeholder="$t(`createWorkerPage.form.passport_address`)"
          v-model:value="store.passport.address"
      />
    </n-form-item>
    <n-form-item
        class="col-span-4"
        :label="$t(`createWorkerPage.form.passport_file`)"
        path="file">
      <n-button
          class="w-full"
          quaternary>
        {{ $t(`createWorkerPage.form.passport_file`) }}
        <template #icon>
          <CloudArrowUp24Regular/>
        </template>
      </n-button>
    </n-form-item>
  </n-form>
</template>