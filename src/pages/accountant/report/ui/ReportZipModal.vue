<script setup>
  // Ko'p-oylik ZIP yuklab olish — bitta korxonaning yil + oy oralig'idagi
  // 4 turdagi (Oylik + INPS 4/5 + to'lovlar) oxirgi muvaffaqiyatli hisobotlari.
  import { computed } from 'vue'
  import { UIModal } from '@/components/index.js'
  import { useUploadReportStore } from '@/store/modules/index.js'
  import { ArrowDownload20Regular } from '@vicons/fluent'

  const store = useUploadReportStore()

  const MONTHS = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
  ]
  const monthOptions = computed(() =>
    MONTHS.map((label, i) => ({ label, value: i + 1 }))
  )

  const now = new Date()
  const yearOptions = computed(() => {
    const y = store.reportZip.year || now.getFullYear()
    const base = Math.max(y, now.getFullYear())
    return Array.from({ length: 6 }, (_, i) => ({ label: `${base - i}`, value: base - i }))
  })

  const invalid = computed(
    () =>
      !store.reportZip.year ||
      !store.reportZip.from_month ||
      !store.reportZip.to_month ||
      store.reportZip.from_month > store.reportZip.to_month
  )
</script>

<template>
  <UIModal
    :width="520"
    :visible="store.reportZipVisible"
    @update:visible="(v) => (store.reportZipVisible = v)"
    :title="$t('uploadReport.zip.title')"
  >
    <div class="p-4 flex flex-col gap-4">
      <p class="text-sm text-textColor2">
        {{ $t('uploadReport.zip.hint', { org: store.selectedOrgName }) }}
      </p>

      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-textColor3">{{ $t('content.year') }}</label>
        <n-select v-model:value="store.reportZip.year" :options="yearOptions" />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-textColor3">{{ $t('uploadReport.zip.from') }}</label>
          <n-select v-model:value="store.reportZip.from_month" :options="monthOptions" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-textColor3">{{ $t('uploadReport.zip.to') }}</label>
          <n-select v-model:value="store.reportZip.to_month" :options="monthOptions" />
        </div>
      </div>

      <p v-if="invalid" class="text-xs text-danger">
        {{ $t('uploadReport.zip.invalid') }}
      </p>

      <div class="flex justify-end gap-2 pt-2">
        <n-button @click="store.reportZipVisible = false">
          {{ $t('content.cancel') }}
        </n-button>
        <n-button
          type="primary"
          :disabled="invalid"
          :loading="store.reportZipLoading"
          @click="store._downloadReportsZip()"
        >
          {{ $t('uploadReport.zip.download') }}
          <template #icon>
            <n-icon><ArrowDownload20Regular /></n-icon>
          </template>
        </n-button>
      </div>
    </div>
  </UIModal>
</template>
