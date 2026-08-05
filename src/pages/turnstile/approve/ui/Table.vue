<script setup>
  import { UIStatus, UITable, UIUser } from '@components'
  import i18n from '@/i18n'
  import { useAccountStore, useApproveStore } from '@stores'
  import UIHelper from '@/utils/UIHelper.js'
  import { Utils } from '@utils'
  import { CheckmarkCircle32Regular, Delete20Regular, Edit32Regular } from '@vicons/fluent'

  const accStore = useAccountStore()
  const store = useApproveStore()
  const t = i18n.global.t

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onShow = (row) => {
    if (!accStore.checkAction(accStore.pn.turnstileDevicesWrite)) return
    store.elementId = row.id
    store.approve.visible = true
    store._show()
  }

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.turnstileDevicesWrite)) return
    store.elementId = row.id
    store.visible = true
    store.visibleType = false
    store._show((v) => {
      store.payload.title = v.title
      store.payload.description = v.description
      store.payload.receiver_organization_id = [v.receiver_organization]
      store.payload.access_levels = v.access_levels.map((v) => v.id)
      store.worker.list = v.worker_positions.map((v) => ({
        id: v.id,
        name: Utils.combineFullName(v.worker),
        position: v.post_name
      }))
      store.payload.worker_position_ids = store.worker.list.map((v) => v.id)
      store._accessLevel()

      store.worker.params.page = 1
      store.worker.params.search = null
      store._workers()
    })
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.turnstileDevicesWrite)) return
    store.elementId = row.id
    store._delete()
  }

  const actionStatus = {
    sended: {
      id: 2,
      name: t('approve.form.sended')
    },
    received: {
      id: 9,
      name: t('approve.form.received')
    }
  }

  const approveStatus = {
    1: {
      id: 1,
      name: t('content.process')
    },
    2: {
      id: 3,
      name: t('uploadReport.form.confirmed')
    },
    3: {
      id: 4,
      name: t('content.Rejected')
    }
  }

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.worker'),
      minWidth: 300
    },
    {
      key: 'organization',
      title: t('content.organization'),
      width: 300
    },
    {
      key: 'title',
      title: t('content.name'),
      width: 300
    },
    {
      key: 'description',
      title: t('content.description'),
      width: 300
    },
    {
      key: 'approved',
      title: t('content.status'),
      width: 140
    },
    {
      key: 'status',
      title: t('content.status'),
      width: 140
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit32Regular),
      action: onEdit,
      visible: (row) => row.status === 'sended' && row.approved === 1
    },
    {
      label: t('content.confirm'),
      key: Utils.ActionTypes.confirm,
      icon: UIHelper.renderIcon(CheckmarkCircle32Regular),
      action: onShow,
      visible: (row) => row.status === 'received' && row.approved === 1
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      action: onDelete,
      visible: (row) => row.status === 'sended' && row.approved !== 2
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
    storage-key="turnstile-approve"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :data="{
          photo: row?.user?.worker?.photo,
          lastName: row?.user?.worker?.last_name,
          firstName: row?.user?.worker?.first_name,
          middleName: row?.user?.worker?.middle_name,
          position: row?.organization?.name
        }"
      />
    </template>

    <template #cell-organization="{ row }">
      {{ row.status === 'received' ? row?.organization?.name : row?.receiver_organization?.name }}
    </template>

    <template #cell-approved="{ row }">
      <UIStatus :status="approveStatus[row.approved]" />
    </template>

    <template #cell-status="{ row }">
      <UIStatus :status="actionStatus[row.status]" />
    </template>
  </UITable>
</template>
