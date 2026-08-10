<script setup>
  import { UIModal } from '@/components/index.js'
  import { useKpiStore } from '@stores'

  const store = useKpiStore()

  const fullName = computed(() => {
    const w = store.showWorker
    if (!w) return ''
    return [w.last_name, w.first_name, w.middle_name].filter(Boolean).join(' ')
  })
</script>

<template>
  <UIModal
    v-model:visible="store.showVisible"
    :title="fullName"
    width="900px"
    :persistent="false"
  >
    <n-spin :show="store.showLoading">
      <!-- Ko'rsatkichlar BOSHQA TIZIMDAN keladi — integratsiya endpointi ulangunicha
           bu yerda xodim ma'lumoti va "tayyorlanmoqda" holati ko'rsatiladi. -->
      <div class="kpi-show">
        <div class="kpi-show__row">
          <span class="kpi-show__label">{{ $t('kpiPage.table.worker') }}</span>
          <span class="kpi-show__value">{{ fullName }}</span>
        </div>
        <div class="kpi-show__row">
          <span class="kpi-show__label">{{ $t('kpiPage.table.pin') }}</span>
          <span class="kpi-show__value">{{ store.showWorker?.pin || '' }}</span>
        </div>
        <div class="kpi-show__row">
          <span class="kpi-show__label">{{ $t('kpiPage.table.position') }}</span>
          <span class="kpi-show__value">{{ store.showWorker?.position || '' }}</span>
        </div>
        <div class="kpi-show__row">
          <span class="kpi-show__label">{{ $t('kpiPage.table.organization') }}</span>
          <span class="kpi-show__value">
            {{ store.showWorker?.organization?.name || '' }}
          </span>
        </div>

        <div class="kpi-show__empty">
          {{ $t('kpiPage.showPending') }}
        </div>
      </div>
    </n-spin>
  </UIModal>
</template>

<style scoped>
  .kpi-show__row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    padding: 10px 0;
    border-bottom: 1px solid var(--surface-line, #e5e7eb);
  }
  .kpi-show__label {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--textColor2);
  }
  .kpi-show__value {
    font-size: 13px;
    font-weight: 500;
    text-align: right;
    color: var(--textColor1);
  }
  .kpi-show__empty {
    margin-top: 20px;
    padding: 28px 12px;
    border: 1px dashed var(--surface-line, #e5e7eb);
    border-radius: 14px;
    text-align: center;
    font-size: 13px;
    color: var(--textColor2);
  }
</style>
