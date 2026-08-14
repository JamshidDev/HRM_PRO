<script setup>
  /**
   * Figma "Status Toggle" (node 2584:199893) — profil boblari.
   *
   * Yo'lak balandligi 36 va ichki padding 2, faol qism 10px radiusli
   * to'q ko'k tugma, nofaollari shaffof.
   */
  defineProps({
    tabs: {
      type: Array,
      required: true // [{ id, name, icon }]
    },
    modelValue: {
      type: [Number, String],
      default: null
    }
  })

  const emits = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="profile-tabs">
    <button
      v-for="item in tabs"
      :key="item.id"
      type="button"
      class="profile-tabs__item"
      :class="item.id === modelValue && 'profile-tabs__item--active'"
      @click="emits('update:modelValue', item.id)"
    >
      <n-icon v-if="item.icon" :size="18" class="shrink-0">
        <component :is="item.icon" />
      </n-icon>
      <span>{{ item.name }}</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
  // Yo'lak ichida tugmalar atrofida biroz havo qoladi (maketdagi 2px o'rniga 4px),
  // shuning uchun umumiy balandlik 40px — faol tugma o'zi 32px bo'lib qoladi.
  .profile-tabs {
    display: flex;
    align-items: stretch;
    align-self: flex-start;
    flex: 0 1 auto;
    min-width: 0;
    max-width: 100%;
    height: 40px;
    padding: 4px;
    border-radius: 12px;
    background: var(--fig-bg-tertiary);
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .profile-tabs__item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    flex-shrink: 0;
    padding: 8px 16px;
    border: none;
    border-radius: 9999px;
    background: transparent;
    color: var(--fig-text-secondary);
    font-size: 14px;
    font-weight: 500;
    line-height: 18px;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background-color 0.15s ease,
      color 0.15s ease;

    &:not(.profile-tabs__item--active):hover {
      color: var(--fig-text-brand);
    }
  }

  .profile-tabs__item--active {
    border-radius: 10px;
    background: var(--fig-bg-brand-fill);
    color: #ffffff;
    font-weight: 600;
  }
</style>
