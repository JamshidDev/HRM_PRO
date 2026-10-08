<script setup>
  import { UIModal } from '@/components/index.js'
  import { usePdfViewerStore, useApplicationStore } from '@/store/modules/index.js'

  const store = usePdfViewerStore()
  const applicationStore = useApplicationStore()

  const onSubmit = () => {
    store.applicationVisible = false

    const data = {
      status: store.appButtonType,
      comment: store.applicationComment
    }
    const id = store.document_id
    applicationStore._accept(data, id, 'modalLoading')
  }
</script>

<template>
  <UIModal
    :width="500"
    :visible="store.applicationVisible"
    @update:visible="(v) => (store.applicationVisible = v)"
    :title="
      store.appButtonType ? $t('signature.acceptApplication') : $t('signature.rejectApplication')
    "
  >
    <template #default>
      <div class="w-full">
        <p class="text-sm text-gray-400 mb-4">
          {{
            store.appButtonType
              ? $t('signature.applicationAcceptDesc')
              : $t('signature.applicationRejectDesc')
          }}
        </p>
        <n-form ref="formRef" class="w-full">
          <n-form-item :label="$t('signature.comment')">
            <n-input
              class="w-full"
              type="textarea"
              :rows="4"
              :placeholder="$t('signature.applicationCommentPlaceholder')"
              v-model:value="store.applicationComment"
            />
          </n-form-item>

          <div class="flex justify-end gap-3 mt-2">
            <n-button
              @click="store.applicationVisible = false"
              :disabled="applicationStore.modalLoading"
              secondary
            >
              {{ $t('content.cancel') }}
            </n-button>
            <n-button
              @click="onSubmit"
              :loading="applicationStore.modalLoading"
              :disabled="applicationStore.modalLoading"
              :type="store.appButtonType ? 'success' : 'error'"
            >
              {{ store.appButtonType ? $t('content.confirm') : $t('signature.rejectApplication') }}
            </n-button>
          </div>
        </n-form>
      </div>
    </template>
  </UIModal>
</template>
