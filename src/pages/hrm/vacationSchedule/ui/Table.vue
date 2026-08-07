<script setup>
  import { UIBadge, UIStatus, UITable, UIUser } from '@/components/index.js'
import i18n from '@/i18n'
import { useComponentStore, useVacationScheduleStore } from '@/store/modules/index.js'
import UIHelper from '@/utils/UIHelper.js'
import Utils from '@/utils/Utils.js'
import { useAccountStore } from '@stores'
import {
    CheckmarkCircle32Regular,
    Delete20Regular,
    Edit32Regular,
    Eye16Regular
} from '@vicons/fluent'

  const t = i18n.global.t

  const store = useVacationScheduleStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()

  const emits = defineEmits(['openOffice'])

  const onShow = (v) => {
    emits('openOffice', v.id)
  }

  const onEdit = (v) => {
    if (!accStore.checkAction(accStore.pn.hrVacationScheduleWrite)) return
    store.creator.list = [
      {
        id: v.creator.id,
        name: Utils.combineFullName(v.creator.worker),
        photo: v.creator.worker?.photo,
        position: v.creator.position
      }
    ]

    store.payload.year = v.year
    store.payload.date = Utils.datePickerFormatter(v.date)
    store.payload.director_id = v?.director?.id
    store.payload.trade_union_id = v?.tradeUnion?.id
    store.payload.creator_id = v?.creator?.id
    store.worker.params.year = v.year
    store.worker.params.page = 1
    store.visibleType = false
    store.visible = true
  }

  const onConfirm = (v) => {
    if (!accStore.checkAction(accStore.pn.hrVacationScheduleWrite)) return
    store.elementId = v.id
    componentStore.files = []
    componentStore.fileVisible = true
  }

  const onDelete = (v) => {
    if (!accStore.checkAction(accStore.pn.hrVacationScheduleWrite)) return
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
      key: 'year',
      title: t('content.year'),
      width: 120
    },
    {
      key: 'date',
      title: t('vacationSchedule.form.to_date'),
      width: 120
    },
    {
      key: 'director',
      title: t('documentPage.command.form.director_id'),
      minWidth: 200
    },
    {
      key: 'tradeUnion',
      title: t('vacationSchedule.form.tradeUnion'),
      minWidth: 200
    },
    {
      key: 'creator',
      title: t('content.worker'),
      minWidth: 200
    },
    {
      key: 'organization.name',
      title: t('content.organization'),
      minWidth: 200
    },
    {
      key: 'confirmation',
      title: t('content.status'),
      width: 120
    },
    {
      key: 'generate',
      title: t('content.document'),
      width: 140
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      action: onShow
    },
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit32Regular),
      action: onEdit
    },
    {
      label: t('content.confirm'),
      key: Utils.ActionTypes.confirm,
      icon: UIHelper.renderIcon(CheckmarkCircle32Regular),
      action: onConfirm
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
    permission-prefix="hr-vacation-schedule"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="hrm-vacation-schedule"
    @change-page="changePage"
  >
    <template #cell-year="{ row }">
      <UIBadge :label="row.year" :show-icon="false" />
    </template>

    <template #cell-date="{ row }">
      <UIBadge :label="Utils.timeOnlyDate(row.date)" :show-icon="false" />
    </template>

    <template #cell-director="{ row }">
      <UIUser
        :data="{
          photo: row?.director?.worker.photo,
          firstName: row?.director?.worker.first_name,
          middleName: row?.director?.worker.middle_name,
          lastName: row?.director?.worker.last_name,
          position: row?.director?.position
        }"
      />
    </template>

    <template #cell-tradeUnion="{ row }">
      <UIUser
        :data="{
          photo: row?.tradeUnion?.worker.photo,
          firstName: row?.tradeUnion?.worker.first_name,
          middleName: row?.tradeUnion?.worker.middle_name,
          lastName: row?.tradeUnion?.worker.last_name,
          position: row?.tradeUnion?.position
        }"
      />
    </template>

    <template #cell-creator="{ row }">
      <UIUser
        :data="{
          photo: row?.creator?.worker.photo,
          firstName: row?.creator?.worker.first_name,
          middleName: row?.creator?.worker.middle_name,
          lastName: row?.creator?.worker.last_name,
          position: row?.creator?.position
        }"
      />
    </template>

    <template #cell-confirmation="{ row }">
      <UIStatus :status="row?.confirmation" />
    </template>

    <template #cell-generate="{ row }">
      <UIStatus :status="Utils.documentStatus[row?.generate]" />
    </template>
  </UITable>
</template>
