<script setup>
  import { useAccountStore, useUploadReportStore } from '@/store/modules/index.js'
  import { CheckmarkCircle20Filled, ChevronRight20Regular, Timer16Regular } from '@vicons/fluent'
  import { confirmDialog } from '@/components/notify/alertDialog.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useUploadReportStore()
  const accStore = useAccountStore()

  // Kartochkaning o'zi bosilganda shu turdagi yuklashlar tarixi ochiladi.
  const onSelect = (v, index) => {
    store.list = v.data
    store.selectedIndex = index
  }

  const canConfirm = computed(() => accStore.checkPermission(accStore.pn.economistUploadsConfirm))

  // Loyihaning umumiy tasdiq oynasi.
  const askConfirm = (item) =>
    confirmDialog({
      type: item.status ? 'warning' : 'confirm',
      message: t(item.status ? 'uploadReport.cancelConfirmQuestion' : 'uploadReport.confirmQuestion'),
      confirmText: t('content.yes'),
      cancelText: t('content.no'),
      onConfirm: () => (item.status ? store._cancelConfirm(item) : store._confirm(item))
    })
</script>

<template>
  <n-spin :show="store.cardLoading">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <div
        v-for="(item, index) in store.cards"
        :key="item.id ?? index"
        class="group flex flex-col gap-3 p-3 rounded-2xl bg-surface-section border-2 cursor-pointer transition-colors"
        :class="
          store.selectedIndex === index
            ? 'border-primary'
            : 'border-transparent hover:border-primary/30'
        "
        @click="onSelect(item, index)"
      >
        <div class="flex items-start justify-between gap-2">
          <span class="text-sm font-semibold leading-tight">{{ item.name }}</span>
          <span
            class="shrink-0 inline-flex items-center gap-1 px-2 h-6 rounded-full text-xs font-medium"
            :class="item.status ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'"
          >
            <n-icon size="14">
              <CheckmarkCircle20Filled v-if="item.status" />
              <Timer16Regular v-else />
            </n-icon>
            {{ $t(item.status ? 'uploadReport.form.confirmed' : 'uploadReport.ui.notConfirmed') }}
          </span>
        </div>

        <div class="flex items-end justify-between gap-2">
          <div>
            <div class="text-2xl font-semibold tabular-nums leading-none">{{ item.count }}</div>
            <div class="text-xs text-textColor3 mt-1">{{ $t('uploadReport.ui.uploads') }}</div>
          </div>

          <div class="flex items-center gap-1" @click.stop>
            <n-button
              v-if="canConfirm"
              size="small"
              :type="item.status ? 'default' : 'primary'"
              :secondary="!item.status"
              :quaternary="item.status"
              :loading="store.confirmLoading"
              @click="askConfirm(item)"
            >
              {{ $t(item.status ? 'uploadReport.cancelConfirm' : 'content.confirm') }}
            </n-button>
            <n-icon
              size="18"
              class="transition-colors"
              :class="
                store.selectedIndex === index
                  ? 'text-primary'
                  : 'text-textColor3 group-hover:text-primary'
              "
            >
              <ChevronRight20Regular />
            </n-icon>
          </div>
        </div>
      </div>
    </div>
  </n-spin>
</template>
