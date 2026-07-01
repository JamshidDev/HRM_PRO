<script setup>
  import { UIModal } from '@/components/index.js'
  import { useVacancyStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import {
    CheckmarkCircle20Regular,
    DismissCircle20Regular,
    Document20Regular,
  } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const store = useVacancyStore()
  const t = i18n.global.t.bind(i18n.global)

  const LEVELS = computed(() => [
    { step: 1, label: t('vacancy.levels.one') },
    { step: 2, label: t('vacancy.levels.two') },
    { step: 3, label: t('vacancy.levels.three') },
    { step: 4, label: t('vacancy.levels.four') },
    { step: 5, label: t('vacancy.levels.five') },
    { step: 6, label: t('vacancy.levels.six') },
  ])

  const levelLabel = computed(() =>
    LEVELS.value.find(l => l.step === store.actionForm.type)?.label || ''
  )

  const user = computed(() => store.actionModalApp?.user)

  const canSubmit = computed(() => store.actionForm.status !== null)

  const setFileStatus = (idx, status) => {
    store.actionForm.details[idx].status = status
  }
</script>

<template>
  <UIModal
    :width="520"
    v-model:visible="store.actionModalVisible"
    :title="`${levelLabel} — ${$t('vacancy.action.evaluateTitle')}`"
    @update:visible="v => !v && store.closeActionModal()"
  >
    <div class="flex flex-col gap-3">

      <!-- Ariza egasi -->
      <div v-if="user" class="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-50 border border-surface-line">
        <n-avatar :src="user.photo || Utils.noAvailableImage" :fallback-src="Utils.noAvailableImage" :size="32" round object-fit="cover" class="shrink-0 border border-surface-line" />
        <div class="flex flex-col min-w-0">
          <span class="text-sm font-semibold text-textColor0 leading-tight truncate">
            {{ user.last_name }} {{ user.first_name }} {{ user.middle_name }}
          </span>
          <span class="text-xs text-textColor3 font-mono">{{ user.pin }}</span>
        </div>
      </div>

      <!-- Baholash card -->
      <div class="eval-card">
        <div class="eval-card-header">
          <div class="eval-card-header-left">
            <span class="eval-card-title">{{ $t('vacancy.action.decision') }}</span>
            <span class="eval-card-hint">{{ $t('vacancy.action.decisionHint') }}</span>
          </div>
          <span class="eval-required">*</span>
        </div>
        <div class="eval-card-body">
          <button
            class="status-btn"
            :class="store.actionForm.status === 2 ? 'status-btn--accept' : 'status-btn--idle'"
            @click="store.actionForm.status = 2"
          >
            <n-icon size="15"><CheckmarkCircle20Regular /></n-icon>
            {{ $t('vacancy.action.accept') }}
          </button>
          <button
            class="status-btn"
            :class="store.actionForm.status === 3 ? 'status-btn--reject' : 'status-btn--idle'"
            @click="store.actionForm.status = 3"
          >
            <n-icon size="15"><DismissCircle20Regular /></n-icon>
            {{ $t('vacancy.action.rejectOption') }}
          </button>
        </div>
      </div>

      <!-- Keyingi bosqichga o'tkazish -->
      <div class="flex items-center justify-between px-3 py-2 rounded-lg border border-surface-line bg-surface-50">
        <div class="flex flex-col gap-0.5">
          <span class="text-xs font-semibold text-textColor0">{{ $t('vacancy.action.nextLevel') }}</span>
          <span class="text-xs text-textColor3">{{ $t('vacancy.action.nextLevelHint') }}</span>
        </div>
        <n-switch v-model:value="store.actionForm.next_level" />
      </div>

      <!-- Fayllar tekshiruvi -->
      <div v-if="store.fileTypesLoading" class="flex justify-center py-3">
        <n-spin :size="18" />
      </div>
      <div v-else-if="store.fileTypes.length" class="flex flex-col gap-1.5">
        <p class="field-label">{{ $t('vacancy.action.docStatus') }}</p>
        <div class="flex flex-col gap-1.5">
          <label
            v-for="(detail, idx) in store.actionForm.details"
            :key="detail.file_type"
            class="file-card"
            :class="detail.status === 2 ? 'file-card--checked' : ''"
          >
            <div class="file-icon-wrap" :class="detail.status === 2 ? 'file-icon-wrap--checked' : ''">
              <n-icon size="13"><Document20Regular /></n-icon>
            </div>
            <span class="file-card-name">
              {{ store.fileTypes.find(ft => ft.id === detail.file_type)?.name || `${$t('vacancy.action.filePrefix')} ${idx + 1}` }}
            </span>
            <span class="file-card-badge" :class="detail.status === 2 ? 'file-card-badge--yes' : 'file-card-badge--no'">
              {{ detail.status === 2 ? $t('vacancy.action.uploaded') : $t('vacancy.action.notUploaded') }}
            </span>
            <n-checkbox
              :checked="detail.status === 2"
              @update:checked="val => setFileStatus(idx, val ? 2 : 3)"
            />
          </label>
        </div>
      </div>

      <!-- Xabar (optional) -->
      <div>
        <p class="field-label mb-1.5">{{ $t('vacancy.action.comment') }} <span class="text-textColor3 font-normal">{{ $t('vacancy.action.commentOptional') }}</span></p>
        <n-input
          v-model:value="store.actionForm.message"
          type="textarea"
          :placeholder="$t('vacancy.action.commentPlaceholder')"
          :rows="2"
        />
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-2 pt-1">
        <n-button @click="store.closeActionModal()">{{ $t('vacancy.cancelBtn') }}</n-button>
        <n-button
          type="primary"
          :disabled="!canSubmit"
          :loading="store.actionLoading"
          @click="store._submitApplicationAction()"
        >
          {{ $t('vacancy.saveBtn') }}
        </n-button>
      </div>

    </div>
  </UIModal>
</template>

<style scoped>
.field-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--textColor2);
}

