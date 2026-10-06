<script setup>
  // «Xodimlar» tab — barcha xodimlar bo'yicha saralanadigan + qidiriladigan
  // jadval (maket #etbl). Manba: store.emps. Naive-ui n-data-table.
  import { ref, computed, h } from 'vue'
  import i18n from '@/i18n/index.js'
  import { useSalaryControlStore } from '@/store/modules/index.js'
  import { money } from '../helpers.js'
  import Card from './Card.vue'
  import ScSkeleton from './ScSkeleton.vue'

  const { t } = i18n.global
  const store = useSalaryControlStore()

  // —— Qidiruv ——————————————————————————————————————————————————————————
  const q = ref('')

  // —— Qatorlar (filtrlangan + hosila ustunlar) —————————————————————————
  const rows = computed(() => {
    const query = q.value.trim().toLowerCase()
    return store.emps
      .filter((e) => !query || (e.fio || '').toLowerCase().includes(query))
      .map((e) => {
        const v = e.v || {}
        const b004 = v['004'] || 0
        const b011 = v['011'] || 0
        const tot = e.tot || 0
        return {
          fio: e.fio || '—',
          lav: e.lav || '—',
          ok: e.ok || 0,
          t: e.t || 0,
          b004,
          b011,
          other: tot - b004 - b011,
          tot,
          card: e.card || 0,
          ytd: e.ytd || 0
        }
      })
  })

  // —— Raqamli ustun uchun umumiy solishtiruv ————————————————————————————
  const num = (k) => (a, b) => (a[k] || 0) - (b[k] || 0)
  const moneyCell = (k) => (row) => money(row[k])

  const columns = computed(() => [
    {
      title: t('salaryControl.risk.table.fio'),
      key: 'fio',
      sorter: (a, b) => String(a.fio).localeCompare(String(b.fio))
    },
    { title: t('salaryControl.risk.table.position'), key: 'lav' },
    {
      title: t('salaryControl.employees.oklad'),
      key: 'ok',
      align: 'right',
      className: 'sc-num',
      sorter: num('ok'),
      render: moneyCell('ok')
    },
    {
      title: t('salaryControl.employees.hours'),
      key: 't',
      align: 'right',
      className: 'sc-num',
      sorter: num('t'),
      render: (row) => (row.t ? row.t : '—')
    },
    {
      title: t('salaryControl.employees.b004'),
      key: 'b004',
      align: 'right',
      className: 'sc-num',
      sorter: num('b004'),
      render: moneyCell('b004')
    },
    {
      title: t('salaryControl.employees.b011'),
      key: 'b011',
      align: 'right',
      className: 'sc-num',
      sorter: num('b011'),
      render: moneyCell('b011')
    },
    {
      title: t('salaryControl.employees.other'),
      key: 'other',
      align: 'right',
      className: 'sc-num',
      render: moneyCell('other')
    },
    {
      title: t('salaryControl.common.total'),
      key: 'tot',
      align: 'right',
      className: 'sc-num sc-num--bold',
      sorter: num('tot'),
      render: (row) => h('b', money(row.tot))
    },
    {
      title: t('salaryControl.employees.card'),
      key: 'card',
      align: 'right',
      className: 'sc-num',
      render: moneyCell('card')
    },
    {
      title: t('salaryControl.employees.ytd'),
      key: 'ytd',
      align: 'right',
      className: 'sc-num',
      sorter: num('ytd'),
      render: moneyCell('ytd')
    }
  ])

  const pagination = {
    pageSize: 20,
    showSizePicker: true,
    pageSizes: [20, 50, 100]
  }
</script>

<template>
  <ScSkeleton v-if="store.dashboardLoading" variant="table" />
  <Card v-else :title="$t('salaryControl.employees.title')" :sub="$t('salaryControl.employees.sub')">
    <template #head>
      <button
        class="sc-export"
        :disabled="store.exporting === 'employees'"
        @click="store._export('employees')"
      >
        {{ store.exporting === 'employees' ? '…' : $t('salaryControl.common.export') }}
      </button>
    </template>
    <div class="sc-toolbar">
      <n-input
        v-model:value="q"
        size="small"
        clearable
        :placeholder="$t('salaryControl.common.search')"
        class="sc-search"
      />
    </div>
    <n-data-table
      :columns="columns"
      :data="rows"
      :pagination="pagination"
      :bordered="false"
      size="small"
    />
  </Card>
</template>

<style scoped>
  .sc-export {
    border: 0;
    background: var(--fig-icon-brand);
    color: #fff;
    border-radius: 10px;
    padding: 7px 14px;
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }
  .sc-export:disabled {
    opacity: 0.6;
    cursor: default;
  }
  .sc-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 12px;
  }
  .sc-search {
    width: 240px;
    max-width: 100%;
  }
  :deep(.sc-num) {
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  :deep(.sc-num--bold) {
    color: var(--fig-text-primary);
  }
</style>
