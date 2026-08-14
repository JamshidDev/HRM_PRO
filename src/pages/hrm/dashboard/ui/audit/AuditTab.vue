<script setup>
  import { UISegmentTabs } from '@/components/index.js'
  import { useDashboardStore } from '@/store/modules/index.js'
  import { auditCards } from './constants.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useDashboardStore()

  // formatNumberToMoney 0/falsy uchun undefined qaytaradi — shuning uchun guard.
  const countOf = (card) => Utils.formatNumberToMoney(store.audit.counts?.[card.countKey]) ?? 0

  const tabList = computed(() =>
    auditCards.map((card) => ({
      id: card.type,
      name: t(card.title),
      badge: countOf(card)
    }))
  )

  onMounted(() => {
    store._getAuditCounts()
    // Sahifa ochilishi bilan birinchi tur tanlangan holda jadval yuklanadi.
    if (!store.audit.detail.type) store.selectAuditType(auditCards[0].type)
  })
</script>

<template>
  <!-- Jadval shu komponentdan tashqarida bir marta chiziladi — boblar faqat turni tanlaydi -->
  <UISegmentTabs
    :tabs="tabList"
    :model-value="store.audit.detail.type"
    @update:model-value="store.selectAuditType"
  />
</template>
