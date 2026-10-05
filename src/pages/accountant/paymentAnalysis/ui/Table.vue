<script setup>
  import { UITable, UIBadge } from '@/components/index.js'
  import { usePaymentAnalysisStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = usePaymentAnalysisStore()

  const onChange = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  // verdict = "Asosli" | "Asossiz" | "Qo'shimcha tekshiruv" → rangli badge.
  const verdictType = (verdict) => {
    if (verdict === 'Asosli') return Utils.colorTypes.success
    if (verdict === 'Asossiz') return Utils.colorTypes.error
    return Utils.colorTypes.warning
  }

  const columns = computed(() => [
    {
      key: 'row_no',
      title: t('paymentAnalysis.table.rowNo'),
      width: 70,
      align: 'center'
    },
    {
      key: 'fio',
      title: t('paymentAnalysis.table.fio'),
      minWidth: 240
    },
    {
      key: 'position',
      title: t('paymentAnalysis.table.position'),
      minWidth: 200
    },
    {
      key: 'pinfl',
      title: t('paymentAnalysis.table.pinfl'),
      width: 160
    },
    {
      key: 'paying_code',
      title: t('paymentAnalysis.table.payingCode'),
      width: 110,
      align: 'center'
    },
    {
      key: 'summa',
      title: t('paymentAnalysis.table.summa'),
      width: 140,
      align: 'right'
    },
    {
      key: 'reason',
      title: t('paymentAnalysis.table.reason'),
      minWidth: 260
    },
    {
      key: 'verdict',
      title: t('paymentAnalysis.table.verdict'),
      width: 180,
      align: 'center'
    }
  ])
</script>

<template>
  <UITable
    :columns="columns"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="accountant-payment-analysis"
    @change-page="onChange"
  >
    <template #cell-summa="{ row }">
      {{ Utils.formatNumberToMoney(row.summa) }}
    </template>

    <template #cell-verdict="{ row }">
      <UIBadge :label="row.verdict" :type="verdictType(row.verdict)" />
    </template>
  </UITable>
</template>
