<script setup>
  // Yangi versiyani saqlash: izoh + amal qilish sanasi + ixtiyoriy asos-hujjat.
  // Sanadan yangi o'zgarish amal qiladi; joriy versiya tarixga o'tadi.
  import { UIModal, UIUpload } from '@/components/index.js'
  import { useTariffGridStore } from '@/store/modules/index.js'

  const store = useTariffGridStore()
</script>

<template>
  <UIModal
    :width="'520px'"
    :visible="store.saveVersionVisible"
    @update:visible="(v) => (store.saveVersionVisible = v)"
    :title="$t('tariffGrid.action.saveVersion')"
  >
    <n-form :model="store.versionPayload" class="flex flex-col gap-1">
      <n-alert type="info" :bordered="false" class="mb-2" style="border-radius: 12px">
        {{ $t('tariffGrid.form.effectiveHint') }}
      </n-alert>

      <n-form-item :label="$t('tariffGrid.form.effectiveDate')" required>
        <n-date-picker class="w-full" type="date"
          v-model:formatted-value="store.versionPayload.effective_date" value-format="yyyy-MM-dd" />
      </n-form-item>

      <n-form-item :label="$t('tariffGrid.form.note')">
        <n-input v-model:value="store.versionPayload.note" type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }" :placeholder="$t('tariffGrid.form.note')" />
      </n-form-item>

      <n-form-item :label="$t('tariffGrid.form.basisFile')">
        <UIUpload v-model:files="store.versionFiles" :multiple="false"
          accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx" />
      </n-form-item>

      <div class="flex justify-end gap-2 pt-2 border-t border-surface-line mt-2">
        <n-button quaternary @click="store.saveVersionVisible = false">{{ $t('content.cancel') }}</n-button>
        <n-button type="primary" :loading="store.versionSaveLoading" @click="store._storeVersion()">
          {{ $t('content.save') }}
        </n-button>
      </div>
    </n-form>
  </UIModal>
</template>
