<script setup>
  import { useRoute } from 'vue-router'
  import { usePdfViewerStore } from '@/store/modules/index.js'
  import { UIModal } from '@/components/index.js'

  const store = usePdfViewerStore()
  const route = useRoute()
  const visible = ref(false)
  const reasonCode = ref(null)
  const comment = ref('')
  // «Rad etish» doim bosiladi (DAS-14206 kabi): bosilganda nima yetishmasa — qizil ramka va sababi ko'rinadi.
  const tried = ref(false)

  const selected = computed(() => store.linkRejectReasons.find((r) => r.code === reasonCode.value))
  const commentRequired = computed(() => !!selected.value?.requires_comment)
  const canSubmit = computed(
    () => !!reasonCode.value && (!commentRequired.value || !!comment.value.trim())
  )

  const open = () => {
    reasonCode.value = null
    comment.value = ''
    tried.value = false
    visible.value = true
  }
  const reasonMissing = computed(() => tried.value && !reasonCode.value)
  const commentMissing = computed(
    () => tried.value && commentRequired.value && !comment.value.trim()
  )

  const onSubmit = () => {
    tried.value = true
    if (!canSubmit.value) return
    store
      ._linkReject(route.query, {
        reason_code: reasonCode.value,
        comment: comment.value.trim() || undefined
      })
      .then(() => (visible.value = false))
      .catch(() => {})
  }

  // «Rad etish» tugmasi SignMethods.vue pastki qatorida; bu yerda faqat oyna.
  defineExpose({ open })
</script>

<template>
  <!-- Boshqa forma oynalari kabi: sarlavhada nima qilinayotgani, ichida oddiy maydonlar,
       pastda «Bekor qilish | Saqlash» teng kenglikda. «Rad etish» so'zi faqat sarlavhada. -->
  <UIModal
    :width="520"
    :visible="visible"
    @update:visible="(v) => (visible = v)"
    :title="$t('documentPage.signature.rejectTitle')"
  >
    <template #default>
      <div class="flex w-full flex-col gap-4">
        <div>
          <div class="mb-2 text-sm font-medium text-textColor1">
            {{ $t('signature.rejectReason') }}
            <span class="text-fig-text-red">*</span>
          </div>
          <n-radio-group v-model:value="reasonCode" class="w-full">
            <div class="flex max-h-[320px] flex-col gap-1.5 overflow-y-auto pr-1">
              <label
                v-for="r in store.linkRejectReasons"
                :key="r.code"
                class="flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 transition-colors"
                :class="
                  reasonCode === r.code
                    ? 'border-primary bg-primary/5'
                    : reasonMissing
                      ? 'border-danger bg-surface-section'
                      : 'border-surface-line bg-surface-section hover:bg-surface-ground'
                "
              >
                <n-radio :value="r.code" />
                <span class="text-sm leading-snug text-textColor1">{{ r.name }}</span>
              </label>
            </div>
          </n-radio-group>
          <p v-if="reasonMissing" class="mt-1.5 text-xs text-danger">
            {{ $t('signature.rejectReasonRequired') }}
          </p>
        </div>
        <div>
          <div class="mb-2 text-sm font-medium text-textColor1">
            {{ $t('content.comment') }}
            <span v-if="commentRequired" class="text-fig-text-red">*</span>
            <span v-else class="text-xs font-normal text-textColor3">
              ({{ $t('documentPage.signature.optional') }})
            </span>
          </div>
          <n-input
            v-model:value="comment"
            type="textarea"
            :rows="3"
            :maxlength="500"
            show-count
            :status="commentMissing ? 'error' : undefined"
            :placeholder="$t('documentPage.signature.rejectReasonPlaceholder')"
          />
          <p v-if="commentMissing" class="mt-1.5 text-xs text-danger">
            {{ $t('documentPage.signature.rejectCommentRequired') }}
          </p>
        </div>
        <div class="flex gap-3 pt-2">
          <n-button
            class="flex-1"
            :disabled="store.linkRejectLoading"
            @click="visible = false"
          >
            {{ $t('content.cancel') }}
          </n-button>
          <n-button
            class="flex-1"
            type="primary"
            :loading="store.linkRejectLoading"
            @click="onSubmit"
          >
            {{ $t('content.save') }}
          </n-button>
        </div>
      </div>
    </template>
  </UIModal>
</template>
