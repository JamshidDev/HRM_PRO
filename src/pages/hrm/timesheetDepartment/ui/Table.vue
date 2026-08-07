<script setup>
  import { UITable, UIUser, UIWorkerView } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, useTimesheetDepartmentStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { AppsList24Regular, Delete20Regular } from '@vicons/fluent'

  const { t } = i18n.global

  const accStore = useAccountStore()
  const store = useTimesheetDepartmentStore()

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.hrTableWrite)) return
    const data = {
      worker_position_id: row.id
    }
    store._delete(data)
  }

  const onViewDepartments = (row) => {
    console.log(row.departments)
    store.previewList = row.departments
    store.listVisible = true
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.worker'),
      minWidth: 200,
    },
    {
      key: 'departments',
      title: t('content.departments'),
      minWidth: 200,
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      action: onDelete
    },
    {
      label: t('content.departments'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(AppsList24Regular),
      action: onViewDepartments
    }
  ])
</script>

<template>
  <UIWorkerView ref="previewRef" />

  <UITable
    permission-prefix="hr-table"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="hrm-timesheet-department"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :data="{
          photo: row?.worker.photo,
          firstName: row?.worker.first_name,
          middleName: row?.worker.middle_name,
          lastName: row?.worker.last_name,
          position: row?.position_name
        }"
      />
    </template>

    <template #cell-departments="{ row }">
      {{ row.departments?.[0]?.department?.name }}

      <n-button
        v-if="row.departments.length > 1"
        class="!ml-2"
        size="small"
        secondary
        type="primary"
        @click="onViewDepartments(row)"
      >
        +{{ row.departments.length - 1 }}
      </n-button>
    </template>
  </UITable>
</template>
