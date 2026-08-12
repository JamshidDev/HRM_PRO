<script setup>
  // YARATISH: bitta ixcham jadval — satr = razryad×guruh, ustun = koeffitsientlar.
  // Kiritishni tezlashtirish: Excel paste (Ctrl+V), Enter→pastga, ustun fill, mavjud setkadan nusxa.
  // Manba: store.createColumns [{ key, name, rows:[{rank,c0..c3}] }] — barcha ustun DEFAULT_RANKS bilan tekislangan.
  import { Add16Filled, Delete16Regular, Calculator24Regular, ArrowDownload16Regular } from '@vicons/fluent'
  import { GROUPS, DEFAULT_RANKS } from '../annexConfig.js'
  import { useTariffGridStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useTariffGridStore()

  const wrapRef = ref(null)
  const anchor = ref(null) // { col, row } — oxirgi fokuslangan katak (paste/Enter uchun)
  const showFormula = ref(false)

  onMounted(() => store._loadCopySources())

  const base = computed(() => Number(store.gridPayload.base_amount) || 0)
  const floor = computed(() => {
    const f = store.gridPayload.min_floor
    return f === null || f === undefined || f === '' ? null : Number(f)
  })

  const fmt = (v) => (v === null || v === undefined ? '—' : Number(v).toLocaleString('ru-RU'))
  const amountOf = (col, idx, g) => {
    const v = col.rows[idx]?.[`c${g}`]
    if (v === null || v === undefined || v === '' || base.value <= 0) return null
    return Math.round(Number(v) * base.value)
  }
  const belowFloor = (col, idx, g) => {
    const a = amountOf(col, idx, g)
    return floor.value != null && a != null && a < floor.value
  }

  // Xom qiymatni koeffitsientga: ',' → '.', bo'sh/'—' → null.
  const parseNum = (raw) => {
    const s = String(raw ?? '').trim().replace(/\s/g, '').replace(',', '.')
    if (s === '' || s === '—' || s === '-') return null
    const n = Number(s)
    return Number.isFinite(n) ? n : null
  }

  const NROWS = DEFAULT_RANKS.length * GROUPS.length
  const setCellByVisual = (colIdx, vr, val) => {
    const col = store.createColumns[colIdx]
    if (!col || vr < 0 || vr >= NROWS) return false
    const rankIdx = Math.floor(vr / GROUPS.length)
    const gi = vr % GROUPS.length
    col.rows[rankIdx][`c${GROUPS[gi]}`] = val
    return true
  }

  // --- Excel/clipboard paste ---
  const onPaste = (e) => {
    const text = e.clipboardData?.getData('text') ?? ''
    if (!text.trim() || !anchor.value) return
    e.preventDefault()
    const matrix = text
      .replace(/\r/g, '')
      .split('\n')
      .filter((l, i, arr) => l.length || i < arr.length - 1) // oxirgi bo'sh qatorni tashla
      .map((l) => l.split('\t'))
    let filled = 0
    matrix.forEach((cells, r) => {
      cells.forEach((raw, c) => {
        if (setCellByVisual(anchor.value.col + c, anchor.value.row + r, parseNum(raw))) filled++
      })
    })
    $Toast.success(`${t('tariffGrid.form.pasted')}: ${filled}`)
  }

  // --- Klaviatura: Enter → pastga (Shift+Enter → yuqoriga) ---
  const focusCell = (colIdx, vr) => {
    if (colIdx < 0 || colIdx >= store.createColumns.length || vr < 0 || vr >= NROWS) return
    const el = wrapRef.value?.querySelector(`[data-cell="${colIdx}-${vr}"] input`)
    if (el) {
      el.focus()
      el.select()
    }
  }
  const onEnter = (e) => {
    if (!anchor.value) return
    focusCell(anchor.value.col, anchor.value.row + (e.shiftKey ? -1 : 1))
  }

  // --- Ustunni to'ldirish: birinchi bo'sh bo'lmagan qiymat bilan butun ustun ---
  const fillColumn = (col) => {
    let val = null
    for (const row of col.rows) {
      for (const g of GROUPS) {
        const v = row[`c${g}`]
        if (v !== null && v !== undefined && v !== '') {
          val = v
          break
        }
      }
      if (val !== null) break
    }
    if (val === null) {
      $Toast.warning(t('tariffGrid.form.fillEmpty'))
      return
    }
    for (const row of col.rows) for (const g of GROUPS) row[`c${g}`] = val
    $Toast.success(t('tariffGrid.form.fillColumn'))
  }

  // --- Mavjud setkadan nusxa ---
  const copySourceId = ref(null)
  const copyOptions = computed(() =>
    store.copySources.map((g) => ({ label: g.name, value: g.id }))
  )
  const onCopyFrom = (id) => {
    if (id) store.copyFromGrid(id).finally(() => (copySourceId.value = null))
  }

  // --- Formula paneli ---
  const fCols = ref([])
  const fGroups = ref([])
  const fRanks = ref([])
  const fExpr = ref('')
  const colOptions = computed(() =>
    store.createColumns.map((c) => ({ label: c.name || `${t('tariffGrid.form.columnName')}`, value: c.key }))
  )
  const groupOptions = computed(() => GROUPS.map((g) => ({ label: `${g}-${t('tariffGrid.matrix.group')}`, value: g })))
  const rankOptions = computed(() => DEFAULT_RANKS.map((r) => ({ label: r, value: String(r) })))
  const quick = (e) => (fExpr.value = e)
  const applyFormula = () => {
    const cols = fCols.value.length
      ? store.createColumns.filter((c) => fCols.value.includes(c.key))
      : store.createColumns
    for (const col of cols) {
      store.applyFormulaToRows(col.rows, { groups: fGroups.value, ranks: fRanks.value, expr: fExpr.value })
    }
  }
</script>

<template>
  <div>
    <!-- Yuqori panel: mavjud setkadan nusxa + formula toggle -->
    <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
      <div class="flex items-center gap-2">
        <span class="text-xs text-surface-500">{{ $t('tariffGrid.form.copyFrom') }}:</span>
        <n-select v-model:value="copySourceId" :options="copyOptions" size="small" filterable clearable
          class="w-64" :placeholder="$t('tariffGrid.form.copyFrom')" @update:value="onCopyFrom" />
      </div>
      <n-button size="small" :type="showFormula ? 'primary' : 'default'" :tertiary="!showFormula"
        @click="showFormula = !showFormula">
        <template #icon><n-icon><Calculator24Regular /></n-icon></template>
        {{ $t('tariffGrid.formula.title') }}
      </n-button>
    </div>

    <p class="cm-hint mb-2">💡 {{ $t('tariffGrid.form.pasteHint') }}</p>

    <!-- Formula paneli (default yashirin) -->
    <div v-if="showFormula" class="cm-formula">
      <div class="flex items-center gap-2 mb-3">
        <n-icon class="text-primary" size="18"><Calculator24Regular /></n-icon>
        <span class="text-sm font-semibold">{{ $t('tariffGrid.formula.title') }}</span>
      </div>
      <div class="grid grid-cols-12 gap-3 items-end">
        <div class="col-span-6 md:col-span-3">
          <label class="cm-lbl">{{ $t('tariffGrid.form.columnsTitle') }}</label>
          <n-select v-model:value="fCols" multiple :options="colOptions" size="small"
            :placeholder="$t('tariffGrid.formula.allGroups')" :max-tag-count="2" />
        </div>
        <div class="col-span-6 md:col-span-2">
          <label class="cm-lbl">{{ $t('tariffGrid.formula.groups') }}</label>
          <n-select v-model:value="fGroups" multiple :options="groupOptions" size="small"
            :placeholder="$t('tariffGrid.formula.allGroups')" />
        </div>
        <div class="col-span-6 md:col-span-3">
          <label class="cm-lbl">{{ $t('tariffGrid.formula.ranks') }}</label>
          <n-select v-model:value="fRanks" multiple filterable :options="rankOptions" size="small"
            :placeholder="$t('tariffGrid.formula.allRanks')" :max-tag-count="3" />
        </div>
        <div class="col-span-8 md:col-span-2">
          <label class="cm-lbl">{{ $t('tariffGrid.formula.expr') }}</label>
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
        <span class="cm-hint ml-1">{{ $t('tariffGrid.formula.hint') }}</span>
      </div>
    </div>

    <!-- Ixcham jadval (paste + Enter navigatsiya) -->
    <div ref="wrapRef" class="cm-wrap" @paste="onPaste" @keydown.enter.prevent="onEnter">
      <table class="cm">
        <thead>
          <tr>
            <th class="cm-rk">{{ $t('tariffGrid.matrix.rank') }}</th>
            <th class="cm-grp">{{ $t('tariffGrid.matrix.group') }}</th>
            <th v-for="(col, ci) in store.createColumns" :key="col.key" class="cm-col">
              <div class="cm-col-head">
                <n-input v-model:value="col.name" size="small" :placeholder="$t('tariffGrid.form.columnName')" />
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <n-button size="tiny" quaternary @click="fillColumn(col)">
                      <template #icon><n-icon><ArrowDownload16Regular /></n-icon></template>
                    </n-button>
                  </template>
                  {{ $t('tariffGrid.form.fillColumn') }}
                </n-tooltip>
                <n-button v-if="store.createColumns.length > 1" size="tiny" quaternary type="error"
                  @click="store.removeColumn(ci)">
                  <template #icon><n-icon><Delete16Regular /></n-icon></template>
                </n-button>
              </div>
            </th>
            <th class="cm-add">
              <n-button size="small" dashed type="primary" @click="store.addColumn()">
                <template #icon><n-icon><Add16Filled /></n-icon></template>
                {{ $t('tariffGrid.form.addColumn') }}
              </n-button>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(rank, idx) in DEFAULT_RANKS" :key="rank">
            <tr v-for="(g, gi) in GROUPS" :key="rank + '-' + g">
              <td v-if="gi === 0" class="cm-rk" :rowspan="GROUPS.length">{{ rank }}</td>
              <td class="cm-grp">{{ g }}-{{ $t('tariffGrid.matrix.group') }}</td>
              <td v-for="(col, ci) in store.createColumns" :key="col.key + '-' + g" class="cm-cell">
                <div class="cm-cell-in">
                  <n-input-number v-model:value="col.rows[idx][`c${g}`]" size="tiny" class="cm-in"
                    :data-cell="ci + '-' + (idx * GROUPS.length + gi)"
                    :show-button="false" :min="0" :step="0.01" placeholder="—"
                    @focus="anchor = { col: ci, row: idx * GROUPS.length + gi }" />
                  <span class="cm-amt" :class="{ 'cm-below': belowFloor(col, idx, g) }">{{ fmt(amountOf(col, idx, g)) }}</span>
                </div>
              </td>
              <td class="cm-pad"></td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
  .cm-formula {
    background: var(--color-brand-surface);
    border: 1px solid var(--surface-line, #e5e7eb);
    border-radius: 16px;
    padding: 14px 16px;
    margin-bottom: 14px;
  }
  .cm-lbl { display: block; font-size: 11px; color: var(--textColor3, #98a2b3); margin-bottom: 3px; }
  .cm-hint { font-size: 11px; color: var(--textColor3, #98a2b3); }
  .cm-wrap {
    border: 1px solid var(--surface-line, #d0d5dd);
    border-radius: 12px;
    overflow: auto;
    max-height: min(60vh, 620px);
  }
  .cm { border-collapse: collapse; font-size: 12px; white-space: nowrap; }
  .cm th, .cm td {
    border: 1px solid var(--surface-line, #e5e7eb);
    padding: 3px 6px;
    text-align: center;
  }
  .cm thead th {
    position: sticky; top: 0; z-index: 2;
    background: var(--table-header, #f1f5f9);
    color: var(--textColor2, #475467); font-weight: 600;
  }
  .cm-col { min-width: 184px; }
  .cm-col-head { display: flex; align-items: center; gap: 4px; }
  .cm-add { min-width: 150px; }
  .cm-rk, .cm-grp {
    position: sticky; left: 0; z-index: 1;
    background: var(--table-header, #f1f5f9);
    font-weight: 700; color: var(--textColor1, #101828);
  }
  .cm thead .cm-rk, .cm thead .cm-grp { z-index: 3; }
  .cm-grp { left: 52px; font-weight: 500; color: var(--textColor2, #475467); }
  .cm-cell-in { display: flex; flex-direction: column; align-items: center; gap: 1px; }
  .cm-in { width: 96px; }
  .cm-in :deep(.n-input__input-el) { text-align: center; }
  .cm-amt { font-size: 10.5px; color: var(--textColor3, #98a2b3); font-variant-numeric: tabular-nums; }
  .cm-below { color: var(--warning-color, #b45309); font-weight: 600; }
  .cm-pad { border: none; background: transparent; min-width: 8px; }
  .cm tbody tr:hover td:not(.cm-pad) { background: var(--surface-ground); }
</style>
