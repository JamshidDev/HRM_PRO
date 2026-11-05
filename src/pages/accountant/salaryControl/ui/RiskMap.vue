<script setup>
  import { ref, computed } from 'vue'
  import { useSalaryControlStore } from '@/store/modules/index.js'
  import { RISK_STATUS } from '../engine.js'
  import { SECTION, RISK_METHOD } from '../explain.js'
  import { normText, money2 } from '../helpers.js'
  import { People24Regular, Search20Regular, ArrowRight16Filled } from '@vicons/fluent'
  import { UIModal } from '@/components/index.js'
  import ScSkeleton from './ScSkeleton.vue'
  import StatusBadge from './StatusBadge.vue'
  import EmptyState from './EmptyState.vue'
  import InfoHint from './InfoHint.vue'

  const store = useSalaryControlStore()

  // Status -> vizual meta (badge rangi, plita rangi/ikonka, matn kaliti).
  const statusMeta = {
    bad: { tone: 'red', icon: 'warn', label: 'salaryControl.risk.status.bad' },
    chk: { tone: 'amber', icon: 'flag', label: 'salaryControl.risk.status.chk' },
    ok: { tone: 'green', icon: 'check', label: 'salaryControl.risk.status.ok' },
    na: { tone: 'indigo', icon: 'chart', label: 'salaryControl.risk.status.na' }
  }

  const statusTone = (status) => statusMeta[status]?.tone ?? 'indigo'

  // Engine (14 risk) natijasi — maketning R massivi + reestr. RiskMap shakliga moslanadi.
  // card: {b,n,t,st,f,a} → {n,title,status,block,finding,advice,method,count,affected[]}
  const riskList = computed(() => {
    const { cards, registry } = store.scRisks
    // Reestrni risk raqami bo'yicha guruhlab affected tuzamiz.
    const byRisk = new Map()
    for (const x of registry) {
      if (!byRisk.has(x.r)) byRisk.set(x.r, [])
      byRisk.get(x.r).push(x)
    }
    return cards.map((c) => {
      const items = byRisk.get(c.n) || []
      return {
        n: c.n,
        title: normText(c.t),
        status: c.st,
        block: c.b,
        finding: normText(c.f),
        advice: normText(c.a),
        method: RISK_METHOD[c.n] || '',
        count: items.length,
        // To'liq ro'yxat — modalda ko'rinadi (kartada faqat son). Qidiruv modalda.
        affected: items.map((x) => ({ fio: x.fio, position: x.lav, detail: normText(x.d), summa: x.s }))
      }
    })
  })

  // 4 ta status bo'yicha KPI (soni + risk raqamlari ro'yxati).
  const statusOrder = ['bad', 'chk', 'ok', 'na']
  const kpi = computed(() => {
    const list = riskList.value
    return statusOrder.map((status) => {
      const items = list.filter((r) => r.status === status)
      return {
        status,
        tone: statusTone(status),
        icon: statusMeta[status]?.icon ?? 'chart',
        label: RISK_STATUS[status],
        count: items.length,
        hint: items.map((r) => r.n).join(', ') || '—'
      }
    })
  })

  // Status bo'yicha filtr — status kartochka bosilganda (null = barchasi).
  const activeStatus = ref(null)
  const toggleStatus = (s) => {
    activeStatus.value = activeStatus.value === s ? null : s
  }

  // Risklarni status muhimligi bo'yicha saralash: avval «Xavf aniqlandi».
  const STATUS_RANK = { bad: 0, chk: 1, na: 2, ok: 3 }

  // Risklarni blok bo'yicha guruhlaymiz (tartibni birinchi uchrash bo'yicha saqlaymiz),
  // aktiv status bo'yicha filtrlab, har blok ichida muhimligi bo'yicha saralaymiz.
  const blocks = computed(() => {
    const map = new Map()
    for (const r of riskList.value) {
      if (activeStatus.value && r.status !== activeStatus.value) continue
      const key = r.block ?? ''
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(r)
    }
    return Array.from(map, ([block, items]) => ({
      block,
      items: items
        .slice()
        .sort((a, b) => (STATUS_RANK[a.status] ?? 9) - (STATUS_RANK[b.status] ?? 9))
    }))
  })

  const hasData = computed(() => store.emps.length > 0)

  // «Hisoblash usuli» — kartaga bosilganda ochiladi (qaysi risklar ochiq).
  const openMethods = ref(new Set())
  const toggleMethod = (n) => {
    const s = new Set(openMethods.value)
    if (s.has(n)) s.delete(n)
    else s.add(n)
    openMethods.value = s
  }
  const isMethodOpen = (n) => openMethods.value.has(n)

  // «Ta'sirlangan xodimlar» ro'yxati — kartada son, bosilganda modal (ro'yxat + qidiruv).
  const listModal = ref(false)
  const activeRisk = ref(null)
  const listSearch = ref('')
  const openList = (risk) => {
    activeRisk.value = risk
    listSearch.value = ''
    listModal.value = true
  }
  // F.I.O'dan avatar uchun bosh harflar (ikki so'z) — rasm yo'q, xodimlar ro'yxati uslubi.
  const initials = (fio) => {
    const parts = String(fio || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
    if (!parts.length) return '—'
    const a = parts[0]?.[0] ?? ''
    const b = parts[1]?.[0] ?? ''
    return (a + b).toUpperCase()
  }

  // Modal ichidagi qidiruv — F.I.O yoki lavozim bo'yicha.
  const filteredAffected = computed(() => {
    const risk = activeRisk.value
    if (!risk) return []
    const q = listSearch.value.trim().toLowerCase()
    if (!q) return risk.affected
    return risk.affected.filter(
      (e) =>
        String(e.fio || '').toLowerCase().includes(q) ||
        String(e.position || '').toLowerCase().includes(q)
    )
  })
</script>

<template>
  <!-- Yuklanish: kontent shaklidagi skeleton (spinner emas). -->
  <template v-if="store.dashboardLoading">
    <ScSkeleton variant="kpi" :count="4" />
    <ScSkeleton variant="cards" :count="6" />
  </template>

  <template v-else>
    <!-- Bu davr uchun ma'lumot yo'q — aniq xabar (noldan iborat kartalar o'rniga). -->
    <EmptyState v-if="!hasData" :text="$t('salaryControl.risk.emptyPeriod')" />

    <template v-else>
      <!-- Bo'lim izohi -->
      <p class="sc-intro">
        {{ SECTION.risks.sub }}
        <InfoHint :text="SECTION.risks.info" />
      </p>

      <!-- Yuqori KPI qatori: status bo'yicha risklar soni. -->
      <div class="sc-kpi-grid">
        <div
          v-for="card in kpi"
          :key="card.status"
          class="sc-kpi-card sc-kpi-card--btn"
          :class="[
            `sc-accent--${card.tone}`,
            { 'sc-kpi-card--active': activeStatus === card.status }
          ]"
          role="button"
          tabindex="0"
          :aria-pressed="activeStatus === card.status"
          @click="toggleStatus(card.status)"
          @keydown.enter.prevent="toggleStatus(card.status)"
          @keydown.space.prevent="toggleStatus(card.status)"
        >
          <div class="sc-kpi-head">
            <span class="sc-tile" :class="`sc-tile--${card.tone}`">
              <svg v-if="card.icon === 'warn'" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3 2 20h20L12 3zM12 10v4M12 17h.01" />
              </svg>
              <svg v-else-if="card.icon === 'flag'" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 21V4h13l-2 4 2 4H4" />
              </svg>
              <svg v-else-if="card.icon === 'check'" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
              <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 3v18h18M7 14l4-4 3 3 5-6" />
              </svg>
            </span>
            <StatusBadge :status="card.status" />
          </div>
          <p class="sc-kpi-value">
            {{ $t('salaryControl.risk.riskCount', { count: card.count }) }}
          </p>
          <p class="sc-kpi-numbers">{{ card.hint }}</p>
        </div>
      </div>

      <!-- Oy me'yori. -->
      <p v-if="store.dashNorm != null" class="sc-norm">
        {{ $t('salaryControl.risk.norm', { norm: store.dashNorm }) }}
      </p>

      <!-- Bloklar bo'yicha risk kartalari. -->
      <div v-for="group in blocks" :key="group.block" class="sc-block">
        <div class="sc-block-title">{{ group.block }}</div>

        <div class="sc-risk-grid">
          <div
            v-for="risk in group.items"
            :key="risk.n"
            class="sc-risk-card"
            :class="`sc-accent--${statusTone(risk.status)}`"
          >
            <div class="sc-risk-head">
              <span class="sc-rn" :class="`sc-rn--${statusTone(risk.status)}`">{{ risk.n }}</span>
              <b class="sc-risk-title">{{ risk.title }}</b>
              <StatusBadge :status="risk.status" />
            </div>

            <div v-if="risk.finding" class="sc-finding">
              {{ risk.finding }}
            </div>
            <div v-if="risk.advice" class="sc-advice">→ {{ risk.advice }}</div>

            <!-- Hisoblash usuli — kartaga bosilganda ochiladi (formula + manba). -->
            <button
              v-if="risk.method"
              type="button"
              class="sc-method-toggle"
              @click="toggleMethod(risk.n)"
            >
              <span
                class="sc-method-caret"
                :class="{ 'sc-method-caret--open': isMethodOpen(risk.n) }"
              >›</span>
              {{ $t('salaryControl.risk.method') }}
            </button>
            <div v-if="risk.method && isMethodOpen(risk.n)" class="sc-method">
              {{ risk.method }}
            </div>

            <!-- Ta'sirlangan xodimlar — kartada faqat SON (chip). Bosilganda modal
                 ichida to'liq ro'yxat + qidiruv ochiladi (uzun ro'yxat kartani
                 shishirmaydi). -->
            <button
              v-if="risk.status !== 'na' && risk.count > 0 && risk.affected?.length"
              type="button"
              class="sc-list-chip"
              :class="`sc-list-chip--${statusTone(risk.status)}`"
              @click="openList(risk)"
            >
              <span class="sc-list-chip-ico">
                <n-icon :size="15"><People24Regular /></n-icon>
              </span>
              <span class="sc-list-chip-text">
                {{ $t('salaryControl.risk.viewList', { count: risk.count }) }}
              </span>
              <span class="sc-list-chip-arrow">
                <n-icon :size="14"><ArrowRight16Filled /></n-icon>
              </span>
            </button>
          </div>
        </div>
      </div>
    </template>
  </template>

  <!-- Ta'sirlangan xodimlar ro'yxati — modal (son chip bosilganda). -->
  <UIModal
    v-model:visible="listModal"
    :title="activeRisk?.title || ''"
    :width="640"
    :height="640"
    fullscreen-on-mobile
    @click:close="listModal = false"
  >
    <template #header-actions>
      <span class="sc-list-total">
        {{ $t('salaryControl.risk.listTotal', { count: activeRisk?.count || 0 }) }}
      </span>
    </template>

    <div class="sc-list-wrap">
      <n-input
        v-model:value="listSearch"
        clearable
        class="sc-list-search"
        :placeholder="$t('salaryControl.risk.searchPlaceholder')"
      >
        <template #prefix>
          <n-icon :size="16"><Search20Regular /></n-icon>
        </template>
      </n-input>

      <div class="sc-list-rows">
        <div v-for="(emp, idx) in filteredAffected" :key="idx" class="sc-list-row">
          <span class="sc-list-idx">{{ idx + 1 }}</span>
          <span class="sc-list-avatar" :class="`sc-list-avatar--${activeRisk ? statusTone(activeRisk.status) : 'indigo'}`">
            {{ initials(emp.fio) }}
          </span>
          <div class="sc-list-main">
            <div class="sc-list-fio">{{ emp.fio }}</div>
            <div v-if="emp.position" class="sc-list-pos">{{ emp.position }}</div>
            <div v-if="emp.detail" class="sc-list-detail">{{ emp.detail }}</div>
          </div>
          <span v-if="emp.summa != null && emp.summa !== 0" class="sc-list-summa">
            {{ money2(emp.summa) }}
          </span>
        </div>

        <p v-if="!filteredAffected.length" class="sc-list-empty">
          {{ $t('salaryControl.risk.noMatch') }}
        </p>
      </div>
    </div>
  </UIModal>
</template>

<style scoped>
  .sc-sk-gap {
    margin-top: 20px;
  }
  .sc-intro {
    font-size: 12.5px;
    color: var(--fig-text-tertiary);
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 14px;
  }

  /* Bu davr uchun ma'lumot yo'q — aniq, markazlashgan xabar. */
  .sc-empty-period {
    padding: 56px 24px;
    text-align: center;
    font-size: 14px;
    line-height: 1.5;
    color: var(--fig-text-tertiary);
    background: var(--fig-block-bg);
    border: 0.8px dashed var(--fig-blue-300);
    border-radius: 16px;
  }

  /* ---- yuqori status KPI qatori ---- */
  .sc-kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
  }

  .sc-kpi-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px 16px;
    border-radius: 16px;
    border: 0.8px solid var(--fig-blue-300);
    background: var(--fig-block-bg);
  }

  /* Status kartochka bosiladigan (filtr) — hover/active holati. */
  .sc-kpi-card--btn {
    cursor: pointer;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease,
      transform 0.05s ease;
    outline: none;
  }
  .sc-kpi-card--btn:hover {
    border-color: var(--fig-icon-brand);
  }
  .sc-kpi-card--btn:focus-visible {
    border-color: var(--fig-icon-brand);
    box-shadow: 0 0 0 2px var(--fig-icon-brand);
  }
  .sc-kpi-card--btn:active {
    transform: translateY(1px);
  }
  .sc-kpi-card--active {
    border-color: var(--fig-icon-brand);
    box-shadow: inset 3px 0 0 0 var(--fig-icon-brand);
    background: var(--fig-bg-secondary);
  }

  .sc-kpi-head {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .sc-kpi-value {
    font-size: 20px;
    line-height: 26px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--fig-text-primary);
  }

  .sc-kpi-numbers {
    font-size: 12px;
    line-height: 16px;
    color: var(--fig-text-tertiary);
  }

  /* ---- rangli plita (icon tile) ---- */
  .sc-tile {
    flex: none;
    display: inline-grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    color: #fff;
  }

  .sc-tile svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .sc-tile--red {
    background: var(--fig-icon-red);
  }
  .sc-tile--amber {
    background: var(--fig-icon-amber);
  }
  .sc-tile--green {
    background: var(--fig-icon-green);
  }
  .sc-tile--indigo {
    background: var(--fig-icon-indigo);
  }

  /* ---- status badge (nuqta bilan) ---- */
  .sc-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 2px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }

  .sc-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    display: inline-block;
  }

  .sc-badge--red {
    background: var(--fig-red-100);
    color: var(--fig-text-red);
  }
  .sc-badge--amber {
    background: var(--fig-chip-amber-bg);
    color: var(--fig-chip-amber-text);
  }
  .sc-badge--green {
    background: var(--fig-chip-green-bg);
    color: var(--fig-chip-green-text);
  }
  .sc-badge--indigo {
    background: var(--fig-chip-indigo-bg);
    color: var(--fig-chip-indigo-text);
  }

  /* ---- oy me'yori ---- */
  .sc-norm {
    margin-top: 12px;
    font-size: 12px;
    line-height: 16px;
    color: var(--fig-text-tertiary);
  }

  /* ---- bloklar va risk kartalari ---- */
  .sc-block {
    margin-top: 20px;
  }

  /* Oxirgi blok viewport tubiga tiqilib qolmasligi uchun pastki bo'shliq. */
  .sc-block:last-child {
    padding-bottom: 48px;
  }

  /* «Hisoblash usuli» — bosiladigan qator + ochiladigan panel. */
  .sc-method-toggle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
    font: inherit;
    font-size: 12px;
    font-weight: 600;
    color: var(--fig-text-brand);
  }
  .sc-method-caret {
    display: inline-block;
    transition: transform 0.15s ease;
  }
  .sc-method-caret--open {
    transform: rotate(90deg);
  }
  .sc-method {
    margin-top: 6px;
    padding: 8px 10px;
    border-radius: 8px;
    background: var(--fig-bg-secondary);
    border: 1px dashed var(--fig-blue-300);
    font-size: 12px;
    line-height: 1.5;
    color: var(--fig-text-secondary);
  }

  .sc-block-title {
    margin: 0 0 8px 2px;
    font-size: 13px;
    font-weight: 600;
    color: var(--fig-text-tertiary);
  }

  .sc-risk-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 12px;
  }

  .sc-risk-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 14px 14px;
    border-radius: 16px;
    border: 0.8px solid var(--fig-blue-300);
    background: var(--fig-block-bg);
  }

  /* Status-rangli chap aksent — kartani buzmay, holatni bir qarashda ajratadi.
     Ramka/fon o'zgarmaydi; faqat ichki 3px rangli chiziq (fig-icon-* token). */
  .sc-accent--red {
    box-shadow: inset 3px 0 0 0 var(--fig-icon-red);
  }
  .sc-accent--amber {
    box-shadow: inset 3px 0 0 0 var(--fig-icon-amber);
  }
  .sc-accent--green {
    box-shadow: inset 3px 0 0 0 var(--fig-icon-green);
  }
  .sc-accent--indigo {
    box-shadow: inset 3px 0 0 0 var(--fig-icon-indigo);
  }

  .sc-risk-head {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    flex-wrap: wrap;
  }

  .sc-rn {
    flex: none;
    display: inline-grid;
    place-items: center;
    min-width: 24px;
    height: 24px;
    padding: 0 4px;
    border-radius: 8px;
    background: var(--fig-icon-brand);
    color: #fff;
    font-weight: 700;
    font-size: 12px;
  }

  /* Raqam plitasi ham holat rangida — aksent bilan uyg'un (fig-icon-* token). */
  .sc-rn--red {
    background: var(--fig-icon-red);
  }
  .sc-rn--amber {
    background: var(--fig-icon-amber);
  }
  .sc-rn--green {
    background: var(--fig-icon-green);
  }
  .sc-rn--indigo {
    background: var(--fig-icon-indigo);
  }

  .sc-risk-title {
    flex: 1;
    min-width: 150px;
    font-size: 13.5px;
    line-height: 18px;
    font-weight: 600;
    color: var(--fig-text-primary);
  }

  .sc-finding {
    font-size: 13px;
    line-height: 18px;
    color: var(--fig-text-secondary);
    background: var(--fig-bg-secondary);
    border-radius: 10px;
    padding: 8px 10px;
    white-space: pre-line;
  }

  .sc-advice {
    font-size: 12px;
    line-height: 16px;
    color: var(--fig-text-brand);
    white-space: pre-line;
  }

  /* ---- Ta'sirlangan xodimlar: SON chip (kartada) ---- */
  .sc-list-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    align-self: flex-start;
    margin-top: 4px;
    padding: 6px 10px 6px 8px;
    border: 0.8px solid var(--fig-blue-300);
    border-radius: 999px;
    background: var(--fig-bg-secondary);
    cursor: pointer;
    font: inherit;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--fig-text-secondary);
    transition:
      border-color 0.15s ease,
      background 0.15s ease,
      transform 0.05s ease;
    outline: none;
  }
  .sc-list-chip:hover {
    border-color: var(--fig-icon-brand);
    background: var(--fig-block-bg);
  }
  .sc-list-chip:focus-visible {
    border-color: var(--fig-icon-brand);
    box-shadow: 0 0 0 2px var(--fig-icon-brand);
  }
  .sc-list-chip:active {
    transform: translateY(1px);
  }
  .sc-list-chip-ico {
    display: inline-grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    color: #fff;
    flex: none;
  }
  .sc-list-chip-text {
    white-space: nowrap;
  }
  .sc-list-chip-arrow {
    display: inline-grid;
    place-items: center;
    color: var(--fig-text-tertiary);
    transition: transform 0.15s ease;
  }
  .sc-list-chip:hover .sc-list-chip-arrow {
    transform: translateX(2px);
    color: var(--fig-icon-brand);
  }
  /* chip ikonka doirasi — risk holati rangida (aksent bilan uyg'un) */
  .sc-list-chip--red .sc-list-chip-ico {
    background: var(--fig-icon-red);
  }
  .sc-list-chip--amber .sc-list-chip-ico {
    background: var(--fig-icon-amber);
  }
  .sc-list-chip--green .sc-list-chip-ico {
    background: var(--fig-icon-green);
  }
  .sc-list-chip--indigo .sc-list-chip-ico {
    background: var(--fig-icon-indigo);
  }

  /* ---- Modal: xodimlar ro'yxati ---- */
  .sc-list-total {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--fig-text-tertiary);
    white-space: nowrap;
  }
  .sc-list-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 12px;
  }
  .sc-list-search {
    flex: none;
  }
  .sc-list-rows {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    margin: 0 -4px;
  }
  .sc-list-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 9px 8px;
    border-radius: 10px;
    border-bottom: 0.8px solid var(--fig-surface-line, var(--fig-blue-300));
    transition: background 0.12s ease;
  }
  .sc-list-row:last-child {
    border-bottom: 0;
  }
  .sc-list-row:hover {
    background: var(--fig-bg-secondary);
  }
  .sc-list-idx {
    flex: none;
    min-width: 22px;
    padding-top: 9px;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: var(--fig-text-tertiary);
    text-align: right;
  }
  /* Avatar — rasm o'rniga bosh harflar (xodimlar ro'yxati uslubi). */
  .sc-list-avatar {
    flex: none;
    display: inline-grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    font-size: 12.5px;
    font-weight: 700;
    letter-spacing: 0.2px;
    color: #fff;
    user-select: none;
  }
  .sc-list-avatar--red {
    background: var(--fig-icon-red);
  }
  .sc-list-avatar--amber {
    background: var(--fig-icon-amber);
  }
  .sc-list-avatar--green {
    background: var(--fig-icon-green);
  }
  .sc-list-avatar--indigo {
    background: var(--fig-icon-indigo);
  }
  .sc-list-main {
    flex: 1;
    min-width: 0;
    padding-top: 1px;
  }
  .sc-list-fio {
    font-size: 13.5px;
    font-weight: 600;
    line-height: 18px;
    color: var(--fig-text-primary);
  }
  .sc-list-pos {
    font-size: 12px;
    line-height: 16px;
    color: var(--fig-text-tertiary);
    margin-top: 1px;
  }
  .sc-list-detail {
    font-size: 11.5px;
    line-height: 16px;
    color: var(--fig-text-secondary);
    margin-top: 3px;
  }
  .sc-list-summa {
    flex: none;
    padding-top: 9px;
    font-size: 13px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--fig-text-primary);
    white-space: nowrap;
    text-align: right;
  }
  .sc-list-empty {
    padding: 40px 16px;
    text-align: center;
    font-size: 13px;
    color: var(--fig-text-tertiary);
  }
</style>
