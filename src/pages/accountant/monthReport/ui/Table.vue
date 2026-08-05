<script setup>
  import { UITable, UIUser } from '@/components/index.js'
  import { useMonthReportStore } from '@/store/modules/index.js'
  import { CheckmarkCircle24Filled, ErrorCircle24Filled } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useMonthReportStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onSort = (key) => {
    if (key === 'status') store._filterStatus(key)
    else store._filterCol(key)
  }

  const onShow = (row) => {
    store.visible = true
    store.elementId = row.pin
    store.showPrams.year = store.params.year
    store.showPrams.month = store.params.month
    store.workerPhotoUrl = row.worker?.photo
    store._show()
  }

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.fullName'),
      minWidth: 220
    },
    {
      key: 'status',
      title: t('content.status'),
      width: 100,
      align: 'center',
      sortable: true
    },
    {
      key: 'organization.name',
      title: t('content.organization'),
      minWidth: 260
    },
    {
      key: 'main_salary',
      title: t('monthReport.form.salary'),
      width: 200,
      align: 'right',
      sortable: true
    },
    {
      key: 'total_one',
      title: t('monthReport.form.totalOne'),
      width: 130,
      align: 'right',
      sortable: true
    },
    {
      key: 'total_three',
      title: t('monthReport.form.totalTwo'),
      width: 130,
      align: 'right',
      sortable: true
    },
    {
      key: 'total_four',
      title: t('monthReport.form.totalThree'),
      width: 140,
      align: 'right',
      sortable: true
    },
    {
      key: 'total_five',
      title: t('monthReport.form.totalFour'),
      width: 130,
      align: 'right',
      sortable: true
    },
    {
      key: 'work_time',
      title: t('monthReport.form.work_time'),
      width: 130,
      align: 'right',
      sortable: true
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
    :sort-by="store.params.sort_by"
    :sort-order="store.params.sort_order"
    storage-key="accountant-month-report"
    @change-page="changePage"
    @sort="onSort"
  >
    <template #cell-worker="{ row }">
      <UIUser
        v-if="row.worker"
        :short="false"
        :data="{
          photo: row?.worker.photo,
          firstName: row?.worker.first_name,
          middleName: row?.worker.middle_name,
          lastName: row?.worker.last_name,
          position: row?.pin
        }"
      />
      <template v-else>
        <UIUser
          :short="false"
          :data="{
            photo: '',
            firstName: '',
            middleName: '',
            lastName: '',
            position: ''
          }"
        >
          <template #name>
            <p class="truncate text-nowrap">{{ row.full_name }}</p>
          </template>
          <template #position>
            <span class="text-xs text-textColor3"> {{ row?.pin }}</span>
          </template>
        </UIUser>
      </template>
    </template>

    <template #cell-status="{ row }">
      <n-icon size="26" :class="[row.worker ? 'text-success' : 'text-danger']">
        <CheckmarkCircle24Filled v-if="row.worker" />
        <ErrorCircle24Filled v-else />
      </n-icon>
    </template>

    <template #cell-total_four="{ row }">
      <n-button size="tiny" :type="row.diff ? 'success' : 'error'" dashed @click="onShow(row)">
        {{ row.total_four }}
      </n-button>
    </template>
  </UITable>
</template>
