<script setup>
  import { useRoute } from 'vue-router'
  import { usePdfViewerStore } from '@/store/modules/index.js'
  import { UIModal } from '@/components/index.js'

  const store = usePdfViewerStore()
  const route = useRoute()
  const visible = ref(false)
  const reasonCode = ref(null)
  const comment = ref('')

  const selected = computed(() => store.linkRejectReasons.find((r) => r.code === reasonCode.value))
  const commentRequired = computed(() => !!selected.value?.requires_comment)
  const canSubmit = computed(
    () => !!reasonCode.value && (!commentRequired.value || !!comment.value.trim())
  )

  const open = () => {
    reasonCode.value = null
    comment.value = ''
    visible.value = true
  }
  const onSubmit = () => {
    store
      ._linkReject(route.query, {
        reason_code: reasonCode.value,
        comment: comment.value.trim() || undefined
      })
      .then(() => (visible.value = false))
      .catch(() => {})
  }
</script>

<template>
  <div class="mt-6 flex justify-center">
    <n-button type="error" secondary @click="open">
      {{ $t('documentPage.signature.rejectTitle') }}
    </n-button>
  </div>
  <UIModal
    :width="520"
    :visible="visible"
    @update:visible="(v) => (visible = v)"
    :title="$t('documentPage.signature.rejectTitle')"
  >
    <template #default>
      <div class="w-full flex flex-col gap-4">
        <div>
          <div class="text-sm font-medium text-textColor1 mb-2">
            {{ $t('documentPage.signature.rejectReasonSelect') }}
            <span class="text-fig-text-red">*</span>
          </div>
          <n-radio-group v-model:value="reasonCode" class="w-full">
            <div class="flex flex-col gap-1.5 max-h-[320px] overflow-y-auto pr-1">
              <label
                v-for="r in store.linkRejectReasons"
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
            type="textarea"
            :rows="3"
            :maxlength="500"
            show-count
            :status="commentRequired && !comment.trim() ? 'warning' : undefined"
            :placeholder="$t('documentPage.signature.rejectReasonPlaceholder')"
            v-model:value="comment"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <n-button secondary :disabled="store.linkRejectLoading" @click="visible = false">
            {{ $t('content.cancel') }}
          </n-button>
          <n-button
            type="error"
            :loading="store.linkRejectLoading"
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
