<template>
  <div class="ui-page-title-row">
    <div class="ui-page-title-text">
      <h1 class="ui-page-title">
        <slot name="title">{{ title }}</slot>
      </h1>
      <p v-if="subtitle || $slots.subtitle" class="ui-page-subtitle">
        <slot name="subtitle">{{ subtitle }}</slot>
      </p>
    </div>
    <div v-if="$slots.actions" class="ui-page-title-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup>
  defineProps({
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    }
  })
</script>

<style scoped>
  .ui-page-title-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  .ui-page-title-text {
    min-width: 0;
  }

  .ui-page-title {
    margin: 0;
    color: var(--textColor0);
    font-size: 24px;
    font-weight: 700;
  }

  .ui-page-subtitle {
    margin: 4px 0 0;
    color: var(--textColor3);
    font-size: 14px;
  }

  .ui-page-title-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
</style>
