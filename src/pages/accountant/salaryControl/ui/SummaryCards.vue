<script setup>
  // «Umumiy» KPI kartalari. Korxona tanlanганда — maketdagi 6 ta boy KPI (sub-qatorlar
  // bilan): jami/MHTF, xodimlar/to'liq oy, o'rtacha/median, kartaga/soliq, shubhali,
  // belgilangan holatlar. Korxona tanlanmaganda — yengil summary endpoint ko'rsatkichlari.
  import { computed } from 'vue'
  import i18n from '@/i18n/index.js'
  import { useSalaryControlStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { mlnText } from '../helpers.js'
  import { mhtfFot } from '../engine.js'
  import { KPI } from '../explain.js'
  import ScSkeleton from './ScSkeleton.vue'
  import InfoHint from './InfoHint.vue'

  const { t } = i18n.global
  const store = useSalaryControlStore()
  const money0 = (v) => Utils.formatNumberToMoney(Math.round(Number(v) || 0))

  // Boy KPI'lar dashboard (per-xodim) ma'lumotini talab qiladi — korxona tanlanganда.
  const hasRich = computed(() => store.people.length > 0)

  // —— Boy 6 KPI (maket `// KPIs`, satr 234-249) ——————————————————————————
  const richCards = computed(() => {
    const people = store.people
    const F = store.scFindings
    const kpi = store.dashKpi || {}
    const tots = people.filter((p) => (p.tot || 0) > 0).map((p) => p.tot).sort((a, b) => a - b)
    const n = tots.length
    const tot = kpi.tot || people.reduce((a, p) => a + (p.tot || 0), 0)
    const fot = people.reduce((a, p) => a + mhtfFot(p), 0)
    const card = kpi.card || people.reduce((a, p) => a + (p.card || 0), 0)
    const tax = people.reduce((a, p) => a + (p.tax || 0), 0)
    const med = n ? tots[Math.floor(n / 2)] : 0
    const maxTot = n ? tots[n - 1] : 0
    const nW = people.filter((p) => (p.tot || 0) > 0 && (p.b004 || 0) > 0 && p.ok && p.b004 >= p.ok * 0.99).length
    const sevc = (s) => F.filter((f) => f.sev === s).length
    // Shubhali summa — takroriy/soliq holatlari hisobga olinmaydi (summa dublikatsiyasi).
    const hiSum = F.filter((f) => f.sev === 'Yuqori' && !/qator|INPS|Daromad solig/.test(f.cat)).reduce((a, f) => a + Math.abs(f.summa || 0), 0)
    const hiPeople = new Set(F.filter((f) => f.sev === 'Yuqori').map((f) => f.fio)).size

    return [
      { key: 'tot', tint: 'blue', icon: 'money', label: KPI.tot.label, info: KPI.tot.info, value: mlnText(tot), rows: [['MHTF', mlnText(fot)], ['MHTFdan tashqari', mlnText(tot - fot)]] },
      { key: 'n', tint: 'indigo', icon: 'users', label: KPI.n.label, info: KPI.n.info, value: String(n), rows: [["To'liq oy ishlaganlar", String(nW)], ["Qolganlar (ta'til, qisman)", String(n - nW)]] },
      { key: 'avg', tint: 'green', icon: 'avg', label: KPI.avg.label, info: KPI.avg.info, value: mlnText(n ? tot / n : 0), rows: [['Median', mlnText(med)], ['Eng yuqori', mlnText(maxTot)]] },
      { key: 'card', tint: 'amber', icon: 'card', label: KPI.card.label, info: KPI.card.info, value: mlnText(card), rows: [["Daromad solig'i", mlnText(tax)], ['Boshqa ushlanmalar', mlnText(tot - card - tax)]] },
      { key: 'susp', tint: 'red', icon: 'warn', label: KPI.suspicious.label, info: KPI.suspicious.info, value: mlnText(hiSum), rows: [['Yuqori xavfli holatlar', String(sevc('Yuqori'))], ['Xodimlar soni', String(hiPeople)]] },
      { key: 'flag', tint: 'orange', icon: 'flag', label: KPI.flagged.label, info: KPI.flagged.info, value: String(F.length), rows: [["Yuqori / O'rta", `${sevc('Yuqori')} / ${sevc('O‘rta')}`], ['Past', String(sevc('Past'))]] }
    ]
  })

  // —— Yengil (korxonasiz) summary kartalari ——————————————————————————————
  const basicCards = computed(() => {
    const d = store.summary ?? {}
    return [
      { key: 'accrued', label: t('salaryControl.kpi.accrued'), value: money0(d.total_accrued), tint: 'blue', icon: 'money' },
      { key: 'employees', label: t('salaryControl.kpi.employees'), value: money0(d.employee_count), tint: 'indigo', icon: 'users' },
      { key: 'net', label: t('salaryControl.kpi.net'), value: money0(d.total_net), tint: 'green', icon: 'card' },
      { key: 'deduction', label: t('salaryControl.kpi.deduction'), value: money0(d.total_deduction), tint: 'amber', icon: 'minus' },
      { key: 'orgs', label: t('salaryControl.kpi.orgs'), value: money0(d.org_count), tint: 'red', icon: 'building' }
    ]
  })
</script>

<template>
  <ScSkeleton v-if="store.summaryLoading && !hasRich" variant="kpi" :count="5" />

  <!-- Korxona tanlanган — boy 6 KPI (sub-qatorlar + izoh) -->
  <div v-else-if="hasRich" class="kpi-grid kpi-grid--rich">
    <div v-for="card in richCards" :key="card.key" class="kpi-card">
      <div class="kpi-head">
        <span class="kpi-tile" :class="`kpi-tile--${card.tint}`">
          <svg v-if="card.icon === 'money'" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="3" /></svg>
          <svg v-else-if="card.icon === 'users'" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" /></svg>
          <svg v-else-if="card.icon === 'avg'" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
          <svg v-else-if="card.icon === 'card'" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
          <svg v-else-if="card.icon === 'warn'" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2 20h20L12 3zM12 10v4M12 17h.01" /></svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V4h13l-2 4 2 4H4" /></svg>
        </span>
        <p class="kpi-title">{{ card.label }}</p>
        <InfoHint :text="card.info" />
      </div>
      <p class="kpi-value">{{ card.value }}</p>
      <div class="kpi-rows">
        <div v-for="(r, i) in card.rows" :key="i" class="kpi-row">
          <span>{{ r[0] }}</span><b>{{ r[1] }}</b>
        </div>
      </div>
    </div>
  </div>

  <!-- Korxonasiz — yengil summary kartalari -->
  <div v-else class="kpi-grid">
    <div v-for="card in basicCards" :key="card.key" class="kpi-card">
      <div class="kpi-head">
        <span class="kpi-tile" :class="`kpi-tile--${card.tint}`">
          <svg v-if="card.icon === 'money'" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="3" /></svg>
          <svg v-else-if="card.icon === 'users'" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" /></svg>
          <svg v-else-if="card.icon === 'card'" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
          <svg v-else-if="card.icon === 'minus'" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M8 12h8" /></svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M14 9h4a2 2 0 0 1 2 2v10" /><path d="M8 7h2M8 11h2M8 15h2" /></svg>
        </span>
        <p class="kpi-title">{{ card.label }}</p>
      </div>
      <p class="kpi-value">{{ card.value }}</p>
    </div>
  </div>
</template>

<style scoped>
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
  }
  .kpi-grid--rich {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }

  .kpi-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px 16px;
    border-radius: 16px;
    border: 0.8px solid var(--fig-blue-300);
    background: var(--fig-block-bg);
  }

  .kpi-head {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .kpi-tile {
    flex: none;
    display: inline-grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    color: #fff;
  }

  .kpi-tile svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .kpi-tile--blue { background: var(--fig-icon-brand); }
  .kpi-tile--indigo { background: var(--fig-icon-indigo); }
  .kpi-tile--green { background: var(--fig-icon-green); }
  .kpi-tile--amber { background: var(--fig-icon-amber); }
  .kpi-tile--red { background: var(--fig-icon-red); }
  .kpi-tile--orange { background: var(--fig-icon-orange); }

  .kpi-title {
    min-width: 0;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
    line-height: 18px;
    font-weight: 500;
    color: var(--fig-text-tertiary);
  }

  .kpi-value {
    font-size: 20px;
    line-height: 26px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--fig-text-primary);
  }

  .kpi-rows {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 2px;
  }
  .kpi-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
    color: var(--fig-text-tertiary);
  }
  .kpi-row b {
    color: var(--fig-text-secondary);
    font-variant-numeric: tabular-nums;
    font-weight: 600;
  }
</style>
