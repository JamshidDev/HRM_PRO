<script setup>
import {CloudArrowUp24Regular} from "@vicons/fluent"
import {useCreateWorkerStore} from "@/store/modules/index.js"
import {useAppSetting} from "@/utils/index.js"
import validationRules from "@/utils/validationRules.js"
const store = useCreateWorkerStore()
const inputFileRef = ref(null)


const onUpload = async (v)=>{
  const file =v.target.files[0]
  store.passportFileName =file.name
  store.payload.file =file
}



</script>

<template>
  <div class="grid grid-cols-12 gap-x-4">
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.serial_number`)"
        :rule-path="validationRules.rulesNames.requiredStringField"
        path="serial_number">
      <n-input
          class="w-full"
          type="text"
          v-mask="`AA #######`"

          v-model:value="store.payload.serial_number"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.from_date`)"
        :rule-path="validationRules.rulesNames.requiredDateTimeField"
        path="from_date">
      <n-date-picker
          class="w-full"
          v-model:value="store.payload.from_date"
          type="date"

          :format="useAppSetting.datePicketFormat"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.to_date`)"
        :rule-path="validationRules.rulesNames.requiredDateTimeField"
        path="to_date">
      <n-date-picker
          class="w-full"
          v-model:value="store.payload.to_date"
          type="date"

          :format="useAppSetting.datePicketFormat"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.passport_address`)"
        :rule-path="validationRules.rulesNames.requiredStringField"
        path="passport_address">
      <n-input
          class="w-full"
          type="text"
          v-model:value="store.payload.passport_address"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.passport_file`)"
        path="file">
      <n-button
          @click="$refs.inputFileRef.click()"
          class="w-full truncate"
          quaternary>
        {{ store.passportFileName || $t('content.no-data')}}
        <template #icon>
          <CloudArrowUp24Regular/>
        </template>
      </n-button>
      <input @change="onUpload" type="file" accept=".pdf" v-show="false" ref="inputFileRef" />
    </n-form-item>
  </div>
</template>