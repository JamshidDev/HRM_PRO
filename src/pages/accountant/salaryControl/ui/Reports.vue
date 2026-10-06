<script setup>
  // «Hisobotlar» tab — vedomost vs NDFL-4/5/INPS solishtiruvi (store.rc, 4 qator).
  import { computed } from 'vue'
  import i18n from '@/i18n/index.js'
  import { useSalaryControlStore } from '@/store/modules/index.js'
  import { money } from '../helpers.js'
  import Card from './Card.vue'
  import ScSkeleton from './ScSkeleton.vue'

  const { t } = i18n.global
  const store = useSalaryControlStore()

  // Har qator: [nom, vedomost qiymati, hisobot qiymati, manba izohi, benign?]
  // benign=true — farq bo'lsa ham xato deb belgilanmaydi (me'yorda).
  const rows = computed(() => {
    const r = store.rc || {}
    return [
      { label: t('salaryControl.reports.rowFot'), ved: r.fot || 0, rep: r.n4 || 0, src: t('salaryControl.reports.withN4') },
      { label: t('salaryControl.reports.rowNon'), ved: r.non || 0, rep: r.n5 || 0, src: t('salaryControl.reports.withN5'), benign: true },
      { label: t('salaryControl.reports.rowTax'), ved: r.tax || 0, rep: r.ntax || 0, src: t('salaryControl.reports.withN4') },
      { label: t('salaryControl.reports.rowInps'), ved: r.inps || 0, rep: r.ip || 0, src: t('salaryControl.reports.withInps') }
    ].map((x) => {
      const diff = x.ved - x.rep
      const bad = Math.abs(diff) > 1000 && !x.benign
      return { ...x, diff, bad }
    })
  })
</script>

<template>
  <ScSkeleton v-if="store.dashboardLoading" variant="table" />
  <Card v-else :title="$t('salaryControl.reports.title')" :sub="$t('salaryControl.reports.sub')">
    <div class="sc-scroll">
      <table class="sc-tbl">
        <thead>
          <tr>
            <th>{{ $t('salaryControl.reports.indicator') }}</th>
            <th class="num">{{ $t('salaryControl.reports.vedomost') }}</th>
            <th class="num">{{ $t('salaryControl.reports.report') }}</th>
            <th class="num">{{ $t('salaryControl.reports.diff') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in rows" :key="i">
            <td>
              <b>{{ r.label }}</b>
              <div class="sc-muted">{{ r.src }}</div>
            </td>
            <td class="num">{{ money(r.ved) }}</td>
            <td class="num">{{ money(r.rep) }}</td>
            <td class="num" :class="r.bad ? 'sc-diff--bad' : 'sc-diff--ok'">
              {{ r.bad ? '⚠ ' : '✓ ' }}{{ money(r.diff) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </Card>
</template>

<style scoped>
  .sc-scroll {
    overflow: auto;
    border-radius: 12px;
    border: 0.8px solid var(--fig-br-disable);
  }
  .sc-tbl {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 13px;
  }
  .sc-tbl th {
    text-align: left;
    color: var(--fig-text-tertiary);
    font-weight: 600;
    font-size: 12px;
    padding: 11px 12px;
    border-bottom: 1px solid var(--fig-br-disable);
    background: var(--fig-block-header-bg);
    white-space: nowrap;
  }
  .sc-tbl td {
    padding: 12px;
    border-bottom: 1px solid var(--fig-br-disable);
    color: var(--fig-text-secondary);
  }
  .sc-tbl td b {
    color: var(--fig-text-primary);
  }
  .sc-tbl .num {
    text-align: right;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .sc-muted {
    color: var(--fig-text-tertiary);
    font-size: 12px;
    margin-top: 3px;
  }
  .sc-diff--bad {
    color: var(--fig-text-red);
    font-weight: 600;
  }
  .sc-diff--ok {
    color: var(--fig-text-green);
    font-weight: 600;
  }
</style>
