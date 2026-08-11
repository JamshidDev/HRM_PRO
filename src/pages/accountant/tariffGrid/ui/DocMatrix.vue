<script setup>
  // Ilova matritsasi — hujjatdagidek (16-SGK PDF). Ikki blok yonma-yon:
  //  - "Tarif koeffitsientlari"  |  "Oylik tarif, so'm"
  // 2/4-ilova (bitta kategoriya): satr=razryad, ustun=guruh.
  // 1-ilova (5 kategoriya): satr=razryad×guruh, ustun=kategoriya.
  import { useTariffGridStore } from '@/store/modules/index.js'
  import { DEFAULT_RANKS } from '../annexConfig.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const props = defineProps({
    // {code, name, groups, ranks, categories:[{key,name}], cells:[{category,group,rank,coefficient,amount}]}
    annex: { type: Object, required: true },
    baseAmount: { type: [Number, String], default: 0 },
    editable: { type: Boolean, default: false },
    // Koeffitsient blokini ko'rsatish (ko'z-ikonka). Tahrir rejimida doim ko'rinadi.
    showCoef: { type: Boolean, default: true }
  })

  const store = useTariffGridStore()
  // Tahrirda koeffitsient doim ochiq (u yerda tahrirlanadi); aks holda showCoef toggle boshqaradi.
  const coefVisible = computed(() => props.editable || props.showCoef)
  const multi = computed(() => (props.annex.categories?.length ?? 1) > 1)
  const groups = computed(() => props.annex.groups ?? [0, 1, 2, 3])
  const cats = computed(() => props.annex.categories ?? [{ key: 1, name: '' }])
  // Tahrirda ranklar editState'dan (qo'shilganlar bilan); ko'rishda backend annex.ranks.
  const ranks = computed(() => {
    if (props.editable) {
      const rows = store.editState[props.annex.code]?.[cats.value[0]?.key]
      if (rows && rows.length) return rows.map((r) => r.rank)
    }
    return props.annex.ranks ?? []
  })

  // Qo'shish mumkin bo'lgan razryadlar (standart ro'yxatdan, hali yo'qlari).
  const addRankVal = ref(null)
  const missingRankOptions = computed(() => {
    const have = new Set(ranks.value.map(String))
    return DEFAULT_RANKS.filter((r) => !have.has(String(r))).map((r) => ({ label: r, value: String(r) }))
  })
  const onAddRank = (rank) => {
    if (rank) store.addRankToEdit(props.annex.code, rank)
    addRankVal.value = null
  }
  const base = computed(() => Number(props.baseAmount) || 0)

  const map = computed(() => {
    const m = new Map()
    for (const c of props.annex.cells ?? []) m.set(`${c.category}|${c.group}|${c.rank}`, c)
    return m
  })
  const cell = (cat, g, rank) => map.value.get(`${cat}|${g}|${rank}`) ?? null

  const fmtA = (v) => (v === null || v === undefined ? '—' : Number(v).toLocaleString('ru-RU'))
  const fmtC = (v) =>
    v === null || v === undefined
      ? '—'
      : Number(v).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const coefOf = (cat, g, rank) => fmtC(cell(cat, g, rank)?.coefficient ?? null)
  const amtOf = (cat, g, rank) => fmtA(cell(cat, g, rank)?.amount ?? null)

  // --- Tahrir rejimi: koeffitsient store.editState'dan (rank→c0..c3) ---
  const editRow = (cat, rank) =>
    (store.editState[props.annex.code]?.[cat] ?? []).find(
      (r) => String(r.rank) === String(rank)
    )
  const liveAmt = (cat, g, rank) => {
    const row = editRow(cat, rank)
    const c = row ? row[`c${g}`] : null
    if (c === null || c === undefined || c === '' || base.value <= 0) return null
    return Math.round(Number(c) * base.value)
  }

  const nColsHalf = computed(() => (multi.value ? cats.value.length : groups.value.length))
  const fmtBase = computed(() =>
    base.value ? base.value.toLocaleString('ru-RU') : null
  )
