<script setup>
  // Ikki versiyani solishtirish — skalyar maydonlar (baza / min_floor / amal sanasi)
  // + katak koeffitsientlari farqi (annex × ustun × guruh × razryad). Salary-1c compare kabi.
  import { useTariffGridStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useTariffGridStore()

  const data = computed(() => store.compareData)
  const hasChanges = computed(
    () => data.value && (data.value.fields.length > 0 || data.value.cells.length > 0)
  )

  const fmtNum = (v) => (v === null || v === undefined ? '—' : Number(v).toLocaleString('ru-RU'))
  const isNum = (v) => typeof v === 'number' && !Number.isNaN(v)
  const signed = (v) =>
    v === null || v === undefined ? '—' : (v > 0 ? '+' : '') + Number(v).toLocaleString('ru-RU')
  const diffClass = (v) => (v == null || v === 0 ? '' : v > 0 ? 'text-success' : 'text-error')

  const fieldLabel = (f) =>
    ({
      base_amount: t('tariffGrid.form.baseAmount'),
      min_floor: t('tariffGrid.form.minFloor'),
      effective_date: t('tariffGrid.form.effectiveDate')
    })[f] || f

  const statusType = (s) => ({ added: 'success', removed: 'error', changed: 'warning' })[s] || 'default'
  const statusLabel = (s) => t('tariffGrid.cmp.status.' + s)
</script>

<template>
  <n-spin :show="store.compareLoading">
    <div v-if="data" class="min-h-[120px]">
      <p class="font-semibold text-base">{{ data.grid_name }}</p>
      <p class="text-xs text-textColor3 mb-3">
        <span class="font-semibold">v{{ data.from.version }}</span>
        <span class="text-textColor3"> ({{ data.from.effective_date }})</span> →
        <span class="font-semibold">v{{ data.to.version }}</span>
        <span class="text-textColor3"> ({{ data.to.effective_date }})</span>
      </p>

      <!-- Skalyar (umumiy) maydonlar -->
      <template v-if="data.fields.length">
        <p class="tg-cmp-sec">{{ $t('tariffGrid.cmp.general') }}</p>
        <n-table :single-line="false" size="small" class="mb-3">
          <thead>
            <tr>
              <th>{{ $t('tariffGrid.cmp.field') }}</th>
              <th class="text-right!">v{{ data.from.version }}</th>
              <th class="text-right!">v{{ data.to.version }}</th>
              <th class="text-right! w-[150px]">{{ $t('tariffGrid.cmp.diff') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(f, i) in data.fields" :key="'f' + i">
              <td>{{ fieldLabel(f.field) }}</td>
              <td class="text-right! tnum">{{ isNum(f.from) ? fmtNum(f.from) : (f.from || '—') }}</td>
              <td class="text-right! tnum">{{ isNum(f.to) ? fmtNum(f.to) : (f.to || '—') }}</td>
              <td class="text-right! tnum font-semibold" :class="diffClass(f.diff)">
                {{ f.diff == null ? '—' : signed(f.diff) }}
              </td>
            </tr>
          </tbody>
        </n-table>
      </template>

      <!-- Katak koeffitsientlari farqi -->
      <template v-if="data.cells.length">
        <p class="tg-cmp-sec">{{ $t('tariffGrid.cmp.coefficients') }}</p>
        <div class="w-full overflow-x-auto">
          <n-table :single-line="false" size="small" class="mb-2">
            <thead>
              <tr>
                <th class="min-w-[150px]">{{ $t('tariffGrid.cmp.column') }}</th>
                <th class="w-[80px] text-center!">{{ $t('tariffGrid.cmp.group') }}</th>
                <th class="w-[80px] text-center!">{{ $t('tariffGrid.cmp.rank') }}</th>
                <th class="text-right!">v{{ data.from.version }}</th>
                <th class="text-right!">v{{ data.to.version }}</th>
                <th class="text-right! w-[110px]">{{ $t('tariffGrid.cmp.diff') }}</th>
                <th class="w-[110px]">{{ $t('tariffGrid.statusLabel') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(c, i) in data.cells" :key="'c' + i">
                <td class="text-xs">{{ c.category_name || c.annex_name || '—' }}</td>
                <td class="text-center! tnum">{{ c.group }}</td>
                <td class="text-center! tnum">{{ c.rank }}</td>
                <td class="text-right! tnum">{{ c.from_coefficient == null ? '—' : c.from_coefficient }}</td>
                <td class="text-right! tnum">{{ c.to_coefficient == null ? '—' : c.to_coefficient }}</td>
                <td class="text-right! tnum font-semibold" :class="diffClass(c.diff)">
                  {{ c.diff == null ? '—' : signed(c.diff) }}
                </td>
                <td>
                  <n-tag :type="statusType(c.status)" size="tiny" round>{{ statusLabel(c.status) }}</n-tag>
                </td>
              </tr>
            </tbody>
          </n-table>
        </div>
      </template>

      <div v-if="!hasChanges" class="text-center! text-textColor3 py-6">
        {{ $t('tariffGrid.cmp.noChanges') }}
      </div>
    </div>
  </n-spin>
</template>

<style scoped>
  .tnum { font-variant-numeric: tabular-nums; }
  .tg-cmp-sec {
    font-size: 12px;
    font-weight: 600;
    color: var(--textColor2, #475467);
    margin: 6px 0;
  }
</style>
