<script setup>
  import { useAccountStore } from '@/store/modules/app/accountStore.js'
  import { useAppSetting } from '@/utils/index.js'

  const store = useAccountStore()

  // Loader ikki holatda chiqadi (`accountStore.loadingKind`): ilova ishga
  // tushayotganda va tizimdan chiqayotganda. Ilgari ikkalasida ham faqat
  // aylanuvchi spinner ko'rinardi — foydalanuvchi nima kutayotganini bilmasdi.
  const copy = computed(() =>
    store.loadingKind === 'logout'
      ? { title: 'content.loggingOut', hint: 'content.loggingOutHint' }
      : { title: 'content.loadingWorkspace', hint: 'content.loadingWorkspaceHint' }
  )
</script>

<template>
  <Transition name="main-loading">
    <div v-if="store.loading" class="main-loading" role="status" aria-live="polite">
      <div class="main-loading__glow" aria-hidden="true"></div>

      <div class="main-loading__body">
        <img
          class="main-loading__logo"
          :src="useAppSetting.appLogoUrl"
          alt=""
          draggable="false"
        />

        <div class="main-loading__text">
          <p class="main-loading__title">{{ $t(copy.title) }}</p>
          <p class="main-loading__hint">{{ $t(copy.hint) }}</p>
        </div>

        <!-- Indeterminate bar: qancha qolganini bilmaymiz, shu bois foizli
             progress emas. Spinnerdan farqli, u "ish ketmoqda"ni yo'nalish bilan
             ko'rsatadi va kutish qisqaroq sezilishiga yordam beradi. -->
        <div class="main-loading__track">
          <span class="main-loading__bar"></span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
  .main-loading {
    position: fixed;
    inset: 0;
    /* Toast'lar (`zIndex: 10000`) ustida QOLMASIN — xato xabari ko'rinib turishi
       kerak. Qolgan hamma narsadan (naive-ui modallari ~2000) yuqorida. */
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: var(--surface-section);
  }

  /* Logo ortidagi yumshoq brend nuri — tekis fonni "o'lik" ko'rinishdan chiqaradi. */
  .main-loading__glow {
    position: absolute;
    width: 520px;
    height: 520px;
    max-width: 90vw;
    max-height: 90vw;
    border-radius: 50%;
    background: radial-gradient(
      closest-side,
      color-mix(in srgb, var(--primary-color) 14%, transparent),
      transparent
    );
    pointer-events: none;
  }

  .main-loading__body {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 22px;
    padding: 0 24px;
    text-align: center;
  }

  .main-loading__logo {
    width: auto;
    height: 52px;
    animation: main-loading-breathe 2.4s ease-in-out infinite;
  }

  .main-loading__text {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .main-loading__title {
    margin: 0;
    color: var(--textColor0);
    font-size: 16px;
    font-weight: 600;
    line-height: 1.3;
  }

  .main-loading__hint {
    margin: 0;
    color: var(--textColor2);
    font-size: 13px;
    line-height: 1.4;
  }

  .main-loading__track {
    position: relative;
    width: 220px;
    max-width: 70vw;
    height: 4px;
    overflow: hidden;
    border-radius: 999px;
    background: var(--surface-line);
  }

  .main-loading__bar {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 45%;
    border-radius: 999px;
    background: var(--primary-color);
    animation: main-loading-slide 1.4s cubic-bezier(0.65, 0, 0.35, 1) infinite;
  }

  @keyframes main-loading-slide {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(322%);
    }
  }

  @keyframes main-loading-breathe {
    0%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(0.94);
      opacity: 0.72;
    }
  }

  /* Overlay silliq paydo bo'ladi/yo'qoladi — 500ms minimal ko'rinish bilan
     birga bu "chaqnash" hissini yo'q qiladi. */
  .main-loading-enter-active,
  .main-loading-leave-active {
    transition: opacity 0.25s ease;
  }

  .main-loading-enter-from,
  .main-loading-leave-to {
    opacity: 0;
  }

  /* Harakatni kamaytirish so'ralgan bo'lsa: sirg'alish va "nafas" o'rniga
     bir tekis pulsatsiya — kontent baribir "yuklanmoqda"ni bildiradi. */
  @media (prefers-reduced-motion: reduce) {
    .main-loading__logo {
      animation: none;
    }

    .main-loading__bar {
      width: 100%;
      animation: main-loading-pulse 1.6s ease-in-out infinite;
    }

    @keyframes main-loading-pulse {
      0%,
      100% {
        opacity: 0.35;
      }
      50% {
        opacity: 1;
      }
    }
  }
</style>
