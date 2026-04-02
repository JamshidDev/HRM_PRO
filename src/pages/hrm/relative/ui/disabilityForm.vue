<script setup>
  import { ref, watch, computed } from 'vue'
  import { useRelativeStore } from '@/store/modules/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import validationRules from '@/utils/validationRules.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useRelativeStore()
  const formRef = ref(null)

  const emits = defineEmits(['onCancel'])

  const levelOptions = [
    { id: 1, name: t('relativePage.disability.level1') },
    { id: 2, name: t('relativePage.disability.level2') },
    { id: 3, name: t('relativePage.disability.level3') }
  ]

  const rules = computed(() => {
    const baseRules = { ...validationRules.disabilityForm }
    if (!store.disabilityPayload.is_lifelong) {
      baseRules.to = validationRules.common.requiredDateTimeField
    }
    return baseRules
  })

  watch(() => store.disabilityPayload.is_lifelong, (val) => {
    if (val) {
      store.disabilityPayload.to = null
    }
  })

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        if (store.disabilityVisibleType) {
          store._createDisability()
        } else {
          store._updateDisability()
        }
      }
    })
  }

  const onCancel = () => {
    emits('onCancel')
  }

  const onDelete = () => {
    store._deleteDisability()
  }
</script>

<template>
  <div class="overflow-y-auto">
    <n-form ref="formRef" :model="store.disabilityPayload" :rules="rules">
      <n-form-item :label="$t('relativePage.disability.number')" path="number">
        <n-input type="text" v-model:value="store.disabilityPayload.number" />
      </n-form-item>

      <n-form-item :label="$t('relativePage.disability.level')" path="level">
        <n-select
          v-model:value="store.disabilityPayload.level"
          :options="levelOptions"
          label-field="name"
          value-field="id"
        />
      </n-form-item>

      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-6">
          <n-form-item :label="$t('relativePage.disability.from')" path="from">
            <n-date-picker
              class="w-full"
              v-model:value="store.disabilityPayload.from"
              type="date"
              :format="useAppSetting.datePicketFormat"
            />
          </n-form-item>
        </div>
        <div class="col-span-6">
          <n-form-item :label="$t('relativePage.disability.to')" path="to">
            <n-date-picker
              class="w-full"
              v-model:value="store.disabilityPayload.to"
              type="date"
              :format="useAppSetting.datePicketFormat"
              :disabled="store.disabilityPayload.is_lifelong"
            />
          </n-form-item>
        </div>
      </div>

      <div
        class="border border-surface-line rounded-lg p-3 mb-4 cursor-pointer hover:border-primary transition-colors"
        :class="store.disabilityPayload.is_lifelong && 'border-primary bg-primary/5'"
        @click="store.disabilityPayload.is_lifelong = !store.disabilityPayload.is_lifelong"
      >
        <n-checkbox
          :checked="store.disabilityPayload.is_lifelong"
          @update:checked="(v) => store.disabilityPayload.is_lifelong = v"
          @click.stop
        >
          <span class="font-medium">{{ $t('relativePage.disability.lifelong') }}</span>
        </n-checkbox>
        <p class="text-xs text-secondary mt-1 ml-6">
          {{ $t('relativePage.disability.lifelongHint') }}
        </p>
      </div>

      <n-form-item :label="$t('relativePage.disability.comment')" path="comment">
        <n-input
          type="textarea"
          :rows="3"
          v-model:value="store.disabilityPayload.comment"
        />
      </n-form-item>
    </n-form>
  </div>

  <div class="flex justify-between gap-2">
    <n-button
      v-if="!store.disabilityVisibleType"
      type="error"
      :loading="store.disabilityDeleteLoading"
      @click="onDelete"
    >
      {{ $t('content.delete') }}
    </n-button>
    <div v-else></div>
    <div class="flex gap-2">
      <n-button @click="onCancel" type="default" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onSubmit" :loading="store.disabilitySaveLoading" type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </div>
</template>

<style scoped></style>
