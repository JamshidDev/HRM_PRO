<script setup>
  // Daraxtli tanlash (UISelect, UIStructure, UIDepartment, SuperStructure) uchun
  // umumiy trigger. Ilgari tanlanganlar soni input ustida suzuvchi n-badge edi —
  // endi input ichida, o'ng tomonda "son" pill + ochilish strelkasi.
  // Root — oddiy div: n-popover click'ni shunga bog'laydi, useTreePopoverKeyboard
  // esa `triggerRef.$el.querySelector('input')` orqali inputni topadi.
  import { ChevronDown16Regular } from '@vicons/fluent'
  import { naiveIcons } from '@/assets/theme/theme.js'

  defineProps({
    value: { type: String, default: '' },
    count: { type: Number, default: 0 },
    open: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    readonly: { type: Boolean, default: true },
    placeholder: { type: String, default: null },
    clearable: { type: Boolean, default: false }
  })

  const emits = defineEmits(['update:value', 'focus', 'blur', 'keydown', 'clear'])
</script>

<template>
  <div class="tst w-full" :class="open && 'tst--open'">
    <n-input
      class="ui__structure-input w-full"
      type="text"
      :value="value"
      :disabled="disabled"
      :loading="loading"
      :readonly="readonly"
      :placeholder="placeholder ?? undefined"
      @update:value="(v) => emits('update:value', v)"
      @focus="(e) => emits('focus', e)"
      @blur="(e) => emits('blur', e)"
      @keydown="(e) => emits('keydown', e)"
    >
      <template #suffix>
        <span class="flex items-center gap-1">
          <span v-if="count > 0 && !disabled" class="tst-count">{{ count }}</span>
          <button
            v-if="clearable && count > 0 && !disabled"
            type="button"
            :aria-label="$t('content.clear')"
            :title="$t('content.clear')"
            class="ui-clear-btn"
            @click.stop="emits('clear')"
            @keydown.enter.stop
            @keydown.space.stop
          >
            <component :is="naiveIcons.clear" />
          </button>
          <n-icon v-if="!loading" size="14" class="tst-arrow">
            <ChevronDown16Regular />
          </n-icon>
        </span>
      </template>
    </n-input>
  </div>
</template>

<style scoped>
  .tst-count {
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
    color: var(--primary-color);
    background: color-mix(in srgb, var(--primary-color) 12%, transparent);
  }

  .tst-arrow {
    color: var(--textColor3);
    transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .tst--open .tst-arrow {
    transform: rotate(180deg);
    color: var(--primary-color);
  }
</style>
