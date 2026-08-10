<script setup>
  import { useDashboardStore } from '@/store/modules/index.js'
  import { auditCards } from './constants.js'
  import Utils from '@/utils/Utils.js'

  const store = useDashboardStore()

  const activeType = computed({
    get: () => store.audit.detail.type,
    set: (v) => store.selectAuditType(v)
  })

  // formatNumberToMoney 0/falsy uchun undefined qaytaradi — shuning uchun guard.
  const countOf = (card) =>
    Utils.formatNumberToMoney(store.audit.counts?.[card.countKey]) ?? 0

  onMounted(() => {
    store._getAuditCounts()
    // Sahifa ochilishi bilan birinchi tur tanlangan holda jadval yuklanadi.
    if (!store.audit.detail.type) store.selectAuditType(auditCards[0].type)
  })
</script>

<template>
  <!-- Pill uslubi `.ui-pill-tabs` da (assets/scss/component.scss); siljiydigan pill
       `type="line"` dagi `.n-tabs-bar` bo'lgani uchun tur o'zgartirilmaydi.
       `n-tab` (panelsiz) — jadval shu komponentdan tashqarida bir marta chiziladi. -->
  <n-tabs v-model:value="activeType" type="line" class="audit-tabs ui-pill-tabs">
    <n-tab v-for="card in auditCards" :key="card.type" :name="card.type">
      <span>{{ $t(card.title) }}</span>
      <span class="audit-count">{{ countOf(card) }}</span>
    </n-tab>
  </n-tabs>
</template>

<style scoped>
  /* `admin/role/ui/createForm.vue` dagi `.perm-count` bilan bir xil retsept. */
  .audit-count {
    display: inline-block;
    min-width: 18px;
    padding: 0 5px;
    margin-left: 6px;
    font-size: 11px;
    line-height: 18px;
    text-align: center;
    border-radius: 9px;
    background: var(--surface-line);
    color: var(--textColor1);
    transition:
      background-color 0.2s ease,
      color 0.2s ease;
  }
  .audit-tabs :deep(.n-tabs-tab--active .audit-count) {
    background: var(--primary-color, #2080f0);
    color: #fff;
  }
</style>
