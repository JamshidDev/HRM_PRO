<script setup>
  import {
    ArrowDownload20Regular,
    DocumentArrowUp20Regular,
    DocumentBulletList24Filled,
    LockClosed24Filled,
    LockOpen16Filled
  } from '@vicons/fluent'
  import { useAccountStore, useUploadReportStore } from '@/store/modules/index.js'
  import ReportZipModal from './ReportZipModal.vue'

  // Tanlangan korxona sarlavhasi va unga tegishli amallar.
  // `orgStatus` true — yuklash ochiq (tugma "Yopish"), false — yopiq ("Ochish").
  const store = useUploadReportStore()
  const accStore = useAccountStore()

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.economistUploadsWrite)) return
    store.resetForm()
    store.visibleType = true
    store.visible = true
  }
</script>

<template>
  <div
    class="flex flex-col sm:flex-row sm:items-center gap-3 p-3 mb-3 rounded-2xl bg-surface-section"
  >
    <div class="flex items-center gap-3 flex-1 min-w-0">
      <div class="shrink-0 w-10 h-10 rounded-xl grid place-items-center bg-primary/10 text-primary">
        <n-icon size="22"><DocumentBulletList24Filled /></n-icon>
      </div>
      <div class="min-w-0">
        <div class="font-semibold leading-tight line-clamp-2">{{ store.selectedOrgName }}</div>
        <span
          class="inline-flex items-center gap-1 mt-1 text-xs font-medium"
          :class="store.orgStatus ? 'text-success' : 'text-warning'"
        >
          <n-icon size="12">
            <LockOpen16Filled v-if="store.orgStatus" />
            <LockClosed24Filled v-else />
          </n-icon>
          {{ $t(store.orgStatus ? 'uploadReport.ui.uploadOpen' : 'uploadReport.ui.uploadClosed') }}
        </span>
      </div>
    </div>

    <div class="flex items-center gap-2 shrink-0">
      <n-button
        v-if="accStore.checkPermission(accStore.pn.economistUploadsStatus)"
        secondary
        :type="store.orgStatus ? 'error' : 'success'"
        :loading="store.structuresLoading"
        @click="store._uploadStatus"
      >
        {{
          $t(store.orgStatus ? 'uploadReport.form.openFromBlock' : 'uploadReport.form.closeToBlock')
        }}
        <template #icon>
          <LockClosed24Filled v-if="store.orgStatus" />
          <LockOpen16Filled v-else />
        </template>
      </n-button>
      <n-button
        v-if="accStore.checkPermission(accStore.pn.economistUploadsRead)"
        secondary
        type="info"
        @click="store.openReportZip()"
      >
        {{ $t('uploadReport.zip.button') }}
        <template #icon>
          <ArrowDownload20Regular />
        </template>
      </n-button>
      <n-button type="success" @click="onAdd">
        {{ $t('uploadReport.form.uploadFile') }}
        <template #icon>
          <DocumentArrowUp20Regular />
        </template>
      </n-button>
    </div>

    <ReportZipModal />
  </div>
</template>
