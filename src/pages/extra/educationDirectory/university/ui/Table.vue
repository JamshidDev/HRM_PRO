<script setup>
  import { UITable } from '@/components/index.js'
  import {
    useAccountStore,
    useComponentStore,
    useUniversityAdminStore
  } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { Delete20Regular, Edit32Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const accStore = useAccountStore()
  const store = useUniversityAdminStore()
  const compStore = useComponentStore()

  const headerOption = [
    { name: t('content.nameUz'), id: 'uz' },
    { name: t('content.nameRu'), id: 'ru' },
    { name: t('content.nameEn'), id: 'en' }
  ]

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.universitiesWrite)) return
    store.visibleType = false
    store.elementId = row.id
    store.payload.name = row.name
    store.payload.type = row.type?.id
    store.payload.name_ru = row.name_ru
    store.payload.name_en = row.name_en
    store.payload.region_id = row.city.region.id
    store.payload.city_id = row.city.id
    store.payload.education = row.education.id
    store.visible = true

    if (compStore.regionList.length === 0) {
      compStore._regions()
    }
    if (store.districtList.length === 0) {
      store._getDistrict()
    }
    if (compStore.universityTypes.length === 0) {
      compStore._enumsAdmin()
    }
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.universitiesWrite)) return
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
      key: 'name',
      title: '',
      minWidth: 400
    },
    {
      key: 'city.region.name',
      title: t('othersPage.university.form.region_id'),
      width: 300
    },
    {
      key: 'education.name',
      title: t('othersPage.university.form.education'),
      width: 300
    },
    {
      key: 'type.name',
      title: t('othersPage.university.form.type'),
      width: 300
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
    permission-prefix="universities"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="extra-university"
    @change-page="changePage"
  >
    <template #header-name>
      <n-select
        v-model:value="store.headerLang"
        :options="headerOption"
        value-field="id"
        label-field="name"
      />
    </template>

    <template #cell-name="{ row }">
      {{ row?.[store.headerLang] }}
    </template>
  </UITable>
</template>
