<script setup>
  // Ariza havolasi sarlavhasi — imzolash sahifasidagi bilan bir xil: logo, korxona, qolgan vaqt, mavzu va til.
  import { UILanguage, UIThemeSwitch } from '@/components/index.js'
  import { Timer24Regular } from '@vicons/fluent'
  import { useAppBreakpoints } from '@/composables/useBreakpoint.js'

  const props = defineProps({
    organization: { type: String, default: '' },
    left: { type: Number, default: 0 },
    showTimer: { type: Boolean, default: false }
  })
  const { isMobile } = useAppBreakpoints()

  const timeText = computed(() => `${Math.floor(props.left / 60)}:${String(props.left % 60).padStart(2, '0')}`)
  // Ko'k — vaqt bor, to'q sariq — oxirgi daqiqa, qizil — tugagan.
  const timerClass = computed(() => {
    if (props.left <= 0) return 'bg-danger/10 text-danger border-danger/30'
    if (props.left <= 60) return 'bg-warning/10 text-warning border-warning/40'
    return 'bg-fig-chip-brand text-fig-chip-brand-text border-transparent'
  })
</script>

<template>
  <div class="link-topbar fixed left-0 top-0 z-50 h-[64px] w-full px-3 sm:px-6">
    <div class="mx-auto flex h-full max-w-[1680px] items-center justify-between gap-3">
      <div class="flex min-w-0 flex-1 items-center gap-3">
        <div class="flex shrink-0 items-center gap-2">
          <img class="h-9 w-auto object-contain" src="/logo-new.png" alt="app logo" />
          <span class="hidden whitespace-nowrap text-base font-semibold text-primary md:inline">
            {{ $t('homePage.appName') }}
          </span>
        </div>
        <span class="hidden h-6 w-px shrink-0 bg-surface-line md:block"></span>
        <div class="flex min-w-0 flex-col gap-0.5">
          <span class="truncate text-sm font-medium leading-tight text-textColor2">{{ $t('applicationLink.title') }}</span>
          <span
            v-if="organization"
            class="max-w-full self-start truncate rounded-full bg-surface-ground px-2 text-[11px] font-semibold leading-[18px] text-textColor2"
          >
            {{ organization }}
          </span>
        </div>
      </div>

      <div class="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
        <span
          v-if="showTimer"
          class="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-sm font-semibold tabular-nums"
          :class="timerClass"
        >
          <n-icon size="16"><Timer24Regular /></n-icon>
          {{ left > 0 ? timeText : $t('signature.linkExpiredShort') }}
        </span>
        <UIThemeSwitch />
        <UILanguage :compact="isMobile" />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .link-topbar {
    border-bottom: 1px solid var(--color-surface-line);
    background: color-mix(in srgb, var(--color-surface-section) 86%, transparent);
    backdrop-filter: saturate(160%) blur(10px);
    box-shadow: 0 6px 24px -18px rgb(16 24 40 / 35%);
  }
</style>
