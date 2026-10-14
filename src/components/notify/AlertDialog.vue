<script setup>
  import { alertState, closeAlert } from './alertDialog.js'
  import { useAppStore } from '@stores'
  import i18n from '@/i18n/index.js'
  import { useNotificationSound } from '@/composables/useNotificationSound.js'
  import forbiddenIcon from '@/assets/images/alert/forbidden.svg?url'
  import validationIcon from '@/assets/images/alert/validation.png'
  import warningIcon from '@/assets/images/alert/warning.png'
  import notfoundIcon from '@/assets/images/alert/notfound.png'
  import networkIcon from '@/assets/images/alert/network.svg?url'

  // 3D ikonkalar — Microsoft Fluent Emoji (MIT); «to'xta» va «Wi-Fi uzilgan» o'zimizniki.
  const ICONS = {
    forbidden: forbiddenIcon,
    validation: validationIcon,
    warning: warningIcon,
    notfound: notfoundIcon,
    network: networkIcon
  }

  const { t } = i18n.global
  const appStore = useAppStore()
  const notificationSound = useNotificationSound()

  const current = computed(() => alertState.queue[0] ?? null)
  const paused = ref(false)
  const title = computed(() => current.value?.title || t(`alertDialog.titles.${current.value?.type}`))
  // Backend xabari sarlavha bilan bir xil bo'lsa takrorlanmaydi.
  const message = computed(() => {
    const m = String(current.value?.message ?? '').trim()
    return m && m.toLowerCase() !== title.value.toLowerCase() ? m : ''
  })
  const show = computed({
    get: () => Boolean(current.value),
    set: (v) => !v && closeAlert()
  })

  // Har yangi modalda animatsiya qayta boshlanishi uchun kalit.
  const playKey = ref(0)
  watch(
    () => current.value?.key,
    (key) => {
      if (!key) return
      playKey.value++
      paused.value = false
      if (appStore.soundEnabled) {
        notificationSound.play(`alert-${current.value.type}`)
      }
    }
  )

  // Internet qaytsa «Aloqa uzildi» o'zi yopiladi.
  const onOnline = () => current.value?.type === 'network' && closeAlert()
  onMounted(() => window.addEventListener('online', onOnline))
  onBeforeUnmount(() => window.removeEventListener('online', onOnline))
</script>

<template>
  <n-modal v-model:show="show" :auto-focus="true" :mask-closable="true" :close-on-esc="true">
    <div
      v-if="current"
      role="alertdialog"
      aria-modal="true"
      class="alert-dialog w-[380px] max-w-[calc(100vw-32px)] rounded-3xl bg-surface-section px-6 pb-6 pt-8 text-center shadow-2xl"
      :class="`alert-dialog--${current.type}`"
      @mouseenter="paused = true"
      @mouseleave="paused = false"
    >
      <div :key="playKey" class="alert-dialog__stage">
        <span class="alert-dialog__glow"></span>
        <span class="alert-dialog__ring"></span>
        <span class="alert-dialog__ring alert-dialog__ring--late"></span>
        <div class="alert-dialog__float">
          <img :src="ICONS[current.type]" alt="" class="alert-dialog__icon" draggable="false" />
        </div>
        <span class="alert-dialog__shadow"></span>
      </div>

      <h3 class="mt-4 text-lg font-semibold text-textColor0">
        {{ title }}
      </h3>
      <p v-if="message" class="mt-2 text-sm leading-5 text-fig-text-secondary whitespace-pre-line">
        {{ message }}
      </p>

      <template v-if="current.errors.length">
        <p class="mt-2 text-sm text-fig-text-secondary">{{ $t('alertDialog.checkFields') }}</p>
        <ul
          class="mt-3 max-h-48 overflow-y-auto rounded-2xl bg-surface-ground p-3 text-left text-sm text-textColor1"
        >
          <li
            v-for="(err, i) in current.errors"
            :key="i"
            class="alert-dialog__err flex gap-2 py-1"
            :style="{ animationDelay: `${350 + i * 70}ms` }"
          >
            <span class="mt-[7px] size-1.5 shrink-0 rounded-full bg-fig-red"></span>
            <span>{{ err }}</span>
          </li>
        </ul>
      </template>

      <div class="relative mt-6 overflow-hidden rounded-xl">
        <n-button type="primary" block size="large" class="!rounded-xl" @click="closeAlert">
          {{ $t('alertDialog.ok') }}
        </n-button>
        <!-- Vaqt tugasa yopiladi; sichqoncha modal ustida bo'lsa to'xtab turadi. -->
        <span
          v-if="current.duration"
          :key="`cd-${playKey}`"
          class="alert-dialog__countdown"
          :style="{ animationDuration: `${current.duration}ms`, animationPlayState: paused ? 'paused' : 'running' }"
          @animationend="closeAlert"
        ></span>
      </div>
    </div>
  </n-modal>
</template>

