<script setup>
  import { useAccountStore, useUploadReportStore } from '@/store/modules/index.js'
  import {
    CheckmarkCircle20Filled,
    DismissCircle20Regular,
    LockOpen20Regular,
    LockClosed20Regular,
    CloudArrowUp20Regular
  } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const store = useUploadReportStore()
  const accStore = useAccountStore()
  const t = (k) => i18n.global.t(k)

  const typeOptions = computed(() => [
    { label: t('uploadReport.form.monthReport'), value: 1 },
    { label: t('uploadReport.form.applicationFour'), value: 2 },
    { label: t('uploadReport.form.applicationFive'), value: 3 },
    { label: t('uploadReport.form.INPSPayment'), value: 4 }
  ])

  const canConfirm = computed(() =>
    accStore.checkPermission(accStore.pn.economistUploadsConfirm)
  )
  // «Hammasini ochish/yopish» — davr-status ruxsati (economist-uploads-status).
  const canStatus = computed(() =>
    accStore.checkPermission(accStore.pn.economistUploadsStatus)
  )
  const canWrite = computed(() =>
    accStore.checkPermission(accStore.pn.economistUploadsWrite)
  )
  const visible = computed(
    () =>
      (canConfirm.value || canStatus.value || canWrite.value) &&
      store.confirmSelected.length > 0 &&
      store.params.year &&
      store.params.month
  )
</script>

<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="flex flex-wrap items-center gap-3 mb-3 p-3 rounded-lg border border-surface-line bg-surface-section"
    >
      <span class="text-sm text-textColor2">
        {{ $t('uploadReport.bulkSelected', { n: store.confirmSelected.length }) }}
      </span>
      <template v-if="canConfirm">
        <n-select
          class="w-[240px]!"
          size="small"
          v-model:value="store.bulkConfirmType"
          :options="typeOptions"
        />
        <n-button
          type="primary"
          size="small"
          :loading="store.bulkConfirmLoading"
          @click="store._confirmMany(false)"
        >
          <template #icon>
            <n-icon><CheckmarkCircle20Filled /></n-icon>
          </template>
          {{ $t('content.confirm') }}
        </n-button>
        <n-button
          type="warning"
          size="small"
          :loading="store.bulkConfirmLoading"
          @click="store._confirmMany(true)"
        >
          <template #icon>
            <n-icon><DismissCircle20Regular /></n-icon>
          </template>
          {{ $t('uploadReport.cancelConfirm') }}
        </n-button>
      </template>

      <template v-if="canStatus">
        <span v-if="canConfirm" class="h-5 w-px bg-surface-line"></span>
        <n-button
          type="info"
          size="small"
          :loading="store.bulkOpenLoading"
          @click="store._openMany(true)"
        >
          <template #icon>
            <n-icon><LockOpen20Regular /></n-icon>
          </template>
          {{ $t('uploadReport.openAll') }}
        </n-button>
        <n-button
          type="error"
          size="small"
          :loading="store.bulkOpenLoading"
          @click="store._openMany(false)"
        >
          <template #icon>
            <n-icon><LockClosed20Regular /></n-icon>
          </template>
          {{ $t('uploadReport.closeAll') }}
        </n-button>
      </template>

      <template v-if="canWrite">
        <span v-if="canConfirm || canStatus" class="h-5 w-px bg-surface-line"></span>
        <n-button
          type="primary"
          size="small"
          @click="store.openBulkFromSelected()"
        >
          <template #icon>
            <n-icon><CloudArrowUp20Regular /></n-icon>
          </template>
          1C dan tortish ({{ store.confirmSelected.length }} ta)
        </n-button>
      </template>

      <n-button text size="small" @click="store.clearConfirmSelected()">
        {{ $t('content.clear') }}
      </n-button>
    </div>
  </transition>
</template>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.15s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
