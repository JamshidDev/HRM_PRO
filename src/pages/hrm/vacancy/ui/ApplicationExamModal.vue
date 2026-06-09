<script setup>
  import { UIModal, SuperSelect } from '@/components/index.js'
  import { useVacancyStore } from '@/store/modules/index.js'
  import { BookSearch20Regular, ClipboardTask20Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const store = useVacancyStore()
  const t = i18n.global.t.bind(i18n.global)

  const user = computed(() => store.examModalApp?.user)

  const activeTab = ref('online')

  const selectedExamId = ref(null)

  watch(() => store.examModalVisible, (v) => {
    if (v) {
      selectedExamId.value = null
      activeTab.value = 'online'
      store.examResultForm.created = null
      store.examResultForm.ended = null
      store.examResultForm.result = ''
    }
  })

  const canAttach = computed(() => selectedExamId.value !== null)

  const canSubmitResult = computed(() =>
    store.examResultForm.created !== null &&
    store.examResultForm.ended !== null &&
    store.examResultForm.result !== ''
  )

  const examOptions = computed(() =>
    store.examList.map(e => ({
      id: e.id,
      name: e.name,
      position: e.topic?.name || '',
      subPosition: e.topic?.type?.name || '',
    }))
  )

  const handleSubmitOffline = () => {
    store.examResultModalApp = store.examModalApp
    store._submitExamResult()
  }
</script>

<template>
  <UIModal
    :width="480"
    v-model:visible="store.examModalVisible"
    :title="$t('vacancy.exam.modalTitle')"
    @update:visible="v => !v && store.closeExamModal()"
  >
    <div class="flex flex-col gap-4">

      <!-- User card -->
      <div v-if="user" class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-50 border border-surface-line">
        <n-avatar :src="user.photo" :size="32" round object-fit="cover" class="shrink-0 border border-surface-line" />
        <div class="flex flex-col min-w-0">
          <span class="text-sm font-semibold text-textColor0 leading-tight truncate">
            {{ user.last_name }} {{ user.first_name }} {{ user.middle_name }}
          </span>
          <span class="exam-level-badge mt-1">{{ $t('vacancy.exam.onlineBadge') }}</span>
        </div>
      </div>

      <!-- Tablar -->
      <n-tabs v-model:value="activeTab" type="line" animated>

        <!-- Onlayn tab -->
        <n-tab-pane name="online" :tab="$t('vacancy.exam.onlineTab')">
          <div class="flex flex-col gap-3 pt-2">
            <SuperSelect
              v-model:value="selectedExamId"
              :options="examOptions"
              :loading="store.examLoading"
              :clearable="true"
              placeholder="content.choose"
              style="width: 100%"
            />
            <div class="flex justify-end gap-2 pt-1">
              <n-button @click="store.closeExamModal()">{{ $t('vacancy.cancelBtn') }}</n-button>
              <n-button
                type="primary"
                :disabled="!canAttach"
                :loading="store.attachingExamId !== null"
                @click="store._attachExam(selectedExamId)"
              >
                <template #icon><n-icon><BookSearch20Regular /></n-icon></template>
                {{ $t('vacancy.saveBtn') }}
              </n-button>
            </div>
          </div>
        </n-tab-pane>

        <!-- Offline tab -->
        <n-tab-pane name="offline" :tab="$t('vacancy.exam.offlineTab')">
          <div class="flex flex-col gap-3 pt-2">
            <div>
              <p class="field-label mb-1.5">{{ $t('vacancy.exam.startTime') }} <span class="text-error">*</span></p>
              <n-date-picker
                v-model:value="store.examResultForm.created"
                type="datetime"
                update-value-on-close
                :actions="null"
                style="width: 100%"
              />
            </div>
            <div>
              <p class="field-label mb-1.5">{{ $t('vacancy.exam.endTime') }} <span class="text-error">*</span></p>
              <n-date-picker
                v-model:value="store.examResultForm.ended"
                type="datetime"
                update-value-on-close
                :actions="null"
                style="width: 100%"
              />
            </div>
            <div>
              <p class="field-label mb-1.5">{{ $t('vacancy.exam.result') }} <span class="text-error">*</span></p>
              <n-input
                v-model:value="store.examResultForm.result"
                :placeholder="$t('vacancy.exam.resultPlaceholder')"
                clearable
              />
            </div>
            <div class="flex justify-end gap-2 pt-1">
              <n-button @click="store.closeExamModal()">{{ $t('vacancy.cancelBtn') }}</n-button>
              <n-button
                type="primary"
                :disabled="!canSubmitResult"
                :loading="store.examResultLoading"
                @click="handleSubmitOffline()"
              >
                <template #icon><n-icon><ClipboardTask20Regular /></n-icon></template>
                {{ $t('vacancy.saveBtn') }}
              </n-button>
            </div>
          </div>
        </n-tab-pane>

      </n-tabs>

    </div>
  </UIModal>
</template>

<style scoped>
.exam-level-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  color: var(--primary-color, #3b82f6);
  background: color-mix(in srgb, var(--primary-color, #3b82f6) 12%, transparent);
  border-radius: 5px;
  padding: 1px 7px;
  align-self: flex-start;
}
.field-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--textColor2);
}
</style>
