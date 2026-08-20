<script setup>
  import { useAccountStore, useUploadReportStore } from '@/store/modules/index.js'
  import { CheckmarkCircle20Filled, DismissCircle20Regular } from '@vicons/fluent'
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
  const visible = computed(
    () =>
      canConfirm.value &&
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
