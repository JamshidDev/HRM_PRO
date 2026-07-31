<script setup>
  import { UIDConfirm } from '@/components/index.js'
  import { usePdfViewerStore, useSignatureStore } from '@/store/modules/index.js'

  const store = usePdfViewerStore()
  const signatureStore = useSignatureStore()

  const visible = defineModel('visible', { type: Boolean, default: false })

  const emits = defineEmits(['onConfirm'])
</script>

<template>
  <UIDConfirm
    type="warning"
    v-model:visible="visible"
    :save-loading="signatureStore.loading"
    close-btn-text="content.cancel"
    submit-btn-text="content.confirm"
    @on-close="visible = false"
    @on-save="emits('onConfirm')"
  >
    <template #icon><span></span></template>
    <div class="mb-2">
      <span class="block text-lg font-semibold text-textColor1 mb-2">
        {{ $t('documentPage.signature.confirmDocument') }}
      </span>
      <span class="block text-sm text-gray-400">
        {{ $t('documentPage.signature.confirmDocumentDesc', { id: store.document?.document?.file_name }) }}
      </span>
    </div>
    <template #action>
      <div class="grid grid-cols-2 gap-2">
        <n-button class="w-full" type="error" ghost @click="visible = false">
          {{ $t('content.cancel') }}
        </n-button>
        <n-button
          class="w-full"
          type="success"
          :loading="signatureStore.loading"
          @click="emits('onConfirm')"
        >
          {{ $t('content.confirm') }}
        </n-button>
      </div>
    </template>
  </UIDConfirm>
</template>
