<script setup>
  import { UITable, UIUser } from '@/components/index.js'
import i18n from '@/i18n/index.js'
import { useAccountStore, useOrganizationLeaderStore } from '@/store/modules/index.js'
import UIHelper from '@/utils/UIHelper.js'
import Utils from '@/utils/Utils.js'
import { Delete20Regular, Edit32Regular } from '@vicons/fluent'
import { Mask } from 'maska'

  const { t } = i18n.global

  const accStore = useAccountStore()

  const mask = new Mask({ mask: ['##-###-##-##', '##-###'] })
  const store = useOrganizationLeaderStore()

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.hrLeadersWrite)) return
    store.elementId = row.id
    store.visibleType = false
    store.visible = true
    store.payload.phones = [...row.phone]
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.hrLeadersWrite)) return
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
      title: t('content.worker'),
      minWidth: 200
    },
    {
      key: 'organization.name',
      title: t('content.organization'),
      minWidth: 200
    },
    {
      key: 'phone',
      title: t('content.phone'),
      minWidth: 200
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
    permission-prefix="hr-leaders"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="hrm-organization-leader"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :data="{
          photo: row?.worker_position.worker?.photo,
          lastName: row?.worker_position.worker?.last_name,
          firstName: row?.worker_position.worker?.first_name,
          middleName: row?.worker_position.worker?.middle_name
        }"
      />
    </template>

    <template #cell-phone="{ row }">
      <div class="flex gap-2 flex-wrap">
        <n-button v-for="(i, idx) in row.phone" :key="idx" type="primary" dashed size="tiny">
          {{ mask.masked(i) }}
        </n-button>
      </div>
    </template>
  </UITable>
</template>
