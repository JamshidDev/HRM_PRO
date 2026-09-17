<script setup>
  // Xodimning JSHSHIR raqamini tahrirlash — maydon joriy qiymat bilan to'ladi.
  import { UIUser } from '@/components/index.js'
  import { useUserStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useUserStore()

  const PIN_LENGTH = 14

  // Faqat raqam, 14 xonadan oshmasin — paste ham shu yerda kesiladi.
  const onInput = (v) => {
    store.pinValue = String(v ?? '')
      .replace(/\D/g, '')
      .slice(0, PIN_LENGTH)
  }

  const isValid = computed(() => new RegExp(`^\\d{${PIN_LENGTH}}$`).test(store.pinValue ?? ''))
  const isDirty = computed(() => (store.pinValue ?? '') !== (store.pinRow?.worker?.pin ?? ''))

  const error = computed(() => {
    if (!store.pinValue) return t('rules.requiredField')
    if (!isValid.value) return `${PIN_LENGTH} ta raqam bo'lishi kerak`
    return null
  })

  const onSave = () => {
    if (!isValid.value || !isDirty.value) return
    store._updatePin()
  }
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Kimning JSHSHIRi tahrirlanayotgani ko'rinib tursin -->
    <div class="rounded-lg border border-surface-line/50 px-3 py-2">
      <UIUser
        v-if="store.pinRow?.worker"
        :short="false"
        :avatar-clickable="false"
        :data="{
          photo: store.pinRow.worker.photo,
          lastName: store.pinRow.worker.last_name,
          firstName: store.pinRow.worker.first_name,
          middleName: store.pinRow.worker.middle_name,
          position: store.pinRow.organization?.name
        }"
      />
    </div>

    <n-form-item
      :label="$t('userPage.pin')"
      :validation-status="error ? 'error' : undefined"
      :feedback="error ?? undefined"
    >
      <n-input
        :value="store.pinValue"
        :maxlength="PIN_LENGTH"
        :input-props="{ inputmode: 'numeric' }"
        placeholder="31308942720074"
        clearable
        @update:value="onInput"
      />
    </n-form-item>

    <div class="grid grid-cols-2 gap-3">
      <n-button ghost type="error" @click="store.pinVisible = false">
        {{ $t('content.cancel') }}
      </n-button>
      <n-button
        type="primary"
        :loading="store.pinSaveLoading"
        :disabled="!isValid || !isDirty"
        @click="onSave"
      >
        {{ $t('content.save') }}
      </n-button>
    </div>
  </div>
</template>
