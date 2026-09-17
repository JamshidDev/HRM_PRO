<script setup>
  import { useTurnstileHikCentralWorkerStore } from '@/store/modules/index.js'
  import {
    CheckmarkCircle20Filled,
    Warning20Filled,
    DismissCircle20Filled,
    QuestionCircle20Filled,
    Wrench20Filled
  } from '@vicons/fluent'

  /**
   * Xodim diagnostikasi — «tanimayaptimi yoki qo'shilmaganmi» savoliga javob.
   *
   * Tepada bitta jumlalik xulosa, ostida har bosqich alohida karta. Kartada
   * qiymatlar o'z nomi bilan chiqadi (har karta o'zi nomlaydi), muammoli
   * nomlar esa badge bo'lib ko'rinadi.
   */
  const store = useTurnstileHikCentralWorkerStore()

  const ICONS = {
    ok: CheckmarkCircle20Filled,
    warn: Warning20Filled,
    error: DismissCircle20Filled,
    unknown: QuestionCircle20Filled
  }
</script>

<template>
  <n-modal
    v-model:show="store.diagVisible"
    :title="$t('turnstile.diagnose.title')"
    preset="card"
    size="medium"
    style="width: 680px; max-width: 94vw"
  >
    <div class="dg-wrap">
      <!-- Tekshiruv HCP'ga o'nlab so'rov yuboradi (ruxsat guruhlari bittalab
           qidiriladi) — bir necha soniya ketishi normal. Foydalanuvchi nima
           kutayotganini bilishi kerak, shuning uchun oddiy spinner emas. -->
      <div v-if="store.diagLoading" class="dg-loading">
        <n-spin size="large" />
        <span class="dg-loading-title">{{ $t('turnstile.diagnose.checking') }}</span>
        <span class="dg-loading-hint">{{ $t('turnstile.diagnose.checking_hint') }}</span>
      </div>

      <template v-else-if="store.diagData">
        <!-- Yakuniy javob eng tepada — qolganini o'qimasdan ham tushunarli. -->
        <div v-if="store.diagData.summary" :class="`is-${store.diagData.summary.status}`" class="dg-sum">
          <n-icon :component="ICONS[store.diagData.summary.status]" class="dg-sum-icon" size="22" />
          <div class="dg-sum-body">
            <span class="dg-sum-title">{{ store.diagData.summary.title }}</span>
            <span class="dg-sum-detail">{{ store.diagData.summary.detail }}</span>
          </div>
        </div>

        <p v-if="store.diagData.worker" class="dg-worker">
          {{ store.diagData.worker }}
          <span v-if="store.diagData.person_id" class="dg-person">
            · HikCentral ID {{ store.diagData.person_id }}
          </span>
        </p>

        <div class="dg-list">
          <div
            v-for="c in store.diagData.checks ?? []"
            :key="c.key"
            :class="`is-${c.status}`"
            class="dg-card"
          >
            <div class="dg-head">
              <n-icon :component="ICONS[c.status]" class="dg-icon" size="18" />
              <span class="dg-title">{{ c.title }}</span>
              <span class="dg-badge">{{ $t(`turnstile.diagnose.status_${c.status}`) }}</span>

              <n-button
                v-if="c.fixable"
                :loading="store.diagFixing === c.key"
                class="dg-fix"
                secondary
                size="tiny"
                type="primary"
                @click="store._diagnoseFix(c.key)"
              >
                <template #icon>
                  <n-icon :component="Wrench20Filled" />
                </template>
                {{ $t('turnstile.diagnose.fix') }}
              </n-button>
            </div>

            <p class="dg-detail">{{ c.detail }}</p>

            <!-- Har qiymat o'z nomi bilan — «Bizda / HikCentral'da» juftligi
                 kartadan kartaga har xil ma'no berardi. -->
            <div v-if="c.facts?.length" class="dg-facts">
              <div v-for="f in c.facts" :key="f.label" :class="`t-${f.tone}`" class="dg-fact">
                <span class="dg-fact-label">{{ f.label }}</span>
                <span class="dg-fact-value">{{ f.value }}</span>
              </div>
            </div>

            <div v-for="g in c.chip_groups ?? []" :key="g.caption" class="dg-chips">
              <span class="dg-chips-caption">{{ g.caption }}</span>
              <span v-for="it in g.items" :key="it" :class="`c-${g.tone}`" class="dg-chip">{{ it }}</span>
              <span v-if="g.more" class="dg-chip c-more">
                {{ $t('turnstile.diagnose.more', { count: g.more }) }}
              </span>
            </div>
          </div>
        </div>
      </template>

      <n-empty v-else :description="$t('content.noAvailable')" class="py-6" />
    </div>
  </n-modal>
</template>

