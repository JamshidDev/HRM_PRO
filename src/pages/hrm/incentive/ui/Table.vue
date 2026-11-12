<script setup>
  import { UIBadge, UITable, UIUser } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, useIncentiveStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import { Eye16Regular } from '@vicons/fluent'
  import RecordStatusBadge from '@/pages/hrm/_shared/RecordStatusBadge.vue'

  const { t } = i18n.global

  const store = useIncentiveStore()
  const accStore = useAccountStore()
  const emits = defineEmits(['openCommand'])

  const onView = (row) => {
    if (!accStore.checkAction(accStore.pn.hrCommandsRead)) return
    emits('openCommand', row)
  }

  // Buyruqsiz (qo'lda kiritilgan) yozuvda ko'rish o'chiq.
  const actions = computed(() => [
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      disabled: (row) => !row?.command_id,
      action: onView
    }
  ])

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
      key: 'gift',
      title: t('incentive.form.type'),
      minWidth: 100
    },
    {
      key: 'organization.name',
      title: t('content.organization'),
      minWidth: 200
    },
    {
      key: 'by_whom',
      title: t('incentive.form.who'),
      minWidth: 200
    },
    {
      key: 'reason',
      title: t('incentive.form.reason'),
      minWidth: 100
    },
    {
      key: 'date',
      title: t('content.date'),
      width: 120
    },
    {
      key: 'status',
      title: t('incentive.status.title'),
      width: 150
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
    storage-key="hrm-incentive"
    :actions="actions"
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

    <template #cell-gift="{ row }">
      <UIBadge :show-icon="false" :label="row.gift" :type="Utils.colorTypes.primary" />
    </template>

    <template #cell-date="{ row }">
      <UIBadge
        :type="Utils.colorTypes.dark"
        :show-icon="false"
        :label="Utils.timeOnlyDate(row.date)"
      />
    </template>

    <template #cell-status="{ row }">
      <RecordStatusBadge
        :status="row.status"
        :expires-at="row.expires_at"
        :ended-at="row.ended_at"
        :reason="row.cancel_reason"
      />
    </template>
  </UITable>
</template>
