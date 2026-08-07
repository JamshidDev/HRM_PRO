<script setup>
  import { UIStatus, UITable } from '@/components/index.js'
  import { useAccountStore, useStaffingApprovalStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { Delete20Regular, Eye16Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useStaffingApprovalStore()
  const accStore = useAccountStore()
  const emits = defineEmits(['openOffice'])

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.economistStaffingApproveWrite)) return
    store.elementId = row.id
    store._delete()
  }

  const onOpen = (id) => {
    emits('openOffice', id)
  }

  const onView = (row) => {
    if (!accStore.checkAction(accStore.pn.economistStaffingApproveRead)) return
    store.elementId = row.id
    onOpen(row.id)
  }

  const columns = computed(() => [
    {
      key: 'number',
      title: t('confirmation.contract.form.number'),
      width: 100,
      align: 'center'
    },
    {
      key: 'organization.name',
      title: t('confirmation.contract.form.organization'),
      minWidth: 260
    },
    {
      key: 'confirmation',
      title: t('content.status'),
      width: 140
    },
    {
      key: 'generate',
      title: t('content.document'),
      width: 140
    },
    {
      key: 'date',
      title: t('content.date'),
      width: 140
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
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      action: onDelete,
      visible: store.canShowFilter
    }
  ])
</script>

<template>
  <UITable
    permission-prefix="economist-staffing-approve"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="accountant-staffing-approval"
    @change-page="changePage"
  >
    <template #cell-number="{ row }">
      <div @click="onOpen(row.id)" class="flex justify-center">
        <n-button type="primary" class="font-medium" round dashed size="tiny">
          {{ row?.number }}
        </n-button>
      </div>
    </template>

    <template #cell-confirmation="{ row }">
      <UIStatus :status="row?.confirmation" />
    </template>

    <template #cell-generate="{ row }">
      <UIStatus :status="Utils.documentStatus[row?.generate]" />
    </template>

    <template #cell-date="{ row }">
      {{ Utils.timeOnlyDate(row?.date) }}
    </template>
  </UITable>
</template>
