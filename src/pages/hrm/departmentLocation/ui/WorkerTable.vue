<script setup>
  // Mobile face: xodimga bittalab o'tish joyi berish (org-scope backendda).
  import { UITable } from '@/components/index.js'
  import { useDepartmentLocationStore } from '@/store/modules/index.js'
  import { useAccountStore } from '@/store/modules/app/accountStore.js'
  import { Add16Filled, Eye16Regular } from '@vicons/fluent'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useDepartmentLocationStore()
  const accStore = useAccountStore()
  const canWrite = computed(() => accStore.checkPermission(accStore.pn.departmentLocationWrite))

  const fullName = (row) => Utils.combineFullName(row)

  const changePage = (v) => {
    store.workerParams.page = v.page
    store.workerParams.per_page = v.per_page
    store._workerIndex()
  }

  const columns = computed(() => [
    { key: 'worker', title: t('content.worker'), minWidth: 220 },
    { key: 'department.name', title: t('departmentLocationPage.table.department'), minWidth: 180 },
    { key: 'organization.name', title: t('departmentLocationPage.table.organization'), minWidth: 180 },
    { key: 'locations', title: t('departmentLocationPage.table.hasLocation'), minWidth: 160 }
  ])

  const actions = computed(() => [
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      visible: (row) => row.locations_count > 0,
      action: (row) => store.openWorkerLocations(row)
    },
    {
      label: t('content.add'),
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
    <template #cell-worker="{ row }">
      <span class="text-textColor0">{{ fullName(row) }}</span>
    </template>
    <template #cell-locations="{ row }">
      <div class="flex items-center gap-2">
        <button
          v-if="row.locations_count > 0"
          type="button"
          class="dl-locations-link"
          @click.stop="store.openWorkerLocations(row)"
        >
          {{ $t('departmentLocationPage.locationCount', { n: row.locations_count }) }}
        </button>
        <span v-else class="dl-locations-empty">{{ $t('departmentLocationPage.noLocation') }}</span>
        <n-tag v-if="row.free" size="small" round type="success">
          {{ $t('departmentLocationPage.freeBadge') }}
        </n-tag>
      </div>
    </template>
  </UITable>
</template>

<style scoped>
  .dl-locations-link {
    color: var(--primary-color);
    font-size: 14px;
    line-height: 20px;
    cursor: pointer;
    background: none;
    border: 0;
    padding: 0;
  }
  .dl-locations-link:hover {
    text-decoration: underline;
  }
  .dl-locations-empty {
    color: var(--textColor2);
    font-size: 14px;
    line-height: 20px;
  }
</style>
