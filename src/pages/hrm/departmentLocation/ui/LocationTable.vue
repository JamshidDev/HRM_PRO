<script setup>
  import { UITable, UIBadge } from '@/components/index.js'
  import { useDepartmentLocationStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import { Add16Filled, Eye16Regular, Edit32Regular, Delete20Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useDepartmentLocationStore()

  const onAdd = () => {
    if (store.selectedDepartment) {
      store.openLocationModal(store.selectedDepartment)
    }
  }

  const onView = (item) => {
    store.openViewModal(item)
  }

  const onEdit = (item) => {
    store.openEditModal(item)
  }

  const onDelete = (item) => {
    store.elementId = item.id
    store._delete()
  }

  const changePage = (v) => {
    store.locationParams.page = v.page
    store.locationParams.per_page = v.per_page
    store._locationIndex()
  }

  const columns = computed(() => [
    {
      key: 'department.name',
      title: t('departmentLocationPage.table.department'),
      minWidth: 200
    },
    {
      key: 'department.organization_name',
      title: t('departmentLocationPage.table.organization'),
      minWidth: 150
    },
    {
      key: 'geo_type',
      title: t('departmentLocationPage.table.geoType'),
      width: 120
    },
    {
      key: 'lat',
      title: t('departmentLocationPage.table.lat'),
      width: 120
    },
    {
      key: 'lng',
      title: t('departmentLocationPage.table.lng'),
      width: 120
    },
    {
      key: 'radius',
      title: t('departmentLocationPage.table.radius'),
      width: 120
    },
    {
      key: 'accuracy_limit',
      title: t('departmentLocationPage.table.accuracy'),
      width: 120
    },
    {
      key: 'create_at',
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
  <!-- Qo'shish tugmasi (tanlangan bo'lim uchun) -->
  <div
    v-if="store.selectedDepartment && store.locationList.length === 0 && !store.locationLoading"
    class="flex justify-center py-4"
  >
    <n-button type="primary" @click="onAdd">
      <template #icon>
        <n-icon>
          <Add16Filled />
        </n-icon>
      </template>
      {{ $t('departmentLocationPage.addLocation') }}
    </n-button>
  </div>
  <n-spin
    v-else-if="store.locationList.length === 0 && store.locationLoading"
    :show="true"
    style="min-height: 200px"
  />
  <UITable
    v-else
    :columns="columns"
    :actions="actions"
    :data="store.locationList"
    :loading="store.locationLoading"
    :page="store.locationParams.page"
    :per-page="store.locationParams.per_page"
    :total="store.locationTotalItems"
    @change-page="changePage"
  >
    <template #cell-geo_type="{ row }">
      <UIBadge
        :show-icon="false"
        :label="row.geo_type ? $t('departmentLocationPage.form.area') : $t('departmentLocationPage.form.coordinate')"
        :type="row.geo_type ? Utils.colorTypes.dark : Utils.colorTypes.primary"
      />
    </template>

    <template #cell-radius="{ row }">
      <UIBadge :show-icon="false" :label="row.radius + ' m'" :type="Utils.colorTypes.info" />
    </template>

    <template #cell-create_at="{ row }">
      {{ Utils.timeOnlyDate(row?.create_at) }}
    </template>
  </UITable>
</template>
