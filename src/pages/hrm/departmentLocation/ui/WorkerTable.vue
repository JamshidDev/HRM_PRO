<script setup>
  // Mobile face: xodimga bittalab o'tish joyi berish (org-scope backendda).
  import { computed } from 'vue'
  import { UITable } from '@/components/index.js'
  import { useDepartmentLocationStore } from '@/store/modules/index.js'
  import { useAccountStore } from '@/store/modules/app/accountStore.js'
  import { Add16Filled, Eye16Regular, Location20Filled, Person20Filled, CheckmarkCircle20Regular } from '@vicons/fluent'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  // Nuqtali ustun kalitlari uchun slot nomi — `#cell-a\.b` modifikator deb o'qiladi.
  const SLOT_DEPARTMENT = 'cell-department.name'
  const SLOT_ORGANIZATION = 'cell-organization.name'

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
    { key: 'worker', title: t('content.worker'), minWidth: 240 },
    { key: 'department.name', title: t('departmentLocationPage.table.department'), minWidth: 190 },
    { key: 'organization.name', title: t('departmentLocationPage.table.organization'), minWidth: 180 },
    { key: 'locations', title: t('departmentLocationPage.table.hasLocation'), minWidth: 180 }
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
      <div class="flex items-center gap-2.5">
        <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
          <n-icon size="16"><Person20Filled /></n-icon>
        </div>
        <div class="flex flex-col min-w-0">
          <span class="font-medium text-textColor0 leading-5 truncate">{{ fullName(row) }}</span>
          <span v-if="row.post_name" class="text-xs text-textColor3 leading-4 truncate">{{ row.post_name }}</span>
        </div>
      </div>
    </template>

    <template #[SLOT_DEPARTMENT]="{ row }">
      <span class="text-textColor1 text-xs">{{ row.department?.name || '—' }}</span>
    </template>

    <template #[SLOT_ORGANIZATION]="{ row }">
      <span class="text-textColor1 text-xs">{{ row.organization?.name || '—' }}</span>
    </template>

    <template #cell-locations="{ row }">
      <div class="flex items-center gap-2 flex-wrap">
        <n-tag
          v-if="row.locations_count > 0"
          type="info"
          round
          size="small"
          class="cursor-pointer transition-all hover:opacity-85 font-medium select-none shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          @click.stop="store.openWorkerLocations(row)"
        >
          <template #icon>
            <n-icon size="13"><Location20Filled /></n-icon>
          </template>
          {{ $t('departmentLocationPage.locationCount', { n: row.locations_count }) }}
        </n-tag>
        <n-tag
          v-if="row.free"
          size="small"
          round
          type="success"
          class="gap-1 font-medium select-none"
        >
          <template #icon><n-icon size="13"><CheckmarkCircle20Regular /></n-icon></template>
          {{ $t('departmentLocationPage.freeBadge') }}
        </n-tag>
        <n-tag
          v-if="row.locations_count === 0 && !row.free"
          size="small"
          round
          :bordered="false"
          class="bg-surface-ground text-textColor3 text-xs select-none"
        >
          {{ $t('departmentLocationPage.noLocation') }}
        </n-tag>
      </div>
    </template>
  </UITable>
</template>
