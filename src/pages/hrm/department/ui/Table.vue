<script setup>
  import { UITable } from '@/components/index.js'
import i18n from '@/i18n/index.js'
import { useAccountStore, useComponentStore, useDepartmentStore } from '@/store/modules/index.js'
import UIHelper from '@/utils/UIHelper.js'
import Utils from '@/utils/Utils.js'
import { Delete20Regular, Edit32Regular, Eye16Regular, OpenFolder24Filled } from '@vicons/fluent'

  const { t } = i18n.global

  const store = useDepartmentStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()

  const headerOption = [
    { name: t('content.nameUz'), id: 'uz' },
    { name: t('content.nameRu'), id: 'ru' },
    { name: t('content.nameEn'), id: 'en' }
  ]

  const onLoad = (row) => store._loadChildren(row)

  const onPreview = (row) => {
    store.previewVisible = true
    store.elementId = row.id
    store.previewParams.page = 1
    store.previewList = []
    store.previewTotal = 0
    store._preview()
  }

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.hrDepartmentsWrite)) return
    store.elementId = row.id
    componentStore._departments()
    componentStore._regions()
    store._level()
    store.payload.name = row.name
    store.payload.name_ru = row.name_ru
    store.payload.name_en = row.name_en
    store.payload.comment = row.comment
    store.payload.level = row.level.id
    store.showParent = Boolean(row.parent?.id)
    store.payload.parent_id = row.parent?.id
    store.payload.region_id = row.region?.id ?? row.region_id ?? null
    store.payload.city_id = row.city?.id ?? row.city_id ?? null
    if (store.payload.region_id) {
      store._districts(store.payload.region_id)
    }
    componentStore.departmentList = [row.parent]
    store.refreshTarget = row.__parent
    store.visibleType = false
    store.visible = true
  }

  const onAddChild = (row) => {
    if (!accStore.checkAction(accStore.pn.hrDepartmentsWrite)) return
    componentStore._departments()
    componentStore._structures()
    componentStore._regions()
    store._level()
    store.resetForm()
    store.elementId = row.id
    store.parentElement = { name: row.name, id: row.id }
    store.payload.parent_id = row.id
    store.refreshTarget = row
    store.visibleType = true
    store.visible = true
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.hrDepartmentsWrite)) return
    store._delete(row)
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: '__tree',
      width: 48,
      align: 'center',
      ellipsis: false,
      tree: true
    },
    {
      key: 'name',
      minWidth: 250
    },
    {
      key: 'organization.name',
      title: t('content.organization'),
      minWidth: 200
    },
    {
      key: 'level.name',
      title: t('departmentPage.form.level'),
      width: 160
    },
    {
      key: 'worker_rate',
      title: t('departmentPositionPage.table.fact'),
      width: 100,
      align: 'center'
    },
    {
      key: 'comment',
      title: t('content.comment'),
      width: 200
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.attachment'),
      key: Utils.ActionTypes.attachment,
      icon: UIHelper.renderIcon(OpenFolder24Filled),
      action: onAddChild
    },
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
    },
    {
      label: t('content.worker'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      action: onPreview
    }
  ])
</script>

<template>
  <UITable
    permission-prefix="hr-departments"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    :on-load="onLoad"
    storage-key="hrm-department"
    @change-page="changePage"
  >
    <template #cell-__index="{ row, index }">
      {{ row.__parent ? '' : (store.params.page - 1) * store.params.per_page + index + 1 }}
    </template>

    <template #header-name>
      <n-select
        v-model:value="store.headerLang"
        :options="headerOption"
        value-field="id"
        label-field="name"
        class="min-w-32"
      />
    </template>

    <template #cell-name="{ row }">
      {{ row[store.headerLang] }}
    </template>

    <template #cell-worker_rate="{ row }">
      <n-button v-if="row.worker_rate" size="small" circle>{{ row.worker_rate }}</n-button>
    </template>

    <template #cell-comment="{ row }">
      <div class="text-xs line-clamp-3">{{ row.comment }}</div>
    </template>
  </UITable>
</template>

<style>
  td[data-col-key='__tree'] {
    vertical-align: middle !important;
  }

  td[data-col-key='__tree'] .n-data-table-expand-trigger {
    margin-right: 0;
  }
</style>
