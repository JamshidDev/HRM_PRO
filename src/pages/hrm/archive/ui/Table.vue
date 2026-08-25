<script setup>
  import { UITable, UIUser } from '@/components/index.js'
  import { useArchiveStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import { DocumentArrowDown20Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useArchiveStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    { key: 'worker', title: t('confirmationPage.table.worker'), minWidth: 240 },
    { key: 'pin', title: t('pensioner.form.pin'), width: 160 },
    { key: 'organization', title: t('workerPage.table.organization'), minWidth: 240 },
    { key: 'contract_type', title: t('archive.table.contractType'), minWidth: 220 },
    { key: 'start_date', title: t('archive.table.startDate'), width: 170 },
    { key: 'dismissed_at', title: t('archive.table.dismissedAt'), width: 140 }
  ])

  const actions = computed(() => [
    {
      label: t('archive.table.resume'),
      key: Utils.ActionTypes.download,
      icon: UIHelper.renderIcon(DocumentArrowDown20Regular),
      action: (row) => store._resume(row)
    }
  ])
</script>

<template>
  <UITable
    permission-prefix="hr-archive"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="hrm-archive"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :data="{
          photo: row?.worker?.photo,
          firstName: row?.worker?.first_name,
          middleName: row?.worker?.middle_name,
          lastName: row?.worker?.last_name,
          position: row?.worker?.phone
        }"
      />
    </template>

    <template #cell-pin="{ row }">{{ row?.worker?.pin || '—' }}</template>

    <!-- Hozir boshqa korxonada ishlayotgan bo'lsa — o'sha korxona nomi; aks holda «Arxiv». -->
    <template #cell-organization="{ row }">
      <span v-if="row?.organization">{{ row.organization.name }}</span>
      <n-tag v-else size="small" type="error" round>
        {{ $t('archive.name') }}
      </n-tag>
    </template>

    <template #cell-contract_type="{ row }">{{ row?.contract_type?.name || '—' }}</template>

    <!-- Sana formati boshqa sahifalar bilan bir xil: DD.MM.YYYY. -->
    <template #cell-start_date="{ row }">
      {{ Utils.timeOnlyDate(row?.start_date) || '—' }}
    </template>

    <template #cell-dismissed_at="{ row }">
      {{ Utils.timeOnlyDate(row?.dismissed_at) || '—' }}
    </template>
  </UITable>
</template>