<style lang="scss" scoped>
  /* Balandlik QAT'IY — yuklanishdan natijaga o'tganda modal sakramaydi. */
  .dg-wrap {
    height: 460px;
    overflow-y: auto;
    padding-right: 4px;
  }
  .dg-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    height: 100%;
  }
  .dg-loading-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--fig-text-primary);
  }
  .dg-loading-hint {
    max-width: 320px;
    text-align: center;
    font-size: 12px;
    line-height: 18px;
    color: var(--fig-text-secondary);
  }

  /* ---- Xulosa ---- */
  .dg-sum {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 10px;
    margin-bottom: 12px;
  }
  .dg-sum.is-ok {
    background: var(--fig-chip-green-bg);
  }
  .dg-sum.is-warn {
    background: var(--fig-chip-amber-bg);
  }
  .dg-sum.is-error {
    background: color-mix(in srgb, var(--fig-text-red) 10%, transparent);
  }
  .dg-sum.is-unknown {
    background: var(--surface-ground-soft);
  }
  .dg-sum-icon {
    flex-shrink: 0;
    margin-top: 1px;
  }
  .dg-sum-body {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .dg-sum-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--fig-text-primary);
  }
  .dg-sum-detail {
    font-size: 12px;
    line-height: 18px;
    color: var(--fig-text-secondary);
  }

  .dg-worker {
    margin: 0 0 10px;
    font-size: 13px;
    font-weight: 600;
    color: var(--fig-text-primary);
  }
  .dg-person {
    font-size: 12px;
    font-weight: 400;
    color: var(--fig-text-tertiary);
  }

  /* ---- Kartalar ---- */
  .dg-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .dg-card {
    padding: 10px 12px;
    border: 1px solid var(--surface-line);
    border-left-width: 3px;
    border-radius: 10px;
  }
  /* Chap chekka rangi holatni bir qarashda ko'rsatadi. */
  .dg-card.is-ok {
    border-left-color: var(--fig-icon-green);
  }
  .dg-card.is-warn {
    border-left-color: var(--fig-chip-amber-text);
  }
  .dg-card.is-error {
    border-left-color: var(--fig-text-red);
  }
  .dg-card.is-unknown {
    border-left-color: var(--surface-line);
  }

  .dg-head {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .dg-icon {
    flex-shrink: 0;
  }
  .is-ok .dg-icon {
    color: var(--fig-icon-green);
  }
  .is-warn .dg-icon {
    color: var(--fig-chip-amber-text);
  }
  .is-error .dg-icon {
    color: var(--fig-text-red);
  }
  .is-unknown .dg-icon {
    color: var(--fig-text-tertiary);
  }
  .dg-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--fig-text-primary);
  }
  /* Holat so'z bilan ham yoziladi — rang yolg'iz yetarli emas. */
  .dg-badge {
    padding: 1px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
  }
  .is-ok .dg-badge {
    background: var(--fig-chip-green-bg);
    color: var(--fig-chip-green-text);
  }
  .is-warn .dg-badge {
    background: var(--fig-chip-amber-bg);
    color: var(--fig-chip-amber-text);
  }
  .is-error .dg-badge {
    background: color-mix(in srgb, var(--fig-text-red) 12%, transparent);
    color: var(--fig-text-red);
  }
  .is-unknown .dg-badge {
    background: var(--surface-ground-soft);
    color: var(--fig-text-tertiary);
  }
  .dg-fix {
    margin-left: auto;
    flex-shrink: 0;
  }

  .dg-detail {
    margin: 4px 0 0 26px;
    font-size: 12px;
    line-height: 18px;
    color: var(--fig-text-secondary);
  }

  /* ---- Qiymatlar ---- */
  .dg-facts {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 8px 0 0 26px;
  }
  .dg-fact {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 110px;
    padding: 5px 9px;
    border-radius: 8px;
    background: var(--surface-ground-soft);
  }
  .dg-fact-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    color: var(--fig-text-tertiary);
  }
  .dg-fact-value {
    font-size: 12px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--fig-text-primary);
  }
  .dg-fact.t-good .dg-fact-value {
    color: var(--fig-text-green);
  }
  .dg-fact.t-bad .dg-fact-value {
    color: var(--fig-text-red);
  }

  /* ---- Nomlar (badge) ---- */
  .dg-chips {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 5px;
    margin: 8px 0 0 26px;
  }
  .dg-chips-caption {
    font-size: 11px;
    font-weight: 600;
    color: var(--fig-text-tertiary);
  }
  .dg-chip {
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    line-height: 16px;
  }
  .dg-chip.c-bad {
    background: color-mix(in srgb, var(--fig-text-red) 12%, transparent);
    color: var(--fig-text-red);
  }
  .dg-chip.c-warn {
    background: var(--fig-chip-amber-bg);
    color: var(--fig-chip-amber-text);
  }
  .dg-chip.c-more {
    background: var(--surface-ground-soft);
    color: var(--fig-text-tertiary);
  }
</style>
