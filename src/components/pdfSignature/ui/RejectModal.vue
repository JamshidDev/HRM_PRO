<script setup>
  import { UIModal } from '@/components/index.js'
  import { usePdfViewerStore, useSignatureStore } from '@/store/modules/index.js'

  const store = usePdfViewerStore()
  const signatureStore = useSignatureStore()

  const emits = defineEmits(['onSuccessEv'])

  const isValid = computed(() => (store.documentComment || '').trim().length >= 10)

  const onSubmit = () => {
    if (!isValid.value) return
    store.documentVisible = false
    const data = {
      status: 4,
      comment: store.documentComment,
      confirmation_id: store.signatureId,
      model: store.model
    }
    signatureStore._rejectDocument(data, () => {
      emits('onSuccessEv')
    })
  }
</script>

<template>
  <UIModal
    :width="500"
    :visible="store.documentVisible"
    @update:visible="(v) => (store.documentVisible = v)"
    :title="$t('documentPage.signature.rejectTitle')"
  >
    <template #default>
      <div class="w-full px-2">
        <p class="text-sm text-gray-400 mb-4">
          {{ $t('documentPage.signature.rejectDesc') }}
        </p>
        <n-form ref="formRef" class="w-full">
          <n-form-item :label="$t('documentPage.signature.rejectReasonLabel')">
            <n-input
              class="w-full"
              type="textarea"
              :rows="4"
              :placeholder="$t('documentPage.signature.rejectReasonPlaceholder')"
              v-model:value="store.documentComment"
              :status="!isValid && store.documentComment ? 'error' : undefined"
            />
          </n-form-item>
          <p v-if="!isValid" class="text-xs text-error -mt-2 mb-2">
            {{ $t('documentPage.signature.rejectReasonRequired') }}
          </p>

          <div class="grid grid-cols-12 gap-4 mt-2">
            <div class="col-span-6">
              <n-button
                @click="store.documentVisible = false"
                :loading="signatureStore.rejectLoading"
                type="error"
                style="width: 100%"
                ghost
              >
                {{ $t('content.cancel') }}
              </n-button>
            </div>
            <div class="col-span-6">
              <n-button
                style="width: 100%"
                @click="onSubmit"
                :loading="signatureStore.rejectLoading"
                :disabled="!isValid"
                type="primary"
              >
                {{ $t('documentPage.signature.rejectSubmit') }}
              </n-button>
            </div>
          </div>
        </n-form>
      </div>
    </template>
  </UIModal>
</template>
