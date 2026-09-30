<script setup>
  import { useSalaryControlStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

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
        numbers: items.map((r) => r.n).join(', ')
      }
    })
  })

  // Risklarni blok bo'yicha guruhlaymiz (tartibni birinchi uchrash bo'yicha saqlaymiz).
  const blocks = computed(() => {
    const map = new Map()
    for (const r of store.risks ?? []) {
      const key = r.block ?? ''
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(r)
    }
    return Array.from(map, ([block, items]) => ({ block, items }))
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
  <n-spin :show="store.risksLoading">
    <!-- Yuqori KPI qatori: status bo'yicha risklar soni. -->
    <div class="sc-kpi-grid">
      <div v-for="card in kpi" :key="card.status" class="sc-kpi-card">
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
          <span class="sc-badge" :class="`sc-badge--${card.tone}`">
            <i class="sc-dot"></i>{{ card.label }}
          </span>
        </div>
        <p class="sc-kpi-value">
          {{ $t('salaryControl.risk.riskCount', { count: card.count }) }}
        </p>
        <p class="sc-kpi-numbers">
          <template v-if="card.numbers">
            {{ $t('salaryControl.risk.riskNumbers', { list: card.numbers }) }}
          </template>
          <template v-else>—</template>
        </p>
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
        <div v-for="risk in group.items" :key="risk.n" class="sc-risk-card">
          <div class="sc-risk-head">
            <span class="sc-rn">{{ risk.n }}</span>
            <b class="sc-risk-title">{{ risk.title }}</b>
            <span class="sc-badge" :class="`sc-badge--${statusTone(risk.status)}`">
              <i class="sc-dot"></i>{{ statusLabel(risk.status) }}
            </span>
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
            </n-collapse-item>
          </n-collapse>
        </div>
      </div>
    </div>

    <!-- Ma'lumot yo'q holati. -->
    <div
      v-if="!store.risksLoading && (store.risks?.length ?? 0) === 0"
      class="py-16 text-center text-textColor3"
    >
      {{ $t('salaryControl.risk.empty') }}
    </div>
  </n-spin>
</template>

<style scoped>
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
