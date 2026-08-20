<script setup>
  import {
    UIStatus,
    UITable,
    UITableBadgeCell,
    UITableNameCell,
    UIUser,
    UIUserGroup
  } from '@/components/index.js'
  import { useAccountStore, useCommandStore, useComponentStore } from '@/store/modules/index.js'
  import {
    CheckmarkCircle32Regular,
    Delete20Regular,
    Edit32Regular,
    Eye16Regular,
    DocumentEdit20Regular
  } from '@vicons/fluent'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useCommandStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()

  const emits = defineEmits(['openOffice', 'openEditorV2'])

  const onOpenFile = (v) => {
    emits('openOffice', v)
  }

  // Tahrirlash v2 — docx-editor.dev muharriri. Tasdiqlangan (SUCCESS) hujjat
  // tahrirlanmaydi; backend ham imzo qo'yilgan bo'lsa rad etadi.
  const isApproved = (row) => row?.confirmation?.id === 3

  const onEditV2 = (row) => {
    if (!accStore.checkAction(accStore.pn.hrCommandsWrite)) return
    emits('openEditorV2', row.id)
  }

  const onView = (row) => {
    if (!accStore.checkAction(accStore.pn.hrCommandsRead)) return
    onOpenFile(row.id)
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.hrCommandsWrite)) return
    store.elementId = row.id
    store._delete()
  }

  const onConfirm = (row) => {
    if (!accStore.checkAction(accStore.pn.hrCommandsWrite)) return
    store.elementId = row.id
    componentStore.files = []
    componentStore.fileVisible = true
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'type',
      title: t('content.type'),
      minWidth: 200
    },
    {
      key: 'command_number',
      title: t('confirmation.contract.form.number'),
      width: 120,
      align: 'center'
    },
    {
      key: 'workers',
      title: t('content.worker'),
      minWidth: 160
    },
    {
      key: 'organization.name',
      title: t('confirmation.contract.form.organization'),
      minWidth: 200
    },
    {
      key: 'confirmation',
      title: t('content.status'),
      width: 140
    },
    {
      key: 'generate',
      title: t('content.document'),
      width: 120
    },
    {
      key: 'command_date',
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
      label: t('docxEditor.title'),
      key: Utils.ActionTypes.editV2,
      icon: UIHelper.renderIcon(DocumentEdit20Regular),
      disabled: (row) =>
        isApproved(row) || !accStore.checkPermission(accStore.pn.hrCommandsWrite),
      action: onEditV2
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      action: onDelete
    },
    {
      label: t('content.confirm'),
      key: Utils.ActionTypes.confirm,
      icon: UIHelper.renderIcon(CheckmarkCircle32Regular),
      action: onConfirm
    }
  ])
</script>

<template>
  <UITable
    permission-prefix="hr-commands"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="hrm-command"
    @change-page="changePage"
  >
    <template #cell-type="{ row }">
      <UITableNameCell
        :name="row?.type?.name"
        :created-at="row.created_at"
        @click="onOpenFile(row.id)"
      />
    </template>

    <template #cell-command_number="{ row }">
      <UITableBadgeCell :number="row?.command_number" type="primary" />
    </template>

    <template #cell-workers="{ row }">
      <UIUser
        v-if="row.workers.length === 1"
        :short="true"
        :data="{
          photo: row.workers[0].worker?.photo,
          lastName: row.workers[0].worker.last_name,
          firstName: row.workers[0].worker.first_name,
          middleName: row.workers[0].worker.middle_name,
          position: ''
        }"
      />
      <UIUserGroup
        v-else
        class="relative"
        :has-more="row.workers.length > 4 ? row.workers.length - 4 : 0"
        :data="
          row.workers.map((v) => ({
            photo: v?.worker?.photo,
            fullName: v?.worker?.last_name + ' ' + v?.worker?.first_name
          }))
        "
      />
    </template>

    <template #cell-confirmation="{ row }">
      <UIStatus :status="row?.confirmation" />
    </template>

    <template #cell-generate="{ row }">
      <UIStatus :status="Utils.documentStatus[row?.generate]" />
    </template>

    <template #cell-command_date="{ row }">
      {{ Utils.timeOnlyDate(row?.command_date) }}
    </template>
  </UITable>
</template>
