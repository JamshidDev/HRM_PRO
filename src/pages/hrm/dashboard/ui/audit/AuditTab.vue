<script setup>
  import { onMounted } from 'vue'
  import { useDashboardStore } from '@/store/modules/index.js'
  import { auditCards } from './constants.js'
  import AuditPreviewModal from './AuditPreviewModal.vue'

  const store = useDashboardStore()

  onMounted(() => {
    store._getAuditCounts()
  })
</script>

<template>
  <n-spin :show="store.audit.loading" class="min-h-[200px]">
    <n-grid x-gap="4 m:8 l:12" y-gap="4 m:8 l:12" cols="12" responsive="screen">
      <n-grid-item v-for="card in auditCards" :key="card.type" span="12 m:6 l:4 xl:3">
        <div
          class="h-full p-4 border border-surface-line rounded-lg bg-surface-section hover-effect-card flex flex-col justify-between gap-6"
        >
          <p class="font-medium text-textColor2 leading-snug">
            {{ $t(card.title) }}
          </p>
          <div class="flex items-end justify-between">
            <h3 class="text-3xl font-semibold text-textColor0">
              {{ store.audit.counts?.[card.countKey] ?? 0 }}
            </h3>
            <p
              @click="store.openAuditModal(card.type)"
              class="leading-[14px] text-primary border-b border-dashed border-primary cursor-pointer transition-all hover:border-primary/80 hover:text-primary/80"
            >
              {{ $t('content.view') }}
            </p>
          </div>
        </div>
      </n-grid-item>
    </n-grid>

    <AuditPreviewModal />
  </n-spin>
</template>
