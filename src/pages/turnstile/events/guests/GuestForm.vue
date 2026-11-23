<script setup>
  import i18n from '@/i18n/index.js'
  import { useGuestStore } from '@/store/modules/index.js'

  const { t } = i18n.global
  const store = useGuestStore()
  const formRef = ref(null)

  const timeRule = {
    required: true,
    trigger: ['blur', 'change'],
    validator: (_, v) =>
      /^([01]\d|2[0-3]):[0-5]\d$/.test(v ?? '') || new Error(t('rules.requiredField'))
  }
  const rules = computed(() => ({
    pin: {
      required: true,
      trigger: ['blur', 'input'],
      validator: (_, v) => /^\d{14}$/.test(v ?? '') || new Error(t('guestPage.pinRule'))
    },
    work_start: timeRule,
    work_end: {
      ...timeRule,
      validator: (_, v) => {
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(v ?? '')) return new Error(t('rules.requiredField'))
        return v > store.payload.work_start || new Error(t('guestPage.endAfterStart'))
      }
    }
  }))

  const onSubmit = () => {
    formRef.value?.validate((errors) => {
      if (!errors) store._save()
    })
  }
</script>

<template>
  <n-form ref="formRef" :model="store.payload" :rules="rules" class="flex flex-col">
    <n-form-item :label="$t('guestPage.pin')" path="pin">
      <n-input
        v-model:value="store.payload.pin"
        :disabled="!!store.editId"
        :maxlength="14"
        :allow-input="(v) => /^\d*$/.test(v)"
        :placeholder="$t('guestPage.pinPlaceholder')"
      />
    </n-form-item>
    <p v-if="!store.editId" class="-mt-3 mb-3 text-xs text-fig-text-tertiary">
      {{ $t('guestPage.pinHint') }}
    </p>
    <div class="grid grid-cols-2 gap-3">
      <n-form-item :label="$t('guestPage.workStart')" path="work_start">
        <n-time-picker
          class="w-full"
          format="HH:mm"
          value-format="HH:mm"
          :formatted-value="store.payload.work_start"
          @update:formatted-value="(v) => (store.payload.work_start = v)"
        />
      </n-form-item>
      <n-form-item :label="$t('guestPage.workEnd')" path="work_end">
        <n-time-picker
          class="w-full"
          format="HH:mm"
          value-format="HH:mm"
          :formatted-value="store.payload.work_end"
          @update:formatted-value="(v) => (store.payload.work_end = v)"
        />
      </n-form-item>
    </div>
    <n-form-item :label="$t('guestPage.note')" path="note">
      <n-input
        v-model:value="store.payload.note"
        type="textarea"
        :maxlength="500"
        :autosize="{ minRows: 2, maxRows: 4 }"
      />
    </n-form-item>
    <div class="flex justify-end gap-2">
      <n-button type="error" ghost class="w-[120px]" @click="store.visible = false">
        {{ $t('content.cancel') }}
      </n-button>
      <n-button type="primary" class="w-[120px]" :loading="store.saveLoading" @click="onSubmit">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>
