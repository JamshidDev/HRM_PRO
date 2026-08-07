<script setup>
  import { UIStatus, UITable, UIUser } from '@/components/index.js'
import i18n from '@/i18n/index.js'
import {
    useAccountStore,
    useBusinessTripStore,
    useComponentStore
} from '@/store/modules/index.js'
import UIHelper from '@/utils/UIHelper.js'
import Utils from '@/utils/Utils.js'
import { Delete20Regular, Edit32Regular } from '@vicons/fluent'

  const { t } = i18n.global

  const store = useBusinessTripStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()

  const onEdit = (v) => {
    if (!accStore.checkAction(accStore.pn.hrBusinessTripWrite)) return
    store.elementId = v.id
    store.payload.organization_id = [v.organization]
    store.payload.month = v.month
    componentStore.workerParams.organization_id = v.organization.id
    componentStore._workers()
    store.payload.worker_position_id = v.id
    store.visibleType = false
    store.visible = true
  }

  const onDelete = (v) => {
    if (!accStore.checkAction(accStore.pn.hrBusinessTripWrite)) return
    store.elementId = v.id
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
      title: t('content.worker'),
      minWidth: 200
    },
    {
      key: 'to_organization',
      title: t('content.organization'),
      minWidth: 200
    },
    {
      key: 'type',
      title: t('content.type'),
      minWidth: 200
    },
    {
      key: 'from',
      title: t('content.from'),
      width: 150
    },
    {
      key: 'to',
      title: t('content.to'),
      width: 150
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

  watch(
    () => store.otherVisible,
    (v) => {
      if (v) return
      store._index()
    },
    { deep: true }
  )
</script>

<template>
  <UITable
    permission-prefix="hr-business-trip"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="hrm-business-trip"
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

    <template #cell-type="{ row }">
      <UIStatus :status="row.type" />
    </template>

    <template #cell-from="{ row }">
      {{ Utils.timeOnlyDate(row.from) }}
    </template>

    <template #cell-to="{ row }">
      {{ Utils.timeOnlyDate(row.to) }}
    </template>
  </UITable>
</template>
