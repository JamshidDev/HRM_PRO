<script setup>
  import { UIModal } from '@/components/index.js'
  import { usePdfViewerStore, useApplicationStore } from '@/store/modules/index.js'

  const emits = defineEmits(['rejected'])
  const store = usePdfViewerStore()
  const applicationStore = useApplicationStore()

  // HR arizani rad etadi: sabab tanlanadi, «Boshqa» (`requires_comment`) bo'lsa izoh maydoni chiqadi va majburiy.
  const reasons = ref([])
  const reasonsLoading = ref(false)
  const reasonCode = ref(null)

  const selected = computed(() => reasons.value.find((r) => r.code === reasonCode.value))
  const commentRequired = computed(() => !!selected.value?.requires_comment)
  const canSubmit = computed(
    () => !!reasonCode.value && (!commentRequired.value || !!store.applicationComment?.trim())
  )

  const loadReasons = () => {
    if (reasons.value.length) return
    reasonsLoading.value = true
    $ApiService.documentService
      ._rejectReasons()
      .then((res) => {
        reasons.value = res.data.data || []
      })
      .finally(() => {
        reasonsLoading.value = false
      })
  }

  watch(
    () => store.applicationVisible,
    (v) => {
      if (!v) return
      reasonCode.value = null
      store.applicationComment = null
      loadReasons()
    }
  )

  const onSubmit = () => {
    if (!canSubmit.value) return
    const data = {
      status: false,
      reason_code: reasonCode.value,
      comment: commentRequired.value ? store.applicationComment?.trim() : undefined
    }
    applicationStore._accept(data, store.document_id, 'modalLoading', () => {
      store.applicationVisible = false
      emits('rejected')
    })
  }
</script>

<template>
  <UIModal
    :width="520"
    :visible="store.applicationVisible"
    @update:visible="(v) => (store.applicationVisible = v)"
    :title="$t('signature.rejectApplication')"
  >
    <template #default>
      <div class="w-full flex flex-col gap-4">
        <div>
          <div class="text-sm font-medium text-textColor1 mb-2">
            {{ $t('documentPage.signature.rejectReasonSelect') }}
            <span class="text-fig-text-red">*</span>
          </div>
          <n-spin :show="reasonsLoading">
            <n-radio-group v-model:value="reasonCode" class="w-full">
              <div class="flex flex-col gap-1.5 max-h-[320px] overflow-y-auto pr-1">
                <label
                  v-for="r in reasons"
                  :key="r.code"
                  class="flex items-center gap-2.5 rounded-xl border px-3 py-2 cursor-pointer transition-colors"
                  :class="
                    reasonCode === r.code
                      ? 'border-fig-red bg-fig-red-50'
                      : 'border-surface-line bg-surface-section hover:bg-surface-ground'
                  "
                >
                  <n-radio :value="r.code" />
                  <span class="text-sm text-textColor1 leading-snug">{{ r.name }}</span>
                </label>
              </div>
            </n-radio-group>
          </n-spin>
        </div>

        <div v-if="commentRequired">
          <div class="text-sm font-medium text-textColor1 mb-2">
            {{ $t('documentPage.signature.rejectReasonLabel') }}
            <span class="text-fig-text-red">*</span>
          </div>
          <n-input
            class="w-full"
            type="textarea"
            :rows="3"
            :maxlength="500"
            show-count
            :status="!store.applicationComment?.trim() ? 'warning' : undefined"
            :placeholder="$t('documentPage.signature.rejectReasonPlaceholder')"
            v-model:value="store.applicationComment"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <n-button
            secondary
            :disabled="applicationStore.modalLoading"
            @click="store.applicationVisible = false"
          >
            {{ $t('content.cancel') }}
          </n-button>
          <n-button
            type="error"
            :loading="applicationStore.modalLoading"
            :disabled="!canSubmit"
            @click="onSubmit"
          >
            {{ $t('documentPage.signature.rejectSubmit') }}
          </n-button>
        </div>
      </div>
    </template>
  </UIModal>
</template>
