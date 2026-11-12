<script setup>
  // 81 — tarmoq jamoa kelishuvi asosida moddiy yordam: har xodim uchun temir yo'l staji (yil, oy).
  import { useCommandFormStore } from '@/pages/docFlow/document/command/commandFormStore.js'
  import { Dismiss16Regular } from '@vicons/fluent'
  import Utils from '../../../../../utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import { useEmptyFieldMarks } from '../useEmptyFieldMarks.js'

  const store = useCommandFormStore()
  const { t } = i18n.global
  const { showErrors } = useEmptyFieldMarks()

  const DEFAULT_BASE = 'Xodimlar arizasi, “Oʻzbekiston temir yoʻllari” AJ tarmoq jamoa kelishuvi'

  const onRemoveWorker = (id) => {
    store.workerData = store.workerData.filter((v) => v.id !== id)
    store.payload.workers = store.payload.workers.filter((workerId) => workerId !== id)
  }

  // Yil (0–50) va oy (0–11) ixtiyoriy, lekin kamida bittasi 0 dan katta bo'lishi shart.
  const hasExperience = (v) => Number(v.experience_year) > 0 || Number(v.experience_month) > 0
  const isInvalid = (v) => showErrors.value && !hasExperience(v)
  const fullName = (v) => v.worker?.name || Utils.combineFullName(v.worker?.worker)

  const onSubmit = (mainData) => {
    const valid = store.workerData.every(hasExperience)
    showErrors.value = !valid
    if (!valid) {
      $Alert.validation(t('documentPage.command.form.experienceZero'))
      return { data: null, isValid: false }
    }
    return {
      data: {
        ...mainData,
        worker_positions: store.workerData.map((v) => ({
          id: v.id,
          experience_year: Number(v.experience_year) || 0,
          experience_month: Number(v.experience_month) || 0
        })),
        command_additional: { base: store.commandBase || null }
      },
      isValid: true
    }
  }

  defineExpose({ onSubmit })

  onMounted(() => {
    if (!store.commandBase) store.commandBase = DEFAULT_BASE
  })
</script>

<template>
  <div
    v-if="store.workerData.length"
    class="mb-4 rounded-md border border-surface-line bg-surface-ground p-2"
  >
    <div class="mb-2 flex items-center justify-between px-1">
      <span class="text-xs font-medium text-textColor2">
        {{ $t('documentPage.command.form.selectedWorkers') }} · {{ store.workerData.length }}
      </span>
      <div class="hidden @xl:flex items-center gap-2 pr-2.5">
        <span class="w-[110px] text-xs font-medium text-textColor2">
          {{ $t('documentPage.command.form.experienceYear') }}
        </span>
        <span class="w-[110px] text-xs font-medium text-textColor2">
          {{ $t('documentPage.command.form.experienceMonth') }}
        </span>
        <span v-if="!store.fromApplication" class="w-7" />
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <div
        v-for="(item, idx) in store.workerData"
        :key="item.id"
        class="flex flex-col gap-2 rounded-lg border bg-surface-section p-2 transition-colors @xl:flex-row @xl:items-center @xl:gap-3"
        :class="isInvalid(item) ? 'border-fig-text-red' : 'border-surface-line'"
      >
        <div class="flex min-w-0 flex-1 items-center gap-2.5">
          <span
            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fig-chip-brand text-[11px] font-semibold text-fig-chip-brand-text"
          >
            {{ idx + 1 }}
          </span>
          <n-avatar
            round
            :size="36"
            class="shrink-0"
            :src="item.worker?.photo || Utils.noAvailableImage"
            :fallback-src="Utils.noAvailableImage"
          />
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-medium leading-5 text-textColor1" :title="fullName(item)">
              {{ fullName(item) }}
            </div>
            <div
              v-if="item.worker?.position"
              class="truncate text-xs leading-4 text-textColor2"
              :title="item.worker.position"
            >
              {{ item.worker.position }}
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <n-input-number
            class="w-[110px]"
            v-model:value="item.experience_year"
            :min="0"
            :max="50"
            :precision="0"
            :show-button="false"
            :status="isInvalid(item) ? 'error' : undefined"
            placeholder="0"
          >
            <template #suffix>
              <span class="text-xs text-textColor2">{{ $t('documentPage.command.form.experienceYearUnit') }}</span>
            </template>
          </n-input-number>
          <n-input-number
            class="w-[110px]"
            v-model:value="item.experience_month"
            :min="0"
            :max="11"
            :precision="0"
            :show-button="false"
            :status="isInvalid(item) ? 'error' : undefined"
            placeholder="0"
          >
            <template #suffix>
              <span class="text-xs text-textColor2">{{ $t('documentPage.command.form.experienceMonthUnit') }}</span>
            </template>
          </n-input-number>
          <n-button
            v-if="!store.fromApplication"
            quaternary
            circle
            size="small"
            class="remove-btn"
            :aria-label="$t('documentPage.command.form.removeWorker')"
            @click="onRemoveWorker(item.id)"
          >
            <template #icon>
              <n-icon><Dismiss16Regular /></n-icon>
            </template>
          </n-button>
        </div>
      </div>
    </div>
  </div>

  <div
    class="grid grid-cols-12 mb-8 gap-x-4 border border-surface-line p-2 rounded-md bg-surface-ground"
  >
    <div class="col-span-12">
      <n-form-item :show-feedback="false" :label="$t(`documentPage.command.form.base`)" path="base">
        <n-input
          class="w-full"
          type="textarea"
          :autosize="true"
          :rows="1"
          v-model:value="store.commandBase"
          clearable
        />
      </n-form-item>
    </div>
  </div>
</template>

<style scoped>
  .remove-btn {
    color: var(--color-textColor2);
  }
  .remove-btn:hover {
    color: var(--color-fig-text-red);
  }
</style>
