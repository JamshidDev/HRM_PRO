<script setup>
  import { ChevronDown20Regular, CheckmarkCircle16Regular } from '@vicons/fluent'
  import contractIcon from '@/assets/icons/contract.svg?url'
  import exportIcon from '@/assets/icons/export.svg?url'
  import referenceIcon from '@/assets/icons/reference.svg?url'
  import relativesIcon from '@/assets/icons/qarindoshlar_yuklash.svg?url'

  defineProps({
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
    },
    referenceActive: {
      type: Boolean,
      default: false
    },
    selectedCount: {
      type: Number,
      default: 0
    }
  })

  const emit = defineEmits(['contract', 'export', 'reference', 'download-reference', 'relatives'])
  const visible = ref(false)

  const runAction = (action) => {
    emit(action)
    visible.value = false
  }
</script>

<template>
  <n-popover
    v-model:show="visible"
    trigger="click"
    placement="bottom-end"
    :show-arrow="false"
    :theme-overrides="{ boxShadow: 'none' }"
    raw
  >
    <template #trigger>
      <button type="button" class="quick-actions-trigger" :aria-expanded="visible">
        <span class="quick-actions-trigger__label">
          <img :src="contractIcon" alt="" />
          {{ $t('workerPage.filter.quickActions') }}
        </span>
        <span class="quick-actions-trigger__chevron">
          <n-icon size="20"><ChevronDown20Regular /></n-icon>
        </span>
      </button>
    </template>

    <div class="quick-actions-menu">
      <button
        v-if="canWrite"
        type="button"
        class="quick-action quick-action--brand"
        @click="runAction('contract')"
      >
        <img :src="contractIcon" alt="" />
        <span>{{ $t('workerPage.filter.contract') }}</span>
      </button>

      <button
        v-if="canWrite"
        type="button"
        class="quick-action quick-action--green"
        @click="runAction('export')"
      >
        <img :src="exportIcon" alt="" />
        <span>{{ $t('content.export') }}</span>
      </button>

      <button
        v-if="canWrite"
        type="button"
        class="quick-action quick-action--indigo"
        @click="runAction('reference')"
      >
        <img :src="referenceIcon" alt="" />
        <span>{{ $t('content.reference') }}</span>
      </button>

      <button
        v-if="referenceActive && canZip"
        type="button"
        class="quick-action quick-action--indigo"
        :disabled="!selectedCount"
        @click="runAction('download-reference')"
      >
        <n-icon size="18"><CheckmarkCircle16Regular /></n-icon>
        <span>{{ $t('content.download') }} ({{ selectedCount }})</span>
      </button>

      <button
        type="button"
        class="quick-action quick-action--amber"
        :disabled="loading"
        @click="runAction('relatives')"
      >
        <img :src="relativesIcon" alt="" />
        <span>{{ $t('workerPage.filter.downloadRelative') }}</span>
      </button>
    </div>
  </n-popover>
</template>

<style scoped>
  .quick-actions-trigger {
    display: inline-flex;
    height: 44px;
    overflow: hidden;
    border: 0;
    border-radius: 12px;
    color: #fff;
    background: var(--primary-color);
    box-shadow: 0 6px 16px color-mix(in srgb, var(--primary-color) 24%, transparent);
    cursor: pointer;
  }

  .quick-actions-trigger__label,
  .quick-actions-trigger__chevron {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .quick-actions-trigger__label {
    gap: 8px;
    padding: 0 16px;
    font-size: 14px;
    font-weight: 600;
  }

  .quick-actions-trigger__label img {
    width: 18px;
    height: 18px;
    filter: brightness(0) invert(1);
  }

  .quick-actions-trigger__chevron {
    width: 44px;
    border-left: 1px solid rgb(255 255 255 / 65%);
    transition: background-color 160ms ease;
  }

  .quick-actions-trigger:hover .quick-actions-trigger__chevron {
    background: rgb(0 0 0 / 8%);
  }

  .quick-actions-trigger[aria-expanded='true'] .quick-actions-trigger__chevron {
    background: rgb(0 0 0 / 12%);
  }

  .quick-actions-menu {
    width: min(284px, calc(100vw - 24px));
    margin-top: 7px;
    padding: 8px;
    border-radius: 16px;
    background: var(--surface-section);
    box-shadow: 0 8px 24px rgb(16 24 40 / 12%);
  }

  .quick-action {
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr);
    align-items: center;
    gap: 10px;
    width: 100%;
    min-height: 36px;
    padding: 7px 12px;
    border: 0;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
    transition:
      background-color 160ms ease,
      box-shadow 160ms ease,
      transform 160ms ease;
  }

  .quick-action + .quick-action {
    margin-top: 3px;
  }

  .quick-action img {
    width: 18px;
    height: 18px;
  }

  .quick-action:hover {
    transform: none;
    box-shadow: inset 0 0 0 1px color-mix(in srgb, currentColor 20%, transparent);
  }

  .quick-action:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  .quick-action:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    transform: none;
    box-shadow: none;
  }

  .quick-action--brand {
    color: #1570ef;
    background: var(--surface-section);
  }

  .quick-action--brand:hover {
    background: var(--color-brand-surface);
  }

  .quick-action--green {
    color: #008a45;
    background: var(--surface-section);
  }

  .quick-action--green:hover {
    background: var(--color-green-surface);
  }

  .quick-action--indigo {
    color: #4b46cf;
    background: var(--surface-section);
  }

  .quick-action--indigo:hover {
    background: var(--color-indigo-surface);
  }

  .quick-action--amber {
    color: #b78100;
    background: var(--surface-section);
  }

  .quick-action--amber:hover {
    background: var(--color-amber-surface);
  }

  @media (max-width: 767px) {
    .quick-actions-trigger {
      width: 100%;
    }

    .quick-actions-trigger__label {
      flex: 1;
    }
  }
</style>
