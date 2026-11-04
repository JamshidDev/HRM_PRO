<script setup>
  import { useEmployeeDocumentStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  // Konfidensiallik bitimiga xos maydonlar (`payload.data`).
  const store = useEmployeeDocumentStore()
  const { t } = i18n.global
  const basisOptions = computed(() => [
    { id: 'ustav', name: t('employeeDocumentsPage.bitim.basisCharter') },
    { id: 'ishonchnoma', name: t('employeeDocumentsPage.bitim.basisPowerOfAttorney') }
  ])
</script>

<template>
  <div class="col-span-12 md:col-span-6">
    <n-form-item :label="$t('employeeDocumentsPage.bitim.basis')" path="data.basis">
      <n-select
        v-model:value="store.payload.data.basis"
        :options="basisOptions"
        label-field="name"
        value-field="id"
      />
    </n-form-item>
  </div>
  <div class="col-span-12">
    <n-form-item :label="$t('employeeDocumentsPage.bitim.extraConditions')">
      <n-input
        v-model:value="store.payload.data.extra_conditions"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 6 }"
        :maxlength="5000"
        :placeholder="$t('materialLiabilityPage.form.optionalHint')"
      />
    </n-form-item>
  </div>
</template>
