<script setup>
  import { useDialog } from 'naive-ui'
  import { Save20Regular, Settings20Regular } from '@vicons/fluent'
  import { UIFigBlock, UIProfileButton } from '@/components/index.js'
  import { useDocumentSettingsStore, useAccountStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  // «Hujjat sozlamalari»: orqa sana chegarasi, imzolash muddati va elektron raqam prefiksi (0 — cheklov yo'q).
  const { t } = i18n.global
  const store = useDocumentSettingsStore()
  const accStore = useAccountStore()
  const dialog = useDialog()

  const canWrite = computed(() => accStore.checkPermission(accStore.pn.documentTemplatesWrite))
  const prefixValid = computed(() => /^[A-Z]{2,5}$/.test(store.form.electronic_prefix ?? ''))
  const canSave = computed(
    () => canWrite.value && store.dirty && prefixValid.value && !store.saving && !store.loading
  )
  const sample = computed(() => `${store.form.electronic_prefix || 'UTY'}-482917`)

  const dayHint = (v) =>
    v ? t('documentSettings.daysValue', { n: v }) : t('documentSettings.noLimit')

  const onPrefix = (v) => {
    store.form.electronic_prefix = (v ?? '')
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 5)
  }

  const onSave = () => {
    dialog.warning({
      title: t('documentSettings.confirmTitle'),
      content: t('documentSettings.confirmText'),
      positiveText: t('content.save'),
      negativeText: t('content.cancel'),
      onPositiveClick: () => store._save()
    })
  }

  onMounted(() => {
    store._show()
  })
</script>

<template>
  <UIFigBlock class="ds-card" :watermark="false" :title="$t('documentSettings.title')" :icon="Settings20Regular">
    <n-spin :show="store.loading">
      <div class="ds-grid">
        <div class="ds-field">
          <label class="ds-label">{{ $t('documentSettings.backdate') }}</label>
          <n-input-number
            v-model:value="store.form.backdate_days"
            class="w-full"
            :min="0"
            :max="30"
            :precision="0"
            :disabled="!canWrite"
          >
            <template #suffix>{{ $t('documentSettings.days') }}</template>
          </n-input-number>
          <span class="ds-hint"
            >{{ dayHint(store.form.backdate_days) }} ·
            {{ $t('documentSettings.backdateHint') }}</span
          >
        </div>

        <div class="ds-field">
          <label class="ds-label">{{ $t('documentSettings.signDeadline') }}</label>
          <n-input-number
            v-model:value="store.form.sign_deadline_days"
            class="w-full"
            :min="0"
            :max="30"
            :precision="0"
            :disabled="!canWrite"
          >
            <template #suffix>{{ $t('documentSettings.days') }}</template>
          </n-input-number>
          <span class="ds-hint"
            >{{ dayHint(store.form.sign_deadline_days) }} ·
            {{ $t('documentSettings.signDeadlineHint') }}</span
          >
        </div>

        <div class="ds-field">
          <label class="ds-label">{{ $t('documentSettings.prefix') }}</label>
          <n-input
            :value="store.form.electronic_prefix"
            :status="prefixValid ? undefined : 'error'"
            :maxlength="5"
            :disabled="!canWrite"
            @update:value="onPrefix"
          />
          <span class="ds-hint" :class="{ 'ds-hint--error': !prefixValid }">
            {{
              prefixValid
                ? $t('documentSettings.prefixSample', { sample })
                : $t('documentSettings.prefixInvalid')
            }}
          </span>
        </div>

        <div v-if="canWrite" class="ds-actions">
          <UIProfileButton
            variant="brand"
            :icon="Save20Regular"
            :loading="store.saving"
            :disabled="!canSave"
            @click="onSave"
          >
            {{ $t('content.save') }}
          </UIProfileButton>
        </div>
      </div>
    </n-spin>
  </UIFigBlock>
</template>

<style scoped>
  .ds-card {
    flex: none;
  }

  .ds-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
    gap: 16px;
    align-items: start;
  }

  .ds-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .ds-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--fig-text-secondary);
  }

  .ds-hint {
    font-size: 11px;
    line-height: 16px;
    color: var(--fig-text-secondary);
  }

  .ds-hint--error {
    color: var(--fig-text-red);
  }

  .ds-actions {
    display: flex;
    align-items: flex-end;
    height: 100%;
    padding-bottom: 20px;
  }

  @media (max-width: 900px) {
    .ds-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .ds-actions {
      padding-bottom: 0;
    }
  }
</style>
