<script setup>
  import { UIBadge, UITable, UIUser } from '@/components/index.js'
import i18n from '@/i18n/index.js'
import { useAccountStore, useComponentStore, useVacationStore } from '@/store/modules/index.js'
import UIHelper from '@/utils/UIHelper.js'
import Utils from '@/utils/Utils.js'
import { Delete20Regular, Edit32Regular } from '@vicons/fluent'

  const { t } = i18n.global

  const store = useVacationStore()
  const compStore = useComponentStore()
  const accStore = useAccountStore()

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.hrVacationsWrite)) return
    store.payload.position = row.position
    compStore.selectedWorker = {
      lastName: row.worker.last_name,
      firstName: row.worker.first_name,
      middleName: row.worker.middle_name,
      position: row.position,
      photo: row.worker.photo || Utils.noAvailableImage,
      pin: row.worker.uuid
    }
    store.visibleType = false
    store.elementId = row.id
    store.payload.pin = row.worker.id.toString()
    store.payload.full_position = row.full_position
    store.payload.level = row.level.id
    store.visible = true
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.hrVacationsWrite)) return
    store.elementId = row.id
    store._delete()
  }

  const changePage = (row) => {
    store.params.page = row.page
    store.params.per_page = row.per_page
    store._index()
  }

  const vacationType = (id) => {
    switch (id) {
      case 1:
        return Utils.colorTypes.info
      case 2:
        return Utils.colorTypes.warning
      case 3:
        return Utils.colorTypes.success
      case 4:
        return Utils.colorTypes.error
      case 5:
        return Utils.colorTypes.dark
      default:
        return Utils.colorTypes.secondary
    }
  }

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('confirmationPage.table.worker'),
      minWidth: 200,
    },
    {
      key: 'duration',
      title: t('content.duration'),
      width: 140
    },
    {
      key: 'type',
      title: t('vacationPage.table.type'),
      minWidth: 300,
    },
    {
      key: 'period',
      title: t('vacationPage.table.duration'),
      width: 240
    },
    {
      key: 'workDay',
      title: t('vacationPage.table.workDay'),
      width: 160
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit32Regular),
      visible: false,
      action: onEdit
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      visible: false,
      action: onDelete
    }
  ])
</script>

<template>
  <UITable
    permission-prefix="hr-vacations"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="hrm-vacation"
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

    <template #cell-duration="{ row }">
      <UIBadge
        :show-icon="false"
        :label="row.all_day + ' ' + $t('date.day')"
        :type="Utils.colorTypes.success"
      />
    </template>

    <template #cell-type="{ row }">
      <UIBadge :label="row.type.name" :type="vacationType(row.type.id)" />
    </template>

    <template #cell-period="{ row }">
      <div class="flex">
        <UIBadge :show-icon="false" :label="Utils.timeOnlyDate(row.from)" />
        <UIBadge :show-icon="false" :label="Utils.timeOnlyDate(row.to)" />
      </div>
    </template>

    <template #cell-workDay="{ row }">
      <UIBadge
        v-if="row.work_day"
        :show-icon="false"
        :label="Utils.timeOnlyDate(row.work_day)"
        :type="Utils.colorTypes.success"
      />
    </template>
  </UITable>
</template>
