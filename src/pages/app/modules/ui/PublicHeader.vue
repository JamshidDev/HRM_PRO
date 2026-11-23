<script setup>
  // Ochiq sahifalar sarlavhasi: logo, «Modullar», til, mavzu va «Tizimga kirish».
  import { UILanguage, UIThemeSwitch } from '@/components/index.js'
  import { AppPaths } from '@/utils/index.js'

  defineProps({ ui: { type: Object, required: true } })
</script>

<template>
  <header class="mod-topbar fixed left-0 top-0 z-50 h-[64px] w-full px-3 sm:px-6">
    <div class="mx-auto flex h-full max-w-[1200px] items-center justify-between gap-3">
      <RouterLink :to="AppPaths.Modules" class="flex min-w-0 items-center gap-2">
        <img class="h-9 w-auto object-contain" src="/logo-new.png" alt="HRM PRO logotipi" />
        <span class="whitespace-nowrap text-base font-semibold text-primary">HRM PRO</span>
      </RouterLink>
      <div class="flex shrink-0 items-center gap-2 sm:gap-3">
        <UIThemeSwitch />
        <UILanguage />
        <RouterLink :to="AppPaths.Login">
          <n-button type="primary" size="small">{{ ui.login }}</n-button>
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<style scoped>
  .mod-topbar {
    border-bottom: 1px solid var(--color-surface-line);
    background: color-mix(in srgb, var(--color-surface-section) 86%, transparent);
    backdrop-filter: saturate(160%) blur(10px);
  }
</style>
