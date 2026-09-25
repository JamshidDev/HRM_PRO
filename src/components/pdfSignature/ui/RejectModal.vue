<script setup>
  import { UIModal } from '@/components/index.js'
  import { usePdfViewerStore, useSignatureStore } from '@/store/modules/index.js'

  const store = usePdfViewerStore()
  const signatureStore = useSignatureStore()
  const emits = defineEmits(['onSuccessEv'])

  // Sabablar backend'dan (so'rov tilida); bittasi tanlanadi, «Boshqa» uchun izoh majburiy.
  const reasons = ref([])
  const reasonsLoading = ref(false)
  const reasonCode = ref(null)

  const selected = computed(() => reasons.value.find((r) => r.code === reasonCode.value))
  const commentRequired = computed(() => !!selected.value?.requires_comment)
  const canSubmit = computed(
    () => !!reasonCode.value && (!commentRequired.value || !!store.documentComment?.trim())
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
    () => store.documentVisible,
    (v) => {
      if (!v) return
      reasonCode.value = null
      loadReasons()
    }
  )

  const onSubmit = () => {
    if (!canSubmit.value) return
    const data = {
      status: 4,
      reason_code: reasonCode.value,
      comment: store.documentComment?.trim() || undefined,
      confirmation_id: store.signatureId,
      model: store.model
    }
    signatureStore._rejectDocument(data, () => {
      store.documentVisible = false
      emits('onSuccessEv')
    })
  }
</script>

<template>
  <UIModal
    :width="520"
    :visible="store.documentVisible"
    @update:visible="(v) => (store.documentVisible = v)"
    :title="$t('documentPage.signature.rejectTitle')"
  >
    <template #default>
      <div class="w-full flex flex-col gap-4">
        <p class="text-sm text-gray-400">
          {{ $t('documentPage.signature.rejectDesc') }}
        </p>

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

        <div>
          <div class="text-sm font-medium text-textColor1 mb-2">
            {{ $t('documentPage.signature.rejectReasonLabel') }}
            <span v-if="commentRequired" class="text-fig-text-red">*</span>
            <span v-else class="text-xs text-textColor3 font-normal">
              ({{ $t('documentPage.signature.optional') }})
            </span>
          </div>
          <n-input
            class="w-full"
            type="textarea"
            :rows="3"
            :maxlength="500"
            show-count
            :status="commentRequired && !store.documentComment?.trim() ? 'warning' : undefined"
            :placeholder="$t('documentPage.signature.rejectReasonPlaceholder')"
            v-model:value="store.documentComment"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <n-button
            secondary
            :disabled="signatureStore.rejectLoading"
            @click="store.documentVisible = false"
          >
            {{ $t('content.cancel') }}
          </n-button>
          <n-button
            type="error"
            :loading="signatureStore.rejectLoading"
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
