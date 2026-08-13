<script setup>
  // Bitta ilova+kategoriya matritsasi — KO'RISH va TAHRIR bitta ko'rinishda.
  // Har katak: OKLAD (round(koef × baza)) yuqorida + KOEFFITSIENT pastda.
  // editable=false → o'qish (matn); editable=true → koef inputi + oklad jonli qayta hisob.
  import { Calculator24Regular } from '@vicons/fluent'

  const props = defineProps({
    rows: { type: Array, default: () => [] }, // [{rank, c0..c3}]
    groups: { type: Array, default: () => [0, 1, 2, 3] },
    baseAmount: { type: [Number, String], default: 0 },
    minFloor: { type: [Number, String], default: null },
    editable: { type: Boolean, default: false }
  })
  const emit = defineEmits(['formula'])

  const base = computed(() => Number(props.baseAmount) || 0)
  const floor = computed(() =>
    props.minFloor === null || props.minFloor === undefined || props.minFloor === ''
      ? null
      : Number(props.minFloor)
  )

  const fmt = (v) => (v === null || v === undefined || v === '' ? '—' : Number(v).toLocaleString('ru-RU'))
  const coefOf = (row, g) => {
    const v = row[`c${g}`]
    return v === null || v === undefined || v === '' ? null : Number(v)
  }
  const amountOf = (row, g) => {
    const c = coefOf(row, g)
    if (c === null || base.value <= 0) return null
    return Math.round(c * base.value)
  }
  const belowFloor = (row, g) => {
    const a = amountOf(row, g)
    return floor.value != null && a != null && a < floor.value
  }

  // Formula paneli (faqat tahrirda)
  const fGroups = ref([])
  const fRanks = ref([])
  const fExpr = ref('')
  const rankOptions = computed(() => props.rows.map((r) => ({ label: r.rank, value: String(r.rank) })))
  const groupOptions = computed(() => props.groups.map((g) => ({ label: `${g}-guruh`, value: g })))
  const quick = (e) => (fExpr.value = e)
  const applyFormula = () => emit('formula', { groups: fGroups.value, ranks: fRanks.value, expr: fExpr.value })
</script>

