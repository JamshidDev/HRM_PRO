<script setup>
  import { NoDataPicture, UIStatus, UITable, UIUser } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useWorkerCertificateStore } from '@stores'
  import { Utils } from '@utils'
  import UIHelper from '@/utils/UIHelper.js'
  import { Eye16Regular } from '@vicons/fluent'
  import { certificateStatus, isExpired, validUntil } from './certificateStatus.js'

  const { t } = i18n.global
  const store = useWorkerCertificateStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  // UITable bo'sh joyni `minWidth` ustunlar orasida TENG bo'ladi — shunda «Xodim» qisilib, ism kesilardi.
  // Shu bois faqat «Xodim» moslashuvchan (qolgan joy unga), qisqa ustunlar — qat'iy `width`.
  const columns = computed(() => [
    { key: 'worker', title: t('workerCertificatePage.table.worker'), minWidth: 320 },
    { key: 'number', title: t('workerCertificatePage.table.number'), width: 180 },
    { key: 'issue_date', title: t('workerCertificatePage.table.issueDate'), width: 150 },
    {
      key: 'expiry_date',
      title: t('workerPositionCertificatePage.form.expiryDate'),
      width: 180
    },
    { key: 'status', title: t('workerCertificatePage.table.status'), width: 190 }
  ])

  // Katakda bosiladigan narsa yo'q — «Ko'rish» qatordagi amallar menyusida.
  // Guvohnomasi yo'q xodimda ko'radigan narsa yo'q → amal yashiriladi.
  const actions = computed(() => [
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      visible: (row) => !!row?.certificate,
      action: (row) => store._show(row)
    }
  ])
</script>

<template>
  <UITable
    permission-prefix="hr-certificates"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="hrm-worker-certificate-v3"
    @change-page="changePage"
  >
    <!-- Qidiruv/filtrsiz bo'sh bo'lsa — «topilmadi» emas, «ro'yxat bo'sh». -->
    <template #empty>
      <NoDataPicture
        :title="store.searched ? null : $t('workerCertificatePage.empty')"
        :hint="store.searched ? null : $t('workerCertificatePage.emptyHint')"
      />
    </template>

    <!-- Xodimlar sahifasidagi kabi UIUser — avatar + F.I.Sh, ostida JSHSHIR. -->
    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :data="{
          photo: row?.photo,
          firstName: row?.first_name ?? '',
          middleName: row?.middle_name ?? '',
          lastName: row?.last_name ?? '',
          position: row?.pin
        }"
      />
    </template>

    <template #cell-number="{ row }">
      <span v-if="row.certificate" class="font-medium text-textColor0 tabular-nums">
        {{ row.certificate.number }}
      </span>
      <span v-else class="text-textColor3">—</span>
    </template>

    <template #cell-issue_date="{ row }">
      <span v-if="row.certificate" class="tabular-nums text-textColor1">
        {{ Utils.timeOnlyDate(row.certificate.issue_date) }}
      </span>
      <span v-else class="text-textColor3">—</span>
    </template>

    <!-- Uzaytirilgan bo'lsa — yangi sana, ostida kulrang «uzaytirilgan».
         Muddati o'tgan bo'lsa sana qizil. -->
    <template #cell-expiry_date="{ row }">
      <div v-if="validUntil(row.certificate)" class="flex flex-col leading-tight">
        <span
          class="tabular-nums"
          :class="isExpired(row.certificate) ? 'text-fig-text-red' : 'text-textColor1'"
        >
          {{ Utils.timeOnlyDate(validUntil(row.certificate)) }}
        </span>
        <span v-if="row.certificate.extended_date" class="text-[11px] text-textColor3">
          {{ $t('workerCertificatePage.table.extended') }}
        </span>
      </div>
      <span v-else class="text-textColor3">—</span>
    </template>

    <!-- Bitta chip: Tasdiqlangan / Tasdiqlanmagan / Muddati o'tgan / Qaytarib olingan / Berilmagan. -->
    <template #cell-status="{ row }">
      <UIStatus
        fig
        :tooltip="false"
        :status="certificateStatus(row.certificate).status"
        :tone="certificateStatus(row.certificate).tone"
      />
    </template>
  </UITable>
</template>
