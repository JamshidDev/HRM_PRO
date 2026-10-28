<script setup>
  // «To'lov mezonlari» tab — 9 ta nazorat qilinadigan to'lov turi (HUJJAT §6).
  // Baholash CLIENT TOMONDA (engine.evalRules — maketning evalAll ko'chirmasi):
  // 047/050/055/270 buyruq ro'yxati va 250 chegarasi localStorage'da, natija darhol
  // qayta hisoblanadi.
  import { ref, reactive, computed } from 'vue'
  import i18n from '@/i18n/index.js'
  import { useSalaryControlStore, useAppStore } from '@/store/modules/index.js'
  import { money, mln, chartTheme, tokenColor, normText } from '../helpers.js'
  import { RULES, evalRules, loadLists, saveList, saveCap } from '../engine.js'
  import { SECTION, CHART } from '../explain.js'
  import Card from './Card.vue'
  import EChart from './EChart.vue'
  import ScSkeleton from './ScSkeleton.vue'
  import StatusBadge from './StatusBadge.vue'
  import InfoHint from './InfoHint.vue'

  const { t } = i18n.global
  const store = useSalaryControlStore()
  const appStore = useAppStore()

  // Natija → badge toni.
  const RES_TONE = { Asosli: 'green', 'Qo‘shimcha tekshirish': 'amber', Asossiz: 'red' }
  const RES_RANK = { Asossiz: 0, 'Qo‘shimcha tekshirish': 1, Asosli: 2 }

  // —— localStorage buyruq ro'yxatlari (047/050/055/270) va 250 chegarasi ————
  const init = loadLists()
  const listCodes = RULES.filter((r) => r.r === 'list').map((r) => r.k)
  // Matn ko'rinishida (textarea), har kodga bitta satr.
  const listText = reactive(
    Object.fromEntries(listCodes.map((k) => [k, [...(init.lists[k] || [])].join('\n')]))
  )
  const cap = ref(init.cap)

  // Matndan Set — evalRules uchun.
  const listsSets = computed(() => {
    const out = {}
    for (const k of listCodes) {
      out[k] = new Set(String(listText[k] || '').split(/\D+/).filter((x) => x.length === 14))
    }
    return out
  })

  const onListInput = (code) => {
    saveList(code, listText[code])
  }
  const onCapInput = (val) => {
    cap.value = Number(val) || null
    saveCap(cap.value)
  }

  // —— Baholash natijalari (har xodim × har mezon) ————————————————————————
  const results = computed(() =>
    evalRules(store.emps, { lists: listsSets.value, cap: cap.value, fmt: money })
  )

  // —— KPI qatori: Asosli / Qo'shimcha tekshirish / Asossiz / Jami ——————————
  const kpi = computed(() => {
    const R = results.value
    const by = (res) => R.filter((x) => x.res === res)
    const sum = (list) => list.reduce((a, x) => a + (x.s || 0), 0)
    const asosli = by('Asosli')
    const check = by('Qo‘shimcha tekshirish')
    const asossiz = by('Asossiz')
    return {
      asosli: { n: asosli.length, s: sum(asosli) },
      check: { n: check.length, s: sum(check) },
      asossiz: { n: asossiz.length, s: sum(asossiz) },
      total: { n: R.length, s: sum(R) }
    }
  })

  // —— Asosiy jadval (9 tur): har tur bo'yicha natija taqsimoti + summa ————
  const ruleRows = computed(() => {
    const R = results.value
    return RULES.map((rule) => {
      const L = R.filter((x) => x.k === rule.k)
      const n = (res) => L.filter((x) => x.res === res).length
      return {
        k: rule.k,
        name: rule.t,
        m: rule.m,
        count: L.length,
        sum: L.reduce((a, x) => a + (x.s || 0), 0),
        asosli: n('Asosli'),
        check: n('Qo‘shimcha tekshirish'),
        asossiz: n('Asossiz')
      }
    })
  })

  // —— Grafik (r11): 011 oluvchilari lavozim toifasi bo'yicha ————————————————
  const r11Option = computed(() => {
    appStore.isDark
    const th = chartTheme()
    const C = ['Ishchi', 'Mutaxassis', 'Rahbar', 'Aniqlanmagan']
    const L11 = results.value.filter((x) => x.k === '011')
    const rows = C.map((c) => ({
      c,
      n: L11.filter((x) => x.c === c).length,
      s: L11.filter((x) => x.c === c).reduce((a, x) => a + x.s, 0)
    })).filter((r) => r.n)
    return {
      grid: { top: 8, left: 4, right: 40, bottom: 4, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (p) => {
          if (!p || !p.length) return ''
          const r = rows[p[0].dataIndex]
          return `<b>${r.c}</b> — 011 mukofoti<br/>${r.n} xodim · ${money(r.s)} so‘m<br/>${r.c === 'Ishchi' ? '✓ asosli' : '⚠ tekshirish'}`
        }
      },
      xAxis: { type: 'value', axisLabel: { color: th.text }, splitLine: { lineStyle: { color: th.line } } },
      yAxis: {
        type: 'category',
        inverse: true,
        data: rows.map((r) => r.c),
        axisLabel: { color: th.textStrong, fontSize: 11 },
        axisLine: { lineStyle: { color: th.line } }
      },
      series: [
        {
          type: 'bar',
          data: rows.map((r) => ({
            value: r.n,
            itemStyle: {
              color: r.c === 'Ishchi' ? tokenColor('--fig-icon-green') : tokenColor('--fig-icon-amber')
            }
          })),
          barMaxWidth: 22,
          label: { show: true, position: 'right', color: th.text, formatter: '{c}' }
        }
      ]
    }
  })

  // —— Reestr: status chip + qidiruv, Asossiz→tekshirish→Asosli saralash ——————
  const fr = ref('')
  const q = ref('')
  const chips = computed(() => [
    { v: '', label: t('salaryControl.findings.all') },
    { v: 'Asossiz', label: 'Asossiz' },
    { v: 'Qo‘shimcha tekshirish', label: 'Qo‘shimcha tekshirish' },
    { v: 'Asosli', label: 'Asosli' }
  ])

  const registry = computed(() => {
    const query = q.value.trim().toLowerCase()
    return results.value
      .filter(
        (x) =>
          (!fr.value || x.res === fr.value) &&
          (!query || (x.fio || '').toLowerCase().includes(query))
      )
      .sort((a, b) => (RES_RANK[a.res] - RES_RANK[b.res]) || b.s - a.s)
  })

  // —— Client-side CSV (maket bilan bir xil — natija reestri) ————————————————
  const onExport = () => {
    const L = registry.value
    const period = `${store.params.year || ''}_${String(store.params.month || '').padStart(2, '0')}`
    const head = ['№', 'F.I.Sh.', 'Lavozimi', 'To‘lov nomi/kodi', 'To‘lov summasi', 'Aniqlangan sabab', 'Natija']
    const rows = [head].concat(
      L.map((x, i) => [i + 1, x.fio, x.lav, `${x.t} (${x.k})`, Math.round(x.s), x.why, x.res])
    )
    const csv = '﻿' + rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';')).join('\r\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    a.download = `natija_reestri_${period}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }
</script>

<template>
  <div class="flex flex-col gap-4">
    <template v-if="store.dashboardLoading">
      <ScSkeleton variant="kpi" :count="4" />
      <ScSkeleton variant="table" />
      <ScSkeleton variant="chart" chart-height="240px" />
    </template>

    <template v-else>
      <!-- Bo'lim izohi -->
      <p class="sc-intro">
        {{ SECTION.rules.sub }}
        <InfoHint :text="SECTION.rules.info" />
      </p>

      <!-- KPI qatori -->
      <div class="sc-kpis">
        <div class="sc-kpi">
          <div class="sc-kpi__h"><i class="sc-tile sc-tile--green"></i>Asosli</div>
          <div class="sc-kpi__v">{{ kpi.asosli.n }}</div>
          <div class="sc-kpi__s">{{ money(kpi.asosli.s) }}</div>
        </div>
        <div class="sc-kpi">
          <div class="sc-kpi__h">
            <i class="sc-tile" :class="kpi.check.n ? 'sc-tile--amber' : 'sc-tile--muted'"></i>Qo‘shimcha tekshirish
          </div>
          <div class="sc-kpi__v">{{ kpi.check.n }}</div>
          <div class="sc-kpi__s">{{ money(kpi.check.s) }}</div>
        </div>
        <div class="sc-kpi">
          <div class="sc-kpi__h">
            <i class="sc-tile" :class="kpi.asossiz.n ? 'sc-tile--red' : 'sc-tile--muted'"></i>Asossiz
          </div>
          <div class="sc-kpi__v">{{ kpi.asossiz.n }}</div>
          <div class="sc-kpi__s">{{ money(kpi.asossiz.s) }}</div>
        </div>
        <div class="sc-kpi">
          <div class="sc-kpi__h"><i class="sc-tile sc-tile--indigo"></i>{{ $t('salaryControl.common.total') }}</div>
          <div class="sc-kpi__v">{{ mln(kpi.total.s).toFixed(1) }} <span class="sc-kpi__u">mln</span></div>
          <div class="sc-kpi__s">{{ kpi.total.n }} ta to‘lov · {{ money(kpi.total.s) }}</div>
        </div>
      </div>

      <!-- Asosiy jadval (9 ta tur) -->
      <Card :title="SECTION.rules.title" sub="Har bir tur uchun aniqlash mezoni va natija (Asosli / Qo‘shimcha tekshirish / Asossiz)." :info="SECTION.rules.info">
        <div class="sc-scroll">
          <table class="sc-tbl">
            <thead>
              <tr>
                <th style="width: 70px">{{ $t('salaryControl.rules.code') }}</th>
                <th>{{ $t('salaryControl.rules.name') }}</th>
                <th class="num" style="width: 80px">{{ $t('salaryControl.common.count') }}</th>
                <th class="num" style="width: 140px">{{ $t('salaryControl.common.sum') }}</th>
                <th style="width: 220px">{{ $t('salaryControl.rules.result') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in ruleRows" :key="row.k">
                <td><b>{{ row.k }}</b></td>
                <td>
                  <b class="sc-name">{{ normText(row.name) }}</b>
                  <div class="sc-muted">{{ normText(row.m) }}</div>
                </td>
                <td class="num">{{ row.count }}</td>
                <td class="num">{{ money(row.sum) }}</td>
                <td>
                  <div v-if="row.count" class="sc-badges">
                    <StatusBadge v-if="row.asosli" tone="green" :label="`${row.asosli} asosli`" />
                    <StatusBadge v-if="row.check" tone="amber" :label="`${row.check} tekshirish`" />
                    <StatusBadge v-if="row.asossiz" tone="red" :label="`${row.asossiz} asossiz`" />
                  </div>
                  <span v-else class="sc-unchecked">Shu oyda to‘lov yo‘q</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <!-- Buyruq ro'yxatlari + 250 chegarasi -->
      <Card
        title="Buyruq ro‘yxatlari va chegaralar"
        sub="47, 50, 55 va 270-turlar faqat buyruq bo‘yicha ruxsat etilgan xodimlarga to‘lanadi. JSHSHIR ro‘yxatini kiriting — natija darhol qayta hisoblanadi va shu kompyuterda saqlanadi."
        info="JSHSHIR raqamlarini vergul, bo‘shliq yoki yangi qatorda kiriting (Excel ustunidan nusxa olsa bo‘ladi). Ma'lumot faqat shu brauzerda (localStorage) saqlanadi, serverga yuborilmaydi."
      >
        <div class="sc-lists">
          <label v-for="code in listCodes" :key="code" class="sc-lbox">
            <span class="sc-lbox__t"><b>{{ code }}</b> · {{ normText(RULES.find((r) => r.k === code).t) }}</span>
            <n-input
              v-model:value="listText[code]"
              type="textarea"
              :rows="2"
              :autosize="{ minRows: 2, maxRows: 5 }"
              placeholder="Ruxsat etilgan xodimlarning JSHSHIR raqamlari"
              @update:value="onListInput(code)"
            />
          </label>
          <label class="sc-lbox">
            <span class="sc-lbox__t"><b>250</b> · Tarif setkasi bo‘yicha oylik chegarasi, so‘m</span>
            <n-input-number
              :value="cap"
              :show-button="false"
              placeholder="masalan 8 000 000"
              class="w-full"
              @update:value="onCapInput"
            />
          </label>
        </div>
      </Card>

      <!-- r11 — 011 lavozim toifasi grafigi -->
      <Card :title="CHART.r11chart.title" :sub="CHART.r11chart.sub" :info="CHART.r11chart.sub">
        <EChart :option="r11Option" height="240px" />
        <div class="sc-legend">
          <span><i class="sw" :style="{ background: 'var(--fig-icon-green)' }"></i>Ishchi — asosli</span>
          <span><i class="sw" :style="{ background: 'var(--fig-icon-amber)' }"></i>Boshqa toifa — tekshirish</span>
        </div>
      </Card>

      <!-- Reestr + CSV -->
      <Card
        title="Natija reestri"
        :sub="$t('salaryControl.findings.count', { count: registry.length, sum: money(registry.reduce((a, x) => a + x.s, 0)) })"
        info="Har bir to‘lov uchun baholash natijasi va aniqlangan sabab. Pastdagi CSV tugmasi orqali yuklab olinadi."
      >
        <template #head>
          <button class="sc-export" @click="onExport">CSV</button>
        </template>
        <div class="sc-filters">
          <button
            v-for="c in chips"
            :key="c.v"
            class="sc-chip"
            :aria-pressed="fr === c.v"
            @click="fr = c.v"
          >
            {{ c.label }}
          </button>
          <n-input v-model:value="q" size="small" clearable :placeholder="$t('salaryControl.common.search')" class="sc-search" />
        </div>
        <div class="sc-scroll">
          <table class="sc-tbl">
            <thead>
              <tr>
                <th class="num" style="width: 48px">№</th>
                <th>{{ $t('salaryControl.risk.table.fio') }}</th>
                <th>{{ $t('salaryControl.risk.table.position') }}</th>
                <th>{{ $t('salaryControl.rules.name') }}</th>
                <th class="num" style="width: 130px">{{ $t('salaryControl.common.sum') }}</th>
                <th>{{ $t('salaryControl.risk.finding') }}</th>
                <th style="width: 190px">{{ $t('salaryControl.rules.result') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(x, i) in registry" :key="i">
                <td class="num">{{ i + 1 }}</td>
                <td><b class="sc-name">{{ x.fio || '—' }}</b></td>
                <td class="sc-muted">{{ x.lav || '—' }}</td>
                <td>{{ normText(x.t) }} <span class="sc-muted">({{ x.k }})</span></td>
                <td class="num">{{ money(x.s) }}</td>
                <td class="sc-muted">{{ normText(x.why) }}</td>
                <td><StatusBadge :tone="RES_TONE[x.res]" :label="x.res" /></td>
              </tr>
              <tr v-if="!registry.length">
                <td colspan="7" class="sc-empty">{{ $t('salaryControl.common.empty') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </template>
  </div>
</template>

<style scoped>
  .sc-intro {
    font-size: 12.5px;
    color: var(--fig-text-tertiary);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  /* —— KPI kartalari —————————————————————————————————————————————————— */
  .sc-kpis {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
  @media (max-width: 900px) {
    .sc-kpis {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  .sc-kpi {
    background: var(--fig-block-bg);
    border: 0.8px solid var(--fig-blue-300);
    border-radius: 14px;
    padding: 12px 14px;
  }
  .sc-kpi__h {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--fig-text-secondary);
  }
  .sc-kpi__v {
    font-size: 24px;
    font-weight: 700;
    color: var(--fig-text-primary);
    margin-top: 6px;
    font-variant-numeric: tabular-nums;
  }
  .sc-kpi__u {
    font-size: 14px;
    font-weight: 600;
    color: var(--fig-text-tertiary);
  }
  .sc-kpi__s {
    font-size: 12px;
    color: var(--fig-text-tertiary);
    margin-top: 2px;
  }
  .sc-tile {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    display: inline-block;
  }
  .sc-tile--green {
    background: var(--fig-icon-green);
  }
  .sc-tile--amber {
    background: var(--fig-icon-amber);
  }
  .sc-tile--red {
    background: var(--fig-icon-red);
  }
  .sc-tile--brand {
    background: var(--fig-icon-brand);
  }
  .sc-tile--indigo {
    background: var(--fig-icon-indigo);
  }
  .sc-tile--muted {
    background: var(--fig-text-tertiary);
  }

  .sc-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .sc-unchecked {
    color: var(--fig-text-tertiary);
    font-size: 12px;
  }

  /* —— Buyruq ro'yxati kiritish —————————————————————————————————————————— */
  .sc-lists {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  @media (max-width: 900px) {
    .sc-lists {
      grid-template-columns: 1fr;
    }
  }
  .sc-lbox {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .sc-lbox__t {
    font-size: 12.5px;
    color: var(--fig-text-secondary);
  }

  /* —— Eksport tugmasi ———————————————————————————————————————————————— */
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

  /* —— Legenda ———————————————————————————————————————————————————————— */
  .sc-legend {
    display: flex;
    gap: 14px;
    font-size: 12px;
    color: var(--fig-text-secondary);
    margin-top: 6px;
    flex-wrap: wrap;
  }
  .sc-legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .sw {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
  }

  /* —— Filtrlar ——————————————————————————————————————————————————————— */
  .sc-filters {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 12px;
  }
  .sc-chip {
    border: 0;
    background: var(--fig-bg-tertiary);
    color: var(--fig-text-secondary);
    border-radius: 10px;
    padding: 6px 14px;
    font: inherit;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
  }
  .sc-chip[aria-pressed='true'] {
    background: var(--fig-icon-brand);
    color: #fff;
    font-weight: 600;
  }
  .sc-search {
    width: 220px;
    max-width: 100%;
  }

  /* —— Jadval ————————————————————————————————————————————————————————— */
  .sc-scroll {
    overflow: auto;
    max-height: 560px;
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
    padding: 10px;
    border-bottom: 1px solid var(--fig-br-disable);
    position: sticky;
    top: 0;
    background: var(--fig-block-header-bg);
    white-space: nowrap;
  }
  .sc-tbl td {
    padding: 10px;
    border-bottom: 1px solid var(--fig-br-disable);
    vertical-align: top;
    color: var(--fig-text-secondary);
  }
  .sc-tbl .num {
    text-align: right;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .sc-name {
    color: var(--fig-text-primary);
  }
  .sc-muted {
    color: var(--fig-text-tertiary);
    font-size: 12px;
    margin-top: 3px;
  }
  .sc-empty {
    text-align: center;
    color: var(--fig-text-tertiary);
    padding: 24px;
  }
</style>
