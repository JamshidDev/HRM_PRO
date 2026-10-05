<script setup>
  import { UIPageFilter, UIYearMonth } from '@/components/index.js'
  import {
    CloudArrowUp24Regular,
    ClipboardTaskListLtr20Regular,
    History24Regular
  } from '@vicons/fluent'
  import { useAccountStore, useUploadReportStore } from '@/store/modules/index.js'

  const store = useUploadReportStore()
  const accStore = useAccountStore()

  // Bu yerda faqat davr bo'yicha umumiy amallar. Tanlangan korxonaga tegishli
  // amallar (yopish/ochish, hisobot yuklash) OrgHeader.vue da.
  const onYearMonthChange = () => {
    if (!accStore.checkAction(accStore.pn.economistUploadsRead)) return
    store.params.organization_id = null
    store.resetCards()
    store._structures()
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

  // Tortish tarixi (pull-log) — barcha davrlar bo'yicha yuklamalar modali.
  const onPullHistory = () => {
    if (!accStore.checkAction(accStore.pn.economistUploadsRead)) return
    store.openPullHistory()
  }

  const canRead = computed(() => accStore.checkPermission(accStore.pn.economistUploadsRead))
</script>

<template>
  <UIPageFilter
    v-model:search="store.orgSearch"
    :placeholder="$t('uploadReport.ui.searchOrg')"
    :show-filter-button="false"
    :show-add-button="false"
  >
    <template #filterAction>
      <div class="w-full md:w-[160px]">
        <UIYearMonth
          v-model:year="store.params.year"
          v-model:month="store.params.month"
          :clearable="false"
          @change="onYearMonthChange"
        />
      </div>

      <div v-if="canRead" class="hidden md:block w-px h-6 bg-surface-line mx-1"></div>

      <n-button v-if="canRead" secondary class="w-full! md:w-auto!" @click="onReportStatus">
        {{ $t('uploadReport.reportStatus.button') }}
        <template #icon>
          <ClipboardTaskListLtr20Regular />
        </template>
      </n-button>

      <n-button v-if="canRead" secondary class="w-full! md:w-auto!" @click="onPullHistory">
        {{ $t('uploadReport.pullHistory.button') }}
        <template #icon>
          <History24Regular />
        </template>
      </n-button>

      <n-button
        v-if="accStore.checkPermission(accStore.pn.economistUploadsWrite)"
        type="primary"
        class="w-full! md:w-auto!"
        @click="onBulkOnes"
      >
        {{ $t('uploadReport.bulkOnes.button') }}
        <template #icon>
          <CloudArrowUp24Regular />
        </template>
      </n-button>
    </template>
  </UIPageFilter>
</template>
