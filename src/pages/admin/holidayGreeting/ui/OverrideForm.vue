<script setup>
  import validationRules from '@/utils/validationRules.js'
  import { useHolidayGreetingStore } from '@/store/modules/index.js'
  import ImageUploader from '@/components/ImageUploader/ImageUploader.vue'

  const formRef = ref(null)
  const store = useHolidayGreetingStore()

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        store._overrideUpsert()
      }
    })
  }
</script>

<template>
  <n-form
    ref="formRef"
    :rules="validationRules.holidayGreetingOverride"
    :model="store.overridePayload"
  >
    <n-form-item :label="$t('holidayGreetingPage.overrides.clientKey')" path="client_key">
      <n-input
        v-model:value="store.overridePayload.client_key"
        :disabled="!!store.overrideElementId"
        :placeholder="$t('holidayGreetingPage.overrides.clientKeyPlaceholder')"
      />
    </n-form-item>
    <n-form-item :label="$t('holidayGreetingPage.overrides.text')" path="text">
      <n-input type="textarea" :rows="4" v-model:value="store.overridePayload.text" />
    </n-form-item>
    <n-form-item :label="$t('holidayGreetingPage.overrides.banner')" path="banner">
      <ImageUploader v-model="store.overridePayload.banner" :max-count="1" />
    </n-form-item>
  </n-form>
  <div class="grid grid-cols-2 gap-2 mt-4">
    <n-button @click="store.overrideVisible = false" type="error" ghost>
      {{ $t('content.cancel') }}
    </n-button>
    <n-button @click="onSubmit" :loading="store.overrideSaveLoading" type="primary">
      {{ $t('content.save') }}
    </n-button>
  </div>
</template>
