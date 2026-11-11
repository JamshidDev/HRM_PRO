<script setup>
  import {
    UIStatus,
    UITable,
    UITableBadgeCell,
    UITableNameCell,
    UIUser,
    UIElectronicNumber
  } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useTurnstileDownload } from '@/composables/useTurnstileDownload.js'
  import { useAccountStore, useApplicationStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { Add16Regular, ArrowDownload20Regular, Eye16Regular } from '@vicons/fluent'

  const { t } = i18n.global

  const store = useApplicationStore()
  const accStore = useAccountStore()
  const { open: openTurnstileDownload } = useTurnstileDownload()

  const emits = defineEmits(['openOffice', 'openCommand', 'createCommand'])

  // Tasdiqlangan, buyruqqa mos turdagi va hali buyruqsiz ariza — «Buyruq +».
  const canCreateCommand = (row) =>
    !row?.command &&
    row?.confirmation?.id === 3 &&
    row?.command_types?.length > 0 &&
    accStore.checkPermission(accStore.pn.hrCommandsWrite)

  // HR holati (worker_applications.status): 0 yangi, 1 kelishuvchilarga yo'naltirilgan, 2 HR yopgan.
  const checkingStatus = computed(() => ({
    0: { id: 1, name: t('applicationPage.hrCheck.new') },
    1: { id: 3, name: t('applicationPage.hrCheck.forwarded') },
    2: { id: 4, name: t('applicationPage.hrCheck.closed') }
  }))
  // Rahbar imzolagan ariza ham yopilgan (yashil).
  const closedApproved = computed(() => ({ id: 3, name: t('applicationPage.hrCheck.closed') }))

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

  // Turniket eksporti — backend `turnstile-hik-central-events-read` talab qiladi.
  const onTurnstileDownload = (row) => {
    if (!accStore.checkAction(accStore.pn.turnstileHikCentralEventsRead)) return
    openTurnstileDownload(row?.worker)
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
      key: 'electronic_number',
      title: t('documentSettings.electronicNumber'),
      width: 130
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
      key: 'command',
      title: t('applicationCommand.column'),
      width: 150
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
      label: t('turnstileDownload.title'),
      key: 'turnstileDownload',
      icon: UIHelper.renderIcon(ArrowDownload20Regular),
      visible: (row) =>
        !!row?.worker?.id && accStore.checkPermission(accStore.pn.turnstileHikCentralEventsRead),
      action: onTurnstileDownload
    }
  ])
</script>

<template>
  <UITable
    permission-prefix="hr-worker-applications"
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
      <UITableNameCell
        :name="row?.type?.name"
        :created-at="row.created_at"
        @click="onOpenFile(row.id)"
      />
    </template>

    <template #cell-electronic_number="{ row }">
      <UIElectronicNumber :value="row?.electronic_number" />
    </template>

    <template #cell-number="{ row }">
      <UITableBadgeCell :number="row?.number" type="error" />
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
      <UIStatus :status="row?.confirmation?.id === 3 ? closedApproved : checkingStatus[Number(row?.status)]" />
    </template>

    <template #cell-confirmation="{ row }">
      <UIStatus :status="row.confirmation" />
    </template>

    <template #cell-command="{ row }">
      <button
        v-if="row?.command"
        type="button"
        class="flex flex-col items-start text-left"
        :title="$t('applicationCommand.openCommand')"
        @click="emits('openCommand', row.command)"
      >
        <span class="text-sm font-medium text-primary hover:underline">
          №{{ row.command.command_number || row.command.id }}
        </span>
        <span class="text-xs text-secondary">{{ row.command.confirmation?.name }}</span>
      </button>
      <n-button
        v-else-if="canCreateCommand(row)"
        size="small"
        secondary
        type="primary"
        @click="emits('createCommand', row)"
      >
        <template #icon>
          <Add16Regular />
        </template>
        {{ $t('applicationCommand.create') }}
      </n-button>
      <span v-else class="text-secondary">—</span>
    </template>

    <template #cell-generate="{ row }">
      <UIStatus :status="Utils.documentStatus[row?.generate]" />
    </template>

    <template #cell-created_at="{ row }">
      {{ Utils.timeOnlyDate(row?.created_at) }}
    </template>
  </UITable>
</template>
