<script setup>
  import { UIPageFilter, UIYearMonth } from '@/components/index.js'
  import {
    DocumentArrowUp20Regular,
    LockClosed24Filled,
    LockOpen16Filled,
    CloudArrowUp24Regular,
    ClipboardTaskListLtr20Regular
  } from '@vicons/fluent'
  import { useAccountStore, useUploadReportStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useUploadReportStore()
  const accStore = useAccountStore()

  const onYearMonthChange = () => {
    if (!accStore.checkAction(accStore.pn.economistUploadsRead)) return
    store.params.organization_id = null
    store.resetCards()
    store._structures()
  }

  const onAdd = async () => {
    if (!accStore.checkAction(accStore.pn.economistUploadsWrite)) return
    if (!store.params.organization_id) {
      $Toast.warning(t('uploadReport.form.requiredOrganization'))
      return
    }
    store.resetForm()
    store.visibleType = true
    store.visible = true
  }

  // 1C dan ommaviy yuklash (Oylik hisobot) — korxona tanlash shart emas (davr bo'yicha).
  const onBulkOnes = () => {
    if (!accStore.checkAction(accStore.pn.economistUploadsWrite)) return
    store.openBulk()
  }

  // Hisobot holati (kim yuklagan/yuklamagan) — tanlangan oy uchun modal.
  const onReportStatus = () => {
    if (!accStore.checkAction(accStore.pn.economistUploadsRead)) return
    store.openReportStatus()
  }
</script>

<template>
  <UIPageFilter :show-filter-button="false" :show-add-button="false">
    <template #filterAction>
      <div class="max-w-[160px]">
        <UIYearMonth
          v-model:year="store.params.year"
          v-model:month="store.params.month"
          :clearable="false"
          @change="onYearMonthChange"
        />
      </div>
      <n-button
        v-if="
          store.params.organization_id &&
          accStore.checkPermission(accStore.pn.economistUploadsStatus)
        "
        :type="store.orgStatus ? 'error' : 'success'"
        @click="store._uploadStatus"
        :loading="store.structuresLoading"
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
        @click="onReportStatus"
        type="default"
        class="w-full! md:w-auto!"
      >
        {{ $t('uploadReport.reportStatus.button') }}
        <template #icon>
          <ClipboardTaskListLtr20Regular />
        </template>
      </n-button>

      <n-button
        v-if="accStore.checkPermission(accStore.pn.economistUploadsWrite)"
        @click="onBulkOnes"
        type="info"
        class="w-full! md:w-auto!"
      >
        {{ $t('uploadReport.bulkOnes.button') }}
        <template #icon>
          <CloudArrowUp24Regular />
        </template>
      </n-button>

      <n-button @click="onAdd" type="success" class="w-full! md:w-auto!">
        {{ $t('uploadReport.form.uploadFile') }}
        <template #icon>
          <DocumentArrowUp20Regular />
        </template>
      </n-button>
    </template>
  </UIPageFilter>
</template>
