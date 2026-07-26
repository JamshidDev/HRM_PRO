<script setup>
  import { UITable, UIUser } from '@/components/index.js'
import i18n from '@/i18n/index.js'
import {
  useAccountStore,
  useComponentStore,
  useConfirmationStore
} from '@/store/modules/index.js'
import UIHelper from '@/utils/UIHelper.js'
import Utils from '@/utils/Utils.js'
import { Delete20Regular, Edit32Regular } from '@vicons/fluent'

  const { t } = i18n.global

  const store = useConfirmationStore()
  const compStore = useComponentStore()
  const accStore = useAccountStore()

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.hrConfirmationsWrite)) return
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
    store.payload.level = row.level.id
    store.visible = true
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.hrConfirmationsWrite)) return
    store.elementId = row.id
    store._delete()
  }

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
      key: 'position',
      title: t('confirmationPage.table.position'),
      minWidth: 200
    },
    {
      key: 'level.name',
      title: t('confirmationPage.table.level'),
      width: 200
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit32Regular),
      action: onEdit
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      action: onDelete
    }
  ])
</script>

<template>
  <UITable
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="hrm-confirmation"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :data="{
          photo: row?.worker.photo,
          firstName: row?.worker.first_name,
          middleName: row?.worker.middle_name,
          lastName: row?.worker.last_name,
          position: row?.position
        }"
      />
    </template>
  </UITable>
</template>

<style scoped></style>
