<script setup>
  /**
   * Figma "Xodim profili" tugmalari (node 2609:73584 va 2801:73260).
   *
   * O'lchamlar maketdan olingan:
   *  - md (blok amallari): h36, px24 py10, radius 8, 14px Medium
   *  - sm ("Qo'shish"):     h32, px24 py6,  radius 6, 13px Medium
   */
  defineProps({
    variant: {
      type: String,
      default: 'primary' // 'primary' | 'danger' | 'success' | 'brand'
    },
    size: {
      type: String,
      default: 'md' // 'md' | 'sm'
    },
    icon: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  })

  const emits = defineEmits(['click'])
</script>

<template>
  <button
    type="button"
    class="profile-btn"
    :class="[`profile-btn--${variant}`, `profile-btn--${size}`]"
    :disabled="disabled || loading"
    @click="emits('click')"
  >
    <n-spin v-if="loading" :size="size === 'sm' ? 12 : 14" stroke="currentColor" />
    <n-icon v-else-if="icon" :size="size === 'sm' ? 16 : 18" class="shrink-0">
      <component :is="icon" />
    </n-icon>
    <span class="profile-btn__label"><slot /></span>
  </button>
</template>

<style lang="scss" scoped>
  .profile-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: 8px;
    border: 1px solid transparent;
    background: transparent;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background-color 0.15s ease,
      border-color 0.15s ease,
      opacity 0.15s ease;

    &:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
  }

  .profile-btn__label {
    line-height: 18px;
  }

  .profile-btn--md {
    height: 36px;
    max-height: 36px;
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 500;
  }

  .profile-btn--sm {
    height: 32px;
    max-height: 32px;
    padding: 6px 24px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
  }

  .profile-btn--primary {
    background: var(--fig-bg-brand-fill);
    color: #ffffff;

    &:not(:disabled):hover {
      background: #0e5fc0;
    }
  }

  .profile-btn--danger {
    border-color: var(--fig-br-error);
    color: var(--fig-text-red);

    &:not(:disabled):hover {
      background: var(--fig-red-50);
    }
  }

  .profile-btn--success {
    border-color: var(--fig-green-400);
    color: var(--fig-text-green);

    &:not(:disabled):hover {
      background: var(--fig-green-100);
    }
  }

  .profile-btn--brand {
    border-color: var(--fig-text-brand);
    color: var(--fig-text-brand);

    &:not(:disabled):hover {
      background: var(--fig-bg-brand-surface);
    }
  }
</style>
