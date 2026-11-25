<script>
import icons from '@/assets/icons'
import { Dismiss16Regular } from '@vicons/fluent'

// Shu sanadan boshlab tizimga faqat E-IMZO orqali kiriladi (2026-11-24 + 10 kun, Toshkent vaqti).
// Muddat o'tgach panel o'zi yo'qoladi.
const DEADLINE = new Date('2026-12-04T00:00:00+05:00').getTime()

// ✕ bosilsa yopiladi. Modul darajasidagi `ref` — login ↔ ilova o'tishda (komponent qayta mount)
// yopiq qoladi, sahifa yangilanganda (reload) esa yana chiqadi. Ataylab localStorage'da EMAS.
const dismissed = ref(false)
</script>

<script setup>
const now = ref(Date.now())
const barRef = ref(null)
let timer = null
let observer = null

// Panel balandligi `--eimzo-bar-h` ga yoziladi — login sahifasi `min-height`dan ayiradi
// (telefonda matn 2 qatorga o'tsa ham to'g'ri bo'ladi; yashirilganda 0).
const setBarHeight = () => {
  const h = barRef.value?.offsetHeight ?? 0
  document.documentElement.style.setProperty('--eimzo-bar-h', `${h}px`)
}

onMounted(() => {
  timer = setInterval(() => (now.value = Date.now()), 1000)
  observer = new ResizeObserver(setBarHeight)
  watch(
    barRef,
    (el, old) => {
      if (old) observer.unobserve(old)
      if (el) observer.observe(el)
      setBarHeight()
    },
    { immediate: true, flush: 'post' }
  )
})
onBeforeUnmount(() => {
  clearInterval(timer)
  observer?.disconnect()
  document.documentElement.style.removeProperty('--eimzo-bar-h')
})

const left = computed(() => Math.max(0, DEADLINE - now.value))
const visible = computed(() => left.value > 0 && !dismissed.value)

const parts = computed(() => {
  const total = Math.floor(left.value / 1000)
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60
  }
})

const units = computed(() => [
  { key: 'days', value: parts.value.days },
  { key: 'hours', value: parts.value.hours },
  { key: 'minutes', value: parts.value.minutes },
  { key: 'seconds', value: parts.value.seconds }
])

const pad = (n) => String(n).padStart(2, '0')
</script>

<template>
  <!-- Tor, markazdagi karta — ilova ranglari (surface + primary), to'liq eni chiziq emas -->
  <div
    v-if="visible"
    ref="barRef"
    class="sticky top-0 z-50 w-full flex justify-center px-3 pt-2 pb-1 pointer-events-none"
    role="status"
  >
    <div
      class="pointer-events-auto max-w-full flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-3 py-1.5 rounded-xl border border-surface-line bg-surface-section shadow-sm"
    >
      <div class="flex items-center gap-1.5 min-w-0 text-[13px] font-medium text-textColor1">
        <component :is="icons.figAlertCircle" class="w-4 h-4 shrink-0 text-primary" />
        <span>
          {{
            parts.days > 0
              ? $t('eimzoNotice.text', { days: parts.days })
              : $t('eimzoNotice.soon')
          }}
        </span>
      </div>

      <div class="flex items-center gap-1">
        <template v-for="(u, i) in units" :key="u.key">
          <span v-if="i" class="text-textColor3 text-xs font-semibold">:</span>
          <span class="flex items-baseline gap-0.5 rounded-md px-1.5 py-0.5 bg-brand-surface text-primary">
            <span class="text-[13px] font-bold tabular-nums">{{ pad(u.value) }}</span>
            <span class="text-[10px] font-medium opacity-80">{{ $t(`eimzoNotice.${u.key}`) }}</span>
          </span>
        </template>
      </div>

      <button
        type="button"
        class="-mr-1 w-6 h-6 shrink-0 flex items-center justify-center rounded-md text-textColor3 hover:text-textColor1 hover:bg-surface-ground transition-colors cursor-pointer"
        :aria-label="$t('content.close')"
        @click="dismissed = true"
      >
        <n-icon :size="14"><Dismiss16Regular /></n-icon>
      </button>
    </div>
  </div>
</template>
