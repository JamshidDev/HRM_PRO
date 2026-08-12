<script setup>
  import { UIBadge, UITable, UIUser } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, useWorkerImageStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { CheckmarkCircle32Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useWorkerImageStore()
  const accStore = useAccountStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onConfirm = (row) => {
    if (!accStore.checkAction(accStore.pn.turnstileWorkerImageWrite)) return
    store.elementId = row.id
    store.payload.worker_id = row.worker?.id
    store.payload.photo = row.photo
    store.payload.end_time = null
    store.payload.access_level_ids = []
    store.payload.comment = null
    store.personId = Boolean(row?.person_id)
    store.showCommentArea = false

    store._access_levels()
    store.visible = true
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 1:
        return 'Jarayonda'
      case 2:
        return 'Bajarildi'
      case 3:
        return 'Rad etildi'
      default:
        return 'Xatolik'
    }
  }

  const getStatusType = (status) => {
    switch (status) {
      case 1:
        return Utils.colorTypes.warning
      case 2:
        return Utils.colorTypes.success
      case 3:
        return Utils.colorTypes.warning
      default:
        return Utils.colorTypes.error
    }
  }

  const getDeviceStatusLabel = (personId) => {
    return personId ? "Qo'shilgan" : "Qo'shilmagan"
  }

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('workerPage.name'),
      minWidth: 260
    },
    {
      key: 'status',
      title: t('workerImage.status'),
      width: 200
    },
    {
      key: 'person_id',
      title: t('content.deviceStatus'),
      width: 200
    },
    {
      key: 'error',
      title: `${t('content.error')}/${t('content.comment')}`,
      width: 300
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.confirm'),
      key: Utils.ActionTypes.confirm,
      icon: UIHelper.renderIcon(CheckmarkCircle32Regular),
      action: onConfirm,
      visible: () => accStore.checkPermission(accStore.pn.turnstileWorkerImageWrite)
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
    storage-key="turnstile-worker-image"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        v-if="row.worker"
        :short="false"
        :data="{
          photo: row?.photo,
          firstName: row?.worker.first_name,
          middleName: row?.worker.middle_name,
          lastName: row?.worker.last_name,
          position: row?.worker.id
        }"
      />
    </template>

    <template #cell-status="{ row }">
      <UIBadge
        :show-icon="false"
        :label="getStatusLabel(row.status)"
        :type="getStatusType(row.status)"
      />
    </template>

    <template #cell-person_id="{ row }">
      <UIBadge
        :show-icon="false"
        :label="getDeviceStatusLabel(row.person_id)"
        :type="row.person_id === null ? Utils.colorTypes.error : Utils.colorTypes.success"
      />
    </template>

    <template #cell-error="{ row }">
      <span
        :class="[row.status === 3 ? 'text-primary' : 'text-danger']"
        class="text-xs leading-[1.2] line-clamp-2"
      >
        {{ row.error }}
      </span>
    </template>
  </UITable>
</template>
