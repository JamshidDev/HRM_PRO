<script setup>
  import { UIModal } from '@/components/index.js'
  import { usePdfViewerStore, useApplicationStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const emits = defineEmits(['returned'])
  const store = usePdfViewerStore()
  const applicationStore = useApplicationStore()

  // HR arizani xodimga tuzatish uchun qaytaradi — sabab majburiy.
  const comment = ref(null)
  const tried = ref(false)
  const commentError = computed(() => tried.value && !comment.value?.trim())

  watch(
    () => store.returnVisible,
    (v) => {
      if (!v) return
      comment.value = null
      tried.value = false
    }
  )

  const onSubmit = () => {
    if (!comment.value?.trim()) {
      tried.value = true
      return
    }
    applicationStore._returnToOwner(comment.value.trim(), store.document_id, () => {
      store.returnVisible = false
      $Toast.success(i18n.global.t('applicationPage.returnDone'))
      emits('returned')
    })
  }
</script>

<template>
  <UIModal
    :width="520"
    :visible="store.returnVisible"
    @update:visible="(v) => (store.returnVisible = v)"
    :title="$t('applicationPage.returnTitle')"
  >
    <template #default>
      <div class="w-full flex flex-col gap-4">
        <div class="text-sm text-textColor2 leading-snug">
          {{ $t('applicationPage.returnHint') }}
        </div>
        <div>
          <div class="text-sm font-medium text-textColor1 mb-2">
            {{ $t('applicationPage.returnReason') }}
            <span class="text-fig-text-red">*</span>
          </div>
          <n-input
            id="return-comment"
            class="w-full"
            type="textarea"
            :rows="3"
            :maxlength="500"
            show-count
            :status="commentError ? 'error' : undefined"
            :placeholder="$t('applicationPage.returnPlaceholder')"
            v-model:value="comment"
          />
          <div v-if="commentError" class="mt-1.5 text-xs text-fig-text-red">
            {{ $t('documentPage.signature.rejectCommentRequired') }}
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <n-button
            secondary
            :disabled="applicationStore.modalLoading"
            @click="store.returnVisible = false"
          >
            {{ $t('content.cancel') }}
          </n-button>
          <n-button type="warning" :loading="applicationStore.modalLoading" @click="onSubmit">
            {{ $t('applicationPage.returnBtn') }}
          </n-button>
        </div>
      </div>
    </template>
  </UIModal>
</template>
