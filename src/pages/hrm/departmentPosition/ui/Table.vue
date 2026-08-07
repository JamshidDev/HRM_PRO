<script setup>
  import { UITable } from '@/components/index.js'
import i18n from '@/i18n/index.js'
import UIHelper from '@/utils/UIHelper.js'
import { useAccountStore, useComponentStore, useDepartmentPositionStore } from '@stores'
import { Utils } from '@utils'
import { Delete24Regular, Edit32Regular, Eye16Regular } from '@vicons/fluent'

  const { t } = i18n.global

  const store = useDepartmentPositionStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.hrPositionsWrite)) return
    componentStore.depParams.organizations = [row.organization?.id]
    if (componentStore.educationList.length === 0) {
      componentStore._enums()
    }
    componentStore._structures()
    componentStore.getDepartmentState(store.depParams.key)
    componentStore.departments[store.depParams.key].list = [row.department]
    componentStore._positions()
    store.visibleType = false
    store.elementId = row.id
    Object.assign(store.payload, {
      organization_id: [row.organization],
      position_id: row.position?.id,
      department_id: row.department?.id,
      group: row.group?.id,
      rank: row.rank?.id,
      max_rank: row.max_rank?.id,
      education: row.education?.id,
      rate: row.rate,
      salary: row.salary != null ? String(row.salary) : null,
      experience: row.experience.toString(),
      tariff_grid_id: row.tariff_grid_id ?? null,
      tariff_grid_column: row.tariff_grid_column ?? null
    })
    // Tanlangan setka ustunlarini oldindan yuklaymiz (oklad/ustun ko'rinishi uchun).
    if (row.tariff_grid_id) store._loadGridColumns(row.tariff_grid_id)

    store.visible = true
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.hrPositionsWrite)) return
    store.elementId = row.id
    store._delete()
  }

  const onPreview = (row) => {
    if (!accStore.checkAction(accStore.pn.hrPositionsWrite)) return
    store.preview.visible = true
    store.elementId = row.id
    store.preview.params.page = 1
    store.preview.list = []
    store._preview()
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'position.name',
      title: t('departmentPositionPage.table.position'),
      minWidth: 200
    },
    {
      key: 'department.name',
      title: t('departmentPositionPage.table.department'),
      minWidth: 200
    },
    {
      key: 'organization.name',
      title: t('departmentPositionPage.table.organization'),
      minWidth: 300
    },
    {
      key: 'education.name',
      title: t('departmentPositionPage.table.education'),
      width: 120
    },
    {
      key: 'group',
      title: t('departmentPositionPage.table.group'),
      fullTitle: t('departmentPositionPage.form.group'),
      width: 60,
      align: 'center'
    },
    {
      key: 'rank',
      title: t('departmentPositionPage.table.rank'),
      fullTitle: t('departmentPositionPage.form.rank'),
      width: 60,
      align: 'center'
    },
    {
      key: 'rate',
      title: t('departmentPositionPage.table.rate'),
      fullTitle: t('departmentPositionPage.form.rate'),
      width: 60,
      align: 'center'
    },
    {
      key: 'worker_rate',
      title: t('departmentPositionPage.table.fact'),
      fullTitle: t('departmentPositionPage.form.fact'),
      width: 60,
      align: 'center'
    },
    {
      key: 'experience',
      title: t('departmentPositionPage.table.experience'),
      width: 80
    },
    {
      key: 'salary',
      title: t('departmentPositionPage.table.salary'),
      width: 150
    },
    {
      key: 'total_salary',
      title: t('departmentPositionPage.table.totalSalary'),
      minWidth: 160
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      action: onPreview
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
      icon: UIHelper.renderIcon(Delete24Regular),
      action: onDelete
    }
  ])
</script>

<template>
  <UITable
    permission-prefix="hr-positions"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="hrm-department-position"
    @change-page="changePage"
  >
    <template #cell-group="{ row }">
      <n-button size="small" circle secondary>{{ row.group?.name }}</n-button>
    </template>

    <template #cell-rank="{ row }">
      <n-button size="small" circle secondary>{{ row.rank?.name }}</n-button>
    </template>

    <template #cell-rate="{ row }">
      <n-button :type="row.colorType" secondary size="small" circle>
        {{ row.rate }}
      </n-button>
    </template>

    <template #cell-worker_rate="{ row }">
      <n-button :type="row.colorType" secondary v-if="row.worker_rate" size="small" circle>
        {{ row.worker_rate }}
      </n-button>
    </template>

    <template #cell-experience="{ row }">
      <n-button v-if="row.experience" size="small" circle>
        {{ row.experience }}
      </n-button>
    </template>

    <template #cell-salary="{ row }">
      {{ Utils.formatNumberToMoney(row.salary) }}
    </template>

    <template #cell-total_salary="{ row }">
      <div class="flex flex-col">
        <span :class="Number(row.total_salary) > Number(row.base_salary) ? 'text-primary font-semibold' : ''">
          {{ Utils.formatNumberToMoney(row.total_salary) }}
        </span>
        <span
          v-if="Number(row.total_salary) > Number(row.base_salary)"
          class="text-xs text-secondary"
        >
          {{ $t('departmentPositionPage.form.baseSalary') }}:
          {{ Utils.formatNumberToMoney(row.base_salary) }}
        </span>
      </div>
    </template>
  </UITable>
</template>