<style scoped>
  .alert-dialog {
    --alert-glow: var(--color-fig-red-100);
  }
  .alert-dialog--forbidden { --alert-glow: var(--color-fig-red-100); }
  .alert-dialog--validation { --alert-glow: var(--color-fig-indigo-100); }
  .alert-dialog--warning { --alert-glow: var(--color-fig-amber-100); }
  .alert-dialog--notfound { --alert-glow: var(--color-fig-blue-100); }
  .alert-dialog--network { --alert-glow: var(--color-fig-blue-100); }

  .alert-dialog__stage {
    position: relative;
    margin: 0 auto;
    width: 112px;
    height: 112px;
  }
  .alert-dialog__glow,
  .alert-dialog__ring {
    position: absolute;
    inset: 8px;
    border-radius: 9999px;
    background: var(--alert-glow);
  }
  .alert-dialog__glow {
    animation: alert-glow-in 420ms ease-out both;
  }
  .alert-dialog__ring {
    opacity: 0;
    animation: alert-ring 1400ms ease-out 250ms 2;
  }
  .alert-dialog__ring--late {
    animation-delay: 950ms;
  }
  .alert-dialog__float {
    position: relative;
    z-index: 1;
    animation: alert-float 3s ease-in-out 1.6s infinite;
  }
  .alert-dialog__icon {
    width: 112px;
    height: 112px;
    filter: drop-shadow(0 10px 14px rgb(0 0 0 / 0.18));
    user-select: none;
    animation:
      alert-pop 520ms cubic-bezier(0.34, 1.56, 0.64, 1) both,
      var(--alert-gesture) 900ms ease-in-out 520ms;
  }
  .alert-dialog__shadow {
    position: absolute;
    left: 50%;
    bottom: -10px;
    width: 56px;
    height: 8px;
    margin-left: -28px;
    border-radius: 9999px;
    background: rgb(0 0 0 / 0.12);
    filter: blur(3px);
    animation: alert-shadow 3s ease-in-out 1.6s infinite;
  }
  .alert-dialog__err {
    animation: alert-err-in 260ms ease-out both;
  }

  /* Har tur o'z «imo-ishorasi» bilan */
  .alert-dialog--forbidden .alert-dialog__icon { --alert-gesture: alert-stop; transform-origin: 50% 90%; }
  .alert-dialog--validation .alert-dialog__icon { --alert-gesture: alert-write; transform-origin: 60% 80%; }
  .alert-dialog--warning .alert-dialog__icon { --alert-gesture: alert-shake; }
  .alert-dialog--notfound .alert-dialog__icon { --alert-gesture: alert-search; }
  .alert-dialog--network .alert-dialog__icon { --alert-gesture: alert-shake; }

  @keyframes alert-pop {
    0% { opacity: 0; transform: translateY(24px) scale(0.3) rotate(-12deg); }
    100% { opacity: 1; transform: none; }
  }
  @keyframes alert-glow-in {
    0% { opacity: 0; transform: scale(0.4); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes alert-ring {
    0% { opacity: 0.7; transform: scale(0.9); }
    100% { opacity: 0; transform: scale(1.55); }
  }
  @keyframes alert-stop {
    0%, 100% { transform: none; }
    30% { transform: scale(1.16) rotate(-6deg); }
    55% { transform: scale(1.04) rotate(7deg); }
    75% { transform: scale(1.08) rotate(-3deg); }
  }
  @keyframes alert-write {
    0%, 100% { transform: none; }
    20% { transform: rotate(-7deg) translateX(-3px); }
    40% { transform: rotate(6deg) translateX(3px); }
    60% { transform: rotate(-5deg) translateX(-2px); }
    80% { transform: rotate(3deg) translateX(1px); }
  }
  @keyframes alert-shake {
    0%, 100% { transform: none; }
    15%, 55% { transform: translateX(-7px) rotate(-4deg); }
    35%, 75% { transform: translateX(7px) rotate(4deg); }
  }
  @keyframes alert-search {
    0%, 100% { transform: none; }
    25% { transform: translate(-8px, -4px) rotate(-6deg); }
    50% { transform: translate(6px, -6px) rotate(4deg); }
    75% { transform: translate(4px, 4px) rotate(2deg); }
  }
  @keyframes alert-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }
  @keyframes alert-shadow {
    0%, 100% { transform: scaleX(1); opacity: 1; }
    50% { transform: scaleX(0.8); opacity: 0.6; }
  }
  @keyframes alert-err-in {
    0% { opacity: 0; transform: translateY(6px); }
    100% { opacity: 1; transform: none; }
  }

  .alert-dialog__countdown {
    position: absolute;
    left: 0;
    bottom: 0;
    height: 3px;
    width: 100%;
    background: rgb(255 255 255 / 0.7);
    transform-origin: left;
    pointer-events: none;
    animation-name: alert-countdown;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
  }
  @keyframes alert-countdown {
    from { transform: scaleX(1); }
    to { transform: scaleX(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .alert-dialog *:not(.alert-dialog__countdown),
    .alert-dialog__icon {
      animation: none !important;
    }
  }
</style>
