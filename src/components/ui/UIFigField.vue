<script setup>
  /**
   * Figma "Input and dropdown" (node 2609:73400) — profil maydoni.
   *
   * `boxed` (asosiy ko'rinish): tepada yorliq, ostida to'ldirilgan quti ichida qiymat.
   * `plain`: yorliq mayda kulrang, qiymati qalin — "Lavozim ma'lumotlari" bloki uchun.
   *
   * `editing` bo'lsa quti o'rniga default slot chiziladi, ya'ni o'sha joyga
   * naive-ui nazorat elementi (n-input, n-select, ...) qo'yiladi.
   */
  defineProps({
    label: {
      type: String,
      default: ''
    },
    value: {
      type: [String, Number],
      default: null
    },
    icon: {
      type: Object,
      default: null
    },
    variant: {
      type: String,
      default: 'boxed' // 'boxed' | 'plain'
    },
    editing: {
      type: Boolean,
      default: false
    }
  })
</script>

<template>
  <div
    class="profile-field"
    :class="[`profile-field--${variant}`, editing && 'profile-field--edit']"
  >
    <span v-if="label" class="profile-field__label">{{ label }}</span>

    <slot v-if="editing" />

    <template v-else-if="variant === 'plain'">
      <span class="profile-field__plain-value">
        <slot name="value">{{ value ?? '—' }}</slot>
      </span>
    </template>

    <div v-else class="profile-field__box">
      <n-icon v-if="icon" :size="20" class="text-fig-text-tertiary shrink-0">
        <component :is="icon" />
      </n-icon>
      <span class="profile-field__value">
        <slot name="value">{{ value ?? '—' }}</slot>
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .profile-field {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .profile-field--boxed {
    gap: 8px;

    .profile-field__label {
      padding-left: 4px;
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: var(--fig-text-secondary);
    }
  }

  .profile-field--plain {
    gap: 8px;

    .profile-field__label {
      font-size: 12px;
      font-weight: 500;
      line-height: 16px;
      color: var(--fig-text-tertiary);
    }
  }

  .profile-field__plain-value {
    font-size: 14px;
    font-weight: 500;
    line-height: 18px;
    color: var(--fig-text-primary);
    word-break: break-word;
  }

  .profile-field__box {
    display: flex;
    align-items: center;
    gap: 24px;
    width: 100%;
    min-height: 36px;
    padding: 8px 16px;
    border-radius: 8px;
    background: var(--fig-bg-secondary);
  }

  .profile-field__value {
    flex: 1 0 0;
    min-width: 0;
    font-size: 14px;
    font-weight: 500;
    line-height: 18px;
    color: var(--fig-text-primary);
    word-break: break-word;
  }

  // Tahrirlash rejimida naive-ui nazorat elementi maketdagi quti bilan bir xil
  // balandlik va radiusga keltiriladi.
  .profile-field--edit.profile-field--boxed :deep(.n-input),
  .profile-field--edit.profile-field--boxed :deep(.n-base-selection) {
    --n-border-radius: 8px;
    --n-height: 36px;
  }
</style>
