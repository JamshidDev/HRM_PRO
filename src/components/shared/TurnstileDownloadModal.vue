<script setup>
  import UIModal from '@/components/ui/UIModal.vue'
  import { useTurnstileDownload } from '@/composables/useTurnstileDownload.js'
  import { useAppSetting, validationRules } from '@utils'

  const { state, submit } = useTurnstileDownload()
  const { proxy } = getCurrentInstance()

  const formRef = ref(null)
  const submitBtnRef = ref(null)

  const workerName = computed(() => {
    const w = state.worker
    if (!w) return ''
    return [w.last_name, w.first_name, w.middle_name].filter(Boolean).join(' ')
  })

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (error) return
      const btnEl = submitBtnRef.value?.$el || submitBtnRef.value
      submit(() => proxy.$flyUpload(btnEl))
    })
  }
</script>

<template>
  <UIModal
    v-model:visible="state.visible"
    :title="$t('turnstileDownload.title')"
    :width="420"
  >
    <n-form
      ref="formRef"
      :model="state.payload"
      :rules="validationRules.common"
      class="grid grid-cols-12 gap-x-4"
    >
      <n-form-item class="col-span-12" :label="$t('content.worker')">
        <n-input :value="workerName" readonly />
      </n-form-item>

      <n-form-item
        class="col-span-12"
        :label="$t('content.from')"
        path="from"
        :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-date-picker
          v-model:value="state.payload.from"
          type="date"
          :actions="null"
          :format="useAppSetting.datePicketFormat"
          class="w-full"
        />
      </n-form-item>

      <n-form-item
        class="col-span-12"
        :label="$t('content.to')"
        path="to"
        :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-date-picker
          v-model:value="state.payload.to"
          type="date"
          :actions="null"
          :format="useAppSetting.datePicketFormat"
          class="w-full"
        />
      </n-form-item>

      <div class="col-span-12 grid grid-cols-2 gap-2 mt-8">
        <n-button @click="state.visible = false" type="error" ghost>
          {{ $t('content.cancel') }}
        </n-button>
        <n-button ref="submitBtnRef" @click="onSubmit" :loading="state.loading" type="primary">
          {{ $t('content.download') }}
        </n-button>
      </div>
    </n-form>
  </UIModal>
</template>
