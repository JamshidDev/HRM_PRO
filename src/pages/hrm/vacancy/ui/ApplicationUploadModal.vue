<script setup>
  import { UIModal } from '@/components/index.js'
  import { useVacancyStore } from '@/store/modules/index.js'
  import { ArrowUpload20Regular, Document20Regular, Delete20Regular, Info20Regular } from '@vicons/fluent'
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

  const currentLevelLabel = computed(() =>
    LEVELS.value.find(l => l.step === store.uploadForm.type)?.label || ''
  )

  const user = computed(() => store.uploadModalApp?.user)
  const canUpload = computed(() => store.uploadForm.file !== null)

  const LEVEL_INFO = computed(() => ({
    3: { title: t('vacancy.upload.interview.title'), text: t('vacancy.upload.interview.text') },
    4: { title: t('vacancy.upload.medical.title'),   text: t('vacancy.upload.medical.text') },
    5: { title: t('vacancy.upload.test.title'),      text: t('vacancy.upload.test.text') },
  }))

  const levelInfo = computed(() => LEVEL_INFO.value[store.uploadForm.type] || null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null
    store.uploadForm.file = file
  }

  const clearFile = () => { store.uploadForm.file = null }

  const formatSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
</script>

<template>
  <UIModal
    :width="460"
    v-model:visible="store.uploadModalVisible"
    :title="$t('vacancy.upload.title')"
    @update:visible="v => !v && store.closeUploadModal()"
  >
    <div class="flex flex-col gap-3">

      <!-- User + level card -->
      <div v-if="user" class="user-card">
        <n-avatar
          :src="user.photo"
          :size="36"
          round
          object-fit="cover"
          class="shrink-0 border border-surface-line"
        />
        <div class="flex flex-col min-w-0 flex-1">
          <span class="text-sm font-semibold text-textColor0 leading-tight truncate">
            {{ user.last_name }} {{ user.first_name }} {{ user.middle_name }}
          </span>
          <span v-if="currentLevelLabel" class="level-badge mt-1">{{ currentLevelLabel }}</span>
        </div>
      </div>

      <!-- Info card -->
      <div v-if="levelInfo" class="info-card">
        <div class="info-icon">
          <n-icon size="14"><Info20Regular /></n-icon>
        </div>
        <div class="flex flex-col gap-0.5 min-w-0">
          <span class="info-title">{{ levelInfo.title }}</span>
          <span class="info-text">{{ levelInfo.text }}</span>
        </div>
      </div>

      <!-- Fayl tanlash -->
      <div>
        <p class="field-label mb-1.5">{{ $t('vacancy.upload.fieldLabel') }} <span class="text-error">*</span></p>

        <div class="upload-card">
          <!-- Fayl tanlangan -->
          <div v-if="store.uploadForm.file" class="upload-card-file">
            <div class="file-icon">
              <n-icon size="15" class="text-primary"><Document20Regular /></n-icon>
            </div>
            <div class="flex flex-col min-w-0 flex-1">
              <span class="text-xs font-semibold text-textColor0 truncate">{{ store.uploadForm.file.name }}</span>
              <span class="text-xs text-textColor3 mt-0.5">{{ formatSize(store.uploadForm.file.size) }}</span>
            </div>
            <n-button size="tiny" type="error" secondary @click="clearFile">
              <template #icon><n-icon><Delete20Regular /></n-icon></template>
              {{ $t('vacancy.removeBtn') }}
            </n-button>
          </div>

          <!-- Fayl tanlanmagan -->
          <label v-else class="upload-card-empty">
            <input type="file" class="hidden" @change="handleFileChange" />
            <div class="drop-icon">
              <n-icon size="18" class="text-textColor3"><ArrowUpload20Regular /></n-icon>
            </div>
            <span class="text-xs font-medium text-textColor1">{{ $t('vacancy.upload.clickToSelect') }}</span>
            <span class="text-xs text-textColor3">{{ $t('vacancy.upload.formats') }}</span>
          </label>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-2 pt-1">
        <n-button @click="store.closeUploadModal()">{{ $t('vacancy.cancelBtn') }}</n-button>
        <n-button
          type="primary"
          :disabled="!canUpload"
          :loading="store.uploadLoading"
          @click="store._uploadFile()"
        >
          {{ $t('vacancy.saveBtn') }}
        </n-button>
      </div>

    </div>
  </UIModal>
</template>

<style scoped>
/* User card */
.user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--surface-section);
  border: 1px solid var(--surface-line, #e5e7eb);
}
.level-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  color: var(--primary-color, #3b82f6);
  background: color-mix(in srgb, var(--primary-color, #3b82f6) 12%, transparent);
  border-radius: 5px;
  padding: 1px 7px;
  align-self: flex-start;
}

/* Info card */
.info-card {
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  background: color-mix(in srgb, var(--primary-color) 8%, var(--surface-section));
  border: 1px solid color-mix(in srgb, var(--primary-color) 20%, var(--surface-line));
  border-radius: 10px;
}
.info-icon {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--primary-color) 15%, var(--surface-section));
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}
.info-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--primary-color);
}
.info-text {
  font-size: 11px;
  color: var(--primary-color);
  line-height: 1.5;
  opacity: 0.85;
}

/* Field label */
.field-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--textColor2);
}

/* Upload card — wrapper */
.upload-card {
  width: 100%;
  height: 90px;
  border: 1.5px dashed var(--surface-line, #e5e7eb);
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.15s;
}

/* Fayl tanlangan holat */
.upload-card-file {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  height: 100%;
  background: var(--surface-section);
}

/* Fayl tanlanmagan holat */
.upload-card-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  height: 100%;
  cursor: pointer;
  text-align: center;
  transition: background 0.15s;
}
.upload-card-empty:hover {
  background: color-mix(in srgb, var(--primary-color) 8%, var(--surface-section));
}
.upload-card:has(.upload-card-empty:hover) {
  border-color: var(--primary-color, #3b82f6);
}
.upload-card:has(.upload-card-file) {
  border-style: solid;
  border-color: var(--surface-line, #e5e7eb);
}
.drop-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: var(--surface-ground);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
  transition: background 0.15s;
}
.upload-card-empty:hover .drop-icon {
  background: color-mix(in srgb, var(--primary-color) 15%, var(--surface-section));
}
.file-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--primary-color) 10%, var(--surface-section));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
