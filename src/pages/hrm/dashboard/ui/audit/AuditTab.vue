<script setup>
  import { useDashboardStore } from '@/store/modules/index.js'
  import { auditCards } from './constants.js'
  import AuditCard from './AuditCard.vue'

  const store = useDashboardStore()

  onMounted(() => {
    store._getAuditCounts()
  })
</script>

<template>
  <n-spin :show="store.audit.loading" class="min-h-[200px]">
    <n-grid x-gap="4 m:8 l:12" y-gap="4 m:8 l:12" cols="12" responsive="screen">
      <n-grid-item v-for="card in auditCards" :key="card.type" span="12 m:6 l:4 xl:3">
        <AuditCard
          :card="card"
          :count="store.audit.counts?.[card.countKey] ?? 0"
          @view="store.openAuditDetail(card.type)"
        />
      </n-grid-item>
    </n-grid>
  </n-spin>
</template>
