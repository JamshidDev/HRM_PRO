<script setup>
  import { NoDataPicture, UIStatus, UITable, UIUser } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useWorkerCertificateStore } from '@stores'
  import { Utils } from '@utils'
  import UIHelper from '@/utils/UIHelper.js'
  import { Eye16Regular, Info16Regular } from '@vicons/fluent'
  import { certificateStatus, isExpired, validUntil } from './certificateStatus.js'

  const { t } = i18n.global
  const store = useWorkerCertificateStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  // Hamma ustun qat'iy kenglikda — bo'sh joy proporsional taqsimlanadi. Bitta moslashuvchan
  // ustun (avval «Xodim» minWidth) butun bo'sh joyni olib, keng ekranda juda cho'zilib ketardi.
  const columns = computed(() => [
    {
      key: 'worker',
      title: t('workerCertificatePage.table.worker'),
      width: 340,
      minWidth: 260,
      maxWidth: 560
    },
    { key: 'number', title: t('workerCertificatePage.table.number'), width: 160 },
    // Berilgan va amal qilish sanasi bitta ustunda (Lavozim guvohnomalari jadvalidagi kabi).
    { key: 'period', title: t('workerPositionCertificatePage.form.period'), width: 240 },
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
    storage-key="hrm-worker-certificate-v6"
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
    </template>

    <!-- «berilgan – amal qiladi»; uzaytirilgan bo'lsa kichik ⓘ (hover'da «Uzaytirilgan»).
         Muddati o'tgan bo'lsa sana qizil. -->
    <template #cell-period="{ row }">
      <span
        v-if="row.certificate"
        class="inline-flex items-center gap-1 whitespace-nowrap tabular-nums"
        :class="isExpired(row.certificate) ? 'text-fig-text-red' : 'text-textColor1'"
      >
        {{
          [Utils.timeOnlyDate(row.certificate.issue_date), Utils.timeOnlyDate(validUntil(row.certificate))]
            .filter(Boolean)
            .join(' – ')
        }}
        <n-tooltip v-if="row.certificate.extended_date">
          <template #trigger>
            <n-icon size="16" class="shrink-0 cursor-help text-fig-text-tertiary">
              <Info16Regular />
            </n-icon>
          </template>
          {{ $t('workerCertificatePage.table.extendedChip') }}
        </n-tooltip>
      </span>
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
