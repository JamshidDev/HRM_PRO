<script setup>
  // «Xodimlar» tab — barcha xodimlar bo'yicha saralanadigan + qidiriladigan
  // jadval (maket #etbl). Manba: store.emps. Naive-ui n-data-table.
  import { ref, computed, h } from 'vue'
  import i18n from '@/i18n/index.js'
  import { useSalaryControlStore } from '@/store/modules/index.js'
  import { money, normText } from '../helpers.js'
  import { SECTION, COLUMN } from '../explain.js'
  import Card from './Card.vue'
  import ScSkeleton from './ScSkeleton.vue'
  import InfoHint from './InfoHint.vue'

  const { t } = i18n.global
  const store = useSalaryControlStore()

  // Ustun sarlavhasi + (i) izoh (COLUMN dan) — har ustun "qanday hisoblangani" tushunarli.
  const th = (label, key) =>
    COLUMN[key]
      ? () =>
          h(
            'span',
            { style: 'display:inline-flex;align-items:center;gap:4px' },
            [label, h(InfoHint, { text: COLUMN[key] })]
          )
      : label

  // —— Qidiruv ——————————————————————————————————————————————————————————
  const q = ref('')

  // ⚠ belgisi — 14 tekshiruvda uchraydigan xodimlar.
  const flagged = computed(() => new Set(store.scFindings.map((f) => f.fio)))

  // —— Qatorlar (JSHSHIR bo'yicha birlashtirilgan — maketdagi `people`) ————
  const rows = computed(() => {
    const query = q.value.trim().toLowerCase()
    return store.people
      .filter((p) => (p.tot || 0) > 0 || (p.ytd || 0) > 0)
      .filter((p) => !query || (p.fio || '').toLowerCase().includes(query))
      .map((p) => ({
        fio: p.fio || '—',
        flagged: flagged.value.has(p.fio),
        lav: p.lav || '—',
        ok: p.ok || 0,
        t: p.t || 0,
        b004: p.b004 || 0,
        b011: p.b011 || 0,
        other: p.oth || 0,
        tot: p.tot || 0,
        card: p.card || 0,
        ytd: p.ytd || 0
      }))
  })

  // —— Raqamli ustun uchun umumiy solishtiruv ————————————————————————————
  const num = (k) => (a, b) => (a[k] || 0) - (b[k] || 0)
  const moneyCell = (k) => (row) => money(row[k])

  const columns = computed(() => [
    {
      title: th(t('salaryControl.risk.table.fio'), 'fio'),
      key: 'fio',
      minWidth: 240,
      fixed: 'left',
      ellipsis: { tooltip: true },
      sorter: (a, b) => String(a.fio).localeCompare(String(b.fio)),
      render: (row) =>
        row.flagged
          ? h('span', [h('span', { style: 'color:var(--fig-icon-red)' }, '⚠ '), normText(row.fio)])
          : normText(row.fio)
    },
    {
      title: th(t('salaryControl.risk.table.position'), 'lav'),
      key: 'lav',
      minWidth: 200,
      ellipsis: { tooltip: true },
      render: (row) => row.lav || t('salaryControl.common.notSet')
    },
    {
      title: th(t('salaryControl.employees.oklad'), 'ok'),
      key: 'ok',
      align: 'right',
      minWidth: 120,
      className: 'sc-num',
      sorter: num('ok'),
      render: moneyCell('ok')
    },
    {
      title: th(t('salaryControl.employees.hours'), 't'),
      key: 't',
      align: 'right',
      minWidth: 120,
      className: 'sc-num',
      sorter: num('t'),
      render: (row) => (row.t ? row.t : '—')
    },
    {
      title: th(t('salaryControl.employees.b004'), 'b004'),
      key: 'b004',
      align: 'right',
      minWidth: 120,
      className: 'sc-num',
      sorter: num('b004'),
      render: moneyCell('b004')
    },
    {
      title: th(t('salaryControl.employees.b011'), 'b011'),
      key: 'b011',
      align: 'right',
      minWidth: 120,
      className: 'sc-num',
      sorter: num('b011'),
      render: moneyCell('b011')
    },
    {
      title: th(t('salaryControl.employees.other'), 'oth'),
      key: 'other',
      align: 'right',
      minWidth: 120,
      className: 'sc-num',
      render: (row) => (row.other ? money(row.other) : '—')
    },
    {
      title: th(t('salaryControl.common.total'), 'tot'),
      key: 'tot',
      align: 'right',
      minWidth: 140,
      className: 'sc-num sc-num--bold',
      sorter: num('tot'),
      render: (row) => h('b', money(row.tot))
    },
    {
      title: th(t('salaryControl.employees.card'), 'card'),
      key: 'card',
      align: 'right',
      minWidth: 120,
      className: 'sc-num',
      render: moneyCell('card')
    },
    {
      title: th(t('salaryControl.employees.ytd'), 'ytd'),
      key: 'ytd',
      align: 'right',
      minWidth: 120,
      className: 'sc-num',
      sorter: num('ytd'),
      render: moneyCell('ytd')
    }
  ])

  const pagination = {
    pageSize: 20,
    showSizePicker: true,
    pageSizes: [20, 50, 100],
    prefix: ({ itemCount }) => `${t('salaryControl.common.total')}: ${itemCount}`
  }
</script>

<template>
  <ScSkeleton v-if="store.dashboardLoading" variant="table" />
  <Card v-else :title="$t('salaryControl.employees.title')" :sub="$t('salaryControl.employees.sub')" :info="SECTION.employees.info">
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
      :scroll-x="1360"
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
