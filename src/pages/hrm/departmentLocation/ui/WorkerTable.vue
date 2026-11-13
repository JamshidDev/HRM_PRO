<script setup>
  // Mobile face: xodimga bittalab o'tish joyi berish (org-scope backendda).
  import { UITable, UIUser } from '@/components/index.js'
  import { useDepartmentLocationStore } from '@/store/modules/index.js'
  import { useAccountStore } from '@/store/modules/app/accountStore.js'
  import { Add16Filled, Eye16Regular } from '@vicons/fluent'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import LocationCountChip from './LocationCountChip.vue'

  const { t } = i18n.global
  const store = useDepartmentLocationStore()
  const accStore = useAccountStore()
  const canWrite = computed(() => accStore.checkPermission(accStore.pn.departmentLocationWrite))

  // `photo` (rasm URL) va `position` (asosiy lavozim) — GET /v1/extra/mobile-face/workers javobidan.
  const photoOf = (row) => row?.photo || null
  const positionOf = (row) => row?.position?.name || (typeof row?.position === 'string' ? row.position : '')

  const changePage = (v) => {
    store.workerParams.page = v.page
    store.workerParams.per_page = v.per_page
    store._workerIndex()
  }

  const columns = computed(() => [
    { key: 'worker', title: t('content.worker'), minWidth: 260 },
    { key: 'department.name', title: t('departmentLocationPage.table.department'), minWidth: 200 },
    { key: 'organization.name', title: t('departmentLocationPage.table.organization'), minWidth: 200 },
    { key: 'locations', title: t('departmentLocationPage.table.hasLocation'), minWidth: 200 }
  ])

  const actions = computed(() => [
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      action: (row) => store.openWorkerLocations(row)
    },
    {
      label: t('departmentLocationPage.addLocation'),
      key: 'add',
      icon: UIHelper.renderIcon(Add16Filled),
      disabled: !canWrite.value,
      action: (row) => store.openWorkerLocationModal(row)
    }
  ])
</script>

<template>
  <UITable
    :columns="columns"
    :actions="actions"
    :data="store.workerList"
    :loading="store.workerLoading"
    :page="store.workerParams.page"
    :per-page="store.workerParams.per_page"
    :total="store.workerTotal"
    permission-prefix="department-location"
    @change-page="changePage"
  >
    <!-- Boshqa jadvallardagi kabi umumiy `UIUser`: rasm (bo'lmasa standart placeholder), F.I.Sh., lavozim -->
    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :highlight="store.workerParams.search || ''"
        :data="{
          photo: photoOf(row),
          lastName: row.last_name ?? '',
          firstName: row.first_name ?? '',
          middleName: row.middle_name ?? '',
          position: positionOf(row)
        }"
      />
    </template>
    <template #cell-locations="{ row }">
      <LocationCountChip
        :count="typeof row.locations_count === 'number' ? row.locations_count : null"
        :has="Boolean(row.locations_count)"
        :free="Boolean(row.free)"
      />
    </template>
  </UITable>
</template>
