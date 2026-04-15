<script setup>
  import { UIModal, UIUpload } from '@/components/index.js'
  import { useComponentStore } from '@/store/modules/index.js'
  import { Warning24Filled, DocumentCheckmark24Regular, Dismiss24Regular, Checkmark24Regular } from '@vicons/fluent'

  const componentStore = useComponentStore()
  const emits = defineEmits(['onSuccess'])
  const props = defineProps({
    model: {
      type: String,
      required: true
    },
    documentId: {
      type: Number,
      default: null
    }
  })

  const onSubmit = () => {
    const formData = new FormData()
    if (componentStore.files.length > 0) {
      const file = componentStore.files[0].file
      formData.append('file', file)
    }
    formData.append('model', props.model)
    formData.append('document_id', props.documentId)
    componentStore._confirmFile(formData, () => {
      componentStore.fileVisible = false
      emits('onSuccess')
    })
  }
</script>

<template>
  <UIModal :width="520" :title="$t('content.confirmDocument')" v-model:visible="componentStore.fileVisible">
    <div class="flex flex-col gap-4">
      <!-- Warning block -->
      <div class="flex items-start gap-3 p-3 rounded-xl border border-danger/40 bg-danger/5">
        <n-icon size="20" class="text-danger mt-[1px] shrink-0">
          <Warning24Filled />
        </n-icon>
        <span class="text-sm text-danger leading-[1.5]">
          {{ $t('content.confirmDocumentWarning') }}
        </span>
      </div>

      <!-- File upload block -->
      <div class="flex flex-col gap-2 p-4 rounded-xl border border-surface-line bg-surface-ground/20">
        <div class="flex items-center gap-2 mb-1">
          <n-icon size="18" class="text-secondary">
            <DocumentCheckmark24Regular />
          </n-icon>
          <span class="text-sm font-medium text-secondary">{{ $t('content.attachFile') }}</span>
          <span class="text-xs text-secondary/60">({{ $t('content.confirmFileOptional') }})</span>
        </div>
        <p class="text-xs text-secondary leading-[1.5]">{{ $t('content.confirmFileHint') }}</p>
        <UIUpload
          :accept="'.pdf'"
          :multiple="false"
          v-model:files="componentStore.files"
        />
      </div>
    </div>

    <template #footer>
      <div class="grid grid-cols-2 gap-3 pt-2 !mt-10">
        <n-button
          :loading="componentStore.fileLoading"
          @click="componentStore.fileVisible = false"
          type="error"
          ghost
        >
          <template #icon><n-icon><Dismiss24Regular /></n-icon></template>
          {{ $t('content.close') }}
        </n-button>
        <n-button :loading="componentStore.fileLoading" @click="onSubmit" type="success">
          <template #icon><n-icon><Checkmark24Regular /></n-icon></template>
          {{ $t('content.confirm') }}
        </n-button>
      </div>
    </template>
  </UIModal>
</template>
