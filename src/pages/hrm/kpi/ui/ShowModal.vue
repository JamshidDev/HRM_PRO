<script setup>
  import { UIModal } from '@/components/index.js'
  import { useKpiStore } from '@stores'
  import { Utils } from '@utils'
  import i18n from '@/i18n/index.js'

  const store = useKpiStore()

  const fullName = computed(() => {
    const w = store.showWorker
    if (!w) return ''
    return [w.last_name, w.first_name, w.middle_name].filter(Boolean).join(' ')
  })

  const employee = computed(() => store.showData?.employee ?? null)
  const score = computed(() => store.showData?.score ?? null)

  // KPI tizimi nomlarni ko'p tilda beradi (`uz`, `ru`, `en`, `kril`).
  // ⚠️ i18n `legacy: true` — `i18n.global.locale` ODDIY SATR (ref emas), shu bois
  // `.value` ishlatilmaydi: aks holda `undefined` bo'lib, fallback har doim
  // massivning birinchi elementini (`kril`) tanlardi.
  const nameFor = (names) => {
    if (!Array.isArray(names) || !names.length) return ''
    const current = i18n.global.locale
    const lang = current === 'uz_kr' ? 'kril' : current
    return names.find((n) => n.lang === lang)?.data ?? names[0]?.data ?? ''
  }

  // Bitta chaqiruvda yilning BARCHA davrlari keladi — tablar shu ro'yxatdan.
  const periods = computed(() => {
    const set = new Set()
    for (const ind of store.showData?.indicators ?? []) {
      for (const d of ind.indicatorData ?? []) {
        if (d?.indicatorGroup?.periodName) set.add(d.indicatorGroup.periodName)
      }
    }
    return [...set].sort((a, b) => Number(a.split('-')[0]) - Number(b.split('-')[0]))
  })

  // Tanlangan davrga tegishli qatorlar (har ko'rsatkich — bitta qator).
  const rows = computed(() =>
    (store.showData?.indicators ?? []).map((ind) => {
      const d = (ind.indicatorData ?? []).find(
        (x) => x?.indicatorGroup?.periodName === store.selectedPeriod
      )
      const v = d?.userIndicatorDataValue
      return {
        id: ind.id,
        name: nameFor(ind.names),
        unit: nameFor(ind.unit?.names),
        plan: d?.plan ?? null,
        weight: d?.weight ?? null,
        actual: v?.actual ?? null,
        percentage: v?.percentage ?? null,
        approvers: (ind.reviewers ?? [])
          .map((r) => [r.reviewer?.lastName, r.reviewer?.firstName].filter(Boolean).join(' '))
          .filter(Boolean)
          .join(', ')
      }
    })
  )

  // Rang — KPI tizimining o'z bucketlari (`bad` <33.33, `good` <66.66, `excellent`).
  const COLORS = {
    bad: '#E54747',
    good: '#F0C432',
    excellent: '#2DCB73'
  }
  const scoreColor = computed(() => COLORS[score.value?.category] ?? '#0062FF')

  // Ko'rsatkich bajarilishi 100% dan oshishi mumkin — chiziq to'lib qolsin.
  const barPercent = (v) => Math.max(0, Math.min(100, Number(v) || 0))
  const barColor = (v) => {
    const n = Number(v) || 0
    if (n < 33.33) return COLORS.bad
    if (n < 66.66) return COLORS.good
    return COLORS.excellent
  }

  const age = computed(() => {
    const b = employee.value?.birthday
    if (!b) return null
    const diff = Date.now() - new Date(b).getTime()
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
  })
</script>

