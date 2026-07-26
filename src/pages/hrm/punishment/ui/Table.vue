<script setup>
  import { UIBadge, UITable, UIUser } from '@/components/index.js'
import i18n from '@/i18n/index.js'
import { usePunishmentStore } from '@/store/modules/index.js'
import Utils from '@/utils/Utils.js'

  const { t } = i18n.global

  const store = usePunishmentStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('confirmationPage.table.worker'),
      minWidth: 200
    },
    {
      key: 'fine',
      title: t('incentive.form.type'),
      minWidth: 100
    },
    {
      key: 'organization.name',
      title: t('content.organization'),
      minWidth: 200
    },
    {
      key: 'reason',
      title: t('incentive.form.reason'),
      minWidth: 200
    },
    {
      key: 'date',
      title: t('content.date'),
      width: 120
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
    storage-key="hrm-punishment"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :data="{
          photo: row?.worker_position?.worker.photo,
          firstName: row?.worker_position?.worker.first_name,
          middleName: row?.worker_position?.worker.middle_name,
          lastName: row?.worker_position?.worker.last_name,
          position: row?.worker_position?.post_short_name
        }"
      />
    </template>

    <template #cell-fine="{ row }">
      <UIBadge :show-icon="false" :label="row.fine" :type="Utils.colorTypes.error" />
    </template>

    <template #cell-date="{ row }">
      <UIBadge
        :type="Utils.colorTypes.dark"
        :show-icon="false"
        :label="Utils.timeOnlyDate(row.date)"
      />
    </template>
  </UITable>
</template>
