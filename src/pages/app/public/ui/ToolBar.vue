<script setup>
  // Ommaviy hujjat sahifasi sarlavhasi — imzolash sahifasidagi bilan bir xil: rangli logo, «HRM PRO | Hujjatni
  // tekshirish», o'ngda mavzu almashtirgich va til. Biroz shaffof va xira fon.
  import { UILanguage, UIThemeSwitch } from '@/components/index.js'
  import { useRouter } from 'vue-router'
  import { AppPaths } from '@/utils/index.js'
  import { usePublicStore } from '@stores'

  const router = useRouter()
  // Hujjatning UTY raqami (backend `electronic_number`) — «Hujjatni tekshirish» ostida; telefonda ham ko'rinadi
  const store = usePublicStore()
</script>

<template>
  <div class="public-topbar fixed left-0 top-0 z-50 h-[64px] w-full px-3 sm:px-6">
    <div class="mx-auto flex h-full max-w-[1680px] items-center justify-between gap-3">
      <div class="flex min-w-0 items-center gap-3">
        <button
          type="button"
          class="flex shrink-0 cursor-pointer items-center gap-2"
          @click="router.push(AppPaths.Home)"
        >
          <img class="h-9 w-auto object-contain" src="/logo-new.png" alt="app logo" />
          <span class="hidden whitespace-nowrap text-base font-semibold text-primary md:inline">
            {{ $t('homePage.appName') }}
          </span>
        </button>
        <span class="hidden h-6 w-px shrink-0 bg-surface-line sm:block"></span>
        <!-- «Hujjatni tekshirish», ostida kichik UTY raqami (telefonda yozuv yashirin — faqat raqam) -->
        <div class="flex min-w-0 flex-col gap-0.5">
          <span class="hidden truncate text-sm font-medium leading-tight text-textColor2 sm:inline">
            {{ $t('publicPage.portalLabel') }}
          </span>
          <span
            v-if="store.existFile && store.meta?.electronic_number"
            class="max-w-full self-start truncate rounded-full bg-surface-ground px-2 text-[11px] font-semibold leading-[18px] tabular-nums text-textColor2"
            :title="$t('publicPage.electronicNumber')"
          >
            {{ store.meta.electronic_number }}
          </span>
        </div>
      </div>
      <!-- Mavzu (kunduzgi / tungi) va til -->
      <div class="flex shrink-0 items-center gap-2 sm:gap-3">
        <UIThemeSwitch />
        <UILanguage />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .public-topbar {
    border-bottom: 1px solid var(--color-surface-line);
    background: color-mix(in srgb, var(--color-surface-section) 86%, transparent);
    backdrop-filter: saturate(160%) blur(10px);
    box-shadow: 0 6px 24px -18px rgb(16 24 40 / 35%);
  }
</style>
