<script setup>
  import { UIBadge, UITable, UIUser } from '@/components/index.js'
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

  // Amal qilish muddati — uzaytirilgan sana bo'lsa HAQIQIY muddat o'sha.
  const validUntil = (c) => c?.extended_date || c?.expiry_date || null

  const columns = computed(() => [
    { key: 'worker', title: t('workerCertificatePage.table.worker'), minWidth: 280 },
    { key: 'number', title: t('workerCertificatePage.table.number'), minWidth: 170 },
    { key: 'issue_date', title: t('workerCertificatePage.table.issueDate'), width: 140 },
    { key: 'expiry_date', title: t('workerCertificatePage.table.expiryDate'), width: 150 },
    {
      key: 'verify',
      title: t('workerCertificatePage.table.verify'),
      width: 140,
      align: 'center'
    },
    {
      key: 'returned',
      title: t('workerCertificatePage.table.returned'),
      width: 150,
      align: 'center'
    }
  ])
</script>

<template>
  <UITable
    permission-prefix="hr-certificates"
    :columns="columns"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="hrm-worker-certificate"
    @change-page="changePage"
  >
    <!-- Xodimlar sahifasidagi kabi UIUser — avatar + F.I.Sh, ostida JSHSHIR. -->
    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :data="{
          photo: row?.photo,
          firstName: row?.first_name,
          middleName: row?.middle_name,
          lastName: row?.last_name,
          position: row?.pin
        }"
      />
    </template>

    <!-- Guvohnoma yo'q bo'lsa «Berilmagan» tegi; raqamga bosilsa — modalda hammasi.
         Qolgan ustunlar bunday xodimda BO'SH qoladi (to'ldiruvchi belgi qo'yilmaydi). -->
    <template #cell-number="{ row }">
      <UIBadge
        v-if="!row.certificate"
        :show-icon="false"
        :label="$t('workerCertificatePage.table.noCertificate')"
        :type="Utils.colorTypes.error"
      />
      <span
        v-else
        class="text-primary cursor-pointer hover:underline"
        @click="store._show(row)"
      >
        {{ row.certificate.number }}
      </span>
    </template>

    <template #cell-issue_date="{ row }">
      {{ row.certificate ? Utils.timeOnlyDate(row.certificate.issue_date) : '' }}
    </template>

    <template #cell-expiry_date="{ row }">
      {{ validUntil(row.certificate) ? Utils.timeOnlyDate(validUntil(row.certificate)) : '' }}
    </template>

    <template #cell-verify="{ row }">
      <UIBadge
        v-if="row.certificate"
        class="justify-center"
        :label="row.certificate.verify ? $t('content.yes') : $t('content.no')"
        :type="row.certificate.verify ? Utils.colorTypes.success : Utils.colorTypes.dark"
      />
    </template>

    <template #cell-returned="{ row }">
      <UIBadge
        v-if="row.certificate"
        class="justify-center"
        :label="row.certificate.returned ? $t('content.yes') : $t('content.no')"
        :type="row.certificate.returned ? Utils.colorTypes.warning : Utils.colorTypes.dark"
      />
    </template>
  </UITable>
</template>
