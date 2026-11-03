<script setup>
  import { computed } from 'vue'
  import { UITable } from '@/components/index.js'
  import { useDepartmentLocationStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import {
    Add16Filled,
    Eye16Regular,
    Edit32Regular,
    Delete20Regular,
    Location20Filled,
    Map20Filled,
    CheckmarkCircle20Regular
  } from '@vicons/fluent'
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
      key: 'name',
      title: t('departmentLocationPage.table.name'),
      minWidth: 180
    },
    {
      key: 'department.name',
      title: t('departmentLocationPage.table.department'),
      minWidth: 200
    },
    {
      key: 'department.organization_name',
      title: t('departmentLocationPage.table.organization'),
      minWidth: 160
    },
    {
      key: 'geo_type',
      title: t('departmentLocationPage.table.geoType'),
      width: 150
    },
    {
      key: 'lat',
      title: t('departmentLocationPage.table.lat'),
      width: 140
    },
    {
      key: 'lng',
      title: t('departmentLocationPage.table.lng'),
      width: 140
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
      width: 130
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
  <!-- Bo'limda hali joylashuv yo'q bo'lsa go'zal bo'sh holat kartasi -->
  <div
    v-if="store.selectedDepartment && store.locationList.length === 0 && !store.locationLoading"
    class="flex flex-col items-center justify-center py-16 px-4 my-4 rounded-2xl border border-dashed border-surface-line bg-surface-section text-center"
  >
    <div class="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
      <n-icon size="28"><Location20Filled /></n-icon>
    </div>
    <div class="text-base font-semibold text-textColor0 mb-1">
      {{ store.selectedDepartment.name }}
    </div>
    <p class="text-sm text-textColor3 max-w-sm mb-5">
      {{ $t('departmentLocationPage.noLocation') }}
    </p>
    <n-button type="primary" size="medium" round class="px-5 shadow-sm" @click="onAdd">
      <template #icon>
        <n-icon><Add16Filled /></n-icon>
      </template>
      {{ $t('departmentLocationPage.addLocation') }}
    </n-button>
  </div>

  <n-spin
    v-else-if="store.locationList.length === 0 && store.locationLoading"
    :show="true"
    style="min-height: 240px"
    class="flex items-center justify-center py-12"
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
    permission-prefix="department-location"
    @change-page="changePage"
  >
    <template #cell-name="{ row }">
      <div class="flex items-center gap-2">
        <n-icon size="15" class="text-primary shrink-0"><Location20Filled /></n-icon>
        <span class="font-medium text-textColor0 truncate">{{ row.name || '—' }}</span>
      </div>
    </template>

    <template #cell-geo_type="{ row }">
      <n-tag v-if="row.is_free" size="small" round type="success" class="gap-1 font-medium">
        <template #icon><n-icon size="13"><CheckmarkCircle20Regular /></n-icon></template>
        {{ $t('departmentLocationPage.freeBadge') }}
      </n-tag>
      <n-tag
        v-else-if="row.geo_type"
        size="small"
        round
        type="info"
        class="gap-1 font-medium"
      >
        <template #icon><n-icon size="13"><Map20Filled /></n-icon></template>
        {{ $t('departmentLocationPage.form.area') }}
      </n-tag>
      <n-tag
        v-else
        size="small"
        round
        :bordered="false"
        class="bg-primary/10 text-primary gap-1 font-medium"
      >
        <template #icon><n-icon size="13"><Location20Filled /></n-icon></template>
        {{ $t('departmentLocationPage.form.coordinate') }}
      </n-tag>
    </template>

    <!-- Erkin rejimda hudud yo'q — radius va aniqlik ko'rsatilmaydi -->
    <template #cell-lat="{ row }">
      <span v-if="row.is_free" class="text-textColor3">—</span>
      <span v-else-if="row.lat !== null && row.lat !== undefined" class="font-mono text-xs text-textColor1 bg-surface-ground px-1.5 py-0.5 rounded">
        {{ Number(row.lat).toFixed(6) }}
      </span>
      <span v-else class="text-textColor3">—</span>
    </template>

    <template #cell-lng="{ row }">
      <span v-if="row.is_free" class="text-textColor3">—</span>
      <span v-else-if="row.lng !== null && row.lng !== undefined" class="font-mono text-xs text-textColor1 bg-surface-ground px-1.5 py-0.5 rounded">
        {{ Number(row.lng).toFixed(6) }}
      </span>
      <span v-else class="text-textColor3">—</span>
    </template>

    <template #cell-radius="{ row }">
      <span v-if="row.is_free" class="text-textColor3">—</span>
      <n-tag v-else size="small" round :bordered="false" class="font-mono text-xs bg-info/10 text-info font-medium">
        {{ row.radius }} m
      </n-tag>
    </template>

    <template #cell-accuracy_limit="{ row }">
      <span v-if="row.is_free" class="text-textColor3">—</span>
      <span v-else class="font-mono text-xs text-textColor1">{{ row.accuracy_limit }} m</span>
    </template>

    <template #cell-create_at="{ row }">
      <span class="text-xs text-textColor3">{{ Utils.timeOnlyDate(row?.create_at) }}</span>
    </template>
  </UITable>
</template>
