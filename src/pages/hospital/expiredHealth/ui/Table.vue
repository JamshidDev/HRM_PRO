<script setup>
  import { UIBadge, UIStatus, UITable, UIUser } from '@/components/index.js'
  import { useExpiredHealthStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import { Delete20Regular, Edit32Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useExpiredHealthStore()

  const onEdit = (row) => {
    store.visibleType = false
    store.elementId = row.id
    store.payload.name = row.name
    store.payload.marker.coords = [row.long, row.lat]
    store.payload.marker.name = row.name
    store.payload.region_id = row.region.id
    store.visible = true
  }

  const onDelete = (row) => {
    store.elementId = row.id
    store._delete()
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const openFileNewTab = (url) => {
    window.open(url, '_blank')
  }
  const columns = computed(() => [
    {
      key: 'worker',
      title: t('confirmationPage.table.worker'),
      minWidth: 220
    },
    {
      key: 'status',
      title: t('medPage.form.status'),
      width: 140
    },
    {
      key: 'days',
      title: t('date.day'),
      width: 200
    },
    {
      key: 'organization.name',
      title: t('medPage.form.organization'),
      minWidth: 220
    },
    {
      key: 'from',
      title: t('medPage.form.from'),
      width: 140
    },
    {
      key: 'to',
      title: t('medPage.form.to'),
      width: 140
    },
    {
      key: 'file',
      title: t('content.file'),
      width: 110
    },
    {
      key: 'comment',
      title: t('medPage.form.comment'),
      width: 140
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit32Regular),
      action: onEdit,
      visible: false
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      action: onDelete,
      visible: false
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
    storage-key="hospital-expired-health"
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

    <template #cell-status="{ row }">
      <UIStatus
        :status="{
          name: row.status.name,
          id: row.status.id === 1 ? 6 : 5
        }"
      />
    </template>

    <template #cell-days="{ row }">
      <div class="flex flex-col gap-1">
        <UIBadge
          class="!text-xs"
          v-if="row.vacation"
          :show-icon="false"
          :label="Utils.timeOnlyDate(row.vacation) + ' ' + $t('medPage.form.onVacation')"
          :type="Utils.colorTypes.info"
        />
        <UIBadge
          :class="[row.vacation && '!text-xs']"
          :show-icon="false"
          :label="Math.abs(row.days) + ' ' + $t('date.day')"
          :type="row.days < 0 ? Utils.colorTypes.error : Utils.colorTypes.success"
        />
      </div>
    </template>

    <template #cell-from="{ row }">
      <UIBadge
        :show-icon="false"
        :type="Utils.colorTypes.dark"
        :label="Utils.timeOnlyDate(row.from)"
      />
    </template>

    <template #cell-to="{ row }">
      <UIBadge
        :show-icon="false"
        :type="Utils.colorTypes.dark"
        :label="Utils.timeOnlyDate(row.to)"
      />
    </template>

    <template #cell-file="{ row }">
      <n-button size="small" v-if="row.file" @click="openFileNewTab(row.file)">
        {{ $t('content.download') }}
      </n-button>
    </template>
  </UITable>
</template>