<template>
  <div>
    <!-- Formula paneli (tahrirda) -->
    <div v-if="editable" class="tg-formula">
      <div class="flex items-center gap-2 mb-3">
        <n-icon class="text-primary" size="18"><Calculator24Regular /></n-icon>
        <span class="text-sm font-semibold">{{ $t('tariffGrid.formula.title') }}</span>
      </div>
      <div class="grid grid-cols-12 gap-3 items-end">
        <div class="col-span-6 md:col-span-3">
          <label class="tg-lbl">{{ $t('tariffGrid.formula.groups') }}</label>
          <n-select v-model:value="fGroups" multiple :options="groupOptions" size="small" :placeholder="$t('tariffGrid.formula.allGroups')" />
        </div>
        <div class="col-span-6 md:col-span-4">
          <label class="tg-lbl">{{ $t('tariffGrid.formula.ranks') }}</label>
          <n-select v-model:value="fRanks" multiple filterable :options="rankOptions" size="small" :placeholder="$t('tariffGrid.formula.allRanks')" :max-tag-count="3" />
        </div>
        <div class="col-span-8 md:col-span-3">
          <label class="tg-lbl">{{ $t('tariffGrid.formula.expr') }}</label>
          <n-input v-model:value="fExpr" size="small" placeholder="x*1.1" class="skip-format" />
        </div>
        <div class="col-span-4 md:col-span-2">
          <n-button size="small" type="primary" block @click="applyFormula">{{ $t('tariffGrid.formula.apply') }}</n-button>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-1.5 mt-3">
        <n-button size="tiny" secondary round @click="quick('x*1.1')">+10%</n-button>
        <n-button size="tiny" secondary round @click="quick('x*1.05')">+5%</n-button>
        <n-button size="tiny" secondary round @click="quick('x*0.9')">−10%</n-button>
        <n-button size="tiny" secondary round @click="quick('x+0.05')">+0.05</n-button>
        <span class="tg-hint ml-1">{{ $t('tariffGrid.formula.hint') }}</span>
      </div>
    </div>

    <!-- Matritsa -->
    <div class="tg-matrix-wrap">
      <table class="tg-matrix">
        <thead>
          <tr>
            <th class="tg-rank-h">{{ $t('tariffGrid.matrix.rank') }}</th>
            <th v-for="g in groups" :key="g">{{ g }}-{{ $t('tariffGrid.matrix.group') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in rows" :key="idx">
            <td class="tg-rank">{{ row.rank }}</td>
            <td v-for="g in groups" :key="g" class="tg-cell-td">
              <!-- TAHRIR: koef inputi + jonli oklad -->
              <div v-if="editable" class="tg-cell-edit">
                <n-input-number
                  v-model:value="row[`c${g}`]"
                  size="small"
                  class="tg-coef-in"
                  :show-button="false"
                  :min="0"
                  :step="0.01"
                  placeholder="—"
                />
                <span class="tg-amt-sm" :class="{ 'tg-below': belowFloor(row, g) }">
                  {{ fmt(amountOf(row, g)) }}
                </span>
              </div>
              <!-- KO'RISH: oklad + koef -->
              <div v-else class="tg-cell-view" :class="{ 'tg-below': belowFloor(row, g) }">
                <span class="tg-amt">{{ fmt(amountOf(row, g)) }}</span>
                <span class="tg-coef">k {{ coefOf(row, g) ?? '—' }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
  .tg-formula {
    background: var(--color-brand-surface);
    border: 1px solid var(--surface-line, #e5e7eb);
    border-radius: 16px;
    padding: 14px 16px;
    margin-bottom: 14px;
  }
  .tg-lbl {
    display: block;
    font-size: 11px;
    color: var(--textColor3, #98a2b3);
    margin-bottom: 3px;
  }
  .tg-hint {
    font-size: 11px;
    color: var(--textColor3, #98a2b3);
  }
  .tg-matrix-wrap {
    border: 1px solid var(--surface-line, #e5e7eb);
    border-radius: 16px;
    overflow: auto;
    max-height: min(60vh, 600px);
  }
  .tg-matrix {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 13px;
  }
  .tg-matrix thead th {
    position: sticky;
    top: 0;
    z-index: 2;
    background: var(--table-header, #f1f5f9);
    color: var(--textColor2, #475467);
    font-weight: 600;
    text-align: center;
    padding: 9px 12px;
    white-space: nowrap;
    border-bottom: 1px solid var(--surface-line, #e5e7eb);
  }
  .tg-matrix tbody td {
    padding: 5px 10px;
    border-bottom: 1px solid var(--surface-line, #eef0f3);
    text-align: center;
  }
  .tg-matrix tbody tr:nth-child(even) td {
    background: rgba(148, 163, 184, 0.05);
  }
  .tg-matrix tbody tr:hover td {
    background: var(--surface-ground);
  }
  .tg-rank-h,
  .tg-rank {
    position: sticky;
    left: 0;
    z-index: 1;
    min-width: 64px;
    text-align: center;
  }
  .tg-matrix thead .tg-rank-h {
    z-index: 3;
  }
  .tg-rank {
    background: var(--table-header, #f1f5f9);
    font-weight: 700;
    color: var(--textColor1, #101828);
  }
  /* KO'RISH kataki */
  .tg-cell-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1.2;
  }
  .tg-amt {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--textColor1, #101828);
  }
  .tg-coef {
    font-size: 11px;
    color: var(--textColor3, #98a2b3);
    font-variant-numeric: tabular-nums;
  }
  /* TAHRIR kataki */
  .tg-cell-edit {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  .tg-coef-in {
    width: 88px;
  }
  .tg-coef-in :deep(.n-input__input-el) {
    text-align: center;
  }
  .tg-amt-sm {
    font-size: 11px;
    color: var(--textColor3, #98a2b3);
    font-variant-numeric: tabular-nums;
  }
  /* Poldan past */
  .tg-below .tg-amt,
  .tg-amt-sm.tg-below,
  .tg-below.tg-amt-sm {
    color: var(--warning-color, #b45309);
  }
  .tg-cell-view.tg-below {
    background: rgba(251, 191, 36, 0.14);
    border-radius: 8px;
  }
</style>
