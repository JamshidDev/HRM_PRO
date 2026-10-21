<script setup>
  import { useSalaryControlStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import ScSkeleton from './ScSkeleton.vue'
  import StatusBadge from './StatusBadge.vue'
  import EmptyState from './EmptyState.vue'

  const { t } = i18n.global
  const store = useSalaryControlStore()

  // Backend status -> vizual meta (badge rangi, plita rangi/ikonka, matn kaliti).
  // Ranglar `fig-*` tokenlardan — dark/light temaga o'zi moslashadi.
  const statusMeta = {
    bad: { tone: 'red', icon: 'warn', label: 'salaryControl.risk.status.bad' },
    chk: { tone: 'amber', icon: 'flag', label: 'salaryControl.risk.status.chk' },
    ok: { tone: 'green', icon: 'check', label: 'salaryControl.risk.status.ok' },
    na: { tone: 'indigo', icon: 'chart', label: 'salaryControl.risk.status.na' }
  }

  const statusTone = (status) => statusMeta[status]?.tone ?? 'indigo'
  const statusLabel = (status) => t(statusMeta[status]?.label ?? 'salaryControl.risk.status.na')

  // 4 ta status bo'yicha KPI (soni + risk raqamlari ro'yxati).
  const statusOrder = ['bad', 'chk', 'ok', 'na']
  const kpi = computed(() => {
    const list = store.risks ?? []
    return statusOrder.map((status) => {
      const items = list.filter((r) => r.status === status)
      return {
        status,
        tone: statusTone(status),
        icon: statusMeta[status]?.icon ?? 'chart',
        label: statusLabel(status),
        count: items.length,
        hint: t(`salaryControl.risk.statusHint.${status}`)
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
    for (const r of store.risks ?? []) {
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

  // «Hisoblash usuli» — kartaga bosilganda ochiladi (qaysi risklar ochiq).
  const openMethods = ref(new Set())
  const toggleMethod = (n) => {
    const s = new Set(openMethods.value)
    if (s.has(n)) s.delete(n)
    else s.add(n)
    openMethods.value = s
  }
  const isMethodOpen = (n) => openMethods.value.has(n)
</script>

<template>
  <!-- Yuklanish: kontent shaklidagi skeleton (spinner emas). -->
  <template v-if="store.risksLoading">
    <ScSkeleton variant="kpi" :count="4" />
    <div class="sc-sk-gap">
      <ScSkeleton variant="cards" :count="6" />
    </div>
  </template>

  <template v-else>
    <!-- Bu davr uchun ma'lumot yo'q — aniq xabar (noldan iborat kartalar o'rniga). -->
    <EmptyState
      v-if="!(store.risks?.length)"
      :text="$t('salaryControl.risk.emptyPeriod')"
    />

    <template v-else>
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
      <p v-if="store.norm != null" class="sc-norm">
        {{ $t('salaryControl.risk.norm', { norm: store.norm }) }}
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

            <!-- Ta'sirlangan xodimlar (status na bo'lmaganda va ro'yxat bor bo'lsa). -->
            <n-collapse
              v-if="risk.status !== 'na' && risk.count > 0 && risk.affected?.length"
              class="sc-collapse"
            >
              <n-collapse-item
                :title="$t('salaryControl.risk.affected', { count: risk.count })"
                name="affected"
              >
                <n-table :bordered="false" :single-line="false" size="small">
                  <thead>
                    <tr>
                      <th>{{ $t('salaryControl.risk.table.fio') }}</th>
                      <th>{{ $t('salaryControl.risk.table.position') }}</th>
                      <th>{{ $t('salaryControl.risk.table.detail') }}</th>
                      <th class="text-right">{{ $t('salaryControl.risk.table.summa') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(emp, idx) in risk.affected" :key="idx">
                      <td>{{ emp.fio }}</td>
                      <td>{{ emp.position }}</td>
                      <td>{{ emp.detail }}</td>
                      <td class="text-right">
                        {{ emp.summa != null ? Utils.formatNumberToMoney(emp.summa) : '—' }}
                      </td>
                    </tr>
                  </tbody>
                </n-table>
                <p v-if="risk.affected.length < risk.count" class="sc-affected-note">
                  {{
                    $t('salaryControl.risk.affectedCapped', {
                      count: risk.count,
                      shown: risk.affected.length
                    })
                  }}
                </p>
              </n-collapse-item>
            </n-collapse>
          </div>
        </div>
      </div>
    </template>
  </template>
</template>

<style scoped>
  .sc-sk-gap {
    margin-top: 20px;
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

  /* «N tadan K tasi ko'rsatilgan» — affected jadval ostidagi eslatma. */
  .sc-affected-note {
    margin-top: 6px;
    font-size: 11.5px;
    line-height: 16px;
    color: var(--fig-text-tertiary);
    font-style: italic;
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

  .sc-collapse {
    margin-top: 2px;
  }

  /* n-collapse trigger'ini nozik havola ko'rinishiga keltiramiz */
  .sc-collapse :deep(.n-collapse-item__header) {
    font-size: 12px;
    color: var(--fig-text-brand);
  }
</style>
