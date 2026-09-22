<script setup>
  import { useSickLeaveStore, SICK_LEAVE_CLOSE_TYPE } from '@/store/modules/index.js'
  import { DocumentPdf24Regular } from '@vicons/fluent'
  import CloseTypePicker from './CloseTypePicker.vue'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useSickLeaveStore()

  const withDocument = computed(
    () => store.closePayload.close_type === SICK_LEAVE_CLOSE_TYPE.withDocument
  )

  // Kalendar: boshlanish sanasidan oldingi va 14 kundan narigi kunlar yopiq.
  const toDisabled = (ts) => {
    if (!store.closeFrom) return false
    const from = new Date(`${store.closeFrom}T00:00:00`).getTime()
    return ts < from || ts > from + 13 * 86400000
  }

  const onFileChange = ({ file }) => {
    store.closePayload.file = file?.file ?? null
  }

  const onSubmit = () => {
    const p = store.closePayload
    if (!p.to_date) {
      $Toast.warning(t('sickLeave.close.toDateRequired'))
      return
    }
    if (withDocument.value && (!p.number || !p.issued_date || !p.file)) {
      $Toast.warning(t('sickLeave.close.documentRequired'))
      return
    }
    if (!withDocument.value && !p.close_reason?.trim()) {
      $Toast.warning(t('sickLeave.close.reasonRequired'))
      return
    }
    store._close()
  }

  defineExpose({ submit: onSubmit })
</script>

<template>
  <div class="px-1">
    <CloseTypePicker v-model="store.closePayload.close_type" />

    <n-form class="mt-3" :model="store.closePayload">
      <n-form-item :label="$t('sickLeave.form.toDate')" required>
        <n-date-picker
          class="w-full"
          v-model:formatted-value="store.closePayload.to_date"
          value-format="yyyy-MM-dd"
          format="dd.MM.yyyy"
          type="date"
          clearable
          :is-date-disabled="toDisabled"
        />
      </n-form-item>

      <template v-if="withDocument">
        <div class="grid grid-cols-1 gap-x-3 md:grid-cols-2">
          <n-form-item :label="$t('sickLeave.form.number')" required>
            <n-input v-model:value="store.closePayload.number" clearable />
          </n-form-item>
          <n-form-item :label="$t('sickLeave.form.issuedDate')" required>
            <n-date-picker
              class="w-full"
              v-model:formatted-value="store.closePayload.issued_date"
              value-format="yyyy-MM-dd"
              format="dd.MM.yyyy"
              type="date"
              clearable
            />
          </n-form-item>
        </div>

        <n-form-item :label="$t('sickLeave.form.file')" required>
          <n-upload
            class="w-full"
            accept="application/pdf"
            :max="1"
            :default-upload="false"
            @change="onFileChange"
          >
            <n-upload-dragger>
              <div class="flex flex-col items-center gap-1 py-2">
                <n-icon size="26" class="text-fig-brand">
                  <DocumentPdf24Regular />
                </n-icon>
                <span class="text-sm text-fig-text-primary">
                  {{ $t('sickLeave.form.selectPdf') }}
                </span>
                <span class="text-xs text-fig-text-muted">PDF · 10 MB</span>
              </div>
            </n-upload-dragger>
          </n-upload>
        </n-form-item>
      </template>

      <n-form-item v-else :label="$t('sickLeave.form.reason')" required>
        <n-input
          v-model:value="store.closePayload.close_reason"
          type="textarea"
          :rows="3"
          :placeholder="$t('sickLeave.close.reasonPlaceholder')"
        />
      </n-form-item>
    </n-form>

    <p class="text-xs text-fig-text-muted">{{ $t('sickLeave.close.hint') }}</p>
  </div>
</template>

<style scoped></style>
