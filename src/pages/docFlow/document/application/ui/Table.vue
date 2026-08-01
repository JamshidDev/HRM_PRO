<script setup>
  import { UIStatus, UITable, UIUser } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, useApplicationStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { Delete20Regular, Edit32Regular, Eye16Regular } from '@vicons/fluent'

  const { t } = i18n.global

  const store = useApplicationStore()
  const accStore = useAccountStore()

  const emits = defineEmits(['openOffice'])

  const checkingStatus = {
    0: {
      id: 1,
      name: t('content.Process')
    },
    1: {
      id: 3,
      name: t('content.checked')
    },
    2: {
      id: 4,
      name: t('content.Rejected')
    }
  }

  const onOpenFile = (v) => {
    emits('openOffice', v)
  }

  const onView = (row) => {
    if (!accStore.checkAction(accStore.pn.hrWorkerApplicationsRead)) return
    onOpenFile(row.id)
  }

  // const onEdit = (v) => {
  //   store.visibleType = false
  //   store.elementId = v.id
  //   store.payload.name = v.name
  //   store.visible = true
  // }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.hrWorkerApplicationsWrite)) return
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
      key: 'type',
      title: t('applicationPage.form.type'),
      minWidth: 200
    },
    {
      key: 'number',
      title: t('applicationPage.form.number'),
      width: 120,
      align: 'center'
    },
    {
      key: 'worker',
      title: t('content.worker'),
      minWidth: 200
    },
    {
      key: 'status',
      title: t('content.checkLabel'),
      width: 120
    },
    {
      key: 'confirmation',
      title: t('content.status'),
      width: 120
    },
    {
      key: 'generate',
      title: t('content.document'),
      width: 120
    },
    {
      key: 'created_at',
      title: t('content.date'),
      width: 120
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      action: onView
    },
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit32Regular)
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
    storage-key="hrm-application"
    @change-page="changePage"
  >
    <template #cell-type="{ row }">
      <span
        @click="onOpenFile(row.id)"
        class="group hover:!text-primary hover:underline cursor-pointer"
      >
        {{ row?.type?.name }}
        <br />
        <span class="opacity-65 text-xs group-hover:!text-primary">
          {{ Utils.timeHHMMWithMonth(row.created_at) }}
        </span>
      </span>
    </template>

    <template #cell-number="{ row }">
      <n-button round size="tiny" type="error" dashed>{{ row?.number }}</n-button>
    </template>

    <template #cell-worker="{ row }">
      <UIUser
        :data="{
          photo: row?.worker.photo,
          firstName: row?.worker.first_name,
          middleName: row?.worker.middle_name,
          lastName: row?.worker.last_name,
          position: row?.worker?.birthday
        }"
      />
    </template>

    <template #cell-status="{ row }">
      <UIStatus :status="checkingStatus[Number(row?.status)]" />
    </template>

    <template #cell-confirmation="{ row }">
      <UIStatus :status="row.confirmation" />
    </template>

    <template #cell-generate="{ row }">
      <UIStatus :status="Utils.documentStatus[row?.generate]" />
    </template>

    <template #cell-created_at="{ row }">
      {{ Utils.timeOnlyDate(row?.created_at) }}
    </template>
  </UITable>
</template>
