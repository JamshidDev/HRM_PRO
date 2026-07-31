<script setup>
  import validationRules from '@/utils/validationRules.js'
  import { useHolidayGreetingStore } from '@/store/modules/index.js'
  import ImageUploader from '@/components/ImageUploader/ImageUploader.vue'
  import Overrides from './Overrides.vue'

  const formRef = ref(null)
  const store = useHolidayGreetingStore()

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
</script>

<template>
  <div style="height: calc(100vh - 140px)" class="overflow-y-auto overflow-x-hidden mb-[20px]">
    <n-form
      class="px-2"
      ref="formRef"
      :rules="validationRules.holidayGreetingPage"
      :model="store.payload"
    >
      <n-form-item :label="$t('holidayGreetingPage.form.name')" path="name">
        <n-input v-model:value="store.payload.name" />
      </n-form-item>
      <n-form-item :label="$t('holidayGreetingPage.form.text')" path="text">
        <n-input type="textarea" :rows="4" v-model:value="store.payload.text" />
      </n-form-item>
      <n-form-item :label="$t('holidayGreetingPage.form.holiday_date')" path="holiday_date">
        <n-date-picker class="w-full" v-model:value="store.payload.holiday_date" type="date" />
      </n-form-item>
      <div class="grid grid-cols-2 gap-4">
        <n-form-item path="is_recurring">
          <div class="flex items-center gap-3">
            <n-switch
              v-model:value="store.payload.is_recurring"
              :checked-value="true"
              :unchecked-value="false"
            />
            <span class="text-sm text-textColor1">{{
              $t('holidayGreetingPage.form.is_recurring')
            }}</span>
          </div>
        </n-form-item>
        <n-form-item path="is_active">
          <div class="flex items-center gap-3">
            <n-switch
              v-model:value="store.payload.is_active"
              :checked-value="true"
              :unchecked-value="false"
            />
            <span class="text-sm text-textColor1">{{
              $t('holidayGreetingPage.form.is_active')
            }}</span>
          </div>
        </n-form-item>
      </div>
      <n-form-item :label="$t('holidayGreetingPage.form.banner')" path="banner">
        <ImageUploader v-model="store.payload.banner" :max-count="1" />
      </n-form-item>
    </n-form>

    <div v-if="!store.visibleType && store.elementId" class="mt-6 px-2">
      <Overrides />
    </div>
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
