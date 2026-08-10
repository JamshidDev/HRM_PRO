<script setup>
  import { UIModal } from '@/components/index.js'
  import { useKpiStore } from '@stores'
  import { Utils } from '@utils'
  import i18n from '@/i18n/index.js'

  const store = useKpiStore()
  const { locale } = i18n.global

  const fullName = computed(() => {
    const w = store.showWorker
    if (!w) return ''
    return [w.last_name, w.first_name, w.middle_name].filter(Boolean).join(' ')
  })

  const employee = computed(() => store.showData?.employee ?? null)
  const score = computed(() => store.showData?.score ?? null)

  // KPI tizimi nomlarni ko'p tilda beradi (`uz`, `ru`, `en`, `kril`). Joriy tilni
  // olamiz, bo'lmasa birinchisiga tushamiz (hujjat tavsiyasi).
  const nameFor = (names) => {
    if (!Array.isArray(names) || !names.length) return ''
    const lang = locale.value === 'uz_kr' ? 'kril' : locale.value
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
        actual: v?.actual ?? null,
        percentage: v?.percentage ?? null,
        approvers: (ind.reviewers ?? [])
          .map((r) => [r.reviewer?.lastName, r.reviewer?.firstName].filter(Boolean).join(' '))
          .filter(Boolean)
          .join(', ')
      }
    })
  )

  // Gauge rangi — KPI tizimining o'z bucketlari (`bad`/`good`/`excellent`).
  const scoreColor = computed(() => {
    switch (score.value?.category) {
      case 'bad':
        return 'var(--danger-color, #E54747)'
      case 'good':
        return 'var(--warning-color, #F0C432)'
      case 'excellent':
        return 'var(--success-color, #45E58D)'
      default:
        return 'var(--info-color, #0062FF)'
    }
  })

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
        <!-- Profil + ball -->
        <div class="kpi-card">
          <img v-if="employee?.photo" :src="employee.photo" class="kpi-photo" alt="" />
          <div class="kpi-card__body">
            <h3 class="kpi-card__name">{{ employee?.fullName }}</h3>
            <p class="kpi-card__muted">
              {{ employee?.orgName }}<template v-if="employee?.position">
                — {{ employee.position }}</template>
            </p>

            <div class="kpi-stats">
              <div>
                <span class="kpi-card__muted">{{ $t('kpiPage.show.positionDate') }}</span>
                <div>{{ Utils.timeOnlyDate(employee?.positionDate) || '' }}</div>
              </div>
              <div>
                <span class="kpi-card__muted">{{ $t('kpiPage.show.age') }}</span>
                <div>{{ age ?? '' }}</div>
              </div>
              <div>
                <span class="kpi-card__muted">{{ $t('kpiPage.show.rankGlobal') }}</span>
                <div>
                  <template v-if="score?.rankGlobal != null">
                    {{ score.rankGlobal }}{{ $t('kpiPage.show.place') }}
                  </template>
                </div>
              </div>
              <div>
                <span class="kpi-card__muted">{{ $t('kpiPage.show.rankOrg') }}</span>
                <div>
                  <template v-if="score?.rankOrg != null">
                    {{ score.rankOrg }}{{ $t('kpiPage.show.place') }}
                  </template>
                </div>
              </div>
            </div>

            <div class="kpi-score">
              <div
                class="kpi-score__fill"
                :style="{ width: `${score?.totalKpiResult ?? 0}%`, background: scoreColor }"
              ></div>
              <span class="kpi-score__label">{{ score?.totalKpiResult ?? 0 }}/100</span>
            </div>
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

        <!-- Ko'rsatkichlar jadvali -->
        <div class="kpi-table-wrap">
          <n-table :single-line="false" size="small" v-if="rows.length">
            <thead>
              <tr>
                <th class="w-[40px] text-center!">{{ $t('content.number') }}</th>
                <th class="min-w-[320px]">{{ $t('kpiPage.show.indicatorName') }}</th>
                <th class="min-w-[120px]">{{ $t('kpiPage.show.unit') }}</th>
                <th class="min-w-[100px]">{{ $t('kpiPage.show.plan') }}</th>
                <th class="min-w-[100px]">{{ $t('kpiPage.show.actual') }}</th>
                <th class="w-[80px]">{{ $t('kpiPage.show.percent') }}</th>
                <th class="min-w-[180px]">{{ $t('kpiPage.show.approvers') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in rows" :key="row.id">
                <td class="text-center">{{ idx + 1 }}</td>
                <td>{{ row.name }}</td>
                <td>{{ row.unit }}</td>
                <td>{{ row.plan ?? '' }}</td>
                <td>{{ row.actual ?? '' }}</td>
                <td>
                  <template v-if="row.percentage != null">{{ row.percentage }}%</template>
                </td>
                <td>{{ row.approvers }}</td>
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
    gap: 16px;
    padding: 16px;
    border: 1px solid var(--surface-line, #e5e7eb);
    border-radius: 16px;
  }
  .kpi-photo {
    width: 110px;
    height: 140px;
    object-fit: cover;
    border-radius: 12px;
    flex-shrink: 0;
  }
  .kpi-card__body {
    flex: 1;
    min-width: 0;
  }
  .kpi-card__name {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--textColor0);
  }
  .kpi-card__muted {
    font-size: 12px;
    color: var(--textColor2);
  }

  .kpi-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin: 12px 0;
    font-size: 13px;
    color: var(--textColor1);
  }

  .kpi-score {
    position: relative;
    height: 24px;
    border-radius: 8px;
    background: var(--surface-ground, #eef2ff);
    overflow: hidden;
  }
  .kpi-score__fill {
    position: absolute;
    inset: 0 auto 0 0;
    border-radius: 8px;
    transition: width 0.3s;
  }
  .kpi-score__label {
    position: absolute;
    right: 10px;
    top: 3px;
    font-size: 12px;
    font-weight: 700;
    color: var(--textColor1);
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

  @media (max-width: 767px) {
    .kpi-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
