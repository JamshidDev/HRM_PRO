<script setup>
  import { UITable, UIUser } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, usePensionerStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { Delete20Regular, Edit32Regular } from '@vicons/fluent'

  const { t } = i18n.global

  const store = usePensionerStore()
  const accStore = useAccountStore()

  // Ilgari bu yerda begona `hrVacationsWrite` tekshirilardi — pensionerlar bo'limi
  // ta'tillarga aloqasi yo'q. Backend `hr-pensioners-*` oilasini enforce qiladi.
  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.hrPensionersWrite)) return
    store.payload.first_name = row.first_name
    store.payload.last_name = row.last_name
    store.payload.middle_name = row.middle_name
    store.payload.sex = Number(row.sex)
    store.payload.experience = row.experience?.toString()
    store.payload.passport = row.passport
    store.payload.pin = row.pin?.toString()
    store.payload.address = row.address
    store.payload.position = row.position
    store.payload.year = new Date().setFullYear(row.year)
    store.payload.phone = row.phone
    store.payload.invalid = Number(row.invalid)
    store.payload.railway_title = Number(row.railway_title)
    store.payload.afghan = Number(row.afghan)
    store.payload.chernobyl = Number(row.chernobyl)

    store.visibleType = false
    store.elementId = row.id
    store.visible = true
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.hrPensionersDelete)) return
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
      title: t('confirmationPage.table.worker'),
      minWidth: 200
    },
    {
      key: 'position',
      title: t('content.position'),
      minWidth: 200
    },
    {
      key: 'pin',
      title: t('pensioner.form.pin'),
      width: 140
    },
    {
      key: 'passport',
      title: t('pensioner.form.passport'),
      width: 140
    },
    {
      key: 'address',
      title: t('pensioner.form.address'),
      minWidth: 200
    },
    {
      key: 'experience',
      title: t('pensioner.form.experience'),
      width: 140
    },
    {
      key: 'year',
      title: t('pensioner.form.year'),
      width: 140
    },
    {
      key: 'phone',
      title: t('pensioner.form.phone'),
      width: 140
    },
    {
      key: 'invalid',
      title: t('pensioner.form.invalid'),
      width: 140
    },
    {
      key: 'railway_title',
      title: t('pensioner.form.railway_title'),
      width: 140
    },
    {
      key: 'afghan',
      title: t('pensioner.form.afghan'),
      width: 140
    },
    {
      key: 'chernobyl',
      title: t('pensioner.form.chernobyl'),
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
    permission-prefix="hr-pensioners"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="hrm-pensioner"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :data="{
          photo: null,
          firstName: row?.first_name,
          middleName: row?.middle_name,
          lastName: row?.last_name,
          position: row?.phone
        }"
      />
    </template>

    <template #cell-experience="{ row }"> {{ row.experience }} {{ $t('content.year') }} </template>

    <template #cell-invalid="{ row }">
      {{ row.invalid === 1 ? $t('content.yes') : $t('content.no') }}
    </template>

    <template #cell-railway_title="{ row }">
      {{ row.railway_title === 1 ? $t('content.yes') : $t('content.no') }}
    </template>

    <template #cell-afghan="{ row }">
      {{ row.afghan === 1 ? $t('content.yes') : $t('content.no') }}
    </template>

    <template #cell-chernobyl="{ row }">
      {{ row.chernobyl === 1 ? $t('content.yes') : $t('content.no') }}
    </template>
  </UITable>
</template>