</script>

<template>
  <div>
    <!-- Tahrirda: yangi razryad qo'shish (ro'yxatdan yoki o'zi yozib) -->
    <div v-if="editable" class="flex items-center gap-2 mb-2">
      <span class="text-xs text-surface-500">{{ $t('tariffGrid.matrix.addRow') }}:</span>
      <n-select v-model:value="addRankVal" :options="missingRankOptions" size="small" filterable tag
        class="w-56" :placeholder="$t('tariffGrid.matrix.addRankPh')" @update:value="onAddRank" />
    </div>

    <div class="doc-wrap">
      <table class="doc">
      <thead>
        <!-- 1-qator: blok sarlavhalari -->
        <tr>
          <th v-if="multi" class="rk-h" rowspan="2">{{ $t('tariffGrid.matrix.rank') }}</th>
          <th v-if="multi" class="grp-h" rowspan="2">{{ $t('tariffGrid.matrix.group') }}</th>
          <th v-else class="rk-h" rowspan="2">{{ $t('tariffGrid.matrix.rank') }}</th>
          <th v-if="coefVisible" class="blk" :colspan="nColsHalf">{{ $t('tariffGrid.matrix.coefBlock') }}</th>
          <th class="blk" :class="{ 'blk-amt': coefVisible }" :colspan="nColsHalf">
            {{ $t('tariffGrid.matrix.amountBlock') }}
            <span v-if="fmtBase" class="blk-note">({{ $t('tariffGrid.matrix.minAmountNote') }}: {{ fmtBase }})</span>
          </th>
        </tr>
        <!-- 2-qator: ustun sarlavhalari (guruh yoki kategoriya) -->
        <tr>
          <template v-if="multi">
            <template v-if="coefVisible">
              <th v-for="c in cats" :key="'ck' + c.key" class="sub">
                <n-tooltip trigger="hover">
                  <template #trigger><span class="sub-txt">{{ c.name }}</span></template>
                  {{ c.name }}
                </n-tooltip>
              </th>
            </template>
            <th v-for="c in cats" :key="'ak' + c.key" class="sub" :class="{ 'blk-amt': coefVisible && c.key === cats[0].key }">
              <n-tooltip trigger="hover">
                <template #trigger><span class="sub-txt">{{ c.name }}</span></template>
                {{ c.name }}
              </n-tooltip>
            </th>
          </template>
          <template v-else>
            <template v-if="coefVisible">
              <th v-for="g in groups" :key="'cg' + g" class="sub" :title="`${g}-${$t('tariffGrid.matrix.group')}`">{{ g }}-{{ $t('tariffGrid.matrix.group') }}</th>
            </template>
            <th v-for="g in groups" :key="'ag' + g" class="sub" :title="`${g}-${$t('tariffGrid.matrix.group')}`" :class="{ 'blk-amt': coefVisible && g === groups[0] }">{{ g }}-{{ $t('tariffGrid.matrix.group') }}</th>
          </template>
        </tr>
      </thead>
      <tbody>
        <!-- KO'P KATEGORIYALI (1-ilova): razryad × guruh satrlar -->
        <template v-if="multi">
          <template v-for="rank in ranks" :key="'r' + rank">
            <tr v-for="(g, gi) in groups" :key="'r' + rank + 'g' + g">
              <td v-if="gi === 0" class="rk" :rowspan="groups.length">{{ rank }}</td>
              <td class="grp">{{ g }}-{{ $t('tariffGrid.matrix.group') }}</td>
              <template v-if="coefVisible">
                <td v-for="c in cats" :key="'cc' + c.key" class="c">
                  <n-input-number v-if="editable && editRow(c.key, rank)" v-model:value="editRow(c.key, rank)[`c${g}`]"
                    size="tiny" class="doc-in" :show-button="false" :min="0" :step="0.01" placeholder="—" />
                  <template v-else>{{ coefOf(c.key, g, rank) }}</template>
                </td>
              </template>
              <td v-for="c in cats" :key="'ac' + c.key" class="a" :class="{ 'blk-amt': coefVisible && c.key === cats[0].key }">
                {{ editable ? fmtA(liveAmt(c.key, g, rank)) : amtOf(c.key, g, rank) }}
              </td>
            </tr>
          </template>
        </template>
        <!-- BITTA KATEGORIYALI (2/4-ilova): razryad satrlar, guruh ustunlar -->
        <template v-else>
          <tr v-for="rank in ranks" :key="'r' + rank">
            <td class="rk">{{ rank }}</td>
            <template v-if="coefVisible">
              <td v-for="g in groups" :key="'cg' + g" class="c">
                <n-input-number v-if="editable && editRow(cats[0].key, rank)" v-model:value="editRow(cats[0].key, rank)[`c${g}`]"
                  size="tiny" class="doc-in" :show-button="false" :min="0" :step="0.01" placeholder="—" />
                <template v-else>{{ coefOf(cats[0].key, g, rank) }}</template>
              </td>
            </template>
            <td v-for="g in groups" :key="'ag' + g" class="a" :class="{ 'blk-amt': coefVisible && g === groups[0] }">
              {{ editable ? fmtA(liveAmt(cats[0].key, g, rank)) : amtOf(cats[0].key, g, rank) }}
            </td>
          </tr>
        </template>
      </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
  .doc-wrap {
    border: 1px solid var(--surface-line, #d0d5dd);
    border-radius: 12px;
    overflow: auto;
    max-height: min(66vh, 620px);
  }
  .doc {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    white-space: nowrap;
  }
  .doc th,
  .doc td {
    border: 1px solid var(--surface-line, #e5e7eb);
    padding: 4px 7px;
    text-align: center;
  }
  .doc thead th {
    position: sticky;
    top: 0;
    z-index: 2;
    background: var(--table-header, #f1f5f9);
    color: var(--textColor2, #475467);
    font-weight: 600;
  }
  .doc thead .sub {
    top: 31px;
    font-weight: 500;
    font-size: 10.5px;
    line-height: 1.2;
    white-space: nowrap;
    min-width: 62px;
    max-width: 150px;
  }
  /* Uzun nom bir qatorda kesiladi (…) — to'liqi hoverda tooltipda ko'rinadi. */
  .sub-txt {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .doc .c {
    min-width: 46px;
  }
  .doc .a {
    min-width: 72px;
  }
  .doc-in {
    width: 66px;
  }
  .doc-in :deep(.n-input__input-el) {
    text-align: center;
    padding: 0 4px;
  }
  .doc td:has(.doc-in) {
    padding: 2px 3px;
  }
  .blk-note {
    display: block;
    font-size: 10px;
    font-weight: 400;
    color: var(--textColor3, #98a2b3);
  }
  /* Amount bloki chap chegarasi qalinroq — ikki blokni ajratadi */
  .blk-amt {
    border-left: 2px solid var(--primary-color) !important;
  }
  .rk,
  .rk-h,
  .grp,
  .grp-h {
    position: sticky;
    left: 0;
    z-index: 1;
    background: var(--table-header, #f1f5f9);
    font-weight: 700;
    color: var(--textColor1, #101828);
  }
  .doc thead .rk-h,
  .doc thead .grp-h {
    z-index: 3;
  }
  .grp,
  .grp-h {
    left: 52px;
    font-weight: 500;
    color: var(--textColor2, #475467);
  }
  .c {
    font-variant-numeric: tabular-nums;
    color: var(--textColor2, #475467);
  }
  .a {
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    color: var(--textColor1, #101828);
    text-align: right;
  }
  .doc tbody tr:hover td {
    background: var(--surface-ground);
  }
</style>
