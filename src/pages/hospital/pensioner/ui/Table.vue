<script setup>
  import { UITable, UIUser } from '@/components/index.js'
  import { useMedPensionerStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useMedPensionerStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const yesNo = (v) => (v === 1 ? t('content.yes') : t('content.no'))

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('confirmationPage.table.worker'),
      minWidth: 280
    },
    {
      key: 'position',
      title: t('content.position'),
      minWidth: 200
    },
    {
      key: 'organization.name',
      title: t('content.organization'),
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
      width: 120
    },
    {
      key: 'address',
      title: t('pensioner.form.address'),
      minWidth: 200
    },
    {
      key: 'experience',
      title: t('pensioner.form.experience'),
      width: 120
    },
    {
      key: 'year',
      title: t('pensioner.form.year'),
      width: 100
    },
    {
      key: 'phone',
      title: t('pensioner.form.phone'),
      width: 120
    },
    {
      key: 'invalid',
      title: t('pensioner.form.invalid'),
      width: 100
    },
    {
      key: 'railway_title',
      title: t('pensioner.form.railway_title'),
      width: 100
    },
    {
      key: 'afghan',
      title: t('pensioner.form.afghan'),
      width: 100
    },
    {
      key: 'chernobyl',
      title: t('pensioner.form.chernobyl'),
      width: 100
    }
  ])
</script>

<template>
  <UITable
    :columns="columns"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="hospital-pensioner"
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
      {{ yesNo(row.invalid) }}
    </template>

    <template #cell-railway_title="{ row }">
      {{ yesNo(row.railway_title) }}
    </template>

    <template #cell-afghan="{ row }">
      {{ yesNo(row.afghan) }}
    </template>

    <template #cell-chernobyl="{ row }">
      {{ yesNo(row.chernobyl) }}
    </template>
  </UITable>
</template>