/* ── Baholash card ── */
.eval-card {
  border: 1px solid var(--surface-line, #e5e7eb);
  border-radius: 10px;
  overflow: hidden;
}
.eval-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  background: var(--surface-ground);
  border-bottom: 1px solid var(--surface-line, #e5e7eb);
}
.eval-card-header-left {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.eval-card-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--textColor0);
}
.eval-card-hint {
  font-size: 11px;
  color: var(--textColor3);
}
.eval-required {
  font-size: 12px;
  color: var(--error-color, #ef4444);
  line-height: 1;
  margin-top: 2px;
}
.eval-card-body {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  background: var(--surface-section);
}

/* Status buttons */
.status-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 7px 12px;
  border-radius: 8px;
  border: 1.5px solid var(--surface-line, #e5e7eb);
  background: var(--surface-section);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--textColor2);
}
.status-btn--idle:hover {
  border-color: var(--primary-color, #3b82f6);
  color: var(--primary-color, #3b82f6);
  background: color-mix(in srgb, var(--primary-color) 8%, var(--surface-section));
}
.status-btn--accept {
  border-color: var(--success-color);
  background: color-mix(in srgb, var(--success-color) 10%, var(--surface-section));
  color: var(--success-color);
  font-weight: 600;
}
.status-btn--reject {
  border-color: var(--danger-color);
  background: color-mix(in srgb, var(--danger-color) 8%, var(--surface-section));
  color: var(--danger-color);
  font-weight: 600;
}

/* File card */
.file-card {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 8px;
  border: 1px solid var(--surface-line, #e5e7eb);
  border-radius: 7px;
  background: var(--surface-section);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  user-select: none;
}
.file-card:hover {
  border-color: var(--textColor3);
  background: var(--surface-ground);
}
.file-card--checked {
  border-color: var(--success-color);
  background: color-mix(in srgb, var(--success-color) 10%, var(--surface-section));
}
.file-icon-wrap {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  background: var(--surface-ground);
  color: var(--textColor3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}
.file-icon-wrap--checked {
  background: color-mix(in srgb, var(--success-color) 15%, var(--surface-section));
  color: var(--success-color);
}
.file-card-name {
  flex: 1;
  font-size: 11px;
  font-weight: 500;
  color: var(--textColor1);
  line-height: 1.3;
}
.file-card-badge {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 600;
  padding: 1px 5px;
  border-radius: 4px;
}
.file-card-badge--yes {
  background: color-mix(in srgb, var(--success-color) 15%, var(--surface-section));
  color: var(--success-color);
}
.file-card-badge--no {
  background: var(--surface-ground);
  color: var(--textColor3);
}
</style>
