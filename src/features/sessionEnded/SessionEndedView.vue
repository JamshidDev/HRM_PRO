<script setup>
  import { sessionEndedState, sessionEndedReasonKey } from './sessionEnded.js'
  import forbiddenIcon from '@/assets/images/alert/forbidden.svg?url'
  import { useAppStore } from '@stores'
  import { useNotificationSound } from '@/composables/useNotificationSound.js'

  // Yopib bo'lmaydigan oyna: tugma yo'q, fon bloklangan — vaqt tugagach login'ga o'tiladi.
  const reasonKey = computed(() => sessionEndedReasonKey(sessionEndedState.info))
  const device = computed(() => {
    const label = sessionEndedState.info?.by?.label
    return label ? ` (${label})` : ''
  })

  // Alert bilan birga ovoz (boshqa 3D alertlar kabi — ovoz sozlamasi yoqiq bo'lsa).
  const appStore = useAppStore()
  const notificationSound = useNotificationSound()
  watch(
    () => sessionEndedState.active,
    (active) => active && appStore.soundEnabled && notificationSound.play('alert-forbidden')
  )
</script>

<template>
  <n-modal
    :show="sessionEndedState.active"
    :mask-closable="false"
    :close-on-esc="false"
    :auto-focus="false"
  >
    <div
      role="alertdialog"
      aria-modal="true"
      class="session-ended w-[400px] max-w-[calc(100vw-32px)] rounded-3xl bg-surface-section px-6 pb-6 pt-8 text-center shadow-2xl"
    >
      <div class="session-ended__stage">
        <span class="session-ended__glow"></span>
        <img :src="forbiddenIcon" alt="" class="session-ended__icon" draggable="false" />
      </div>
      <h3 class="mt-4 text-lg font-semibold text-textColor0">{{ $t('sessionEnded.title') }}</h3>
      <p class="mt-2 text-sm leading-5 text-fig-text-secondary">
        {{ $t(`sessionEnded.reasons.${reasonKey}`, { device }) }}
      </p>
      <div class="mt-6 rounded-xl bg-surface-ground px-4 py-3 text-sm text-textColor1">
        {{ $t('sessionEnded.redirect', { seconds: sessionEndedState.seconds }) }}
      </div>
    </div>
  </n-modal>
</template>

<style scoped>
  .session-ended__stage {
    position: relative;
    margin: 0 auto;
    width: 112px;
    height: 112px;
  }
  .session-ended__glow {
    position: absolute;
    inset: 8px;
    border-radius: 9999px;
    background: var(--color-fig-red-100);
    animation: session-ended-glow 420ms ease-out both;
  }
  .session-ended__icon {
    position: relative;
    width: 112px;
    height: 112px;
    filter: drop-shadow(0 10px 14px rgb(0 0 0 / 0.18));
    user-select: none;
    animation: session-ended-pop 520ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  @keyframes session-ended-pop {
    0% {
      opacity: 0;
      transform: translateY(24px) scale(0.3) rotate(-12deg);
    }
    100% {
      opacity: 1;
      transform: none;
    }
  }
  @keyframes session-ended-glow {
    0% {
      opacity: 0;
      transform: scale(0.4);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
