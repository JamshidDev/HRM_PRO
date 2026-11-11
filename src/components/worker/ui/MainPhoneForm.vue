<script setup>
  // Asosiy (login) telefon raqamini almashtirish — arxiv va admin «Foydalanuvchilar» uchun umumiy.
  import { UIUser } from '@/components/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const props = defineProps({
    worker: { type: Object, default: null },
    subtitle: { type: String, default: '' },
    phone: { type: [String, Number], default: '' },
    loading: { type: Boolean, default: false }
  })
  const emits = defineEmits(['save', 'cancel'])

  const PHONE_LENGTH = 9
  // Kodsiz 9 xona: «998941821126» yoki «+998 94 …» kiritilsa ham oxirgi 9 raqam olinadi.
  const normalize = (v) => {
    const digits = String(v ?? '').replace(/\D/g, '')
    return digits.length > PHONE_LENGTH && digits.startsWith('998') ? digits.slice(3) : digits.slice(0, PHONE_LENGTH)
  }

  const value = ref(normalize(props.phone))
  const initial = normalize(props.phone)

  const isValid = computed(() => new RegExp(`^\\d{${PHONE_LENGTH}}$`).test(value.value))
  const isDirty = computed(() => value.value !== initial)
  const error = computed(() => {
    if (!value.value) return t('rules.requiredField')
    return isValid.value ? null : t('mainPhone.invalid')
  })

  const onSave = () => {
    if (!isValid.value || !isDirty.value) return
    emits('save', value.value)
  }
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-if="worker" class="rounded-lg border border-surface-line/50 px-3 py-2">
      <UIUser
        :short="false"
        :avatar-clickable="false"
        :data="{
          photo: worker.photo,
          lastName: worker.last_name,
          firstName: worker.first_name,
          middleName: worker.middle_name,
          position: subtitle
        }"
      />
    </div>

    <n-form-item
      :label="$t('mainPhone.label')"
      :validation-status="error ? 'error' : undefined"
      :feedback="error ?? undefined"
    >
      <n-input
        :value="value"
        :input-props="{ inputmode: 'numeric' }"
        placeholder="941821126"
        clearable
        @update:value="(v) => (value = normalize(v))"
      >
        <template #prefix>+998</template>
      </n-input>
    </n-form-item>
    <p class="-mt-2 text-xs text-secondary">{{ $t('mainPhone.hint') }}</p>

    <div class="grid grid-cols-2 gap-3">
      <n-button ghost type="error" @click="emits('cancel')">{{ $t('content.cancel') }}</n-button>
      <n-button type="primary" :loading="loading" :disabled="!isValid || !isDirty" @click="onSave">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </div>
</template>
