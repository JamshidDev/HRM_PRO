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
   * Zanjir bosqichma-bosqich tekshiriladi va har bosqich alohida karta bo'lib
   * chiqadi. Muammoli kartada «Tuzatish» tugmasi bo'ladi; tuzatib bo'lmaydigan
   * holatlarda (qurilma oflayn, yuklanish noma'lum) tugma ko'rsatilmaydi.
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
    style="width: 640px; max-width: 94vw"
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

      <template v-else>
        <p v-if="store.diagData?.worker" class="dg-worker">
          {{ store.diagData.worker }}
          <span v-if="store.diagData.person_id" class="dg-person">
            · HikCentral ID {{ store.diagData.person_id }}
          </span>
        </p>

        <div class="dg-list">
          <div
            v-for="c in store.diagData?.checks ?? []"
            :key="c.key"
            :class="`is-${c.status}`"
            class="dg-card"
          >
            <n-icon :component="ICONS[c.status]" class="dg-icon" size="20" />

            <div class="dg-body">
              <span class="dg-title">{{ c.title }}</span>
              <span class="dg-detail">{{ c.detail }}</span>

              <!-- Ikkala tomondagi qiymat — farq qayerdaligi ko'rinsin. -->
              <span v-if="c.ours || c.theirs" class="dg-values">
                <span
                  >{{ $t('turnstile.diagnose.ours') }}: <b>{{ c.ours ?? '—' }}</b></span
                >
                <span
                  >{{ $t('turnstile.diagnose.theirs') }}: <b>{{ c.theirs ?? '—' }}</b></span
                >
              </span>
            </div>

            <n-button
              v-if="c.fixable"
              :loading="store.diagFixing === c.key"
              class="dg-fix"
              secondary
              size="small"
              type="primary"
              @click="store._diagnoseFix(c.key)"
            >
              <template #icon>
                <n-icon :component="Wrench20Filled" />
              </template>
              {{ $t('turnstile.diagnose.fix') }}
            </n-button>
          </div>
        </div>

        <n-empty
          v-if="!store.diagData?.checks?.length"
          :description="$t('content.noAvailable')"
          class="py-6"
        />
      </template>
    </div>
  </n-modal>
</template>

<style lang="scss" scoped>
  /* Balandlik QAT'IY — yuklanishdan natijaga o'tganda modal sakramaydi. */
  .dg-wrap {
    height: 420px;
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
  .dg-worker {
    margin: 0 0 14px;
    font-size: 14px;
    font-weight: 600;
    color: var(--fig-text-primary);
  }
  .dg-person {
    font-size: 12px;
    font-weight: 400;
    color: var(--fig-text-tertiary);
  }
  .dg-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .dg-card {
    display: flex;
    align-items: flex-start;
    gap: 10px;
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
  .dg-icon {
    flex-shrink: 0;
    margin-top: 1px;
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
  .dg-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
  }
  .dg-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--fig-text-primary);
  }
  .dg-detail {
    font-size: 12px;
    color: var(--fig-text-secondary);
  }
  .dg-values {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 4px;
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    color: var(--fig-text-tertiary);
  }
  .dg-values b {
    color: var(--fig-text-primary);
  }
  .dg-fix {
    flex-shrink: 0;
    align-self: center;
  }
</style>
