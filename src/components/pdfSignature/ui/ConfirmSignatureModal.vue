<script setup>
  import { UIModal } from '@/components/index.js'
  import { usePdfViewerStore, useSignatureStore } from '@/store/modules/index.js'

  const store = usePdfViewerStore()
  const signatureStore = useSignatureStore()

  const visible = defineModel('visible', { type: Boolean, default: false })

  const emits = defineEmits(['onConfirm'])
</script>

<template>
  <UIModal
    :width="460"
    v-model:visible="visible"
    :title="$t('documentPage.signature.confirmDocument')"
  >
    <template #default>
      <div class="w-full">
        <p class="text-sm text-gray-400 mb-4">
          {{ $t('documentPage.signature.confirmDocumentDesc', { id: store.document?.document?.file_name }) }}
        </p>
        <div class="grid grid-cols-2 gap-2">
          <n-button class="w-full" secondary @click="visible = false">
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
      </div>
    </template>
  </UIModal>
</template>