<template>
  <UIModal
    v-model:visible="store.showVisible"
    :title="fullName"
    width="1200px"
    height="700px"
    :persistent="false"
  >
    <n-spin :show="store.showLoading" class="h-full">
      <!-- KPI tizimida yo'q xodim — bu XATO emas, shunchaki ma'lumot yo'q. -->
      <div v-if="!store.showLoading && !store.showOnboarded" class="kpi-empty">
        {{ $t('kpiPage.show.notOnboarded') }}
      </div>

      <div v-else-if="store.showData" class="kpi-detail">
        <!-- Profil + umumiy ball (gauge) -->
        <div class="kpi-card">
          <img v-if="employee?.photo" :src="employee.photo" class="kpi-photo" alt="" />

          <div class="kpi-card__body">
            <h3 class="kpi-card__name">{{ employee?.fullName }}</h3>
            <p class="kpi-card__muted">{{ employee?.position || employee?.orgName }}</p>

            <div class="kpi-stats">
              <div class="kpi-stat">
                <span class="kpi-stat__label">{{ $t('kpiPage.show.positionDate') }}</span>
                <span class="kpi-stat__value">
                  {{ Utils.timeOnlyDate(employee?.positionDate) || '—' }}
                </span>
              </div>
              <div class="kpi-stat">
                <span class="kpi-stat__label">{{ $t('kpiPage.show.age') }}</span>
                <span class="kpi-stat__value">{{ age ?? '—' }}</span>
              </div>
              <div class="kpi-stat">
                <span class="kpi-stat__label">{{ $t('kpiPage.show.rankGlobal') }}</span>
                <span class="kpi-stat__value">
                  <template v-if="score?.rankGlobal != null">
                    {{ score.rankGlobal }}{{ $t('kpiPage.show.place') }}
                  </template>
                  <template v-else>—</template>
                </span>
              </div>
              <div class="kpi-stat">
                <span class="kpi-stat__label">{{ $t('kpiPage.show.rankOrg') }}</span>
                <span class="kpi-stat__value">
                  <template v-if="score?.rankOrg != null">
                    {{ score.rankOrg }}{{ $t('kpiPage.show.place') }}
                  </template>
                  <template v-else>—</template>
                </span>
              </div>
            </div>
          </div>

          <!-- Umumiy natija — doiraviy diagramma (0–100) -->
          <div class="kpi-gauge">
            <n-progress
              type="circle"
              :percentage="barPercent(score?.totalKpiResult)"
              :color="scoreColor"
              :stroke-width="10"
              :offset-degree="180"
            >
              <div class="kpi-gauge__inner">
                <span class="kpi-gauge__value">{{ score?.totalKpiResult ?? 0 }}</span>
                <span class="kpi-gauge__max">/ 100</span>
              </div>
            </n-progress>
            <span class="kpi-gauge__period">{{ score?.periodName }}</span>
          </div>
        </div>

        <!-- Davr tablari (yilning barcha choraklari bitta javobda keladi) -->
        <div v-if="periods.length" class="kpi-periods">
          <n-button
            v-for="p in periods"
            :key="p"
            size="small"
            round
            :type="p === store.selectedPeriod ? 'primary' : 'default'"
            @click="store.selectedPeriod = p"
          >
            {{ p.split('-')[0] }}{{ $t('kpiPage.show.quarter') }}
          </n-button>
        </div>

        <!-- Ko'rsatkichlar jadvali — bajarilish ustuni chiziqli diagramma bilan -->
        <div class="kpi-table-wrap">
          <n-table :single-line="false" size="small" v-if="rows.length">
            <thead>
              <tr>
                <th class="w-[40px] text-center!">{{ $t('content.number') }}</th>
                <th class="min-w-[300px]">{{ $t('kpiPage.show.indicatorName') }}</th>
                <th class="min-w-[110px]">{{ $t('kpiPage.show.unit') }}</th>
                <th class="min-w-[90px]">{{ $t('kpiPage.show.plan') }}</th>
                <th class="min-w-[90px]">{{ $t('kpiPage.show.actual') }}</th>
                <th class="min-w-[160px]">{{ $t('kpiPage.show.percent') }}</th>
                <th class="min-w-[170px]">{{ $t('kpiPage.show.approvers') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in rows" :key="row.id">
                <td class="text-center">{{ idx + 1 }}</td>
                <td>{{ row.name }}</td>
                <td>{{ row.unit }}</td>
                <td>{{ row.plan ?? '—' }}</td>
                <td>{{ row.actual ?? '—' }}</td>
                <td>
                  <div v-if="row.percentage != null" class="kpi-bar">
                    <n-progress
                      type="line"
                      :percentage="barPercent(row.percentage)"
                      :color="barColor(row.percentage)"
                      :height="8"
                      :show-indicator="false"
                      :border-radius="6"
                    />
                    <span class="kpi-bar__value">{{ row.percentage }}%</span>
                  </div>
                  <span v-else class="kpi-muted">—</span>
                </td>
                <td>{{ row.approvers || '—' }}</td>
              </tr>
            </tbody>
          </n-table>
          <div v-else class="kpi-empty">{{ $t('kpiPage.show.noIndicators') }}</div>
        </div>
      </div>
    </n-spin>
  </UIModal>
</template>

<style scoped>
  .kpi-detail {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 600px;
  }

  .kpi-card {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 16px 20px;
    border: 1px solid var(--surface-line, #e5e7eb);
    border-radius: 18px;
    background: var(--surface-ground-soft, #f9fafb);
  }
  .kpi-photo {
    width: 96px;
    height: 120px;
    object-fit: cover;
    border-radius: 14px;
    flex-shrink: 0;
  }
  .kpi-card__body {
    flex: 1;
    min-width: 0;
  }
  .kpi-card__name {
    margin: 0 0 2px;
    font-size: 17px;
    font-weight: 600;
    color: var(--textColor0);
  }
  .kpi-card__muted {
    margin: 0;
    font-size: 12px;
    line-height: 1.4;
    color: var(--textColor2);
  }

  .kpi-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-top: 14px;
  }
  .kpi-stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 12px;
    border-radius: 12px;
    background: var(--surface-section, #fff);
    border: 1px solid var(--surface-line, #e5e7eb);
  }
  .kpi-stat__label {
    font-size: 11px;
    color: var(--textColor2);
  }
  .kpi-stat__value {
    font-size: 14px;
    font-weight: 600;
    color: var(--textColor1);
  }

  .kpi-gauge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    width: 140px;
    flex-shrink: 0;
  }
  .kpi-gauge__inner {
    display: flex;
    align-items: baseline;
    gap: 2px;
  }
  .kpi-gauge__value {
    font-size: 22px;
    font-weight: 700;
    color: var(--textColor0);
  }
  .kpi-gauge__max {
    font-size: 12px;
    color: var(--textColor2);
  }
  .kpi-gauge__period {
    font-size: 12px;
    color: var(--textColor2);
  }

  .kpi-periods {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .kpi-table-wrap {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  .kpi-bar {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .kpi-bar :deep(.n-progress) {
    flex: 1;
    min-width: 70px;
  }
  .kpi-bar__value {
    font-size: 12px;
    font-weight: 600;
    color: var(--textColor1);
    white-space: nowrap;
  }
  .kpi-muted {
    color: var(--textColor2);
  }

  .kpi-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 320px;
    padding: 24px;
    font-size: 13px;
    color: var(--textColor2);
    text-align: center;
  }

  @media (max-width: 1023px) {
    .kpi-card {
      flex-wrap: wrap;
    }
    .kpi-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
