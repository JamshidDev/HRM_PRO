<script setup>
  import { UIModal } from '@/components/index.js'
  import { useVacancyStore } from '@/store/modules/index.js'
  import { ClipboardTask20Regular } from '@vicons/fluent'

  const store = useVacancyStore()

  const user = computed(() => store.examResultModalApp?.user)

  const canSubmit = computed(() =>
    store.examResultForm.created !== null &&
    store.examResultForm.ended !== null &&
    store.examResultForm.result !== ''
  )
</script>

<template>
  <UIModal
    :width="460"
    v-model:visible="store.examResultModalVisible"
    title="Natija kiritish"
    @update:visible="v => !v && store.closeExamResultModal()"
  >
    <div class="flex flex-col gap-4">

      <!-- User card -->
      <div v-if="user" class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-50 border border-surface-line">
        <n-avatar :src="user.photo" :size="32" round object-fit="cover" class="shrink-0 border border-surface-line" />
        <div class="flex flex-col min-w-0">
          <span class="text-sm font-semibold text-textColor0 leading-tight truncate">
            {{ user.last_name }} {{ user.first_name }} {{ user.middle_name }}
          </span>
          <span class="result-level-badge mt-1">Offline imtixon</span>
        </div>
      </div>

      <!-- Boshlanish vaqti -->
      <div>
        <p class="result-field-label mb-1.5">Boshlanish vaqti <span class="text-error">*</span></p>
        <n-date-picker
          v-model:value="store.examResultForm.created"
          type="datetime"
          update-value-on-close
          :actions="null"
          style="width: 100%"
        />
      </div>

      <!-- Tugash vaqti -->
      <div>
        <p class="result-field-label mb-1.5">Tugash vaqti <span class="text-error">*</span></p>
        <n-date-picker
          v-model:value="store.examResultForm.ended"
          type="datetime"
          update-value-on-close
          :actions="null"
          style="width: 100%"
        />
      </div>

      <!-- Natija -->
      <div>
        <p class="result-field-label mb-1.5">Natija (ball) <span class="text-error">*</span></p>
        <n-input
          v-model:value="store.examResultForm.result"
          placeholder="Masalan: 85"
          clearable
        />
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-2 pt-1">
        <n-button @click="store.closeExamResultModal()">Bekor qilish</n-button>
        <n-button
          type="primary"
          :disabled="!canSubmit"
          :loading="store.examResultLoading"
          @click="store._submitExamResult()"
        >
          <template #icon><n-icon><ClipboardTask20Regular /></n-icon></template>
          Saqlash
        </n-button>
      </div>

    </div>
  </UIModal>
</template>

<style scoped>
.result-level-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  color: #059669;
  background: #d1fae5;
  border-radius: 5px;
  padding: 1px 7px;
  align-self: flex-start;
}
.result-field-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-color-2, #6b7280);
}
</style>
