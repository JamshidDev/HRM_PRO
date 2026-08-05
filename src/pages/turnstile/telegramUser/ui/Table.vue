<script setup>
  import { UIBadge, UITable, UIUser } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useTelegramUserStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { Delete20Regular, Edit32Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useTelegramUserStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onEdit = (row) => {
    store.elementId = row.id
    store.payload.user_id = row.id
    store.payload.devices = []
    store._edit()
    store.visibleType = false
    store.visible = true
  }

  const onDelete = (row) => {
    store.elementId = row.id
    store._delete()
  }

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('hcServer.form.name'),
      minWidth: 260
    },
    {
      key: 'devices_count',
      title: t('hcServer.form.workers_count'),
      width: 140
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
    storage-key="turnstile-telegram-user"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        v-if="row.worker"
        :short="false"
        :data="{
          photo: row?.worker.photo,
          firstName: row?.worker.first_name,
          middleName: row?.worker.middle_name,
          lastName: row?.worker.last_name,
          position: row?.id
        }"
      />
    </template>

    <template #cell-devices_count="{ row }">
      <UIBadge :label="String(row.devices_count)" :type="Utils.colorTypes.dark" />
    </template>
  </UITable>
</template>
