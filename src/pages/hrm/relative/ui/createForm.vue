<script setup>
  import validationRules from '@/utils/validationRules.js'
  const formRef = ref(null)
  import { useRelativeStore, useComponentStore } from '@/store/modules/index.js'
  import { useAppSetting } from '@/utils/index.js'

  const store = useRelativeStore()
  const componentStore = useComponentStore()

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        store.saveLoading = true
        if (store.visibleType) {
          store.payload.worker_id = null
          store._create()
        } else {
          store._update()
        }
      }
    })
  }

  const rules = validationRules.relativePage

  onMounted(() => {
    if (componentStore.maritalList.length === 0) {
      componentStore._enums()
    }
  })
</script>

<template>
  <div style="height: calc(100vh - 120px)" class="overflow-y-auto">
    <n-form ref="formRef" :rules="rules" :model="store.payload">
      <n-form-item :label="$t(`relativePage.form.relative`)" path="relative">
        <n-select
          v-model:value="store.payload.relative"
          filterable
          :options="componentStore.relativesList"
          label-field="name"
          value-field="id"
          :loading="componentStore.enumLoading"
        />
      </n-form-item>
      <n-form-item :label="$t(`createWorkerPage.form.pin`)" path="pin">
        <n-input
          v-mask="`####-####-####-##`"
          v-model:value="store.payload.pin"
          placeholder="####-####-####-##"
        />
      </n-form-item>
      <n-form-item :label="$t(`createWorkerPage.form.lastName`)" path="last_name">
        <n-input type="text" v-model:value="store.payload.last_name" />
      </n-form-item>
      <n-form-item :label="$t(`createWorkerPage.form.firstName`)" path="first_name">
        <n-input type="text" v-model:value="store.payload.first_name" />
      </n-form-item>
      <n-form-item :label="$t(`createWorkerPage.form.middleName`)" path="middle_name">
        <n-input type="text" v-model:value="store.payload.middle_name" />
      </n-form-item>
      <n-form-item :label="$t(`createWorkerPage.form.birthday`)" path="birthday">
        <n-date-picker
          class="w-full"
          v-model:value="store.payload.birthday"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
      <n-form-item :label="$t(`relativePage.form.post_name`)" path="post_name">
        <n-input type="text" v-model:value="store.payload.post_name" />
      </n-form-item>
      <n-form-item :label="$t(`relativePage.form.birth_place`)" path="birth_place">
        <n-input type="text" v-model:value="store.payload.birth_place" />
      </n-form-item>
      <n-form-item :label="$t(`createWorkerPage.form.address`)" path="address">
        <n-input type="text" v-model:value="store.payload.address" />
      </n-form-item>
    </n-form>
  </div>
  <div class="grid grid-cols-2 gap-2">
    <n-button @click="store.openVisible(false)" type="error" ghost>
      {{ $t('content.cancel') }}
    </n-button>
    <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
      {{ $t('content.save') }}
    </n-button>
  </div>
</template>

<style scoped></style>
