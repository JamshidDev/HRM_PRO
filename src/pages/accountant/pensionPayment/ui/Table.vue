<script setup>
  import { UITable, UIUser } from '@/components/index.js'
  import { usePensionStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { CheckmarkCircle24Filled, ErrorCircle24Filled } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = usePensionStore()

  const onChange = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.fullName'),
      minWidth: 200
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
      minWidth: 250
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
      key: 'income_tax_paid',
      title: t('pensionPayment.form.income_tax_paid'),
      width: 160,
      align: 'right'
    },
    {
      key: 'mandatory_pension_contribution',
      title: t('pensionPayment.form.mandatory_pension_contribution'),
      width: 130,
      align: 'right'
    },
    {
      key: 'voluntary_pension_contribution',
      title: t('pensionPayment.form.voluntary_pension_contribution'),
      width: 130,
      align: 'right'
    },
    {
      key: 'total_contributions',
      title: t('pensionPayment.form.total_contributions'),
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
    storage-key="accountant-pension-payment"
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
            <p class="truncate text-nowrap">
              {{ `${row?.last_name} ${row?.first_name} ${row?.middle_name}` }}
            </p>
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
  </UITable>
</template>
