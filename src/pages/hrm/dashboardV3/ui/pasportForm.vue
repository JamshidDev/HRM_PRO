<script setup>
  import validationRules from '@/utils/validationRules.js'
  import { useComponentStore, useDashboardStore } from '@/store/modules/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import Utils from '@/utils/Utils.js'
  import { CloudArrowUp24Regular } from '@vicons/fluent'

  const formRef = ref(null)
  const inputFileRef = ref(null)

  const store = useDashboardStore()
  const componentStore = useComponentStore()

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        const formData = new FormData()
        formData.append('worker_id', store.workerId)
        formData.append('file', store.selectedFile)
        formData.append('serial_number', store.passportPayload.serial_number)
        formData.append('address', store.passportPayload.address)
        formData.append('to_date', Utils.timeToZone(store.passportPayload.to_date))
        formData.append('from_date', Utils.timeToZone(store.passportPayload.from_date))
        store._updatePassport(formData)
      }
    })
  }

  const onFile = (v) => {
    inputFileRef.value.click()
  }

  const onUpload = async (v) => {
    store.selectedFile = v.target.files[0]
    store.passportPayload.file = v.target.files[0]?.name || null
  }
</script>

<template>
  <n-form
    ref="formRef"
    :rules="validationRules.common"
    :model="store.passportPayload"
    class="grid grid-cols-12 gap-x-4"
  >
    <n-form-item
      class="col-span-6"
      :label="$t(`createWorkerPage.form.serial_number`)"
      path="serial_number"
      :rule-path="validationRules.rulesNames.requiredStringField"
    >
      <n-input
        class="w-full"
        type="text"
        v-mask="`AA #######`"
        v-model:value="store.passportPayload.serial_number"
      />
    </n-form-item>
    <n-form-item
      class="col-span-6"
      :label="$t(`createWorkerPage.form.passport_address`)"
      path="address"
      :rule-path="validationRules.rulesNames.requiredStringField"
    >
      <n-input class="w-full" type="text" v-model:value="store.passportPayload.address" />
    </n-form-item>
    <n-form-item
      class="col-span-12"
      :label="$t(`content.file`)"
      path="file"
      :rule-path="validationRules.rulesNames.requiredStringField"
    >
      <n-input
        class="w-full"
        type="text"
        v-show="false"
        v-model:value="store.passportPayload.file"
      />
      <n-button @click="onFile()" class="w-full!" ghost>
        <span class="line-clamp-1">
          {{ store.selectedFile ? store.selectedFile?.name : $t('universityPage.form.file') }}
        </span>

        <template #icon>
          <CloudArrowUp24Regular />
        </template>
      </n-button>
      <input @change="onUpload" type="file" accept=".pdf" v-show="false" ref="inputFileRef" />
    </n-form-item>
    <n-form-item
      class="col-span-6"
      :rule-path="validationRules.rulesNames.requiredNumberField"
      :label="$t(`createWorkerPage.form.from_date`)"
      path="from_date"
    >
      <n-date-picker
        class="w-full"
        v-model:value="store.passportPayload.from_date"
        type="date"
        :format="useAppSetting.datePicketFormat"
      />
    </n-form-item>
    <n-form-item
      class="col-span-6"
      :rule-path="validationRules.rulesNames.requiredNumberField"
      :label="$t(`createWorkerPage.form.to_date`)"
      path="to_date"
    >
      <n-date-picker
        class="w-full"
        v-model:value="store.passportPayload.to_date"
        type="date"
        :format="useAppSetting.datePicketFormat"
      />
    </n-form-item>

    <div class="col-span-12 flex justify-between mt-8">
      <n-button @click="store.visible = false" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onSubmit" :loading="store.loadingPassport" type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>
