<script setup>
  import forbiddenIcon from '@/assets/images/alert/forbidden.svg?url'
  import validationIcon from '@/assets/images/alert/validation.png'
  import warningIcon from '@/assets/images/alert/warning.png'
  import notfoundIcon from '@/assets/images/alert/notfound.png'
  import networkIcon from '@/assets/images/alert/network.svg?url'
  import deleteIcon from '@/assets/images/alert/delete.png'
  import confirmIcon from '@/assets/images/alert/confirm.png'
  import successIcon from '@/assets/images/alert/success.png'

  /**
   * Loyihaning yagona ogohlantirish / tasdiq kartasi (3D ikonka, sarlavha, matn, tugmalar).
   * Faqat ko'rinish: oynani `AlertDialog` (global `$Alert`, `confirmDialog`) va `UIConfirm` ochadi.
   */

  // 3D ikonkalar — Microsoft Fluent Emoji (MIT); «to'xta» va «Wi-Fi uzilgan» o'zimizniki.
  const ICONS = {
    forbidden: forbiddenIcon,
    validation: validationIcon,
    warning: warningIcon,
    notfound: notfoundIcon,
    network: networkIcon,
    delete: deleteIcon,
    confirm: confirmIcon,
    success: successIcon
  }

  const props = defineProps({
    type: { type: String, default: 'warning' },
    title: { type: String, default: '' },
    message: { type: String, default: '' },
    errors: { type: Array, default: () => [] },
    listHint: { type: String, default: '' },
    // Ikki tugmali tasdiq: berilmasa — `#actions` slot (bitta «Tushunarli» tugmasi va h.k.).
    confirm: { type: Boolean, default: false },
    confirmText: { type: String, default: '' },
    cancelText: { type: String, default: '' },
    // Uchinchi tugma (masalan «Saqlamasdan chiqish») — o'rtada, qizil ghost.
    extraText: { type: String, default: '' },
    danger: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    confirmDisabled: { type: Boolean, default: false }
  })

  const emit = defineEmits(['confirm', 'cancel', 'extra', 'hover'])

  // Backend xabari sarlavha bilan bir xil bo'lsa takrorlanmaydi.
  const shownMessage = computed(() => {
    const m = String(props.message ?? '').trim()
    return m && m.toLowerCase() !== String(props.title).toLowerCase() ? m : ''
  })
</script>

<template>
  <div
    role="alertdialog"
    aria-modal="true"
    class="alert-dialog w-[380px] max-w-[calc(100vw-32px)] rounded-3xl bg-surface-section px-6 pb-6 pt-8 text-center shadow-2xl"
    :class="`alert-dialog--${type}`"
    @mouseenter="emit('hover', true)"
    @mouseleave="emit('hover', false)"
  >
    <div class="alert-dialog__stage">
      <span class="alert-dialog__glow"></span>
      <span class="alert-dialog__ring"></span>
      <span class="alert-dialog__ring alert-dialog__ring--late"></span>
      <div class="alert-dialog__float">
        <img :src="ICONS[type] || ICONS.warning" alt="" class="alert-dialog__icon" draggable="false" />
      </div>
      <span class="alert-dialog__shadow"></span>
    </div>

    <h3 class="mt-4 text-lg font-semibold text-textColor0">
      {{ title }}
    </h3>
    <p v-if="shownMessage" class="mt-2 text-sm leading-5 text-fig-text-secondary whitespace-pre-line">
      {{ shownMessage }}
    </p>

    <template v-if="errors.length">
      <p v-if="listHint" class="mt-2 text-sm text-fig-text-secondary">{{ listHint }}</p>
      <ul
        class="mt-3 max-h-48 overflow-y-auto rounded-2xl bg-surface-ground p-3 text-left text-sm text-textColor1"
      >
        <li
          v-for="(err, i) in errors"
          :key="i"
          class="alert-dialog__err flex gap-2 py-1"
          :style="{ animationDelay: `${350 + i * 70}ms` }"
        >
          <span class="mt-[7px] size-1.5 shrink-0 rounded-full bg-fig-red"></span>
          <span>{{ err }}</span>
        </li>
      </ul>
    </template>

    <!-- Qo'shimcha kontent: izoh maydoni, o'zgargan maydonlar, ro'yxat va h.k. -->
    <div v-if="$slots.default" class="mt-3 text-left text-sm text-textColor1">
      <slot />
    </div>

    <!-- Uchinchi tugma bo'lsa: tasdiq tepada to'liq kenglikda, ostida bekor | qo'shimcha. -->
    <div v-if="confirm" class="mt-6 grid grid-cols-2 gap-3">
      <n-button secondary size="large" class="!rounded-xl" :disabled="loading" @click="emit('cancel')">
        {{ cancelText || $t('content.cancel') }}
      </n-button>
      <n-button
        v-if="extraText"
        ghost
        type="error"
        size="large"
        class="!rounded-xl"
        :disabled="loading"
        @click="emit('extra')"
      >
        {{ extraText }}
      </n-button>
      <n-button
        :type="danger ? 'error' : 'primary'"
        size="large"
        class="!rounded-xl"
        :class="{ 'col-span-2 order-first': extraText }"
        :loading="loading"
        :disabled="confirmDisabled"
        @click="emit('confirm')"
      >
        {{ confirmText || $t(danger ? 'content.delete' : 'content.confirm') }}
      </n-button>
    </div>
    <slot v-else name="actions" />
  </div>
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
  .alert-dialog--delete { --alert-glow: var(--color-fig-red-100); }
  .alert-dialog--confirm { --alert-glow: var(--color-fig-red-100); }
  .alert-dialog--success { --alert-glow: var(--color-fig-green-100); }

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
  .alert-dialog--delete .alert-dialog__icon { --alert-gesture: alert-shake; }
  .alert-dialog--confirm .alert-dialog__icon { --alert-gesture: alert-write; transform-origin: 50% 90%; }
  .alert-dialog--success .alert-dialog__icon { --alert-gesture: alert-stop; transform-origin: 50% 90%; }

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

  @media (prefers-reduced-motion: reduce) {
    .alert-dialog *,
    .alert-dialog__icon {
      animation: none !important;
    }
  }
</style>
