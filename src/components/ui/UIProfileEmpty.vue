<script setup>
  import icons from '@/assets/icons'

  /**
   * Figma "Bo'sh holat" (node 2813:76006) — jadval o'rnidagi ixcham bo'sh karta.
   * To'liq sahifali `NoDataPicture` bu yerda juda baland bo'lib ketadi.
   */
  defineProps({
    label: {
      type: String,
      default: ''
    },
    // Karta ichida turganda o'z foni va radiusi kerak emas
    bare: {
      type: Boolean,
      default: false
    }
  })
</script>

<template>
  <div class="profile-empty" :class="bare && 'profile-empty--bare'">
    <n-icon :size="32" class="text-fig-text-tertiary">
      <component :is="icons.figSearchAlt" />
    </n-icon>
    <span class="text-sm text-fig-text-secondary text-center">
      {{ label || $t('content.notFoundData') }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
  .profile-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 12px 4px;
    border-radius: 20px;
    background: var(--fig-block-bg);
  }

  .profile-empty--bare {
    padding: 4px;
    border-radius: 0;
    background: transparent;
  }
</style>
