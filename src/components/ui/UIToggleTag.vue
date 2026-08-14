<script setup>
  // Bosiladigan teg (pill): tanlangan / tanlanmagan holati bor.
  //
  // Nega alohida komponent: `UIBadge` — statik status belgisi (ikonka bilan,
  // bosilmaydi), `n-tag checkable` esa naive'ning o'z rang sxemasiga bog'lanadi.
  // Bu yerda esa dizayndagi yashil "tanlangan" holati va tema tokenlari kerak.
  //
  // Ishlatish:
  //   <UIToggleTag :label="'Familiyasi'" :checked="isOn" @toggle="isOn = !isOn" />
  const props = defineProps({
    label: { type: String, default: '' },
    checked: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  })

  const emit = defineEmits(['toggle'])

  const onClick = () => {
    if (props.disabled) return
    emit('toggle')
  }
</script>

<template>
  <button
    type="button"
    class="ui-toggle-tag"
    :class="{ 'ui-toggle-tag--on': checked, 'ui-toggle-tag--disabled': disabled }"
    :aria-pressed="checked"
    :disabled="disabled"
    @click="onClick"
  >
    <slot>{{ label }}</slot>
  </button>
</template>

<style scoped>
  .ui-toggle-tag {
    display: inline-flex;
    align-items: center;
    height: 32px;
    padding: 0 14px;
    border: 1px solid transparent;
    border-radius: 999px;
    background: var(--surface-ground);
    color: var(--textColor1);
    font-size: 13px;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background-color 0.15s ease,
      color 0.15s ease,
      border-color 0.15s ease;
  }

  .ui-toggle-tag:hover:not(.ui-toggle-tag--disabled) {
    border-color: var(--surface-line);
    color: var(--textColor0);
  }

  .ui-toggle-tag--on,
  .ui-toggle-tag--on:hover:not(.ui-toggle-tag--disabled) {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: var(--white-color);
  }

  .ui-toggle-tag--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
