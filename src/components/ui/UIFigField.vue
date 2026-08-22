<script setup>
  /**
   * Figma "Input and dropdown" (node 1346:19896 / 2609:73400) — yorliq + qiymat qutisi.
   *
   * `boxed` (asosiy ko'rinish): tepada yorliq, ostida to'ldirilgan quti ichida qiymat.
   * `plain`: yorliq mayda kulrang, qiymati qalin — "Lavozim ma'lumotlari" bloki uchun.
   *
   * `editing` bo'lsa quti o'rniga default slot chiziladi, ya'ni o'sha joyga
   * naive-ui nazorat elementi (n-input, n-select, ...) qo'yiladi.
   *
   * `path` berilsa slot `n-form-item` ichiga o'raladi — yorliq maydonning o'zida
   * turgani uchun `show-label` o'chirilgan holda. `path`siz xulq o'zgarmaydi.
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
    },
    path: {
      type: String,
      default: null
    },
    rulePath: {
      type: String,
      default: null
    }
  })
</script>

<template>
  <div class="fig-field" :class="[`fig-field--${variant}`, editing && 'fig-field--edit']">
    <span v-if="label" class="fig-field__label">{{ label }}</span>

    <template v-if="editing">
      <n-form-item
        v-if="path"
        class="fig-field__form-item"
        :show-label="false"
        :path="path"
        :rule-path="rulePath || undefined"
      >
        <slot />
      </n-form-item>
      <slot v-else />
    </template>

    <template v-else-if="variant === 'plain'">
      <span class="fig-field__plain-value">
        <slot name="value">{{ value ?? '—' }}</slot>
      </span>
    </template>

    <div v-else class="fig-field__box">
      <n-icon v-if="icon" :size="20" class="text-fig-text-tertiary shrink-0">
        <component :is="icon" />
      </n-icon>
      <span class="fig-field__value">
        <slot name="value">{{ value ?? '—' }}</slot>
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .fig-field {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .fig-field--boxed {
    gap: 8px;

    .fig-field__label {
      padding-left: 4px;
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: var(--fig-text-secondary);
    }
  }

  .fig-field--plain {
    gap: 8px;

    .fig-field__label {
      font-size: 12px;
      font-weight: 500;
      line-height: 16px;
      color: var(--fig-text-tertiary);
    }
  }

  .fig-field__plain-value {
    font-size: 14px;
    font-weight: 500;
    line-height: 18px;
    color: var(--fig-text-primary);
    word-break: break-word;
  }

  .fig-field__box {
    display: flex;
    align-items: center;
    gap: 24px;
    width: 100%;
    min-height: 36px;
    padding: 8px 16px;
    border-radius: 8px;
    background: var(--fig-bg-secondary);
  }

  .fig-field__value {
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
  .fig-field--edit.fig-field--boxed :deep(.n-input),
  .fig-field--edit.fig-field--boxed :deep(.n-base-selection) {
    --n-border-radius: 8px;
    --n-height: 36px;
  }

  // Xato matni maydon ostida o'z joyiga ega bo'lsin — aks holda to'r qatorlari
  // validatsiya paytida sakrab ketadi.
  .fig-field__form-item {
    :deep(.n-form-item-feedback-wrapper) {
      min-height: 18px;
      font-size: 12px;
      line-height: 16px;
    }
  }
</style>
