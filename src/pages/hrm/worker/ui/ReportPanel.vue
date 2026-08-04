<script setup>
  import { Dismiss16Regular } from '@vicons/fluent'
  import exportIcon from '@/assets/icons/export.svg?url'
  import referenceIcon from '@/assets/icons/reference.svg?url'
  import relativesIcon from '@/assets/icons/qarindoshlar_yuklash.svg?url'

  defineProps({
    selectedCount: {
      type: Number,
      default: 0
    },
    canWrite: {
      type: Boolean,
      default: false
    },
    canZip: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits(['relatives', 'export', 'reference', 'close'])
</script>

<template>
  <div class="report-panel">
    <div class="report-panel__info">
      <p class="report-panel__title">{{ $t('workerPage.filter.generateReport') }}</p>
      <p class="report-panel__desc">{{ $t('workerPage.filter.generateReportDesc') }}</p>
    </div>

    <div class="report-panel__actions">
      <n-button
        v-if="canWrite"
        type="primary"
        :disabled="loading"
        @click="emit('relatives')"
      >
        <template #icon>
          <img class="report-panel__icon" :src="relativesIcon" alt="" />
        </template>
        <span class="report-panel__label">{{ $t('workerPage.filter.relativesReport') }}</span>
        <span class="report-panel__badge report-panel__badge--primary">{{ selectedCount }}</span>
      </n-button>

      <n-button v-if="canWrite" type="success" :disabled="loading" @click="emit('export')">
        <template #icon>
          <img class="report-panel__icon" :src="exportIcon" alt="" />
        </template>
        <span class="report-panel__label">{{ $t('workerPage.filter.excelFile') }}</span>
        <span class="report-panel__badge report-panel__badge--success">{{ selectedCount }}</span>
      </n-button>

      <n-button
        v-if="canWrite && canZip"
        type="error"
        :disabled="!selectedCount"
        @click="emit('reference')"
      >
        <template #icon>
          <img class="report-panel__icon" :src="referenceIcon" alt="" />
        </template>
        <span class="report-panel__label">{{ $t('workerPage.filter.downloadInfo') }}</span>
        <span class="report-panel__badge report-panel__badge--error">{{ selectedCount }}</span>
      </n-button>

      <n-button class="report-panel__close" circle quaternary @click="emit('close')">
        <template #icon>
          <n-icon size="16"><Dismiss16Regular /></n-icon>
        </template>
      </n-button>
    </div>
  </div>
</template>

<style scoped>
  .report-panel {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 20px;
    border-radius: 16px;
    background: var(--surface-ground);
  }

  .report-panel__title {
    margin: 0;
    color: var(--textColor0);
    font-size: 16px;
    font-weight: 700;
  }

  .report-panel__desc {
    margin: 2px 0 0;
    color: var(--textColor2);
    font-size: 13px;
  }

  .report-panel__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
  }

  .report-panel__actions :deep(.n-button) {
    --n-height: 40px !important;
    --n-padding: 0 16px !important;
  }

  .report-panel__actions :deep(.n-button__content) {
    gap: 8px;
  }

  .report-panel__icon {
    width: 16px;
    height: 16px;
    filter: brightness(0) invert(1);
  }

  .report-panel__label {
    white-space: nowrap;
  }

  .report-panel__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 5px;
    border-radius: 999px;
    background: #fff;
    font-size: 12px;
    font-weight: 700;
  }

  .report-panel__badge--primary {
    color: var(--primary-color);
  }

  .report-panel__badge--success {
    color: #18a058;
  }

  .report-panel__badge--error {
    color: #d03050;
  }

  .report-panel__close {
    background: var(--surface-section);
  }

  @media (max-width: 767px) {
    .report-panel {
      flex-direction: column;
      align-items: stretch;
    }

    .report-panel__actions {
      justify-content: flex-end;
    }

    .report-panel__actions :deep(.n-button) {
      flex: 1;
    }
  }
</style>
