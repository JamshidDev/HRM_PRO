<script setup>
  import { UITable } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useWorkerCertificateStore } from '@stores'
  import { Utils } from '@utils'

  const { t } = i18n.global
  const store = useWorkerCertificateStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const fullName = (row) =>
    [row.last_name, row.first_name, row.middle_name].filter(Boolean).join(' ')

  // Amal qilish muddati — uzaytirilgan sana bo'lsa HAQIQIY muddat o'sha.
  const validUntil = (c) => c?.extended_date || c?.expiry_date || null

  const columns = computed(() => [
    { key: 'worker', title: t('workerCertificatePage.table.worker'), minWidth: 240 },
    {
      key: 'organization.name',
      title: t('workerCertificatePage.table.organization'),
      minWidth: 240
    },
    { key: 'position', title: t('workerCertificatePage.table.position'), minWidth: 240 },
    { key: 'number', title: t('workerCertificatePage.table.number'), width: 150 },
    { key: 'issue_date', title: t('workerCertificatePage.table.issueDate'), width: 130 },
    { key: 'expiry_date', title: t('workerCertificatePage.table.expiryDate'), width: 140 },
    {
      key: 'verify',
      title: t('workerCertificatePage.table.verify'),
      width: 130,
      align: 'center'
    },
    {
      key: 'returned',
      title: t('workerCertificatePage.table.returned'),
      width: 140,
      align: 'center'
    }
  ])
</script>

<template>
  <UITable
    permission-prefix="hr-workers"
    :columns="columns"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="hrm-worker-certificate"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <div class="flex flex-col">
        <span>{{ fullName(row) }}</span>
        <span v-if="row.pin" class="text-xs text-textColor3">{{ row.pin }}</span>
      </div>
    </template>

    <template #cell-position="{ row }">
      {{ row.position || '-' }}
    </template>

    <!-- Guvohnoma yo'q bo'lsa raqam o'rniga aniq belgi — bo'sh katak emas. -->
    <template #cell-number="{ row }">
      <n-tag v-if="!row.certificate" size="small" :bordered="false">
        {{ $t('workerCertificatePage.table.noCertificate') }}
      </n-tag>
      <span v-else>{{ row.certificate.number }}</span>
    </template>

    <template #cell-issue_date="{ row }">
      {{ row.certificate ? Utils.timeOnlyDate(row.certificate.issue_date) : '-' }}
    </template>

    <template #cell-expiry_date="{ row }">
      {{ validUntil(row.certificate) ? Utils.timeOnlyDate(validUntil(row.certificate)) : '-' }}
    </template>

    <template #cell-verify="{ row }">
      <n-tag
        v-if="row.certificate" size="small" :bordered="false"
        :type="row.certificate.verify ? 'success' : 'default'"
      >
        {{ row.certificate.verify ? $t('content.yes') : $t('content.no') }}
      </n-tag>
      <span v-else>-</span>
    </template>

    <template #cell-returned="{ row }">
      <n-tag
        v-if="row.certificate" size="small" :bordered="false"
        :type="row.certificate.returned ? 'warning' : 'default'"
      >
        {{ row.certificate.returned ? $t('content.yes') : $t('content.no') }}
      </n-tag>
      <span v-else>-</span>
    </template>
  </UITable>
</template>
