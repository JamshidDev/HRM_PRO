<script setup>
  import { useEmployeeDocumentStore } from '@/store/modules/index.js'

  // Moddiy javobgarlik shartnomasiga xos maydonlar (`payload.data`).
  const store = useEmployeeDocumentStore()
</script>

<template>
  <div class="col-span-12">
    <n-form-item :label="$t('materialLiabilityPage.form.assets')" path="data.assets">
      <n-input
        v-model:value="store.payload.data.assets"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 8 }"
        :maxlength="5000"
        :placeholder="$t('materialLiabilityPage.form.assetsPlaceholder')"
      />
    </n-form-item>
  </div>
  <div class="col-span-12">
    <n-form-item :label="$t('materialLiabilityPage.form.workDescription')">
      <n-input
        v-model:value="store.payload.data.work_description"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 5 }"
        :maxlength="2000"
      />
    </n-form-item>
  </div>
  <div class="col-span-12 md:col-span-6">
    <n-form-item :label="$t('materialLiabilityPage.form.workerObligations')">
      <n-input
        v-model:value="store.payload.data.worker_obligations"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 6 }"
        :maxlength="5000"
        :placeholder="$t('materialLiabilityPage.form.optionalHint')"
      />
    </n-form-item>
  </div>
  <div class="col-span-12 md:col-span-6">
    <n-form-item :label="$t('materialLiabilityPage.form.employerObligations')">
      <n-input
        v-model:value="store.payload.data.employer_obligations"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 6 }"
        :maxlength="5000"
        :placeholder="$t('materialLiabilityPage.form.optionalHint')"
      />
    </n-form-item>
  </div>
</template>
