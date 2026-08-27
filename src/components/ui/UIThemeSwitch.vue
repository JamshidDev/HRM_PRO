<script setup>
  /**
   * Figma "Header Container" (node 2646:184433 / AppSidebarItem 3288:73103) —
   * mavzu almashtirgich.
   *
   * Maketda: 36px doira, `bg-tertiary` foni, ichida 20px ikonka. Maketda
   * kunduzgi sahifada QUYOSH ko'rsatilgan, ya'ni ikonka JORIY mavzuni
   * bildiradi (tungi rejimda oy). Ilgari bu teskari edi — bosilganda
   * o'tiladigan mavzu ikonkasi turardi.
   */
  import { useAppStore } from '@/store/modules/index.js'
  import { WeatherMoon28Filled } from '@vicons/fluent'
  import SunIcon from '@/assets/icons/figSun.svg'

  const store = useAppStore()

  const toggle = () => store.setThemeMode(store.isDark ? 'light' : 'dark')
</script>

<template>
  <button
    type="button"
    class="relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-fig-bg-tertiary text-fig-amber transition-opacity hover:opacity-80"
    :aria-label="$t('content.theme')"
    @click="toggle"
  >
    <span class="mode-icon" :class="{ 'mode-icon--active': !store.isDark }">
      <SunIcon />
    </span>
    <span class="mode-icon mode-icon--moon" :class="{ 'mode-icon--active': store.isDark }">
      <n-icon :size="20"><WeatherMoon28Filled /></n-icon>
    </span>
  </button>
</template>

<style scoped>
  /* Ikkala ikonka ustma-ust turadi va almashganda aylanib "o'sadi" */
  .mode-icon {
    position: absolute;
    display: flex;
    height: 20px;
    width: 20px;
    align-items: center;
    justify-content: center;
    transform: scale(0);
    opacity: 0;
    transition: all 0.3s ease;
  }

  /* Aylanish Tailwind klassi bilan emas, shu yerda: `transform` bitta
     xossada bo'lgani uchun `scale` bilan to'qnashmasin. */
  .mode-icon--moon {
    transform: scale(0) rotate(120deg);
  }

  .mode-icon--active {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
</style>
