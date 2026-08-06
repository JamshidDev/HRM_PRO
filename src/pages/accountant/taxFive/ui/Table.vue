<script setup>
  import { UIStatus, UITable, UIUser } from '@/components/index.js'
  import { useTaxFiveStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { CheckmarkCircle24Filled, ErrorCircle24Filled } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useTaxFiveStore()

  const onChange = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.fullName'),
      minWidth: 260
    },
    {
      key: 'presence',
      title: t('content.status'),
      width: 100,
      align: 'center'
    },
    {
      key: 'organization.name',
      title: t('content.organization'),
      minWidth: 200
    },
    {
      key: 'year',
      title: t('content.year'),
      width: 80,
      align: 'center'
    },
    {
      key: 'month',
      title: t('content.month'),
      width: 100,
      align: 'center'
    },
    {
      key: 'total_income',
      title: t('taxFive.form.total_income'),
      width: 130,
      align: 'right'
    },
    {
      key: 'reported_income',
      title: t('taxFive.form.reported_income'),
      width: 130,
      align: 'right'
    },
    {
      key: 'income_type',
      title: t('taxFive.form.income_type'),
      width: 200,
      align: 'right'
    },
    {
      key: 'total_tax',
      title: t('taxFive.form.total_tax'),
      width: 130,
      align: 'right'
    },
    {
      key: 'reported_tax',
      title: t('taxFive.form.reported_tax'),
      width: 130,
      align: 'right'
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
    storage-key="accountant-tax-five"
    @change-page="onChange"
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

    <template #cell-presence="{ row }">
      <n-icon size="26" :class="[row.worker ? 'text-success' : 'text-danger']">
        <CheckmarkCircle24Filled v-if="row.worker" />
        <ErrorCircle24Filled v-else />
      </n-icon>
    </template>

    <template #cell-month="{ row }">
      {{ Utils.getMonthNameById(row.month) }}
    </template>

    <template #cell-income_type="{ row }">
      <UIStatus :status="row.income_type" />
    </template>
  </UITable>
</template>
